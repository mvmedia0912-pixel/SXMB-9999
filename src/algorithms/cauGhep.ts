import { CauGhepBridge, XSMBDraw } from '../types/lottery.ts';

// Position descriptors for XSMB 107 prize digits
interface PositionInfo {
  index: number;
  name: string; // e.g. "Giải ĐB số thứ 1", "Giải Nhất số cuối", "Giải 7.1 số thứ 2"
}

export function buildPositionNames(): PositionInfo[] {
  const positions: PositionInfo[] = [];
  let idx = 0;

  // GĐB (5 digits)
  for (let i = 1; i <= 5; i++) {
    positions.push({ index: idx++, name: `G.Đặc Biệt [vị trí ${i}]` });
  }
  // G1 (5 digits)
  for (let i = 1; i <= 5; i++) {
    positions.push({ index: idx++, name: `Giải Nhất [vị trí ${i}]` });
  }
  // G2 (2 prizes * 5 digits)
  for (let p = 1; p <= 2; p++) {
    for (let i = 1; i <= 5; i++) {
      positions.push({ index: idx++, name: `Giải Nhì.${p} [vị trí ${i}]` });
    }
  }
  // G3 (6 prizes * 5 digits)
  for (let p = 1; p <= 6; p++) {
    for (let i = 1; i <= 5; i++) {
      positions.push({ index: idx++, name: `Giải Ba.${p} [vị trí ${i}]` });
    }
  }
  // G4 (4 prizes * 4 digits)
  for (let p = 1; p <= 4; p++) {
    for (let i = 1; i <= 4; i++) {
      positions.push({ index: idx++, name: `Giải Tư.${p} [vị trí ${i}]` });
    }
  }
  // G5 (6 prizes * 4 digits)
  for (let p = 1; p <= 6; p++) {
    for (let i = 1; i <= 4; i++) {
      positions.push({ index: idx++, name: `Giải Năm.${p} [vị trí ${i}]` });
    }
  }
  // G6 (3 prizes * 3 digits)
  for (let p = 1; p <= 3; p++) {
    for (let i = 1; i <= 3; i++) {
      positions.push({ index: idx++, name: `Giải Sáu.${p} [vị trí ${i}]` });
    }
  }
  // G7 (4 prizes * 2 digits)
  for (let p = 1; p <= 4; p++) {
    for (let i = 1; i <= 2; i++) {
      positions.push({ index: idx++, name: `Giải Bảy.${p} [vị trí ${i}]` });
    }
  }

  return positions;
}

export const ALL_POSITIONS = buildPositionNames();

export function extractAllDigits(draw: XSMBDraw): string[] {
  const digits: string[] = [];
  draw.allPrizesList.forEach((prizeStr) => {
    for (const char of prizeStr) {
      if (/\d/.test(char)) {
        digits.push(char);
      }
    }
  });
  return digits;
}

/**
 * Quét cầu ghép giải:
 * Tìm các cặp vị trí (pos1, pos2) có lịch sử thông liên tục 3, 4, 5 ngày gần nhất.
 * Dùng cặp vị trí đó ở ngày hiện tại để tạo ra số dự đoán cho ngày tiếp theo.
 */
export function calculateCauGhep(
  currentDraw: XSMBDraw,
  history: XSMBDraw[]
): CauGhepBridge[] {
  // Sort history newest to oldest
  const sorted = [...history].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // Find index of currentDraw
  const currentIndex = sorted.findIndex((d) => d.id === currentDraw.id);
  if (currentIndex === -1 || sorted.length - currentIndex < 4) {
    return [];
  }

  // Pre-extract digits for the last 6 draws
  const availableDraws = sorted.slice(currentIndex, currentIndex + 6);
  const digitsPerDraw = availableDraws.map((d) => extractAllDigits(d));

  const validBridges: CauGhepBridge[] = [];

  // Key strategic positions to sample for high performance and high accuracy
  // (e.g. GDB đầu/cuối, G1 đầu/cuối, G2, G3, G7)
  const sampledIndices = [
    0, 1, 2, 3, 4, // GDB
    5, 6, 7, 8, 9, // G1
    10, 14, 15, 19, // G2
    20, 24, 25, 29, 30, 34, // G3
    50, 53, 54, 57, // G4
    66, 69, 70, 73, // G5
    90, 92, 93, 95, // G6
    99, 100, 101, 102, 103, 104, 105, 106, // G7
  ];

  for (let i = 0; i < sampledIndices.length; i++) {
    for (let j = i + 1; j < sampledIndices.length; j++) {
      const p1 = sampledIndices[i];
      const p2 = sampledIndices[j];

      // Check streak (số ngày thông liên tiếp)
      let streak = 0;

      for (let dayOffset = 0; dayOffset < availableDraws.length - 1; dayOffset++) {
        const sourceDigits = digitsPerDraw[dayOffset + 1]; // Hôm trước
        const targetDraw = availableDraws[dayOffset]; // Hôm sau (đã có kết quả)

        if (!sourceDigits || sourceDigits.length <= Math.max(p1, p2)) break;

        const d1 = sourceDigits[p1];
        const d2 = sourceDigits[p2];
        const candidate1 = `${d1}${d2}`;
        const candidate2 = `${d2}${d1}`;

        // Kiểm tra xem số này có nổ trong kết quả lô tô của ngày hôm sau không
        const targetLoTo = targetDraw.loTo2D;
        if (targetLoTo.includes(candidate1) || targetLoTo.includes(candidate2)) {
          streak++;
        } else {
          break; // Đứt cầu
        }
      }

      // Nếu cầu thông từ 3 ngày trở lên
      if (streak >= 3) {
        const todayDigits = digitsPerDraw[0];
        if (todayDigits && todayDigits.length > Math.max(p1, p2)) {
          const predNumber = `${todayDigits[p1]}${todayDigits[p2]}`;
          const pos1Info = ALL_POSITIONS[p1] || { name: `Vị trí ${p1}` };
          const pos2Info = ALL_POSITIONS[p2] || { name: `Vị trí ${p2}` };

          validBridges.push({
            id: `bridge-${p1}-${p2}`,
            pos1Name: pos1Info.name,
            pos2Name: pos2Info.name,
            pos1Index: p1,
            pos2Index: p2,
            number: predNumber,
            streakDays: streak,
            reliabilityScore: Math.min(95, 65 + streak * 8),
          });
        }
      }
    }
  }

  // Sort by highest streak and reliability
  validBridges.sort((a, b) => {
    if (b.streakDays !== a.streakDays) return b.streakDays - a.streakDays;
    return b.reliabilityScore - a.reliabilityScore;
  });

  return validBridges.slice(0, 20);
}
