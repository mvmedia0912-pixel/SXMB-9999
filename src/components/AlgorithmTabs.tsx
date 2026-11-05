import React, { useState } from 'react';
import {
  Activity,
  Binary,
  GitBranch,
  History,
  Layers,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { PredictionResult, XSMBDraw } from '../types/lottery';
import { calculateFrequencyStats } from '../algorithms/frequency';

interface AlgorithmTabsProps {
  prediction: PredictionResult;
  currentDraw: XSMBDraw;
  history: XSMBDraw[];
}

export const AlgorithmTabs: React.FC<AlgorithmTabsProps> = ({
  prediction,
  currentDraw,
  history,
}) => {
  const [activeTab, setActiveTab] = useState<'pascal' | 'bacNho' | 'cauGhep' | 'frequency'>('pascal');

  const pascal = prediction.pascalData;
  const bridges = prediction.topBridges;
  const bacNho = prediction.bacNhoTop;
  const freqMap = calculateFrequencyStats(currentDraw, history);
  const freqList = Array.from(freqMap.values()).sort(
    (a, b) => b.occurrences30Days - a.occurrences30Days
  );

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6">
      {/* Header and Tab Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Layers className="w-5 h-5 text-emerald-600" />
            <span>Phân Tích Chi Tiết 4 Thuật Toán Dự Đoán</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Mỗi thuật toán đại diện cho một phương pháp xác suất thống kê chuyên biệt của Xổ số Miền Bắc
          </p>
        </div>

        {/* Tab Controls (Interactive Filter Segmented Buttons) */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
          <button
            onClick={() => setActiveTab('pascal')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
              activeTab === 'pascal'
                ? 'bg-white text-emerald-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Binary className="w-3.5 h-3.5" />
            <span>Cầu Pascal</span>
          </button>
          <button
            onClick={() => setActiveTab('bacNho')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
              activeTab === 'bacNho'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Ma Trận Bạc Nhớ</span>
          </button>
          <button
            onClick={() => setActiveTab('cauGhep')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
              activeTab === 'cauGhep'
                ? 'bg-white text-purple-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <GitBranch className="w-3.5 h-3.5" />
            <span>Cầu Ghép Đang Thông</span>
          </button>
          <button
            onClick={() => setActiveTab('frequency')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
              activeTab === 'frequency'
                ? 'bg-white text-amber-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Chu Kỳ & Lô Gan</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Cầu Pascal */}
      {activeTab === 'pascal' && (
        <div className="space-y-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-emerald-50/70 border border-emerald-200 rounded-xl p-4">
            <div>
              <div className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                Thuật toán Tam Giác Pascal
              </div>
              <p className="text-sm text-slate-700 mt-1">
                Lấy 5 chữ số Giải Đặc Biệt (<strong className="font-mono">{currentDraw.prizes.db}</strong>) ghép với 5 chữ số Giải Nhất (<strong className="font-mono">{currentDraw.prizes.g1}</strong>) thành dãy 10 chữ số. Cộng dồn liên tiếp modulo 10 cho đến khi tìm được cặp số cuối cùng.
              </p>
            </div>
            <div className="text-right shrink-0 bg-white px-4 py-2 rounded-lg border border-emerald-200">
              <div className="text-xs text-slate-500 font-medium">Bạch thủ Pascal</div>
              <div className="text-2xl font-black font-mono text-emerald-700 tabular-nums">
                {pascal.pair[0]} <span className="text-slate-400 text-sm font-normal">lót</span> {pascal.pair[1]}
              </div>
            </div>
          </div>

          {/* Pascal Pyramid Display */}
          <div className="bg-slate-900 text-slate-100 rounded-xl p-6 font-mono text-center overflow-x-auto shadow-inner">
            <div className="inline-block space-y-1.5 min-w-[320px]">
              {pascal.steps.map((rowStr, idx) => {
                const isFirst = idx === 0;
                const isLast = idx === pascal.steps.length - 1;
                return (
                  <div
                    key={idx}
                    className={`tracking-widest transition-all ${
                      isFirst
                        ? 'text-emerald-400 font-bold text-base'
                        : isLast
                        ? 'text-amber-400 font-black text-xl bg-amber-400/20 py-1 px-3 rounded inline-block mt-2 shadow'
                        : 'text-slate-300 text-sm'
                    }`}
                  >
                    {rowStr.split('').join(' ')}
                  </div>
                );
              })}
            </div>
            <div className="text-xs text-slate-400 mt-4">
              Dãy ban đầu: {pascal.combinedNumber} ➔ Kết quả cặp số Pascal: <strong className="text-amber-300">{pascal.pair[0]} - {pascal.pair[1]}</strong>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Ma Trận Bạc Nhớ */}
      {activeTab === 'bacNho' && (
        <div className="space-y-4">
          <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-4 text-sm text-slate-700">
            <div className="text-xs font-bold text-blue-800 uppercase tracking-wider mb-1">
              Quy Luật Ma Trận Chuyển Tiếp Bạc Nhớ
            </div>
            <p>
              Hệ thống truy xuất dữ liệu lịch sử các kỳ quay có Đề về <strong className="font-mono text-blue-900">{currentDraw.de2D}</strong> và kết hợp quy luật chu kỳ tiếp diễn kinh điển của xổ số miền Bắc để tính toán xác suất có điều kiện P(Số ngày mai | Đề hôm nay).
            </p>
          </div>

          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-2.5 px-4">Cặp số</th>
                  <th className="py-2.5 px-4">Xác suất bạc nhớ</th>
                  <th className="py-2.5 px-4">Quy luật & Căn cứ lịch sử</th>
                  <th className="py-2.5 px-4 text-right">Mức độ khuyến nghị</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {bacNho.map((item, idx) => (
                  <tr key={item.number} className="hover:bg-slate-50">
                    <td className="py-2.5 px-4 font-mono font-bold text-base text-slate-900">
                      {item.number}
                    </td>
                    <td className="py-2.5 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-600 rounded-full"
                            style={{ width: `${item.probability}%` }}
                          />
                        </div>
                        <span className="font-mono font-semibold text-blue-700">
                          {item.probability}%
                        </span>
                      </div>
                    </td>
                    <td className="py-2.5 px-4 text-slate-600">{item.reason}</td>
                    <td className="py-2.5 px-4 text-right">
                      {idx === 0 ? (
                        <span className="bg-blue-100 text-blue-800 font-semibold px-2 py-0.5 rounded">
                          Ưu tiên cao nhất
                        </span>
                      ) : idx <= 2 ? (
                        <span className="bg-slate-100 text-slate-700 font-medium px-2 py-0.5 rounded">
                          Độ tin cậy cao
                        </span>
                      ) : (
                        <span className="text-slate-400">Tham khảo</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Cầu Ghép Vị Trí */}
      {activeTab === 'cauGhep' && (
        <div className="space-y-4">
          <div className="bg-purple-50/70 border border-purple-200 rounded-xl p-4 text-sm text-slate-700">
            <div className="text-xs font-bold text-purple-800 uppercase tracking-wider mb-1">
              Thuật toán Cầu Ghép Vị Trí Giải Đang Thông
            </div>
            <p>
              Quét toàn bộ 107 vị trí con số trên bảng kết quả XSMB. Cầu được tính là &quot;thông&quot; khi cặp vị trí đó tạo thành số liên tục xuất hiện ở kỳ quay kế tiếp trong ít nhất 3 ngày liên tục.
            </p>
          </div>

          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-2.5 px-4">Số báo</th>
                  <th className="py-2.5 px-4">Độ dài chuỗi thông</th>
                  <th className="py-2.5 px-4">Vị trí con số thứ 1</th>
                  <th className="py-2.5 px-4">Vị trí con số thứ 2</th>
                  <th className="py-2.5 px-4 text-right">Độ tin cậy</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {bridges.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-4 font-mono font-bold text-base text-purple-700">
                      {b.number}
                    </td>
                    <td className="py-2.5 px-4">
                      <span className="bg-purple-100 text-purple-800 font-bold px-2 py-0.5 rounded">
                        Thông {b.streakDays} ngày
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-slate-700 font-medium">{b.pos1Name}</td>
                    <td className="py-2.5 px-4 text-slate-700 font-medium">{b.pos2Name}</td>
                    <td className="py-2.5 px-4 text-right font-mono font-semibold text-slate-900">
                      {b.reliabilityScore}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Chu Kỳ & Lô Gan */}
      {activeTab === 'frequency' && (
        <div className="space-y-4">
          <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-4 text-sm text-slate-700">
            <div className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-1">
              Phân Tích Nhịp Lô Tô, Lô Rơi & Lô Gan (30 Kỳ Gần Nhất)
            </div>
            <p>
              Thống kê tần suất xuất hiện và khoảng cách ngày chưa ra (gan) của các con số. Lô rơi từ Giải Đặc Biệt hôm trước hoặc số đang ở nhịp vàng (1-3 ngày) có xác suất nổ tiếp theo cao nhất.
            </p>
          </div>

          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-2.5 px-4">Con số</th>
                  <th className="py-2.5 px-4">Số lần xuất hiện / 30 kỳ</th>
                  <th className="py-2.5 px-4">Ngày chưa về (Gan)</th>
                  <th className="py-2.5 px-4">Phân loại nhịp</th>
                  <th className="py-2.5 px-4 text-right">Điểm chu kỳ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {freqList.slice(0, 15).map((stat) => (
                  <tr key={stat.number} className="hover:bg-slate-50">
                    <td className="py-2.5 px-4 font-mono font-bold text-base text-slate-900">
                      {stat.number}
                    </td>
                    <td className="py-2.5 px-4 font-mono font-semibold text-slate-700">
                      {stat.occurrences30Days} lần
                    </td>
                    <td className="py-2.5 px-4 font-mono text-slate-600">
                      {stat.currentGap === 0 ? (
                        <span className="text-emerald-600 font-bold">Vừa nổ hôm nay</span>
                      ) : (
                        `${stat.currentGap} ngày`
                      )}
                    </td>
                    <td className="py-2.5 px-4">
                      {stat.isLotoRoi ? (
                        <span className="bg-rose-100 text-rose-800 font-bold px-2 py-0.5 rounded">
                          Lô rơi GĐB
                        </span>
                      ) : stat.trend === 'hot' ? (
                        <span className="bg-amber-100 text-amber-800 font-semibold px-2 py-0.5 rounded">
                          Lô về nhiều
                        </span>
                      ) : stat.trend === 'gan' ? (
                        <span className="bg-slate-200 text-slate-700 px-2 py-0.5 rounded">
                          Lô gan
                        </span>
                      ) : (
                        <span className="text-slate-600">Nhịp đều</span>
                      )}
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono font-bold text-slate-900">
                      {stat.score} điểm
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
