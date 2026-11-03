import { describe, it, expect } from "vitest";
import { calculateCoachMatch, rankCoaches } from "./matchmaker";
import { SAMPLE_COACHES, DEFAULT_USER_PROFILE } from "./coaching.data";
import { UserCoachProfile } from "./coaching.types";

describe("Coaching Matchmaker & Ranking", () => {
  it("should calculate match scores within valid range [68, 99]", () => {
    SAMPLE_COACHES.forEach((coach) => {
      const match = calculateCoachMatch(coach, DEFAULT_USER_PROFILE);
      expect(match.matchScore).toBeGreaterThanOrEqual(68);
      expect(match.matchScore).toBeLessThanOrEqual(99);
      expect(match.matchReasons.length).toBeGreaterThan(0);
      expect(match.compatibilityHighlight).toBeTruthy();
    });
  });

  it("should boost rank for coach matching user's specific fitness goal", () => {
    // Posture correction goal
    const postureProfile: UserCoachProfile = {
      ...DEFAULT_USER_PROFILE,
      fitnessGoal: "chinh_dang_posture",
      preferredSport: "Gym & Kháng Lực",
    };

    const ranked = rankCoaches(SAMPLE_COACHES, postureProfile);
    expect(ranked[0]!.coach.specialties.some((s) => s.toLowerCase().includes("lưng") || s.toLowerCase().includes("tư thế"))).toBe(true);
  });

  it("should properly prioritize marathon coach when goal is marathon", () => {
    const runningProfile: UserCoachProfile = {
      ...DEFAULT_USER_PROFILE,
      fitnessGoal: "chay_marathon",
      preferredSport: "Chạy Bộ & Marathon",
    };

    const ranked = rankCoaches(SAMPLE_COACHES, runningProfile);
    expect(ranked[0]!.coach.name).toContain("Mai Linh");
    expect(ranked[0]!.matchScore).toBeGreaterThanOrEqual(90);
  });

  it("should respect budget when matching group coaching vs 1:1", () => {
    const tightBudgetGroupProfile: UserCoachProfile = {
      ...DEFAULT_USER_PROFILE,
      preferredMode: "group",
      maxBudgetPerSession: 150000,
    };

    const ranked = rankCoaches(SAMPLE_COACHES, tightBudgetGroupProfile);
    // Best match should be a coach whose group price <= 180,000
    const topCoachGroupPrice = ranked[0]!.coach.pricing.groupCoaching.pricePerPersonPerSession;
    expect(topCoachGroupPrice).toBeLessThanOrEqual(180000);
  });

  it("should filter correctly when searching by text query", () => {
    const filtered = rankCoaches(SAMPLE_COACHES, DEFAULT_USER_PROFILE, "Boxing");
    expect(filtered.length).toBe(1);
    expect(filtered[0]!.coach.name).toContain("Quân");
  });
});
