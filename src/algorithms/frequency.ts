import { FrequencyStat, XSMBDraw } from '../types/lottery.ts';

/**
 * Phân tích tần suất xuất hiện, chu kỳ nhịp, lô rơi và lô gan
 */
export function calculateFrequencyStats(
  currentDraw: XSMBDraw,
  history: XSMBDraw[]
): Map<string, FrequencyStat> {
  const sorted = [...history].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const currentIndex = sorted.findIndex((d) => d.id === currentDraw.id);
  const relevantHistory = sorted.slice(currentIndex);

  const statsMap = new Map<string, FrequencyStat>();

  // Initialize for all 100 numbers (00 -> 99)
  for (let i = 0; i < 100; i++) {
    const num = i.toString().padStart(2, '0');
    statsMap.set(num, {
      number: num,
      occurrences30Days: 0,
      currentGap: 0,
      maxGapHistory: 0,
      isLotoRoi: false,
      trend: 'normal',
      score: 50,
    });
  }

  // 1. Check Lô rơi from currentDraw (GĐB và G1)
  const currentDe = currentDraw.de2D;
  const currentG1Tail = currentDraw.prizes.g1.slice(-2);
  const lotoRoiCandidates = new Set([
    currentDe,
    currentDe.split('').reverse().join(''),
    currentG1Tail,
    currentG1Tail.split('').reverse().join(''),
  ]);

  // 2. Count occurrences and current gap in the past 30 draws
  const draws30 = relevantHistory.slice(0, 30);

  // Track current gap for each number
  for (let i = 0; i < 100; i++) {
    const num = i.toString().padStart(2, '0');
    let gap = 0;
    let found = false;

    for (let dIdx = 0; dIdx < relevantHistory.length; dIdx++) {
      const d = relevantHistory[dIdx];
      if (d.loTo2D.includes(num)) {
        found = true;
        break;
      }
      gap++;
    }

    const stat = statsMap.get(num)!;
    stat.currentGap = found ? gap : relevantHistory.length;
    stat.isLotoRoi = lotoRoiCandidates.has(num);
  }

  // Count 30-day occurrences
  draws30.forEach((draw) => {
    // Unique in single draw or all occurrences
    const uniqueInDraw = new Set(draw.loTo2D);
    uniqueInDraw.forEach((num) => {
      const stat = statsMap.get(num);
      if (stat) {
        stat.occurrences30Days++;
      }
    });
  });

  // Calculate trends and scores
  for (let i = 0; i < 100; i++) {
    const num = i.toString().padStart(2, '0');
    const stat = statsMap.get(num)!;

    // Trend classification
    if (stat.currentGap >= 12) {
      stat.trend = 'gan';
      // Lô gan dài thường có xác suất thấp hơn trừ khi đạt điểm rơi
      stat.score = Math.max(25, 60 - stat.currentGap * 2);
    } else if (stat.occurrences30Days >= 11) {
      stat.trend = 'hot';
      // Lô về nhiều trong nhịp đẹp
      stat.score = Math.min(92, 70 + stat.occurrences30Days * 2);
    } else if (stat.occurrences30Days <= 2 && stat.currentGap >= 7) {
      stat.trend = 'cold';
      stat.score = 40;
    } else {
      stat.trend = 'normal';
      // Nhịp đều: xuất hiện 6-10 lần, gap 1-3 ngày là nhịp vàng
      if (stat.currentGap >= 1 && stat.currentGap <= 3 && stat.occurrences30Days >= 7) {
        stat.score = 82; // Nhịp vàng điểm rơi
      } else {
        stat.score = 55 + stat.occurrences30Days;
      }
    }

    // Boost if Lô rơi
    if (stat.isLotoRoi) {
      stat.score += 8;
    }
  }

  return statsMap;
}
