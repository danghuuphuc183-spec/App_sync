import { describe, it, expect } from "vitest";
import { SEED_KEOS } from "./keo.data";
import { acceptInto, canAccept, canDecline, declineMember, displayTitle, isOnBoardFor, lockedAtOf, spotsLeft, toCancelable } from "./keo-membership";
import { rankKeos } from "./keo.algo";
import { DEMO_VIEWER, hostTrust } from "./keo.data";
import type { Keo } from "./keo.types";

const oneToOne = SEED_KEOS.find((k) => k.id === "k-1")!; // 1:1, host hoangnam, 1/2
const group = SEED_KEOS.find((k) => k.id === "k-2")!; // nhóm 6/8, tiêu đề "— thiếu 2 người"

describe("Giữ chỗ khi nhận kèo", () => {
  it("1:1: người đầu tiên nhận được, kèo ẩn khỏi bảng của mọi người, người thứ hai bị chặn", () => {
    const first = acceptInto(oneToOne, "me")!;
    expect(first.memberIds).toEqual(["hoangnam", "me"]);
    expect(isOnBoardFor(first, "me")).toBe(false);
    expect(isOnBoardFor(first, "minhanh")).toBe(false);
    expect(acceptInto(first, "minhanh")).toBeNull();
    expect(canAccept(first, "minhanh")).toEqual({ ok: false, reasonVi: "Kèo vừa có người nhận." });
  });

  it("nhóm: mỗi người vào giảm số còn thiếu 1, đủ người thì ẩn", () => {
    expect(spotsLeft(group)).toBe(2);
    const a = acceptInto(group, "me")!;
    expect(spotsLeft(a)).toBe(1);
    expect(isOnBoardFor(a, "thuydung")).toBe(true);
    const b = acceptInto(a, "thuydung")!;
    expect(spotsLeft(b)).toBe(0);
    expect(isOnBoardFor(b, "baolong")).toBe(false);
    expect(acceptInto(b, "baolong")).toBeNull();
  });

  it("tiêu đề không còn ghi cứng số người thiếu", () => {
    expect(displayTitle(group)).toBe("Chạy nhóm bình minh Ba Son");
    expect(displayTitle({ ...group, title: "Bóng đá 7 người — thiếu 3" })).toBe("Bóng đá 7 người");
    expect(displayTitle(oneToOne)).toBe(oneToOne.title);
  });
});

describe("Host từ chối người nhận", () => {
  const inDays = (d: number, hhmm: string) => {
    const t = new Date();
    t.setDate(t.getDate() + d);
    return { day: `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, "0")}-${String(t.getDate()).padStart(2, "0")}`, from: hhmm, to: "23:59" };
  };
  const mine = (time: Keo["time"]): Keo => ({ ...oneToOne, id: "my-1", hostId: "me", memberIds: ["me", "hoangnam"], time, mine: true });

  it("được từ chối khi còn hơn 24 giờ; người bị từ chối bị bỏ ra, không còn thấy kèo, chỗ mở lại", () => {
    const keo = mine(inDays(3, "06:00"));
    expect(canDecline(keo, "hoangnam", "me").ok).toBe(true);
    const after = declineMember(keo, "hoangnam");
    expect(after.memberIds).toEqual(["me"]);
    expect(isOnBoardFor(after, "hoangnam")).toBe(false);
    expect(isOnBoardFor(after, "minhanh")).toBe(true);
    expect(canAccept(after, "hoangnam").ok).toBe(false);
    expect(rankKeos([after], { ...DEMO_VIEWER, id: "hoangnam" }, { hostTrust, sportLabel: (s) => s })).toEqual([]);
  });

  it("trong vòng 24 giờ trước giờ tập thì không được từ chối; người không phải host cũng không", () => {
    const now = new Date();
    const soon = new Date(now.getTime() + 5 * 3600_000);
    const keo = mine({ ...inDays(0, "00:00"), day: inDays(soon.getDate() === now.getDate() ? 0 : 1, "00:00").day, from: `${String(soon.getHours()).padStart(2, "0")}:00` });
    const r = canDecline(keo, "hoangnam", "me");
    expect(r.ok).toBe(false);
    expect(canDecline(mine(inDays(3, "06:00")), "hoangnam", "minhanh").ok).toBe(false);
  });
});

describe("Huỷ kèo đã nhận: mốc chốt trước giờ tập 24 giờ", () => {
  const keo: Keo = { ...oneToOne, memberIds: ["hoangnam", "me"], time: { day: "2026-11-20", from: "06:00", to: "07:00" } };
  const who = (id: string) => ({ name: id, ut: 8 });

  it("còn hơn 24 giờ: chưa chốt → rút không bị trừ", () => {
    const now = new Date(2026, 10, 18, 12, 0);
    expect(lockedAtOf(keo, now)).toBeUndefined();
    const c = toCancelable(keo, "me", who, now);
    expect(c.role).toBe("member");
    expect(c.lockedAt).toBeUndefined();
    expect(c.acceptedBy).toEqual(["me"]);
  });

  it("trong vòng 24 giờ: đã chốt tại mốc 06:00 hôm trước", () => {
    const now = new Date(2026, 10, 19, 21, 0);
    const c = toCancelable(keo, "me", who, now);
    expect(c.lockedAt).toBe(new Date(2026, 10, 19, 6, 0).toISOString());
    expect(c.members.map((m) => m.id)).toEqual(["hoangnam", "me"]);
  });

  it("kèo của mình chưa ai nhận thì không bao giờ chốt", () => {
    const mine: Keo = { ...keo, hostId: "me", memberIds: ["me"] };
    expect(toCancelable(mine, "me", who, new Date(2026, 10, 19, 21, 0)).lockedAt).toBeUndefined();
  });
});
