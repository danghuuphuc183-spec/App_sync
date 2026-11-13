/**
 * CLUB OS (B2B core): roster · bảng tin · sự kiện check-in QR · nhóm kín (private pool) · mời thành viên.
 *
 * Quy tắc gia nhập (đã SỬA): CSV / domain email chỉ GỬI lời mời hoặc yêu cầu —
 * không bao giờ tự thêm ai vào CLB. Người được mời phải tự bấm Chấp nhận.
 */

export type ClubRole = "owner" | "admin" | "mentor" | "member";

export interface ClubMember {
  id: string;
  name: string;
  avatar: string;
  role: ClubRole;
  joinedAt: string;
  /** số lần check-in sự kiện CLB */
  checkIns: number;
  lastActiveAt: string;
}

export type InviteKind = "email" | "phone";
export type InviteSource = "manual" | "csv" | "domain";

export interface Invitation {
  id: string;
  clubId: string;
  clubName: string;
  contact: string;
  kind: InviteKind;
  source: InviteSource;
  status: "sent" | "accepted" | "declined";
  sentAt: string;
  /** người dùng nhận lời mời (khi đã biết tài khoản) */
  userId?: string;
  note?: string;
}

export interface BulletinPost {
  id: string;
  authorId: string;
  title: string;
  body: string;
  pinned: boolean;
  createdAt: string;
  readBy: string[];
}

export interface ClubEvent {
  id: string;
  title: string;
  placeName: string;
  startsAt: string;
  endsAt: string;
  capacity: number;
  rsvp: string[];
  checkIns: { memberId: string; at: string }[];
  /** bí mật sinh mã QR xoay vòng — chỉ ban chủ nhiệm thấy */
  qrSecret: string;
  /** chỉ thành viên CLB thấy & tham gia */
  membersOnly: boolean;
}

export interface PoolKeo {
  id: string;
  title: string;
  hostId: string;
  timeVi: string;
  placeName: string;
  slots: number;
  joined: string[];
}

export interface Club {
  id: string;
  name: string;
  sportVi: string;
  areaVi: string;
  members: ClubMember[];
  invitations: Invitation[];
  bulletin: BulletinPost[];
  events: ClubEvent[];
  /** nhóm kín: kèo chỉ thành viên thấy */
  privatePool: { enabled: boolean; keos: PoolKeo[] };
  /** domain email được gợi ý mời (vd. ftu.edu.vn) — chỉ gửi lời mời, không tự thêm */
  inviteDomains: string[];
}

/* ------------------------------------------------------------------ */
/* Quyền                                                                */
/* ------------------------------------------------------------------ */
export const memberOf = (club: Club, userId: string) => club.members.find((m) => m.id === userId);
export const isMember = (club: Club, userId: string) => !!memberOf(club, userId);
export const canManage = (club: Club, userId: string) => ["owner", "admin"].includes(memberOf(club, userId)?.role ?? "");

/* ------------------------------------------------------------------ */
/* Mời: thủ công · CSV · domain → chỉ GỬI lời mời                      */
/* ------------------------------------------------------------------ */
const EMAIL_RE = /^[^\s@,;]+@[^\s@,;]+\.[a-z]{2,}$/i;
const PHONE_RE = /^(\+84|0)\d{9,10}$/;

export function classifyContact(raw: string): { contact: string; kind: InviteKind } | null {
  const v = raw.trim().replace(/^"|"$/g, "");
  if (EMAIL_RE.test(v)) return { contact: v.toLowerCase(), kind: "email" };
  const phone = v.replace(/[\s.-]/g, "");
  if (PHONE_RE.test(phone)) return { contact: phone.startsWith("+84") ? `0${phone.slice(3)}` : phone, kind: "phone" };
  return null;
}

/** Đọc CSV (cột bất kỳ chứa email/SĐT; bỏ dòng tiêu đề) → danh bạ hợp lệ, không trùng */
export function parseInviteCsv(text: string) {
  const contacts: { contact: string; kind: InviteKind }[] = [];
  const invalid: string[] = [];
  const seen = new Set<string>();
  let duplicates = 0;
  for (const line of text.split(/\r?\n/)) {
    if (!line.trim()) continue;
    const cells = line.split(/[,;\t]/);
    const hit = cells.map(classifyContact).find(Boolean);
    if (!hit) {
      if (!/email|sđt|phone|tên|name/i.test(line)) invalid.push(line.trim());
      continue;
    }
    if (seen.has(hit.contact)) {
      duplicates++;
      continue;
    }
    seen.add(hit.contact);
    contacts.push(hit);
  }
  return { contacts, invalid, duplicates };
}

let seq = 0;
const newId = (p: string) => `${p}-${Date.now().toString(36)}-${(seq++).toString(36)}`;

/**
 * Gửi lời mời. KHÔNG thêm thành viên. Bỏ qua liên hệ đã có lời mời đang chờ.
 */
export function sendInvites(club: Club, contacts: ReadonlyArray<{ contact: string; kind: InviteKind }>, source: InviteSource, now = new Date()) {
  const pending = new Set(club.invitations.filter((i) => i.status === "sent").map((i) => i.contact));
  const fresh = contacts.filter((c) => !pending.has(c.contact));
  const invitations: Invitation[] = fresh.map((c) => ({
    id: newId("inv"),
    clubId: club.id,
    clubName: club.name,
    contact: c.contact,
    kind: c.kind,
    source,
    status: "sent",
    sentAt: now.toISOString(),
  }));
  return { club: { ...club, invitations: [...invitations, ...club.invitations] }, sent: invitations.length, skipped: contacts.length - fresh.length };
}

export const emailDomain = (email: string) => email.split("@")[1]?.toLowerCase() ?? "";

/** Người dùng có email ĐÃ XÁC THỰC thuộc domain của CLB → tạo LỜI MỜI (chờ họ chấp nhận), không tự gia nhập */
export function domainInviteFor(club: Club, user: { id: string; email: string; emailVerified: boolean }, now = new Date()): Invitation | null {
  if (!user.emailVerified || isMember(club, user.id)) return null;
  const domain = emailDomain(user.email);
  if (!club.inviteDomains.some((d) => domain === d || domain.endsWith(`.${d}`))) return null;
  if (club.invitations.some((i) => i.userId === user.id && i.status !== "declined")) return null;
  return {
    id: newId("inv"),
    clubId: club.id,
    clubName: club.name,
    contact: user.email,
    kind: "email",
    source: "domain",
    status: "sent",
    sentAt: now.toISOString(),
    userId: user.id,
    note: `Email @${domain} của bạn đã xác thực`,
  };
}

/** Chỉ ở đây thành viên mới được thêm: khi CHÍNH người được mời bấm Chấp nhận */
export function respondInvitation(
  club: Club,
  invitationId: string,
  accept: boolean,
  me: { id: string; name: string; avatar: string },
  now = new Date()
): Club {
  const inv = club.invitations.find((i) => i.id === invitationId);
  if (!inv || inv.status !== "sent") return club;
  if (inv.userId && inv.userId !== me.id) return club;
  const invitations = club.invitations.map((i) => (i.id === invitationId ? { ...i, status: accept ? ("accepted" as const) : ("declined" as const), userId: me.id } : i));
  if (!accept || isMember(club, me.id)) return { ...club, invitations };
  const member: ClubMember = { id: me.id, name: me.name, avatar: me.avatar, role: "member", joinedAt: now.toISOString(), checkIns: 0, lastActiveAt: now.toISOString() };
  return { ...club, invitations, members: [...club.members, member] };
}

/* ------------------------------------------------------------------ */
/* Roster                                                               */
/* ------------------------------------------------------------------ */
export function setRole(club: Club, actorId: string, memberId: string, role: ClubRole): Club {
  if (!canManage(club, actorId) || role === "owner") return club;
  const target = memberOf(club, memberId);
  if (!target || target.role === "owner") return club;
  return { ...club, members: club.members.map((m) => (m.id === memberId ? { ...m, role } : m)) };
}

export function removeMember(club: Club, actorId: string, memberId: string): Club {
  if (!canManage(club, actorId)) return club;
  if (memberOf(club, memberId)?.role === "owner") return club;
  return { ...club, members: club.members.filter((m) => m.id !== memberId) };
}

/** Thành viên hoạt động trong N ngày */
export function activeMembers(club: Club, days = 30, now = new Date()) {
  const since = now.getTime() - days * 86_400_000;
  return club.members.filter((m) => new Date(m.lastActiveAt).getTime() >= since);
}

/* ------------------------------------------------------------------ */
/* Bảng tin                                                             */
/* ------------------------------------------------------------------ */
export function postBulletin(club: Club, actorId: string, title: string, body: string, pinned = false, now = new Date()): Club {
  if (!canManage(club, actorId) || !title.trim()) return club;
  const post: BulletinPost = { id: newId("post"), authorId: actorId, title: title.trim(), body: body.trim(), pinned, createdAt: now.toISOString(), readBy: [actorId] };
  return { ...club, bulletin: [post, ...club.bulletin] };
}

export const togglePin = (club: Club, actorId: string, postId: string): Club =>
  canManage(club, actorId) ? { ...club, bulletin: club.bulletin.map((p) => (p.id === postId ? { ...p, pinned: !p.pinned } : p)) } : club;

export const sortedBulletin = (club: Club) =>
  [...club.bulletin].sort((a, b) => Number(b.pinned) - Number(a.pinned) || b.createdAt.localeCompare(a.createdAt));

/* ------------------------------------------------------------------ */
/* Sự kiện check-in QR (mã xoay vòng 60 giây)                           */
/* ------------------------------------------------------------------ */
export const QR_WINDOW_SEC = 60;

const hash = (s: string) => [...s].reduce((h, c) => (Math.imul(h, 31) + c.charCodeAt(0)) >>> 0, 2166136261).toString(36);

export function eventQrToken(ev: ClubEvent, now = new Date()) {
  const w = Math.floor(now.getTime() / 1000 / QR_WINDOW_SEC);
  return `${ev.id}.${w}.${hash(`${ev.qrSecret}:${w}`)}`;
}

export type CheckInResult = { ok: true; event: ClubEvent } | { ok: false; reason: string };

export function checkInWithQr(club: Club, eventId: string, memberId: string, token: string, now = new Date()): CheckInResult {
  const ev = club.events.find((e) => e.id === eventId);
  if (!ev) return { ok: false, reason: "Không tìm thấy sự kiện" };
  if (ev.membersOnly && !isMember(club, memberId)) return { ok: false, reason: "Sự kiện chỉ dành cho thành viên CLB" };
  const t = now.getTime();
  if (t < new Date(ev.startsAt).getTime() - 30 * 60_000 || t > new Date(ev.endsAt).getTime()) return { ok: false, reason: "Ngoài giờ check-in (mở trước 30 phút đến khi kết thúc)" };
  const valid = [0, -1].some((d) => eventQrToken(ev, new Date(t + d * QR_WINDOW_SEC * 1000)) === token);
  if (!valid) return { ok: false, reason: "Mã QR không đúng hoặc đã hết hạn — quét lại mã đang hiển thị" };
  if (ev.checkIns.some((c) => c.memberId === memberId)) return { ok: false, reason: "Bạn đã check-in sự kiện này" };
  return { ok: true, event: { ...ev, checkIns: [...ev.checkIns, { memberId, at: now.toISOString() }] } };
}

export function applyCheckIn(club: Club, ev: ClubEvent, memberId: string, now = new Date()): Club {
  return {
    ...club,
    events: club.events.map((e) => (e.id === ev.id ? ev : e)),
    members: club.members.map((m) => (m.id === memberId ? { ...m, checkIns: m.checkIns + 1, lastActiveAt: now.toISOString() } : m)),
  };
}

export function toggleRsvp(club: Club, eventId: string, userId: string): Club {
  return {
    ...club,
    events: club.events.map((e) => {
      if (e.id !== eventId) return e;
      if (e.rsvp.includes(userId)) return { ...e, rsvp: e.rsvp.filter((x) => x !== userId) };
      if ((e.membersOnly && !isMember(club, userId)) || e.rsvp.length >= e.capacity) return e;
      return { ...e, rsvp: [...e.rsvp, userId] };
    }),
  };
}

/* ------------------------------------------------------------------ */
/* Nhóm kín (private pool)                                              */
/* ------------------------------------------------------------------ */
/** Người ngoài CLB không thấy kèo trong nhóm kín */
export const visiblePoolKeos = (club: Club, viewerId: string) => (club.privatePool.enabled && isMember(club, viewerId) ? club.privatePool.keos : []);

export function joinPoolKeo(club: Club, keoId: string, userId: string): Club {
  if (!isMember(club, userId)) return club;
  return {
    ...club,
    privatePool: {
      ...club.privatePool,
      keos: club.privatePool.keos.map((k) => (k.id === keoId && !k.joined.includes(userId) && k.joined.length < k.slots ? { ...k, joined: [...k.joined, userId] } : k)),
    },
  };
}
