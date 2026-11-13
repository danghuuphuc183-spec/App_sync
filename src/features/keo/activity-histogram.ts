/**
 * BIỂU ĐỒ "GIỜ NÀO MỌI NGƯỜI HOẠT ĐỘNG NHIỀU NHẤT"
 *
 * Mỗi cột = 30 phút trong ngày (04:00 → 22:00, 36 cột).
 * Độ cao cột = mức hoạt động ước tính của môn đó, gộp từ 3 nguồn:
 *  1. Hồ sơ nền theo môn (giờ cao điểm điển hình: chạy/đạp sáng sớm, gym/sân bãi buổi tối)
 *  2. Kèo thật đang mở trong khung giờ đó (trọng số cao vì là nhu cầu thực)
 *  3. Thói quen của người dùng cùng môn (giờ tập ưa thích trong hồ sơ)
 * Cuối tuần giờ cao điểm buổi sáng lùi muộn hơn ~1 tiếng.
 */
import type { Keo, TimeSlot } from "./keo.types";
import { isWeekendDay, sameDay } from "./keo-date";
import { toMinutes } from "./keo.algo";

export const DAY_START_MIN = 4 * 60;
export const DAY_END_MIN = 22 * 60;
export const BUCKET_MIN = 30;
export const BUCKETS = (DAY_END_MIN - DAY_START_MIN) / BUCKET_MIN; // 36

export const bucketToTime = (i: number) => {
  const m = DAY_START_MIN + i * BUCKET_MIN;
  return `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
};

export const timeToBucket = (hhmm: string) =>
  Math.min(BUCKETS, Math.max(0, Math.round((toMinutes(hhmm) - DAY_START_MIN) / BUCKET_MIN)));

/** Các đỉnh hoạt động [giờ trung tâm, độ rộng (giờ), cường độ] theo môn */
const PEAKS: Record<string, [number, number, number][]> = {
  running: [[5.9, 1.1, 1], [18.25, 1.3, 0.75], [20.75, 0.9, 0.3]],
  cycling: [[5.75, 1.1, 1], [17.5, 1.3, 0.4]],
  gym: [[6.5, 1.2, 0.45], [12, 1, 0.3], [18.75, 1.4, 1]],
  pickleball: [[6.5, 1.2, 0.55], [18.5, 1.4, 1]],
  badminton: [[6.25, 1.1, 0.4], [19.25, 1.3, 1]],
  table_tennis: [[18.5, 1.5, 1], [9, 1.2, 0.3]],
  football: [[17.75, 1.1, 1], [19.75, 1, 0.8]],
  basketball: [[17.5, 1.2, 1], [19.5, 1.1, 0.6]],
};

const SLOT_CENTER: Record<TimeSlot, number> = { morning_early: 5.75, noon: 12, evening: 17.75, night: 20 };

export function activityHistogram(
  sport: string,
  day: string,
  keos: ReadonlyArray<Keo>,
  peopleSlots: ReadonlyArray<TimeSlot> = []
): number[] {
  const weekendShift = isWeekendDay(day) ? 1 : 0;
  const peaks = PEAKS[sport] ?? PEAKS.running!;
  const slotShare: Partial<Record<TimeSlot, number>> = {};
  for (const slot of peopleSlots) slotShare[slot] = (slotShare[slot] ?? 0) + 1 / peopleSlots.length;
  const bars = Array.from({ length: BUCKETS }, (_, i) => {
    const h = (DAY_START_MIN + i * BUCKET_MIN + BUCKET_MIN / 2) / 60;
    let v = 0.06;
    for (const [c, w, k] of peaks) {
      const center = c < 12 ? c + weekendShift : c;
      v += k * Math.exp(-((h - center) ** 2) / (2 * w * w));
    }
    // Thói quen người dùng: tính theo TỈ LỆ (không phải số lượng) để không tạo cột nhọn
    for (const slot of Object.keys(slotShare) as TimeSlot[]) {
      v += 0.45 * slotShare[slot]! * Math.exp(-((h - SLOT_CENTER[slot]) ** 2) / (2 * 1.1 * 1.1));
    }
    return v;
  });

  for (const k of keos) {
    if (k.sport !== sport || !sameDay(k.time.day, day)) continue;
    const from = timeToBucket(k.time.from);
    const to = timeToBucket(k.time.to);
    for (let i = from; i < to; i++) if (i >= 0 && i < BUCKETS) bars[i]! += 0.12 * k.memberIds.length ** 0.5;
  }

  const max = Math.max(...bars);
  return bars.map((v) => Math.round((v / max) * 100));
}

/** Cột đông nhất (giờ cao điểm) */
export function peakBucket(bars: number[]): number {
  return bars.reduce((best, v, i) => (v > bars[best]! ? i : best), 0);
}
