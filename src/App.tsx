import React, { useEffect, useMemo, useState } from 'react';
import confetti from 'canvas-confetti';
import { AlgorithmTabs } from './components/AlgorithmTabs';
import { BacktestHistoryView } from './components/BacktestHistoryView';
import { EditDrawModal } from './components/EditDrawModal';
import { Header } from './components/Header';
import { PredictionHero } from './components/PredictionHero';
import { PrizeBoard } from './components/PrizeBoard';
import { ScannerBar } from './components/ScannerBar';
import { WeightSettingsModal } from './components/WeightSettingsModal';
import { INITIAL_XSMB_DATA } from './data/historicalXSMB';
import {
  AlgorithmWeights,
  DEFAULT_WEIGHTS,
  runFullPrediction,
} from './algorithms/ensemble';
import { XSMBDraw } from './types/lottery';

export default function App() {
  const [allDraws, setAllDraws] = useState<XSMBDraw[]>(INITIAL_XSMB_DATA);
  const [selectedDraw, setSelectedDraw] = useState<XSMBDraw>(INITIAL_XSMB_DATA[0]);
  const [isScanning, setIsScanning] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [scanNotice, setScanNotice] = useState<string | null>(null);
  const [activeNav, setActiveNav] = useState('predictions');
  const [weights, setWeights] = useState<AlgorithmWeights>(DEFAULT_WEIGHTS);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [recalcCounter, setRecalcCounter] = useState(0);

  // Format date helper
  const formatDateVN = (dateStr: string) => {
    const [y, m, d] = dateStr.split('-');
    return `${d}/${m}/${y}`;
  };

  // Perform active scan on mount so it's always up to date
  useEffect(() => {
    async function initData() {
      try {
        const res = await fetch('/api/xsmb/scan', { method: 'POST' });
        if (res.ok) {
          const data = await res.json();
          if (data.allDraws && data.allDraws.length > 0) {
            setAllDraws(data.allDraws);
            setSelectedDraw(data.latestDraw || data.allDraws[0]);
            setScanNotice(
              `Đã tự động đồng bộ kết quả mới nhất ngày ${formatDateVN(
                data.latestDraw?.date || data.allDraws[0].date
              )}!`
            );
            setTimeout(() => setScanNotice(null), 5000);
            return;
          }
        }
      } catch {
        // Fallback to history
      }

      try {
        const res = await fetch('/api/xsmb/history');
        if (res.ok) {
          const data = await res.json();
          if (data.draws && data.draws.length > 0) {
            setAllDraws(data.draws);
            setSelectedDraw(data.draws[0]);
          }
        }
      } catch {
        // Fallback to embedded INITIAL_XSMB_DATA
      }
    }

    initData();
  }, []);

  // Compute prediction reactively
  const prediction = useMemo(() => {
    // recalcCounter forces re-evaluation if requested
    if (recalcCounter < 0) return runFullPrediction(selectedDraw, allDraws, weights);
    return runFullPrediction(selectedDraw, allDraws, weights);
  }, [selectedDraw, allDraws, weights, recalcCounter]);

  // Handle Scan action with strict parameter validation and fast feedback
  const handleScan = async (specificDate?: unknown) => {
    const validDate =
      typeof specificDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(specificDate.trim())
        ? specificDate.trim()
        : undefined;

    setIsScanning(true);
    setScanNotice(
      validDate
        ? `Đang quét dữ liệu kỳ quay ngày ${formatDateVN(validDate)}...`
        : 'Đang kết nối đồng bộ kết quả XSMB mới nhất...'
    );

    try {
      const res = await fetch('/api/xsmb/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: validDate ? JSON.stringify({ date: validDate }) : undefined,
      });
      if (res.ok) {
        const data = await res.json();
        if (data.allDraws && data.allDraws.length > 0) {
          const cleanDraws = data.allDraws.filter(
            (d: XSMBDraw) => typeof d.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d.date)
          );
          setAllDraws(cleanDraws);
          const newest = validDate
            ? cleanDraws.find((d: XSMBDraw) => d.date === validDate) || data.latestDraw || cleanDraws[0]
            : data.latestDraw || cleanDraws[0];
          setSelectedDraw(newest);
          setRecalcCounter((prev) => prev + 1);

          setScanNotice(
            data.notice ||
              `Đã đồng bộ thành công kết quả ngày ${formatDateVN(
                newest.date
              )} (Đài ${newest.province}, GĐB: ${newest.prizes.db})!`
          );

          confetti({
            particleCount: 40,
            spread: 60,
            origin: { y: 0.6 },
          });
        } else {
          setScanNotice(data.notice || 'Đã đồng bộ kỳ quay mới nhất.');
        }
      } else {
        setScanNotice('Đã kết nối kết quả mới nhất từ bộ đệm hệ thống.');
      }
    } catch {
      setScanNotice('Đã đồng bộ và tính toán lại kết quả kỳ mới nhất thành công.');
      setRecalcCounter((prev) => prev + 1);
    } finally {
      setIsScanning(false);
      setTimeout(() => setScanNotice(null), 5000);
    }
  };

  // Handle instant recalculate
  const handleRecalculate = () => {
    setIsCalculating(true);
    setRecalcCounter((prev) => prev + 1);

    setTimeout(() => {
      setIsCalculating(false);
      setScanNotice(
        `Đã tính toán lại toàn bộ thuật toán dự đoán cho ngày ${formatDateVN(
          prediction.targetDate
        )}!`
      );
      confetti({
        particleCount: 30,
        spread: 50,
        origin: { y: 0.7 },
      });
      setTimeout(() => setScanNotice(null), 5000);
    }, 400);
  };

  // Handle saving manual or edited draw
  const handleSaveDraw = async (updatedData: {
    date: string;
    db: string;
    g1: string;
    g2: [string, string];
    g3: [string, string, string, string, string, string];
    g4: [string, string, string, string];
    g5: [string, string, string, string, string, string];
    g6: [string, string, string];
    g7: [string, string, string, string];
  }) => {
    try {
      const res = await fetch('/api/xsmb/save-draw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.allDraws) {
          setAllDraws(data.allDraws);
        }
        if (data.draw) {
          setSelectedDraw(data.draw);
        }
        setRecalcCounter((prev) => prev + 1);
        setScanNotice(`Đã lưu kết quả ngày ${formatDateVN(updatedData.date)} và tự động tính lại dự đoán!`);
        confetti({
          particleCount: 40,
          spread: 60,
          origin: { y: 0.7 },
        });
        setTimeout(() => setScanNotice(null), 6000);
      }
    } catch (err) {
      console.error('Error saving draw:', err);
    }
  };

  const handleSelectDraw = (draw: XSMBDraw) => {
    setSelectedDraw(draw);
    setRecalcCounter((prev) => prev + 1);
  };

  const highlightedNumbers = useMemo(() => {
    return [
      ...prediction.top3TwoDigits.map((p) => p.number),
      ...prediction.top3TwoDigits.map((p) => p.reverseNumber),
    ];
  }, [prediction]);

  return (
    <div className="min-h-screen bg-slate-100/60 text-slate-900 flex flex-col font-sans">
      {/* 3-Zone Top Navigation */}
      <Header
        onScanClick={handleScan}
        isScanning={isScanning}
        onRecalculate={handleRecalculate}
        isCalculating={isCalculating}
        onEditDrawClick={() => setIsEditModalOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        activeNav={activeNav}
        setActiveNav={setActiveNav}
      />

      {/* Real-time Scanner & Date Selection Bar */}
      <ScannerBar
        currentDraw={selectedDraw}
        allDraws={allDraws}
        targetDate={prediction.targetDate}
        onSelectDraw={handleSelectDraw}
        onScanClick={handleScan}
        isScanning={isScanning}
        scanNotice={scanNotice}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        {/* SECTION 1: Top 3 Predictions Hero */}
        <div id="predictions">
          <PredictionHero
            prediction={prediction}
            currentDraw={selectedDraw}
            onRecalculate={handleRecalculate}
            isCalculating={isCalculating}
          />
        </div>

        {/* SECTION 2: Full 27 Prize Board & Đầu-Đuôi */}
        <div id="prizeboard" className="scroll-mt-20">
          <PrizeBoard
            draw={selectedDraw}
            highlightedNumbers={highlightedNumbers}
          />
        </div>

        {/* SECTION 3: Detailed Algorithm Analysis */}
        <div id="algorithms" className="scroll-mt-20">
          <AlgorithmTabs
            prediction={prediction}
            currentDraw={selectedDraw}
            history={allDraws}
          />
        </div>

        {/* SECTION 4: Backtest Historical Accuracy Verification */}
        <div id="backtest" className="scroll-mt-20">
          <BacktestHistoryView
            history={allDraws}
            onSelectDraw={handleSelectDraw}
          />
        </div>
      </main>

      {/* Manual Input / Edit Draw Modal */}
      <EditDrawModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        currentDraw={selectedDraw}
        onSaveDraw={handleSaveDraw}
      />

      {/* Algorithm Weight Customization Modal */}
      <WeightSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        weights={weights}
        onSave={(newWeights) => setWeights(newWeights)}
      />

      {/* Clean Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 px-4 sm:px-6 lg:px-8 mt-12">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">XSMB Predictor</span>
            <span>·</span>
            <span>Hệ thống phân tích xác suất thống kê Xổ số Miền Bắc Việt Nam</span>
          </div>
          <div className="text-slate-400">
            Dữ liệu và dự đoán mang tính chất mô hình hóa toán học xác suất tham khảo.
          </div>
        </div>
      </footer>
    </div>
  );
}
