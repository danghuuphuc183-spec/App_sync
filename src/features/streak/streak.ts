/**
 * Chuỗi liên tiếp theo TUẦN (weekly streak) — logic kiểu Strava.
 *
 * Quy tắc:
 * - Tuần bắt đầu từ Thứ Hai (00:00 giờ địa phương) và kết thúc Chủ Nhật.
 * - Một tuần "đạt" khi có >= `weeklyGoal` hoạt động (mặc định 1).
 * - Chuỗi hiện tại = số tuần đạt liên tiếp, tính ngược từ tuần này.
 * - Tuần hiện tại CHƯA đạt thì chuỗi KHÔNG bị mất (vẫn còn thời gian tới Chủ Nhật):
 *   chuỗi được tính từ tuần trước và trạng thái là "atRisk" (cần ghi hoạt động để giữ).
 * - Chuỗi chỉ về 0 khi có một tuần đã KẾT THÚC mà không đạt.
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
  options: { weeklyGoal?: number; historyWeeks?: number } = {}
): WeeklyStreakResult {
  const weeklyGoal = Math.max(1, options.weeklyGoal ?? 1);
  const historyWeeks = Math.max(1, options.historyWeeks ?? 12);

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

  return {
    current,
    longest,
    thisWeekCount,
    thisWeekMet,
    atRisk: current > 0 && !thisWeekMet,
    daysLeftInWeek: 7 - weekdayIndex(now),
    activeDaysThisWeek,
    history,
  };
}
