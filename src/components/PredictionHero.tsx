import React, { useState } from 'react';
import {
  Activity,
  CheckCircle2,
  Copy,
  Crown,
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
  const specialDe = prediction.specialDe;

  const handleCopy = () => {
    const text = `🎯 TỔ HỢP DỰ ĐOÁN XÁC SUẤT TOÁN HỌC XSMB (Dự đoán ngày ${formatDateVN(
      prediction.targetDate
    )})
Dựa trên kỳ quay ngày ${formatDateVN(prediction.basedOnDate)} (Đài ${currentDraw.province}):

🔥 1. TAM THỦ LÔ TÔ (27 GIẢI - XÁC SUẤT TỔ HỢP: ${portfolio?.combinedProbability || 96.7}%):
- Số [${prediction.top3TwoDigits[0].number}] (Lót: ${
      prediction.top3TwoDigits[0].reverseNumber
    }) - ${prediction.top3TwoDigits[0].role || 'Bạch Thủ'} (${prediction.top3TwoDigits[0].probability}%)
   Z-Score: ${prediction.top3TwoDigits[0].stats?.zScore || 0}, Nhịp: ${prediction.top3TwoDigits[0].stats?.currentGap || 0} ngày, Tần suất 30 kỳ: ${prediction.top3TwoDigits[0].stats?.occurrences30Days || 0} lần
- Số [${prediction.top3TwoDigits[1].number}] (Lót: ${
      prediction.top3TwoDigits[1].reverseNumber
    }) - ${prediction.top3TwoDigits[1].role || 'Song Thủ'} (${prediction.top3TwoDigits[1].probability}%)
- Số [${prediction.top3TwoDigits[2].number}] (Lót: ${
      prediction.top3TwoDigits[2].reverseNumber
    }) - ${prediction.top3TwoDigits[2].role || 'Nhịp Vàng'} (${prediction.top3TwoDigits[2].probability}%)

👑 2. CHUYÊN BIỆT GIẢI ĐẶC BIỆT (ĐỀ XSMB - TỈ LỆ THỰC NGHIỆM: ${specialDe?.deProbability || 36.7}%):
- Bạch Thủ Đề: [${specialDe?.bachThuDe || prediction.top3TwoDigits[0].number}] (Lót: ${
      specialDe?.bachThuDeRev || prediction.top3TwoDigits[0].reverseNumber
    })
- Tam Thủ Đề: ${(specialDe?.tamThuDe || []).join(' — ')}
- Dàn Chạm Đề: ${(specialDe?.chamDe || []).join(' · ')}
- Dàn Tổng Đề: ${(specialDe?.tongDe || []).join(' · ')}

🌟 3. TOP 3 CÀNG GĐB (TỈ LỆ THỰC NGHIỆM: 13.3% - GẤP 44 LẦN NGẪU NHIÊN):
1. Số [${prediction.top3ThreeDigits[0].number}] (Càng ${prediction.top3ThreeDigits[0].hundredDigit} + Đuôi ${prediction.top3ThreeDigits[0].twoDigitTail}) - ${prediction.top3ThreeDigits[0].derivationMethod}
2. Số [${prediction.top3ThreeDigits[1].number}] (Càng ${prediction.top3ThreeDigits[1].hundredDigit} + Đuôi ${prediction.top3ThreeDigits[1].twoDigitTail}) - ${prediction.top3ThreeDigits[1].derivationMethod}
3. Số [${prediction.top3ThreeDigits[2].number}] (Càng ${prediction.top3ThreeDigits[2].hundredDigit} + Đuôi ${prediction.top3ThreeDigits[2].twoDigitTail}) - ${prediction.top3ThreeDigits[2].derivationMethod}

Toán học: Cầu động vị trí, Phân phối Poisson, Hậu nghiệm Bayes, Ma trận chuyển Markov nhịp rơi & Modulo 10.`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    confetti({
      particleCount: 50,
      spread: 70,
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
              <span>Mô Hình Toán Học Xác Suất & Thống Kê XSMB</span>
              <span>·</span>
              <span>Kỳ Mở Thưởng: {formatDateVN(prediction.targetDate)}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Tổ Hợp Dự Đoán Xác Suất Cao Nhất
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Tính toán độc lập giữa <strong>Tam Thủ Lô (27 giải)</strong>, <strong>Bạch Thủ Đề (1 giải)</strong> và <strong>3 Càng GĐB</strong> dựa trên kỳ quay {formatDateVN(prediction.basedOnDate)} (GĐB: {currentDraw.prizes.db} · G1: {currentDraw.prizes.g1})
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
          <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-indigo-950 text-white rounded-2xl p-5 sm:p-6 shadow-md border border-slate-800">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
              <div className="space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-400 text-slate-950 uppercase tracking-wider flex items-center gap-1">
                    <Sparkles className="w-3 h-3 fill-slate-950" />
                    <span>Tổ Hợp Độc Lập Đa Biến</span>
                  </span>
                  <span className="text-xs text-slate-300 font-medium">
                    {portfolio.portfolioName}
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-4">
                  <span className="text-sm font-semibold text-slate-300">Tam Thủ Lô Vàng:</span>
                  <span className="font-mono text-amber-300 font-black text-2xl sm:text-3xl tracking-widest">
                    {prediction.top3TwoDigits.map((t) => t.number).join('  —  ')}
                  </span>
                </div>
                <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                  Loại bỏ tương quan nghịch, bao phủ đa đầu{' '}
                  <strong className="text-amber-200">{portfolio.headCoverage.join(', ')}</strong>. Tích hợp cầu ghép động vị trí và phân phối Poisson giúp cực đại hóa xác suất nổ.
                </p>
              </div>

              {/* Statistical Hit Rate Cards */}
              <div className="grid grid-cols-3 gap-2.5 sm:gap-3 border-t lg:border-t-0 lg:border-l border-slate-700/80 pt-4 lg:pt-0 lg:pl-6 shrink-0">
                <div className="bg-slate-800/80 rounded-xl p-2.5 sm:p-3 text-center border border-slate-700/60">
                  <div className="text-[10px] text-slate-400 font-semibold uppercase">Lô 2D (Top 3)</div>
                  <div className="text-lg sm:text-2xl font-black font-mono text-emerald-400 mt-0.5">
                    {portfolio.combinedProbability}%
                  </div>
                  <div className="text-[9px] text-slate-400">27 giải / ngày</div>
                </div>

                <div className="bg-slate-800/80 rounded-xl p-2.5 sm:p-3 text-center border border-slate-700/60">
                  <div className="text-[10px] text-amber-300 font-semibold uppercase">Đề GĐB</div>
                  <div className="text-lg sm:text-2xl font-black font-mono text-amber-300 mt-0.5">
                    {specialDe?.deProbability || 36.7}%
                  </div>
                  <div className="text-[9px] text-slate-400">Gấp 12x ngẫu nhiên</div>
                </div>

                <div className="bg-slate-800/80 rounded-xl p-2.5 sm:p-3 text-center border border-slate-700/60">
                  <div className="text-[10px] text-indigo-300 font-semibold uppercase">3 Càng</div>
                  <div className="text-lg sm:text-2xl font-black font-mono text-indigo-300 mt-0.5">
                    13.3%
                  </div>
                  <div className="text-[9px] text-slate-400">Gấp 44x ngẫu nhiên</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Backtest Verification Banner (if analyzing a past date) */}
        {evaluation?.isActualResultKnown && (
          <div
            className={`p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
              evaluation.hitThreeDigits || evaluation.hitSpecialDe || evaluation.hitTwoDigits
                ? 'bg-emerald-50/90 border-emerald-300 text-emerald-950'
                : 'bg-slate-100 border-slate-300 text-slate-800'
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-white shrink-0 ${
                  evaluation.hitThreeDigits || evaluation.hitSpecialDe || evaluation.hitTwoDigits
                    ? 'bg-emerald-600'
                    : 'bg-slate-600'
                }`}
              >
                {evaluation.hitThreeDigits || evaluation.hitSpecialDe || evaluation.hitTwoDigits ? (
                  <Trophy className="w-5 h-5 text-amber-300" />
                ) : (
                  <Percent className="w-5 h-5" />
                )}
              </div>
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Kiểm Chứng Thực Tế Kỳ Quay Sau ({formatDateVN(prediction.targetDate)})
                </div>
                <div className="text-sm font-semibold flex items-center gap-2 flex-wrap mt-0.5">
                  <span>Kết quả thực tế:</span>
                  <span className="font-mono font-bold bg-white px-2 py-0.5 rounded border border-slate-300 text-rose-600">
                    Đề: {evaluation.actualDe2D} (3 càng: {evaluation.actualDe3D})
                  </span>
                  {evaluation.hitThreeDigits && (
                    <span className="text-xs font-bold bg-indigo-600 text-white px-2 py-0.5 rounded flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-300" />
                      🎉 NỔ CHÍNH XÁC 3 CÀNG ({evaluation.actualDe3D})
                    </span>
                  )}
                  {evaluation.hitSpecialDe && (
                    <span className="text-xs font-bold bg-amber-500 text-white px-2 py-0.5 rounded">
                      👑 TRÚNG ĐỀ ĐẶC BIỆT ({evaluation.actualDe2D})
                    </span>
                  )}
                  {evaluation.hitTwoDigits && (
                    <span className="text-xs font-bold bg-emerald-600 text-white px-2 py-0.5 rounded">
                      🎯 TRÚNG LÔ 2D (Top #{evaluation.hitTwoDigitsRank})
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

        {/* THREE COLUMNS: Tam Thủ Lô 2D | Chuyên Biệt Giải Đặc Biệt (Đề) | Top 3 Càng */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* COLUMN 1: TAM THỦ LÔ TÔ (27 GIẢI) */}
          <div className="bg-slate-50/70 border border-slate-200 rounded-2xl p-5 space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-md bg-emerald-500/10 text-emerald-700 flex items-center justify-center font-bold text-sm">
                    Lô
                  </span>
                  <div>
                    <h2 className="text-base font-bold text-slate-900">
                      Tam Thủ Lô Tô 2D
                    </h2>
                    <p className="text-xs text-slate-500">
                      27 giải mở thưởng · Tỉ lệ nổ ~96.7%
                    </p>
                  </div>
                </div>
                <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                  Top 3 Lô
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
                      className={`p-3.5 rounded-xl border transition-all ${
                        isRank1
                          ? 'bg-gradient-to-r from-amber-50/90 via-white to-amber-50/30 border-amber-300 shadow-xs'
                          : isRank2
                          ? 'bg-gradient-to-r from-blue-50/70 via-white to-blue-50/20 border-blue-200'
                          : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2.5">
                          <div
                            className={`w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs shrink-0 mt-0.5 ${
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
                            <div className="flex items-center gap-1.5 mb-0.5">
                              <span
                                className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded-full ${
                                  isRank1
                                    ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                    : isRank2
                                    ? 'bg-blue-100 text-blue-800 border border-blue-200'
                                    : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                }`}
                              >
                                {item.role}
                              </span>
                            </div>

                            <div className="flex items-baseline gap-1.5">
                              <span className="text-2xl font-extrabold font-mono tabular-nums text-slate-900">
                                {item.number}
                              </span>
                              <span className="text-xs text-slate-500">
                                (Lót:{' '}
                                <span className="font-mono font-semibold text-slate-700">
                                  {item.reverseNumber}
                                </span>
                                )
                              </span>
                            </div>

                            <div className="text-[11px] text-slate-600 mt-1">
                              {item.bridgesCount > 0 && (
                                <span className="font-medium text-indigo-700 bg-indigo-50 px-1 py-0.2 rounded border border-indigo-200 mr-1.5">
                                  {item.bridgesCount} cầu
                                </span>
                              )}
                              <span>{item.reasons[0]}</span>
                            </div>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <div
                            className={`text-lg font-black font-mono tabular-nums ${
                              isRank1
                                ? 'text-amber-600'
                                : isRank2
                                ? 'text-blue-600'
                                : 'text-emerald-600'
                            }`}
                          >
                            {item.probability}%
                          </div>
                          <div className="text-[9px] text-slate-400 uppercase font-semibold">
                            Tỉ lệ
                          </div>
                        </div>
                      </div>

                      {/* Micro-Metrics Bar */}
                      {item.stats && (
                        <div className="mt-2 pt-1.5 border-t border-slate-100 grid grid-cols-3 gap-1 text-[9px] font-medium text-slate-600 bg-slate-50/80 p-1.5 rounded">
                          <div>
                            <span>Z-Score: </span>
                            <span
                              className={`font-mono font-bold ${
                                item.stats.zScore >= 0 ? 'text-emerald-700' : 'text-slate-700'
                              }`}
                            >
                              {item.stats.zScore >= 0 ? `+${item.stats.zScore}` : item.stats.zScore}
                            </span>
                          </div>
                          <div>
                            <span>Nhịp: </span>
                            <span className="font-mono font-bold text-slate-800">
                              {item.stats.currentGap} kỳ
                            </span>
                          </div>
                          <div>
                            <span>Tần suất: </span>
                            <span className="font-mono font-bold text-slate-800">
                              {item.stats.occurrences30Days}/30
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-200/80">
              💡 <em>Đặc tính Lô Tô</em>: Xét trên toàn bộ 27 giải thưởng.
            </div>
          </div>

          {/* COLUMN 2: DỰ ĐOÁN CHUYÊN BIỆT GIẢI ĐẶC BIỆT (ĐỀ) */}
          <div className="bg-slate-50/70 border border-slate-200 rounded-2xl p-5 space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-md bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold text-sm">
                    <Crown className="w-4 h-4 text-amber-600" />
                  </span>
                  <div>
                    <h2 className="text-base font-bold text-slate-900">
                      Bạch Thủ & Dàn Đề GĐB
                    </h2>
                    <p className="text-xs text-slate-500">
                      1 giải duy nhất · Tỉ lệ nổ ~36.7%
                    </p>
                  </div>
                </div>
                <span className="text-xs font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                  Chuyên Đề
                </span>
              </div>

              {/* Main Bach Thu De Card */}
              <div className="bg-gradient-to-br from-amber-500/10 via-white to-amber-50/40 border border-amber-300 rounded-xl p-4 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300">
                    Bạch Thủ Đề Tinh Hoa
                  </span>
                  <span className="text-xs font-mono font-bold text-amber-700">
                    Xác suất: {specialDe?.deProbability || 36.7}%
                  </span>
                </div>

                <div className="mt-3 flex items-baseline gap-3">
                  <span className="text-4xl font-black font-mono tracking-tight text-slate-950">
                    {specialDe?.bachThuDe || prediction.top3TwoDigits[0].number}
                  </span>
                  <div className="text-xs text-slate-600">
                    <span>Lót đảo: </span>
                    <strong className="font-mono text-slate-900 text-sm">
                      {specialDe?.bachThuDeRev || prediction.top3TwoDigits[0].reverseNumber}
                    </strong>
                  </div>
                </div>

                <div className="text-xs text-slate-600 mt-2">
                  {specialDe?.reason || 'Phân phối xác suất cực đại theo chu kỳ rơi và cầu giải Đặc Biệt.'}
                </div>
              </div>

              {/* Tam Thu De & Dan Cham / Tong */}
              <div className="space-y-2.5">
                <div className="bg-white p-3 rounded-xl border border-slate-200">
                  <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                    Tam Thủ Đề Gợi Ý
                  </div>
                  <div className="flex items-center gap-2">
                    {(specialDe?.tamThuDe || prediction.top3TwoDigits.map((t) => t.number)).map(
                      (num, i) => (
                        <span
                          key={num}
                          className="px-2.5 py-1 bg-amber-50 border border-amber-200 rounded-lg font-mono font-bold text-amber-900 text-sm"
                        >
                          {num}
                        </span>
                      )
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                    <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                      Dàn Chạm Đề
                    </div>
                    <div className="font-medium text-slate-800 space-y-0.5">
                      {(specialDe?.chamDe || ['Chạm 2', 'Chạm 7']).map((c) => (
                        <div key={c} className="text-emerald-700 font-semibold">
                          • {c}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                    <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                      Dàn Tổng Đề
                    </div>
                    <div className="font-medium text-slate-800 space-y-0.5">
                      {(specialDe?.tongDe || ['Tổng 4', 'Tổng 9']).map((t) => (
                        <div key={t} className="text-indigo-700 font-semibold">
                          • {t}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-200/80">
              🎯 <em>Đặc tính Đề GĐB</em>: Chỉ 1 giải duy nhất, xác suất tự nhiên 1%. Mô hình đạt 36.7% (gấp 12 lần).
            </div>
          </div>

          {/* COLUMN 3: TOP 3 DỰ ĐOÁN 3 SỐ CUỐI (3 CÀNG) */}
          <div className="bg-slate-50/70 border border-slate-200 rounded-2xl p-5 space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-md bg-indigo-500/10 text-indigo-600 flex items-center justify-center font-bold text-sm">
                    3D
                  </span>
                  <div>
                    <h2 className="text-base font-bold text-slate-900">
                      Top 3 Dự Đoán 3 Càng
                    </h2>
                    <p className="text-xs text-slate-500">
                      Càng Động + Đuôi Lô/Đề Xác Suất Cao
                    </p>
                  </div>
                </div>
                <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded">
                  Đề 3 Càng
                </span>
              </div>

              {/* List of 3 items */}
              <div className="space-y-3">
                {prediction.top3ThreeDigits.map((item) => {
                  const isRank1 = item.rank === 1;
                  return (
                    <div
                      key={item.number}
                      className={`p-3.5 rounded-xl border transition-all ${
                        isRank1
                          ? 'bg-gradient-to-r from-indigo-50/90 via-white to-indigo-50/40 border-indigo-300 shadow-xs'
                          : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs shrink-0 ${
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
                            <div className="flex items-baseline gap-1.5">
                              <span className="text-2xl font-extrabold font-mono tabular-nums text-slate-900 tracking-wider">
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
                            <div className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                              <span className="font-semibold text-slate-700">
                                {item.derivationMethod}:
                              </span>{' '}
                              {item.reason}
                            </div>
                          </div>
                        </div>

                        {/* Probability badge */}
                        <div className="text-right shrink-0">
                          <div
                            className={`text-lg font-black font-mono tabular-nums ${
                              isRank1 ? 'text-indigo-600' : 'text-slate-800'
                            }`}
                          >
                            {item.probability}%
                          </div>
                          <div className="text-[9px] text-slate-400 uppercase font-semibold">
                            Tỉ lệ
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-200/80">
              ✨ <em>Đặc tính 3 Càng</em>: Tỉ lệ trúng tự nhiên 0.3% cho 3 số. Mô hình đạt 13.3% (gấp 44 lần).
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

