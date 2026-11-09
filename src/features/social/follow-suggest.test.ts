import { describe, it, expect } from "vitest";
import { suggestFollows, sportAffinity, scoreCandidate } from "./follow-suggest";
import { DEMO_VIEWER, SUGGESTION_CANDIDATES } from "./suggestions.data";

describe("sportAffinity", () => {
  it("trùng hoàn toàn và trùng môn chính → 1", () => {
    expect(sportAffinity(["running", "gym"], ["running", "gym"])).toBe(1);
  });
  it("không chung môn → 0", () => {
    expect(sportAffinity(["running"], ["yoga"])).toBe(0);
  });
});

describe("suggestFollows", () => {
  it("loại người đã theo dõi, đã xoá và chính mình", () => {
    const res = suggestFollows(
      { ...DEMO_VIEWER, dismissedIds: ["u-giahuy"] },
      [...SUGGESTION_CANDIDATES, { ...SUGGESTION_CANDIDATES[3]!, id: "me" }]
    );
    const ids = res.map((r) => r.candidate.id);
    expect(ids).not.toContain("u-giahuy");
    expect(ids).not.toContain("me");
  });

  it("trộn người nổi tiếng ở vị trí đầu và cách đều", () => {
    const res = suggestFollows(DEMO_VIEWER, SUGGESTION_CANDIDATES, { featuredEvery: 3 });
    expect(res[0]!.track).toBe("featured");
    expect(res[3]!.track).toBe("featured");
    expect(res[1]!.track).toBe("peer");
  });

  it("người cùng CLB, cùng môn, nhiều bạn chung đứng đầu luồng peer", () => {
    const res = suggestFollows(DEMO_VIEWER, SUGGESTION_CANDIDATES);
    const firstPeer = res.find((r) => r.track === "peer")!;
    expect(firstPeer.candidate.id).toBe("u-giahuy");
    expect(firstPeer.reasonKind).toBe("mutual");
    expect(firstPeer.reason).toBe("3 bạn chung đang theo dõi");
  });

  it("người không chung môn bị xếp cuối luồng peer", () => {
    const res = suggestFollows(DEMO_VIEWER, SUGGESTION_CANDIDATES);
    const peers = res.filter((r) => r.track === "peer");
    expect(peers[peers.length - 1]!.candidate.id).toBe("u-phuonganh");
  });

  it("người nổi tiếng có lý do hiển thị số follower", () => {
    const s = scoreCandidate(DEMO_VIEWER, SUGGESTION_CANDIDATES[1]!);
    expect(s.reason).toContain("512K");
  });

  it("tôn trọng giới hạn số gợi ý", () => {
    expect(suggestFollows(DEMO_VIEWER, SUGGESTION_CANDIDATES, { limit: 4 })).toHaveLength(4);
  });
});
