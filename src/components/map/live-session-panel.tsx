"use client";

import * as React from "react";
import Link from "next/link";
import { Check, Loader2, MessageCircle, Navigation, PartyPopper, Radio, UserPlus, Users, X } from "lucide-react";
import {
  distanceMeters,
  formatDistance,
  walkingMinutes,
  type LiveSessionState,
  type NearbyAthlete,
  type RankedAthlete,
} from "@/features/live/live-session";
import { cn } from "@/lib/utils";

const LEVEL_VI = ["", "Mới bắt đầu", "Phong trào", "Bán chuyên", "Chuyên nghiệp"];

function useElapsed(startedAt: number | null) {
  const [now, setNow] = React.useState(() => Date.now());
  React.useEffect(() => {
    if (!startedAt) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [startedAt]);
  if (!startedAt) return "00:00";
  const s = Math.max(0, Math.floor((now - startedAt) / 1000));
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}

export function LiveSessionPanel({
  state,
  nearby,
  athletes,
  partner,
  onInvite,
  onAnswerIncoming,
  onCancelMatch,
  onStop,
  onFocusAthlete,
}: {
  state: LiveSessionState;
  nearby: RankedAthlete[];
  athletes: NearbyAthlete[];
  partner: NearbyAthlete | null;
  onInvite: (id: string) => void;
  onAnswerIncoming: (id: string, accept: boolean) => void;
  onCancelMatch: () => void;
  onStop: () => void;
  onFocusAthlete: (a: NearbyAthlete) => void;
}) {
  const elapsed = useElapsed(state.startedAt);
  const incoming = state.incoming
    .map((id) => athletes.find((a) => a.id === id))
    .filter((a): a is NearbyAthlete => !!a);

  return (
    <div className="rounded-3xl bg-background/95 backdrop-blur-xl border border-border shadow-2xl overflow-hidden">
      {/* Trạng thái phiên */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
        <span className="relative flex h-3 w-3 shrink-0">
          <span className="absolute inline-flex h-full w-full rounded-full bg-brand-600 opacity-75 animate-ping" />
          <span className="relative inline-flex h-3 w-3 rounded-full bg-brand-600" />
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-bold text-foreground truncate">Đang tập · {state.spot?.name}</p>
          <p className="text-[11px] text-muted-foreground">
            Đang chia sẻ vị trí · <span className="font-mono">{elapsed}</span>
          </p>
        </div>
        <button
          onClick={onStop}
          className="shrink-0 rounded-lg bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 px-3.5 py-1.5 text-[12px] font-bold active:scale-95"
        >
          Kết thúc
        </button>
      </div>

      <div className="max-h-[36vh] overflow-y-auto">
        {/* ĐÃ GHÉP ĐỘI */}
        {(state.phase === "matched" || state.phase === "met") && partner && state.myPos && state.partnerPos && (
          <MatchedCard
            partner={partner}
            met={state.phase === "met"}
            distanceM={distanceMeters(state.myPos, state.partnerPos)}
            myPos={state.myPos}
            partnerPos={state.partnerPos}
            onCancel={onCancelMatch}
            onFinish={onStop}
          />
        )}

        {state.phase === "live" && (
          <>
            {/* Lời mời đến */}
            {incoming.map((a) => (
              <div key={a.id} className="m-3 rounded-2xl border-2 border-brand-400 bg-brand-50 dark:bg-brand-950/30 p-3 animate-in fade-in slide-in-from-bottom-2">
                <div className="flex items-center gap-3">
                  <img src={a.avatar} alt={a.name} className="h-11 w-11 rounded-full object-cover ring-2 ring-brand-600" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-bold text-foreground">{a.name} mời bạn ghép đội</p>
                    <p className="text-[11.5px] text-muted-foreground truncate">{a.focus}</p>
                  </div>
                </div>
                <div className="flex gap-2 mt-2.5">
                  <button
                    onClick={() => onAnswerIncoming(a.id, false)}
                    className="flex-1 rounded-lg border border-border bg-background py-2 text-[12.5px] font-bold text-foreground"
                  >
                    Từ chối
                  </button>
                  <button
                    onClick={() => onAnswerIncoming(a.id, true)}
                    className="flex-1 rounded-lg bg-brand-600 hover:bg-brand-700 text-white py-2 text-[12.5px] font-bold"
                  >
                    Đồng ý
                  </button>
                </div>
              </div>
            ))}

            {/* Danh sách người đang tập gần */}
            <div className="px-4 pt-3 pb-1 flex items-center justify-between">
              <p className="text-[13px] font-bold text-foreground flex items-center gap-1.5">
                <Users className="h-4 w-4" /> Đang tập gần bạn ({nearby.length})
              </p>
              <p className="text-[11px] text-muted-foreground">Cùng môn · trong 2 km</p>
            </div>
            {nearby.length === 0 ? (
              <p className="px-4 pb-4 text-[12.5px] text-muted-foreground">
                Chưa có ai đang tập quanh đây. Vị trí của bạn vẫn đang hiển thị để người khác tìm thấy bạn.
              </p>
            ) : (
              <ul className="pb-2">
                {nearby.map((a) => {
                  const status = state.outgoing[a.id];
                  return (
                    <li key={a.id} className="flex items-center gap-3 px-4 py-2">
                      <button onClick={() => onFocusAthlete(a)} className="shrink-0" aria-label={`Xem ${a.name} trên bản đồ`}>
                        <img src={a.avatar} alt={a.name} className="h-10 w-10 rounded-full object-cover ring-2 ring-brand-400/70" />
                      </button>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-semibold text-foreground truncate">
                          {a.name} <span className="text-[11px] font-normal text-muted-foreground">· {LEVEL_VI[a.level]}</span>
                        </p>
                        <p className="text-[11.5px] text-muted-foreground truncate">
                          {formatDistance(a.distanceM)} · {a.focus}
                        </p>
                      </div>
                      <button
                        onClick={() => onInvite(a.id)}
                        disabled={!!status}
                        className={cn(
                          "shrink-0 rounded-lg px-3 py-1.5 text-[12px] font-bold flex items-center gap-1 transition-all active:scale-95",
                          !status && "bg-brand hover:bg-brand-700 text-white dark:bg-brand-sky dark:text-black",
                          status === "pending" && "bg-muted text-muted-foreground",
                          status === "declined" && "bg-muted text-muted-foreground line-through"
                        )}
                      >
                        {!status && <UserPlus className="h-3.5 w-3.5" />}
                        {status === "pending" && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                        {!status ? "Mời" : status === "pending" ? "Đang chờ" : "Đã bận"}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function MatchedCard({
  partner,
  met,
  distanceM,
  myPos,
  partnerPos,
  onCancel,
  onFinish,
}: {
  partner: NearbyAthlete;
  met: boolean;
  distanceM: number;
  myPos: [number, number];
  partnerPos: [number, number];
  onCancel: () => void;
  onFinish: () => void;
}) {
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&origin=${myPos[0]},${myPos[1]}&destination=${partnerPos[0]},${partnerPos[1]}&travelmode=walking`;

  return (
    <div className="p-4 space-y-3">
      <div className="flex items-center gap-3">
        <div className="relative">
          <img src={partner.avatar} alt={partner.name} className="h-14 w-14 rounded-full object-cover ring-[3px] ring-brand-600" />
          <span className="absolute -bottom-0.5 -right-0.5 h-5 w-5 rounded-full bg-emerald-500 ring-2 ring-background flex items-center justify-center">
            <Check className="h-3 w-3 text-white stroke-[3]" />
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-600">
            {met ? "Đã gặp nhau" : "Đã ghép đội"}
          </p>
          <p className="text-[15px] font-bold text-foreground truncate">{partner.name}</p>
          <p className="text-[12px] text-muted-foreground truncate">{partner.focus}</p>
        </div>
      </div>

      {met ? (
        <div className="rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 p-3 flex gap-2.5 items-center">
          <PartyPopper className="h-6 w-6 text-foreground shrink-0" />
          <p className="text-[13px] text-foreground leading-snug">
            Hai bạn đã ở cạnh nhau. Chúc buổi tập vui vẻ — nhớ check-in để cùng được +0,5 UT!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2 text-center">
          <div className="rounded-2xl bg-muted/70 py-2">
            <p className="text-[10.5px] text-muted-foreground">Khoảng cách</p>
            <p className="text-[17px] font-black text-foreground font-mono">{formatDistance(distanceM)}</p>
          </div>
          <div className="rounded-2xl bg-muted/70 py-2">
            <p className="text-[10.5px] text-muted-foreground">Đi bộ khoảng</p>
            <p className="text-[17px] font-black text-foreground font-mono">{walkingMinutes(distanceM)} phút</p>
          </div>
        </div>
      )}

      <p className="flex items-center gap-1.5 text-[11.5px] text-muted-foreground">
        <Radio className="h-3.5 w-3.5 text-foreground" />
        Hai bạn đang chia sẻ vị trí chính xác cho nhau để tìm đến nhau.
      </p>

      <div className="flex gap-2">
        {met ? (
          <button onClick={onFinish} className="flex-1 rounded-lg bg-brand-600 hover:bg-brand-700 text-white py-2.5 text-[13px] font-bold">
            Bắt đầu tập cùng & tắt chia sẻ
          </button>
        ) : (
          <>
            <a
              href={directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 rounded-lg bg-brand-600 hover:bg-brand-700 text-white py-2.5 text-[13px] font-bold flex items-center justify-center gap-1.5"
            >
              <Navigation className="h-4 w-4" /> Chỉ đường
            </a>
            <Link
              href="/chat"
              className="flex-1 rounded-lg border border-border py-2.5 text-[13px] font-bold text-foreground flex items-center justify-center gap-1.5 hover:bg-muted"
            >
              <MessageCircle className="h-4 w-4" /> Nhắn tin
            </Link>
            <button onClick={onCancel} aria-label="Huỷ ghép đội" className="h-10 w-10 shrink-0 rounded-full border border-border flex items-center justify-center hover:bg-muted">
              <X className="h-4 w-4" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
