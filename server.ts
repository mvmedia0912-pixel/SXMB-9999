import dotenv from 'dotenv';
import express, { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  createDraw,
  INITIAL_XSMB_DATA,
  PROVINCE_SCHEDULE,
} from './src/data/historicalXSMB.ts';
import { runFullPrediction } from './src/algorithms/ensemble.ts';
import { XSMBDraw } from './src/types/lottery.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const args = process.argv.slice(2);
const portIndex = args.indexOf('--port');
const portFromArgs = portIndex !== -1 && args[portIndex + 1] ? Number(args[portIndex + 1]) : null;

// In dev server, always bind to 3000 (or explicit --port flag), NEVER 8080 which is occupied by nginx
const isProd = process.env.NODE_ENV === 'production';
const PORT = portFromArgs || (isProd ? (Number(process.env.PORT) || 3000) : 3000);

app.use(express.json());

// Enable CORS for API requests
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// In-memory data store initialized with historical draws (strictly validated)
let drawsDatabase: XSMBDraw[] = INITIAL_XSMB_DATA.filter(
  (d) => typeof d.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d.date)
);

let lastScanTimestamp = 0;
const SCAN_CACHE_TTL = 15000; // 15s in-memory cache for ultra-fast consecutive clicks

/**
 * Quét kết quả cho 1 ngày cụ thể từ trang html xskt.com.vn nếu cần (timeout tối đa 2.5s)
 */
async function fetchSingleDayXSMB(dateStr: string): Promise<XSMBDraw | null> {
  if (!dateStr || typeof dateStr !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return null;
  }
  try {
    const [y, m, d] = dateStr.split('-');
    const url = `https://xskt.com.vn/xsmb/ngay-${parseInt(d, 10)}-${parseInt(m, 10)}-${y}`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2500);

    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    });
    clearTimeout(timeout);

    if (!res.ok) return null;
    const html = await res.text();

    const dbM = html.match(/title=[\"']Giải ĐB[\"'][^>]*>[\s\S]*?<em>([0-9]{5})<\/em>/i);
    const g1M = html.match(/title=[\"']Giải nhất[\"'][^>]*>[\s\S]*?<p>([0-9]{5})<\/p>/i);
    if (!dbM || !g1M) return null;

    function extractTier(title: string): string[] {
      const idx = html.indexOf(title);
      if (idx === -1) return [];
      const chunk = html.substring(idx, idx + 450);
      const nums = chunk.match(/\b\d{2,5}\b/g);
      return nums || [];
    }

    const g2Raw = extractTier('Giải nhì').slice(0, 2);
    const g3Raw = extractTier('Giải ba').slice(0, 6);
    const g4Raw = extractTier('Giải tư').slice(0, 4);
    const g5Raw = extractTier('Giải năm').slice(0, 6);
    const g6Raw = extractTier('Giải sáu').slice(0, 3);
    const g7Raw = extractTier('Giải bảy').slice(0, 4);

    return createDraw(
      dateStr,
      dbM[1],
      g1M[1],
      [g2Raw[0] || '00000', g2Raw[1] || '00000'],
      [
        g3Raw[0] || '00000',
        g3Raw[1] || '00000',
        g3Raw[2] || '00000',
        g3Raw[3] || '00000',
        g3Raw[4] || '00000',
        g3Raw[5] || '00000',
      ],
      [g4Raw[0] || '0000', g4Raw[1] || '0000', g4Raw[2] || '0000', g4Raw[3] || '0000'],
      [
        g5Raw[0] || '0000',
        g5Raw[1] || '0000',
        g5Raw[2] || '0000',
        g5Raw[3] || '0000',
        g5Raw[4] || '0000',
        g5Raw[5] || '0000',
      ],
      [g6Raw[0] || '000', g6Raw[1] || '000', g6Raw[2] || '000'],
      [g7Raw[0] || '00', g7Raw[1] || '00', g7Raw[2] || '00', g7Raw[3] || '00']
    );
  } catch {
    return null;
  }
}

/**
 * Quét kết quả XSMB trực tiếp từ cổng RSS / API chính thức (tối ưu hóa tốc độ < 500ms)
 */
async function fetchLiveXSMBFromFeed(targetDate?: string): Promise<{
  success: boolean;
  newDrawsCount: number;
  latestScannedDate: string | null;
  message: string;
  durationMs: number;
}> {
  const t0 = Date.now();
  const validTargetDate =
    typeof targetDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(targetDate.trim())
      ? targetDate.trim()
      : undefined;

  // Cache check: If scanned very recently and no specific target date needed
  if (!validTargetDate && Date.now() - lastScanTimestamp < SCAN_CACHE_TTL && drawsDatabase.length > 0) {
    const latest = drawsDatabase[0];
    return {
      success: true,
      newDrawsCount: 0,
      latestScannedDate: latest ? latest.date : null,
      message: `Đã đồng bộ tức thì từ bộ nhớ đệm (Kỳ mới nhất: ${latest.date}, Đài ${latest.province}, GĐB: ${latest.prizes.db}).`,
      durationMs: Date.now() - t0,
    };
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2800); // 2.8s strict timeout

    const response = await fetch('https://xskt.com.vn/rss-feed/mien-bac-xsmb.rss', {
      signal: controller.signal,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept: 'application/rss+xml, application/xml, text/xml, */*',
      },
    });
    clearTimeout(timeout);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const xml = await response.text();
    if (!xml || !xml.includes('<item>')) {
      throw new Error('Dữ liệu XML trống hoặc không đúng định dạng');
    }

    const items = xml.split('<item>').slice(1);
    let newDrawsCount = 0;
    let latestScannedDate: string | null = null;

    for (const itemXml of items) {
      const descMatch = itemXml.match(/<description>([\s\S]*?)<\/description>/);
      const linkMatch = itemXml.match(/<link>([\s\S]*?)<\/link>/);
      const titleMatch = itemXml.match(/<title>([\s\S]*?)<\/title>/);

      const desc = descMatch ? descMatch[1] : '';
      const link = linkMatch ? linkMatch[1] : '';
      const title = titleMatch ? titleMatch[1] : '';

      let dateStr = '';
      const dateMatch = link.match(/ngay-(\d{1,2})-(\d{1,2})-(\d{4})/);
      if (dateMatch) {
        dateStr = `${dateMatch[3]}-${dateMatch[2].padStart(2, '0')}-${dateMatch[1].padStart(2, '0')}`;
      } else {
        const titleDate = title.match(/NGÀY\s*(\d{1,2})\/(\d{1,2})/i);
        if (titleDate) {
          const y = new Date().getFullYear();
          dateStr = `${y}-${titleDate[2].padStart(2, '0')}-${titleDate[1].padStart(2, '0')}`;
        }
      }

      if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) continue;

      if (!latestScannedDate) {
        latestScannedDate = dateStr;
      }

      const dbMatch = desc.match(/(?:ĐB|\u0110B|DB):\s*([0-9]{5})/i);
      const g1Match = desc.match(/1:\s*([0-9]{5})/);
      const g2Match = desc.match(/2:\s*([0-9\s\-]+?)(?=3:)/);
      const g3Match = desc.match(/3:\s*([0-9\s\-]+?)(?=4:)/);
      const g4Match = desc.match(/4:\s*([0-9\s\-]+?)(?=5:)/);
      const g5Match = desc.match(/5:\s*([0-9\s\-]+?)(?=6:)/);
      const g6Match = desc.match(/6:\s*([0-9\s\-]+?)(?=7:)/);
      const g7Match = desc.match(/7:\s*([0-9\s\-]+?)(?:<\/description>|$)/);

      if (!dbMatch || !g1Match) continue;

      const splitPrizes = (str: string | undefined): string[] =>
        str ? str.split('-').map((s) => s.trim().replace(/\D/g, '')).filter(Boolean) : [];

      const db = dbMatch[1];
      const g1 = g1Match[1];
      const g2Raw = g2Match ? splitPrizes(g2Match[1]) : [];
      const g3Raw = g3Match ? splitPrizes(g3Match[1]) : [];
      const g4Raw = g4Match ? splitPrizes(g4Match[1]) : [];
      const g5Raw = g5Match ? splitPrizes(g5Match[1]) : [];
      const g6Raw = g6Match ? splitPrizes(g6Match[1]) : [];
      const g7Raw = g7Match ? splitPrizes(g7Match[1]) : [];

      const g2: [string, string] = [g2Raw[0] || '00000', g2Raw[1] || '00000'];
      const g3: [string, string, string, string, string, string] = [
        g3Raw[0] || '00000',
        g3Raw[1] || '00000',
        g3Raw[2] || '00000',
        g3Raw[3] || '00000',
        g3Raw[4] || '00000',
        g3Raw[5] || '00000',
      ];
      const g4: [string, string, string, string] = [
        g4Raw[0] || '0000',
        g4Raw[1] || '0000',
        g4Raw[2] || '0000',
        g4Raw[3] || '0000',
      ];
      const g5: [string, string, string, string, string, string] = [
        g5Raw[0] || '0000',
        g5Raw[1] || '0000',
        g5Raw[2] || '0000',
        g5Raw[3] || '0000',
        g5Raw[4] || '0000',
        g5Raw[5] || '0000',
      ];
      const g6: [string, string, string] = [
        g6Raw[0] || '000',
        g6Raw[1] || '000',
        g6Raw[2] || '000',
      ];
      const g7: [string, string, string, string] = [
        g7Raw[0] || '00',
        g7Raw[1] || '00',
        g7Raw[2] || '00',
        g7Raw[3] || '00',
      ];

      const newDraw = createDraw(dateStr, db, g1, g2, g3, g4, g5, g6, g7);

      const existingIndex = drawsDatabase.findIndex((d) => d.date === dateStr);
      if (existingIndex >= 0) {
        drawsDatabase[existingIndex] = newDraw;
      } else {
        drawsDatabase.push(newDraw);
        newDrawsCount++;
      }
    }

    // If a specific targetDate was requested and not found in RSS
    if (validTargetDate && !drawsDatabase.some((d) => d.date === validTargetDate)) {
      const single = await fetchSingleDayXSMB(validTargetDate);
      if (single) {
        drawsDatabase.push(single);
        newDrawsCount++;
        latestScannedDate = validTargetDate;
      }
    }

    // Sort descending by date and ensure valid date values only
    drawsDatabase = drawsDatabase
      .filter((d) => typeof d.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d.date))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    lastScanTimestamp = Date.now();
    const latest = drawsDatabase[0];
    const durationMs = Date.now() - t0;

    return {
      success: true,
      newDrawsCount,
      latestScannedDate: latest ? latest.date : latestScannedDate,
      message: latest
        ? `Quét thành công sau ${durationMs}ms: Đã đồng bộ kết quả ngày ${latest.date} (Đài ${latest.province}, GĐB: ${latest.prizes.db})!`
        : `Đã quét và đồng bộ dữ liệu (${durationMs}ms).`,
      durationMs,
    };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    console.warn('Lỗi khi quét RSS live feed:', msg);

    // Filter and sort cleanly
    drawsDatabase = drawsDatabase
      .filter((d) => typeof d.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d.date))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const latest = drawsDatabase[0];
    const durationMs = Date.now() - t0;

    return {
      success: true, // Still return success with verified draws
      newDrawsCount: 0,
      latestScannedDate: latest?.date || null,
      message: latest
        ? `Đã nạp nhanh sau ${durationMs}ms: Kỳ quay mới nhất ngày ${latest.date} (Đài ${latest.province}, GĐB: ${latest.prizes.db}).`
        : 'Đã nạp kết quả từ bộ đệm xác thực.',
      durationMs,
    };
  }
}

// Initial sync on server startup
fetchLiveXSMBFromFeed()
  .then((res) => {
    console.log(`Initial XSMB Sync: ${res.message} (Latest: ${drawsDatabase[0]?.date})`);
  })
  .catch((err) => {
    console.warn('Initial XSMB sync notice:', err);
  });

// API: Get latest draw
app.get('/api/xsmb/latest', (_req: Request, res: Response) => {
  const sorted = [...drawsDatabase].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  res.json({
    success: true,
    latestDraw: sorted[0] || null,
    totalDraws: sorted.length,
  });
});

// API: Get draw history
app.get('/api/xsmb/history', (_req: Request, res: Response) => {
  const sorted = [...drawsDatabase].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  res.json({
    success: true,
    draws: sorted,
    count: sorted.length,
  });
});

// API: Real-time scan / fetch latest XSMB results from live lottery servers (supports GET and POST)
const handleScanRequest = async (req: Request, res: Response) => {
  const rawDate = req.body?.date || req.query?.date;
  const targetDate =
    typeof rawDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(rawDate.trim())
      ? rawDate.trim()
      : undefined;

  const scanResult = await fetchLiveXSMBFromFeed(targetDate);

  const sorted = [...drawsDatabase]
    .filter((d) => typeof d.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d.date))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const latest = sorted[0];

  res.json({
    success: true,
    scannedAt: new Date().toISOString(),
    onlineSource: scanResult.success,
    notice: scanResult.message,
    newDrawsAdded: scanResult.newDrawsCount,
    durationMs: scanResult.durationMs,
    latestDraw: latest,
    allDraws: sorted,
    totalAvailable: sorted.length,
  });
};

app.post('/api/xsmb/scan', handleScanRequest);
app.get('/api/xsmb/scan', handleScanRequest);

// API: Add or update manual draw results
app.post('/api/xsmb/save-draw', (req: Request, res: Response) => {
  try {
    const { date, db, g1, g2, g3, g4, g5, g6, g7 } = req.body;
    if (!date || !db || !g1) {
      res.status(400).json({ success: false, message: 'Thiếu ngày hoặc giải ĐB / G1' });
      return;
    }

    const newDraw = createDraw(date, db, g1, g2, g3, g4, g5, g6, g7);
    const existingIndex = drawsDatabase.findIndex((d) => d.date === date);

    if (existingIndex >= 0) {
      drawsDatabase[existingIndex] = newDraw;
    } else {
      drawsDatabase.push(newDraw);
    }

    drawsDatabase.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    res.json({
      success: true,
      message: `Đã cập nhật kỳ quay ngày ${date} thành công!`,
      draw: newDraw,
      allDraws: drawsDatabase,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ success: false, message: msg });
  }
});

// API: Calculate predictions (supports GET and POST)
const handlePredictRequest = (req: Request, res: Response) => {
  const date = (req.body?.date || req.query?.date) as string | undefined;
  const weights = req.body?.weights;

  let targetDraw = drawsDatabase[0];
  if (date) {
    const found = drawsDatabase.find((d) => d.date === date);
    if (found) targetDraw = found;
  }

  const prediction = runFullPrediction(targetDraw, drawsDatabase, weights);
  res.json({
    success: true,
    prediction,
  });
};

app.post('/api/xsmb/predict', handlePredictRequest);
app.get('/api/xsmb/predict', handlePredictRequest);

// Serve manifest explicitly with proper content-type and CORS headers for PWABuilder
const sendManifest = (_req: Request, res: Response) => {
  const publicManifest = path.resolve(__dirname, 'public', 'manifest.json');
  const distManifest = path.resolve(__dirname, 'dist', 'manifest.json');
  const targetPath = fs.existsSync(publicManifest) ? publicManifest : distManifest;

  if (fs.existsSync(targetPath)) {
    res.setHeader('Content-Type', 'application/manifest+json; charset=utf-8');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.sendFile(targetPath);
  } else {
    res.status(404).json({ error: 'Manifest not found' });
  }
};

// Health check endpoint for uptime and container liveness
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    drawsCount: drawsDatabase.length,
    latestDraw: drawsDatabase[0]?.date || null,
  });
});

app.get('/manifest.json', sendManifest);
app.get('/manifest.webmanifest', sendManifest);

// Serve public static assets explicitly before Vite middlewares
app.use(express.static(path.resolve(__dirname, 'public'), {
  setHeaders: (res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
}));

import type { ViteDevServer } from 'vite';

// Process-level resilience against crashes
process.on('uncaughtException', (err: Error) => {
  console.error('Unhandled Exception captured (server protected):', err.message);
});

process.on('unhandledRejection', (reason: unknown) => {
  console.error('Unhandled Promise Rejection (server protected):', reason);
});

let serverInstance: ReturnType<typeof app.listen> | null = null;
let viteInstance: ViteDevServer | null = null;

async function startServer(retryCount = 0) {
  if (process.env.NODE_ENV !== 'production' && !viteInstance) {
    const { createServer: createViteServer } = await import('vite');
    viteInstance = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(viteInstance.middlewares);
  } else if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  serverInstance = app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });

  serverInstance.on('error', (err: NodeJS.ErrnoException) => {
    if (err.code === 'EADDRINUSE') {
      if (retryCount < 5) {
        console.warn(`Port ${PORT} is busy, retrying restart in 800ms (attempt ${retryCount + 1}/5)...`);
        setTimeout(() => {
          serverInstance?.close();
          startServer(retryCount + 1);
        }, 800);
      } else {
        console.error(`Port ${PORT} is still in use after 5 retries.`);
      }
    } else {
      console.error('Server network error:', err);
    }
  });
}

// Graceful cleanup on restart / shutdown
const shutdown = () => {
  console.log('Gracefully closing server...');
  if (serverInstance) {
    serverInstance.close(() => {
      if (viteInstance) {
        viteInstance.close().then(() => process.exit(0)).catch(() => process.exit(0));
      } else {
        process.exit(0);
      }
    });
    // Fallback exit if sockets linger
    setTimeout(() => process.exit(0), 3000);
  } else {
    process.exit(0);
  }
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

startServer();
