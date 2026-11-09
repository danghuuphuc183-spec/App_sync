/**
 * NHẬT KÝ TẬP LUYỆN — dữ liệu dùng chung cho "Chuỗi tuần" (trang chủ) và "Ghi nhận tập luyện" (hồ sơ).
 * Hàm thuần, không phụ thuộc trình duyệt → dễ kiểm thử.
 */

export interface ActivityEntry {
  id: string;
  at: string; // ISO
  sport: string;
  minutes: number;
  withPartner?: boolean;
}

export interface DayCell {
  key: string; // YYYY-MM-DD (giờ địa phương)
  date: Date;
  count: number;
  minutes: number;
  partner: boolean;
  future: boolean;
}

const pad = (n: number) => String(n).padStart(2, "0");
export const dateKey = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
/** 0 = Thứ Hai ... 6 = Chủ Nhật */
export const weekday = (d: Date) => (d.getDay() + 6) % 7;

/** Mức màu 0..5 theo số buổi trong ngày */
export function levelOf(count: number): 0 | 1 | 2 | 3 | 4 | 5 {
  if (count <= 0) return 0;
  return Math.min(5, count) as 1 | 2 | 3 | 4 | 5;
}

export function groupByDay(entries: ReadonlyArray<ActivityEntry>) {
  const map = new Map<string, { count: number; minutes: number; partner: boolean; items: ActivityEntry[] }>();
  for (const e of entries) {
    const d = new Date(e.at);
    if (Number.isNaN(d.getTime())) continue;
    const k = dateKey(d);
    const cur = map.get(k) ?? { count: 0, minutes: 0, partner: false, items: [] };
    cur.count += 1;
    cur.minutes += e.minutes;
    cur.partner ||= !!e.withPartner;
    cur.items.push(e);
    map.set(k, cur);
  }
  return map;
}

const MONTHS_VI = ["Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6", "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"];

/**
 * Lưới nhiệt: hàng = thứ trong tuần (T2..CN), cột = tuần; cột cuối là tuần hiện tại.
 * Nhãn tháng đặt ở cột chứa ngày mùng 1 của tháng đó.
 */
export function buildHeatmap(entries: ReadonlyArray<ActivityEntry>, now: Date, weeks = 20) {
  const byDay = groupByDay(entries);
  const today = startOfDay(now);
  const thisMonday = new Date(today);
  thisMonday.setDate(today.getDate() - weekday(today));
  const firstMonday = new Date(thisMonday);
  firstMonday.setDate(thisMonday.getDate() - (weeks - 1) * 7);

  const columns: DayCell[][] = [];
  const monthLabels: { col: number; label: string }[] = [];
  for (let w = 0; w < weeks; w++) {
    const col: DayCell[] = [];
    for (let d = 0; d < 7; d++) {
      const date = new Date(firstMonday);
      date.setDate(firstMonday.getDate() + w * 7 + d);
      const k = dateKey(date);
      const agg = byDay.get(k);
      col.push({ key: k, date, count: agg?.count ?? 0, minutes: agg?.minutes ?? 0, partner: agg?.partner ?? false, future: date > today });
    }
    // Nhãn tháng: cột đầu tiên, hoặc cột chứa ngày mùng 1
    const firstOfMonth = col.find((c) => c.date.getDate() === 1);
    if (w === 0 || firstOfMonth) {
      monthLabels.push({ col: w, label: MONTHS_VI[(firstOfMonth ?? col[0]!).date.getMonth()]! });
    }
    columns.push(col);
  }
  return { columns, monthLabels };
}

export function monthStats(entries: ReadonlyArray<ActivityEntry>, now: Date) {
  const inMonth = entries.filter((e) => {
    const d = new Date(e.at);
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d <= now;
  });
  const days = new Set(inMonth.map((e) => dateKey(new Date(e.at))));
  return {
    sessions: inMonth.length,
    activeDays: days.size,
    minutes: inMonth.reduce((s, e) => s + e.minutes, 0),
    partnerSessions: inMonth.filter((e) => e.withPartner).length,
  };
}

/** Số buổi theo thứ trong tuần (T2..CN) trong N ngày gần nhất */
export function weekdayDistribution(entries: ReadonlyArray<ActivityEntry>, now: Date, sinceDays = 140): number[] {
  const since = startOfDay(now).getTime() - sinceDays * 86_400_000;
  const out = [0, 0, 0, 0, 0, 0, 0];
  for (const e of entries) {
    const d = new Date(e.at);
    if (d.getTime() >= since && d <= now) out[weekday(d)]! += 1;
  }
  return out;
}

/** Bộ sinh số giả ngẫu nhiên có hạt giống (dữ liệu mẫu ổn định giữa các lần tải) */
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Lịch sử mẫu ~5 tháng: hay tập T3/T5/T7, thỉnh thoảng 2 buổi/ngày, một số buổi tập cùng bạn.
 * Không tạo dữ liệu cho tuần hiện tại để người dùng tự "Ghi ngay".
 */
export function generateSeedHistory(now: Date, days = 150, seed = 2026): ActivityEntry[] {
  const rand = mulberry32(seed);
  const today = startOfDay(now);
  const thisMonday = new Date(today);
  thisMonday.setDate(today.getDate() - weekday(today));
  const sports = ["running", "running", "gym", "running", "cycling"];
  const pBy = [0.25, 0.6, 0.2, 0.55, 0.15, 0.5, 0.3]; // T2..CN
  const out: ActivityEntry[] = [];
  for (let i = days; i >= 1; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    if (d >= thisMonday) continue;
    const p = pBy[weekday(d)]! * (i > 110 ? 0.5 : 1); // tập đều hơn trong những tháng gần đây
    if (rand() > p) continue;
    const sessions = rand() < 0.18 ? 2 : 1;
    for (let s = 0; s < sessions; s++) {
      const at = new Date(d);
      at.setHours(s === 0 ? 5 + Math.floor(rand() * 2) : 18, Math.floor(rand() * 60));
      out.push({
        id: `seed-${dateKey(d)}-${s}`,
        at: at.toISOString(),
        sport: sports[Math.floor(rand() * sports.length)]!,
        minutes: 30 + Math.round(rand() * 60),
        withPartner: rand() < 0.3,
      });
    }
  }
  return out;
}
