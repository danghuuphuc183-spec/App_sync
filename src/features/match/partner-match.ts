/**
 * THUẬT TOÁN GHÉP PARTNER TẬP LUYỆN (v3) — tìm "Workout Slot", không phải tìm danh bạ người.
 *
 * Lõi (GIỮ): thời gian + loại buổi tập + GPS ≤ 3 km — đo được, kiểm thử được, giải thích được.
 *
 * Lọc cứng (không đạt → loại, có ghi lý do):
 *  1. Cùng môn (activity)
 *  2. GPS ≤ bán kính (mặc định 3 km)
 *  3. Có giao thoa thời gian rảnh
 *  4. An toàn giới tính: một trong hai bật "chỉ ghép cùng giới" → bắt buộc cùng giới
 *  5. Vị trí bị hạn chế: chỉ khi CÓ NHIỀU tín hiệu rủi ro VÀ đã xác minh thất bại (vẫn được kháng nghị).
 *     Một tín hiệu đơn lẻ (vd. GPS nhảy > 2 km/2 phút) KHÔNG đủ để kết luận gian lận.
 *
 * Chấm điểm (0..1):
 *   0.25 giao thoa thời gian + 0.20 loại buổi tập + 0.15 khoảng cách
 * + 0.10 vibe + 0.10 cách giao tiếp (người dùng tự chọn) + 0.10 thể lực (fitness band + cường độ)
 * + 0.10 độ tin cậy đã điều chỉnh theo cỡ mẫu
 *   × hệ số đỡ tạ (chỉ khi bạn yêu cầu người đỡ và buổi tạ nặng; dựa trên người kia tự nhận đỡ được)
 *
 * Đã LOẠI khỏi lõi (xem docs/DECISIONS.md):
 *  - DISC: không chứng minh được độ tương thích khi tập → thay bằng vibe + cách giao tiếp tự chọn.
 *  - So sánh số liệu Strava/Hevy giữa người dùng: dữ liệu Strava của ai chỉ hiển thị cho chính người đó.
 *  - BMI / tỷ lệ cân nặng để chọn người đỡ tạ: không đo năng lực đỡ tạ, tăng dữ liệu nhạy cảm.
 *  - Hàng đợi riêng "người bùng kèo chỉ ghép với nhau": tạo tầng chất lượng thấp, khó phục hồi.
 */

export type LatLng = [number, number];
export type Gender = "male" | "female" | "other";
export type Vibe = "performance" | "friendly";
/** Cách giao tiếp khi tập — người dùng tự chọn trực tiếp */
export type CommStyle = "quiet" | "chatty" | "motivating";

/* ------------------------------------------------------------------ */
/* Chuẩn hoá: activity · session type · intensity · fitness band        */
/* ------------------------------------------------------------------ */
export type Activity = "running" | "gym" | "calisthenics";

export const SESSION_TYPES = {
  running: ["long_run", "recovery", "short_run", "interval", "tempo"],
  gym: ["push", "pull", "legs", "upper", "lower", "full_body"],
  calisthenics: ["cali_skill", "cali_strength"],
} as const satisfies Record<Activity, readonly string[]>;

export type SessionType = (typeof SESSION_TYPES)[Activity][number];
/** Tên cũ — giữ để không vỡ code gọi; nghĩa là "loại buổi tập" (session type) */
export type WorkoutType = SessionType;

export type Intensity = "easy" | "moderate" | "hard";
export type FitnessBand = "beginner" | "intermediate" | "advanced" | "elite";

export const ACTIVITY_OF: Record<SessionType, Activity> = Object.fromEntries(
  (Object.keys(SESSION_TYPES) as Activity[]).flatMap((a) => SESSION_TYPES[a].map((s) => [s, a]))
) as Record<SessionType, Activity>;

/** Cường độ mặc định của từng loại buổi (khi người dùng chưa chọn) */
export const DEFAULT_INTENSITY: Record<SessionType, Intensity> = {
  long_run: "moderate",
  recovery: "easy",
  short_run: "moderate",
  interval: "hard",
  tempo: "hard",
  push: "hard",
  pull: "hard",
  legs: "hard",
  upper: "moderate",
  lower: "hard",
  full_body: "moderate",
  cali_skill: "moderate",
  cali_strength: "hard",
};

const ALL_SESSION_TYPES = new Set<string>(Object.keys(ACTIVITY_OF));

/** Đọc dữ liệu cũ: "calisthenics" trước đây là một session type → nay là activity, buổi mặc định "cali_strength" */
export function normalizeSessionType(t: string): SessionType | null {
  if (t === "calisthenics") return "cali_strength";
  return ALL_SESSION_TYPES.has(t) ? (t as SessionType) : null;
}

export const normalizeSessionTypes = (ts: ReadonlyArray<string>): SessionType[] => [
  ...new Set(ts.map(normalizeSessionType).filter((x): x is SessionType => !!x)),
];

export const INTENSITY_LABEL: Record<Intensity, string> = { easy: "Nhẹ", moderate: "Vừa", hard: "Nặng" };
export const FITNESS_BAND_LABEL: Record<FitnessBand, string> = {
  beginner: "Mới bắt đầu",
  intermediate: "Phong trào",
  advanced: "Bán chuyên",
  elite: "Chuyên nghiệp",
};
export const COMM_STYLE_LABEL: Record<CommStyle, string> = {
  quiet: "Ít nói, tập trung",
  chatty: "Vừa tập vừa trò chuyện",
  motivating: "Cổ vũ, thúc nhau",
};

/** Khung giờ trong ngày; slot key = `${thứ 0..6}-${khung}` (0 = Thứ Hai) */
export const DAY_PARTS = ["dawn", "morning", "noon", "afternoon", "evening", "night"] as const;
export type DayPart = (typeof DAY_PARTS)[number];
export const slotKey = (day: number, part: DayPart) => `${day}-${part}`;

export interface LocationPing {
  lat: number;
  lng: number;
  /** epoch giây */
  t: number;
  /** độ chính xác máy báo (m) */
  accuracyM?: number;
  /** hệ điều hành báo vị trí giả lập (mock location) */
  mocked?: boolean;
}

/** Trạng thái xác minh vị trí (check-in QR tại Spot / xác minh thủ công) */
export type LocationVerification = "none" | "pending" | "verified" | "failed" | "appealed";

export interface PartnerProfile {
  id: string;
  name: string;
  gender: Gender;
  /** activity: running / gym / calisthenics / môn khác */
  sports: string[];
  workoutTypes: SessionType[];
  availability: string[];
  position: LatLng;
  vibe: Vibe;
  commStyle: CommStyle;
  sameGenderOnly: boolean;
  fitnessBand: FitnessBand;
  /** cường độ ưa thích; không có → suy từ loại buổi */
  intensity?: Intensity;
  /** bạn cần người đỡ tạ cho buổi nặng */
  needsSpotter?: boolean;
  /** bạn tự nhận đỡ tạ an toàn được (năng lực, không dựa trên cân nặng) */
  canSpot?: boolean;
  completionRate: number;
  completedSessions: number;
  pings?: LocationPing[];
  locationVerification?: LocationVerification;
  /** số báo cáo vị trí bất thường từ người khác (đã lọc trùng) */
  locationReports?: number;
}

export const WORKOUT_LABEL: Record<SessionType, string> = {
  long_run: "Long run",
  recovery: "Recovery run",
  short_run: "Short run",
  interval: "Interval",
  tempo: "Tempo",
  push: "Push day",
  pull: "Pull day",
  legs: "Leg day",
  upper: "Upper",
  lower: "Lower",
  full_body: "Full body",
  cali_skill: "Calisthenics skill",
  cali_strength: "Calisthenics sức mạnh",
};

/* ------------------------------------------------------------------ */
/* Tiện ích                                                             */
/* ------------------------------------------------------------------ */
const toRad = (d: number) => (d * Math.PI) / 180;
export function distanceKm(a: LatLng, b: LatLng): number {
  const dLat = toRad(b[0] - a[0]);
  const dLng = toRad(b[1] - a[1]);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a[0])) * Math.cos(toRad(b[0])) * Math.sin(dLng / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.min(1, Math.sqrt(h)));
}

/** MỘT tín hiệu: hai lần ghi vị trí liên tiếp cách nhau > maxKm trong ≤ windowSec giây */
export function detectFakeGps(pings: ReadonlyArray<LocationPing> = [], maxKm = 2, windowSec = 120) {
  const sorted = [...pings].sort((a, b) => a.t - b.t);
  for (let i = 1; i < sorted.length; i++) {
    const a = sorted[i - 1]!;
    const b = sorted[i]!;
    const dt = b.t - a.t;
    const km = distanceKm([a.lat, a.lng], [b.lat, b.lng]);
    if (dt <= windowSec && km > maxKm) return { suspicious: true, jumpKm: km, seconds: dt };
  }
  return { suspicious: false as const };
}

/* ------------------------------------------------------------------ */
/* Rủi ro vị trí: nhiều tín hiệu + xác minh + kháng nghị                */
/* ------------------------------------------------------------------ */
export type LocationRiskSignal = "impossible_jump" | "mock_location" | "accuracy_anomaly" | "user_reports";

export const RISK_SIGNAL_LABEL: Record<LocationRiskSignal, string> = {
  impossible_jump: "Vị trí nhảy > 2 km trong 2 phút",
  mock_location: "Thiết bị báo vị trí giả lập",
  accuracy_anomaly: "Độ chính xác GPS bất thường (luôn 0 m)",
  user_reports: "Nhiều người báo vị trí không khớp",
};

/** Cần ít nhất ngần này tín hiệu độc lập mới yêu cầu xác minh */
export const RISK_SIGNALS_FOR_REVIEW = 2;

export type LocationRiskLevel = "clear" | "review" | "restricted";

export interface LocationRisk {
  signals: LocationRiskSignal[];
  level: LocationRiskLevel;
  /** cần check-in QR tại Spot hoặc xác minh để tiếp tục được ghép bình thường */
  needsVerification: boolean;
  canAppeal: boolean;
}

export function locationRiskSignals(p: Pick<PartnerProfile, "pings" | "locationReports">): LocationRiskSignal[] {
  const pings = p.pings ?? [];
  const out: LocationRiskSignal[] = [];
  if (detectFakeGps(pings).suspicious) out.push("impossible_jump");
  if (pings.some((x) => x.mocked)) out.push("mock_location");
  const acc = pings.map((x) => x.accuracyM).filter((x): x is number => x !== undefined);
  if (acc.length >= 2 && acc.every((x) => x === 0)) out.push("accuracy_anomaly");
  if ((p.locationReports ?? 0) >= 2) out.push("user_reports");
  return out;
}

export function assessLocationRisk(p: Pick<PartnerProfile, "pings" | "locationReports" | "locationVerification">): LocationRisk {
  const signals = locationRiskSignals(p);
  const v = p.locationVerification ?? "none";
  if (v === "verified") return { signals, level: "clear", needsVerification: false, canAppeal: false };
  if (signals.length < RISK_SIGNALS_FOR_REVIEW) return { signals, level: "clear", needsVerification: false, canAppeal: false };
  if (v === "failed") return { signals, level: "restricted", needsVerification: false, canAppeal: true };
  // Đủ nhiều tín hiệu nhưng chưa xác minh / đang kháng nghị → vẫn được ghép, kèm yêu cầu xác minh
  return { signals, level: "review", needsVerification: true, canAppeal: false };
}

/* ------------------------------------------------------------------ */
/* Độ tin cậy có điều chỉnh cỡ mẫu (thay cho hàng đợi "người bùng kèo") */
/* ------------------------------------------------------------------ */
export const RELIABILITY_PRIOR = { rate: 0.8, weight: 5 } as const;

/** Trung bình có trọng số với mức nền: người mới / ít buổi không bị kéo về 0 hay 100% */
export function adjustedReliability(rate: number, sessions: number) {
  const n = Math.max(0, sessions);
  return (rate * n + RELIABILITY_PRIOR.rate * RELIABILITY_PRIOR.weight) / (n + RELIABILITY_PRIOR.weight);
}

export type ReliabilityTier = "reliable" | "normal" | "low";
/** Chỉ là nhãn hiển thị — KHÔNG dùng để chia hàng đợi */
export function reliabilityTier(rate: number, sessions: number): ReliabilityTier {
  const r = adjustedReliability(rate, sessions);
  if (r >= 0.85) return "reliable";
  if (r < 0.6) return "low";
  return "normal";
}

/** Giao thoa thời gian: số khung trùng / số khung của người ít khung hơn */
export function scheduleOverlap(a: ReadonlyArray<string>, b: ReadonlyArray<string>) {
  const setB = new Set(b);
  const common = a.filter((s) => setB.has(s));
  return { common, score: common.length / Math.max(1, Math.min(a.length, b.length)) };
}

const WORKOUT_NEAR: Partial<Record<SessionType, Partial<Record<SessionType, number>>>> = {
  long_run: { recovery: 0.7, tempo: 0.4 },
  recovery: { long_run: 0.7, short_run: 0.6 },
  short_run: { recovery: 0.6, tempo: 0.6, interval: 0.4 },
  interval: { tempo: 0.7, short_run: 0.4 },
  tempo: { interval: 0.7, short_run: 0.6, long_run: 0.4 },
  push: { upper: 0.85, full_body: 0.5, cali_strength: 0.5 },
  pull: { upper: 0.85, full_body: 0.5, cali_strength: 0.6 },
  legs: { lower: 0.9, full_body: 0.5 },
  upper: { push: 0.85, pull: 0.85, full_body: 0.5 },
  lower: { legs: 0.9, full_body: 0.5 },
  full_body: { push: 0.5, pull: 0.5, legs: 0.5, upper: 0.5, lower: 0.5 },
  cali_strength: { pull: 0.6, push: 0.5, cali_skill: 0.6 },
  cali_skill: { cali_strength: 0.6 },
};

/** Loại buổi tập: trùng hẳn = 1, gần nhau (vd. Upper ~ Push) = điểm trung gian */
export function workoutCompat(a: ReadonlyArray<SessionType>, b: ReadonlyArray<SessionType>) {
  let best = 0;
  let pair: [SessionType, SessionType] | null = null;
  for (const x of a)
    for (const y of b) {
      const v = x === y ? 1 : WORKOUT_NEAR[x]?.[y] ?? 0;
      if (v > best) {
        best = v;
        pair = [x, y];
      }
    }
  return { score: best, pair };
}

const COMM_COMPAT: Record<string, number> = {
  "quiet|quiet": 1,
  "chatty|chatty": 1,
  "motivating|motivating": 1,
  "chatty|motivating": 0.7,
  "motivating|quiet": 0.5,
  "chatty|quiet": 0.3,
};
export function commCompat(a: CommStyle, b: CommStyle) {
  return COMM_COMPAT[[a, b].sort().join("|")] ?? 0.5;
}

const BAND_ORDER: FitnessBand[] = ["beginner", "intermediate", "advanced", "elite"];
const INTENSITY_ORDER: Intensity[] = ["easy", "moderate", "hard"];

/** Cường độ của một người cho buổi này: chọn trực tiếp, hoặc suy từ loại buổi */
export function intensityOf(p: Pick<PartnerProfile, "intensity" | "workoutTypes">, sessionTypes?: ReadonlyArray<SessionType>): Intensity {
  if (p.intensity) return p.intensity;
  const t = (sessionTypes && sessionTypes.length ? sessionTypes : p.workoutTypes)[0];
  return t ? DEFAULT_INTENSITY[t] : "moderate";
}

/** Thể lực: gần fitness band + cùng cường độ (dữ liệu người dùng tự khai, không lấy từ Strava/Hevy) */
export function fitnessCompat(a: FitnessBand, b: FitnessBand, ia: Intensity, ib: Intensity) {
  const band = [1, 0.65, 0.25, 0][Math.abs(BAND_ORDER.indexOf(a) - BAND_ORDER.indexOf(b))] ?? 0;
  const intens = [1, 0.6, 0.2][Math.abs(INTENSITY_ORDER.indexOf(ia) - INTENSITY_ORDER.indexOf(ib))] ?? 0.2;
  return 0.6 * band + 0.4 * intens;
}

const HEAVY: SessionType[] = ["push", "legs", "lower"];

/** Đỡ tạ: chỉ xét khi bạn yêu cầu người đỡ và buổi tạ nặng; dựa trên người kia tự nhận đỡ được */
export function spotterNeed(me: PartnerProfile, other: PartnerProfile, sessionTypes: ReadonlyArray<SessionType>) {
  const applies = !!me.needsSpotter && sessionTypes.some((t) => HEAVY.includes(t));
  return { applies, ok: !applies || !!other.canSpot };
}

/* ------------------------------------------------------------------ */
/* Ghép                                                                 */
/* ------------------------------------------------------------------ */
export interface PartnerMatch {
  profile: PartnerProfile;
  score: number; // 0..100
  distanceKm: number;
  commonSlots: string[];
  workoutPair: [SessionType, SessionType] | null;
  spotter: { applies: boolean; ok: boolean };
  tier: ReliabilityTier;
  reliability: number;
  location: LocationRisk;
  reasons: string[];
}

export interface MatchRun {
  matches: PartnerMatch[];
  excluded: { distance: number; schedule: number; gender: number; locationRestricted: number; sport: number };
  /** số người được ghép nhưng đang chờ xác minh vị trí */
  needsVerification: number;
}

export const emptyExcluded = (): MatchRun["excluded"] => ({ distance: 0, schedule: 0, gender: 0, locationRestricted: 0, sport: 0 });

export function matchPartners(
  me: PartnerProfile,
  candidates: ReadonlyArray<PartnerProfile>,
  opts: { sport: string; radiusKm?: number; sessionTypes?: SessionType[]; intensity?: Intensity; limit?: number }
): MatchRun {
  const radius = opts.radiusKm ?? 3;
  const sessionTypes = opts.sessionTypes ?? me.workoutTypes;
  const myIntensity = opts.intensity ?? intensityOf(me, sessionTypes);
  const excluded = emptyExcluded();
  let needsVerification = 0;
  const matches: PartnerMatch[] = [];

  for (const c of candidates) {
    if (c.id === me.id) continue;
    if (!c.sports.includes(opts.sport)) {
      excluded.sport++;
      continue;
    }
    const location = assessLocationRisk(c);
    if (location.level === "restricted") {
      excluded.locationRestricted++;
      continue;
    }
    if ((me.sameGenderOnly || c.sameGenderOnly) && me.gender !== c.gender) {
      excluded.gender++;
      continue;
    }
    const d = distanceKm(me.position, c.position);
    if (d > radius) {
      excluded.distance++;
      continue;
    }
    const sched = scheduleOverlap(me.availability, c.availability);
    if (sched.common.length === 0) {
      excluded.schedule++;
      continue;
    }

    const work = workoutCompat(sessionTypes, c.workoutTypes);
    const vibe = me.vibe === c.vibe ? 1 : 0.3;
    const comm = commCompat(me.commStyle, c.commStyle);
    const cIntensity = intensityOf(c);
    const fit = fitnessCompat(me.fitnessBand, c.fitnessBand, myIntensity, cIntensity);
    const reliability = adjustedReliability(c.completionRate, c.completedSessions);
    const near = Math.exp(-d / 1.5);
    const spot = spotterNeed(me, c, sessionTypes);

    let s = 0.25 * sched.score + 0.2 * work.score + 0.15 * near + 0.1 * vibe + 0.1 * comm + 0.1 * fit + 0.1 * reliability;
    if (!spot.ok) s *= 0.7;

    const tier = reliabilityTier(c.completionRate, c.completedSessions);
    const reasons: string[] = [];
    reasons.push(`Rảnh trùng ${sched.common.length} khung giờ`);
    if (work.pair) reasons.push(work.pair[0] === work.pair[1] ? `Cùng ${WORKOUT_LABEL[work.pair[0]]}` : `${WORKOUT_LABEL[work.pair[1]]} hợp với ${WORKOUT_LABEL[work.pair[0]]}`);
    reasons.push(`Cách ${d.toFixed(1)} km`);
    if (me.vibe === c.vibe) reasons.push(me.vibe === "performance" ? "Cùng mode Hiệu suất" : "Cùng mode Đồng hành");
    if (comm >= 1) reasons.push(`Cùng kiểu: ${COMM_STYLE_LABEL[c.commStyle]}`);
    if (fit >= 0.85) reasons.push(`Cùng trình độ · cường độ ${INTENSITY_LABEL[cIntensity].toLowerCase()}`);
    if (tier === "reliable") reasons.push(`Hoàn thành ${Math.round(c.completionRate * 100)}% kèo`);
    if (spot.applies && spot.ok) reasons.push("Đỡ tạ được cho buổi nặng");
    if (location.needsVerification) {
      needsVerification++;
      reasons.push("Đang chờ xác minh vị trí");
    }

    matches.push({
      profile: c,
      score: Math.round(Math.min(1, s) * 100),
      distanceKm: d,
      commonSlots: sched.common,
      workoutPair: work.pair,
      spotter: spot,
      tier,
      reliability,
      location,
      reasons,
    });
  }

  matches.sort((a, b) => b.score - a.score || b.reliability - a.reliability);
  return { matches: matches.slice(0, opts.limit ?? 10), excluded, needsVerification };
}

/* ------------------------------------------------------------------ */
/* Thời tiết: chỉ ĐỀ XUẤT Spot có thật — không tự chuyển               */
/* ------------------------------------------------------------------ */
export interface HourlyWeather {
  /** giờ trong ngày 0..23 */
  hour: number;
  precipProb: number; // %
  code: number; // WMO weather code
}

export interface IndoorSpot {
  id: string;
  name: string;
  area: string;
  position: LatLng;
  image?: string;
}

export interface WeatherAdvice {
  risk: "none" | "rain" | "storm";
  /** Spot trong nhà có thật gần nhất (nếu có) — chỉ là đề xuất */
  proposal: (IndoorSpot & { distanceKm: number }) | null;
  /** chủ kèo và mọi thành viên phải xác nhận trước khi đổi địa điểm */
  requiresConfirmation: boolean;
  /** huỷ hoặc đổi lịch vì thời tiết không bị trừ UT */
  penaltyFreeChange: boolean;
  message: string;
}

const OUTDOOR = new Set(["running", "cycling", "football", "basketball"]);

export function weatherAdvice(
  sport: string,
  fromHour: number,
  toHour: number,
  hourly: ReadonlyArray<HourlyWeather>,
  opts: { from?: LatLng; indoorSpots?: ReadonlyArray<IndoorSpot>; maxSpotKm?: number } = {}
): WeatherAdvice {
  const none = { proposal: null, requiresConfirmation: false, penaltyFreeChange: false };
  if (!OUTDOOR.has(sport)) return { risk: "none", ...none, message: "Tập trong nhà — không ảnh hưởng thời tiết" };
  const window = hourly.filter((h) => h.hour >= Math.floor(fromHour) && h.hour <= Math.ceil(toHour));
  const storm = window.some((h) => h.code >= 95 || (h.precipProb >= 70 && h.code >= 80));
  const rain = window.some((h) => h.precipProb >= 50 || (h.code >= 61 && h.code <= 82));
  if (storm) {
    const from = opts.from;
    const proposal =
      from && opts.indoorSpots?.length
        ? opts.indoorSpots
            .map((s) => ({ ...s, distanceKm: distanceKm(from, s.position) }))
            .filter((s) => s.distanceKm <= (opts.maxSpotKm ?? 5))
            .sort((a, b) => a.distanceKm - b.distanceKm)[0] ?? null
        : null;
    return {
      risk: "storm",
      proposal,
      requiresConfirmation: !!proposal,
      penaltyFreeChange: true,
      message: proposal
        ? `Dự báo mưa dông trong giờ hẹn. Có thể đổi sang ${proposal.name} (cách ${proposal.distanceKm.toFixed(1)} km) — chủ kèo và bạn tập đều phải xác nhận. Nếu không phù hợp, huỷ hoặc đổi giờ không bị phạt.`
        : "Dự báo mưa dông trong giờ hẹn và không có phòng tập trong nhà gần đây. Bạn có thể huỷ hoặc đổi giờ không bị phạt.",
    };
  }
  if (rain) return { risk: "rain", ...none, message: "Có thể có mưa nhẹ — nhớ mang áo mưa mỏng." };
  return { risk: "none", ...none, message: "Thời tiết thuận lợi để tập ngoài trời." };
}
