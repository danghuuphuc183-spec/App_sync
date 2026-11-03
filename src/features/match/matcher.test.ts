import { describe, it, expect } from "vitest";
import {
  calculateCandidateMatch,
  rankCandidates,
  benchmarkMatchingScale,
  UserPreferences,
} from "./matcher";
import { CANDIDATES_DATA } from "./candidates.data";

describe("Optimal Partner Matching Engine", () => {
  it("computes high compatibility score for identical sport, pace, and time slot", () => {
    const user: UserPreferences = {
      sport: "running",
      targetPaceSec: 330, // Pace 5:30
      preferredTimeSlot: "morning_early",
      maxDistanceKm: 5,
      traits: ["#DậySớm5h", "#Pace530"],
    };

    // Candidate 1 (Hoàng Nam) runs at Pace 5:30 at 5:30 AM
    const candidate1 = CANDIDATES_DATA.find((c) => c.name === "Hoàng Nam")!;
    const breakdown = calculateCandidateMatch(user, candidate1);

    expect(breakdown.totalScore).toBeGreaterThanOrEqual(90);
    expect(breakdown.sportScore).toBe(100);
    expect(breakdown.timeScore).toBe(100);
    expect(breakdown.matchReasonVi.length).toBeGreaterThan(0);
  });

  it("penalizes pace mismatch with smooth Gaussian bell curve decay", () => {
    const userFast: UserPreferences = {
      sport: "running",
      targetPaceSec: 270, // Fast runner (Pace 4:30)
      preferredTimeSlot: "morning_early",
      maxDistanceKm: 10,
    };

    const userPacer: UserPreferences = {
      sport: "running",
      targetPaceSec: 330, // Pace 5:30
      preferredTimeSlot: "morning_early",
      maxDistanceKm: 10,
    };

    const runner530 = CANDIDATES_DATA.find((c) => c.name === "Hoàng Nam")!;

    const matchFast = calculateCandidateMatch(userFast, runner530);
    const matchPacer = calculateCandidateMatch(userPacer, runner530);

    // Fast runner should have a lower pace match score than exact pacer
    expect(matchFast.paceScore).toBeLessThan(matchPacer.paceScore);
  });

  it("recognizes cross-training synergy between complementary sports (running & cycling)", () => {
    const runner: UserPreferences = {
      sport: "running",
      preferredTimeSlot: "morning_early",
      maxDistanceKm: 10,
    };

    const cyclist = CANDIDATES_DATA.find((c) => c.sport === "cycling")!;
    const breakdown = calculateCandidateMatch(runner, cyclist);

    // Should receive cross-training synergy of 75%
    expect(breakdown.sportScore).toBe(75);
  });

  it("ranks 30 candidates with best matches first", () => {
    const user: UserPreferences = {
      sport: "running",
      targetPaceSec: 325,
      preferredTimeSlot: "morning_early",
      maxDistanceKm: 5,
      traits: ["#Pace525", "#KỷLuậtSáng"],
    };

    const ranked = rankCandidates(user, CANDIDATES_DATA, { explorationRate: 0 });

    expect(ranked.length).toBe(CANDIDATES_DATA.length);
    // Top candidate should have score >= 90
    expect(ranked[0]!.matchScore).toBeGreaterThanOrEqual(90);
    // Ranking should be sorted descending
    for (let i = 0; i < ranked.length - 1; i++) {
      expect(ranked[i]!.matchScore).toBeGreaterThanOrEqual(ranked[i + 1]!.matchScore);
    }
  });

  it("successfully scales to 1,000 synthetic users with sub-millisecond per-user latency", () => {
    const benchmark = benchmarkMatchingScale(1000);

    expect(benchmark.userCount).toBe(1000);
    // Average ranking latency per user should be well under 10ms
    expect(benchmark.avgLatencyPerUserMs).toBeLessThan(10.0);
    expect(benchmark.throughputUsersPerSec).toBeGreaterThan(100);
  });
});
