"use client";

import * as React from "react";
import { LocateFixed } from "lucide-react";
import { cn } from "@/lib/utils";
import { rankKeos } from "@/features/keo/keo.algo";
import { DEMO_VIEWER, KEO_SPORTS, SEED_KEOS, hostTrust } from "@/features/keo/keo.data";
import type { Keo } from "@/features/keo/keo.types";
import { useKeoStore } from "@/features/keo/use-keo-store";
import { SPORT_LABEL } from "@/features/feed/feed.utils";
import { KeoCard } from "./keo-card";
import { AcceptKeoSheet, KeoChatSheet } from "./keo-chat-sheet";
import { useCancelKeo } from "./keo-cancel";
import { isOnBoardFor } from "@/features/keo/keo-membership";
import { useViewerPosition } from "./use-viewer-position";
import { SportIcon } from "@/components/shared/sport-icon";
import { formatKeoDay } from "@/features/keo/keo-date";

type Tab = "for-you" | "nearest";

/** Danh sách kèo trong trang Lên kèo: kèo đang mở, cá nhân hoá theo vị trí + đam mê + khung giờ + bạn bè + uy tín. */
export function BrowseKeos({ initialTab = "for-you" }: { initialTab?: Tab } = {}) {
  const store = useKeoStore();
  const { position, source } = useViewerPosition();
  const [tab, setTab] = React.useState<Tab>(initialTab);
  const [kind, setKind] = React.useState<"all" | "personal" | "group">("all");
  const [sport, setSport] = React.useState<string>("all");
  const [confirm, setConfirm] = React.useState<Keo | null>(null);
  const [chatKeo, setChatKeo] = React.useState<Keo | null>(null);
  const cancel = useCancelKeo();

  const viewer = React.useMemo(() => ({ ...DEMO_VIEWER, position }), [position]);

  // Kèo đã tham gia → có thêm "me" trong danh sách thành viên
  const allKeos = React.useMemo(
    () =>
      [...store.mine, ...SEED_KEOS].map((k) =>
        store.joined.has(k.id) && !k.memberIds.includes("me") ? { ...k, memberIds: [...k.memberIds, "me"] } : k
      ),
    [store.mine, store.joined]
  );

  const ranked = React.useMemo(() => {
    const base = rankKeos(allKeos, viewer, { hostTrust, sportLabel: (s) => SPORT_LABEL[s] ?? s });
    // chỉ kèo còn chỗ mà bạn chưa ở trong: kèo 1:1 vừa nhận ẩn ngay, kèo bạn tạo / đã nhận nằm ở "Kèo của bạn" (D35)
    const filtered = base.filter(
      (r) => isOnBoardFor(r.keo, viewer.id) && (kind === "all" || r.keo.kind === kind) && (sport === "all" || r.keo.sport === sport)
    );
    return tab === "nearest" ? [...filtered].sort((a, b) => a.distanceKm - b.distanceKm) : filtered;
  }, [tab, allKeos, viewer, kind, sport]);

  return (
    <div>
      {/* Vị trí + sắp xếp (thay cho 2 tab cũ "Dành cho bạn" / "Gần nhất") */}
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="flex min-w-0 items-center gap-1.5 text-[11.5px] text-muted-foreground">
          <LocateFixed className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">{source === "gps" ? "Vị trí hiện tại của bạn" : "Mặc định: Bình Thạnh"}</span>
        </p>
        <div className="flex shrink-0 rounded-lg bg-muted p-0.5" role="radiogroup" aria-label="Sắp xếp kèo">
          {(
            [
              ["for-you", "Phù hợp"],
              ["nearest", "Gần nhất"],
            ] as [Tab, string][]
          ).map(([id, label]) => (
            <button
              key={id}
              role="radio"
              aria-checked={tab === id}
              onClick={() => setTab(id)}
              className={cn(
                "rounded-md px-2.5 py-1 text-[11.5px] font-bold transition-colors",
                tab === id ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Bộ lọc */}
      <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1 mb-3 -mx-4 px-4">
        {(
          [
            ["all", "Tất cả"],
            ["personal", "1:1"],
            ["group", "Nhóm"],
          ] as const
        ).map(([id, label]) => (
          <Chip key={id} on={kind === id} onClick={() => setKind(id)}>
            {label}
          </Chip>
        ))}
        <span className="w-px bg-border mx-1 shrink-0" />
        <Chip on={sport === "all"} onClick={() => setSport("all")}>
          Mọi môn
        </Chip>
        {KEO_SPORTS.map((s) => (
          <Chip key={s} on={sport === s} onClick={() => setSport(s)}>
            <SportIcon sport={s} className="mr-1 inline h-3.5 w-3.5 -mt-0.5" />{SPORT_LABEL[s]}
          </Chip>
        ))}
      </div>

      {ranked.length === 0 ? (
        <div className="rounded-2xl bg-muted/70 p-6 text-center text-[13px] text-muted-foreground">
          Không còn kèo đang mở phù hợp bộ lọc.
        </div>
      ) : (
        <div className="space-y-3">
          {ranked.map((r) => (
            <KeoCard
              key={r.keo.id}
              keo={r.keo}
              distanceKm={r.distanceKm}
              reasons={r.keo.mine ? undefined : r.reasons}
              eligible={r.eligible}
              joined={store.joined.has(r.keo.id)}
              onJoin={() => setConfirm(r.keo)}
            />
          ))}
        </div>
      )}

      <AcceptKeoSheet
        keo={confirm}
        onClose={() => setConfirm(null)}
        onAccepted={(k) => {
          setConfirm(null);
          setChatKeo(k);
        }}
      />

      <KeoChatSheet keo={chatKeo} open={!!chatKeo} onClose={() => setChatKeo(null)} onCancel={cancel.start} />
      {cancel.element}
    </div>
  );
}

function Chip({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={on}
      className={cn(
        "shrink-0 rounded-lg border px-3 py-1.5 text-[12px] font-semibold whitespace-nowrap transition-colors",
        on ? "bg-brand border-brand text-white" : "border-border text-foreground hover:bg-muted"
      )}
    >
      {children}
    </button>
  );
}
