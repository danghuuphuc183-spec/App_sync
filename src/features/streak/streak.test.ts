import { describe, it, expect } from "vitest";
import { computeWeeklyStreak, weekIndex } from "./streak";

// 2026-11-11 là Thứ Tư
const WED = new Date(2026, 10, 11, 10, 0);
const day = (y: number, m: number, d: number) => new Date(y, m - 1, d, 8, 0);

describe("computeWeeklyStreak", () => {
  it("không có hoạt động → chuỗi 0", () => {
    const r = computeWeeklyStreak([], WED);
    expect(r.current).toBe(0);
    expect(r.atRisk).toBe(false);
    expect(r.history).toHaveLength(12);
  });

  it("Thứ Hai và Chủ Nhật cùng một tuần", () => {
    expect(weekIndex(day(2026, 11, 9))).toBe(weekIndex(day(2026, 11, 15)));
    expect(weekIndex(day(2026, 11, 8))).toBe(weekIndex(day(2026, 11, 9)) - 1);
  });

  it("đếm các tuần liên tiếp tính cả tuần này", () => {
    const r = computeWeeklyStreak(
      [day(2026, 11, 10), day(2026, 11, 4), day(2026, 10, 27), day(2026, 10, 28)],
      WED
    );
    expect(r.current).toBe(3);
    expect(r.thisWeekMet).toBe(true);
    expect(r.thisWeekCount).toBe(1);
    expect(r.activeDaysThisWeek[1]).toBe(true); // Thứ Ba
  });

  it("tuần này chưa tập thì chuỗi vẫn giữ nhưng ở trạng thái nguy cơ", () => {
    const r = computeWeeklyStreak([day(2026, 11, 4), day(2026, 10, 27)], WED);
    expect(r.current).toBe(2);
    expect(r.atRisk).toBe(true);
    expect(r.daysLeftInWeek).toBe(5);
  });

  it("một tuần đã kết thúc mà trống thì chuỗi bị đứt", () => {
    const r = computeWeeklyStreak([day(2026, 11, 10), day(2026, 10, 27), day(2026, 10, 20)], WED);
    expect(r.current).toBe(1);
    expect(r.longest).toBe(2);
  });

  it("tôn trọng mục tiêu số buổi mỗi tuần", () => {
    const r = computeWeeklyStreak([day(2026, 11, 9), day(2026, 11, 3), day(2026, 11, 4)], WED, {
      weeklyGoal: 2,
    });
    expect(r.thisWeekMet).toBe(false);
    expect(r.current).toBe(1);
    expect(r.atRisk).toBe(true);
  });
});
