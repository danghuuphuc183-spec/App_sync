/**
 * LỊCH NHẮC KÈO (gửi cho host và mọi người đã nhận kèo, kể cả kế hoạch tự tập)
 *  1) Nhắc hôm trước:
 *     - Kèo buổi sáng (bắt đầu trước 12:00, vd 5:00) → 20:00 tối hôm trước, để không nhắc lúc đang ngủ.
 *     - Kèo chiều / tối → đúng 24 giờ trước giờ tập.
 *  2) Nhắc trước giờ tập 1 tiếng.
 * Lời nhắc nào rơi vào thời điểm đã qua (kèo tạo sát giờ) thì bỏ.
 */

export const REMINDER_CONFIG = {
  MORNING_CUTOFF_HOUR: 12,
  EVENING_BEFORE_HOUR: 20,
  HOUR_BEFORE_MIN: 60,
} as const;

export type ReminderKind = "day_before" | "hour_before";

export interface Reminder {
  kind: ReminderKind;
  at: Date;
  labelVi: string;
}

/** day "YYYY-MM-DD" + "05:30" → Date theo giờ máy */
export function sessionStart(day: string, hhmm: string): Date {
  const [y, m, d] = day.split("-").map(Number);
  const [hh, mm] = hhmm.split(":").map(Number);
  return new Date(y ?? 1970, (m ?? 1) - 1, d ?? 1, hh ?? 0, mm ?? 0, 0, 0);
}

export function reminderSchedule(start: Date, createdAt: Date = new Date()): Reminder[] {
  const out: Reminder[] = [];

  let dayBefore: Date;
  if (start.getHours() < REMINDER_CONFIG.MORNING_CUTOFF_HOUR) {
    dayBefore = new Date(start);
    dayBefore.setDate(dayBefore.getDate() - 1);
    dayBefore.setHours(REMINDER_CONFIG.EVENING_BEFORE_HOUR, 0, 0, 0);
  } else {
    dayBefore = new Date(start.getTime() - 24 * 60 * 60_000);
  }
  if (dayBefore > createdAt) out.push({ kind: "day_before", at: dayBefore, labelVi: "Nhắc hôm trước" });

  const hourBefore = new Date(start.getTime() - REMINDER_CONFIG.HOUR_BEFORE_MIN * 60_000);
  if (hourBefore > createdAt) out.push({ kind: "hour_before", at: hourBefore, labelVi: "Nhắc trước 1 tiếng" });

  return out;
}

const pad = (n: number) => String(n).padStart(2, "0");

/** "20:00 tối 13/11" / "04:00 sáng 14/11" */
export function formatReminderTime(d: Date): string {
  const h = d.getHours();
  const part = h < 11 ? "sáng" : h < 14 ? "trưa" : h < 18 ? "chiều" : "tối";
  return `${pad(h)}:${pad(d.getMinutes())} ${part} ${pad(d.getDate())}/${pad(d.getMonth() + 1)}`;
}
