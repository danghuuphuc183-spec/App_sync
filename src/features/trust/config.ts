/**
 * ĐIỂM UY TÍN (UT) — THANG 0–10. Nơi duy nhất chứa cấu hình uy tín, phạt huỷ kèo & gói bù.
 * Thay hẳn hệ TS 0–150 cũ (D22, 12/11/2026). Không còn cọc điểm.
 *
 * Mức:
 *  - 0–4,5  Uy tín thấp   → không được tạo kèo, chỉ tham gia kèo nhóm
 *  - 5–6,5  Hạn chế       → tạo tối đa 1 kèo / ngày
 *  - 7–8,5  Cần chú ý     → tạo tối đa 2 kèo / ngày   (mọi tài khoản mới bắt đầu ở 7)
 *  - 9–10   Uy tín cao    → tạo tối đa 3 kèo / ngày
 * "Ngày" tính theo lịch: 00:00 hôm nay → 00:00 hôm sau. Kèo đã tạo rồi huỷ vẫn tính vào hạn mức.
 */

export type UtBand = "low" | "limited" | "watch" | "high";

export interface UtBandConfig {
  nameVi: string;
  min: number;
  /** số kèo được TẠO mỗi ngày lịch */
  dailyKeoLimit: number;
  descriptionVi: string;
}

export const UT_CONFIG = {
  MIN: 0,
  MAX: 10,
  INITIAL: 7,
  STEP: 0.25,

  BANDS: {
    low: { nameVi: "Uy tín thấp", min: 0, dailyKeoLimit: 0, descriptionVi: "0–4,5 UT. Không tạo kèo, chỉ tham gia kèo nhóm." },
    limited: { nameVi: "Hạn chế", min: 5, dailyKeoLimit: 1, descriptionVi: "5–6,5 UT. Tạo tối đa 1 kèo mỗi ngày." },
    watch: { nameVi: "Cần chú ý", min: 7, dailyKeoLimit: 2, descriptionVi: "7–8,5 UT. Tạo tối đa 2 kèo mỗi ngày." },
    high: { nameVi: "Uy tín cao", min: 9, dailyKeoLimit: 3, descriptionVi: "9–10 UT. Tạo tối đa 3 kèo mỗi ngày." },
  } as const satisfies Record<UtBand, UtBandConfig>,

  /** Mức phạt (đã chốt kèo). Mỗi người chỉ bị phạt 1 lần / kèo — lấy mức nặng nhất. */
  PENALTY: {
    CANCEL_EARLY: -0.25, // huỷ trước giờ tập hơn 30 phút
    CANCEL_LATE: -0.5, // huỷ trong vòng 30 phút trước giờ tập
    UNCONFIRMED: -0.5, // không xác nhận lần cuối trước T−30 → kèo tự huỷ
    LATE_15_25: -0.25, // đến trễ 15–25 phút
    ABSENT_DECLARED: -1, // vắng có báo trong 24h sau giờ tập, hoặc trễ quá 25 phút
    ABSENT_SILENT: -1.5, // vắng im lặng
    MUTUAL_OVER_QUOTA: -0.25, // cùng đồng ý huỷ nhưng đã hết 4 lần/tháng
  },

  /** Mốc thời gian (phút) */
  TIME: {
    CANCEL_LATE_WINDOW_MIN: 30,
    LATE_GRACE_MIN: 15, // ≤ 15 phút: không phạt
    LATE_ABSENT_MIN: 25, // > 25 phút: tính là vắng
    DECLARE_ABSENCE_HOURS: 24,
    CONFIRM_OPENS_AFTER_LOCK_MIN: 120,
    CONFIRM_DEADLINE_BEFORE_MIN: 30,
    MINOR_SHIFT_MAX_MIN: 10, // dời giờ ≤ 10 phút khi cả hai đồng ý: không phạt
  },

  /** Phục hồi */
  RECOVERY: {
    ON_TIME: 0.5, // mỗi buổi đúng hẹn
    MAX_PER_DAY: 0.5, // tối đa 1 lần / ngày
    MAX_PER_WEEK: 1, // tối đa +1 UT / tuần
  },

  /** Điểm chỉ tính trên các sự kiện trong 90 ngày gần nhất → người bùng đều đặn không "gỡ" được */
  WINDOW_DAYS: 90,

  MUTUAL_CANCEL_PER_MONTH: 4,
  GRACE_PASSES_PER_MONTH: 1, // thẻ ân hạn: xoá 1 lần phạt / tháng, không cần giải thích (trừ vắng im lặng)
  APOLOGY: { REDUCE_BY: 0.5, PER_MONTH: 1 }, // xin lỗi được chấp nhận: giảm 0,5 mức phạt (không áp dụng vắng im lặng)

  HOST: {
    /** huỷ rồi tạo lại kèo gần giống trong 2h để "đá" người đã nhận → tính là huỷ muộn */
    RECREATE_WINDOW_MIN: 120,
    RECREATE_TIME_DIFF_MIN: 60,
    RECREATE_DISTANCE_KM: 1,
    /** đổi địa điểm xa hơn mức này là thay đổi lớn, cần người kia đồng ý */
    MAJOR_MOVE_KM: 1,
    /** host vắng kèo nhóm 2 lần / 30 ngày → mất quyền tạo kèo nhóm 7 ngày */
    GROUP_ABSENT_LIMIT: 2,
    GROUP_ABSENT_LOOKBACK_DAYS: 30,
    GROUP_BAN_DAYS: 7,
  },

  /** Người mới: ít hơn N buổi đúng hẹn. Không xếp chung kèo nhóm với người uy tín thấp. */
  NEWBIE_MAX_SESSIONS: 3,
  NEWBIE_GROUP_MIN_UT: 7,

  /** Gói bù cho người đã đến (Xu lấy từ quỹ thưởng, KHÔNG lấy từ người vắng) */
  COMPENSATION: {
    XU_PER_FLAKE: 5,
    XU_MAX_PER_MONTH: 30,
    SAME_PAIR_COOLDOWN_DAYS: 30,
    STREAK_PROTECT_PER_MONTH: 2,
    SOLO_SESSION_MIN: 30,
    SOLO_SESSION_XU: 10,
  },

  /** Phạt KHÔNG chuyển cho ai: không thưởng cho reviewer, người báo cáo hay đối phương từ điểm phạt */
  PENALTY_POLICY: {
    creditsOtherUsers: false,
    reviewerRewardFromPenalty: 0,
  },

  /** Bất khả kháng (mưa dông có cảnh báo, địa điểm đóng cửa, app lỗi): không trừ ai */
  WEATHER_CHANGE_PENALTY: 0,
} as const;

export const clampUt = (n: number) => Math.max(UT_CONFIG.MIN, Math.min(UT_CONFIG.MAX, Math.round(n * 100) / 100));

export function getUtBand(score: number): UtBand {
  const s = clampUt(score);
  if (s < UT_CONFIG.BANDS.limited.min) return "low";
  if (s < UT_CONFIG.BANDS.watch.min) return "limited";
  if (s < UT_CONFIG.BANDS.high.min) return "watch";
  return "high";
}

export const getUtBandNameVi = (band: UtBand) => UT_CONFIG.BANDS[band].nameVi;

/** 7.5 → "7,5" ; -0.25 → "−0,25" */
export function formatUt(n: number, opts: { sign?: boolean } = {}) {
  const abs = Math.abs(Math.round(n * 100) / 100);
  const body = String(abs).replace(".", ","); // nhanh hơn toLocaleString, dùng trong vòng lặp ghép đôi
  if (n < 0) return `−${body}`;
  return opts.sign && n > 0 ? `+${body}` : body;
}

/** Quy đổi điểm TS cũ (0–150) của dữ liệu mẫu sang UT (0–10), làm tròn 0,5 */
export const legacyTsToUt = (ts: number) => clampUt(Math.round((ts / 15) * 2) / 2);
