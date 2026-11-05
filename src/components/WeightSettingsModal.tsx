import React, { useState } from 'react';
import { RotateCcw, Sliders, X } from 'lucide-react';
import { AlgorithmWeights, DEFAULT_WEIGHTS } from '../algorithms/ensemble';

interface WeightSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  weights: AlgorithmWeights;
  onSave: (newWeights: AlgorithmWeights) => void;
}

export const WeightSettingsModal: React.FC<WeightSettingsModalProps> = ({
  isOpen,
  onClose,
  weights,
  onSave,
}) => {
  const [current, setCurrent] = useState<AlgorithmWeights>({ ...weights });

  if (!isOpen) return null;

  const total =
    current.pascal + current.bacNho + current.cauGhep + current.frequency;

  const handleReset = () => {
    setCurrent({ ...DEFAULT_WEIGHTS });
  };

  const handleSave = () => {
    onSave(current);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-emerald-600" />
            <h3 className="text-lg font-bold text-slate-900">
              Trọng Số Thuật Toán Dự Đoán
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-slate-600">
          Điều chỉnh mức độ ưu tiên giữa các thuật toán khi tính điểm tổng hợp cho 2 số cuối và 3 số cuối:
        </p>

        {/* Sliders */}
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
              <span>Tam giác Pascal:</span>
              <span className="font-mono text-emerald-700">{current.pascal}%</span>
            </div>
            <input
              type="range"
              min="5"
              max="60"
              value={current.pascal}
              onChange={(e) =>
                setCurrent({ ...current, pascal: parseInt(e.target.value, 10) })
              }
              className="w-full accent-emerald-600 cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
              <span>Ma trận Bạc Nhớ:</span>
              <span className="font-mono text-blue-700">{current.bacNho}%</span>
            </div>
            <input
              type="range"
              min="5"
              max="60"
              value={current.bacNho}
              onChange={(e) =>
                setCurrent({ ...current, bacNho: parseInt(e.target.value, 10) })
              }
              className="w-full accent-blue-600 cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
              <span>Cầu Ghép Vị Trí Thông:</span>
              <span className="font-mono text-purple-700">{current.cauGhep}%</span>
            </div>
            <input
              type="range"
              min="5"
              max="60"
              value={current.cauGhep}
              onChange={(e) =>
                setCurrent({ ...current, cauGhep: parseInt(e.target.value, 10) })
              }
              className="w-full accent-purple-600 cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
              <span>Tần Suất & Lô Rơi / Chu Kỳ:</span>
              <span className="font-mono text-amber-700">{current.frequency}%</span>
            </div>
            <input
              type="range"
              min="5"
              max="60"
              value={current.frequency}
              onChange={(e) =>
                setCurrent({
                  ...current,
                  frequency: parseInt(e.target.value, 10),
                })
              }
              className="w-full accent-amber-600 cursor-pointer"
            />
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-200">
          <button
            onClick={handleReset}
            className="text-xs text-slate-600 hover:text-slate-900 flex items-center gap-1 font-medium cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Khôi phục chuẩn</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-800 rounded-lg hover:bg-slate-100"
            >
              Hủy
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm"
            >
              Lưu & Áp Dụng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
