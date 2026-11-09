"use client";

import * as React from "react";
import Link from "next/link";
import { CalendarClock, Check, Lock, MapPin, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Keo } from "@/features/keo/keo.types";
import { hostOf, hostTrust } from "@/features/keo/keo.data";
import { SPORT_LABEL } from "@/features/feed/feed.utils";
import { profileHref } from "@/components/feed/post-card";
import { SPORT_EMOJI } from "./keo-form";

export function MemberAvatars({
  ids,
  capacity,
  size = 26,
  guests,
}: {
  ids: string[];
  capacity: number;
  size?: number;
  guests?: Keo["guestProfiles"];
}) {
  const shown = ids.slice(0, 5);
  return (
    <div className="flex items-center gap-2">
      <div className="flex -space-x-2">
        {shown.map((id, i) => {
          const p = hostOf(id) ?? guests?.[id];
          return p ? (
            <img
              key={`${id}-${i}`}
              src={p.avatar}
              alt={p.name}
              style={{ width: size, height: size }}
              className="rounded-full object-cover ring-2 ring-background"
            />
          ) : (
            <span
              key={`${id}-${i}`}
              style={{ width: size, height: size }}
              className="rounded-full ring-2 ring-background bg-brand-100 dark:bg-brand-900 text-[10px] font-bold text-brand-700 dark:text-brand-200 flex items-center justify-center"
            >
              +1
            </span>
          );
        })}
        {Array.from({ length: Math.min(3, Math.max(0, capacity - ids.length)) }).map((_, i) => (
          <span
            key={`empty-${i}`}
            style={{ width: size, height: size }}
            className="rounded-full ring-2 ring-background border-2 border-dashed border-brand-300 bg-background"
          />
        ))}
      </div>
      <span className="text-[12px] font-semibold text-muted-foreground">
        {ids.length}/{capacity} người
      </span>
    </div>
  );
}

export function KeoCard({
  keo,
  distanceKm,
  reasons,
  eligible = true,
  joined,
  onJoin,
}: {
  keo: Keo;
  distanceKm?: number;
  reasons?: string[];
  eligible?: boolean;
  joined?: boolean;
  onJoin?: () => void;
}) {
  const host = hostOf(keo.hostId);
  const spotsLeft = keo.capacity - keo.memberIds.length;
  const full = spotsLeft <= 0;

  return (
    <article className="rounded-2xl border border-border bg-card overflow-hidden shadow-xs" aria-label={keo.title}>
      <div className="relative aspect-[16/9] bg-muted">
        <img src={keo.place.image} alt={`${SPORT_LABEL[keo.sport]} tại ${keo.place.name}`} loading="lazy" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
        <div className="absolute top-2.5 left-2.5 flex gap-1.5">
          <span className={cn("rounded-full px-2.5 py-1 text-[11px] font-bold", keo.kind === "group" ? "bg-brand-sky text-black" : "bg-brand text-white")}>
            {keo.kind === "group" ? "Nhóm" : "Cá nhân"}
          </span>
          {keo.mine && <span className="rounded-full bg-black/70 text-white px-2.5 py-1 text-[11px] font-bold">Kèo của bạn</span>}
        </div>
        {distanceKm !== undefined && (
          <span className="absolute top-2.5 right-2.5 rounded-full bg-white/90 text-black px-2.5 py-1 text-[11px] font-bold">
            {distanceKm.toFixed(1)} km
          </span>
        )}
        <div className="absolute bottom-2.5 left-3 right-3 text-white">
          <p className="text-[12px] font-semibold opacity-90">
            {SPORT_EMOJI[keo.sport]} {SPORT_LABEL[keo.sport]}
            {!full && keo.kind === "group" && ` · Thiếu ${spotsLeft} người`}
          </p>
          <h3 className="text-[16px] font-extrabold leading-snug line-clamp-2">{keo.title}</h3>
        </div>
      </div>

      <div className="p-3.5 space-y-2.5">
        {host && (
          <Link href={profileHref(host)} className="flex items-center gap-2.5 group">
            <img src={host.avatar} alt={host.name} className="h-8 w-8 rounded-full object-cover" />
            <span className="flex-1 min-w-0">
              <span className="block text-[13px] font-bold text-foreground truncate group-hover:underline">{host.name}</span>
              <span className="block text-[11.5px] text-muted-foreground">Chủ kèo · {hostTrust(keo.hostId)} TS</span>
            </span>
          </Link>
        )}

        <div className="space-y-1 text-[12.5px] text-foreground">
          <p className="flex items-center gap-1.5">
            <CalendarClock className="h-4 w-4 text-brand dark:text-brand-sky shrink-0" />
            {keo.time.day} · {keo.time.from}–{keo.time.to}
          </p>
          <p className="flex items-center gap-1.5">
            <MapPin className="h-4 w-4 text-brand dark:text-brand-sky shrink-0" />
            <span className="truncate">
              {keo.place.name} <span className="text-muted-foreground">· {keo.place.area}</span>
            </span>
          </p>
        </div>

        {keo.note && <p className="text-[13px] text-muted-foreground leading-snug line-clamp-2">“{keo.note}”</p>}

        <MemberAvatars ids={keo.memberIds} capacity={keo.capacity} guests={keo.guestProfiles} />

        {reasons && reasons.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            <Sparkles className="h-4 w-4 text-brand-sky" aria-hidden />
            {reasons.slice(0, 3).map((r) => (
              <span key={r} className="rounded-full bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-brand-200 px-2 py-0.5 text-[11px] font-semibold">
                {r}
              </span>
            ))}
          </div>
        )}

        {onJoin && !keo.mine && (
          <button
            onClick={onJoin}
            disabled={joined || full || !eligible}
            className={cn(
              "w-full rounded-full py-2.5 text-[13.5px] font-bold flex items-center justify-center gap-1.5 transition-all",
              "bg-brand text-white hover:bg-brand-700 active:scale-[0.98]",
              "disabled:cursor-not-allowed",
              joined ? "disabled:bg-emerald-50 disabled:text-emerald-700 dark:disabled:bg-emerald-950/40" : "disabled:bg-neutral-200 disabled:text-neutral-500 dark:disabled:bg-neutral-800"
            )}
          >
            {joined ? <Check className="h-4 w-4" /> : !eligible ? <Lock className="h-4 w-4" /> : null}
            {joined
              ? "Đã tham gia"
              : full
                ? "Đã đủ người"
                : !eligible
                  ? `Cần tối thiểu ${keo.minTrust} TS`
                  : `${keo.kind === "group" ? "Tham gia" : "Nhận kèo"} · cọc ${keo.holdTs} TS`}
          </button>
        )}
      </div>
    </article>
  );
}
