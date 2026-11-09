import React from 'react';
import { Calculator, Edit3, RefreshCw, SlidersHorizontal } from 'lucide-react';

interface HeaderProps {
  onScanClick: () => void;
  isScanning: boolean;
  onRecalculate: () => void;
  isCalculating: boolean;
  onEditDrawClick: () => void;
  onOpenSettings: () => void;
  activeNav: string;
  setActiveNav: (nav: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onScanClick,
  isScanning,
  onRecalculate,
  isCalculating,
  onEditDrawClick,
  onOpenSettings,
  activeNav,
  setActiveNav,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-6 h-16">
          {/* Zone 1: Single text element wordmark */}
          <a
            href="/"
            className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 flex items-center gap-2"
          >
            <span className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-black text-sm">
              XS
            </span>
            <span>XSMB Predictor</span>
          </a>

          {/* Zone 2: 4 clean single-line nav links */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-600">
            <button
              onClick={() => setActiveNav('predictions')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 pb-1 border-b-2 cursor-pointer ${
                activeNav === 'predictions'
                  ? 'border-emerald-600 text-slate-900 font-semibold'
                  : 'border-transparent text-slate-600'
              }`}
            >
              Top Dự Đoán
            </button>
            <button
              onClick={() => setActiveNav('prizeboard')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 pb-1 border-b-2 cursor-pointer ${
                activeNav === 'prizeboard'
                  ? 'border-emerald-600 text-slate-900 font-semibold'
                  : 'border-transparent text-slate-600'
              }`}
            >
              Bảng Kết Quả
            </button>
            <button
              onClick={() => setActiveNav('algorithms')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 pb-1 border-b-2 cursor-pointer ${
                activeNav === 'algorithms'
                  ? 'border-emerald-600 text-slate-900 font-semibold'
                  : 'border-transparent text-slate-600'
              }`}
            >
              Chi Tiết Thuật Toán
            </button>
            <button
              onClick={() => setActiveNav('backtest')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 pb-1 border-b-2 cursor-pointer ${
                activeNav === 'backtest'
                  ? 'border-emerald-600 text-slate-900 font-semibold'
                  : 'border-transparent text-slate-600'
              }`}
            >
              Kiểm Tra Lịch Sử
            </button>
          </nav>

          {/* Zone 3: Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onEditDrawClick}
              title="Nhập hoặc sửa kết quả kỳ này"
              className="px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-200 flex items-center gap-1 cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5 text-slate-600" />
              <span className="hidden sm:inline">Nhập Số</span>
            </button>

            <button
              onClick={onOpenSettings}
              title="Tùy chỉnh trọng số thuật toán"
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200 cursor-pointer"
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>

            <button
              onClick={onRecalculate}
              disabled={isCalculating}
              title="Tính toán lại dự đoán dựa trên kỳ quay đang chọn"
              className="px-3 py-2 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer"
            >
              <Calculator className={`w-3.5 h-3.5 ${isCalculating ? 'animate-pulse' : ''}`} />
              <span className="hidden sm:inline">Tính Lại</span>
            </button>

            <button
              onClick={() => onScanClick()}
              disabled={isScanning}
              className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-2 shadow-sm cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
              <span>{isScanning ? 'Đang Quét...' : 'Quét Mới Nhất & Tính'}</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
