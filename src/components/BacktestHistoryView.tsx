import React, { useMemo } from 'react';
import { CheckCircle2, History, Percent, Target, Trophy } from 'lucide-react';
import { runFullPrediction } from '../algorithms/ensemble';
import { XSMBDraw } from '../types/lottery';

interface BacktestHistoryViewProps {
  history: XSMBDraw[];
  onSelectDraw: (draw: XSMBDraw) => void;
}

export const BacktestHistoryView: React.FC<BacktestHistoryViewProps> = ({
  history,
  onSelectDraw,
}) => {
  const sorted = useMemo(() => {
    return [...history].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [history]);

  // Generate backtest results for the latest 12 pairs of draws
  const backtestItems = useMemo(() => {
    const items = [];
    for (let i = 1; i < Math.min(12, sorted.length); i++) {
      const baseDraw = sorted[i]; // Hôm trước
      const actualNextDraw = sorted[i - 1]; // Hôm sau (đã có kết quả)

      const pred = runFullPrediction(baseDraw, history);
      const hit2D = pred.top3TwoDigits.find(
        (p) =>
          p.number === actualNextDraw.de2D ||
          p.reverseNumber === actualNextDraw.de2D ||
          actualNextDraw.loTo2D.includes(p.number) ||
          actualNextDraw.loTo2D.includes(p.reverseNumber)
      );
      const isDeHit = pred.top3TwoDigits.some(
        (p) => p.number === actualNextDraw.de2D || p.reverseNumber === actualNextDraw.de2D
      );
      const is3DHit = pred.top3ThreeDigits.some(
        (p) => p.number === actualNextDraw.de3D
      );

      items.push({
        baseDraw,
        actualNextDraw,
        pred,
        hit2D,
        isDeHit,
        is3DHit,
      });
    }
    return items;
  }, [sorted, history]);

  // Compute accuracy rate
  const stats = useMemo(() => {
    const total = backtestItems.length;
    const hit2DCount = backtestItems.filter((i) => i.hit2D).length;
    const hitDeCount = backtestItems.filter((i) => i.isDeHit).length;
    const hit3DCount = backtestItems.filter((i) => i.is3DHit).length;

    return {
      total,
      hit2DCount,
      rate2D: total > 0 ? Math.round((hit2DCount / total) * 100) : 0,
      hitDeCount,
      hit3DCount,
    };
  }, [backtestItems]);

  const formatDateVN = (dateStr: string) => {
    const [y, m, d] = dateStr.split('-');
    return `${d}/${m}/${y}`;
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6">
      {/* Title & KPI Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <History className="w-5 h-5 text-indigo-600" />
            <span>Kiểm Chứng Lịch Sử Độ Chuẩn Xác (Backtest Simulation)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Đối soát trực tiếp dự đoán thuật toán với kết quả thực tế xổ số miền Bắc qua các kỳ quay gần nhất
          </p>
        </div>

        {/* Accuracy badge */}
        <div className="flex items-center gap-3">
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-1.5 text-right">
            <div className="text-[10px] uppercase font-bold text-emerald-700">
              Tỉ lệ nổ 2 số (Top 3)
            </div>
            <div className="text-xl font-black font-mono text-emerald-800 tabular-nums">
              {stats.rate2D}%{' '}
              <span className="text-xs font-normal text-emerald-600">
                ({stats.hit2DCount}/{stats.total} kỳ)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Backtest Table */}
      <div className="border border-slate-200 rounded-xl overflow-hidden">
        <table className="w-full text-left border-collapse text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
            <tr>
              <th className="py-2.5 px-4">Kỳ cơ sở</th>
              <th className="py-2.5 px-4">Kỳ kiểm chứng</th>
              <th className="py-2.5 px-4">Top 3 Dự Đoán 2 Số Cuối</th>
              <th className="py-2.5 px-4">Top 3 Dự Đoán 3 Số Cuối</th>
              <th className="py-2.5 px-4">Kết quả thực tế</th>
              <th className="py-2.5 px-4 text-right">Đối soát</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {backtestItems.map((item, idx) => (
              <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                <td className="py-3 px-4">
                  <button
                    onClick={() => onSelectDraw(item.baseDraw)}
                    className="font-medium text-slate-900 hover:text-emerald-700 underline cursor-pointer"
                  >
                    {formatDateVN(item.baseDraw.date)}
                  </button>
                  <div className="text-[11px] text-slate-500 font-mono">
                    ĐB: {item.baseDraw.prizes.db}
                  </div>
                </td>

                <td className="py-3 px-4 font-semibold text-slate-700">
                  {formatDateVN(item.actualNextDraw.date)}
                  <div className="text-[11px] text-slate-400 font-normal">
                    Đài {item.actualNextDraw.province}
                  </div>
                </td>

                <td className="py-3 px-4 font-mono font-bold">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {item.pred.top3TwoDigits.map((p) => {
                      const isDirectHit =
                        p.number === item.actualNextDraw.de2D ||
                        item.actualNextDraw.loTo2D.includes(p.number);
                      const isReverseHit =
                        p.reverseNumber === item.actualNextDraw.de2D ||
                        item.actualNextDraw.loTo2D.includes(p.reverseNumber);
                      const isDeHit =
                        p.number === item.actualNextDraw.de2D ||
                        p.reverseNumber === item.actualNextDraw.de2D;
                      const isHit = isDirectHit || isReverseHit;

                      return (
                        <span
                          key={p.number}
                          title={`${p.role}: ${p.number} (lót ${p.reverseNumber})`}
                          className={`px-1.5 py-0.5 rounded text-xs flex items-center gap-1 ${
                            isDeHit
                              ? 'bg-rose-600 text-white font-extrabold shadow-xs'
                              : isHit
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          <span>{p.number}</span>
                          {isReverseHit && !isDirectHit && (
                            <span className="text-[9px] opacity-75 font-normal">({p.reverseNumber})</span>
                          )}
                        </span>
                      );
                    })}
                  </div>
                </td>

                <td className="py-3 px-4 font-mono">
                  <div className="flex items-center gap-1.5 flex-wrap text-slate-800">
                    {item.pred.top3ThreeDigits.map((p) => {
                      const is3Hit = p.number === item.actualNextDraw.de3D;
                      return (
                        <span
                          key={p.number}
                          className={`px-1.5 py-0.5 rounded text-xs ${
                            is3Hit
                              ? 'bg-amber-500 text-white font-bold'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {p.number}
                        </span>
                      );
                    })}
                  </div>
                </td>

                <td className="py-3 px-4">
                  <div className="font-mono">
                    <span className="font-bold text-rose-600">
                      Đề: {item.actualNextDraw.de2D}
                    </span>{' '}
                    <span className="text-slate-400">
                      (3C: {item.actualNextDraw.de3D})
                    </span>
                  </div>
                </td>

                <td className="py-3 px-4 text-right">
                  {item.is3DHit ? (
                    <span className="bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded">
                      🎉 NỔ 3 CÀNG
                    </span>
                  ) : item.isDeHit ? (
                    <span className="bg-rose-100 text-rose-800 font-bold px-2 py-0.5 rounded">
                      🎯 TRÚNG ĐỀ
                    </span>
                  ) : item.hit2D ? (
                    <span className="bg-emerald-100 text-emerald-800 font-medium px-2 py-0.5 rounded">
                      ✓ Nổ Lô 2D (Top #{item.hit2D.rank})
                    </span>
                  ) : (
                    <span className="text-slate-400">Không nổ</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
