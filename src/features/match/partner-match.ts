/**
 * THUẬT TOÁN GHÉP PARTNER TẬP LUYỆN (v2)
 *
 * Lọc cứng (không đạt → loại khỏi hàng đợi, có ghi lý do):
 *  1. GPS ≤ bán kính (mặc định 3 km)
 *  2. Có giao thoa thời gian rảnh
 *  3. An toàn giới tính: một trong hai bật "chỉ ghép cùng giới" → bắt buộc cùng giới
 *  4. Chống GPS giả: vị trí nhảy > 2 km trong ≤ 2 phút → không đưa vào hàng đợi
 *  5. Hàng đợi theo độ tin cậy: người hay bùng kèo (hoàn thành < 60%) chỉ được ghép với nhau;
 *     người đáng tin không bị ghép với người hay bùng kèo
 *
 * Chấm điểm (0..1):
 *   0.25 giao thoa thời gian + 0.20 loại hình workout + 0.15 khoảng cách
 * + 0.10 DISC + 0.10 VIBE + 0.10 thông số (Strava pace / Hevy khối lượng) + 0.10 tỷ lệ hoàn thành
 *   × hệ số tương quan thể hình (buổi tạ nặng cần người đỡ tạ)
 *   + thưởng 0.06 khi cả hai đều đáng tin cậy (ưu tiên ghép người hoàn thành cao với nhau)
 */

export type LatLng = [number, number];
export type Gender = "male" | "female" | "other";
export type Disc = "D" | "I" | "S" | "C";
export type Vibe = "performance" | "friendly";
export type WorkoutType =
  | "long_run"
  | "recovery"
  | "short_run"
  | "interval"
  | "tempo"
  | "push"
  | "pull"
  | "legs"
  | "upper"
  | "lower"
  | "full_body"
  | "calisthenics";

/** Khung giờ trong ngày; slot key = `${thứ 0..6}-${khung}` (0 = Thứ Hai) */
export const DAY_PARTS = ["dawn", "morning", "noon", "afternoon", "evening", "night"] as const;
export type DayPart = (typeof DAY_PARTS)[number];
export const slotKey = (day: number, part: DayPart) => `${day}-${part}`;

export interface LocationPing {
  lat: number;
  lng: number;
  /** epoch giây */
  t: number;
}

export interface PartnerProfile {
  id: string;
  name: string;
  gender: Gender;
  sports: string[];
  workoutTypes: WorkoutType[];
  availability: string[];
  position: LatLng;
  disc: Disc;
  vibe: Vibe;
  sameGenderOnly: boolean;
  heightCm: number;
  weightKg: number;
  needsSpotter?: boolean;
  completionRate: number;
  completedSessions: number;
  paceSecPerKm?: number;
  weeklyVolumeKg?: number;
  pings?: LocationPing[];
}

export const WORKOUT_LABEL: Record<WorkoutType, string> = {
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
  calisthenics: "Calisthenics",
};

export const DISC_LABEL: Record<Disc, string> = {
  D: "D – Quyết đoán",
  I: "I – Truyền cảm hứng",
  S: "S – Kiên định",
  C: "C – Tỉ mỉ",
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

export const bmi = (heightCm: number, weightKg: number) => weightKg / (heightCm / 100) ** 2;

/** GPS giả: hai lần ghi vị trí liên tiếp cách nhau > maxKm trong ≤ windowSec giây */
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

export type ReliabilityTier = "reliable" | "normal" | "flaky";
export function reliabilityTier(rate: number, sessions: number): ReliabilityTier {
  if (sessions < 3) return "normal"; // người mới: chưa đủ dữ liệu
  if (rate >= 0.85) return "reliable";
  if (rate < 0.6) return "flaky";
  return "normal";
}

/** Giao thoa thời gian: số khung trùng / số khung của người ít khung hơn */
export function scheduleOverlap(a: ReadonlyArray<string>, b: ReadonlyArray<string>) {
  const setB = new Set(b);
  const common = a.filter((s) => setB.has(s));
  return { common, score: common.length / Math.max(1, Math.min(a.length, b.length)) };
}

const WORKOUT_NEAR: Partial<Record<WorkoutType, Partial<Record<WorkoutType, number>>>> = {
  long_run: { recovery: 0.7, tempo: 0.4 },
  recovery: { long_run: 0.7, short_run: 0.6 },
  short_run: { recovery: 0.6, tempo: 0.6, interval: 0.4 },
  interval: { tempo: 0.7, short_run: 0.4 },
  tempo: { interval: 0.7, short_run: 0.6, long_run: 0.4 },
  push: { upper: 0.85, full_body: 0.5, calisthenics: 0.5 },
  pull: { upper: 0.85, full_body: 0.5, calisthenics: 0.6 },
  legs: { lower: 0.9, full_body: 0.5 },
  upper: { push: 0.85, pull: 0.85, full_body: 0.5 },
  lower: { legs: 0.9, full_body: 0.5 },
  full_body: { push: 0.5, pull: 0.5, legs: 0.5, upper: 0.5, lower: 0.5 },
  calisthenics: { pull: 0.6, push: 0.5 },
};

/** Loại hình workout: trùng hẳn = 1, gần nhau (vd. Upper ~ Push) = điểm trung gian */
export function workoutCompat(a: ReadonlyArray<WorkoutType>, b: ReadonlyArray<WorkoutType>) {
  let best = 0;
  let pair: [WorkoutType, WorkoutType] | null = null;
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

/**
 * DISC trong bối cảnh tập luyện (không phải teamwork công việc):
 * D+D hợp khi tập hiệu suất, dễ "đua" khi tập thân thiện; I+I hợp khi tập thân thiện...
 */
const DISC_BASE: Record<string, number> = {
  DD: 0.85, II: 0.9, SS: 0.9, CC: 0.85,
  DI: 0.65, DS: 0.75, DC: 0.8,
  IS: 0.85, IC: 0.55, SC: 0.8,
};
export function discCompat(a: Disc, b: Disc, vibe: Vibe) {
  const key = [a, b].sort((x, y) => "DISC".indexOf(x) - "DISC".indexOf(y)).join("");
  let v = DISC_BASE[key] ?? 0.6;
  if (vibe === "performance" && (key === "DD" || key === "DC" || key === "CC")) v += 0.1;
  if (vibe === "friendly" && (key === "II" || key === "IS" || key === "SS")) v += 0.1;
  if (vibe === "friendly" && key === "DD") v -= 0.15;
  return Math.max(0, Math.min(1, v));
}

const HEAVY: WorkoutType[] = ["push", "legs", "lower"];

/** Tương quan thể hình cho buổi tạ nặng cần người đỡ tạ: tỷ lệ cân nặng partner/bạn trong 0.85–1.3 là tốt */
export function spotterFit(me: PartnerProfile, other: PartnerProfile, sessionTypes: ReadonlyArray<WorkoutType>) {
  const applies = !!me.needsSpotter && sessionTypes.some((t) => HEAVY.includes(t));
  if (!applies) return { applies: false, fit: 1, ratio: other.weightKg / me.weightKg };
  const ratio = other.weightKg / me.weightKg;
  const fit = ratio >= 0.85 && ratio <= 1.3 ? 1 : Math.max(0, 1 - (ratio < 0.85 ? 0.85 - ratio : ratio - 1.3) * 2.5);
  return { applies: true, fit, ratio };
}

function statsSimilarity(me: PartnerProfile, o: PartnerProfile, sport: string) {
  if (sport === "running" && me.paceSecPerKm && o.paceSecPerKm) return Math.exp(-Math.abs(me.paceSecPerKm - o.paceSecPerKm) / 45);
  if (sport === "gym" && me.weeklyVolumeKg && o.weeklyVolumeKg)
    return Math.min(me.weeklyVolumeKg, o.weeklyVolumeKg) / Math.max(me.weeklyVolumeKg, o.weeklyVolumeKg);
  return 0.6; // thiếu dữ liệu thiết bị → trung tính
}

/* ------------------------------------------------------------------ */
/* Ghép                                                                 */
/* ------------------------------------------------------------------ */
export interface PartnerMatch {
  profile: PartnerProfile;
  score: number; // 0..100
  distanceKm: number;
  commonSlots: string[];
  workoutPair: [WorkoutType, WorkoutType] | null;
  spotter: { applies: boolean; fit: number; ratio: number };
  tier: ReliabilityTier;
  reasons: string[];
}

export interface MatchRun {
  matches: PartnerMatch[];
  excluded: { distance: number; schedule: number; gender: number; fakeGps: number; reliability: number; sport: number };
}

export function matchPartners(
  me: PartnerProfile,
  candidates: ReadonlyArray<PartnerProfile>,
  opts: { sport: string; radiusKm?: number; sessionTypes?: WorkoutType[]; limit?: number }
): MatchRun {
  const radius = opts.radiusKm ?? 3;
  const sessionTypes = opts.sessionTypes ?? me.workoutTypes;
  const myTier = reliabilityTier(me.completionRate, me.completedSessions);
  const excluded = { distance: 0, schedule: 0, gender: 0, fakeGps: 0, reliability: 0, sport: 0 };
  const matches: PartnerMatch[] = [];

  for (const c of candidates) {
    if (c.id === me.id) continue;
    if (!c.sports.includes(opts.sport)) {
      excluded.sport++;
      continue;
    }
    if (detectFakeGps(c.pings).suspicious) {
      excluded.fakeGps++;
      continue;
    }
    if ((me.sameGenderOnly || c.sameGenderOnly) && me.gender !== c.gender) {
      excluded.gender++;
      continue;
    }
    const tier = reliabilityTier(c.completionRate, c.completedSessions);
    if ((myTier === "flaky") !== (tier === "flaky")) {
      excluded.reliability++;
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
    const disc = discCompat(me.disc, c.disc, me.vibe);
    const vibe = me.vibe === c.vibe ? 1 : 0.3;
    const stats = statsSimilarity(me, c, opts.sport);
    const near = Math.exp(-d / 1.5);
    const spot = spotterFit(me, c, sessionTypes);

    let s = 0.25 * sched.score + 0.2 * work.score + 0.15 * near + 0.1 * disc + 0.1 * vibe + 0.1 * stats + 0.1 * c.completionRate;
    if (spot.applies) s *= 0.6 + 0.4 * spot.fit;
    if (myTier === "reliable" && tier === "reliable") s += 0.06;

    const reasons: string[] = [];
    reasons.push(`Rảnh trùng ${sched.common.length} khung giờ`);
    if (work.pair) reasons.push(work.pair[0] === work.pair[1] ? `Cùng ${WORKOUT_LABEL[work.pair[0]]}` : `${WORKOUT_LABEL[work.pair[1]]} hợp với ${WORKOUT_LABEL[work.pair[0]]}`);
    reasons.push(`Cách ${d.toFixed(1)} km`);
    if (me.vibe === c.vibe) reasons.push(me.vibe === "performance" ? "Cùng mode Hiệu suất" : "Cùng mode Đồng hành");
    if (disc >= 0.85) reasons.push(`DISC hợp: ${c.disc}`);
    if (tier === "reliable") reasons.push(`Hoàn thành ${Math.round(c.completionRate * 100)}% kèo`);
    if (spot.applies && spot.fit >= 0.9) reasons.push("Thể hình phù hợp để đỡ tạ");

    matches.push({
      profile: c,
      score: Math.round(Math.min(1, s) * 100),
      distanceKm: d,
      commonSlots: sched.common,
      workoutPair: work.pair,
      spotter: spot,
      tier,
      reasons,
    });
  }

  matches.sort((a, b) => b.score - a.score || b.profile.completionRate - a.profile.completionRate);
  return { matches: matches.slice(0, opts.limit ?? 10), excluded };
}

/* ------------------------------------------------------------------ */
/* Thời tiết                                                            */
/* ------------------------------------------------------------------ */
export interface HourlyWeather {
  /** giờ trong ngày 0..23 */
  hour: number;
  precipProb: number; // %
  code: number; // WMO weather code
}

export interface WeatherAdvice {
  risk: "none" | "rain" | "storm";
  suggestIndoor: boolean;
  waiver: boolean;
  message: string;
}

const OUTDOOR = new Set(["running", "cycling", "football", "basketball"]);

/**
 * Mưa dông trong khung giờ hẹn tập ngoài trời → đề xuất chuyển sang phòng gym gần nhất
 * và kích hoạt thẻ miễn trừ huỷ lịch (không trừ cọc).
 */
export function weatherAdvice(sport: string, fromHour: number, toHour: number, hourly: ReadonlyArray<HourlyWeather>): WeatherAdvice {
  if (!OUTDOOR.has(sport)) return { risk: "none", suggestIndoor: false, waiver: false, message: "Tập trong nhà — không ảnh hưởng thời tiết" };
  const window = hourly.filter((h) => h.hour >= Math.floor(fromHour) && h.hour <= Math.ceil(toHour));
  const storm = window.some((h) => h.code >= 95 || (h.precipProb >= 70 && h.code >= 80));
  const rain = window.some((h) => h.precipProb >= 50 || (h.code >= 61 && h.code <= 82));
  if (storm)
    return {
      risk: "storm",
      suggestIndoor: true,
      waiver: true,
      message: "Cảnh báo mưa dông trong giờ hẹn — đề xuất chuyển sang phòng gym gần nhất. Thẻ miễn trừ huỷ lịch (không trừ cọc) đã được kích hoạt.",
    };
  if (rain) return { risk: "rain", suggestIndoor: false, waiver: false, message: "Có thể có mưa nhẹ — nhớ mang áo mưa mỏng." };
  return { risk: "none", suggestIndoor: false, waiver: false, message: "Thời tiết thuận lợi để tập ngoài trời." };
}
