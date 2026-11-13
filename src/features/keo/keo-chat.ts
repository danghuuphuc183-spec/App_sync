/**
 * CHAT KÈO — mỗi kèo có một đoạn chat chung: 1:1 = bạn + host; nhóm = host + mọi thành viên.
 * Luồng nhận kèo (D33, sửa 13/11):
 *  1) Thẻ kèo: nút "Nhận kèo" / "Tham gia" → bảng chấp nhận: cam kết + tin nhắn xác nhận soạn sẵn
 *     (sửa được, tối thiểu MIN_CONFIRM_CHARS ký tự).
 *  2) Bấm "Chấp nhận kèo" → mới được thêm vào kèo VÀ vào chat (1:1 với host / chat nhóm),
 *     tin xác nhận là tin đầu tiên, host nhận thông báo. Đóng bảng khi chưa chấp nhận → không vào chat.
 *  3) Sau đó nút trên thẻ đổi thành "Mở chat kèo" / "Mở chat nhóm".
 */
import type { Keo } from "./keo.types";
import { SPORT_LABEL } from "@/features/feed/feed.utils";
import { formatKeoDay } from "./keo-date";
import { summarizeDetails } from "./session-details";

export const MIN_CONFIRM_CHARS = 8;

export interface KeoChatMessage {
  id: string;
  /** "system" cho dòng thông báo của app */
  senderId: string;
  text: string;
  at: string;
}

export const sysMsg = (text: string, at = new Date()): KeoChatMessage => ({
  id: `sys-${at.getTime()}-${Math.random().toString(36).slice(2, 6)}`,
  senderId: "system",
  text,
  at: at.toISOString(),
});

export const userMsg = (senderId: string, text: string, at = new Date()): KeoChatMessage => ({
  id: `m-${at.getTime()}-${Math.random().toString(36).slice(2, 6)}`,
  senderId,
  text,
  at: at.toISOString(),
});

/** Tin nhắn xác nhận soạn sẵn */
export function acceptTemplate(keo: Keo, hostName: string): string {
  const when = `${formatKeoDay(keo.time.day)} ${keo.time.from}`;
  const details = summarizeDetails(keo.sport, keo.details);
  const greet = keo.kind === "group" ? `Chào ${hostName} và cả nhóm!` : `Chào ${hostName}!`;
  return `${greet} Mình nhận kèo ${SPORT_LABEL[keo.sport]?.toLowerCase() ?? keo.sport} ${when} tại ${keo.place.name}${
    details ? ` (${details})` : ""
  }. Hẹn gặp, mình sẽ có mặt đúng giờ.`;
}

export const isConfirmMessageValid = (text: string) => text.trim().length >= MIN_CONFIRM_CHARS;

/** Tin trả lời mô phỏng của host (khi có backend: host trả lời thật qua realtime) */
export function hostReply(keo: Keo, joinerName: string): string {
  return keo.kind === "group"
    ? `Chào mừng ${joinerName} vào nhóm! Cả nhóm gặp nhau ở ${keo.place.name} lúc ${keo.time.from} nhé.`
    : `Ok ${joinerName}, hẹn bạn ${keo.time.from} ở ${keo.place.name} nhé!`;
}

/** Thông báo gửi cho host khi có người nhận kèo */
export function hostNotification(keo: Keo, joinerName: string): string {
  return keo.kind === "group"
    ? `${joinerName} đã tham gia kèo nhóm "${keo.title}" và gửi lời chào vào chat nhóm.`
    : `${joinerName} đã nhận kèo "${keo.title}" và nhắn tin xác nhận cho bạn.`;
}

/** Các tin ghi vào chat khi chấp nhận kèo: tin xác nhận, dòng hệ thống, thông báo đã gửi host */
export function acceptMessages(keo: Keo, joinerName: string, hostName: string, text: string, at = new Date()): KeoChatMessage[] {
  return [
    sysMsg(keo.kind === "group" ? `${joinerName} đã được thêm vào nhóm.` : `${joinerName} đã nhận kèo.`, at),
    userMsg("me", text.trim(), at),
    sysMsg(`Đã gửi thông báo cho ${hostName}: ${hostNotification(keo, joinerName)}`, at),
  ];
}

/** Có người nhận kèo do BẠN tạo: tin trong chat của host */
export function incomingAcceptMessages(keo: Keo, joinerId: string, joinerName: string, hostName: string, at = new Date()): KeoChatMessage[] {
  return [
    sysMsg(keo.kind === "group" ? `${joinerName} đã tham gia nhóm.` : `${joinerName} đã nhận kèo của bạn.`, at),
    userMsg(joinerId, acceptTemplate(keo, hostName), at),
    sysMsg(`Bạn có thể từ chối ${joinerName} tới trước giờ tập 24 giờ nếu thấy không phù hợp.`, at),
  ];
}
