import React from 'react';
import { Calendar, CheckCircle, ChevronLeft, ChevronRight, Info, RefreshCw, Zap } from 'lucide-react';
import { XSMBDraw } from '../types/lottery';

interface ScannerBarProps {
  currentDraw: XSMBDraw;
  allDraws: XSMBDraw[];
  targetDate: string;
  onSelectDraw: (draw: XSMBDraw) => void;
  onScanClick: () => void;
  isScanning: boolean;
  scanNotice: string | null;
}

export const ScannerBar: React.FC<ScannerBarProps> = ({
  currentDraw,
  allDraws,
  targetDate,
  onSelectDraw,
  onScanClick,
  isScanning,
  scanNotice,
}) => {
  const currentIndex = allDraws.findIndex((d) => d.id === currentDraw.id);
  const canGoNewer = currentIndex > 0;
  const canGoOlder = currentIndex < allDraws.length - 1;

  const handlePrevDay = () => {
    if (canGoOlder) {
      onSelectDraw(allDraws[currentIndex + 1]);
    }
  };

  const handleNextDay = () => {
    if (canGoNewer) {
      onSelectDraw(allDraws[currentIndex - 1]);
    }
  };

  // Format Vietnamese dates
  const formatDateVN = (dateStr: string) => {
    const [y, m, d] = dateStr.split('-');
    return `${d}/${m}/${y}`;
  };

  return (
    <div className="bg-slate-50 border-b border-slate-200 py-3 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-2">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          {/* Left: Base draw selection */}
          <div className="flex items-center flex-wrap gap-2 text-xs text-slate-700">
            <span className="font-semibold text-slate-900 flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-emerald-600" />
              <span>Kỳ cơ sở:</span>
            </span>

            <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-md p-0.5">
              <button
                onClick={handlePrevDay}
                disabled={!canGoOlder}
                title="Kỳ quay trước"
                className="p-1 hover:bg-slate-100 disabled:opacity-30 rounded text-slate-700 cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>

              <select
                value={currentDraw.date}
                onChange={(e) => {
                  const found = allDraws.find((d) => d.date === e.target.value);
                  if (found) onSelectDraw(found);
                }}
                className="bg-transparent text-xs font-semibold text-slate-800 py-1 px-1 focus:outline-none cursor-pointer"
              >
                {allDraws.map((d) => (
                  <option key={d.id} value={d.date}>
                    {d.dayOfWeek} ({formatDateVN(d.date)}) - Đài {d.province} (ĐB: {d.prizes.db})
                  </option>
                ))}
              </select>

              <button
                onClick={handleNextDay}
                disabled={!canGoNewer}
                title="Kỳ quay kế tiếp"
                className="p-1 hover:bg-slate-100 disabled:opacity-30 rounded text-slate-700 cursor-pointer"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <span className="text-slate-400">➔</span>

            <span className="font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-md flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-emerald-600" />
              <span>Dự đoán cho ngày tiếp theo: {formatDateVN(targetDate)}</span>
            </span>
          </div>

          {/* Right: Quick action buttons */}
          <div className="flex items-center gap-2 text-xs">
            <button
              onClick={() => onScanClick()}
              disabled={isScanning}
              className="px-2.5 py-1 text-xs font-semibold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 border border-emerald-300 rounded flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              title="Quét và cập nhật kết quả mới nhất từ máy chủ"
            >
              <RefreshCw className={`w-3 h-3 ${isScanning ? 'animate-spin' : ''}`} />
              <span>{isScanning ? 'Đang Quét...' : 'Quét Ngay'}</span>
            </button>

            {currentIndex === 0 ? (
              <span className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                <CheckCircle className="w-3 h-3 text-emerald-600" />
                <span>Kỳ mới nhất ({formatDateVN(allDraws[0]?.date || '')})</span>
              </span>
            ) : (
              <button
                onClick={() => onSelectDraw(allDraws[0])}
                className="text-indigo-600 hover:text-indigo-800 font-semibold underline cursor-pointer"
              >
                Về kỳ mới nhất ({formatDateVN(allDraws[0]?.date || '')})
              </button>
            )}
          </div>
        </div>

        {/* Scan Status Toast / Notice Banner if active */}
        {scanNotice && (
          <div className="text-xs text-emerald-800 bg-emerald-50/90 border border-emerald-300 rounded-lg px-3 py-1.5 flex items-center gap-2 animate-in fade-in duration-200">
            <Info className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="font-medium">{scanNotice}</span>
          </div>
        )}
      </div>
    </div>
  );
};
