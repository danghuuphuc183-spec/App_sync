import { describe, it, expect } from "vitest";
import {
  distanceKm,
  findGroups,
  findPersonalMatches,
  isGroupFormValid,
  isPersonalFormValid,
  rankKeos,
  timeOverlap,
  timeSlotOf,
} from "./keo.algo";
import { DEMO_VIEWER, SEED_KEOS, hostTrust, placesForSport } from "./keo.data";
import { CANDIDATES_DATA } from "@/features/match/candidates.data";
import type { GroupForm, PersonalForm } from "./keo.types";

const runPlace = placesForSport("running")[0]!;
const personal: PersonalForm = {
  sport: "running",
  place: runPlace,
  time: { day: "Ngày mai", from: "05:00", to: "07:00" },
  note: "",
  minTrust: 5.5,
};

describe("tiện ích thời gian", () => {
  it("phân khung giờ", () => {
    expect(timeSlotOf("05:30")).toBe("morning_early");
    expect(timeSlotOf("12:00")).toBe("noon");
    expect(timeSlotOf("17:30")).toBe("evening");
    expect(timeSlotOf("20:00")).toBe("night");
  });
  it("giao khung giờ chỉ khi cùng ngày", () => {
    expect(timeOverlap({ day: "Ngày mai", from: "05:00", to: "07:00" }, { day: "Ngày mai", from: "06:00", to: "08:00" })).toBe(0.5);
    expect(timeOverlap({ day: "Ngày mai", from: "05:00", to: "07:00" }, { day: "Hôm nay", from: "05:00", to: "07:00" })).toBe(0);
  });
  it("khoảng cách", () => {
    expect(distanceKm([10.8, 106.7], [10.8, 106.7])).toBe(0);
    expect(distanceKm([10.8, 106.7], [10.809, 106.7])).toBeCloseTo(1, 1);
  });
});

describe("kiểm tra form (nút Done active/disable)", () => {
  it("thiếu địa điểm hoặc giờ sai → không hợp lệ", () => {
    expect(isPersonalFormValid(personal)).toBe(true);
    expect(isPersonalFormValid({ ...personal, place: null })).toBe(false);
    expect(isPersonalFormValid({ ...personal, time: { day: "Ngày mai", from: "07:00", to: "06:00" } })).toBe(false);
  });
  it("nhóm: số người đã có phải nhỏ hơn số lượng", () => {
    const g: GroupForm = { ...personal, capacity: 4, present: 2 };
    expect(isGroupFormValid(g)).toBe(true);
    expect(isGroupFormValid({ ...g, present: 4 })).toBe(false);
  });
});

describe("findPersonalMatches", () => {
  it("tối đa 3 người, cùng môn, đạt uy tín tối thiểu, xếp theo độ tương thích", () => {
    const res = findPersonalMatches(personal, CANDIDATES_DATA);
    expect(res.length).toBeGreaterThan(0);
    expect(res.length).toBeLessThanOrEqual(3);
    for (const r of res) {
      expect(r.candidate.sport).toBe("running");
      expect(r.candidate.trustScore).toBeGreaterThanOrEqual(5.5);
    }
    const scores = res.map((r) => r.breakdown.totalScore);
    expect([...scores].sort((a, b) => b - a)).toEqual(scores);
  });
  it("uy tín yêu cầu quá cao → không có ai", () => {
    expect(findPersonalMatches({ ...personal, minTrust: 10.5 }, CANDIDATES_DATA)).toEqual([]);
  });
});

describe("findGroups", () => {
  const form: GroupForm = { ...personal, capacity: 6, present: 2, minTrust: 3.5 };
  it("chỉ trả nhóm cùng môn, trùng giờ, còn đủ chỗ cho số người bạn mang theo", () => {
    const res = findGroups(form, SEED_KEOS, { myTrust: 8.5, hostTrust });
    expect(res.map((r) => r.keo.id)).toEqual(expect.arrayContaining(["k-2", "k-10"]));
    for (const r of res) {
      expect(r.keo.sport).toBe("running");
      expect(r.missing).toBeGreaterThanOrEqual(2);
      expect(r.overlap).toBeGreaterThan(0);
    }
    expect(res.map((r) => r.keo.id)).not.toContain("k-9"); // khác ngày
  });
  it("mang theo nhiều người hơn số chỗ trống → loại", () => {
    const res = findGroups({ ...form, present: 4, capacity: 8 }, SEED_KEOS, { myTrust: 8.5, hostTrust });
    expect(res.map((r) => r.keo.id)).not.toContain("k-2"); // chỉ thiếu 2
  });
});

describe("rankKeos", () => {
  const ctx = { hostTrust, sportLabel: (s: string) => s };
  it("kèo gần + cùng môn yêu thích đứng đầu, loại kèo đã đủ người", () => {
    const res = rankKeos(SEED_KEOS, DEMO_VIEWER, ctx);
    expect(["running", "gym"]).toContain(res[0]!.keo.sport);
    expect(res.every((r) => r.spotsLeft > 0)).toBe(true);
    expect(res[0]!.reasons.length).toBeGreaterThan(0);
  });
  it("đánh dấu kèo yêu cầu uy tín cao hơn mình", () => {
    const res = rankKeos(SEED_KEOS, { ...DEMO_VIEWER, trustScore: 4 }, ctx);
    expect(res.find((r) => r.keo.id === "k-8")!.eligible).toBe(false);
  });
});
