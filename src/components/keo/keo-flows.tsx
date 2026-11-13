"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Clock, CloudLightning, Dumbbell, Lock, MapPin, MessageCircle, RefreshCw, ShieldCheck, Sparkles, UsersRound, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { CANDIDATES_DATA, type MatchCandidate } from "@/features/match/candidates.data";
import { findGroups, toMinutes } from "@/features/keo/keo.algo";
import { findPersonalMatchesV2 } from "@/features/keo/personal-match";
import { resolveDay } from "@/features/keo/session-plan";
import { useHourlyWeather } from "@/features/keo/use-weather";
import { weatherAdvice } from "@/features/match/partner-match";
import { toPartnerProfile, useOnboardingProfile } from "@/features/onboarding/onboarding";
import { DEMO_VIEWER, SEED_KEOS, hostTrust } from "@/features/keo/keo.data";
import type { GroupForm, Keo, PersonalForm, SoloPlan } from "@/features/keo/keo.types";
import { useKeoStore } from "@/features/keo/use-keo-store";
import { PEOPLE } from "@/features/feed/feed.data";
import { SPORT_LABEL } from "@/features/feed/feed.utils";
import { InstagramChatModal } from "@/components/chat/instagram-chat-modal";
import { KeoForm, emptyGroupForm, emptyPersonalForm } from "./keo-form";
import { KeoCard, MemberAvatars } from "./keo-card";
import { useViewerPosition } from "./use-viewer-position";
import { SessionPlanBlock } from "./session-plan-card";
import { formatKeoDay, normalizeKeoDay } from "@/features/keo/keo-date";
import { INDOOR_SPOTS, pendingConfirmations, proposeVenueChange, spotToPlace } from "@/features/keo/venue-change";
import { formatUt } from "@/features/trust/config";
import { defaultDetails, summarizeDetails } from "@/features/keo/session-details";
import { ReminderList } from "./reminder-list";
import { AcceptKeoSheet, KeoChatSheet } from "./keo-chat-sheet";
import { displayTitle } from "@/features/keo/keo-membership";

const MY_TRUST = DEMO_VIEWER.trustScore;
/** DEMO: thời gian tới khi "có người nhận" kèo bạn vừa đăng */
const SIMULATED_ACCEPT_MS = 4000;

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
      // Ngày đã lưu có thể đã qua → chuyển về ngày mai
      const saved = d as PersonalForm;
      setForm({
        ...saved,
        minTrust: 0,
        details: saved.details ?? defaultDetails(saved.sport),
        time: { ...saved.time, day: normalizeKeoDay(saved.time.day) },
      } as unknown as T);
      setUsingDefault(true);
    }
  }, [store.ready, store.defaults, kind]);
  return { store, form, setForm, usingDefault, setUsingDefault };
}

/* ====================================================================== */
/* LÊN KÈO 1:1 (mình và một đồng đội)                                     */
/* ====================================================================== */
export function PersonalFlow() {
  const { position } = useViewerPosition();
  const { store, form, setForm, usingDefault, setUsingDefault } = useDefaultForm<PersonalForm>("personal", emptyPersonalForm);
  const [saveDefault, setSaveDefault] = React.useState(false);
  const [step, setStep] = React.useState<"form" | "results" | "done">("form");
  const [skipped, setSkipped] = React.useState<string[]>([]);
  const [result, setResult] = React.useState<{ keo: Keo; partner?: MatchCandidate } | null>(null);
  const [chatOpen, setChatOpen] = React.useState(false);
  const [useIndoor, setUseIndoor] = React.useState(false);

  // Hồ sơ cá nhân hoá (onboarding) → thuật toán ghép v3: ≤3 km, giao thoa giờ, loại buổi, cường độ,
  // trình độ, vibe, cách giao tiếp, độ tin cậy theo cỡ mẫu, cùng giới, đỡ tạ, rủi ro vị trí nhiều tín hiệu
  const onboarding = useOnboardingProfile();
  const run = React.useMemo(() => {
    if (step === "form" || !form.place) return null;
    const me = toPartnerProfile(onboarding, form.place.position);
    return findPersonalMatchesV2(form, CANDIDATES_DATA, me, { excludeIds: skipped, radiusKm: onboarding?.completedAt ? onboarding.radiusKm : 3 });
  }, [form, skipped, step, onboarding]);
  const matches = run?.matches ?? [];
  const sessionDate = React.useMemo(() => (form.place ? resolveDay(form.time.day, new Date()) : null), [form.place, form.time.day]);
  const hourly = useHourlyWeather(step === "results" && form.place ? form.place.position : null, step === "results" ? sessionDate : null);
  const weather = hourly
    ? weatherAdvice(form.sport, toMinutes(form.time.from) / 60, toMinutes(form.time.to) / 60, hourly, { from: form.place?.position, indoorSpots: INDOOR_SPOTS })
    : null;
  const indoorProposal = useIndoor && weather?.proposal ? spotToPlace(weather.proposal) : null;

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
    minTrust: 0,
    details: form.details,
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
    // Đề xuất đổi Spot: bạn (chủ kèo) đã xác nhận, còn chờ bạn tập xác nhận — địa điểm chưa đổi
    const final = indoorProposal ? proposeVenueChange(keo, indoorProposal, "me") : keo;
    store.addKeo(final);
    setResult({ keo: final, partner: c });
    setStep("done");
  };

  const postPublic = () => {
    const keo = baseKeo();
    store.addKeo(keo);
    // DEMO: vài giây sau có người nhận kèo → host thấy trong "Kèo của bạn" và chat
    setTimeout(() => store.simulateIncomingAccept(keo.id), SIMULATED_ACCEPT_MS);
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
              ? "Kèo đã chốt. Check-in đúng giờ được +0,5 UT. Huỷ sớm −0,25, trong 30 phút −0,5 UT."
              : "Kèo đã hiện trên bảng kèo. Có người nhận, bạn sẽ thấy trong \"Kèo của bạn\" và chat; bạn được từ chối tới trước giờ tập 24 giờ."
          }
          keo={result.keo}
        />
        {p && result.keo.venueChange?.status === "pending" && (
          <div className="mt-3 rounded-2xl border border-border bg-muted/50 p-3 text-[12.5px] text-foreground flex gap-2.5">
            <CloudLightning className="h-5 w-5 shrink-0" />
            <p>
              Đã gửi đề xuất đổi sang <b>{result.keo.venueChange.to.name}</b>. Đang chờ {p.name} xác nhận ({pendingConfirmations(result.keo).length} người).
              Nếu {p.name} không đồng ý, kèo giữ ở {result.keo.venueChange.from.name}; hai bạn có thể huỷ hoặc đổi giờ không bị phạt.
            </p>
          </div>
        )}
        {p && (
          <div className="mt-3">
            <SessionPlanBlock place={form.place} candidate={p} time={form.time} />
          </div>
        )}
        <div className="mt-4 flex gap-2">
          {p && (
            <button onClick={() => setChatOpen(true)} className="flex-1 rounded-lg bg-brand hover:bg-brand-700 text-white py-3 text-[14px] font-bold flex items-center justify-center gap-1.5 active:scale-[0.98]">
              <MessageCircle className="h-4 w-4" /> Nhắn tin
            </button>
          )}
          <Link href="/ho-so?tab=bounties" className="flex-1 rounded-lg border-2 border-brand text-brand dark:text-brand-sky dark:border-brand-sky py-2.5 text-[14px] font-bold text-center hover:bg-brand-50 dark:hover:bg-brand-950">
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
                dateTimeVi: `${result.keo.time.from} • ${formatKeoDay(result.keo.time.day)}`,
                locationName: result.keo.place.name,
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
            <Sparkles className="h-5 w-5 text-foreground" /> {matches.length > 0 ? `${matches.length} người tương thích nhất` : "Chưa tìm thấy người phù hợp"}
          </h2>
          <p className="text-[12.5px] text-muted-foreground">
            {SPORT_LABEL[form.sport]} · {form.place?.name} · {formatKeoDay(form.time.day)} {form.time.from}–{form.time.to} · ≤ {run?.radiusKm ?? 3} km
          </p>
          {run?.widened && <p className="mt-1 text-[12px] text-amber-600">Không có ai trong 3 km — đã mở rộng tới {run.radiusKm} km.</p>}
          {run && (run.excluded.locationRestricted > 0 || run.excluded.gender > 0 || run.needsVerification > 0) && (
            <p className="mt-1 text-[11.5px] text-muted-foreground flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-foreground" />
              {[
                run.excluded.locationRestricted ? `Đã lọc ${run.excluded.locationRestricted} tài khoản bị hạn chế vị trí` : "",
                run.excluded.gender ? `Đã lọc ${run.excluded.gender} khác giới (an toàn)` : "",
                run.needsVerification ? `${run.needsVerification} người đang chờ xác minh vị trí` : "",
              ]
                .filter(Boolean)
                .join(" · ")}
            </p>
          )}
        </div>

        {weather && weather.risk !== "none" && (
          <div className={cn("mb-3 rounded-2xl border p-3 flex gap-2.5", weather.risk === "storm" ? "border-amber-300 bg-amber-50 dark:bg-amber-950/40" : "border-brand-200 bg-brand-50 dark:bg-brand-950/40")}>
            <CloudLightning className="h-5 w-5 shrink-0 text-foreground" />
            <div className="text-[12.5px] text-foreground space-y-2">
              <p>{weather.message}</p>
              {weather.risk === "storm" && (
                <div className="flex flex-wrap gap-2">
                  {weather.proposal && (
                    <button
                      type="button"
                      onClick={() => setUseIndoor((v) => !v)}
                      aria-pressed={useIndoor}
                      className={cn(
                        "rounded-lg px-3 py-1.5 text-[12.5px] font-bold border",
                        useIndoor ? "bg-foreground text-background border-foreground" : "border-foreground/40 hover:bg-background"
                      )}
                    >
                      {useIndoor ? "✓ Sẽ đề xuất đổi sang " : "Đề xuất đổi sang "}
                      {weather.proposal.name}
                    </button>
                  )}
                  <button type="button" onClick={() => setStep("form")} className="rounded-lg px-3 py-1.5 text-[12.5px] font-bold border border-foreground/40 hover:bg-background">
                    Đổi giờ (không phạt)
                  </button>
                </div>
              )}
              {useIndoor && weather.proposal && <p className="text-[11.5px] text-muted-foreground">Địa điểm chỉ đổi khi bạn tập cũng xác nhận. Không đồng ý thì giữ chỗ cũ.</p>}
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
                    {formatUt(c.trustScore)} UT · {c.punctualRate.split(" (")[0]} · cách {c.distanceKm} km
                  </p>
                </div>
                <div className="text-center shrink-0">
                  <p className="text-[22px] font-black font-display text-brand dark:text-brand-sky leading-none">{breakdown.totalScore}%</p>
                  <p className="text-[10px] text-muted-foreground">tương thích</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {breakdown.matchReasonVi.slice(0, 3).map((r) => (
                  <span key={r} className="rounded-lg bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-brand-200 px-2 py-0.5 text-[11px] font-semibold">
                    {r}
                  </span>
                ))}
              </div>
              <p className="text-[11.5px] font-bold uppercase tracking-wider text-muted-foreground">Buổi tập đề xuất cùng {c.name}</p>
              <SessionPlanBlock place={form.place} candidate={c} time={form.time} />
              <div className="flex gap-2">
                <button
                  onClick={() => setSkipped((s) => [...s, c.id])}
                  className="h-10 px-4 rounded-lg border border-border text-[13px] font-bold text-foreground hover:bg-muted active:scale-95 flex items-center gap-1"
                >
                  <X className="h-4 w-4" /> Bỏ qua
                </button>
                <button
                  onClick={() => accept(c)}
                  className="flex-1 h-10 rounded-lg bg-brand hover:bg-brand-700 active:scale-[0.98] text-white text-[13.5px] font-bold"
                >
                  Chấp nhận
                </button>
              </div>
            </li>
          ))}
        </ul>

        {matches.length === 0 && (
          <EmptyBox text="Thử nới khung giờ hoặc đăng kèo công khai để người khác tìm thấy bạn." />
        )}

        <div className="mt-4 rounded-2xl border border-dashed border-brand-300 p-3.5 text-center space-y-2">
          <p className="text-[13px] text-foreground">Không ai hợp ý? Đăng kèo công khai để người gần bạn nhận.</p>
          <div className="flex gap-2 justify-center">
            {skipped.length > 0 && (
              <button onClick={() => setSkipped([])} className="rounded-lg border border-border px-3.5 py-2 text-[12.5px] font-bold flex items-center gap-1 hover:bg-muted">
                <RefreshCw className="h-3.5 w-3.5" /> Xem lại
              </button>
            )}
            <button onClick={postPublic} className="rounded-lg bg-black text-white dark:bg-white dark:text-black px-4 py-2 text-[12.5px] font-bold hover:opacity-90 active:scale-95">
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

  // Tham gia nhóm → bảng chấp nhận (tin nhắn xác nhận) → chấp nhận xong mới vào chat nhóm (D33)
  const [acceptKeo, setAcceptKeo] = React.useState<Keo | null>(null);
  const [chatKeo, setChatKeo] = React.useState<Keo | null>(null);
  const join = (keo: Keo) => setAcceptKeo(keo);
  const accepted = (keo: Keo) => {
    const k = { ...keo, memberIds: [...keo.memberIds, "me"] };
    setAcceptKeo(null);
    setResult({ keo: k, joined: true });
    setStep("done");
    setChatKeo(k);
  };
  const chat = (
    <>
      <AcceptKeoSheet keo={acceptKeo} onClose={() => setAcceptKeo(null)} onAccepted={accepted} />
      <KeoChatSheet keo={chatKeo} open={!!chatKeo} onClose={() => setChatKeo(null)} />
    </>
  );

  const createOwn = () => {
    const guests = Array.from({ length: form.present - 1 }, (_, i) => `guest-${i + 1}`);
    const keo: Keo = {
      id: `my-${Date.now()}`,
      kind: "group",
      hostId: "me",
      title: `Nhóm ${SPORT_LABEL[form.sport]?.toLowerCase()} tại ${form.place!.name}`,
      sport: form.sport,
      place: form.place!,
      time: form.time,
      capacity: form.capacity,
      memberIds: ["me", ...guests],
      note: form.note,
      minTrust: 0,
      details: form.details,
      createdAt: new Date().toISOString(),
      mine: true,
    };
    store.addKeo(keo);
    setTimeout(() => store.simulateIncomingAccept(keo.id), SIMULATED_ACCEPT_MS);
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
              ? "Bạn đã gửi lời chào vào chat nhóm, host đã nhận thông báo. Rút trước khi chốt không bị trừ điểm."
              : `Đang chờ thêm ${result.keo.capacity - result.keo.memberIds.length} người. Mỗi người vào, số còn thiếu giảm 1; bạn được từ chối tới trước giờ tập 24 giờ.`
          }
          keo={result.keo}
        />
        <div className="mt-4 flex gap-2">
          <button
            onClick={() => setChatKeo(result.keo)}
            className="flex-1 rounded-lg bg-brand hover:bg-brand-700 text-white py-3 text-[14px] font-bold flex items-center justify-center gap-1.5"
          >
            <MessageCircle className="h-4 w-4" /> Chat nhóm
          </button>
          <Link href="/ho-so?tab=bounties" className="flex-1 rounded-lg border-2 border-brand text-brand dark:text-brand-sky dark:border-brand-sky py-2.5 text-[14px] font-bold text-center">
            Xem kèo của tôi
          </Link>
        </div>
        {chat}
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
          <UsersRound className="h-5 w-5 text-foreground" /> Nhóm đang thiếu người
        </h2>
        <p className="text-[12.5px] text-muted-foreground mb-3">
          Bạn mang theo {form.present} người · {SPORT_LABEL[form.sport]} · {formatKeoDay(form.time.day)} {form.time.from}–{form.time.to}
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
          <button onClick={createOwn} className="w-full rounded-lg bg-black hover:opacity-90 text-white dark:bg-white dark:text-black py-3.5 text-[14px] font-bold active:scale-[0.98]">
            Bỏ qua · Tự lập nhóm (thiếu {form.capacity - form.present} người)
          </button>
        </div>
        {chat}
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

/* ====================================================================== */
/* CÁ NHÂN — kế hoạch tự tập (một mình)                                    */
/* ====================================================================== */
export function SoloFlow() {
  const { position } = useViewerPosition();
  const store = useKeoStore();
  const [form, setForm] = React.useState<PersonalForm>(emptyPersonalForm);
  const [plan, setPlan] = React.useState<SoloPlan | null>(null);
  const opened = plan ? store.plans.find((p) => p.id === plan.id)?.openedAsKeoId : undefined;

  const save = () => {
    const p: SoloPlan = {
      id: `plan-${Date.now()}`,
      sport: form.sport,
      place: form.place!,
      time: form.time,
      note: form.note,
      details: form.details,
      createdAt: new Date().toISOString(),
    };
    store.addPlan(p);
    setPlan(p);
  };

  const openToOthers = () => {
    if (!plan) return;
    store.openPlan(plan.id, {
      id: `my-${Date.now()}`,
      kind: "personal",
      hostId: "me",
      title: `${SPORT_LABEL[plan.sport]} tại ${plan.place.name}`,
      sport: plan.sport,
      place: plan.place,
      time: plan.time,
      capacity: 2,
      memberIds: ["me"],
      note: plan.note,
      minTrust: 0,
      details: plan.details,
      createdAt: new Date().toISOString(),
      mine: true,
    });
  };

  if (plan) {
    return (
      <div className="space-y-3">
        <div className="rounded-2xl border border-border bg-card p-5 text-center space-y-3 animate-in zoom-in-95 duration-200">
          <CheckCircle2 className="h-14 w-14 text-foreground mx-auto" />
          <h2 className="text-[19px] font-extrabold text-foreground">Đã lưu kế hoạch tự tập</h2>
          <p className="text-[13px] text-muted-foreground flex items-center justify-center gap-1.5">
            <Lock className="h-3.5 w-3.5" /> Chỉ mình bạn thấy. Không cộng, không trừ UT.
          </p>
          <div className="rounded-xl bg-muted p-3 text-left text-[13px] space-y-1">
            <p><b>{SPORT_LABEL[plan.sport]} tại {plan.place.name}</b></p>
            <p className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5 shrink-0" />{formatKeoDay(plan.time.day)} · {plan.time.from}–{plan.time.to}</p>
            {plan.details && (
              <p className="flex items-center gap-1.5"><Dumbbell className="h-3.5 w-3.5 shrink-0" />{summarizeDetails(plan.sport, plan.details)}</p>
            )}
          </div>
          <ReminderList day={plan.time.day} from={plan.time.from} who="Bạn" />
          <p className="text-[12px] text-muted-foreground text-left">
            Tập từ 30 phút trở lên và có xác thực (check-in, đồng hồ) thì buổi này được tính vào chuỗi ngày tập.
          </p>
        </div>
        {opened ? (
          <p className="rounded-xl bg-muted p-3 text-[12.5px] text-foreground text-center">
            Đã mở thành kèo 1:1 trên bảng kèo. Ai nhận kèo thì luật UT áp dụng như kèo 1:1 bình thường.
          </p>
        ) : (
          <button onClick={openToOthers} className="w-full rounded-lg border-2 border-foreground py-3 text-[14px] font-bold text-foreground hover:bg-muted">
            Mở cho người khác tập cùng
          </button>
        )}
        <Link href="/len-keo" className="block w-full rounded-lg bg-brand hover:bg-brand-700 text-white py-3 text-center text-[14px] font-bold">
          Về Lên kèo
        </Link>
      </div>
    );
  }

  return (
    <KeoForm kind="solo" value={form} onChange={setForm} onSubmit={save} viewerPosition={position} />
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
      <CheckCircle2 className="h-14 w-14 text-foreground mx-auto" />
      <h2 className="text-[19px] font-extrabold text-foreground">{title}</h2>
      <p className="text-[13px] text-muted-foreground">{subtitle}</p>
      <div className="rounded-xl bg-muted p-3 text-left text-[13px] space-y-1">
        <p>
          <b>{displayTitle(keo)}</b>
        </p>
        <p className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5 shrink-0" />{formatKeoDay(keo.time.day)} · {keo.time.from}–{keo.time.to}</p>
        <p className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 shrink-0" />{keo.place.name}</p>
        {keo.details && (
          <p className="flex items-center gap-1.5"><Dumbbell className="h-3.5 w-3.5 shrink-0" />{summarizeDetails(keo.sport, keo.details)}</p>
        )}
        <div className="pt-1">
          <MemberAvatars ids={keo.memberIds} capacity={keo.capacity} guests={keo.guestProfiles} />
        </div>
      </div>
      <ReminderList day={keo.time.day} from={keo.time.from} who={keo.kind === "group" ? "Cả nhóm" : "Hai bạn"} />
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
