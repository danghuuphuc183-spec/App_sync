import { describe, it, expect } from "vitest";
import { activityHistogram, bucketToTime, peakBucket, timeToBucket, BUCKETS } from "./activity-histogram";
import { SEED_KEOS } from "./keo.data";

describe("activityHistogram", () => {
  it("36 cột 30 phút từ 04:00 đến 22:00, chuẩn hoá về 0..100", () => {
    const bars = activityHistogram("running", "Ngày mai", SEED_KEOS);
    expect(bars).toHaveLength(BUCKETS);
    expect(Math.max(...bars)).toBe(100);
    expect(Math.min(...bars)).toBeGreaterThanOrEqual(0);
  });

  it("chạy bộ đông nhất buổi sáng sớm, gym đông nhất buổi tối", () => {
    expect(bucketToTime(peakBucket(activityHistogram("running", "Ngày mai", SEED_KEOS)))).toMatch(/^0[5-6]:/);
    expect(bucketToTime(peakBucket(activityHistogram("gym", "Hôm nay", SEED_KEOS)))).toMatch(/^(18|19):/);
  });

  it("cuối tuần giờ cao điểm sáng lùi muộn hơn ngày thường", () => {
    const weekday = peakBucket(activityHistogram("cycling", "Ngày mai", []));
    const weekend = peakBucket(activityHistogram("cycling", "Chủ Nhật", []));
    expect(weekend).toBeGreaterThan(weekday);
  });

  it("kèo thật đang mở làm khung giờ đó cao hơn", () => {
    const without = activityHistogram("pickleball", "Hôm nay", []);
    const withKeo = activityHistogram("pickleball", "Hôm nay", SEED_KEOS);
    const busy = timeToBucket("18:15"); // có 3 kèo pickleball hôm nay quanh giờ này
    const quiet = timeToBucket("09:00");
    expect(withKeo[busy]! / withKeo[quiet]!).toBeGreaterThan(without[busy]! / without[quiet]!);
  });

  it("đổi qua lại giờ ↔ cột", () => {
    expect(bucketToTime(0)).toBe("04:00");
    expect(bucketToTime(BUCKETS)).toBe("22:00");
    expect(timeToBucket("17:00")).toBe(26);
  });
});
