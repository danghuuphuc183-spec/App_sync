import { describe, it, expect } from "vitest";
import {
  detectFakeGps,
  discCompat,
  matchPartners,
  reliabilityTier,
  scheduleOverlap,
  slotKey,
  spotterFit,
  weatherAdvice,
  workoutCompat,
  type PartnerProfile,
} from "./partner-match";
import { candidateToPartner, offsetKm, windowToSlots } from "./partner-pool";
import { CANDIDATES_DATA } from "./candidates.data";

const C: [number, number] = [10.7985, 106.7185];
const now = 1_800_000_000;
const base = (over: Partial<PartnerProfile> = {}): PartnerProfile => ({
  id: "x",
  name: "X",
  gender: "female",
  sports: ["running"],
  workoutTypes: ["long_run"],
  availability: [slotKey(0, "dawn"), slotKey(2, "dawn")],
  position: C,
  disc: "S",
  vibe: "friendly",
  sameGenderOnly: false,
  heightCm: 160,
  weightKg: 52,
  completionRate: 0.95,
  completedSessions: 20,
  paceSecPerKm: 360,
  pings: [
    { lat: C[0], lng: C[1], t: now - 300 },
    { lat: C[0] + 0.001, lng: C[1], t: now },
  ],
  ...over,
});
const me = base({ id: "me", name: "Me" });

describe("lọc cứng", () => {
  it("GPS: chỉ người trong 3 km", () => {
    const near = base({ id: "near", position: offsetKm(C, 2, 0) });
    const far = base({ id: "far", position: offsetKm(C, 4, 0) });
    const run = matchPartners(me, [near, far], { sport: "running" });
    expect(run.matches.map((m) => m.profile.id)).toEqual(["near"]);
    expect(run.excluded.distance).toBe(1);
  });

  it("giao thoa thời gian: không trùng khung nào → loại", () => {
    const run = matchPartners(me, [base({ id: "night", availability: [slotKey(0, "night")] })], { sport: "running" });
    expect(run.matches).toHaveLength(0);
    expect(run.excluded.schedule).toBe(1);
  });

  it("an toàn giới tính: một bên chỉ muốn cùng giới → không ghép khác giới", () => {
    const male = base({ id: "m", gender: "male" });
    expect(matchPartners({ ...me, sameGenderOnly: true }, [male], { sport: "running" }).excluded.gender).toBe(1);
    expect(matchPartners(me, [{ ...male, sameGenderOnly: true }], { sport: "running" }).excluded.gender).toBe(1);
    expect(matchPartners(me, [male], { sport: "running" }).matches).toHaveLength(1);
  });

  it("GPS giả: nhảy > 2 km trong 2 phút → không vào hàng đợi", () => {
    expect(detectFakeGps([{ lat: C[0], lng: C[1], t: now }, { lat: C[0] + 0.03, lng: C[1], t: now + 60 }]).suspicious).toBe(true);
    expect(detectFakeGps([{ lat: C[0], lng: C[1], t: now }, { lat: C[0] + 0.03, lng: C[1], t: now + 600 }]).suspicious).toBe(false);
    const teleporter = base({ id: "tp", pings: [{ lat: C[0], lng: C[1], t: now }, { lat: C[0] + 0.05, lng: C[1], t: now + 30 }] });
    expect(matchPartners(me, [teleporter], { sport: "running" }).excluded.fakeGps).toBe(1);
  });

  it("người hay bùng kèo chỉ được ghép với người hay bùng kèo", () => {
    expect(reliabilityTier(0.5, 10)).toBe("flaky");
    expect(reliabilityTier(0.5, 1)).toBe("normal"); // người mới
    const flaky = base({ id: "f", completionRate: 0.45, completedSessions: 12 });
    expect(matchPartners(me, [flaky], { sport: "running" }).excluded.reliability).toBe(1);
    const flakyMe = { ...me, completionRate: 0.4, completedSessions: 10 };
    expect(matchPartners(flakyMe, [flaky], { sport: "running" }).matches).toHaveLength(1);
    expect(matchPartners(flakyMe, [base({ id: "good" })], { sport: "running" }).excluded.reliability).toBe(1);
  });
});

describe("chấm điểm", () => {
  it("ưu tiên người hoàn thành cao, cùng loại workout, cùng vibe", () => {
    const best = base({ id: "best" });
    const otherVibe = base({ id: "vibe", vibe: "performance", disc: "D" });
    const otherWorkout = base({ id: "wo", workoutTypes: ["interval"] });
    const lowRate = base({ id: "low", completionRate: 0.7 });
    const run = matchPartners(me, [lowRate, otherWorkout, otherVibe, best], { sport: "running" });
    expect(run.matches[0]!.profile.id).toBe("best");
  });

  it("workout gần nhau có điểm trung gian", () => {
    expect(workoutCompat(["long_run"], ["long_run"]).score).toBe(1);
    expect(workoutCompat(["long_run"], ["recovery"]).score).toBe(0.7);
    expect(workoutCompat(["legs"], ["lower"]).score).toBe(0.9);
    expect(workoutCompat(["push"], ["long_run"]).score).toBe(0);
  });

  it("DISC phụ thuộc vibe buổi tập", () => {
    expect(discCompat("D", "D", "performance")).toBeGreaterThan(discCompat("D", "D", "friendly"));
    expect(discCompat("I", "S", "friendly")).toBeGreaterThan(discCompat("I", "C", "friendly"));
  });

  it("tương quan thể hình khi tập tạ nặng cần người đỡ", () => {
    const lifter = { ...me, sports: ["gym"], workoutTypes: ["legs" as const], needsSpotter: true, weightKg: 70 };
    expect(spotterFit(lifter, base({ weightKg: 72 }), ["legs"]).fit).toBe(1);
    expect(spotterFit(lifter, base({ weightKg: 45 }), ["legs"]).fit).toBeLessThan(0.5);
    expect(spotterFit(lifter, base({ weightKg: 45 }), ["pull"]).applies).toBe(false);
  });

  it("giao thoa thời gian", () => {
    expect(scheduleOverlap(["a", "b"], ["b", "c", "d"]).score).toBe(0.5);
  });
});

describe("thời tiết", () => {
  it("mưa dông giờ hẹn chạy ngoài trời → đề xuất gym + thẻ miễn trừ", () => {
    const a = weatherAdvice("running", 17, 19, [{ hour: 18, precipProb: 85, code: 95 }]);
    expect(a.risk).toBe("storm");
    expect(a.suggestIndoor).toBe(true);
    expect(a.waiver).toBe(true);
  });
  it("tập gym trong nhà không bị ảnh hưởng", () => {
    expect(weatherAdvice("gym", 17, 19, [{ hour: 18, precipProb: 85, code: 95 }]).risk).toBe("none");
  });
});

describe("dữ liệu ứng viên", () => {
  it("chuyển đổi ổn định và có lịch rảnh, vị trí đúng khoảng cách", () => {
    const c = CANDIDATES_DATA[0]!;
    const a = candidateToPartner(c, C);
    const b = candidateToPartner(c, C);
    expect(a.availability).toEqual(b.availability);
    expect(a.availability.length).toBeGreaterThan(0);
    expect(a.completionRate).toBeGreaterThan(0.5);
  });
  it("khung giờ hẹn → slot", () => {
    expect(windowToSlots(1, 5 * 60, 7 * 60)).toEqual(["1-dawn"]);
    expect(windowToSlots(5, 17 * 60, 21 * 60)).toEqual(["5-evening", "5-night"]);
  });
});
