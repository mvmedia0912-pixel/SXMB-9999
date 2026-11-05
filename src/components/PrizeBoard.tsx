import React, { useMemo } from 'react';
import { Award, Table } from 'lucide-react';
import { XSMBDraw } from '../types/lottery';

interface PrizeBoardProps {
  draw: XSMBDraw;
  highlightedNumbers?: string[];
}

export const PrizeBoard: React.FC<PrizeBoardProps> = ({
  draw,
  highlightedNumbers = [],
}) => {
  const prizes = draw.prizes;

  // Calculate Dau - Duoi Lo to
  const dauDuoiData = useMemo(() => {
    const dauMap: Record<number, string[]> = {};
    const duoiMap: Record<number, string[]> = {};

    for (let i = 0; i <= 9; i++) {
      dauMap[i] = [];
      duoiMap[i] = [];
    }

    draw.loTo2D.forEach((num) => {
      const dau = parseInt(num[0], 10);
      const duoi = parseInt(num[1], 10);
      if (!isNaN(dau)) dauMap[dau].push(duoi.toString());
      if (!isNaN(duoi)) duoiMap[duoi].push(dau.toString());
    });

    // Sort ascending
    for (let i = 0; i <= 9; i++) {
      dauMap[i].sort();
      duoiMap[i].sort();
    }

    return { dauMap, duoiMap };
  }, [draw.loTo2D]);

  const formatDateVN = (dateStr: string) => {
    const [y, m, d] = dateStr.split('-');
    return `${d}/${m}/${y}`;
  };

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2">
          <Award className="w-5 h-5 text-rose-600" />
          <h2 className="text-lg font-bold text-slate-900">
            Kết Quả Xổ Số Miền Bắc (XSMB) - {draw.dayOfWeek} ({formatDateVN(draw.date)})
          </h2>
        </div>
        <span className="text-xs text-slate-500">
          Mở thưởng tại: <strong className="text-slate-800">{draw.province}</strong>
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Full 27 Prizes Table */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
          <table className="w-full text-center border-collapse">
            <tbody>
              {/* Giải Đặc Biệt */}
              <tr className="bg-rose-50/70 border-b border-rose-200">
                <td className="w-24 sm:w-28 py-3.5 px-3 text-xs font-bold text-rose-700 bg-rose-100/50 border-r border-rose-200 whitespace-nowrap">
                  ĐẶC BIỆT
                </td>
                <td className="py-3.5 px-4">
                  <span className="text-2xl sm:text-3xl font-extrabold font-mono tracking-widest text-rose-600 tabular-nums">
                    {prizes.db}
                  </span>
                </td>
              </tr>

              {/* Giải Nhất */}
              <tr className="border-b border-slate-200 hover:bg-slate-50/50">
                <td className="py-2.5 px-3 text-xs font-semibold text-slate-700 bg-slate-50 border-r border-slate-200">
                  Giải Nhất
                </td>
                <td className="py-2.5 px-4 font-mono font-bold text-lg text-slate-900 tracking-wider tabular-nums">
                  {prizes.g1}
                </td>
              </tr>

              {/* Giải Nhì */}
              <tr className="border-b border-slate-200 hover:bg-slate-50/50">
                <td className="py-2.5 px-3 text-xs font-semibold text-slate-700 bg-slate-50 border-r border-slate-200">
                  Giải Nhì
                </td>
                <td className="py-2.5 px-4">
                  <div className="flex items-center justify-around font-mono font-bold text-base text-slate-800 tracking-wider tabular-nums">
                    {prizes.g2.map((p, idx) => (
                      <span key={idx}>{p}</span>
                    ))}
                  </div>
                </td>
              </tr>

              {/* Giải Ba */}
              <tr className="border-b border-slate-200 hover:bg-slate-50/50">
                <td className="py-2.5 px-3 text-xs font-semibold text-slate-700 bg-slate-50 border-r border-slate-200">
                  Giải Ba
                </td>
                <td className="py-2.5 px-4">
                  <div className="grid grid-cols-3 gap-2 font-mono font-bold text-sm sm:text-base text-slate-800 tracking-wider tabular-nums">
                    {prizes.g3.map((p, idx) => (
                      <span key={idx}>{p}</span>
                    ))}
                  </div>
                </td>
              </tr>

              {/* Giải Tư */}
              <tr className="border-b border-slate-200 hover:bg-slate-50/50">
                <td className="py-2.5 px-3 text-xs font-semibold text-slate-700 bg-slate-50 border-r border-slate-200">
                  Giải Tư
                </td>
                <td className="py-2.5 px-4">
                  <div className="grid grid-cols-4 gap-2 font-mono font-bold text-sm sm:text-base text-slate-800 tracking-wider tabular-nums">
                    {prizes.g4.map((p, idx) => (
                      <span key={idx}>{p}</span>
                    ))}
                  </div>
                </td>
              </tr>

              {/* Giải Năm */}
              <tr className="border-b border-slate-200 hover:bg-slate-50/50">
                <td className="py-2.5 px-3 text-xs font-semibold text-slate-700 bg-slate-50 border-r border-slate-200">
                  Giải Năm
                </td>
                <td className="py-2.5 px-4">
                  <div className="grid grid-cols-3 gap-2 font-mono font-bold text-sm sm:text-base text-slate-800 tracking-wider tabular-nums">
                    {prizes.g5.map((p, idx) => (
                      <span key={idx}>{p}</span>
                    ))}
                  </div>
                </td>
              </tr>

              {/* Giải Sáu */}
              <tr className="border-b border-slate-200 hover:bg-slate-50/50">
                <td className="py-2.5 px-3 text-xs font-semibold text-slate-700 bg-slate-50 border-r border-slate-200">
                  Giải Sáu
                </td>
                <td className="py-2.5 px-4">
                  <div className="grid grid-cols-3 gap-2 font-mono font-bold text-sm sm:text-base text-slate-800 tracking-wider tabular-nums">
                    {prizes.g6.map((p, idx) => (
                      <span key={idx}>{p}</span>
                    ))}
                  </div>
                </td>
              </tr>

              {/* Giải Bảy */}
              <tr className="hover:bg-slate-50/50">
                <td className="py-2.5 px-3 text-xs font-semibold text-slate-700 bg-slate-50 border-r border-slate-200">
                  Giải Bảy
                </td>
                <td className="py-2.5 px-4">
                  <div className="grid grid-cols-4 gap-2 font-mono font-bold text-base text-rose-600 tracking-wider tabular-nums">
                    {prizes.g7.map((p, idx) => (
                      <span key={idx}>{p}</span>
                    ))}
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Right: Bảng Đầu - Đuôi Lô Tô */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
          <div className="bg-slate-100/80 px-3 py-2 border-b border-slate-200 text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <Table className="w-3.5 h-3.5 text-slate-500" />
            <span>Bảng Thống Kê Đầu - Đuôi Lô Tô</span>
          </div>

          <div className="grid grid-cols-2 divide-x divide-slate-200 text-xs">
            {/* Cột Đầu */}
            <div>
              <div className="bg-slate-50 py-1.5 px-2 text-center font-bold text-slate-600 border-b border-slate-200">
                Đầu
              </div>
              <div className="divide-y divide-slate-100">
                {Object.entries(dauDuoiData.dauMap).map(([dau, tails]) => (
                  <div
                    key={dau}
                    className="flex items-center px-2 py-1 hover:bg-slate-50"
                  >
                    <span className="w-6 font-mono font-bold text-slate-900 text-center">
                      {dau}
                    </span>
                    <span className="text-slate-300 mx-1">|</span>
                    <span className="font-mono text-slate-700 tracking-wider truncate">
                      {tails.length > 0 ? (
                        tails.map((t, idx) => {
                          const full = `${dau}${t}`;
                          const isHigh = highlightedNumbers.includes(full);
                          return (
                            <span
                              key={idx}
                              className={isHigh ? 'text-amber-600 font-bold' : ''}
                            >
                              {t}
                              {idx < tails.length - 1 ? ', ' : ''}
                            </span>
                          );
                        })
                      ) : (
                        <span className="text-slate-300 italic text-[10px]">Câm</span>
                      )}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Cột Đuôi */}
            <div>
              <div className="bg-slate-50 py-1.5 px-2 text-center font-bold text-slate-600 border-b border-slate-200">
                Đuôi
              </div>
              <div className="divide-y divide-slate-100">
                {Object.entries(dauDuoiData.duoiMap).map(([duoi, heads]) => (
                  <div
                    key={duoi}
                    className="flex items-center px-2 py-1 hover:bg-slate-50"
                  >
                    <span className="w-6 font-mono font-bold text-slate-900 text-center">
                      {duoi}
                    </span>
                    <span className="text-slate-300 mx-1">|</span>
                    <span className="font-mono text-slate-700 tracking-wider truncate">
                      {heads.length > 0 ? (
                        heads.map((h, idx) => {
                          const full = `${h}${duoi}`;
                          const isHigh = highlightedNumbers.includes(full);
                          return (
                            <span
                              key={idx}
                              className={isHigh ? 'text-indigo-600 font-bold' : ''}
                            >
                              {h}
                              {idx < heads.length - 1 ? ', ' : ''}
                            </span>
                          );
                        })
                      ) : (
                        <span className="text-slate-300 italic text-[10px]">Câm</span>
                      )}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
