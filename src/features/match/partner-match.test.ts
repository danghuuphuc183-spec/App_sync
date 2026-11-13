import { describe, it, expect } from "vitest";
import {
  adjustedReliability,
  assessLocationRisk,
  commCompat,
  detectFakeGps,
  fitnessCompat,
  matchPartners,
  normalizeSessionTypes,
  reliabilityTier,
  scheduleOverlap,
  slotKey,
  spotterNeed,
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
  vibe: "friendly",
  commStyle: "chatty",
  sameGenderOnly: false,
  fitnessBand: "intermediate",
  completionRate: 0.95,
  completedSessions: 20,
  pings: [
    { lat: C[0], lng: C[1], t: now - 300 },
    { lat: C[0] + 0.001, lng: C[1], t: now },
  ],
  ...over,
});
const me = base({ id: "me", name: "Me" });
const jumpPings = [
  { lat: C[0], lng: C[1], t: now },
  { lat: C[0] + 0.05, lng: C[1], t: now + 30 },
];

describe("lõi: thời gian + loại buổi + GPS ≤ 3 km", () => {
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
});

describe("chuẩn hoá activity / session type / intensity / fitness band", () => {
  it("'calisthenics' cũ là session type → chuyển thành cali_strength, bỏ giá trị lạ", () => {
    expect(normalizeSessionTypes(["calisthenics", "push", "abc", "push"])).toEqual(["cali_strength", "push"]);
  });
  it("trình độ gần nhau + cùng cường độ điểm cao hơn", () => {
    expect(fitnessCompat("intermediate", "intermediate", "hard", "hard")).toBe(1);
    expect(fitnessCompat("intermediate", "advanced", "hard", "hard")).toBeGreaterThan(fitnessCompat("beginner", "elite", "hard", "hard"));
    expect(fitnessCompat("advanced", "advanced", "easy", "hard")).toBeLessThan(1);
  });
});

describe("vị trí: một tín hiệu không đủ kết luận", () => {
  it("chỉ GPS nhảy > 2 km/2 phút → vẫn được ghép, không bị loại", () => {
    expect(detectFakeGps(jumpPings).suspicious).toBe(true);
    const jumper = base({ id: "j", pings: jumpPings });
    expect(assessLocationRisk(jumper).level).toBe("clear");
    expect(matchPartners(me, [jumper], { sport: "running" }).matches).toHaveLength(1);
  });

  it("nhiều tín hiệu → chờ xác minh (vẫn ghép, có ghi chú)", () => {
    const risky = base({ id: "r", pings: jumpPings.map((x) => ({ ...x, mocked: true })) });
    const risk = assessLocationRisk(risky);
    expect(risk.signals).toEqual(["impossible_jump", "mock_location"]);
    expect(risk.level).toBe("review");
    const run = matchPartners(me, [risky], { sport: "running" });
    expect(run.matches).toHaveLength(1);
    expect(run.needsVerification).toBe(1);
  });

  it("nhiều tín hiệu + xác minh thất bại → hạn chế, được kháng nghị; kháng nghị/xác minh lại mở khoá", () => {
    const pings = jumpPings.map((x) => ({ ...x, mocked: true }));
    const failed = base({ id: "f", pings, locationVerification: "failed" });
    expect(assessLocationRisk(failed)).toMatchObject({ level: "restricted", canAppeal: true });
    expect(matchPartners(me, [failed], { sport: "running" }).excluded.locationRestricted).toBe(1);
    expect(assessLocationRisk({ ...failed, locationVerification: "appealed" }).level).toBe("review");
    expect(assessLocationRisk({ ...failed, locationVerification: "verified" }).level).toBe("clear");
  });
});

describe("độ tin cậy có điều chỉnh cỡ mẫu (không chia hàng đợi)", () => {
  it("ít buổi bị kéo về mức nền, nhiều buổi phản ánh đúng tỷ lệ", () => {
    expect(adjustedReliability(0, 1)).toBeGreaterThan(0.6);
    expect(adjustedReliability(0.5, 100)).toBeCloseTo(0.51, 2);
    expect(reliabilityTier(1, 0)).toBe("normal");
  });

  it("người hoàn thành thấp vẫn ghép được với người đáng tin, chỉ xếp hạng thấp hơn", () => {
    const low = base({ id: "low", completionRate: 0.4, completedSessions: 12 });
    const good = base({ id: "good" });
    const run = matchPartners(me, [low, good], { sport: "running" });
    expect(run.matches.map((m) => m.profile.id)).toEqual(["good", "low"]);
    const lowMe = { ...me, completionRate: 0.4, completedSessions: 10 };
    expect(matchPartners(lowMe, [good], { sport: "running" }).matches).toHaveLength(1);
  });
});

describe("chấm điểm", () => {
  it("ưu tiên cùng loại buổi, cùng vibe, cùng cách giao tiếp", () => {
    const best = base({ id: "best" });
    const otherVibe = base({ id: "vibe", vibe: "performance", commStyle: "quiet" });
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

  it("cách giao tiếp do người dùng chọn", () => {
    expect(commCompat("quiet", "quiet")).toBe(1);
    expect(commCompat("chatty", "motivating")).toBeGreaterThan(commCompat("chatty", "quiet"));
  });

  it("đỡ tạ dựa trên năng lực người kia tự nhận, không dựa trên cân nặng", () => {
    const lifter = { ...me, sports: ["gym"], workoutTypes: ["legs" as const], needsSpotter: true };
    expect(spotterNeed(lifter, base({ canSpot: true }), ["legs"])).toEqual({ applies: true, ok: true });
    expect(spotterNeed(lifter, base({ canSpot: false }), ["legs"])).toEqual({ applies: true, ok: false });
    expect(spotterNeed(lifter, base(), ["pull"]).applies).toBe(false);
    const gym = (over: Partial<PartnerProfile>) => base({ sports: ["gym"], workoutTypes: ["legs"], ...over });
    const run = matchPartners(lifter, [gym({ id: "no" }), gym({ id: "spot", canSpot: true })], { sport: "gym" });
    expect(run.matches[0]!.profile.id).toBe("spot");
  });

  it("giao thoa thời gian", () => {
    expect(scheduleOverlap(["a", "b"], ["b", "c", "d"]).score).toBe(0.5);
  });
});

describe("thời tiết: chỉ đề xuất Spot có thật, cần xác nhận", () => {
  const storm = [{ hour: 18, precipProb: 85, code: 95 }];
  const spots = [
    { id: "g1", name: "Gym gần", area: "Bình Thạnh", position: offsetKm(C, 1, 0) },
    { id: "g2", name: "Gym xa", area: "Q7", position: offsetKm(C, 9, 0) },
  ];
  it("mưa dông → đề xuất Spot gần nhất trong 5 km, cần xác nhận, đổi/huỷ không phạt", () => {
    const a = weatherAdvice("running", 17, 19, storm, { from: C, indoorSpots: spots });
    expect(a.risk).toBe("storm");
    expect(a.proposal?.id).toBe("g1");
    expect(a.requiresConfirmation).toBe(true);
    expect(a.penaltyFreeChange).toBe(true);
  });
  it("không có Spot phù hợp → không đề xuất bừa, vẫn cho huỷ/đổi không phạt", () => {
    const a = weatherAdvice("running", 17, 19, storm, { from: C, indoorSpots: [spots[1]!] });
    expect(a.proposal).toBeNull();
    expect(a.requiresConfirmation).toBe(false);
    expect(a.penaltyFreeChange).toBe(true);
  });
  it("tập gym trong nhà không bị ảnh hưởng", () => {
    expect(weatherAdvice("gym", 17, 19, storm).risk).toBe("none");
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
