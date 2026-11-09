import { describe, it, expect } from "vitest";
import {
  buildHeatmap,
  dateKey,
  generateSeedHistory,
  groupByDay,
  levelOf,
  monthStats,
  weekdayDistribution,
  type ActivityEntry,
} from "./activity-log";
import { computeWeeklyStreak } from "@/features/streak/streak";

const NOW = new Date(2026, 10, 9, 18, 0); // Thứ Hai 9/11/2026
const e = (y: number, m: number, d: number, min = 40, withPartner = false): ActivityEntry => ({
  id: `${y}-${m}-${d}-${Math.random()}`,
  at: new Date(y, m - 1, d, 6, 0).toISOString(),
  sport: "running",
  minutes: min,
  withPartner,
});

describe("buildHeatmap", () => {
  it("20 cột × 7 hàng, cột cuối là tuần hiện tại bắt đầu từ Thứ Hai", () => {
    const { columns } = buildHeatmap([], NOW, 20);
    expect(columns).toHaveLength(20);
    expect(columns.every((c) => c.length === 7)).toBe(true);
    expect(columns[19]![0]!.key).toBe("2026-11-09");
    expect(columns[19]![1]!.future).toBe(true);
  });

  it("đếm đúng số buổi trong ngày và đánh dấu tập cùng bạn", () => {
    const { columns } = buildHeatmap([e(2026, 11, 3), e(2026, 11, 3, 30, true), e(2026, 11, 5)], NOW, 4);
    const tue = columns[2]![1]!; // tuần 2/11 – 8/11, Thứ Ba 3/11
    expect(tue.key).toBe("2026-11-03");
    expect(tue.count).toBe(2);
    expect(tue.minutes).toBe(70);
    expect(tue.partner).toBe(true);
  });

  it("có nhãn tháng theo thứ tự và không lặp", () => {
    const { monthLabels } = buildHeatmap([], NOW, 20);
    const labels = monthLabels.map((m) => m.label);
    expect(labels[labels.length - 1]).toBe("Tháng 11");
    expect(new Set(labels).size).toBe(labels.length);
    expect(labels).toContain("Tháng 8");
  });
});

describe("thống kê", () => {
  it("levelOf theo số buổi", () => {
    expect([0, 1, 3, 9].map(levelOf)).toEqual([0, 1, 3, 5]);
  });

  it("tháng này: số buổi, số ngày, số phút, buổi tập cùng bạn", () => {
    const s = monthStats([e(2026, 11, 2), e(2026, 11, 2), e(2026, 11, 5, 60, true), e(2026, 10, 30)], NOW);
    expect(s).toEqual({ sessions: 3, activeDays: 2, minutes: 140, partnerSessions: 1 });
  });

  it("phân bố theo thứ trong tuần", () => {
    const dist = weekdayDistribution([e(2026, 11, 3), e(2026, 11, 3), e(2026, 11, 7)], NOW);
    expect(dist).toEqual([0, 2, 0, 0, 0, 1, 0]);
  });
});

describe("dữ liệu mẫu", () => {
  it("ổn định, không có buổi trong tuần hiện tại, hợp với chuỗi tuần", () => {
    const a = generateSeedHistory(NOW);
    const b = generateSeedHistory(NOW);
    expect(a.map((x) => x.id)).toEqual(b.map((x) => x.id));
    expect(a.length).toBeGreaterThan(30);
    expect(a.every((x) => new Date(x.at) < new Date(2026, 10, 9))).toBe(true);
    const streak = computeWeeklyStreak(a.map((x) => x.at), NOW);
    expect(streak.atRisk).toBe(true);
    expect(streak.current).toBeGreaterThan(0);
    expect(groupByDay(a).has(dateKey(new Date(2026, 10, 9)))).toBe(false);
  });
});
