/**
 * CHUỖI LIÊN TIẾP & THUẬT TOÁN TÍNH EXP / DUO STREAK
 * Chuẩn Master Spec: PHẦN III, MỤC 9. TRUST, REWARDS VÀ FEEDBACK
 *
 * 1. Chuỗi tuần cá nhân (Weekly Streak):
 * - Tuần bắt đầu từ Thứ Hai (00:00) đến Chủ Nhật (23:59:59).
 * - Đạt khi có >= 1 buổi hợp lệ hoặc buổi tự tập có xác thực trong tuần.
 * - Thẻ nghỉ (Streak Freeze): 1 thẻ/tháng mở từ Cấp 2, không cần khai báo lý do.
 * - Bảo vệ chuỗi: Tối đa 2 lần/tháng khi bị đối tác bùng kèo hoặc thời tiết xấu.
 *
 * 2. Chuỗi đôi (Duo Streak):
 * - Mở khóa từ Cấp 2 (Runner - ≥ 6 buổi hợp lệ).
 * - Hai người có từ 3 buổi hợp lệ chung trở lên sẽ kích hoạt Chuỗi Đôi.
 * - Yêu cầu 1 buổi tập chung hợp lệ mỗi tuần để duy trì chuỗi.
 * - Mỗi Duo có 2 lá chắn/tháng, tự động kích hoạt nếu tuần trôi qua chưa kịp hẹn.
 * - Huy hiệu mốc: 5, 10, 25 buổi chung.
 * - Chống cày: Thưởng chỉ tính cho tối đa 3 Duo hoạt động và 2 buổi chung/tuần.
 *
 * 3. Công thức tích lũy EXP hàng tuần (Chuẩn Master Spec [S6]):
 * - +100 EXP / buổi tập hợp lệ (trần tối đa 3 buổi/tuần = 300 EXP/tuần).
 * - +50 EXP / tuần khi duy trì Chuỗi tuần cá nhân.
 * - +50 EXP / tuần khi hoàn thành buổi tập cùng Chuỗi đôi hoặc làm Host nhóm nhỏ.
 * - Tốc độ cày tiêu chuẩn: 350 – 400 EXP/tuần (~1.500 EXP/tháng).
 * - EXP không bao giờ bị trừ, không mua bằng tiền.
 */

export interface StreakWeek {
  /** Ngày Thứ Hai đầu tuần (giờ địa phương, 00:00). */
  weekStart: Date;
  count: number;
  met: boolean;
  isCurrent: boolean;
}

export interface WeeklyStreakResult {
  /** Số tuần liên tiếp đang giữ được. */
  current: number;
  /** Chuỗi dài nhất từng đạt. */
  longest: number;
  /** Số hoạt động trong tuần này. */
  thisWeekCount: number;
  /** Tuần này đã đạt mục tiêu chưa. */
  thisWeekMet: boolean;
  /** Đang có chuỗi nhưng tuần này chưa ghi đủ — sẽ mất nếu hết Chủ Nhật. */
  atRisk: boolean;
  /** Số ngày còn lại trong tuần (kể cả hôm nay). */
  daysLeftInWeek: number;
  /** Các ngày trong tuần này (T2..CN) đã có hoạt động. */
  activeDaysThisWeek: boolean[];
  /** Lịch sử N tuần gần nhất, cũ -> mới (tuần cuối là tuần hiện tại). */
  history: StreakWeek[];
  /** Số thẻ nghỉ (Streak Freeze) khả dụng trong tháng */
  streakFreezesAvailable: number;
}

const DAY_MS = 24 * 60 * 60 * 1000;

/** Số ngày tuyệt đối (không bị ảnh hưởng bởi giờ/DST) của một ngày theo giờ địa phương. */
function dayNumber(d: Date): number {
  return Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / DAY_MS);
}

/** 0 = Thứ Hai ... 6 = Chủ Nhật */
export function weekdayIndex(d: Date): number {
  return (d.getDay() + 6) % 7;
}

/** Chỉ số tuần (bắt đầu Thứ Hai). Hai ngày cùng tuần có cùng chỉ số. */
export function weekIndex(d: Date): number {
  return Math.floor((dayNumber(d) - weekdayIndex(d)) / 7);
}

export function startOfWeek(d: Date): Date {
  const s = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  s.setDate(s.getDate() - weekdayIndex(d));
  return s;
}

export function computeWeeklyStreak(
  activityDates: ReadonlyArray<Date | string>,
  now: Date = new Date(),
  options: { weeklyGoal?: number; historyWeeks?: number; userRankLevel?: number } = {}
): WeeklyStreakResult {
  const weeklyGoal = Math.max(1, options.weeklyGoal ?? 1);
  const historyWeeks = Math.max(1, options.historyWeeks ?? 12);
  const userRankLevel = options.userRankLevel ?? 2;

  const nowWeek = weekIndex(now);
  const counts = new Map<number, number>();
  const activeDaysThisWeek = Array<boolean>(7).fill(false);

  for (const raw of activityDates) {
    const d = raw instanceof Date ? raw : new Date(raw);
    if (Number.isNaN(d.getTime())) continue;
    const w = weekIndex(d);
    if (w > nowWeek) continue; // bỏ qua dữ liệu tương lai
    counts.set(w, (counts.get(w) ?? 0) + 1);
    if (w === nowWeek) activeDaysThisWeek[weekdayIndex(d)] = true;
  }

  const isMet = (w: number) => (counts.get(w) ?? 0) >= weeklyGoal;

  const thisWeekCount = counts.get(nowWeek) ?? 0;
  const thisWeekMet = isMet(nowWeek);

  // Chuỗi hiện tại: nếu tuần này chưa đạt, bắt đầu đếm từ tuần trước.
  let current = 0;
  let cursor = thisWeekMet ? nowWeek : nowWeek - 1;
  while (isMet(cursor)) {
    current += 1;
    cursor -= 1;
  }

  // Chuỗi dài nhất trên toàn bộ dữ liệu.
  const metWeeks = [...counts.keys()].filter(isMet).sort((a, b) => a - b);
  let longest = 0;
  let run = 0;
  let prev: number | null = null;
  for (const w of metWeeks) {
    run = prev !== null && w === prev + 1 ? run + 1 : 1;
    longest = Math.max(longest, run);
    prev = w;
  }
  longest = Math.max(longest, current);

  const currentWeekStart = startOfWeek(now);
  const history: StreakWeek[] = [];
  for (let i = historyWeeks - 1; i >= 0; i--) {
    const w = nowWeek - i;
    const weekStart = new Date(currentWeekStart);
    weekStart.setDate(weekStart.getDate() - i * 7);
    history.push({ weekStart, count: counts.get(w) ?? 0, met: isMet(w), isCurrent: i === 0 });
  }

  // Streak Freeze: Cấp 1 = 0, Cấp 2 = 1, Cấp 3+ = 2 thẻ/tháng
  const streakFreezesAvailable = userRankLevel >= 3 ? 2 : userRankLevel >= 2 ? 1 : 0;

  return {
    current,
    longest,
    thisWeekCount,
    thisWeekMet,
    atRisk: current > 0 && !thisWeekMet,
    daysLeftInWeek: 7 - weekdayIndex(now),
    activeDaysThisWeek,
    history,
    streakFreezesAvailable,
  };
}

// =========================================================================
// DUO STREAK (CHUỖI ĐÔI BẠN TẬP)
// =========================================================================

export interface DuoPartner {
  partnerId: string;
  partnerName: string;
  partnerAvatar?: string;
  jointSessionsCount: number;
  consecutiveWeeks: number;
  lastSessionDate: string;
  shieldsRemaining: number; // Mặc định 2 lá chắn mỗi tháng
  status: "active" | "atRisk" | "eligible" | "locked";
  unlockedBadges: string[];
}

export const DUO_MILESTONES = [
  { sessions: 5, badgeName: "Đồng Đội Thấu Hiểu (5 Buổi)", icon: "🤝" },
  { sessions: 10, badgeName: "Cặp Đôi Bền Bỉ (10 Buổi)", icon: "🔥" },
  { sessions: 25, badgeName: "Tri Kỷ Phòng Tập (25 Buổi)", icon: "👑" },
];

/** Kiểm tra điều kiện mở khóa Chuỗi Đôi (Cần >= 3 buổi hợp lệ chung và user Rank >= 2) */
export function canFormDuoStreak(userRankLevel: number, jointSessionsCount: number): {
  canForm: boolean;
  reason?: string;
} {
  if (userRankLevel < 2) {
    return {
      canForm: false,
      reason: "Cần đạt Cấp 2 · Runner (≥ 6 buổi hợp lệ) để mở khóa Chuỗi Đôi.",
    };
  }
  if (jointSessionsCount < 3) {
    return {
      canForm: false,
      reason: `Cần hoàn thành tối thiểu 3 buổi tập chung (hiện tại: ${jointSessionsCount}/3 buổi).`,
    };
  }
  return { canForm: true };
}

// =========================================================================
// EXP WEEKLY ACCUMULATION ALGORITHM (CÔNG THỨC EXP MỤC 9.2)
// =========================================================================

export interface WeeklyExpBreakdown {
  sessionCount: number;
  cappedSessionCount: number;
  sessionExp: number; // +100 EXP / buổi, trần 3 buổi/tuần = 300 EXP
  weeklyStreakMet: boolean;
  weeklyStreakExp: number; // +50 EXP
  duoOrHostMet: boolean;
  duoOrHostExp: number; // +50 EXP
  totalWeeklyExp: number;
}

/**
 * Tính EXP nhận được trong tuần theo chuẩn Master Spec S6
 * - 1 buổi hợp lệ: +100 EXP (max 3 buổi = 300 EXP/tuần)
 * - Duy trì Chuỗi tuần: +50 EXP/tuần
 * - Hoàn thành buổi tập Duo hoặc Host nhóm nhỏ: +50 EXP/tuần
 * - Tối đa 1 tuần = 400 EXP
 */
export function calculateWeeklyExp(input: {
  validSessions: number;
  weeklyStreakMet: boolean;
  hasDuoSessionOrHost: boolean;
}): WeeklyExpBreakdown {
  const sessionCount = Math.max(0, input.validSessions);
  const cappedSessionCount = Math.min(3, sessionCount);
  const sessionExp = cappedSessionCount * 100;

  const weeklyStreakExp = input.weeklyStreakMet ? 50 : 0;
  const duoOrHostExp = input.hasDuoSessionOrHost ? 50 : 0;

  const totalWeeklyExp = sessionExp + weeklyStreakExp + duoOrHostExp;

  return {
    sessionCount,
    cappedSessionCount,
    sessionExp,
    weeklyStreakMet: input.weeklyStreakMet,
    weeklyStreakExp,
    duoOrHostMet: input.hasDuoSessionOrHost,
    duoOrHostExp,
    totalWeeklyExp,
  };
}
