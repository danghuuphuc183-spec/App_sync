/**
 * THUẬT TOÁN LÊN KÈO & CÁ NHÂN HOÁ
 *
 * 1) Ghép CÁ NHÂN (findPersonalMatches) — theo workflow: địa điểm · time · cá nhân hoá · điểm uy tín
 *    - Lọc cứng: cùng môn, uy tín >= mức tối thiểu bạn đặt, trong bán kính (nới dần 5 → 10 km nếu thiếu).
 *    - Chấm điểm bằng matcher đa yếu tố có sẵn (môn 28%, pace 24%, giờ 20%, khoảng cách 14%, sở thích 8%, uy tín 6%).
 *    - Trả về TỐI ĐA 3 người tương thích nhất → người dùng bấm "Chấp nhận".
 *
 * 2) Ghép NHÓM (findGroups) — tìm nhóm đang THIẾU NGƯỜI, có thể ở địa điểm khác
 *    - Lọc cứng: cùng môn, còn chỗ đủ cho số người bạn mang theo, khung giờ giao nhau,
 *      hai chiều uy tín (bạn đạt yêu cầu của nhóm, chủ nhóm đạt yêu cầu của bạn), trong 10 km.
 *    - score = 0.40·gần + 0.30·trùng giờ + 0.20·mức thiếu người (nhóm sắp đủ ưu tiên) + 0.10·uy tín chủ nhóm
 *
 * 3) Xếp hạng XEM KÈO (rankKeos) — "kèo gần mình nhất & cùng đam mê"
 *    - score = 0.35·gần (e^-d/3km) + 0.30·cùng sở thích + 0.15·khung giờ quen + 0.10·bạn bè + 0.10·uy tín chủ kèo
 *    - Loại kèo đã đủ người; kèo yêu cầu uy tín cao hơn bạn bị đánh dấu "Chưa đủ uy tín".
 *    - Mỗi kèo kèm lý do gợi ý từ các tín hiệu đóng góp nhiều nhất.
 */
import { calculateCandidateMatch, type MatchScoreBreakdown } from "@/features/match/matcher";
import type { MatchCandidate } from "@/features/match/candidates.data";
import type { GroupForm, Keo, LatLng, PersonalForm, TimeSlot, TimeWindow, Viewer } from "./keo.types";
import { sameDay } from "./keo-date";

const EARTH_R = 6_371_000;
const toRad = (d: number) => (d * Math.PI) / 180;

export function distanceKm(a: LatLng, b: LatLng): number {
  const dLat = toRad(b[0] - a[0]);
  const dLng = toRad(b[1] - a[1]);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a[0])) * Math.cos(toRad(b[0])) * Math.sin(dLng / 2) ** 2;
  return (2 * EARTH_R * Math.asin(Math.min(1, Math.sqrt(h)))) / 1000;
}

export const toMinutes = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
};

export function timeSlotOf(hhmm: string): TimeSlot {
  const m = toMinutes(hhmm);
  if (m < 9 * 60) return "morning_early";
  if (m < 15 * 60) return "noon";
  if (m < 19 * 60) return "evening";
  return "night";
}

/** Tỉ lệ giao nhau của hai khung giờ (0..1), chỉ khi cùng ngày. */
export function timeOverlap(a: TimeWindow, b: TimeWindow): number {
  if (!sameDay(a.day, b.day)) return 0;
  const start = Math.max(toMinutes(a.from), toMinutes(b.from));
  const end = Math.min(toMinutes(a.to), toMinutes(b.to));
  if (end <= start) return 0;
  const shorter = Math.min(toMinutes(a.to) - toMinutes(a.from), toMinutes(b.to) - toMinutes(b.from)) || 1;
  return Math.min(1, (end - start) / shorter);
}

export function isPersonalFormValid(f: PersonalForm): boolean {
  return !!f.sport && !!f.place && toMinutes(f.time.to) > toMinutes(f.time.from);
}

export function isGroupFormValid(f: GroupForm): boolean {
  return isPersonalFormValid(f) && f.capacity >= 2 && f.present >= 1 && f.present < f.capacity;
}

/* ------------------------------------------------------------------ */
/* 1) Ghép cá nhân                                                      */
/* ------------------------------------------------------------------ */
export interface PersonalMatch {
  candidate: MatchCandidate;
  breakdown: MatchScoreBreakdown;
}

export function findPersonalMatches(
  form: PersonalForm,
  candidates: ReadonlyArray<MatchCandidate>,
  opts: { limit?: number; myPaceSec?: number; excludeIds?: string[] } = {}
): PersonalMatch[] {
  const limit = opts.limit ?? 3;
  const exclude = new Set(opts.excludeIds ?? []);
  const pool = candidates.filter((c) => c.sport === form.sport && c.trustScore >= form.minTrust && !exclude.has(c.id));

  const prefs = {
    sport: form.sport as MatchCandidate["sport"],
    targetPaceSec: opts.myPaceSec,
    preferredTimeSlot: timeSlotOf(form.time.from),
    maxDistanceKm: 10,
    minTrustScore: form.minTrust,
  };

  for (const radius of [5, 10]) {
    const inRange = pool.filter((c) => c.distanceKm <= radius);
    if (inRange.length >= limit || radius === 10) {
      return inRange
        .map((candidate) => ({ candidate, breakdown: calculateCandidateMatch(prefs, candidate) }))
        .sort((a, b) => b.breakdown.totalScore - a.breakdown.totalScore || b.candidate.trustScore - a.candidate.trustScore)
        .slice(0, limit);
    }
  }
  return [];
}

/* ------------------------------------------------------------------ */
/* 2) Ghép nhóm                                                         */
/* ------------------------------------------------------------------ */
export interface GroupMatch {
  keo: Keo;
  distanceKm: number;
  missing: number;
  overlap: number;
  score: number;
  sameLocation: boolean;
}

export function findGroups(
  form: GroupForm,
  keos: ReadonlyArray<Keo>,
  ctx: { myTrust: number; hostTrust: (hostId: string) => number; maxKm?: number }
): GroupMatch[] {
  if (!form.place) return [];
  const maxKm = ctx.maxKm ?? 10;
  const bringing = form.present; // bạn + những người bạn đã có
  return keos
    .filter((k) => k.kind === "group" && !k.mine && k.sport === form.sport)
    .map((k) => {
      const missing = k.capacity - k.memberIds.length;
      const d = distanceKm(form.place!.position, k.place.position);
      const overlap = timeOverlap(form.time, k.time);
      return { keo: k, missing, d, overlap };
    })
    .filter(
      ({ keo, missing, d, overlap }) =>
        missing >= bringing &&
        overlap > 0 &&
        d <= maxKm &&
        ctx.myTrust >= keo.minTrust &&
        ctx.hostTrust(keo.hostId) >= form.minTrust
    )
    .map(({ keo, missing, d, overlap }) => {
      const near = Math.exp(-d / 3);
      const fill = 1 - (missing - bringing) / Math.max(1, keo.capacity); // nhóm càng sắp đủ càng ưu tiên
      const trust = Math.min(1, ctx.hostTrust(keo.hostId) / 10);
      const score = 0.4 * near + 0.3 * overlap + 0.2 * fill + 0.1 * trust;
      return { keo, distanceKm: d, missing, overlap, score, sameLocation: keo.place.id === form.place!.id };
    })
    .sort((a, b) => b.score - a.score || a.distanceKm - b.distanceKm);
}

/* ------------------------------------------------------------------ */
/* 3) Xếp hạng "Xem kèo"                                                */
/* ------------------------------------------------------------------ */
const SPORT_AFFINITY: Record<string, string[]> = {
  running: ["cycling", "swimming"],
  cycling: ["running"],
  gym: ["yoga", "running"],
  pickleball: ["badminton", "table_tennis"],
  badminton: ["pickleball", "table_tennis"],
  table_tennis: ["pickleball", "badminton"],
  football: ["basketball"],
  basketball: ["football"],
};

export interface RankedKeo {
  keo: Keo;
  distanceKm: number;
  score: number;
  reasons: string[];
  eligible: boolean;
  spotsLeft: number;
}

export function interestScore(viewer: Viewer, sport: string): number {
  const idx = viewer.sports.indexOf(sport);
  if (idx === 0) return 1;
  if (idx > 0) return 0.8;
  if (viewer.sports.some((s) => SPORT_AFFINITY[s]?.includes(sport))) return 0.45;
  return 0.1;
}

export function rankKeos(
  keos: ReadonlyArray<Keo>,
  viewer: Viewer,
  ctx: { hostTrust: (hostId: string) => number; sportLabel: (s: string) => string }
): RankedKeo[] {
  return keos
    .map((keo) => {
      const spotsLeft = keo.capacity - keo.memberIds.length;
      const d = distanceKm(viewer.position, keo.place.position);
      const signals = {
        near: Math.exp(-d / 3),
        interest: interestScore(viewer, keo.sport),
        time: viewer.usualSlots.includes(timeSlotOf(keo.time.from)) ? 1 : 0.3,
        social: viewer.friendIds.includes(keo.hostId) ? 1 : 0,
        trust: Math.min(1, ctx.hostTrust(keo.hostId) / 10),
      };
      const score =
        0.35 * signals.near + 0.3 * signals.interest + 0.15 * signals.time + 0.1 * signals.social + 0.1 * signals.trust;

      const reasons: string[] = [];
      if (d <= 2) reasons.push(`Gần bạn ${d.toFixed(1)} km`);
      if (signals.interest >= 0.8) reasons.push(`Cùng mê ${ctx.sportLabel(keo.sport).toLowerCase()}`);
      if (signals.social) reasons.push("Bạn bè của bạn");
      if (signals.time === 1) reasons.push("Khung giờ bạn hay tập");
      if (reasons.length === 0) reasons.push(`Cách ${d.toFixed(1)} km`);

      return { keo, distanceKm: d, score, reasons, eligible: viewer.trustScore >= keo.minTrust, spotsLeft };
    })
    // người bị host từ chối không còn thấy kèo đó (D35)
    .filter((r) => !(r.keo.declinedIds ?? []).includes(viewer.id))
    .filter((r) => r.spotsLeft > 0 || r.keo.mine || r.keo.memberIds.includes(viewer.id))
    .sort((a, b) => b.score - a.score || a.distanceKm - b.distanceKm);
}
