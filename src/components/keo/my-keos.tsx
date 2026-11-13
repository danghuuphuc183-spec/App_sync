"use client";

import * as React from "react";
import Link from "next/link";
import { Crown, MessageCircle, XCircle } from "lucide-react";
import type { Keo } from "@/features/keo/keo.types";
import { SEED_KEOS, hostOf } from "@/features/keo/keo.data";
import { useKeoStore } from "@/features/keo/use-keo-store";
import { formatKeoDay } from "@/features/keo/keo-date";
import { canDecline, displayTitle, spotsLeft } from "@/features/keo/keo-membership";
import { formatReminderTime } from "@/features/keo/reminders";
import { SportIcon } from "@/components/shared/sport-icon";
import { KeoChatSheet } from "./keo-chat-sheet";
import { useCancelKeo } from "./keo-cancel";
import { profileHref } from "@/components/feed/post-card";

const nameOf = (keo: Keo, id: string) => hostOf(id)?.name ?? keo.guestProfiles?.[id]?.name ?? "Bạn tập";

/**
 * "Kèo của bạn" trên trang Lên kèo: kèo bạn tạo (bạn là host) và kèo bạn đã nhận.
 * Các kèo này KHÔNG nằm trong "Kèo đang mở" (D35).
 */
export function MyKeosSection() {
  const store = useKeoStore();
  const [chatKeo, setChatKeo] = React.useState<Keo | null>(null);
  const [notice, setNotice] = React.useState<string | null>(null);
  const cancel = useCancelKeo(setNotice);

  const hosting = store.mine.filter((k) => k.status !== "cancelled");
  const taken = SEED_KEOS.filter((k) => store.joined.has(k.id)).map((k) =>
    k.memberIds.includes("me") ? k : { ...k, memberIds: [...k.memberIds, "me"] }
  );
  if (hosting.length === 0 && taken.length === 0) {
    return notice ? (
      <p role="status" className="mt-5 rounded-xl bg-muted px-3 py-2.5 text-[12.5px] font-semibold text-foreground">
        {notice}
      </p>
    ) : null;
  }

  return (
    <section className="mt-5 space-y-3" aria-label="Kèo của bạn">
      <h2 className="text-[16px] font-extrabold text-foreground">Kèo của bạn</h2>
      {notice && (
        <p role="status" className="rounded-xl bg-muted px-3 py-2.5 text-[12.5px] font-semibold text-foreground">
          {notice}
        </p>
      )}

      {hosting.length > 0 && (
        <div className="space-y-1.5">
          <p className="flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-wider text-muted-foreground">
            <Crown className="h-3.5 w-3.5" /> Bạn tạo
          </p>
          {hosting.map((k) => {
            const others = k.memberIds.filter((id) => id !== "me");
            const left = spotsLeft(k);
            let status: string;
            if (others.length === 0) status = "Đang chờ người nhận";
            else if (k.kind === "personal") {
              const d = canDecline(k, others[0]!, "me");
              status = `${nameOf(k, others[0]!)} đã nhận · ${d.ok ? `từ chối được tới ${formatReminderTime(d.deadline)}` : "đã quá hạn từ chối"}`;
            } else status = `${k.memberIds.length}/${k.capacity} người · ${left > 0 ? `còn thiếu ${left}` : "đã đủ người"}`;
            return <Row key={k.id} keo={k} status={status} onChat={() => setChatKeo(k)} onCancel={() => cancel.start(k)} />;
          })}
        </div>
      )}

      {taken.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-[12px] font-bold uppercase tracking-wider text-muted-foreground">Bạn đã nhận</p>
          {taken.map((k) => (
            <Row
              key={k.id}
              keo={k}
              status={
                k.kind === "group"
                  ? `${k.memberIds.length}/${k.capacity} người · ${spotsLeft(k) > 0 ? `còn thiếu ${spotsLeft(k)}` : "đã đủ người"}`
                  : `Kèo với ${nameOf(k, k.hostId)} · đã ẩn khỏi bảng kèo`
              }
              onChat={() => setChatKeo(k)}
              onCancel={() => cancel.start(k)}
            />
          ))}
        </div>
      )}

      <KeoChatSheet keo={chatKeo} open={!!chatKeo} onClose={() => setChatKeo(null)} onCancel={cancel.start} />
      {cancel.element}
    </section>
  );
}

function Row({ keo, status, onChat, onCancel }: { keo: Keo; status: string; onChat: () => void; onCancel: () => void }) {
  const host = keo.hostId !== "me" ? hostOf(keo.hostId) : undefined;
  return (
    <div className="rounded-xl border border-border px-3 py-2.5 space-y-2" data-testid={`my-keo-${keo.id}`}>
      <div className="flex items-start gap-3">
        <SportIcon sport={keo.sport} className="h-5 w-5 shrink-0 mt-0.5" />
        <div className="min-w-0 flex-1">
          <p className="text-[13.5px] font-semibold text-foreground truncate">
            {keo.kind === "group" ? "Nhóm · " : "1:1 · "}
            {displayTitle(keo)}
          </p>
          <p className="text-[11.5px] text-muted-foreground">
            {formatKeoDay(keo.time.day)} {keo.time.from}
          </p>
          <p className="text-[11.5px] font-semibold text-foreground leading-snug">{status}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {host && (
          <Link
            href={profileHref(host)}
            aria-label={`Xem hồ sơ host ${host.name}`}
            className="flex min-w-0 flex-1 items-center gap-1.5 rounded-lg px-1 py-1 hover:bg-muted"
          >
            <img src={host.avatar} alt="" className="h-6 w-6 shrink-0 rounded-full object-cover" />
            <span className="truncate text-[12px] font-semibold text-foreground underline-offset-2 hover:underline">Host {host.name}</span>
          </Link>
        )}
        {!host && <span className="flex-1" />}
        <button
          type="button"
          onClick={onChat}
          aria-label={`Mở chat ${displayTitle(keo)}`}
          className="h-8 shrink-0 rounded-lg border border-border px-2.5 text-[12.5px] font-bold text-foreground flex items-center gap-1 hover:bg-muted"
        >
          <MessageCircle className="h-4 w-4" /> Chat
        </button>
        <button
          type="button"
          onClick={onCancel}
          aria-label={`Huỷ kèo ${displayTitle(keo)}`}
          className="h-8 shrink-0 rounded-lg border border-destructive/40 px-2.5 text-[12.5px] font-bold text-destructive flex items-center gap-1 hover:bg-destructive/5"
        >
          <XCircle className="h-4 w-4" /> Huỷ
        </button>
      </div>
    </div>
  );
}
