import { describe, it, expect } from "vitest";
import { UT_CONFIG, getUtBand, formatUt, legacyTsToUt } from "./config";
import {
  keoStage,
  computeUt,
  verdictFor,
  settleKeo,
  cancelPreview,
  canUseGrace,
  canApologize,
  hostLeaves,
  classifyEdit,
  rejectEditProposal,
  isRecreateKick,
  groupHostBanUntil,
  keosCreatedToday,
  canCreateKeo,
  canJoinKeo,
  overlapsCommitment,
  compensationFor,
  soloSessionCounts,
  type UtEvent,
} from "./ut-rules";

const START = "2026-11-14T05:30:00+07:00";
const at = (minFromStart: number) => new Date(Date.parse(START) + minFromStart * 60_000).toISOString();
const LOCKED = { startsAt: START, lockedAt: at(-24 * 60), acceptedBy: ["b"] };

describe("Thang UT 0–10", () => {
  it("mọi tài khoản bắt đầu ở 7 (Cần chú ý)", () => {
    expect(UT_CONFIG.INITIAL).toBe(7);
    expect(computeUt([]).score).toBe(7);
    expect(getUtBand(7)).toBe("watch");
  });

  it("biên các mức", () => {
    expect(getUtBand(0)).toBe("low");
    expect(getUtBand(4.75)).toBe("low");
    expect(getUtBand(5)).toBe("limited");
    expect(getUtBand(6.75)).toBe("limited");
    expect(getUtBand(8.75)).toBe("watch");
    expect(getUtBand(9)).toBe("high");
    expect(getUtBand(12)).toBe("high");
    expect(getUtBand(-3)).toBe("low");
  });

  it("định dạng kiểu Việt và quy đổi dữ liệu TS cũ", () => {
    expect(formatUt(7.5)).toBe("7,5");
    expect(formatUt(-0.25)).toBe("−0,25");
    expect(formatUt(0.5, { sign: true })).toBe("+0,5");
    expect(legacyTsToUt(150)).toBe(10);
    expect(legacyTsToUt(125)).toBe(8.5);
  });

  it("phạt không chuyển cho ai; bất khả kháng không trừ", () => {
    expect(UT_CONFIG.PENALTY_POLICY.creditsOtherUsers).toBe(false);
    expect(UT_CONFIG.PENALTY_POLICY.reviewerRewardFromPenalty).toBe(0);
    expect(UT_CONFIG.WEATHER_CHANGE_PENALTY).toBe(0);
  });
});

describe("Giai đoạn kèo G0/G1/G2", () => {
  it("chưa chốt thì huỷ / rút / từ chối không bị phạt — kể cả host", () => {
    expect(keoStage({})).toBe("open");
    expect(keoStage({ acceptedBy: ["b"] })).toBe("pending");
    expect(verdictFor({ startsAt: START }, { cancelledAt: at(-5) }).delta).toBe(0);
    expect(verdictFor({ startsAt: START, acceptedBy: ["b"] }, { cancelledAt: at(-5) }).delta).toBe(0);
    expect(cancelPreview({ startsAt: START, acceptedBy: ["b"] }, at(-5)).nowDelta).toBe(0);
  });
});

describe("Bảng phạt sau khi đã chốt", () => {
  it("huỷ sớm −0,25, huỷ trong 30 phút −0,5", () => {
    expect(verdictFor(LOCKED, { cancelledAt: at(-31) })).toMatchObject({ kind: "cancel_early", delta: -0.25 });
    expect(verdictFor(LOCKED, { cancelledAt: at(-30) })).toMatchObject({ kind: "cancel_late", delta: -0.5 });
    expect(verdictFor(LOCKED, { cancelledAt: at(5) })).toMatchObject({ kind: "absent_declared", delta: -1 });
  });

  it("trễ ≤ 15 phút đúng hẹn, 15–25 phút −0,25, quá 25 phút tính vắng −1", () => {
    expect(verdictFor(LOCKED, { checkInAt: at(15) }).kind).toBe("on_time");
    expect(verdictFor(LOCKED, { checkInAt: at(16) })).toMatchObject({ kind: "late_15_25", delta: -0.25 });
    expect(verdictFor(LOCKED, { checkInAt: at(25) }).kind).toBe("late_15_25");
    expect(verdictFor(LOCKED, { checkInAt: at(26) })).toMatchObject({ kind: "absent_declared", delta: -1 });
  });

  it("vắng có báo trong 24h −1, vắng im lặng −1,5", () => {
    expect(verdictFor(LOCKED, { declaredAbsentAt: at(23 * 60) }).delta).toBe(-1);
    expect(verdictFor(LOCKED, { declaredAbsentAt: at(25 * 60) }).delta).toBe(-1.5);
    expect(verdictFor(LOCKED, {}).kind).toBe("absent_silent");
  });

  it("không xác nhận lần cuối → kèo tự huỷ, −0,5", () => {
    expect(verdictFor(LOCKED, { confirmed: false })).toMatchObject({ kind: "unconfirmed", delta: -0.5 });
  });

  it("bất khả kháng: không ai bị trừ", () => {
    expect(verdictFor({ ...LOCKED, forceMajeure: true }, {}).delta).toBe(0);
  });

  it("cùng đồng ý huỷ: không phạt trong 4 lần/tháng, lần thứ 5 −0,25", () => {
    const k = { ...LOCKED, mutualCancelAt: at(-10) };
    expect(verdictFor(k, {}, { mutualUsedThisMonth: 3 }).delta).toBe(0);
    expect(verdictFor(k, {}, { mutualUsedThisMonth: 4 })).toMatchObject({ kind: "mutual_over_quota", delta: -0.25 });
  });

  it("cả hai im lặng không check-in → tính như cùng huỷ (không còn đường né phạt)", () => {
    const r = settleKeo(LOCKED, { a: {}, b: {} }, { a: 4, b: 0 });
    expect(r.treatedAsMutual).toBe(true);
    expect(r.verdicts.a!.kind).toBe("mutual_over_quota");
    expect(r.verdicts.b!.delta).toBe(0);
  });

  it("một người đến, một người bùng → người đến được ghi nhận, người bùng bị phạt", () => {
    const r = settleKeo(LOCKED, { a: { checkInAt: at(2) }, b: {} });
    expect(r.showedUp).toEqual(["a"]);
    expect(r.flaked).toEqual(["b"]);
    expect(r.verdicts.b!.kind).toBe("absent_silent");
  });

  it("nút Huỷ hiện rõ hậu quả", () => {
    expect(cancelPreview(LOCKED, at(-120)).labelVi).toBe("Huỷ bây giờ: −0,25 UT. Không đến: −1 UT");
    expect(cancelPreview(LOCKED, at(-10)).labelVi).toBe("Huỷ bây giờ: −0,5 UT. Không đến: −1 UT");
  });
});

describe("Tính điểm, hồi điểm, ân hạn & xin lỗi", () => {
  const NOW = "2026-11-30T12:00:00+07:00";
  const ev = (kind: UtEvent["kind"], iso: string, extra: Partial<UtEvent> = {}): UtEvent => ({ id: `${kind}-${iso}`, kind, at: iso, ...extra });

  it("đúng hẹn +0,5 nhưng tối đa 1 lần/ngày và +1/tuần", () => {
    const events = [
      ev("on_time", "2026-11-23T06:00:00+07:00"), // Thứ Hai
      ev("on_time", "2026-11-23T18:00:00+07:00"), // cùng ngày → 0
      ev("on_time", "2026-11-24T06:00:00+07:00"),
      ev("on_time", "2026-11-25T06:00:00+07:00"), // đã +1 tuần này → 0
    ];
    const r = computeUt(events, NOW);
    expect(r.ledger.map((l) => l.delta)).toEqual([0.5, 0, 0.5, 0]);
    expect(r.score).toBe(8);
  });

  it("vắng im lặng −1,5 cần ít nhất 2 tuần đi đều mới gỡ lại", () => {
    const events = [
      ev("absent_silent", "2026-11-02T06:00:00+07:00"),
      ev("on_time", "2026-11-03T06:00:00+07:00"),
      ev("on_time", "2026-11-04T06:00:00+07:00"),
      ev("on_time", "2026-11-05T06:00:00+07:00"),
    ];
    expect(computeUt(events, NOW).score).toBe(6.5);
  });

  it("chỉ tính 90 ngày gần nhất; điểm kẹp trong [0, 10]", () => {
    expect(computeUt([ev("absent_silent", "2026-08-01T06:00:00+07:00")], NOW).score).toBe(7);
    const many = Array.from({ length: 8 }, (_, i) => ev("absent_silent", `2026-11-${String(10 + i).padStart(2, "0")}T06:00:00+07:00`));
    expect(computeUt(many, NOW).score).toBe(0);
  });

  it("thẻ ân hạn xoá phạt; xin lỗi giảm 0,5; cả hai không áp dụng vắng im lặng", () => {
    expect(computeUt([ev("cancel_late", "2026-11-20T06:00:00+07:00", { waiver: "grace" })], NOW).score).toBe(7);
    expect(computeUt([ev("absent_declared", "2026-11-20T06:00:00+07:00", { waiver: "apology" })], NOW).score).toBe(6.5);
    expect(computeUt([ev("cancel_early", "2026-11-20T06:00:00+07:00", { waiver: "apology" })], NOW).score).toBe(7);
    expect(computeUt([ev("absent_silent", "2026-11-20T06:00:00+07:00", { waiver: "apology" })], NOW).score).toBe(5.5);
    expect(canUseGrace("cancel_late", 0).ok).toBe(true);
    expect(canUseGrace("cancel_late", 1).ok).toBe(false);
    expect(canUseGrace("absent_silent", 0).ok).toBe(false);
    expect(canApologize("absent_declared", 0).ok).toBe(true);
    expect(canApologize("absent_declared", 1).ok).toBe(false);
    expect(canApologize("absent_silent", 0).ok).toBe(false);
  });
});

describe("Luật riêng cho host", () => {
  it("H2: host rút → kèo giữ nguyên, quyền host chuyển cho người UT cao nhất, chỗ mở lại", () => {
    const r = hostLeaves(
      { ...LOCKED, hostId: "h", members: [{ id: "h", ut: 9 }, { id: "a", ut: 7.5 }, { id: "b", ut: 8.5 }] },
      at(-60)
    );
    expect(r.newHostId).toBe("b");
    expect(r.reopen).toBe(true);
    expect(r.soloChoice).toBe(false);
    expect(r.hostVerdict.kind).toBe("cancel_early");
  });

  it("H2: kèo 1-1, host rút → người còn lại thành host, được chọn kèo thay thế hoặc tự tập", () => {
    const r = hostLeaves({ ...LOCKED, hostId: "h", members: [{ id: "h", ut: 9 }, { id: "a", ut: 7 }] }, at(-10));
    expect(r.newHostId).toBe("a");
    expect(r.soloChoice).toBe(true);
    expect(r.hostVerdict.kind).toBe("cancel_late");
  });

  it("H1: dời ≤ 10 phút là nhỏ; dời > 10 phút, đổi chỗ > 1 km, đổi môn là lớn", () => {
    expect(classifyEdit({ shiftMin: 10 })).toBe("minor");
    expect(classifyEdit({ shiftMin: -15 })).toBe("major");
    expect(classifyEdit({ moveKm: 1.5 })).toBe("major");
    expect(classifyEdit({ sportChanged: true })).toBe("major");
    const r = rejectEditProposal(LOCKED, at(-20));
    expect(r.partnerVerdict.delta).toBe(0);
    expect(r.hostVerdict.kind).toBe("cancel_late");
  });

  it("H3: huỷ rồi tạo lại kèo gần giống trong 2h là đá người", () => {
    const old = { sport: "running", startsAt: START, lat: 10.79, lng: 106.72, cancelledAt: at(-300) };
    expect(isRecreateKick(old, { sport: "running", startsAt: at(30), lat: 10.791, lng: 106.721, createdAt: at(-250) })).toBe(true);
    expect(isRecreateKick(old, { sport: "running", startsAt: at(30), lat: 10.791, lng: 106.721, createdAt: at(-100) })).toBe(false);
    expect(isRecreateKick(old, { sport: "gym", startsAt: at(30), lat: 10.791, lng: 106.721, createdAt: at(-250) })).toBe(false);
  });

  it("H4: host vắng 2 kèo nhóm trong 30 ngày → khoá tạo kèo nhóm 7 ngày", () => {
    expect(groupHostBanUntil(["2026-11-01T06:00:00Z"], "2026-11-05T00:00:00Z")).toBeNull();
    const until = groupHostBanUntil(["2026-11-01T06:00:00Z", "2026-11-04T06:00:00Z"], "2026-11-05T00:00:00Z");
    expect(until).toBe("2026-11-11T06:00:00.000Z");
    expect(canCreateKeo({ ut: 9, createdToday: 0, kind: "group", groupBanUntil: until, now: "2026-11-05T00:00:00Z" }).ok).toBe(false);
    expect(canCreateKeo({ ut: 9, createdToday: 0, kind: "personal", groupBanUntil: until, now: "2026-11-05T00:00:00Z" }).ok).toBe(true);
  });
});

describe("Hạn mức tạo kèo theo ngày lịch & xếp nhóm", () => {
  it("đếm kèo tạo từ 00:00 đến 00:00 hôm sau", () => {
    const now = new Date(2026, 10, 12, 23, 50);
    const created = [new Date(2026, 10, 12, 0, 5), new Date(2026, 10, 12, 22, 0), new Date(2026, 10, 11, 23, 59)].map((d) => d.toISOString());
    expect(keosCreatedToday(created, now)).toBe(2);
  });

  it("thấp 0, hạn chế 1, cần chú ý 2, uy tín cao 3 kèo/ngày", () => {
    expect(canCreateKeo({ ut: 4.5, createdToday: 0, kind: "group" }).ok).toBe(false);
    expect(canCreateKeo({ ut: 5, createdToday: 1, kind: "personal" }).ok).toBe(false);
    expect(canCreateKeo({ ut: 7, createdToday: 1, kind: "personal" })).toMatchObject({ ok: true, remaining: 1 });
    expect(canCreateKeo({ ut: 9, createdToday: 3, kind: "personal" }).ok).toBe(false);
  });

  it("uy tín thấp chỉ vào kèo nhóm và không chung nhóm với người mới", () => {
    const low = { ut: 4, onTimeSessions: 20 };
    const newbie = { ut: 7, onTimeSessions: 0 };
    const vet = { ut: 8, onTimeSessions: 30 };
    expect(canJoinKeo(low, { kind: "personal", members: [vet] }).ok).toBe(false);
    expect(canJoinKeo(low, { kind: "group", members: [vet] }).ok).toBe(true);
    expect(canJoinKeo(low, { kind: "group", members: [vet, newbie] }).ok).toBe(false);
    expect(canJoinKeo(newbie, { kind: "group", members: [vet, low] }).ok).toBe(false);
    expect(canJoinKeo(low, { kind: "group", members: [vet], newbieFriendly: true }).ok).toBe(false);
  });

  it("chặn lịch chồng: cần thời lượng buổi + 30 phút di chuyển", () => {
    const c = [{ startsAt: at(0), endsAt: at(60) }];
    expect(overlapsCommitment(c, { startsAt: at(80), endsAt: at(140) })).toBe(true);
    expect(overlapsCommitment(c, { startsAt: at(90), endsAt: at(150) })).toBe(false);
  });
});

describe("Gói bù cho người đã đến", () => {
  const base = { showedUp: true, validSessions: 3, xuThisMonth: 0, streakProtectUsedThisMonth: 0, now: "2026-11-20T00:00:00Z" };
  it("+5 Xu từ quỹ, bảo vệ chuỗi, kèo thay thế", () => {
    expect(compensationFor(base)).toMatchObject({ xu: 5, streakProtected: true, replacementKeo: true });
  });
  it("tối đa 30 Xu/tháng, cùng cặp 1 lần/30 ngày, cần ≥ 1 buổi hợp lệ, bảo vệ chuỗi 2 lần/tháng", () => {
    expect(compensationFor({ ...base, xuThisMonth: 28 }).xu).toBe(2);
    expect(compensationFor({ ...base, lastCompensatedWithSamePairAt: "2026-11-01T00:00:00Z" }).xu).toBe(0);
    expect(compensationFor({ ...base, validSessions: 0 }).xu).toBe(0);
    expect(compensationFor({ ...base, streakProtectUsedThisMonth: 2 }).streakProtected).toBe(false);
    expect(compensationFor({ ...base, showedUp: false }).eligible).toBe(false);
  });
  it("buổi tự tập có xác thực: ≥ 30 phút tại điểm hẹn, 1 lần/ngày", () => {
    expect(soloSessionCounts(30, false)).toBe(true);
    expect(soloSessionCounts(29, false)).toBe(false);
    expect(soloSessionCounts(45, true)).toBe(false);
  });
});
