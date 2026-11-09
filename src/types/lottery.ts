/**
 * Type definitions for Vietnamese Northern Lottery (XSMB - Xổ số Miền Bắc)
 */

export interface XSMBDraw {
  id: string;
  date: string; // YYYY-MM-DD
  dayOfWeek: string; // Thứ Hai, Thứ Ba, ...
  province: string; // Hà Nội, Quảng Ninh, Bắc Ninh, Hải Phòng, Nam Định, Thái Bình
  prizes: {
    db: string; // Giải Đặc Biệt (5 digits, e.g. "58924")
    g1: string; // Giải Nhất (5 digits)
    g2: string[]; // Giải Nhì (2 prizes, 5 digits)
    g3: string[]; // Giải Ba (6 prizes, 5 digits)
    g4: string[]; // Giải Tư (4 prizes, 4 digits)
    g5: string[]; // Giải Năm (6 prizes, 4 digits)
    g6: string[]; // Giải Sáu (3 prizes, 3 digits)
    g7: string[]; // Giải Bảy (4 prizes, 2 digits)
  };
  // Pre-calculated extraction
  allPrizesList: string[]; // Flat array of all 27 prize numbers
  loTo2D: string[]; // 27 two-digit tails (00-99)
  de2D: string; // 2-digit tail of Giải Đặc Biệt (e.g. "24")
  de3D: string; // 3-digit tail of Giải Đặc Biệt (e.g. "924")
}

export interface PascalStep {
  row: string;
}

export interface PascalResult {
  combinedNumber: string; // GĐB + G1 (10 digits)
  steps: string[]; // Each pyramid row down to 2 digits
  pair: [string, string]; // e.g. ["68", "86"]
  primaryScore: number;
}

export interface BacNhoCandidate {
  number: string;
  count: number;
  probability: number;
  reason: string;
}

export interface CauGhepBridge {
  id: string;
  pos1Name: string;
  pos2Name: string;
  pos1Index: number;
  pos2Index: number;
  number: string;
  streakDays: number; // thông mấy ngày (e.g. 3, 4, 5)
  reliabilityScore: number;
}

export interface FrequencyStat {
  number: string;
  occurrences30Days: number;
  currentGap: number; // Số ngày chưa ra (gan)
  maxGapHistory: number; // Gan cực đại
  isLotoRoi: boolean; // Có phải lô rơi từ hôm trước không
  trend: 'hot' | 'normal' | 'cold' | 'gan';
  score: number;
}

export interface StatisticalMetrics {
  zScore: number; // Điểm chuẩn Z-Score tần suất so với kỳ vọng
  currentGap: number; // Số ngày chưa ra (nhịp rơi)
  occurrences30Days: number; // Tần suất 30 kỳ gần nhất
  poissonExpected: number; // Kỳ vọng xuất hiện Poisson
  bayesianProb: number; // Xác suất hậu nghiệm Bayes (%)
  bridgeStreak: number; // Độ dài đường cầu đang thông (ngày)
}

export interface TwoDigitPrediction {
  rank: 1 | 2 | 3;
  number: string; // e.g. "04"
  reverseNumber: string; // e.g. "40"
  probability: number; // e.g. 79.6%
  role: 'Bạch Thủ Chủ Lực' | 'Song Thủ Cầu Thông' | 'Điểm Rơi Nhịp Vàng';
  stats: StatisticalMetrics;
  breakdown: {
    pascalScore: number;
    bacNhoScore: number;
    cauGhepScore: number;
    frequencyScore: number;
  };
  reasons: string[];
  bridgesCount: number;
}

export interface PortfolioMetrics {
  combinedProbability: number; // Xác suất nổ ít nhất 1 số trong tổ hợp 3 số (e.g. 92.4%)
  portfolioName: string; // e.g. "Tổ Hợp Tam Thủ Vàng (04 - 75 - 84)"
  headCoverage: string[]; // Các đầu số được bao phủ (e.g. ["Đầu 0", "Đầu 7", "Đầu 8"])
  coverageRatio: number; // Tỉ lệ bao phủ không gian mẫu (%)
  synergyScore: number; // Điểm hiệp đồng phân bổ rủi ro (0-100)
}

export interface ThreeDigitPrediction {
  rank: 1 | 2 | 3;
  number: string; // e.g. "368"
  twoDigitTail: string; // "68"
  hundredDigit: string; // "3"
  probability: number; // e.g. 42.8%
  reason: string;
  derivationMethod: string; // e.g. "Càng bóng ngũ hành + Tổng GĐB"
}

export interface SpecialDePrediction {
  bachThuDe: string;
  bachThuDeRev: string;
  tamThuDe: string[];
  chamDe: string[];
  tongDe: string[];
  deProbability: number;
  reason: string;
}

export interface PredictionResult {
  targetDate: string; // Ngày dự đoán (e.g. 2026-10-28)
  basedOnDate: string; // Ngày kết quả gốc (e.g. 2026-10-27)
  top3TwoDigits: TwoDigitPrediction[];
  top3ThreeDigits: ThreeDigitPrediction[];
  specialDe?: SpecialDePrediction;
  portfolioMetrics: PortfolioMetrics;
  pascalData: PascalResult;
  topBridges: CauGhepBridge[];
  bacNhoTop: BacNhoCandidate[];
  algorithmWeights: {
    pascal: number;
    bacNho: number;
    cauGhep: number;
    frequency: number;
  };
  evaluation?: {
    isActualResultKnown: boolean;
    actualDe2D?: string;
    actualDe3D?: string;
    actualLoTo2D?: string[];
    hitTwoDigits: boolean;
    hitTwoDigitsRank?: number;
    hitThreeDigits: boolean;
    hitThreeDigitsRank?: number;
    hitSpecialDe?: boolean;
  };
}
