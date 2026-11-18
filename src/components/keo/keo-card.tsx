"use client";

import * as React from "react";
import Link from "next/link";
import { CalendarClock, Check, Dumbbell, Flame, Lock, MapPin, MessageCircle, SlidersHorizontal, Smile, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Keo } from "@/features/keo/keo.types";
import { hostOf, hostTrust } from "@/features/keo/keo.data";
import { SPORT_LABEL } from "@/features/feed/feed.utils";
import { profileHref } from "@/components/feed/post-card";
import { SportIcon } from "@/components/shared/sport-icon";
import { formatKeoDay } from "@/features/keo/keo-date";
import { formatUt } from "@/features/trust/config";
import { summarizeDetails } from "@/features/keo/session-details";
import { displayTitle } from "@/features/keo/keo-membership";

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
              className="rounded-full ring-2 ring-background bg-brand-100 dark:bg-brand-900 text-micro font-bold text-brand-700 dark:text-brand-200 flex items-center justify-center"
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
      <span className="text-xs font-semibold text-muted-foreground">
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
  onOpenChat,
}: {
  keo: Keo;
  distanceKm?: number;
  reasons?: string[];
  eligible?: boolean;
  joined?: boolean;
  onJoin?: () => void;
  /** đã nhận kèo → nút mở chat kèo thay cho "Đã tham gia" */
  onOpenChat?: () => void;
}) {
  const host = hostOf(keo.hostId);
  const spotsLeft = keo.capacity - keo.memberIds.length;
  const full = spotsLeft <= 0;

  return (
    <article className="group/card card-hover rounded-2xl border border-border/80 bg-card overflow-hidden shadow-xs" aria-label={keo.title}>
      <div className="relative aspect-[16/9] bg-muted">
        <img src={keo.place.image} alt={`${SPORT_LABEL[keo.sport]} tại ${keo.place.name}`} loading="lazy" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out-expo group-hover/card:scale-[1.04]" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/10 to-transparent" />
        <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5">
          <span className={cn("rounded-lg px-2.5 py-1 text-caption font-bold", keo.kind === "group" ? "bg-white/90 text-brand-800 backdrop-blur-sm" : "bg-brand-gradient text-white shadow-glow")}>
            {keo.kind === "group" ? "Nhóm" : "1:1"}
          </span>
          {keo.mine && <span className="rounded-lg bg-black/70 text-white px-2.5 py-1 text-caption font-bold">Kèo của bạn</span>}
          {keo.vibe && (
            <span className="rounded-lg bg-black/70 text-white px-2 py-1 text-caption font-bold flex items-center gap-1 backdrop-blur-xs">
              {keo.vibe === "performance" ? (
                <Flame className="h-3 w-3 stroke-[2]" />
              ) : keo.vibe === "friendly" ? (
                <Smile className="h-3 w-3 stroke-[2]" />
              ) : (
                <SlidersHorizontal className="h-3 w-3 stroke-[2]" />
              )}
              {keo.vibe === "performance" ? "Performance" : keo.vibe === "friendly" ? "Friendly" : "Flexible"}
            </span>
          )}
        </div>
        {distanceKm !== undefined && (
          <span className="absolute top-2.5 right-2.5 rounded-lg bg-white/90 text-ink px-2.5 py-0.5 backdrop-blur-sm">
            <span className="font-numeric text-sm font-bold">{distanceKm.toFixed(1)}</span> <span className="text-micro font-bold">km</span>
          </span>
        )}
        <div className="absolute bottom-2.5 left-3 right-3 text-white">
          <p className="flex items-center gap-1 text-xs font-semibold opacity-90">
            <SportIcon sport={keo.sport} className="h-3.5 w-3.5" /> {SPORT_LABEL[keo.sport]}
            {!full && keo.kind === "group" && ` · Thiếu ${spotsLeft} người`}
          </p>
          <h3 className="text-base font-extrabold leading-snug line-clamp-2">{displayTitle(keo)}</h3>
        </div>
      </div>

      <div className="p-3.5 space-y-2.5">
        {host && (
          <Link href={profileHref(host)} className="flex items-center gap-2.5 group">
            <img src={host.avatar} alt={host.name} className="h-8 w-8 rounded-full object-cover" />
            <span className="flex-1 min-w-0">
              <span className="block text-label font-bold text-foreground truncate group-hover:underline">{host.name}</span>
              <span className="block text-caption text-muted-foreground">Chủ kèo · {formatUt(hostTrust(keo.hostId))} UT</span>
            </span>
          </Link>
        )}

        <div className="space-y-1 text-xs text-foreground">
          <p className="flex items-center gap-1.5">
            <CalendarClock className="h-4 w-4 text-foreground shrink-0" />
            {formatKeoDay(keo.time.day)} · <span className="font-numeric text-sm font-bold">{keo.time.from}–{keo.time.to}</span>
          </p>
          <p className="flex items-center gap-1.5">
            <MapPin className="h-4 w-4 text-foreground shrink-0" />
            <span className="truncate">
              {keo.place.name} <span className="text-muted-foreground">· {keo.place.area}</span>
            </span>
          </p>
          {keo.details && summarizeDetails(keo.sport, keo.details) && (
            <p className="flex items-center gap-1.5">
              <Dumbbell className="h-4 w-4 text-foreground shrink-0" />
              <span className="truncate">{summarizeDetails(keo.sport, keo.details)}</span>
            </p>
          )}
        </div>

        {keo.note && <p className="text-label text-muted-foreground leading-snug line-clamp-2">“{keo.note}”</p>}

        <MemberAvatars ids={keo.memberIds} capacity={keo.capacity} guests={keo.guestProfiles} />

        {reasons && reasons.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            <Sparkles className="h-4 w-4 text-foreground" aria-hidden />
            {reasons.slice(0, 3).map((r) => (
              <span key={r} className="rounded-lg bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-brand-200 px-2 py-0.5 text-caption font-semibold">
                {r}
              </span>
            ))}
          </div>
        )}

        {onOpenChat && (joined || keo.mine) ? (
          <button
            onClick={onOpenChat}
            className="w-full rounded-lg border border-brand/30 bg-brand-50/70 dark:bg-brand-glow/10 py-2.5 text-label font-bold text-brand dark:text-brand-glow flex items-center justify-center gap-1.5 hover:border-brand/60"
          >
            <MessageCircle className="h-4 w-4" /> {keo.kind === "group" ? "Mở chat nhóm" : "Mở chat kèo"}
          </button>
        ) : onJoin && !keo.mine && (
          <button
            onClick={onJoin}
            disabled={joined || full || !eligible}
            className={cn(
              "btn-electric w-full rounded-lg py-2.5 text-label font-bold flex items-center justify-center gap-1.5",
              "disabled:cursor-not-allowed disabled:bg-none disabled:shadow-none",
              joined ? "disabled:bg-emerald-50 disabled:text-emerald-700 dark:disabled:bg-emerald-950/40" : "disabled:bg-neutral-200 disabled:text-neutral-500 dark:disabled:bg-neutral-800"
            )}
          >
            {joined ? <Check className="h-4 w-4" /> : !eligible ? <Lock className="h-4 w-4" /> : null}
            {joined
              ? "Đã tham gia"
              : full
                ? "Đã đủ người"
                : !eligible
                  ? `Cần tối thiểu ${formatUt(keo.minTrust)} UT`
                  : keo.kind === "group" ? "Tham gia" : "Nhận kèo"}
          </button>
        )}
      </div>
    </article>
  );
}
