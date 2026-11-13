/**
 * GIỮ CHỖ, ẨN KÈO & HOST TỪ CHỐI (D35)
 *
 * 1) Nhận kèo là thao tác "ai nhanh người đó được": chỉ thêm người khi còn chỗ NGAY LÚC ĐÓ (`acceptInto`).
 *    Khi có backend phải làm trong 1 lệnh nguyên tử, vd. Postgres:
 *      UPDATE keo_members ... WHERE keo_id = $1 AND (SELECT count(*) ...) < capacity RETURNING *
 *    Không trả về hàng nào → báo "Kèo vừa có người nhận".
 * 2) Kèo 1:1 có người nhận → đủ 2/2 → biến khỏi "Kèo đang mở" của mọi người ngay.
 *    Kèo nhóm: mỗi người vào làm "còn thiếu" giảm 1; đủ người thì ẩn.
 * 3) Host được từ chối người đã nhận tới trước giờ tập 24 giờ. Người bị từ chối bị bỏ khỏi kèo,
 *    KHÔNG còn thấy kèo đó; chỗ trống mở lại trên bảng kèo cho người khác. Không ai bị trừ UT (giai đoạn chưa chốt, D23).
 */
import type { Keo } from "./keo.types";
import type { Member } from "@/features/trust/ut-rules";
import { sessionStart } from "./reminders";
import { normalizeKeoDay } from "./keo-date";

export const DECLINE_DEADLINE_HOURS = 24;

/** Bỏ đuôi "— thiếu 2 người" cũ trong tiêu đề: số người còn thiếu luôn tính từ dữ liệu */
export const displayTitle = (keo: Keo) => keo.title.replace(/\s*[—–-]\s*thiếu\s+\d+(\s+người)?\s*$/i, "");

export const spotsLeft = (keo: Keo) => Math.max(0, keo.capacity - keo.memberIds.length);

export const isDeclined = (keo: Keo, userId: string) => (keo.declinedIds ?? []).includes(userId);

export type AcceptCheck = { ok: true } | { ok: false; reasonVi: string };

export function canAccept(keo: Keo, userId: string): AcceptCheck {
  if (keo.hostId === userId) return { ok: false, reasonVi: "Đây là kèo của bạn." };
  if (isDeclined(keo, userId) || keo.status === "cancelled") return { ok: false, reasonVi: "Kèo này không còn khả dụng." };
  if (keo.memberIds.includes(userId)) return { ok: false, reasonVi: "Bạn đã ở trong kèo này." };
  if (spotsLeft(keo) === 0) return { ok: false, reasonVi: keo.kind === "group" ? "Nhóm vừa đủ người." : "Kèo vừa có người nhận." };
  return { ok: true };
}

/** Thêm người vào kèo nếu còn chỗ; hết chỗ → null (người đến sau không vào được) */
export function acceptInto(keo: Keo, userId: string): Keo | null {
  return canAccept(keo, userId).ok ? { ...keo, memberIds: [...keo.memberIds, userId] } : null;
}

/** Kèo có hiện trong "Kèo đang mở" của người xem không */
export function isOnBoardFor(keo: Keo, viewerId: string): boolean {
  return keo.hostId !== viewerId && !keo.memberIds.includes(viewerId) && !isDeclined(keo, viewerId) && spotsLeft(keo) > 0 && keo.status !== "cancelled";
}

export function startOf(keo: Keo): Date {
  return sessionStart(normalizeKeoDay(keo.time.day), keo.time.from);
}

export function declineDeadline(keo: Keo): Date {
  return new Date(startOf(keo).getTime() - DECLINE_DEADLINE_HOURS * 3600_000);
}

export type DeclineCheck = { ok: true; deadline: Date } | { ok: false; deadline: Date; reasonVi: string };

export function canDecline(keo: Keo, memberId: string, hostId: string, now: Date = new Date()): DeclineCheck {
  const deadline = declineDeadline(keo);
  if (keo.hostId !== hostId) return { ok: false, deadline, reasonVi: "Chỉ host được từ chối." };
  if (memberId === hostId || !keo.memberIds.includes(memberId)) return { ok: false, deadline, reasonVi: "Người này không ở trong kèo." };
  if (now > deadline) return { ok: false, deadline, reasonVi: `Đã quá hạn từ chối (trước giờ tập ${DECLINE_DEADLINE_HOURS} giờ).` };
  return { ok: true, deadline };
}

/** Host từ chối: bỏ người khỏi kèo, ghi vào danh sách bị từ chối, chỗ mở lại */
export function declineMember(keo: Keo, memberId: string): Keo {
  return {
    ...keo,
    memberIds: keo.memberIds.filter((id) => id !== memberId),
    declinedIds: [...new Set([...(keo.declinedIds ?? []), memberId])],
  };
}

/**
 * Kèo nhận trên Lên kèo CHỐT tại mốc trước giờ tập 24 giờ (trùng hạn host được từ chối, D36).
 * Trước mốc: huỷ/rút không bị trừ điểm (D23 G1). Sau mốc: áp bảng phạt UT (D24).
 */
export function lockedAtOf(keo: Keo, now: Date = new Date()): string | undefined {
  const d = declineDeadline(keo);
  return now >= d ? d.toISOString() : undefined;
}

/** Dữ liệu cho màn Huỷ kèo (CancelKeoSheet) từ một kèo trên Lên kèo */
export function toCancelable(
  keo: Keo,
  viewerId: string,
  who: (id: string) => { name: string; ut: number },
  now: Date = new Date()
): {
  id: string;
  title: string;
  startsAt: string;
  lockedAt?: string;
  acceptedBy: string[];
  kind: "personal" | "group";
  role: "host" | "member";
  hostId: string;
  members: (Member & { name: string })[];
} {
  const others = keo.memberIds.filter((id) => id !== keo.hostId);
  return {
    id: keo.id,
    title: displayTitle(keo),
    startsAt: startOf(keo).toISOString(),
    lockedAt: others.length > 0 ? lockedAtOf(keo, now) : undefined,
    acceptedBy: others,
    kind: keo.kind,
    role: keo.hostId === viewerId ? "host" : "member",
    hostId: keo.hostId,
    members: keo.memberIds.map((id) => ({ id, ...who(id) })),
  };
}
