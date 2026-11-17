import { describe, it, expect } from "vitest";
import {
  RANK_LEVELS,
  canCreateKeo,
  nextRank,
  rankFor,
  getRankByExp,
  getNextRankProgress,
  checkRankUtCrossControl,
} from "./ranking";

describe("ranking 6 cấp bám sát master spec", () => {
  it("đúng 6 cấp theo chuẩn EXP và số buổi", () => {
    expect(RANK_LEVELS).toHaveLength(6);
    expect(RANK_LEVELS.map((r) => r.id)).toEqual([
      "rookie",
      "runner",
      "pacer",
      "iron_core",
      "vanguard",
      "legend",
    ]);

    // Test theo EXP
    expect(getRankByExp(0).id).toBe("rookie");
    expect(getRankByExp(599).id).toBe("rookie");
    expect(getRankByExp(600).id).toBe("runner");
    expect(getRankByExp(1240).id).toBe("runner");
    expect(getRankByExp(2000).id).toBe("pacer");
    expect(getRankByExp(4500).id).toBe("iron_core");
    expect(getRankByExp(9000).id).toBe("vanguard");
    expect(getRankByExp(18000).id).toBe("legend");
  });

  it("3 cấp đầu mở công cụ có giới hạn; 3 cấp cao chỉ là danh hiệu, không thêm quyền lực tạo kèo", () => {
    const [a, b, c, d, e, f] = RANK_LEVELS;
    expect([a, b, c].every((r) => !r!.titleOnly)).toBe(true);
    expect([d, e, f].every((r) => r!.titleOnly)).toBe(true);
    expect(a!.tools.maxOpenKeos).toBeLessThan(b!.tools.maxOpenKeos);
    for (const r of [d, e, f]) {
      expect(r!.tools.maxOpenKeos).toBe(c!.tools.maxOpenKeos);
      expect(r!.tools.maxGroupSize).toBe(c!.tools.maxGroupSize);
      expect(r!.tools.permanentSquad).toBe(c!.tools.permanentSquad);
      expect(r!.tools.recurringSlots).toBe(c!.tools.recurringSlots);
    }
  });

  it("tính tiến trình thăng cấp tiếp theo chính xác", () => {
    const p1 = getNextRankProgress(1240); // Đang ở Runner (600 - 1999)
    expect(p1.currentRank.id).toBe("runner");
    expect(p1.nextRank?.id).toBe("pacer");
    expect(p1.remainingExp).toBe(760); // 2000 - 1240
    expect(p1.progressPercent).toBe(46); // (1240 - 600) / (2000 - 600) = 640 / 1400 = 45.7% -> 46%

    const pMax = getNextRankProgress(20000);
    expect(pMax.currentRank.id).toBe("legend");
    expect(pMax.nextRank).toBeNull();
    expect(pMax.progressPercent).toBe(100);
  });

  it("cơ chế kiểm soát chéo UT (Trust Score) và Rank", () => {
    // Rank 2 (Runner) với UT >= 7: Đặc quyền kích hoạt
    const okCheck = checkRankUtCrossControl(2, 8.5);
    expect(okCheck.isPrivilegeActive).toBe(true);
    expect(okCheck.isRestricted).toBe(false);

    // Rank 3 nhưng UT rớt xuống 5.5: Hạn chế 1 kèo, đóng băng recurring slot
    const restrictedCheck = checkRankUtCrossControl(3, 5.5);
    expect(restrictedCheck.isPrivilegeActive).toBe(false);
    expect(restrictedCheck.isRestricted).toBe(true);
    expect(restrictedCheck.maxAllowedOpenKeos).toBe(1);
    expect(restrictedCheck.canCreateRecurringSlots).toBe(false);

    // Rank 3 nhưng UT rớt xuống 3.5 (Uy tín thấp): Khóa tạo kèo 1-1
    const lowTrustCheck = checkRankUtCrossControl(3, 3.5);
    expect(lowTrustCheck.isLowTrust).toBe(true);
    expect(lowTrustCheck.canCreatePersonalKeo).toBe(false);
  });

  it("chặn công cụ khi vượt giới hạn cấp hoặc UT hạn chế", () => {
    // Tân binh tạo quá 1 kèo
    expect(canCreateKeo(0, 1, "personal", 2, 8.5).ok).toBe(false);
    // Tân binh tạo kèo nhóm vượt 4 người
    expect(canCreateKeo(0, 0, "group", 6, 8.5).ok).toBe(false);
    // Runner tạo kèo nhóm 4 người với UT tốt
    expect(canCreateKeo(10, 0, "group", 4, 8.5).ok).toBe(true);
    // Khi bị UT thấp (< 5.0), khóa tạo kèo 1-1
    expect(canCreateKeo(1240, 0, "personal", 2, 4.0).ok).toBe(false);
  });

  it("cấp tiếp theo và số buổi còn thiếu", () => {
    expect(nextRank(5)).toMatchObject({ next: { id: "runner" }, remaining: 1 });
    expect(nextRank(130)).toBeNull();
  });
});
