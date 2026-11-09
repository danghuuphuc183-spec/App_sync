import { describe, it, expect } from "vitest";
import { gymPlan, gymSplitFor, parsePreferredTime, proposeStart, resolveDay, runPlan, venueReviews, GYM_SPLITS } from "./session-plan";
import { CANDIDATES_DATA } from "@/features/match/candidates.data";
import { STRAVA_ROUTES } from "@/features/venues/routes.data";
import { SPORTS_VENUES_DATABASE } from "@/features/venues/venues.data";

const runner = CANDIDATES_DATA.find((c) => c.sport === "running" && c.capabilities.targetPaceSec === 330)!;
const gymmer = CANDIDATES_DATA.find((c) => c.sport === "gym" && c.capabilities.level !== "Mới Bắt Đầu" && /gym|kháng lực/i.test(c.sportVi))!;
const route = STRAVA_ROUTES.find((r) => r.id === "route-run-1")!;
const gym = SPORTS_VENUES_DATABASE.find((v) => v.sport === "gym")!;
const NOW = new Date(2026, 10, 9, 18, 0); // Thứ Hai

describe("thời gian", () => {
  it("đọc giờ quen của hồ sơ", () => {
    expect(parsePreferredTime("05:45 AM Sáng sớm")).toBe(345);
    expect(parsePreferredTime("18:30 PM Buổi tối")).toBe(18 * 60 + 30);
    expect(parsePreferredTime("bất kỳ")).toBeNull();
  });
  it("kẹp giờ vào khung bạn chọn và vẫn đủ thời lượng", () => {
    const w = { day: "Ngày mai", from: "05:00", to: "07:00" };
    expect(proposeStart(w, 345, 60)).toEqual({ start: "05:45", end: "06:45", fitsWindow: true });
    expect(proposeStart(w, 18 * 60, 60).start).toBe("06:00");
    expect(proposeStart(w, 4 * 60, 60).start).toBe("05:00");
  });
  it("đổi nhãn ngày sang ngày thật", () => {
    expect(resolveDay("Ngày mai", NOW).getDate()).toBe(10);
    expect(resolveDay("Thứ Bảy", NOW).getDay()).toBe(6);
    expect(resolveDay("Chủ Nhật", NOW).getDay()).toBe(0);
  });
});

describe("kế hoạch chạy bộ", () => {
  it("có cung đường, cự ly, pace chung theo người chậm hơn, thời lượng và cường độ", () => {
    const p = runPlan(route, runner, { day: "Ngày mai", from: "05:00", to: "07:00" }, 360);
    expect(p.route.id).toBe("route-run-1");
    expect(p.distanceKm).toBe(8.5);
    expect(p.pace).toBe("6:00/km"); // bạn 6:00, người kia 5:30 → theo người chậm hơn
    expect(p.durationMin).toBe(61);
    expect(p.intensity).toBe("Nhẹ");
  });
});

describe("kế hoạch gym", () => {
  it("có phòng tập, nhóm cơ của ngày, bài tập, số hiệp, giờ", () => {
    const p = gymPlan(gym, gymmer, { day: "Hôm nay", from: "18:00", to: "20:00" }, NOW);
    expect(p.venue.name).toBe(gym.name);
    expect(Object.values(GYM_SPLITS).map((s) => s.key)).toContain(p.split.key);
    expect(p.split.exercises.length).toBe(4);
    expect(p.sets).toMatch(/hiệp/);
    expect(p.end > p.start).toBe(true);
  });
  it("boxing / calisthenics có buổi tập riêng, không bị xếp leg day", () => {
    const boxer = CANDIDATES_DATA.find((c) => /boxing/i.test(c.sportVi))!;
    expect(gymSplitFor(boxer, NOW).key).toBe("boxing");
    const cali = CANDIDATES_DATA.find((c) => /calisthenics/i.test(c.sportVi))!;
    expect(gymSplitFor(cali, NOW).key).toBe("calisthenics");
  });

  it("người mới bắt đầu luôn tập toàn thân", () => {
    const beginner = { ...gymmer, capabilities: { ...gymmer.capabilities, level: "Mới Bắt Đầu" as const } };
    expect(gymSplitFor(beginner, NOW).key).toBe("full");
  });
  it("đánh giá phòng tập: 3 nhận xét và phân bố sao cộng đúng tổng gần bằng số đánh giá", () => {
    const { reviews, distribution } = venueReviews(gym);
    expect(reviews).toHaveLength(3);
    expect(distribution).toHaveLength(5);
    const total = distribution.reduce((a, b) => a + b, 0);
    expect(Math.abs(total - gym.reviewCount)).toBeLessThanOrEqual(3);
  });
});
