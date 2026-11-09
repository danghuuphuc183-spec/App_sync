"use client";

import * as React from "react";
import { CheckCircle2, LocateFixed, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { rankKeos } from "@/features/keo/keo.algo";
import { DEMO_VIEWER, KEO_SPORTS, SEED_KEOS, hostTrust } from "@/features/keo/keo.data";
import type { Keo } from "@/features/keo/keo.types";
import { useKeoStore } from "@/features/keo/use-keo-store";
import { SPORT_LABEL } from "@/features/feed/feed.utils";
import { BottomSheet } from "@/components/feed/bottom-sheet";
import { KeoCard } from "./keo-card";
import { SPORT_EMOJI } from "./keo-form";
import { useViewerPosition } from "./use-viewer-position";

type Tab = "for-you" | "nearest";

/** "Xem kèo": kèo đang mở, cá nhân hoá theo vị trí + đam mê + khung giờ + bạn bè + uy tín. */
export function BrowseKeos({ initialTab = "for-you" }: { initialTab?: Tab } = {}) {
  const store = useKeoStore();
  const { position, source } = useViewerPosition();
  const [tab, setTab] = React.useState<Tab>(initialTab);
  const [kind, setKind] = React.useState<"all" | "personal" | "group">("all");
  const [sport, setSport] = React.useState<string>("all");
  const [confirm, setConfirm] = React.useState<Keo | null>(null);
  const [justJoined, setJustJoined] = React.useState(false);

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
    const filtered = base.filter((r) => (kind === "all" || r.keo.kind === kind) && (sport === "all" || r.keo.sport === sport));
    return tab === "nearest" ? [...filtered].sort((a, b) => a.distanceKm - b.distanceKm) : filtered;
  }, [tab, allKeos, viewer, kind, sport]);

  return (
    <div>
      {/* Tabs */}
      <div className="grid grid-cols-2 rounded-full bg-muted p-1 mb-3" role="tablist">
        {(
          [
            ["for-you", "Dành cho bạn"],
            ["nearest", "Gần nhất"],
          ] as [Tab, string][]
        ).map(([id, label]) => (
          <button
            key={id}
            role="tab"
            aria-selected={tab === id}
            onClick={() => setTab(id)}
            className={cn(
              "rounded-full py-2 text-[12.5px] font-bold transition-colors",
              tab === id ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <p className="mb-2 flex items-center gap-1.5 text-[11.5px] text-muted-foreground">
        <LocateFixed className="h-3.5 w-3.5" />
        {source === "gps" ? "Đang dùng vị trí hiện tại của bạn" : "Vị trí mặc định: Bình Thạnh (bật GPS để chính xác hơn)"}
      </p>

      {/* Bộ lọc */}
      <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1 mb-3 -mx-4 px-4">
        {(
          [
            ["all", "Tất cả"],
            ["personal", "Cá nhân"],
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
            {SPORT_EMOJI[s]} {SPORT_LABEL[s]}
          </Chip>
        ))}
      </div>

      {ranked.length === 0 ? (
        <div className="rounded-2xl bg-muted/70 p-6 text-center text-[13px] text-muted-foreground">
          Không có kèo phù hợp bộ lọc.
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

      <BottomSheet
        open={!!confirm}
        onClose={() => {
          setConfirm(null);
          setJustJoined(false);
        }}
        title={justJoined ? "Đã tham gia kèo" : "Xác nhận tham gia"}
        bodyClassName="p-4 pb-6 space-y-3"
      >
        {confirm &&
          (justJoined ? (
            <div className="text-center space-y-2 py-2">
              <CheckCircle2 className="h-12 w-12 text-emerald-600 mx-auto" />
              <p className="text-[14px]">
                Đã giữ <b>{confirm.holdTs} TS</b> cho kèo <b>{confirm.title}</b>.
              </p>
              <button
                onClick={() => {
                  setConfirm(null);
                  setJustJoined(false);
                }}
                className="mt-2 w-full rounded-full bg-brand hover:bg-brand-700 text-white py-3 text-[14px] font-bold"
              >
                Xong
              </button>
            </div>
          ) : (
            <>
              <p className="text-[14px] font-bold">{confirm.title}</p>
              <p className="text-[13px] text-muted-foreground">
                {confirm.time.day} · {confirm.time.from}–{confirm.time.to} · {confirm.place.name}
              </p>
              <div className="rounded-xl border border-brand-200 dark:border-brand-800 bg-brand-50 dark:bg-brand-950/40 p-3 text-[12.5px] space-y-1">
                <p className="font-bold text-brand dark:text-brand-sky flex items-center gap-1.5">
                  <Shield className="h-4 w-4" /> Cam kết kỷ luật
                </p>
                <p className="text-muted-foreground">• Tạm giữ {confirm.holdTs} TS, hoàn lại khi check-in đúng giờ (+2 TS).</p>
                <p className="text-muted-foreground">• Bùng kèo không báo trước: trừ 30 TS.</p>
              </div>
              <button
                onClick={() => {
                  store.join(confirm.id);
                  setJustJoined(true);
                }}
                className="w-full rounded-full bg-brand hover:bg-brand-700 active:scale-[0.98] text-white py-3 text-[14px] font-bold"
              >
                {confirm.kind === "group" ? "Tham gia" : "Nhận kèo"} · cọc {confirm.holdTs} TS
              </button>
            </>
          ))}
      </BottomSheet>
    </div>
  );
}

function Chip({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={on}
      className={cn(
        "shrink-0 rounded-full border px-3 py-1.5 text-[12px] font-semibold whitespace-nowrap transition-colors",
        on ? "bg-brand border-brand text-white" : "border-border text-foreground hover:bg-muted"
      )}
    >
      {children}
    </button>
  );
}
