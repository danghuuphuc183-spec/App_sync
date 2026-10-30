/**
 * ĐÂY LÀ NƠI DUY NHẤT CHỨA TOÀN BỘ CẤU HÌNH NGHIỆP VỤ TRUST SCORE, HẠNG & THƯỞNG PHẠT.
 * Tuân thủ Quy tắc Dự án số 10 (Single Source of Truth).
 */

export type SportTier = "bronze" | "silver" | "gold" | "diamond";

export interface TierConfig {
  nameVi: string;
  minScore: number;
  maxScore: number;
  descriptionVi: string;
}

export const TRUST_CONFIG = {
  MIN_SCORE: 0,
  MAX_SCORE: 150,
  INITIAL_SCORE: 100, // Khởi điểm 100 (= Vàng)

  // Ngưỡng điểm xếp hạng
  TIERS: {
    bronze: {
      nameVi: "Đồng",
      minScore: 0,
      maxScore: 59,
      descriptionVi: "Dưới 60 TS. Khóa tạo kèo 7 ngày, chỉ nhận kèo cơ bản, cọc điểm gấp đôi.",
    },
    silver: {
      nameVi: "Bạc",
      minScore: 60,
      maxScore: 99,
      descriptionVi: "60-99 TS. Tối đa 2 kèo mở cùng lúc.",
    },
    gold: {
      nameVi: "Vàng",
      minScore: 100,
      maxScore: 129,
      descriptionVi: "100-129 TS. Kỷ luật tiêu chuẩn, mở khóa tạo & nhận kèo thông thường.",
    },
    diamond: {
      nameVi: "Kim Cương",
      minScore: 130,
      maxScore: 150,
      descriptionVi: "130-150 TS. Được đăng ký làm Mentor dẫn dắt Tân binh.",
    },
  } as const satisfies Record<SportTier, TierConfig>,

  // Điểm cọc cho phép (Hold)
  STAKE: {
    MIN: 10,
    MAX: 100,
    BRONZE_MULTIPLIER: 2, // Hạng Đồng phải cọc gấp đôi
  },

  // Biến động điểm thưởng / phạt
  DELTAS: {
    COMPLETED_ON_TIME: 2, // +2 TS
    LATE_5_TO_15_MIN: -5, // -5 TS
    CANCEL_OVER_2H: -3, // -3 TS (hoặc 0 nếu dùng grace pass)
    CANCEL_UNDER_2H: -15, // -15 TS
    NO_SHOW_OR_OVER_15_MIN: -30, // -30 TS
  },

  // Thẻ ân hạn
  GRACE_PASSES_PER_MONTH: 2,

  // Ngưỡng thời gian hủy kèo trước giờ hẹn
  CANCEL_DEADLINE_HOURS: 2,
} as const;

/**
 * Tính toán Hạng từ Điểm Uy Tín (TS).
 * Biên chuẩn: 59 -> Đồng, 60 -> Bạc, 99 -> Bạc, 100 -> Vàng, 129 -> Vàng, 130 -> Kim Cương, 150 -> Kim Cương.
 */
export function getTierFromScore(score: number): SportTier {
  const clamped = Math.max(TRUST_CONFIG.MIN_SCORE, Math.min(score, TRUST_CONFIG.MAX_SCORE));
  if (clamped < 60) return "bronze";
  if (clamped < 100) return "silver";
  if (clamped < 130) return "gold";
  return "diamond";
}

/**
 * Lấy nhãn tiếng Việt của hạng
 */
export function getTierNameVi(tier: SportTier): string {
  return TRUST_CONFIG.TIERS[tier].nameVi;
}
