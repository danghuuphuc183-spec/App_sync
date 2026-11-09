"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, CloudLightning, MessageCircle, RefreshCw, ShieldCheck, Sparkles, UsersRound, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { CANDIDATES_DATA, type MatchCandidate } from "@/features/match/candidates.data";
import { findGroups, toMinutes } from "@/features/keo/keo.algo";
import { findPersonalMatchesV2 } from "@/features/keo/personal-match";
import { resolveDay } from "@/features/keo/session-plan";
import { useHourlyWeather } from "@/features/keo/use-weather";
import { weatherAdvice } from "@/features/match/partner-match";
import { toPartnerProfile, useOnboardingProfile } from "@/features/onboarding/onboarding";
import { DEMO_VIEWER, SEED_KEOS, hostTrust } from "@/features/keo/keo.data";
import type { GroupForm, Keo, PersonalForm } from "@/features/keo/keo.types";
import { useKeoStore } from "@/features/keo/use-keo-store";
import { PEOPLE } from "@/features/feed/feed.data";
import { SPORT_LABEL } from "@/features/feed/feed.utils";
import { InstagramChatModal } from "@/components/chat/instagram-chat-modal";
import { KeoForm, emptyGroupForm, emptyPersonalForm } from "./keo-form";
import { KeoCard, MemberAvatars } from "./keo-card";
import { useViewerPosition } from "./use-viewer-position";
import { SessionPlanBlock } from "./session-plan-card";

const MY_TRUST = DEMO_VIEWER.trustScore;

function Steps({ step }: { step: 1 | 2 | 3 }) {
  const labels = ["Thiết lập", "Gợi ý", "Xác nhận"];
  return (
    <ol className="flex items-center gap-1.5 mb-4" aria-label="Các bước">
      {labels.map((l, i) => {
        const n = (i + 1) as 1 | 2 | 3;
        return (
          <li key={l} className="flex-1">
            <div className={cn("h-1.5 rounded-full", n <= step ? "bg-brand" : "bg-muted")} />
            <p className={cn("mt-1 text-[11px] font-semibold", n === step ? "text-brand dark:text-brand-sky" : "text-muted-foreground")}>
              {n}. {l}
            </p>
          </li>
        );
      })}
    </ol>
  );
}

function useDefaultForm<T>(kind: "personal" | "group", fallback: () => T) {
  const store = useKeoStore();
  const [form, setForm] = React.useState<T>(fallback);
  const [usingDefault, setUsingDefault] = React.useState(false);
  const applied = React.useRef(false);
  React.useEffect(() => {
    if (!store.ready || applied.current) return;
    applied.current = true;
    const d = store.defaults[kind];
    if (d) {
      setForm(d as T);
      setUsingDefault(true);
    }
  }, [store.ready, store.defaults, kind]);
  return { store, form, setForm, usingDefault, setUsingDefault };
}

/* ====================================================================== */
/* LÊN KÈO CÁ NHÂN                                                         */
/* ====================================================================== */
export function PersonalFlow() {
  const { position } = useViewerPosition();
  const { store, form, setForm, usingDefault, setUsingDefault } = useDefaultForm<PersonalForm>("personal", emptyPersonalForm);
  const [saveDefault, setSaveDefault] = React.useState(false);
  const [step, setStep] = React.useState<"form" | "results" | "done">("form");
  const [skipped, setSkipped] = React.useState<string[]>([]);
  const [result, setResult] = React.useState<{ keo: Keo; partner?: MatchCandidate } | null>(null);
  const [chatOpen, setChatOpen] = React.useState(false);

  // Hồ sơ cá nhân hoá (onboarding) → thuật toán ghép v2: ≤3 km, giao thoa giờ, workout, DISC, vibe,
  // tỷ lệ hoàn thành, cùng giới, tương quan thể hình, chống GPS giả
  const onboarding = useOnboardingProfile();
  const run = React.useMemo(() => {
    if (step === "form" || !form.place) return null;
    const me = toPartnerProfile(onboarding, form.place.position);
    return findPersonalMatchesV2(form, CANDIDATES_DATA, me, { excludeIds: skipped, radiusKm: onboarding?.completedAt ? onboarding.radiusKm : 3 });
  }, [form, skipped, step, onboarding]);
  const matches = run?.matches ?? [];
  const sessionDate = React.useMemo(() => (form.place ? resolveDay(form.time.day, new Date()) : null), [form.place, form.time.day]);
  const hourly = useHourlyWeather(step === "results" && form.place ? form.place.position : null, step === "results" ? sessionDate : null);
  const weather = hourly ? weatherAdvice(form.sport, toMinutes(form.time.from) / 60, toMinutes(form.time.to) / 60, hourly) : null;

  const baseKeo = (): Keo => ({
    id: `my-${Date.now()}`,
    kind: "personal",
    hostId: "me",
    title: `${SPORT_LABEL[form.sport]} tại ${form.place!.name}`,
    sport: form.sport,
    place: form.place!,
    time: form.time,
    capacity: 2,
    memberIds: ["me"],
    note: form.note,
    minTrust: form.minTrust,
    holdTs: 20,
    createdAt: new Date().toISOString(),
    mine: true,
  });

  const accept = (c: MatchCandidate) => {
    const keo: Keo = {
      ...baseKeo(),
      title: `${SPORT_LABEL[form.sport]} cùng ${c.name}`,
      memberIds: ["me", c.id],
      guestProfiles: { [c.id]: { name: c.name, avatar: c.avatar } },
    };
    store.addKeo(keo);
    setResult({ keo, partner: c });
    setStep("done");
  };

  const postPublic = () => {
    const keo = baseKeo();
    store.addKeo(keo);
    setResult({ keo });
    setStep("done");
  };

  if (step === "done" && result) {
    const p = result.partner;
    return (
      <div>
        <Steps step={3} />
        <SuccessCard
          title={p ? `Đã ghép kèo với ${p.name}!` : "Đã đăng kèo công khai"}
          subtitle={
            p
              ? `Hai bạn cùng cọc ${result.keo.holdTs} TS. Check-in đúng giờ để được hoàn cọc và cộng điểm.`
              : "Kèo của bạn đã hiện trong mục Xem kèo. Bạn sẽ nhận thông báo khi có người nhận."
          }
          keo={result.keo}
        />
        {p && (
          <div className="mt-3">
            <SessionPlanBlock place={form.place} candidate={p} time={form.time} />
          </div>
        )}
        <div className="mt-4 flex gap-2">
          {p && (
            <button onClick={() => setChatOpen(true)} className="flex-1 rounded-full bg-brand hover:bg-brand-700 text-white py-3 text-[14px] font-bold flex items-center justify-center gap-1.5 active:scale-[0.98]">
              <MessageCircle className="h-4 w-4" /> Nhắn tin
            </button>
          )}
          <Link href="/ho-so?tab=bounties" className="flex-1 rounded-full border-2 border-brand text-brand dark:text-brand-sky dark:border-brand-sky py-2.5 text-[14px] font-bold text-center hover:bg-brand-50 dark:hover:bg-brand-950">
            Xem kèo của tôi
          </Link>
        </div>
        {p && (
          <InstagramChatModal
            isOpen={chatOpen}
            onClose={() => setChatOpen(false)}
            partnerInfo={{
              name: p.name,
              avatar: p.avatar,
              sportVi: p.sportVi,
              trustScore: p.trustScore,
              appointmentPrompt: {
                title: result.keo.title,
                dateTimeVi: `${result.keo.time.from} • ${result.keo.time.day}`,
                locationName: result.keo.place.name,
                holdTs: result.keo.holdTs,
              },
            }}
          />
        )}
      </div>
    );
  }

  if (step === "results") {
    return (
      <div>
        <Steps step={2} />
        <BackRow onBack={() => setStep("form")} label="Sửa thiết lập" />
        <div className="mb-3">
          <h2 className="text-[18px] font-extrabold text-foreground flex items-center gap-1.5">
            <Sparkles className="h-5 w-5 text-brand-sky" /> {matches.length > 0 ? `${matches.length} người tương thích nhất` : "Chưa tìm thấy người phù hợp"}
          </h2>
          <p className="text-[12.5px] text-muted-foreground">
            {SPORT_LABEL[form.sport]} · {form.place?.name} · {form.time.day} {form.time.from}–{form.time.to} · từ {form.minTrust} TS · ≤ {run?.radiusKm ?? 3} km
          </p>
          {run?.widened && <p className="mt-1 text-[12px] text-amber-600">Không có ai trong 3 km — đã mở rộng tới {run.radiusKm} km.</p>}
          {run && (run.excluded.fakeGps > 0 || run.excluded.gender > 0 || run.excluded.reliability > 0) && (
            <p className="mt-1 text-[11.5px] text-muted-foreground flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5 text-brand" />
              Đã lọc: {[
                run.excluded.fakeGps ? `${run.excluded.fakeGps} nghi GPS giả` : "",
                run.excluded.gender ? `${run.excluded.gender} khác giới (an toàn)` : "",
                run.excluded.reliability ? `${run.excluded.reliability} khác nhóm độ tin cậy` : "",
              ]
                .filter(Boolean)
                .join(" · ")}
            </p>
          )}
        </div>

        {weather && weather.risk !== "none" && (
          <div className={cn("mb-3 rounded-2xl border p-3 flex gap-2.5", weather.risk === "storm" ? "border-amber-300 bg-amber-50 dark:bg-amber-950/40" : "border-brand-200 bg-brand-50 dark:bg-brand-950/40")}>
            <CloudLightning className="h-5 w-5 shrink-0 text-amber-600" />
            <div className="text-[12.5px] text-foreground">
              <p>{weather.message}</p>
              {weather.suggestIndoor && (
                <a href="/len-keo?loai=ca-nhan" className="mt-1 inline-block font-bold text-brand dark:text-brand-sky">Đổi sang tập gym →</a>
              )}
            </div>
          </div>
        )}

        <ul className="space-y-3">
          {matches.map(({ candidate: c, breakdown }) => (
            <li key={c.id} className="rounded-2xl border border-border bg-card p-3.5 space-y-3 animate-in fade-in slide-in-from-bottom-2">
              <div className="flex items-center gap-3">
                <img src={c.avatar} alt={c.name} className="h-14 w-14 rounded-full object-cover ring-2 ring-brand/30" />
                <div className="flex-1 min-w-0">
                  <p className="text-[15px] font-bold text-foreground">
                    {c.name} <span className="text-[12px] font-normal text-muted-foreground">· {c.age} tuổi</span>
                  </p>
                  <p className="text-[12px] text-muted-foreground truncate">
                    {c.capabilities.level} · {c.capabilities.paceOrWeight}
                  </p>
                  <p className="text-[12px] text-muted-foreground">
                    {c.trustScore} TS · {c.punctualRate.split(" (")[0]} · cách {c.distanceKm} km
                  </p>
                </div>
                <div className="text-center shrink-0">
                  <p className="text-[22px] font-black font-display text-brand dark:text-brand-sky leading-none">{breakdown.totalScore}%</p>
                  <p className="text-[10px] text-muted-foreground">tương thích</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {breakdown.matchReasonVi.slice(0, 3).map((r) => (
                  <span key={r} className="rounded-full bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-brand-200 px-2 py-0.5 text-[11px] font-semibold">
                    {r}
                  </span>
                ))}
              </div>
              <p className="text-[11.5px] font-bold uppercase tracking-wider text-muted-foreground">Buổi tập đề xuất cùng {c.name}</p>
              <SessionPlanBlock place={form.place} candidate={c} time={form.time} />
              <div className="flex gap-2">
                <button
                  onClick={() => setSkipped((s) => [...s, c.id])}
                  className="h-10 px-4 rounded-full border border-border text-[13px] font-bold text-foreground hover:bg-muted active:scale-95 flex items-center gap-1"
                >
                  <X className="h-4 w-4" /> Bỏ qua
                </button>
                <button
                  onClick={() => accept(c)}
                  className="flex-1 h-10 rounded-full bg-brand hover:bg-brand-700 active:scale-[0.98] text-white text-[13.5px] font-bold"
                >
                  Chấp nhận · cọc 20 TS
                </button>
              </div>
            </li>
          ))}
        </ul>

        {matches.length === 0 && (
          <EmptyBox text="Thử nới khung giờ, giảm điểm uy tín tối thiểu, hoặc đăng kèo công khai để người khác tìm thấy bạn." />
        )}

        <div className="mt-4 rounded-2xl border border-dashed border-brand-300 p-3.5 text-center space-y-2">
          <p className="text-[13px] text-foreground">Không ai hợp ý? Đăng kèo công khai để người gần bạn nhận.</p>
          <div className="flex gap-2 justify-center">
            {skipped.length > 0 && (
              <button onClick={() => setSkipped([])} className="rounded-full border border-border px-3.5 py-2 text-[12.5px] font-bold flex items-center gap-1 hover:bg-muted">
                <RefreshCw className="h-3.5 w-3.5" /> Xem lại
              </button>
            )}
            <button onClick={postPublic} className="rounded-full bg-black text-white dark:bg-white dark:text-black px-4 py-2 text-[12.5px] font-bold hover:opacity-90 active:scale-95">
              Đăng kèo công khai
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Steps step={1} />
      <KeoForm
        kind="personal"
        value={form}
        onChange={(v) => {
          setForm(v);
          setUsingDefault(false);
        }}
        onSubmit={() => {
          if (saveDefault) store.saveDefault("personal", form);
          setSkipped([]);
          setStep("results");
        }}
        viewerPosition={position}
        myTrust={MY_TRUST}
        saveAsDefault={saveDefault}
        onSaveAsDefaultChange={setSaveDefault}
        usingDefault={usingDefault}
        onClearDefault={() => {
          store.clearDefault("personal");
          setUsingDefault(false);
        }}
      />
    </div>
  );
}

/* ====================================================================== */
/* LÊN KÈO NHÓM                                                            */
/* ====================================================================== */
export function GroupFlow() {
  const { position } = useViewerPosition();
  const { store, form, setForm, usingDefault, setUsingDefault } = useDefaultForm<GroupForm>("group", emptyGroupForm);
  const [saveDefault, setSaveDefault] = React.useState(false);
  const [step, setStep] = React.useState<"form" | "results" | "done">("form");
  const [result, setResult] = React.useState<{ keo: Keo; joined: boolean } | null>(null);

  const groups = React.useMemo(
    () =>
      step === "form"
        ? []
        : findGroups(form, SEED_KEOS, { myTrust: MY_TRUST, hostTrust }),
    [form, step]
  );

  const join = (keo: Keo) => {
    store.join(keo.id);
    setResult({ keo: { ...keo, memberIds: [...keo.memberIds, "me"] }, joined: true });
    setStep("done");
  };

  const createOwn = () => {
    const guests = Array.from({ length: form.present - 1 }, (_, i) => `guest-${i + 1}`);
    const keo: Keo = {
      id: `my-${Date.now()}`,
      kind: "group",
      hostId: "me",
      title: `Nhóm ${SPORT_LABEL[form.sport]?.toLowerCase()} — thiếu ${form.capacity - form.present} người`,
      sport: form.sport,
      place: form.place!,
      time: form.time,
      capacity: form.capacity,
      memberIds: ["me", ...guests],
      note: form.note,
      minTrust: form.minTrust,
      holdTs: 15,
      createdAt: new Date().toISOString(),
      mine: true,
    };
    store.addKeo(keo);
    setResult({ keo, joined: false });
    setStep("done");
  };

  if (step === "done" && result) {
    return (
      <div>
        <Steps step={3} />
        <SuccessCard
          title={result.joined ? `Đã tham gia nhóm của ${PEOPLE[result.keo.hostId]?.name ?? "chủ kèo"}!` : "Nhóm của bạn đã được đăng"}
          subtitle={
            result.joined
              ? `Đã giữ ${result.keo.holdTs} TS. Nhóm sẽ thấy bạn trong danh sách thành viên.`
              : `Đang chờ thêm ${result.keo.capacity - result.keo.memberIds.length} người. Kèo đã hiện trong mục Xem kèo.`
          }
          keo={result.keo}
        />
        <div className="mt-4 flex gap-2">
          <Link href="/chat" className="flex-1 rounded-full bg-brand hover:bg-brand-700 text-white py-3 text-[14px] font-bold flex items-center justify-center gap-1.5">
            <MessageCircle className="h-4 w-4" /> Chat nhóm
          </Link>
          <Link href="/ho-so?tab=bounties" className="flex-1 rounded-full border-2 border-brand text-brand dark:text-brand-sky dark:border-brand-sky py-2.5 text-[14px] font-bold text-center">
            Xem kèo của tôi
          </Link>
        </div>
      </div>
    );
  }

  if (step === "results") {
    const sameSpot = groups.filter((g) => g.sameLocation);
    const otherSpots = groups.filter((g) => !g.sameLocation);
    return (
      <div>
        <Steps step={2} />
        <BackRow onBack={() => setStep("form")} label="Sửa thiết lập" />
        <h2 className="text-[18px] font-extrabold text-foreground flex items-center gap-1.5">
          <UsersRound className="h-5 w-5 text-brand" /> Nhóm đang thiếu người
        </h2>
        <p className="text-[12.5px] text-muted-foreground mb-3">
          Bạn mang theo {form.present} người · {SPORT_LABEL[form.sport]} · {form.time.day} {form.time.from}–{form.time.to}
        </p>

        {groups.length === 0 && <EmptyBox text="Chưa có nhóm nào phù hợp lúc này. Bỏ qua để tự lập nhóm — người gần bạn sẽ thấy và tham gia." />}

        {sameSpot.length > 0 && <SubHeading>Cùng địa điểm bạn chọn</SubHeading>}
        <div className="space-y-3">
          {sameSpot.map((g) => (
            <KeoCard key={g.keo.id} keo={g.keo} distanceKm={g.distanceKm} reasons={groupReasons(g)} onJoin={() => join(g.keo)} joined={store.joined.has(g.keo.id)} />
          ))}
        </div>
        {otherSpots.length > 0 && <SubHeading>Ở địa điểm khác gần đó</SubHeading>}
        <div className="space-y-3">
          {otherSpots.map((g) => (
            <KeoCard key={g.keo.id} keo={g.keo} distanceKm={g.distanceKm} reasons={groupReasons(g)} onJoin={() => join(g.keo)} joined={store.joined.has(g.keo.id)} />
          ))}
        </div>

        <div className="sticky bottom-[72px] mt-4 pt-2 bg-gradient-to-t from-background via-background to-transparent">
          <button onClick={createOwn} className="w-full rounded-full bg-black hover:opacity-90 text-white dark:bg-white dark:text-black py-3.5 text-[14px] font-bold active:scale-[0.98]">
            Bỏ qua · Tự lập nhóm (thiếu {form.capacity - form.present} người)
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Steps step={1} />
      <KeoForm
        kind="group"
        value={form}
        onChange={(v) => {
          setForm(v);
          setUsingDefault(false);
        }}
        onSubmit={() => {
          if (saveDefault) store.saveDefault("group", form);
          setStep("results");
        }}
        viewerPosition={position}
        myTrust={MY_TRUST}
        saveAsDefault={saveDefault}
        onSaveAsDefaultChange={setSaveDefault}
        usingDefault={usingDefault}
        onClearDefault={() => {
          store.clearDefault("group");
          setUsingDefault(false);
        }}
      />
    </div>
  );
}

function groupReasons(g: { sameLocation: boolean; distanceKm: number; overlap: number; missing: number }) {
  return [
    g.sameLocation ? "Đúng địa điểm bạn chọn" : `Khác địa điểm · ${g.distanceKm.toFixed(1)} km`,
    g.overlap >= 0.99 ? "Trùng giờ hoàn toàn" : `Trùng ${Math.round(g.overlap * 100)}% khung giờ`,
    `Thiếu ${g.missing} người`,
  ];
}

/* ====================================================================== */
function SuccessCard({ title, subtitle, keo }: { title: string; subtitle: string; keo: Keo }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 text-center space-y-3 animate-in zoom-in-95 duration-200">
      <CheckCircle2 className="h-14 w-14 text-emerald-600 mx-auto" />
      <h2 className="text-[19px] font-extrabold text-foreground">{title}</h2>
      <p className="text-[13px] text-muted-foreground">{subtitle}</p>
      <div className="rounded-xl bg-muted p-3 text-left text-[13px] space-y-1">
        <p>
          <b>{keo.title}</b>
        </p>
        <p>🕔 {keo.time.day} · {keo.time.from}–{keo.time.to}</p>
        <p>📍 {keo.place.name}</p>
        <div className="pt-1">
          <MemberAvatars ids={keo.memberIds} capacity={keo.capacity} guests={keo.guestProfiles} />
        </div>
      </div>
    </div>
  );
}

function BackRow({ onBack, label }: { onBack: () => void; label: string }) {
  return (
    <button onClick={onBack} className="mb-2 flex items-center gap-1 text-[13px] font-semibold text-muted-foreground hover:text-foreground">
      <ArrowLeft className="h-4 w-4" /> {label}
    </button>
  );
}

function SubHeading({ children }: { children: React.ReactNode }) {
  return <p className="mt-4 mb-2 text-[12px] font-bold uppercase tracking-wider text-muted-foreground">{children}</p>;
}

function EmptyBox({ text }: { text: string }) {
  return <div className="rounded-2xl bg-muted/70 p-4 text-[13px] text-muted-foreground text-center">{text}</div>;
}
