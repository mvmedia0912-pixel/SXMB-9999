import React, { useState } from 'react';
import { Edit3, RotateCcw, Save, X } from 'lucide-react';
import { XSMBDraw } from '../types/lottery';

interface EditDrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentDraw: XSMBDraw;
  onSaveDraw: (updatedDraw: {
    date: string;
    db: string;
    g1: string;
    g2: [string, string];
    g3: [string, string, string, string, string, string];
    g4: [string, string, string, string];
    g5: [string, string, string, string, string, string];
    g6: [string, string, string];
    g7: [string, string, string, string];
  }) => void;
}

export const EditDrawModal: React.FC<EditDrawModalProps> = ({
  isOpen,
  onClose,
  currentDraw,
  onSaveDraw,
}) => {
  const [date, setDate] = useState(currentDraw.date);
  const [db, setDb] = useState(currentDraw.prizes.db);
  const [g1, setG1] = useState(currentDraw.prizes.g1);
  const [g2, setG2] = useState<string[]>([...currentDraw.prizes.g2]);
  const [g3, setG3] = useState<string[]>([...currentDraw.prizes.g3]);
  const [g4, setG4] = useState<string[]>([...currentDraw.prizes.g4]);
  const [g5, setG5] = useState<string[]>([...currentDraw.prizes.g5]);
  const [g6, setG6] = useState<string[]>([...currentDraw.prizes.g6]);
  const [g7, setG7] = useState<string[]>([...currentDraw.prizes.g7]);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveDraw({
      date,
      db: db.trim(),
      g1: g1.trim(),
      g2: [g2[0] || '00000', g2[1] || '00000'],
      g3: [
        g3[0] || '00000',
        g3[1] || '00000',
        g3[2] || '00000',
        g3[3] || '00000',
        g3[4] || '00000',
        g3[5] || '00000',
      ],
      g4: [g4[0] || '0000', g4[1] || '0000', g4[2] || '0000', g4[3] || '0000'],
      g5: [
        g5[0] || '0000',
        g5[1] || '0000',
        g5[2] || '0000',
        g5[3] || '0000',
        g5[4] || '0000',
        g5[5] || '0000',
      ],
      g6: [g6[0] || '000', g6[1] || '000', g6[2] || '000'],
      g7: [g7[0] || '00', g7[1] || '00', g7[2] || '00', g7[3] || '00'],
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-xl border border-slate-200 space-y-4 my-8">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2">
            <Edit3 className="w-5 h-5 text-emerald-600" />
            <h3 className="text-lg font-bold text-slate-900">
              Nhập / Chỉnh Sửa Kết Quả Kỳ Quay
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
          Nhập các con số thực tế nếu bạn muốn đối soát hoặc tính toán lại thuật toán theo kỳ mở thưởng riêng:
        </p>

        <form onSubmit={handleSave} className="space-y-4 text-xs">
          {/* Date picker */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Ngày mở thưởng (YYYY-MM-DD):
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 font-mono text-xs focus:ring-1 focus:ring-emerald-500"
                required
              />
            </div>
            <div>
              <label className="block font-bold text-rose-700 mb-1">
                Giải Đặc Biệt (5 số):
              </label>
              <input
                type="text"
                maxLength={5}
                value={db}
                onChange={(e) => setDb(e.target.value.replace(/\D/g, ''))}
                placeholder="74175"
                className="w-full bg-white border border-rose-300 text-rose-600 font-bold rounded px-2.5 py-1.5 font-mono text-sm focus:ring-1 focus:ring-rose-500"
                required
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Giải Nhất (5 số):
              </label>
              <input
                type="text"
                maxLength={5}
                value={g1}
                onChange={(e) => setG1(e.target.value.replace(/\D/g, ''))}
                placeholder="18190"
                className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 font-mono text-sm focus:ring-1 focus:ring-emerald-500"
                required
              />
            </div>
          </div>

          {/* G2, G3, G7 key prizes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Giải Nhì (2 số):
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  maxLength={5}
                  value={g2[0] || ''}
                  onChange={(e) => {
                    const n = [...g2];
                    n[0] = e.target.value.replace(/\D/g, '');
                    setG2(n);
                  }}
                  placeholder="62731"
                  className="w-1/2 bg-white border border-slate-300 rounded px-2 py-1 font-mono text-xs"
                />
                <input
                  type="text"
                  maxLength={5}
                  value={g2[1] || ''}
                  onChange={(e) => {
                    const n = [...g2];
                    n[1] = e.target.value.replace(/\D/g, '');
                    setG2(n);
                  }}
                  placeholder="30468"
                  className="w-1/2 bg-white border border-slate-300 rounded px-2 py-1 font-mono text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Giải Bảy (4 số, 2 chữ số):
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {[0, 1, 2, 3].map((idx) => (
                  <input
                    key={idx}
                    type="text"
                    maxLength={2}
                    value={g7[idx] || ''}
                    onChange={(e) => {
                      const n = [...g7];
                      n[idx] = e.target.value.replace(/\D/g, '');
                      setG7(n);
                    }}
                    placeholder={`G7.${idx + 1}`}
                    className="bg-white border border-slate-300 rounded px-1.5 py-1 font-mono text-center text-xs"
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Footer buttons */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-800 rounded-lg hover:bg-slate-100"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm flex items-center gap-1.5 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Lưu Kỳ Quay & Tính Lại Dự Đoán</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
