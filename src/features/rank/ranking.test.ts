import { describe, it, expect } from "vitest";
import { RANK_LEVELS, canCreateKeo, nextRank, rankFor } from "./ranking";

describe("ranking 6 cấp tách khỏi TS", () => {
  it("đúng 6 cấp, theo số buổi đã xác thực", () => {
    expect(RANK_LEVELS).toHaveLength(6);
    expect(rankFor(0).id).toBe("rookie");
    expect(rankFor(9).id).toBe("rookie");
    expect(rankFor(10).id).toBe("regular");
    expect(rankFor(30).id).toBe("disciplined");
    expect(rankFor(250).id).toBe("legend");
  });

  it("3 cấp đầu mở công cụ có giới hạn; 3 cấp cao chỉ là danh hiệu, không thêm quyền", () => {
    const [a, b, c, d, e, f] = RANK_LEVELS;
    expect([a, b, c].every((r) => !r!.titleOnly)).toBe(true);
    expect([d, e, f].every((r) => r!.titleOnly)).toBe(true);
    expect(a!.tools.maxOpenKeos).toBeLessThan(b!.tools.maxOpenKeos);
    for (const r of [d, e, f]) expect(r!.tools).toEqual(c!.tools);
  });

  it("chặn công cụ vượt cấp", () => {
    expect(canCreateKeo(0, 1, "personal").ok).toBe(false);
    expect(canCreateKeo(0, 0, "group", 4).ok).toBe(false);
    expect(canCreateKeo(12, 0, "group", 6).ok).toBe(true);
    expect(canCreateKeo(500, 0, "group", 13).ok).toBe(false);
  });

  it("cấp tiếp theo và số buổi còn thiếu", () => {
    expect(nextRank(28)).toMatchObject({ next: { id: "disciplined" }, remaining: 2 });
    expect(nextRank(300)).toBeNull();
  });
});
