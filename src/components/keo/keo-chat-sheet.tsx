"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { ArrowLeft, Clock, Dumbbell, MapPin, Send, Shield, UserRound, UserX, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Keo } from "@/features/keo/keo.types";
import { hostOf, hostTrust } from "@/features/keo/keo.data";
import { useKeoStore } from "@/features/keo/use-keo-store";
import { formatKeoDay } from "@/features/keo/keo-date";
import { summarizeDetails } from "@/features/keo/session-details";
import {
  MIN_CONFIRM_CHARS,
  acceptMessages,
  acceptTemplate,
  hostReply,
  isConfirmMessageValid,
  userMsg,
  type KeoChatMessage,
} from "@/features/keo/keo-chat";
import { formatUt } from "@/features/trust/config";
import { BottomSheet } from "@/components/feed/bottom-sheet";
import { profileHref } from "@/components/feed/post-card";
import { ReminderList } from "./reminder-list";
import { canAccept, canDecline, displayTitle, spotsLeft } from "@/features/keo/keo-membership";
import { formatReminderTime } from "@/features/keo/reminders";

const HOST_REPLY_MS = 1500;

const isMember = (keo: Keo, joined: Set<string>) => keo.mine || keo.memberIds.includes("me") || joined.has(keo.id);

/* ====================================================================== */
/* BƯỚC 1 — CHẤP NHẬN KÈO (chưa vào chat)                                  */
/* ====================================================================== */
/**
 * Bảng chấp nhận: cam kết + tin nhắn xác nhận soạn sẵn. Chỉ khi bấm "Chấp nhận" người dùng mới
 * được thêm vào kèo và vào chat (D33). Đóng bảng → không có gì thay đổi.
 */
export function AcceptKeoSheet({ keo, onClose, onAccepted }: { keo: Keo | null; onClose: () => void; onAccepted: (keo: Keo) => void }) {
  const store = useKeoStore();
  const meName = hostOf("me")?.name ?? "Bạn";
  const hostName = keo ? (hostOf(keo.hostId)?.name ?? "chủ kèo") : "";
  // mẫu tin nhắn có ngay từ lần vẽ đầu; người dùng sửa thì lưu theo id kèo
  const [edit, setEdit] = React.useState<{ id: string; text: string } | null>(null);
  const draft = keo ? (edit?.id === keo.id ? edit.text : acceptTemplate(keo, hostName)) : "";
  const setDraft = (text: string) => keo && setEdit({ id: keo.id, text });

  const group = keo?.kind === "group";

  const [error, setError] = React.useState<string | null>(null);
  React.useEffect(() => setError(null), [keo?.id]);

  const accept = () => {
    if (!keo || !isConfirmMessageValid(draft)) return;
    // giữ chỗ: kiểm tra còn chỗ ngay lúc bấm (backend: lệnh nguyên tử, D35)
    const check = canAccept(keo, "me");
    if (!check.ok) {
      setError(check.reasonVi);
      return;
    }
    store.join(keo.id);
    store.appendChat(keo.id, acceptMessages(keo, meName, hostName, draft));
    // mô phỏng host trả lời — khi có backend: tin thật qua realtime
    setTimeout(() => store.appendChat(keo.id, [userMsg(keo.hostId, hostReply(keo, meName))]), HOST_REPLY_MS);
    onAccepted(keo);
  };

  return (
    <BottomSheet open={!!keo} onClose={onClose} title={group ? "Tham gia kèo nhóm" : "Nhận kèo"} bodyClassName="p-4 pb-6 space-y-3">
      {keo && (
        <>
          <div>
            <p className="text-[14px] font-bold">{displayTitle(keo)}</p>
            <p className="text-[13px] text-muted-foreground">
              {formatKeoDay(keo.time.day)} · {keo.time.from}–{keo.time.to} · {keo.place.name}
            </p>
            {keo.details && <p className="text-[12.5px] text-muted-foreground">{summarizeDetails(keo.sport, keo.details)}</p>}
          </div>
          <p className="rounded-xl bg-muted px-3 py-2 text-[12.5px] text-foreground">
            {group
              ? `Nhóm ${keo.memberIds.length}/${keo.capacity} người, đang thiếu ${spotsLeft(keo)}. Bạn vào xong còn thiếu ${Math.max(0, spotsLeft(keo) - 1)}.`
              : "Kèo 1:1: bạn nhận xong, kèo ẩn ngay khỏi bảng kèo để không ai nhận trùng."}
          </p>
          <div className="rounded-xl border border-brand-200 dark:border-brand-800 bg-brand-50 dark:bg-brand-950/40 p-3 text-[12.5px] space-y-1">
            <p className="font-bold text-brand dark:text-brand-sky flex items-center gap-1.5">
              <Shield className="h-4 w-4" /> Cam kết kỷ luật
            </p>
            <p className="text-muted-foreground">• Đúng hẹn (trễ ≤ 15 phút): +0,5 UT.</p>
            <p className="text-muted-foreground">• Sau khi chốt: huỷ sớm −0,25, trong 30 phút −0,5, vắng −1 UT.</p>
            <p className="text-muted-foreground">• Bạn và chủ kèo được nhắc hôm trước và trước giờ tập 1 tiếng.</p>
          </div>
          <label htmlFor="accept-msg" className="block text-[12.5px] font-bold text-foreground">
            Tin nhắn xác nhận gửi {group ? `${hostName} và cả nhóm` : hostName} (bắt buộc, sửa được)
          </label>
          <textarea
            id="accept-msg"
            aria-label="Tin nhắn xác nhận"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={3}
            maxLength={400}
            placeholder={`Ít nhất ${MIN_CONFIRM_CHARS} ký tự`}
            className="w-full resize-none rounded-xl border border-border bg-background px-3 py-2 text-[13.5px] outline-none focus:ring-2 focus:ring-brand/30"
          />
          {error && (
            <p
              role="alert"
              className="rounded-xl border border-destructive/40 bg-destructive/5 px-3 py-2 text-[12.5px] font-semibold text-destructive"
            >
              {error}
            </p>
          )}
          <button
            onClick={accept}
            disabled={!isConfirmMessageValid(draft)}
            className="w-full rounded-lg bg-brand hover:bg-brand-700 active:scale-[0.98] text-white py-3 text-[14px] font-bold disabled:bg-neutral-200 disabled:text-neutral-500 dark:disabled:bg-neutral-800"
          >
            {group ? "Chấp nhận · Vào chat nhóm" : "Chấp nhận kèo · Vào chat với host"}
          </button>
          <p className="text-center text-[11.5px] text-muted-foreground">
            Chấp nhận xong bạn mới được thêm vào {group ? "nhóm" : "kèo"} và vào chat.
          </p>
        </>
      )}
    </BottomSheet>
  );
}

/* ====================================================================== */
/* BƯỚC 2 — CHAT KÈO (chỉ dành cho người đã chấp nhận)                    */
/* ====================================================================== */
export function KeoChatSheet({
  keo: keoProp,
  open,
  onClose,
  onCancel,
}: {
  keo: Keo | null;
  open: boolean;
  onClose: () => void;
  /** mở màn Huỷ kèo (chat đóng trước để màn huỷ không bị che) */
  onCancel?: (keo: Keo) => void;
}) {
  const store = useKeoStore();
  // kèo của mình: lấy bản mới nhất (có người nhận / bị từ chối sau khi mở chat)
  const keo = keoProp ? (store.mine.find((k) => k.id === keoProp.id) ?? keoProp) : null;
  const [draft, setDraft] = React.useState("");
  const endRef = React.useRef<HTMLDivElement>(null);
  const messages: KeoChatMessage[] = keo ? (store.chats[keo.id] ?? []) : [];

  React.useEffect(() => {
    endRef.current?.scrollIntoView?.({ block: "end" });
  }, [messages.length, open]);

  if (!open || !keo || typeof document === "undefined") return null;
  // chưa chấp nhận thì không vào được chat
  if (!isMember(keo, store.joined)) return null;

  const host = hostOf(keo.hostId);
  const hostName = host?.name ?? "chủ kèo";
  const memberIds = keo.memberIds.includes("me") || keo.mine ? keo.memberIds : [...keo.memberIds, "me"];
  const others = memberIds
    .filter((id) => id !== "me")
    .map((id) => hostOf(id)?.name ?? keo.guestProfiles?.[id]?.name)
    .filter(Boolean);

  const send = () => {
    const text = draft.trim();
    if (!text) return;
    setDraft("");
    store.appendChat(keo.id, [userMsg("me", text)]);
  };

  return createPortal(
    <div className="fixed inset-0 z-[1200] bg-black/50 flex justify-center animate-in fade-in duration-150">
      <div role="dialog" aria-label="Chat kèo" className="w-full max-w-md h-full bg-background flex flex-col">
        <header className="flex items-center gap-2.5 border-b border-border px-3 py-2.5">
          <button onClick={onClose} aria-label="Đóng chat" className="h-9 w-9 rounded-full hover:bg-muted flex items-center justify-center">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <HeaderIdentity keo={keo} memberIds={memberIds} onNavigate={onClose}>
            <span className="flex -space-x-2 shrink-0">
              {(keo.kind === "group" ? memberIds.slice(0, 3) : [keo.hostId]).map((id) => {
                const p = hostOf(id) ?? keo.guestProfiles?.[id];
                return p ? <img key={id} src={p.avatar} alt={p.name} className="h-8 w-8 rounded-full object-cover ring-2 ring-background" /> : null;
              })}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[14.5px] font-bold text-foreground truncate">
                {keo.kind === "group" || keo.hostId === "me" ? displayTitle(keo) : hostName}
              </p>
              <p className="text-[11.5px] text-muted-foreground truncate">
                {keo.kind === "group"
                  ? `Chat nhóm · ${memberIds.length} người: ${[...others, "bạn"].join(", ")}`
                  : keo.hostId === "me"
                    ? `Bạn là host · ${others.length ? `với ${others.join(", ")}` : "đang chờ người nhận"}`
                    : `Chủ kèo · ${formatUt(hostTrust(keo.hostId))} UT · Xem hồ sơ`}
              </p>
            </div>
          </HeaderIdentity>
        </header>

        <div className="border-b border-border bg-muted/40 px-3 py-2.5 text-[12.5px] space-y-0.5">
          <p className="font-bold text-foreground truncate">{displayTitle(keo)}</p>
          <p className="flex items-center gap-1.5 text-muted-foreground">
            <Clock className="h-3.5 w-3.5 shrink-0" />
            {formatKeoDay(keo.time.day)} · {keo.time.from}–{keo.time.to}
          </p>
          <p className="flex items-center gap-1.5 text-muted-foreground">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{keo.place.name}</span>
          </p>
          {keo.details && (
            <p className="flex items-center gap-1.5 text-muted-foreground">
              <Dumbbell className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{summarizeDetails(keo.sport, keo.details)}</span>
            </p>
          )}
        </div>

        {(keo.hostId !== "me" || onCancel) && (
          <div className="flex items-center gap-2 border-b border-border px-3 py-2">
            {host && keo.hostId !== "me" ? (
              <Link
                href={profileHref(host)}
                onClick={onClose}
                className="flex h-8 items-center gap-1.5 whitespace-nowrap rounded-lg border border-border px-2.5 text-[12.5px] font-bold text-foreground hover:bg-muted"
              >
                <UserRound className="h-4 w-4" /> Hồ sơ host
              </Link>
            ) : (
              <span />
            )}
            <span className="flex-1" />
            {onCancel && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onCancel(keo);
                }}
                className="flex h-8 items-center gap-1.5 whitespace-nowrap rounded-lg border border-destructive/40 px-2.5 text-[12.5px] font-bold text-destructive hover:bg-destructive/5"
              >
                <XCircle className="h-4 w-4" /> Huỷ kèo
              </button>
            )}
          </div>
        )}

        {keo.hostId === "me" && <HostMembers keo={keo} />}

        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2" aria-live="polite">
          {messages.map((m) => (
            <Bubble key={m.id} m={m} keo={keo} />
          ))}
          <ReminderList day={keo.time.day} from={keo.time.from} who={keo.kind === "group" ? "Cả nhóm" : "Hai bạn"} />
          <div ref={endRef} />
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            send();
          }}
          className="border-t border-border p-3 flex items-end gap-2 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
        >
          <textarea
            aria-label="Nhắn tin"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={1}
            maxLength={400}
            placeholder="Nhắn tin…"
            className="flex-1 resize-none rounded-xl border border-border bg-background px-3 py-2 text-[13.5px] outline-none focus:ring-2 focus:ring-brand/30"
          />
          <button
            type="submit"
            disabled={!draft.trim()}
            aria-label="Gửi"
            className="h-10 w-10 shrink-0 rounded-full bg-brand text-white flex items-center justify-center disabled:opacity-40"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>,
    document.body
  );
}

/** Tiêu đề chat: kèo 1:1 bạn đã nhận → bấm ảnh/tên host để xem hồ sơ */
function HeaderIdentity({ keo, children, onNavigate }: { keo: Keo; memberIds: string[]; children: React.ReactNode; onNavigate: () => void }) {
  const host = hostOf(keo.hostId);
  if (keo.kind === "personal" && keo.hostId !== "me" && host) {
    return (
      <Link
        href={profileHref(host)}
        onClick={onNavigate}
        aria-label={`Xem hồ sơ host ${host.name}`}
        className="flex min-w-0 flex-1 items-center gap-2.5 rounded-lg hover:bg-muted"
      >
        {children}
      </Link>
    );
  }
  return <div className="flex min-w-0 flex-1 items-center gap-2.5">{children}</div>;
}

/** Host xem người đã nhận và từ chối được tới trước giờ tập 24 giờ (D35) */
function HostMembers({ keo }: { keo: Keo }) {
  const store = useKeoStore();
  const [confirming, setConfirming] = React.useState<string | null>(null);
  const members = keo.memberIds.filter((id) => id !== "me");
  if (members.length === 0) {
    return <p className="border-b border-border px-3 py-2 text-[12px] text-muted-foreground">Chưa có ai nhận kèo. Kèo đang hiện trên bảng kèo.</p>;
  }
  const deadline = canDecline(keo, members[0]!, "me").deadline;
  return (
    <div className="border-b border-border px-3 py-2 space-y-1.5" aria-label="Người đã nhận kèo">
      <p className="text-[11.5px] text-muted-foreground">
        Người đã nhận · từ chối được tới <b className="text-foreground">{formatReminderTime(deadline)}</b> (trước giờ tập 24 giờ)
      </p>
      {members.map((id) => {
        const p = hostOf(id) ?? keo.guestProfiles?.[id];
        const name = p?.name ?? "Bạn tập";
        const check = canDecline(keo, id, "me");
        return (
          <div key={id} className="flex items-center gap-2">
            {p && <img src={p.avatar} alt={name} className="h-7 w-7 rounded-full object-cover" />}
            <span className="flex-1 min-w-0 truncate text-[13px] font-semibold text-foreground">{name}</span>
            {confirming === id ? (
              <>
                <button
                  onClick={() => setConfirming(null)}
                  className="rounded-lg border border-border px-2.5 py-1 text-[12px] font-bold hover:bg-muted"
                >
                  Giữ lại
                </button>
                <button
                  onClick={() => {
                    store.declineMember(keo.id, id, name);
                    setConfirming(null);
                  }}
                  className="rounded-lg bg-destructive px-2.5 py-1 text-[12px] font-bold text-white hover:bg-destructive/90"
                >
                  Xác nhận từ chối
                </button>
              </>
            ) : (
              <button
                onClick={() => setConfirming(id)}
                disabled={!check.ok}
                title={check.ok ? undefined : check.reasonVi}
                aria-label={`Từ chối ${name}`}
                className="rounded-lg border border-destructive/40 px-2.5 py-1 text-[12px] font-bold text-destructive flex items-center gap-1 hover:bg-destructive/5 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <UserX className="h-3.5 w-3.5" /> {check.ok ? "Từ chối" : "Quá hạn"}
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}

function Bubble({ m, keo }: { m: KeoChatMessage; keo: Keo }) {
  if (m.senderId === "system") {
    return <p className="mx-auto max-w-[90%] rounded-xl bg-muted px-3 py-1.5 text-center text-[11.5px] text-muted-foreground">{m.text}</p>;
  }
  const mine = m.senderId === "me";
  const p = hostOf(m.senderId) ?? keo.guestProfiles?.[m.senderId];
  return (
    <div className={cn("flex items-end gap-2", mine && "justify-end")}>
      {!mine && p && <img src={p.avatar} alt={p.name} className="h-7 w-7 rounded-full object-cover" />}
      <div
        className={cn(
          "max-w-[78%] rounded-2xl px-3 py-2 text-[13.5px]",
          mine ? "bg-brand text-white rounded-br-md" : "bg-muted text-foreground rounded-bl-md"
        )}
      >
        {!mine && keo.kind === "group" && p && <p className="text-[11px] font-bold opacity-70">{p.name}</p>}
        {m.text}
      </div>
    </div>
  );
}
