import { describe, it, expect } from "vitest";
import {
  activeMembers,
  checkInWithQr,
  classifyContact,
  domainInviteFor,
  eventQrToken,
  isMember,
  joinPoolKeo,
  parseInviteCsv,
  postBulletin,
  removeMember,
  respondInvitation,
  sendInvites,
  setRole,
  sortedBulletin,
  toggleRsvp,
  visiblePoolKeos,
} from "./club-os";
import { ME, seedClub } from "./club.data";
import { PAYMENT_CONFIG, quoteFee } from "./payments";

const outsider = { id: "out", name: "Người ngoài", avatar: "" };

describe("mời thành viên: CSV / domain chỉ gửi lời mời, phải tự Chấp nhận", () => {
  it("đọc CSV: email, SĐT, bỏ trùng, báo dòng lỗi", () => {
    const r = parseInviteCsv("Tên,Email\nLan,lan@ftu.edu.vn\nHưng,0903 123 456\nLan lại,LAN@ftu.edu.vn\nAi đó,abc");
    expect(r.contacts).toEqual([
      { contact: "lan@ftu.edu.vn", kind: "email" },
      { contact: "0903123456", kind: "phone" },
    ]);
    expect(r.duplicates).toBe(1);
    expect(r.invalid).toEqual(["Ai đó,abc"]);
    expect(classifyContact("+84903123456")).toEqual({ contact: "0903123456", kind: "phone" });
  });

  it("gửi lời mời CSV không thêm ai vào CLB", () => {
    const club = seedClub();
    const { club: c2, sent } = sendInvites(club, parseInviteCsv("a@x.vn\nb@x.vn").contacts, "csv");
    expect(sent).toBe(2);
    expect(c2.members).toHaveLength(club.members.length);
    expect(c2.invitations.filter((i) => i.status === "sent" && i.source === "csv")).toHaveLength(3);
  });

  it("domain: email đã xác thực → chỉ tạo lời mời; chưa xác thực → không", () => {
    const club = seedClub();
    expect(domainInviteFor(club, { id: "u9", email: "x@ftu.edu.vn", emailVerified: false })).toBeNull();
    expect(domainInviteFor(club, { id: "u9", email: "x@gmail.com", emailVerified: true })).toBeNull();
    const inv = domainInviteFor(club, { id: "u9", email: "x@sv.ftu.edu.vn", emailVerified: true });
    expect(inv).toMatchObject({ source: "domain", status: "sent", userId: "u9" });
    expect(isMember(club, "u9")).toBe(false);
  });

  it("chỉ khi người được mời Chấp nhận mới thành thành viên; Từ chối thì không", () => {
    const base = seedClub();
    const { club } = sendInvites(base, [{ contact: "new@x.vn", kind: "email" }], "manual");
    const inv = club.invitations[0]!;
    const declined = respondInvitation(club, inv.id, false, outsider);
    expect(isMember(declined, "out")).toBe(false);
    const accepted = respondInvitation(club, inv.id, true, outsider);
    expect(isMember(accepted, "out")).toBe(true);
    // lời mời gắn với người khác → không ai khác chấp nhận thay
    const own = { ...inv, id: "own", userId: "someone" };
    expect(isMember(respondInvitation({ ...club, invitations: [own] }, "own", true, outsider), "out")).toBe(false);
  });
});

describe("roster & bảng tin", () => {
  it("admin đổi vai trò, không động tới owner; member không quản lý được", () => {
    const club = seedClub();
    expect(setRole(club, "me", "u-td", "mentor").members.find((m) => m.id === "u-td")!.role).toBe("mentor");
    expect(setRole(club, "me", "u-owner", "member").members.find((m) => m.id === "u-owner")!.role).toBe("owner");
    expect(setRole(club, "u-td", "u-dt", "admin")).toBe(club);
    expect(removeMember(club, "me", "u-owner").members).toHaveLength(club.members.length);
  });
  it("hoạt động 30 ngày", () => {
    expect(activeMembers(seedClub()).map((m) => m.id)).not.toContain("u-yn");
  });
  it("bài ghim lên đầu, chỉ admin đăng", () => {
    const club = postBulletin(seedClub(), "me", "Mới", "Nội dung");
    expect(sortedBulletin(club)[0]!.pinned).toBe(true);
    expect(postBulletin(seedClub(), "u-td", "X", "Y").bulletin).toHaveLength(2);
  });
});

describe("sự kiện check-in QR", () => {
  it("mã QR xoay vòng; chỉ thành viên, đúng giờ, không check-in 2 lần", () => {
    const club = seedClub();
    const ev = club.events[0]!;
    const now = new Date(new Date(ev.startsAt).getTime() + 10 * 60_000);
    const token = eventQrToken(ev, now);
    const ok = checkInWithQr(club, ev.id, "me", token, now);
    expect(ok.ok).toBe(true);
    expect(checkInWithQr(club, ev.id, "out", token, now)).toMatchObject({ ok: false });
    expect(checkInWithQr(club, ev.id, "me", "sai", now)).toMatchObject({ ok: false });
    expect(checkInWithQr(club, ev.id, "u-ma", token, now)).toMatchObject({ ok: false, reason: "Bạn đã check-in sự kiện này" });
    const later = new Date(now.getTime() + 5 * 60_000);
    expect(checkInWithQr(club, ev.id, "me", token, later).ok).toBe(false); // mã cũ hết hạn
  });
  it("RSVP sự kiện kín chỉ cho thành viên", () => {
    const club = seedClub();
    expect(toggleRsvp(club, "ev-1", "out").events[0]!.rsvp).not.toContain("out");
    expect(toggleRsvp(club, "ev-2", "out").events[1]!.rsvp).toContain("out");
  });
});

describe("nhóm kín (private pool)", () => {
  it("người ngoài không thấy, không tham gia được", () => {
    const club = seedClub();
    expect(visiblePoolKeos(club, "out")).toEqual([]);
    expect(visiblePoolKeos(club, ME.id)).toHaveLength(2);
    expect(joinPoolKeo(club, "pk-1", "out").privatePool.keos[0]!.joined).not.toContain("out");
    expect(joinPoolKeo(club, "pk-1", ME.id).privatePool.keos[0]!.joined).toContain(ME.id);
  });
});

describe("thu phí qua đối tác, phí minh bạch", () => {
  it("phí nền tảng chỉ cho giao dịch đủ điều kiện, cộng đúng từng dòng", () => {
    const q = quoteFee("event_ticket", 100_000);
    expect(q.eligible).toBe(true);
    expect(q.platformFeeVnd).toBe(5_000);
    expect(q.processingFeeVnd).toBe(1_000);
    expect(q.clubReceivesVnd).toBe(94_000);
    expect(q.lines.at(-1)!.vnd).toBe(94_000);
  });
  it("không thu phí nền tảng trên quỹ phạt", () => {
    const q = quoteFee("penalty_fund", 50_000);
    expect(q.eligible).toBe(false);
    expect(q.platformFeeVnd).toBe(0);
    expect(PAYMENT_CONFIG.platformPercent.penalty_fund).toBe(0);
  });
});
