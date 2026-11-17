/**
 * Ghép bạn tập cho KÈO CÁ NHÂN bằng thuật toán v3 (partner-match) — tìm Workout Slot:
 * giờ hẹn cụ thể → slot; vị trí = điểm tập đã chọn; bán kính theo hồ sơ (mặc định 3 km,
 * tự nới tới 5 km nếu không có ai và báo rõ cho người dùng).
 */
import { calculateCandidateMatch, type MatchScoreBreakdown } from "@/features/match/matcher";
import type { MatchCandidate } from "@/features/match/candidates.data";
import { emptyExcluded, matchPartners, type MatchRun, type PartnerMatch, type PartnerProfile, type SessionType } from "@/features/match/partner-match";
import { candidateToPartner, windowToSlots } from "@/features/match/partner-pool";
import { WORKOUTS_BY_SPORT } from "@/features/onboarding/onboarding";
import { resolveDay } from "./session-plan";
import { timeSlotOf, toMinutes } from "./keo.algo";
import type { PersonalForm } from "./keo.types";

export interface PersonalMatchV2 {
  candidate: MatchCandidate;
  breakdown: MatchScoreBreakdown;
  partner: PartnerMatch;
}

export interface PersonalRun {
  matches: PersonalMatchV2[];
  excluded: MatchRun["excluded"];
  needsVerification: number;
  radiusKm: number;
  widened: boolean;
}

export function findPersonalMatchesV2(
  form: PersonalForm,
  candidates: ReadonlyArray<MatchCandidate>,
  me: PartnerProfile,
  opts: { now?: Date; radiusKm?: number; limit?: number; excludeIds?: string[]; myTrustScore?: number } = {}
): PersonalRun {
  if (!form.place) return { matches: [], excluded: emptyExcluded(), needsVerification: 0, radiusKm: opts.radiusKm ?? 3, widened: false };
  const now = opts.now ?? new Date();
  const weekday = (resolveDay(form.time.day, now).getDay() + 6) % 7;
  const slots = windowToSlots(weekday, toMinutes(form.time.from), toMinutes(form.time.to));
  const sportTypes = (WORKOUTS_BY_SPORT[form.sport] ?? []).map((w) => w.id);
  const mine = me.workoutTypes.filter((w) => sportTypes.includes(w));
  const sessionTypes: SessionType[] = mine.length ? mine : sportTypes;

  const exclude = new Set(opts.excludeIds ?? []);
  const myTrust = opts.myTrustScore ?? 8.5;

  // Lọc ghép theo thuật toán uy tín:
  // 1. Chỉ ghép người có điểm uy tín chênh lệch nhau trong khoảng -+1 điểm uy tín (|c.trustScore - myTrust| <= 1.0)
  // 2. Không ghép người uy tín cao (>= 8.0) với người uy tín thấp (< 7.5)
  const eligible = candidates.filter((c) => {
    if (c.sport !== form.sport) return false;
    if (form.minTrust && c.trustScore < form.minTrust) return false;
    if (exclude.has(c.id)) return false;

    // Chênh lệch điểm uy tín tối đa -+1 điểm uy tín
    const trustDiff = Math.abs(c.trustScore - myTrust);
    if (trustDiff > 1.0) return false;

    // Không ghép người điểm uy tín cao với điểm uy tín thấp
    if (myTrust >= 8.0 && c.trustScore < 7.5) return false;
    if (c.trustScore >= 8.0 && myTrust < 7.5) return false;

    return true;
  });
  const center = form.place.position;
  const pool = eligible.map((c) => candidateToPartner(c, center));

  // Suy cường độ buổi tập từ chi tiết form (nếu có)
  let workoutIntensity = me.intensity;
  if (form.details?.run_type) {
    const rt = form.details.run_type;
    if (rt.includes("Interval") || rt.includes("Tempo")) workoutIntensity = "hard";
    else if (rt.includes("nhẹ") || rt.includes("Recovery")) workoutIntensity = "easy";
    else if (rt.includes("dài") || rt.includes("Long")) workoutIntensity = "moderate";
  }

  // Master Spec Mục 2.3: VIBE Slot Preference có ưu tiên cao hơn User Preference
  const meHere: PartnerProfile = {
    ...me,
    position: center,
    availability: slots,
    sports: [...new Set([...me.sports, form.sport])],
    vibe: form.vibe ?? me.vibe ?? "flexible",
    vibePreferences: form.vibePreferences,
    mustHaveVibe: form.mustHaveVibe ?? false,
    sameGenderOnly: form.sameGenderOnly ?? me.sameGenderOnly,
    intensity: workoutIntensity,
  };

  const base = opts.radiusKm ?? 3;
  let radius = base;
  let run = matchPartners(meHere, pool, { sport: form.sport, radiusKm: radius, sessionTypes, intensity: workoutIntensity, limit: opts.limit ?? 3 });
  if (run.matches.length === 0 && base < 5) {
    radius = 5;
    run = matchPartners(meHere, pool, { sport: form.sport, radiusKm: radius, sessionTypes, intensity: workoutIntensity, limit: opts.limit ?? 3 });
  }

  const prefs = {
    sport: form.sport as MatchCandidate["sport"],
    preferredTimeSlot: timeSlotOf(form.time.from),
    maxDistanceKm: radius,
    vibe: form.vibe,
    vibePreferences: form.vibePreferences,
  };
  const matches = run.matches.map((m) => {
    const candidate = eligible.find((c) => c.id === m.profile.id)!;
    return { candidate, partner: m, breakdown: { ...calculateCandidateMatch(prefs, candidate), totalScore: m.score, matchReasonVi: m.reasons } };
  });
  return { matches, excluded: run.excluded, needsVerification: run.needsVerification, radiusKm: radius, widened: radius !== base };
}
