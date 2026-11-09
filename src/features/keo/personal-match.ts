/**
 * Ghép bạn tập cho KÈO CÁ NHÂN bằng thuật toán v2 (partner-match):
 * giờ hẹn cụ thể → slot; vị trí = điểm tập đã chọn; bán kính theo hồ sơ (mặc định 3 km,
 * tự nới tới 5 km nếu không có ai và báo rõ cho người dùng).
 */
import { calculateCandidateMatch, type MatchScoreBreakdown } from "@/features/match/matcher";
import type { MatchCandidate } from "@/features/match/candidates.data";
import { matchPartners, type MatchRun, type PartnerMatch, type PartnerProfile, type WorkoutType } from "@/features/match/partner-match";
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
  radiusKm: number;
  widened: boolean;
}

export function findPersonalMatchesV2(
  form: PersonalForm,
  candidates: ReadonlyArray<MatchCandidate>,
  me: PartnerProfile,
  opts: { now?: Date; radiusKm?: number; limit?: number; excludeIds?: string[] } = {}
): PersonalRun {
  const empty = { distance: 0, schedule: 0, gender: 0, fakeGps: 0, reliability: 0, sport: 0 };
  if (!form.place) return { matches: [], excluded: empty, radiusKm: opts.radiusKm ?? 3, widened: false };
  const now = opts.now ?? new Date();
  const weekday = (resolveDay(form.time.day, now).getDay() + 6) % 7;
  const slots = windowToSlots(weekday, toMinutes(form.time.from), toMinutes(form.time.to));
  const sportTypes = (WORKOUTS_BY_SPORT[form.sport] ?? []).map((w) => w.id);
  const mine = me.workoutTypes.filter((w) => sportTypes.includes(w));
  const sessionTypes: WorkoutType[] = mine.length ? mine : sportTypes;

  const exclude = new Set(opts.excludeIds ?? []);
  const eligible = candidates.filter((c) => c.sport === form.sport && c.trustScore >= form.minTrust && !exclude.has(c.id));
  const center = form.place.position;
  const pool = eligible.map((c) => candidateToPartner(c, center));
  const meHere: PartnerProfile = { ...me, position: center, availability: slots, sports: [...new Set([...me.sports, form.sport])] };

  const base = opts.radiusKm ?? 3;
  let radius = base;
  let run = matchPartners(meHere, pool, { sport: form.sport, radiusKm: radius, sessionTypes, limit: opts.limit ?? 3 });
  if (run.matches.length === 0 && base < 5) {
    radius = 5;
    run = matchPartners(meHere, pool, { sport: form.sport, radiusKm: radius, sessionTypes, limit: opts.limit ?? 3 });
  }

  const prefs = { sport: form.sport as MatchCandidate["sport"], targetPaceSec: me.paceSecPerKm, preferredTimeSlot: timeSlotOf(form.time.from), maxDistanceKm: radius };
  const matches = run.matches.map((m) => {
    const candidate = eligible.find((c) => c.id === m.profile.id)!;
    return { candidate, partner: m, breakdown: { ...calculateCandidateMatch(prefs, candidate), totalScore: m.score, matchReasonVi: m.reasons } };
  });
  return { matches, excluded: run.excluded, radiusKm: radius, widened: radius !== base };
}
