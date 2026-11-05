import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

const publicDir = path.resolve('public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// CRC32 table & function
const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function createChunk(type, data) {
  const len = data.length;
  const chunk = Buffer.alloc(12 + len);
  chunk.writeUInt32BE(len, 0);
  chunk.write(type, 4, 4, 'ascii');
  data.copy(chunk, 8);
  const typeAndData = chunk.subarray(4, 8 + len);
  const crcVal = crc32(typeAndData);
  chunk.writeUInt32BE(crcVal, 8 + len);
  return chunk;
}

function generatePNG(width, height, isMaskable = false) {
  // Generate RGBA buffer
  const stride = width * 4;
  const rawData = Buffer.alloc(height * (1 + stride));

  const cx = width / 2;
  const cy = height / 2;
  const maxRadius = width / 2;
  const safeRadius = isMaskable ? maxRadius * 0.72 : maxRadius * 0.88;

  for (let y = 0; y < height; y++) {
    const rowOffset = y * (1 + stride);
    rawData[rowOffset] = 0; // Filter byte 0 (None)

    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 4;
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Deep premium navy gradient background
      const ny = y / height;
      let r = Math.round(15 + ny * 10);
      let g = Math.round(23 + ny * 15);
      let b = Math.round(42 + ny * 35); // #0f172a to #1e293b
      let a = 255;

      if (!isMaskable && dist > maxRadius - 2) {
        a = 0; // Circular crop for regular icon
      } else if (dist <= safeRadius) {
        // Red / Gold luxury lottery token in the center
        const innerRatio = dist / safeRadius;
        if (innerRatio > 0.92) {
          // Gold border
          r = 234; g = 179; b = 8;
        } else if (innerRatio > 0.84) {
          // Deep gold rim
          r = 180; g = 130; b = 10;
        } else {
          // Vibrant Red lottery core (#dc2626 to #991b1b)
          const grad = (y - (cy - safeRadius)) / (safeRadius * 2);
          r = Math.round(220 - grad * 60);
          g = Math.round(38 - grad * 15);
          b = Math.round(38 - grad * 15);

          // Star / Lucky pattern highlight or "XSMB" core
          // Simple golden star / central diamond badge
          const adx = Math.abs(dx);
          const ady = Math.abs(dy);
          if ((adx + ady) < safeRadius * 0.38) {
            r = 254; g = 240; b = 138; // Bright gold highlight
          }
        }
      }

      rawData[pxOffset] = r;
      rawData[pxOffset + 1] = g;
      rawData[pxOffset + 2] = b;
      rawData[pxOffset + 3] = a;
    }
  }

  const deflated = zlib.deflateSync(rawData);

  // PNG Signature
  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  // IHDR chunk
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type: RGBA
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace

  const ihdrChunk = createChunk('IHDR', ihdr);
  const idatChunk = createChunk('IDAT', deflated);
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([sig, ihdrChunk, idatChunk, iendChunk]);
}

// Generate files
fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), generatePNG(192, 192, false));
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), generatePNG(512, 512, false));
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), generatePNG(512, 512, true));
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), generatePNG(180, 180, false));

// Brand SVG
const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a" />
      <stop offset="100%" stop-color="#1e293b" />
    </linearGradient>
    <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fef08a" />
      <stop offset="50%" stop-color="#eab308" />
      <stop offset="100%" stop-color="#ca8a04" />
    </linearGradient>
    <linearGradient id="redBadge" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#ef4444" />
      <stop offset="100%" stop-color="#b91c1c" />
    </linearGradient>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="12" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>

  <!-- Background rounded box -->
  <rect width="512" height="512" rx="112" fill="url(#bg)" />

  <!-- Outer Golden Ring -->
  <circle cx="256" cy="256" r="195" fill="none" stroke="url(#gold)" stroke-width="6" opacity="0.4" />
  <circle cx="256" cy="256" r="175" fill="url(#redBadge)" stroke="url(#gold)" stroke-width="12" filter="url(#glow)" />

  <!-- Inner lottery pattern -->
  <circle cx="256" cy="256" r="140" fill="none" stroke="#fef08a" stroke-width="2" stroke-dasharray="8 8" opacity="0.6" />

  <!-- Center Typography & Motif -->
  <text x="256" y="225" font-family="system-ui, -apple-system, sans-serif" font-size="78" font-weight="900" fill="#ffffff" text-anchor="middle" letter-spacing="2">XSMB</text>
  <rect x="176" y="250" width="160" height="34" rx="17" fill="url(#gold)" />
  <text x="256" y="274" font-family="system-ui, -apple-system, sans-serif" font-size="18" font-weight="800" fill="#0f172a" text-anchor="middle" letter-spacing="4">AI PREDICTOR</text>

  <!-- Stars -->
  <polygon points="256,120 262,138 280,138 266,148 271,166 256,155 241,166 246,148 232,138 250,138" fill="url(#gold)" />
</svg>`;

fs.writeFileSync(path.join(publicDir, 'icon.svg'), svgContent, 'utf-8');
fs.writeFileSync(path.join(publicDir, 'favicon.svg'), svgContent, 'utf-8');

console.log('Successfully generated PWA icons into public/ directory!');
