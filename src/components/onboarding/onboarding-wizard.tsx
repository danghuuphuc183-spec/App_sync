"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, CloudLightning, LocateFixed, Shield, Sparkles, Users, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/auth-context";
import {
  COMM_STYLE_OPTIONS,
  DEFAULT_ONBOARDING,
  GOALS,
  INTENSITY_OPTIONS,
  SPORT_OPTIONS,
  WORKOUTS_BY_SPORT,
  migrateOnboarding,
  saveOnboarding,
  toPartnerProfile,
  type OnboardingProfile,
} from "@/features/onboarding/onboarding";
import { COMM_STYLE_LABEL, DAY_PARTS, INTENSITY_LABEL, slotKey, matchPartners, WORKOUT_LABEL, type DayPart } from "@/features/match/partner-match";
import { candidateToPartner } from "@/features/match/partner-pool";
import { CANDIDATES_DATA } from "@/features/match/candidates.data";
import { ConnectAppsStep, PermissionsStep } from "./permissions-and-apps";
import { GoalIcon, SportIcon } from "@/components/shared/sport-icon";

const DRAFT_KEY = "sync.onboarding.draft";
const DAYS = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
const PART_LABEL: Record<DayPart, string> = { dawn: "5–7h", morning: "7–11h", noon: "11–14h", afternoon: "14–17h", evening: "17–20h", night: "20–22h" };
const AREAS: { label: string; pos: [number, number] }[] = [
  { label: "Bình Thạnh", pos: [10.8017, 106.7145] },
  { label: "Quận 1", pos: [10.7769, 106.7009] },
  { label: "Quận 3", pos: [10.7843, 106.6844] },
  { label: "Phú Nhuận", pos: [10.7992, 106.6807] },
  { label: "Thủ Đức (Q.2)", pos: [10.8031, 106.734] },
  { label: "Quận 7", pos: [10.7342, 106.7217] },
  { label: "Tân Bình", pos: [10.8015, 106.6527] },
  { label: "Gò Vấp", pos: [10.8387, 106.6653] },
];

/* ---------- UI nhỏ ---------- */
function Chip({ on, onClick, children, className }: { on: boolean; onClick: () => void; children: React.ReactNode; className?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={on}
      className={cn(
        "rounded-2xl border px-3.5 py-2.5 text-[13.5px] font-semibold text-left transition-all active:scale-[0.98]",
        on ? "border-brand-sky bg-brand/30 text-white shadow-[0_0_0_1px_rgba(57,161,244,.4)]" : "border-white/12 bg-white/[0.05] text-white/85 hover:bg-white/10",
        className
      )}
    >
      {children}
    </button>
  );
}

function Toggle({ on, onChange, title, desc }: { on: boolean; onChange: (v: boolean) => void; title: string; desc: string }) {
  return (
    <button type="button" onClick={() => onChange(!on)} aria-pressed={on} className="w-full flex items-center gap-3 rounded-2xl bg-white/[0.06] border border-white/10 p-3.5 text-left">
      <span className="flex-1">
        <span className="block text-[14px] font-bold">{title}</span>
        <span className="block text-[12px] text-white/60">{desc}</span>
      </span>
      <span className={cn("h-7 w-12 shrink-0 rounded-full p-0.5 transition-colors", on ? "bg-brand-sky" : "bg-white/20")}>
        <span className={cn("block h-6 w-6 rounded-full bg-white transition-transform", on && "translate-x-5")} />
      </span>
    </button>
  );
}

function NumberField({ label, value, onChange, min, max, unit }: { label: string; value: number; onChange: (v: number) => void; min: number; max: number; unit: string }) {
  return (
    <label className="block rounded-2xl bg-white/[0.06] border border-white/10 px-3.5 py-2.5">
      <span className="block text-[11.5px] text-white/55">{label}</span>
      <span className="flex items-baseline gap-1">
        <input
          type="number"
          inputMode="numeric"
          value={value}
          min={min}
          max={max}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full bg-transparent text-[20px] font-extrabold outline-none"
        />
        <span className="text-[12px] text-white/55">{unit}</span>
      </span>
    </label>
  );
}

/* ====================================================================== */
export function OnboardingWizard() {
  const router = useRouter();
  const { user, completeOnboarding } = useAuth();
  const [p, setP] = React.useState<OnboardingProfile>(DEFAULT_ONBOARDING);
  const [step, setStep] = React.useState(0);
  const [loaded, setLoaded] = React.useState(false);

  React.useEffect(() => {
    try {
      const raw = window.localStorage.getItem(DRAFT_KEY);
      if (raw) setP(migrateOnboarding(JSON.parse(raw) as Partial<OnboardingProfile>));
    } catch {
      /* bỏ qua */
    }
    setLoaded(true);
  }, []);
  React.useEffect(() => {
    if (!p.displayName && user?.name) setP((x) => ({ ...x, displayName: user.name }));
  }, [user?.name, p.displayName]);
  React.useEffect(() => {
    if (!loaded) return;
    try {
      window.localStorage.setItem(DRAFT_KEY, JSON.stringify(p));
    } catch {
      /* bỏ qua */
    }
  }, [p, loaded]);

  const set = (patch: Partial<OnboardingProfile>) => setP((x) => ({ ...x, ...patch }));
  /** Cập nhật dựa trên trạng thái MỚI NHẤT — tránh mất lựa chọn khi chạm nhanh liên tiếp */
  const update = (fn: (x: OnboardingProfile) => Partial<OnboardingProfile>) => setP((x) => ({ ...x, ...fn(x) }));
  const toggleIn = <T,>(list: T[], v: T) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

  const hasGym = p.sports.includes("gym") || p.sports.includes("calisthenics");
  const workoutOptions = p.sports.flatMap((s) => (WORKOUTS_BY_SPORT[s] ?? []).map((w) => ({ ...w, sport: s })));

  const finish = () => {
    const done = { ...p, completedAt: new Date().toISOString() };
    saveOnboarding(done);
    window.localStorage.removeItem(DRAFT_KEY);
    const apps = Object.fromEntries(p.connectedApps.map((id) => [id, true]));
    completeOnboarding({
      name: p.displayName,
      sportsProfile: {
        preferredSports: p.sports,
        fitnessGoal: GOALS.filter((g) => p.goals.includes(g.id)).map((g) => g.label).join(", "),
        runningPace: "",
        preferredArea: p.areaLabel,
        buddyStyle: p.vibe === "performance" ? "Mode Hiệu suất" : "Mode Đồng hành thân thiện",
        privacyZoneEnabled: p.hideExactLocation,
      },
      permissions: { gps: p.permissions.gps === "granted", camera: p.permissions.camera === "granted", notifications: p.permissions.notifications === "granted" },
      connectedApps: apps,
    });
    router.push("/");
  };

  const steps: { key: string; title: string; sub: string; valid: boolean; body: React.ReactNode }[] = [
    {
      key: "about",
      title: "Giới thiệu về bạn",
      sub: "Giới tính dùng cho tuỳ chọn an toàn. Năm sinh để xác nhận bạn đủ 18 tuổi.",
      valid: p.displayName.trim().length >= 2 && p.gender !== "unspecified",
      body: (
        <div className="space-y-3">
          <label className="block rounded-2xl bg-white/[0.06] border border-white/10 px-3.5 py-2.5">
            <span className="block text-[11.5px] text-white/55">Tên hiển thị</span>
            <input value={p.displayName} onChange={(e) => set({ displayName: e.target.value })} className="w-full bg-transparent text-[18px] font-bold outline-none" aria-label="Tên hiển thị" />
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(
              [
                ["female", "Nữ"],
                ["male", "Nam"],
                ["other", "Khác"],
              ] as const
            ).map(([id, l]) => (
              <Chip key={id} on={p.gender === id} onClick={() => set({ gender: id, sameGenderOnly: id === "female" ? true : p.sameGenderOnly })} className="text-center">
                {l}
              </Chip>
            ))}
          </div>
          <NumberField label="Năm sinh" value={p.birthYear} onChange={(v) => set({ birthYear: v })} min={1940} max={2015} unit="" />
        </div>
      ),
    },
    {
      key: "goals",
      title: "Mục tiêu tập luyện",
      sub: "Chọn một hoặc nhiều mục tiêu.",
      valid: p.goals.length > 0,
      body: (
        <div className="grid grid-cols-2 gap-2">
          {GOALS.map((g) => (
            <Chip key={g.id} on={p.goals.includes(g.id)} onClick={() => update((x) => ({ goals: toggleIn(x.goals, g.id) }))}>
              <GoalIcon goal={g.id} className="mr-1.5 inline h-4 w-4 -mt-0.5" />
              {g.label}
            </Chip>
          ))}
        </div>
      ),
    },
    {
      key: "workouts",
      title: "Bạn tập gì?",
      sub: "Chọn môn, loại buổi, trình độ và cường độ — hệ thống ghép theo đúng buổi tập, không theo hồ sơ người.",
      valid: p.sports.length > 0 && (workoutOptions.length === 0 || p.workoutTypes.length > 0),
      body: (
        <div className="space-y-4">
          <div className="grid grid-cols-4 gap-2">
            {SPORT_OPTIONS.map((s) => (
              <Chip
                key={s.id}
                on={p.sports.includes(s.id)}
                onClick={() =>
                  update((x) => {
                    const sports = toggleIn(x.sports, s.id);
                    const allowed = new Set(sports.flatMap((sp) => (WORKOUTS_BY_SPORT[sp] ?? []).map((w) => w.id)));
                    return { sports, workoutTypes: x.workoutTypes.filter((w) => allowed.has(w)) };
                  })
                }
                className="flex flex-col items-center gap-1 px-1 py-2 text-[11.5px] text-center"
              >
                <SportIcon sport={s.id} className="h-6 w-6" />
                {s.label}
              </Chip>
            ))}
          </div>
          {workoutOptions.length > 0 && (
            <div className="space-y-2">
              <p className="text-[12px] font-bold uppercase tracking-wider text-white/55">Loại buổi tập</p>
              <div className="grid grid-cols-2 gap-2">
                {workoutOptions.map((w) => (
                  <Chip key={w.id} on={p.workoutTypes.includes(w.id)} onClick={() => update((x) => ({ workoutTypes: toggleIn(x.workoutTypes, w.id) }))}>
                    <span className="block">{w.label}</span>
                    <span className="block text-[11px] font-normal text-white/55">{w.hint}</span>
                  </Chip>
                ))}
              </div>
            </div>
          )}
          <div className="space-y-2">
            <p className="text-[12px] font-bold uppercase tracking-wider text-white/55">Trình độ</p>
            <div className="grid grid-cols-4 gap-2">
              {(
                [
                  ["new", "Mới tập"],
                  ["casual", "Phong trào"],
                  ["advanced", "Bán chuyên"],
                  ["pro", "Chuyên nghiệp"],
                ] as const
              ).map(([id, l]) => (
                <Chip key={id} on={p.level === id} onClick={() => set({ level: id })} className="px-1 text-center text-[12px]">
                  {l}
                </Chip>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-[12px] font-bold uppercase tracking-wider text-white/55">Cường độ thường tập</p>
            <div className="grid grid-cols-3 gap-2">
              {INTENSITY_OPTIONS.map((o) => (
                <Chip key={o.id} on={p.intensity === o.id} onClick={() => set({ intensity: o.id })} className="px-2 text-center">
                  <span className="block">{o.label}</span>
                  <span className="block text-[11px] font-normal text-white/55">{o.hint}</span>
                </Chip>
              ))}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "schedule",
      title: "Khi nào bạn rảnh?",
      sub: "Chạm để chọn các khung giờ hay tập. Chỉ ghép với người có giờ rảnh giao nhau.",
      valid: p.availability.length > 0,
      body: (
        <div>
          <div className="flex flex-wrap gap-1.5 mb-3">
            {(
              [
                ["Sáng sớm mỗi ngày", [0, 1, 2, 3, 4, 5, 6].map((d) => slotKey(d, "dawn"))],
                ["Tối ngày thường", [0, 1, 2, 3, 4].map((d) => slotKey(d, "evening"))],
                ["Cuối tuần", [5, 6].flatMap((d) => (["dawn", "morning", "afternoon"] as DayPart[]).map((x) => slotKey(d, x)))],
              ] as [string, string[]][]
            ).map(([l, slots]) => (
              <button key={l} type="button" onClick={() => update((x) => ({ availability: [...new Set([...x.availability, ...slots])] }))} className="rounded-lg bg-white/10 px-3 py-1.5 text-[12px] font-semibold hover:bg-white/20">
                + {l}
              </button>
            ))}
            {p.availability.length > 0 && (
              <button type="button" onClick={() => set({ availability: [] })} className="rounded-lg px-3 py-1.5 text-[12px] font-semibold text-white/60">
                Xoá hết
              </button>
            )}
          </div>
          <div className="grid gap-1" style={{ gridTemplateColumns: "46px repeat(7, minmax(0,1fr))" }} role="grid" aria-label="Lịch rảnh trong tuần">
            <span />
            {DAYS.map((d) => (
              <span key={d} className="text-center text-[11px] font-bold text-white/60">
                {d}
              </span>
            ))}
            {DAY_PARTS.map((part) => (
              <React.Fragment key={part}>
                <span className="text-[10.5px] text-white/55 flex items-center">{PART_LABEL[part]}</span>
                {DAYS.map((d, di) => {
                  const k = slotKey(di, part);
                  const on = p.availability.includes(k);
                  return (
                    <button
                      key={k}
                      type="button"
                      role="gridcell"
                      aria-selected={on}
                      aria-label={`${d} ${PART_LABEL[part]}`}
                      onClick={() => update((x) => ({ availability: toggleIn(x.availability, k) }))}
                      className={cn("h-9 rounded-lg transition-colors", on ? "bg-brand-sky shadow-[0_0_10px_rgba(57,161,244,.6)]" : "bg-white/[0.07] hover:bg-white/15")}
                    />
                  );
                })}
              </React.Fragment>
            ))}
          </div>
          <p className="mt-2 text-[12px] text-white/55">Đã chọn {p.availability.length} khung giờ</p>
        </div>
      ),
    },
    {
      key: "area",
      title: "Bạn tập ở đâu?",
      sub: "Mặc định chỉ ghép trong bán kính 3 km để dễ gặp nhau.",
      valid: !!p.position,
      body: (
        <div className="space-y-3">
          <button
            type="button"
            onClick={() =>
              navigator.geolocation?.getCurrentPosition(
                (g) => set({ position: [g.coords.latitude, g.coords.longitude], areaLabel: "Vị trí hiện tại", permissions: { ...p.permissions, gps: "granted" } }),
                () => set({ permissions: { ...p.permissions, gps: "denied" } }),
                { timeout: 8000 }
              )
            }
            className={cn("w-full flex items-center gap-3 rounded-2xl border p-3.5 text-left", p.areaLabel === "Vị trí hiện tại" ? "border-brand-sky bg-brand/30" : "border-white/12 bg-white/[0.05]")}
          >
            <LocateFixed className="h-5 w-5 text-white" />
            <span className="flex-1">
              <span className="block text-[14px] font-bold">Dùng vị trí hiện tại (GPS)</span>
              <span className="block text-[12px] text-white/55">{p.permissions.gps === "denied" ? "Quyền vị trí bị từ chối — chọn khu vực bên dưới" : "Chính xác nhất"}</span>
            </span>
          </button>
          <div className="grid grid-cols-2 gap-2">
            {AREAS.map((a) => (
              <Chip key={a.label} on={p.areaLabel === a.label} onClick={() => set({ areaLabel: a.label, position: a.pos })}>
                {a.label}
              </Chip>
            ))}
          </div>
          <div className="rounded-2xl bg-white/[0.06] border border-white/10 p-3.5">
            <div className="flex justify-between text-[13px]">
              <span className="text-white/70">Bán kính ghép bạn tập</span>
              <b>≤ {p.radiusKm} km</b>
            </div>
            <input type="range" min={1} max={10} step={1} value={p.radiusKm} onChange={(e) => set({ radiusKm: Number(e.target.value) })} className="mt-2 w-full accent-brand-sky" aria-label="Bán kính" />
          </div>
        </div>
      ),
    },
    {
      key: "comm",
      title: "Bạn thích tập cùng thế nào?",
      sub: "Chọn trực tiếp kiểu giao tiếp khi tập. Bạn đổi được bất cứ lúc nào trong Hồ sơ.",
      valid: true,
      body: (
        <div className="space-y-2">
          {COMM_STYLE_OPTIONS.map((o) => (
            <Chip key={o.id} on={p.commStyle === o.id} onClick={() => set({ commStyle: o.id })} className="w-full py-3">
              <span className="block font-bold">{o.label}</span>
              <span className="block text-[12px] font-normal text-white/60">{o.hint}</span>
            </Chip>
          ))}
        </div>
      ),
    },
    {
      key: "vibe",
      title: "Vibe buổi tập & an toàn",
      sub: "Chọn không khí bạn muốn khi tập cùng người khác.",
      valid: true,
      body: (
        <div className="space-y-2.5">
          <div className="grid grid-cols-2 gap-2">
            <Chip on={p.vibe === "performance"} onClick={() => set({ vibe: "performance" })} className="py-3.5">
              <Zap className="h-5 w-5 text-white mb-1" />
              <span className="block font-bold">Mode Hiệu suất</span>
              <span className="block text-[11.5px] font-normal text-white/60">Tập trung tập luyện, ít xã giao</span>
            </Chip>
            <Chip on={p.vibe === "friendly"} onClick={() => set({ vibe: "friendly" })} className="py-3.5">
              <Users className="h-5 w-5 text-white mb-1" />
              <span className="block font-bold">Mode Đồng hành</span>
              <span className="block text-[11.5px] font-normal text-white/60">Cởi mở, trò chuyện nhiều hơn</span>
            </Chip>
          </div>
          <Toggle
            on={p.sameGenderOnly}
            onChange={(v) => set({ sameGenderOnly: v })}
            title="Chỉ ghép cặp cùng giới"
            desc={p.gender === "female" ? "Khuyên dùng — bảo vệ bạn khỏi rủi ro bị làm phiền" : "Chỉ hiện và ghép với người cùng giới tính"}
          />
          {hasGym && <Toggle on={p.needsSpotter} onChange={(v) => set({ needsSpotter: v })} title="Cần người đỡ tạ (spotter)" desc="Buổi tạ nặng sẽ ưu tiên người tự tin đỡ tạ an toàn" />}
          {hasGym && <Toggle on={p.canSpot} onChange={(v) => set({ canSpot: v })} title="Tôi đỡ tạ được" desc="Bạn biết cách đỡ tạ an toàn cho bench, squat" />}
          <Toggle on={p.hideExactLocation} onChange={(v) => set({ hideExactLocation: v })} title="Ẩn vị trí chính xác" desc="Người khác chỉ thấy khu vực, không thấy điểm xuất phát của bạn" />
        </div>
      ),
    },
    {
      key: "perms",
      title: "Cho phép truy cập",
      sub: "Để ghép bạn tập gần bạn và xác thực buổi tập.",
      valid: true,
      body: (
        <PermissionsStep
          value={p.permissions}
          onChange={(permissions) => update((x) => ({ permissions: { ...x.permissions, ...permissions } }))}
          onPosition={(position) => update((x) => ({ position: x.position ?? position, areaLabel: x.areaLabel || "Vị trí hiện tại" }))}
        />
      ),
    },
    {
      key: "apps",
      title: "Liên kết ứng dụng thể thao",
      sub: "Đồng bộ buổi tập của bạn để tự xác thực. Số liệu chỉ hiển thị cho chính bạn, không dùng để so sánh với người khác.",
      valid: true,
      body: <ConnectAppsStep connected={p.connectedApps} onChange={(connectedApps) => set({ connectedApps })} />,
    },
    { key: "done", title: "Sẵn sàng!", sub: "Đây là những bạn tập phù hợp nhất với bạn lúc này.", valid: true, body: <Summary p={p} /> },
  ];

  const cur = steps[step]!;
  const last = step === steps.length - 1;
  const skippable = ["perms", "apps"].includes(cur.key);

  return (
    <div className="relative min-h-dvh bg-[#020611] text-white overflow-clip">
      <div className="absolute inset-0 intro-grid opacity-40" />
      <div className="absolute -top-48 right-[-30%] h-[460px] w-[460px] rounded-full bg-brand/25 blur-[110px]" />
      <div className="relative mx-auto flex min-h-dvh max-w-md flex-col px-5 pb-6 pt-[max(16px,env(safe-area-inset-top))]">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setStep(Math.max(0, step - 1))}
            disabled={step === 0}
            aria-label="Quay lại"
            className="h-10 w-10 -ml-2 rounded-full hover:bg-white/10 flex items-center justify-center disabled:opacity-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden" role="progressbar" aria-valuenow={step + 1} aria-valuemax={steps.length}>
            <div className="h-full rounded-full bg-gradient-to-r from-brand to-brand-sky transition-all duration-500" style={{ width: `${((step + 1) / steps.length) * 100}%` }} />
          </div>
          <span className="text-[12px] font-semibold text-white/55 w-10 text-right">
            {step + 1}/{steps.length}
          </span>
        </div>

        <div key={cur.key} className="mt-5 flex-1 animate-in fade-in slide-in-from-right-4 duration-300">
          <h1 className="text-[25px] font-extrabold leading-tight font-display">{cur.title}</h1>
          <p className="mt-1 mb-5 text-[13.5px] text-white/60">{cur.sub}</p>
          {cur.body}
        </div>

        <div className="sticky bottom-0 pt-4 pb-1 bg-gradient-to-t from-[#020611] via-[#020611] to-transparent">
          <button
            onClick={() => (last ? finish() : setStep(step + 1))}
            disabled={!cur.valid}
            className="w-full h-12 rounded-lg bg-brand text-white font-bold text-[15px] hover:bg-brand-500 active:scale-[0.98] transition-all shadow-lg shadow-brand/30 disabled:bg-white/10 disabled:text-white/40 disabled:shadow-none disabled:cursor-not-allowed"
          >
            {last ? "Vào SYNESIS" : "Tiếp tục"}
          </button>
          {skippable && (
            <button onClick={() => setStep(step + 1)} className="mt-2 w-full text-center text-[13px] font-semibold text-white/55">
              Để sau
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ====================================================================== */
/* Tổng kết: chạy thuật toán ghép với hồ sơ vừa thiết lập                 */
/* ====================================================================== */
function Summary({ p }: { p: OnboardingProfile }) {
  const center = p.position ?? AREAS[0]!.pos;
  const sport = p.sports.includes("running") ? "running" : p.sports.includes("gym") || p.sports.includes("calisthenics") ? "gym" : p.sports[0] ?? "running";
  const run = React.useMemo(() => {
    const me = toPartnerProfile({ ...p, completedAt: "now" }, center);
    const pool = CANDIDATES_DATA.map((c) => candidateToPartner(c, center));
    return matchPartners(me, pool, { sport, radiusKm: p.radiusKm, limit: 3 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [p, sport]);
  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-white/[0.06] border border-white/10 p-3.5 grid grid-cols-2 gap-y-2 text-[12.5px]">
        <span className="text-white/55">Môn</span>
        <span className="font-semibold text-right">{p.sports.map((s) => SPORT_OPTIONS.find((o) => o.id === s)?.label).join(", ")}</span>
        <span className="text-white/55">Buổi tập</span>
        <span className="font-semibold text-right truncate">{p.workoutTypes.map((w) => WORKOUT_LABEL[w]).join(", ") || "—"}</span>
        <span className="text-white/55">Giờ rảnh</span>
        <span className="font-semibold text-right">{p.availability.length} khung/tuần</span>
        <span className="text-white/55">Khu vực</span>
        <span className="font-semibold text-right">{p.areaLabel} · ≤{p.radiusKm} km</span>
        <span className="text-white/55">Cường độ</span>
        <span className="font-semibold text-right">{INTENSITY_LABEL[p.intensity]}</span>
        <span className="text-white/55">Giao tiếp · Vibe</span>
        <span className="font-semibold text-right truncate">
          {COMM_STYLE_LABEL[p.commStyle]} · {p.vibe === "performance" ? "Hiệu suất" : "Đồng hành"}
        </span>
        <span className="text-white/55">Ứng dụng</span>
        <span className="font-semibold text-right">{p.connectedApps.length} đã kết nối</span>
      </div>

      <div>
        <p className="mb-2 flex items-center gap-1.5 text-[14px] font-bold">
          <Sparkles className="h-4 w-4 text-white" /> {run.matches.length ? `${run.matches.length} bạn tập phù hợp nhất` : "Chưa có ai phù hợp trong bán kính này"}
        </p>
        <ul className="space-y-2">
          {run.matches.map((m) => {
            const c = CANDIDATES_DATA.find((x) => x.id === m.profile.id)!;
            return (
              <li key={m.profile.id} className="flex items-center gap-3 rounded-2xl bg-white/[0.06] border border-white/10 p-3">
                <img src={c.avatar} alt={c.name} className="h-12 w-12 rounded-full object-cover ring-2 ring-brand-sky/50" />
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-bold">{c.name}</p>
                  <p className="text-[11.5px] text-white/60 truncate">{m.reasons.slice(0, 3).join(" · ")}</p>
                </div>
                <span className="text-[18px] font-black font-display text-brand-sky">{m.score}%</span>
              </li>
            );
          })}
        </ul>
        {run.matches.length === 0 && <p className="text-[12.5px] text-white/60">Thử tăng bán kính hoặc thêm khung giờ rảnh — bạn có thể đổi trong Hồ sơ.</p>}
      </div>

      <div className="rounded-2xl bg-white/[0.04] border border-white/10 p-3 space-y-1.5 text-[12px] text-white/65">
        <p className="flex items-center gap-1.5 font-bold text-white/85">
          <Shield className="h-4 w-4 text-white" /> Hệ thống đã lọc giúp bạn
        </p>
        <p>• {run.excluded.distance} người ngoài {p.radiusKm} km · {run.excluded.schedule} người không trùng giờ rảnh</p>
        {run.excluded.gender > 0 && <p>• {run.excluded.gender} người khác giới (tuỳ chọn an toàn)</p>}
        {run.excluded.locationRestricted > 0 && <p>• {run.excluded.locationRestricted} tài khoản bị hạn chế vị trí (nhiều tín hiệu bất thường, đã xác minh thất bại)</p>}
        <p>• Độ tin cậy tính theo số buổi đã tập — người mới không bị xếp riêng</p>
        <p className="flex items-center gap-1.5">
          <CloudLightning className="h-3.5 w-3.5 shrink-0" /> Mưa dông ở điểm hẹn ngoài trời → đề xuất phòng tập có thật gần đó, cả hai xác nhận mới đổi; huỷ hoặc đổi giờ không bị phạt
        </p>
      </div>
      <p className="flex items-center gap-1.5 text-[12px] text-emerald-300">
        <Check className="h-4 w-4" /> Bắt đầu với 7 Điểm Uy tín (UT)
      </p>
    </div>
  );
}
