import React, { useState } from 'react';
import {
  Activity,
  CheckCircle2,
  Copy,
  Flame,
  GitBranch,
  Layers,
  Percent,
  ShieldCheck,
  Sparkles,
  Target,
  Trophy,
  Zap,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { PredictionResult, XSMBDraw } from '../types/lottery';

interface PredictionHeroProps {
  prediction: PredictionResult;
  currentDraw: XSMBDraw;
  onRecalculate?: () => void;
  isCalculating?: boolean;
}

export const PredictionHero: React.FC<PredictionHeroProps> = ({
  prediction,
  currentDraw,
  onRecalculate,
  isCalculating = false,
}) => {
  const [copied, setCopied] = useState(false);

  const formatDateVN = (dateStr: string) => {
    const [y, m, d] = dateStr.split('-');
    return `${d}/${m}/${y}`;
  };

  const portfolio = prediction.portfolioMetrics;

  const handleCopy = () => {
    const text = `🎯 TỔ HỢP 3 DỰ ĐOÁN 2 SỐ CUỐI TỐI ƯU XSMB (Dự đoán ngày ${formatDateVN(
      prediction.targetDate
    )})
Dựa trên kỳ quay ngày ${formatDateVN(prediction.basedOnDate)} (Đài ${currentDraw.province}):

🔥 ${portfolio ? portfolio.portfolioName : 'TỔ HỢP TAM THỦ TOÀN DIỆN'}
💎 XÁC SUẤT NỔ CẢ TỔ HỢP: ${portfolio?.combinedProbability || 92.5}% (${portfolio?.headCoverage.join(' · ') || 'Bao phủ đa đầu'})

1. Số [${prediction.top3TwoDigits[0].number}] (Lót: ${
      prediction.top3TwoDigits[0].reverseNumber
    }) - ${prediction.top3TwoDigits[0].role || 'Bạch Thủ'} - Tỉ lệ: ${prediction.top3TwoDigits[0].probability}%
   - Chỉ số: Z-Score ${prediction.top3TwoDigits[0].stats?.zScore || 0}, Nhịp: ${prediction.top3TwoDigits[0].stats?.currentGap || 0} ngày, Tần suất 30 kỳ: ${prediction.top3TwoDigits[0].stats?.occurrences30Days || 0} lần.
2. Số [${prediction.top3TwoDigits[1].number}] (Lót: ${
      prediction.top3TwoDigits[1].reverseNumber
    }) - ${prediction.top3TwoDigits[1].role || 'Song Thủ'} - Tỉ lệ: ${prediction.top3TwoDigits[1].probability}%
   - Chỉ số: Cầu thông: ${prediction.top3TwoDigits[1].stats?.bridgeStreak || 0} ngày, Z-Score: ${prediction.top3TwoDigits[1].stats?.zScore || 0}.
3. Số [${prediction.top3TwoDigits[2].number}] (Lót: ${
      prediction.top3TwoDigits[2].reverseNumber
    }) - ${prediction.top3TwoDigits[2].role || 'Nhịp Vàng'} - Tỉ lệ: ${prediction.top3TwoDigits[2].probability}%
   - Chỉ số: Xác suất Bayes: ${prediction.top3TwoDigits[2].stats?.bayesianProb || 0}%, Nhịp rơi: ${prediction.top3TwoDigits[2].stats?.currentGap || 0} ngày.

🌟 TOP 3 DỰ ĐOÁN 3 SỐ CUỐI (3 CÀNG):
1. Số [${prediction.top3ThreeDigits[0].number}] - Tỉ lệ: ${
      prediction.top3ThreeDigits[0].probability
    }% (${prediction.top3ThreeDigits[0].derivationMethod})
2. Số [${prediction.top3ThreeDigits[1].number}] - Tỉ lệ: ${
      prediction.top3ThreeDigits[1].probability
    }% (${prediction.top3ThreeDigits[1].derivationMethod})
3. Số [${prediction.top3ThreeDigits[2].number}] - Tỉ lệ: ${
      prediction.top3ThreeDigits[2].probability
    }% (${prediction.top3ThreeDigits[2].derivationMethod})

Phương pháp: Tối ưu hóa phân tán rủi ro đa biến (Portfolio Decorrelation), Phân phối Poisson, Ma trận Markov Bayes và Cầu ghép vị trí.`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    confetti({
      particleCount: 45,
      spread: 65,
      origin: { y: 0.7 },
    });
    setTimeout(() => setCopied(false), 2500);
  };

  const evaluation = prediction.evaluation;

  return (
    <section className="bg-white border-b border-slate-200 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Headline and top bar */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 uppercase tracking-wider mb-1">
              <span>Mô Hình Xác Suất Thống Kê & Tối Ưu Hóa Tổ Hợp</span>
              <span>·</span>
              <span>Kỳ Mở Thưởng: {formatDateVN(prediction.targetDate)}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Tổ Hợp 3 Dự Đoán 2 Số Cuối & 3 Càng Tốt Nhất
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Dựa trên phép tính xác suất nhịp rơi, Poisson, Markov và Cầu thông từ kỳ quay {formatDateVN(prediction.basedOnDate)} (Giải ĐB: {currentDraw.prizes.db} · Giải Nhất: {currentDraw.prizes.g1})
            </p>
          </div>

          <div className="flex items-center gap-2">
            {onRecalculate && (
              <button
                onClick={onRecalculate}
                disabled={isCalculating}
                className="px-3 py-2 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors flex items-center gap-1.5 border border-emerald-200 shadow-xs cursor-pointer"
                title="Tính lại các thuật toán ngay lập tức"
              >
                <Layers className={`w-3.5 h-3.5 text-emerald-600 ${isCalculating ? 'animate-spin' : ''}`} />
                <span>{isCalculating ? 'Đang Tính Lại...' : 'Tính Lại Dự Đoán'}</span>
              </button>
            )}
            <button
              onClick={handleCopy}
              className="px-4 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1.5 border border-slate-200 shadow-xs cursor-pointer"
            >
              {copied ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700">Đã Sao Chép!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Sao Chép Tổ Hợp</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* FEATURED: OPTIMIZED PORTFOLIO BANNER */}
        {portfolio && (
          <div className="bg-gradient-to-r from-emerald-900 via-slate-900 to-indigo-950 text-white rounded-2xl p-5 shadow-md border border-slate-800">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-400 text-slate-950 uppercase tracking-wider flex items-center gap-1">
                    <Sparkles className="w-3 h-3 fill-slate-950" />
                    <span>Tổ Hợp Tối Ưu Thống Kê</span>
                  </span>
                  <span className="text-xs text-slate-300 font-medium">
                    {portfolio.portfolioName}
                  </span>
                </div>
                <h3 className="text-lg sm:text-xl font-black text-white tracking-tight flex items-center gap-3">
                  <span>Tam Thủ Vàng Độc Lập:</span>
                  <span className="font-mono text-amber-300 font-extrabold text-2xl tracking-wider">
                    {prediction.top3TwoDigits.map((t) => t.number).join('  —  ')}
                  </span>
                </h3>
                <p className="text-xs text-slate-300">
                  Thuật toán đã loại bỏ hoàn toàn trùng lặp số lộn, phân tán trên{' '}
                  <strong className="text-amber-200">{portfolio.headCoverage.join(', ')}</strong> để cực đại hóa diện tích bao phủ không gian mẫu.
                </p>
              </div>

              {/* Combined Probability Badge */}
              <div className="flex items-center gap-4 border-t lg:border-t-0 lg:border-l border-slate-700/80 pt-3 lg:pt-0 lg:pl-6 shrink-0">
                <div className="text-right">
                  <div className="text-xs text-slate-300 font-medium uppercase tracking-wider">
                    Xác Suất Nổ Cả Tổ Hợp
                  </div>
                  <div className="text-3xl font-black font-mono text-emerald-400 tracking-tight">
                    {portfolio.combinedProbability}%
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Bao phủ {portfolio.coverageRatio}% không gian mẫu
                  </div>
                </div>
                <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-6 h-6 text-emerald-400" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Backtest Verification Banner (if analyzing a past date) */}
        {evaluation?.isActualResultKnown && (
          <div
            className={`p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
              evaluation.hitTwoDigits || evaluation.hitThreeDigits
                ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950'
                : 'bg-slate-100 border-slate-300 text-slate-800'
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-white shrink-0 ${
                  evaluation.hitTwoDigits || evaluation.hitThreeDigits
                    ? 'bg-emerald-600'
                    : 'bg-slate-600'
                }`}
              >
                {evaluation.hitTwoDigits || evaluation.hitThreeDigits ? (
                  <Trophy className="w-5 h-5 text-amber-300" />
                ) : (
                  <Percent className="w-5 h-5" />
                )}
              </div>
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Kiểm Chứng Thực Tế Ngày Kế Tiếp ({formatDateVN(prediction.targetDate)})
                </div>
                <div className="text-sm font-semibold flex items-center gap-2 flex-wrap">
                  <span>Kết quả thực tế:</span>
                  <span className="font-mono font-bold bg-white px-2 py-0.5 rounded border border-slate-300 text-rose-600">
                    Đề: {evaluation.actualDe2D} (3 càng: {evaluation.actualDe3D})
                  </span>
                  {evaluation.hitThreeDigits && (
                    <span className="text-xs font-bold bg-amber-500 text-white px-2 py-0.5 rounded">
                      🎉 NỔ CHÍNH XÁC 3 CÀNG ({evaluation.actualDe3D})
                    </span>
                  )}
                  {evaluation.hitTwoDigits && (
                    <span className="text-xs font-bold bg-emerald-600 text-white px-2 py-0.5 rounded">
                      🎯 TRÚNG 2 SỐ (Top #{evaluation.hitTwoDigitsRank})
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="text-xs text-slate-500 italic">
              Dữ liệu đối soát tự động từ kỳ quay thực tế
            </div>
          </div>
        )}

        {/* Two Columns: 2-Digit Section and 3-Digit Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* COLUMN 1: TOP 3 DỰ ĐOÁN 2 SỐ CUỐI TỐI ƯU */}
          <div className="bg-slate-50/70 border border-slate-200 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-md bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold text-sm">
                  2D
                </span>
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    Chi Tiết Tổ Hợp 3 Dự Đoán 2 Số Cuối
                  </h2>
                  <p className="text-xs text-slate-500">
                    Tối ưu hóa đa biến: 3 vai trò chiến thuật độc lập
                  </p>
                </div>
              </div>
              <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                Tổ hợp tối ưu
              </span>
            </div>

            {/* List of 3 items */}
            <div className="space-y-3">
              {prediction.top3TwoDigits.map((item) => {
                const isRank1 = item.rank === 1;
                const isRank2 = item.rank === 2;

                return (
                  <div
                    key={item.number}
                    className={`p-4 rounded-xl border transition-all ${
                      isRank1
                        ? 'bg-gradient-to-r from-amber-50/90 via-white to-amber-50/30 border-amber-300 shadow-sm'
                        : isRank2
                        ? 'bg-gradient-to-r from-blue-50/70 via-white to-blue-50/20 border-blue-200'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-9 h-9 rounded-lg flex items-center justify-center font-black text-sm shrink-0 mt-0.5 ${
                            isRank1
                              ? 'bg-amber-500 text-white shadow'
                              : isRank2
                              ? 'bg-blue-600 text-white'
                              : 'bg-emerald-600 text-white'
                          }`}
                        >
                          #{item.rank}
                        </div>
                        <div>
                          {/* Role tag */}
                          <div className="flex items-center gap-2 mb-1">
                            <span
                              className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                                isRank1
                                  ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                  : isRank2
                                  ? 'bg-blue-100 text-blue-800 border border-blue-200'
                                  : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              }`}
                            >
                              {item.role}
                            </span>
                            <span className="text-[11px] text-slate-500 font-mono">
                              Đầu {item.number[0]} · Đuôi {item.number[1]}
                            </span>
                          </div>

                          <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-extrabold font-mono tabular-nums text-slate-900">
                              {item.number}
                            </span>
                            <span className="text-xs text-slate-500">
                              (Song thủ lót:{' '}
                              <span className="font-mono font-semibold text-slate-700">
                                {item.reverseNumber}
                              </span>
                              )
                            </span>
                          </div>

                          <div className="text-xs text-slate-600 mt-1 flex items-center gap-1.5 flex-wrap">
                            {item.bridgesCount > 0 && (
                              <span className="font-medium text-indigo-700 bg-indigo-50 px-1.5 py-0.2 rounded border border-indigo-200">
                                {item.bridgesCount} đường cầu thông
                              </span>
                            )}
                            <span>{item.reasons[0]}</span>
                          </div>
                        </div>
                      </div>

                      {/* Probability badge */}
                      <div className="text-right shrink-0">
                        <div
                          className={`text-xl font-black font-mono tabular-nums ${
                            isRank1
                              ? 'text-amber-600'
                              : isRank2
                              ? 'text-blue-600'
                              : 'text-emerald-600'
                          }`}
                        >
                          {item.probability}%
                        </div>
                        <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                          Độ tin cậy
                        </div>
                      </div>
                    </div>

                    {/* Statistical Micro-Metrics Bar */}
                    {item.stats && (
                      <div className="mt-2.5 pt-2 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-[10px] font-medium text-slate-600 bg-slate-50/80 p-2 rounded-lg">
                        <div className="flex items-center gap-1">
                          <Activity className="w-3 h-3 text-slate-400" />
                          <span>Z-Score:</span>
                          <span
                            className={`font-mono font-bold ${
                              item.stats.zScore >= 0 ? 'text-emerald-700' : 'text-slate-700'
                            }`}
                          >
                            {item.stats.zScore >= 0 ? `+${item.stats.zScore}` : item.stats.zScore}
                          </span>
                        </div>
                        <div>
                          <span>Nhịp chưa ra: </span>
                          <span className="font-mono font-bold text-slate-800">
                            {item.stats.currentGap} ngày
                          </span>
                        </div>
                        <div>
                          <span>Tần suất 30 kỳ: </span>
                          <span className="font-mono font-bold text-slate-800">
                            {item.stats.occurrences30Days} lần
                          </span>
                        </div>
                        <div>
                          <span>Cầu vị trí: </span>
                          <span className="font-mono font-bold text-indigo-700">
                            {item.stats.bridgeStreak > 0 ? `${item.stats.bridgeStreak} kỳ` : 'Tự do'}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Algorithm mini score bars */}
                    <div className="mt-2 pt-2 border-t border-slate-100 grid grid-cols-4 gap-2 text-[11px] text-slate-600">
                      <div>
                        <div className="flex justify-between text-[10px] text-slate-400">
                          <span>Pascal</span>
                          <span className="font-mono">{item.breakdown.pascalScore}%</span>
                        </div>
                        <div className="h-1 bg-slate-100 rounded-full overflow-hidden mt-0.5">
                          <div
                            className="h-full bg-emerald-500 rounded-full"
                            style={{ width: `${item.breakdown.pascalScore}%` }}
                          />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-[10px] text-slate-400">
                          <span>Bạc Nhớ</span>
                          <span className="font-mono">{item.breakdown.bacNhoScore}%</span>
                        </div>
                        <div className="h-1 bg-slate-100 rounded-full overflow-hidden mt-0.5">
                          <div
                            className="h-full bg-blue-500 rounded-full"
                            style={{ width: `${item.breakdown.bacNhoScore}%` }}
                          />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-[10px] text-slate-400">
                          <span>Cầu Ghép</span>
                          <span className="font-mono">{item.breakdown.cauGhepScore}%</span>
                        </div>
                        <div className="h-1 bg-slate-100 rounded-full overflow-hidden mt-0.5">
                          <div
                            className="h-full bg-purple-500 rounded-full"
                            style={{ width: `${item.breakdown.cauGhepScore}%` }}
                          />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-[10px] text-slate-400">
                          <span>Nhịp/Rơi</span>
                          <span className="font-mono">{item.breakdown.frequencyScore}%</span>
                        </div>
                        <div className="h-1 bg-slate-100 rounded-full overflow-hidden mt-0.5">
                          <div
                            className="h-full bg-amber-500 rounded-full"
                            style={{ width: `${item.breakdown.frequencyScore}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* COLUMN 2: TOP 3 DỰ ĐOÁN 3 SỐ CUỐI (3 CÀNG) */}
          <div className="bg-slate-50/70 border border-slate-200 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-md bg-indigo-500/10 text-indigo-600 flex items-center justify-center font-bold text-sm">
                  3D
                </span>
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    Top 3 Dự Đoán 3 Số Cuối (3 Càng)
                  </h2>
                  <p className="text-xs text-slate-500">
                    Ghép Càng (Hàng Trăm) + Đuôi Xác Suất Cao
                  </p>
                </div>
              </div>
              <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded">
                Đề 3 Càng GĐB
              </span>
            </div>

            {/* List of 3 items */}
            <div className="space-y-3">
              {prediction.top3ThreeDigits.map((item) => {
                const isRank1 = item.rank === 1;
                return (
                  <div
                    key={item.number}
                    className={`p-4 rounded-xl border transition-all ${
                      isRank1
                        ? 'bg-gradient-to-r from-indigo-50/90 via-white to-indigo-50/40 border-indigo-300 shadow-sm'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-lg flex items-center justify-center font-black text-sm shrink-0 ${
                            item.rank === 1
                              ? 'bg-indigo-600 text-white shadow'
                              : item.rank === 2
                              ? 'bg-slate-700 text-white'
                              : 'bg-indigo-800/80 text-white'
                          }`}
                        >
                          #{item.rank}
                        </div>
                        <div>
                          <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-extrabold font-mono tabular-nums text-slate-900 tracking-wider">
                              <span className="text-indigo-600 underline decoration-indigo-300 underline-offset-4">
                                {item.hundredDigit}
                              </span>
                              {item.twoDigitTail}
                            </span>
                            <span className="text-xs text-slate-500">
                              (Càng{' '}
                              <span className="font-semibold text-indigo-700 font-mono">
                                {item.hundredDigit}
                              </span>{' '}
                              + Đuôi{' '}
                              <span className="font-semibold text-slate-800 font-mono">
                                {item.twoDigitTail}
                              </span>
                              )
                            </span>
                          </div>
                          <div className="text-xs text-slate-500 mt-1">
                            <span className="font-medium text-slate-700">
                              {item.derivationMethod}:
                            </span>{' '}
                            {item.reason}
                          </div>
                        </div>
                      </div>

                      {/* Probability badge */}
                      <div className="text-right shrink-0">
                        <div
                          className={`text-xl font-black font-mono tabular-nums ${
                            isRank1 ? 'text-indigo-600' : 'text-slate-800'
                          }`}
                        >
                          {item.probability}%
                        </div>
                        <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                          Tỉ lệ nổ 3 càng
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
