/**
 * Ngày của kèo lưu dạng ISO "YYYY-MM-DD" (giờ địa phương).
 * Vẫn đọc được nhãn cũ ("Hôm nay", "Ngày mai", "Thứ Bảy", "Chủ Nhật") để không vỡ dữ liệu đã lưu.
 */

export const WEEKDAY_LONG = ["Chủ Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"];
export const WEEKDAY_SHORT = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

const ISO_RE = /^(\d{4})-(\d{2})-(\d{2})$/;
const pad = (n: number) => String(n).padStart(2, "0");

export const isIsoDay = (day: string) => ISO_RE.test(day);

export function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export function toIsoDay(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function addDays(d: Date, n: number): Date {
  const x = startOfDay(d);
  x.setDate(x.getDate() + n);
  return x;
}

/** Đổi ngày (ISO hoặc nhãn cũ) thành Date lúc 00:00 giờ địa phương. */
export function resolveDay(day: string, now: Date): Date {
  const m = ISO_RE.exec(day);
  if (m) return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  const d = startOfDay(now);
  if (day === "Ngày mai") d.setDate(d.getDate() + 1);
  else if (day === "Thứ Bảy" || day === "Chủ Nhật") {
    const target = day === "Thứ Bảy" ? 6 : 0;
    d.setDate(d.getDate() + ((target - d.getDay() + 7) % 7));
  }
  return d;
}

/** Chuẩn hoá về ISO; ngày đã qua thì trả về ngày mai (dùng cho form mặc định đã lưu). */
export function normalizeKeoDay(day: string, now: Date = new Date()): string {
  const d = resolveDay(day, now);
  return d < startOfDay(now) ? toIsoDay(addDays(now, 1)) : toIsoDay(d);
}

/** Hai ngày (ISO hoặc nhãn cũ) có phải cùng một ngày lịch không */
export const sameDay = (a: string, b: string, now: Date = new Date()) =>
  a === b || toIsoDay(resolveDay(a, now)) === toIsoDay(resolveDay(b, now));

export const isWeekendDay = (day: string, now: Date = new Date()) => {
  const wd = resolveDay(day, now).getDay();
  return wd === 0 || wd === 6;
};

/**
 * Nhãn hiển thị đầy đủ thứ + ngày/tháng:
 * "Hôm nay, T2 10/11" · "Ngày mai, T3 11/11" · "Thứ Năm, 13/11" (khác năm thì thêm năm).
 */
export function formatKeoDay(day: string, now: Date = new Date()): string {
  const d = resolveDay(day, now);
  const diff = Math.round((d.getTime() - startOfDay(now).getTime()) / 86_400_000);
  const dm = `${pad(d.getDate())}/${pad(d.getMonth() + 1)}${d.getFullYear() !== now.getFullYear() ? `/${d.getFullYear()}` : ""}`;
  if (diff === 0) return `Hôm nay, ${WEEKDAY_SHORT[d.getDay()]} ${dm}`;
  if (diff === 1) return `Ngày mai, ${WEEKDAY_SHORT[d.getDay()]} ${dm}`;
  return `${WEEKDAY_LONG[d.getDay()]}, ${dm}`;
}
