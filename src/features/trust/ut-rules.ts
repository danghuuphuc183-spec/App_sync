/**
 * LUẬT HUỶ KÈO, PHẠT & GÓI BÙ — thang Uy tín (UT) 0–10.
 * Hàm thuần, không phụ thuộc UI → dễ test & dùng lại cho backend.
 *
 * Giai đoạn kèo:
 *  G0 "open"    — chưa ai nhận: host huỷ/sửa tuỳ ý, không phạt.
 *  G1 "pending" — có người nhận nhưng CHƯA chốt: host từ chối / người nhận rút, không phạt.
 *  G2 "locked"  — đã chốt: áp bảng phạt cho MỌI bên, host không có ngoại lệ.
 */
import { UT_CONFIG, clampUt, formatUt, getUtBand } from "./config";

const MIN = 60_000;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;
const t = (iso: string | Date) => (typeof iso === "string" ? Date.parse(iso) : iso.getTime());

/* ------------------------------------------------------------------ */
/* Giai đoạn                                                           */
/* ------------------------------------------------------------------ */

export type KeoStage = "open" | "pending" | "locked";

export function keoStage(k: { lockedAt?: string; acceptedBy?: string[] }): KeoStage {
  if (k.lockedAt) return "locked";
  return k.acceptedBy && k.acceptedBy.length > 0 ? "pending" : "open";
}

/* ------------------------------------------------------------------ */
/* Sự kiện UT & cách tính điểm                                         */
/* ------------------------------------------------------------------ */

export type PenaltyKind =
  | "cancel_early"
  | "cancel_late"
  | "unconfirmed"
  | "late_15_25"
  | "absent_declared"
  | "absent_silent"
  | "mutual_over_quota";

export type UtEventKind = PenaltyKind | "on_time" | "admin_adjust";

export const PENALTY_DELTA: Record<PenaltyKind, number> = {
  cancel_early: UT_CONFIG.PENALTY.CANCEL_EARLY,
  cancel_late: UT_CONFIG.PENALTY.CANCEL_LATE,
  unconfirmed: UT_CONFIG.PENALTY.UNCONFIRMED,
  late_15_25: UT_CONFIG.PENALTY.LATE_15_25,
  absent_declared: UT_CONFIG.PENALTY.ABSENT_DECLARED,
  absent_silent: UT_CONFIG.PENALTY.ABSENT_SILENT,
  mutual_over_quota: UT_CONFIG.PENALTY.MUTUAL_OVER_QUOTA,
};

export const UT_EVENT_LABEL: Record<UtEventKind, string> = {
  on_time: "Đúng hẹn",
  cancel_early: "Huỷ sớm (trước 30 phút)",
  cancel_late: "Huỷ muộn (trong 30 phút)",
  unconfirmed: "Không xác nhận lần cuối, kèo tự huỷ",
  late_15_25: "Đến trễ 15–25 phút",
  absent_declared: "Vắng có báo",
  absent_silent: "Vắng im lặng",
  mutual_over_quota: "Cùng huỷ, đã hết 4 lần/tháng",
  admin_adjust: "Quản trị điều chỉnh",
};

export interface UtEvent {
  id: string;
  kind: UtEventKind;
  at: string;
  keoId?: string;
  /** chỉ dùng cho admin_adjust */
  delta?: number;
  /** grace: thẻ ân hạn xoá phạt; apology: xin lỗi được chấp nhận, giảm 0,5 */
  waiver?: "grace" | "apology";
}

const sameDay = (a: number, b: number) => new Date(a).toDateString() === new Date(b).toDateString();
/** Thứ Hai 00:00 của tuần chứa thời điểm ts (giờ địa phương) */
function weekStart(ts: number) {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  return d.getTime();
}

export function penaltyAfterWaiver(kind: PenaltyKind, waiver?: UtEvent["waiver"]) {
  const base = PENALTY_DELTA[kind];
  if (!waiver || kind === "absent_silent") return base;
  if (waiver === "grace") return 0;
  return Math.min(0, base + UT_CONFIG.APOLOGY.REDUCE_BY);
}

export interface UtLedgerLine {
  event: UtEvent;
  delta: number;
  balance: number;
  note?: string;
}

/**
 * Điểm UT = 7 + tổng biến động của sự kiện trong 90 ngày gần nhất.
 * Hồi điểm: +0,5 mỗi buổi đúng hẹn, tối đa 1 lần/ngày và +1/tuần. Điểm kẹp trong [0, 10].
 */
export function computeUt(events: UtEvent[], now: Date | string = new Date()) {
  const nowT = t(now);
  const from = nowT - UT_CONFIG.WINDOW_DAYS * DAY;
  const sorted = events.filter((e) => t(e.at) >= from && t(e.at) <= nowT).sort((a, b) => t(a.at) - t(b.at));
  let balance: number = UT_CONFIG.INITIAL;
  const gainedByDay = new Map<string, number>();
  const gainedByWeek = new Map<number, number>();
  const ledger: UtLedgerLine[] = [];

  for (const e of sorted) {
    const at = t(e.at);
    let delta = 0;
    let note: string | undefined;
    if (e.kind === "on_time") {
      const dayKey = new Date(at).toDateString();
      const wk = weekStart(at);
      const dayLeft = UT_CONFIG.RECOVERY.MAX_PER_DAY - (gainedByDay.get(dayKey) ?? 0);
      const weekLeft = UT_CONFIG.RECOVERY.MAX_PER_WEEK - (gainedByWeek.get(wk) ?? 0);
      delta = Math.max(0, Math.min(UT_CONFIG.RECOVERY.ON_TIME, dayLeft, weekLeft));
      if (delta < UT_CONFIG.RECOVERY.ON_TIME) note = dayLeft <= 0 ? "Đã hồi điểm hôm nay" : "Đã đạt +1 UT tuần này";
      gainedByDay.set(dayKey, (gainedByDay.get(dayKey) ?? 0) + delta);
      gainedByWeek.set(wk, (gainedByWeek.get(wk) ?? 0) + delta);
    } else if (e.kind === "admin_adjust") {
      delta = e.delta ?? 0;
    } else {
      delta = penaltyAfterWaiver(e.kind, e.waiver);
      if (e.waiver === "grace" && e.kind !== "absent_silent") note = "Dùng thẻ ân hạn";
      if (e.waiver === "apology" && e.kind !== "absent_silent") note = "Lời xin lỗi được chấp nhận (giảm 0,5)";
    }
    const next = clampUt(balance + delta);
    ledger.push({ event: e, delta: next - balance, balance: next, note });
    balance = next;
  }
  return { score: balance, band: getUtBand(balance), ledger };
}

/* ------------------------------------------------------------------ */
/* Phạt cho từng người sau khi kèo kết thúc                            */
/* ------------------------------------------------------------------ */

export interface ParticipantOutcome {
  /** tự huỷ một phía */
  cancelledAt?: string;
  /** đã xác nhận lần cuối (trước T−30) */
  confirmed?: boolean;
  checkInAt?: string;
  /** báo vắng (sau giờ tập, trong 24h) */
  declaredAbsentAt?: string;
}

export interface KeoTiming {
  startsAt: string;
  lockedAt?: string;
  acceptedBy?: string[];
  /** bất khả kháng: mưa dông có cảnh báo, địa điểm đóng cửa, app lỗi */
  forceMajeure?: boolean;
  /** hai bên đã cùng đồng ý huỷ */
  mutualCancelAt?: string;
}

export type Verdict =
  | { kind: "none"; delta: 0; reasonVi: string }
  | { kind: "on_time"; delta: number; reasonVi: string }
  | { kind: PenaltyKind; delta: number; reasonVi: string };

const none = (reasonVi: string): Verdict => ({ kind: "none", delta: 0, reasonVi });
const pen = (kind: PenaltyKind, reasonVi: string): Verdict => ({ kind, delta: PENALTY_DELTA[kind], reasonVi });

export function minutesBefore(startsAt: string, at: string) {
  return (t(startsAt) - t(at)) / MIN;
}

/** Hạn xác nhận lần cuối: mở 2h sau khi chốt (hoặc ngay nếu sát giờ), đóng lúc T−30 */
export function confirmWindow(lockedAt: string, startsAt: string) {
  const deadline = t(startsAt) - UT_CONFIG.TIME.CONFIRM_DEADLINE_BEFORE_MIN * MIN;
  const opens = Math.min(t(lockedAt) + UT_CONFIG.TIME.CONFIRM_OPENS_AFTER_LOCK_MIN * MIN, deadline);
  return { opensAt: new Date(Math.max(t(lockedAt), opens)).toISOString(), deadline: new Date(deadline).toISOString() };
}

/** Phạt cho MỘT người — mỗi người tối đa 1 mức phạt / kèo */
export function verdictFor(keo: KeoTiming, o: ParticipantOutcome, opts: { mutualUsedThisMonth?: number } = {}): Verdict {
  if (keoStage(keo) !== "locked") return none("Kèo chưa chốt: huỷ / rút không bị trừ điểm");
  if (keo.forceMajeure) return none("Bất khả kháng: không trừ điểm");
  if (keo.mutualCancelAt) {
    return (opts.mutualUsedThisMonth ?? 0) < UT_CONFIG.MUTUAL_CANCEL_PER_MONTH
      ? none("Hai bên cùng đồng ý huỷ: không trừ điểm")
      : pen("mutual_over_quota", `Cùng đồng ý huỷ nhưng đã dùng hết ${UT_CONFIG.MUTUAL_CANCEL_PER_MONTH} lần tháng này`);
  }
  if (o.cancelledAt) {
    const before = minutesBefore(keo.startsAt, o.cancelledAt);
    if (before > UT_CONFIG.TIME.CANCEL_LATE_WINDOW_MIN) return pen("cancel_early", "Huỷ trước giờ tập hơn 30 phút");
    if (before > 0) return pen("cancel_late", "Huỷ trong vòng 30 phút trước giờ tập");
    return pen("absent_declared", "Huỷ sau giờ tập: tính là vắng có báo");
  }
  if (o.checkInAt) {
    const late = -minutesBefore(keo.startsAt, o.checkInAt);
    if (late <= UT_CONFIG.TIME.LATE_GRACE_MIN) return { kind: "on_time", delta: UT_CONFIG.RECOVERY.ON_TIME, reasonVi: "Đúng hẹn" };
    if (late <= UT_CONFIG.TIME.LATE_ABSENT_MIN) return pen("late_15_25", `Đến trễ ${Math.round(late)} phút`);
    return pen("absent_declared", `Đến trễ ${Math.round(late)} phút (quá 25 phút): tính là vắng`);
  }
  if (keo.lockedAt && o.confirmed === false) {
    return pen("unconfirmed", "Không xác nhận lần cuối trước 30 phút, kèo tự huỷ");
  }
  if (o.declaredAbsentAt && t(o.declaredAbsentAt) - t(keo.startsAt) <= UT_CONFIG.TIME.DECLARE_ABSENCE_HOURS * HOUR) {
    return pen("absent_declared", "Vắng, có báo trong 24 giờ");
  }
  return pen("absent_silent", "Vắng im lặng: không huỷ, không đến, không báo");
}

/**
 * Chốt sổ cả kèo. Luật M3: nếu KHÔNG AI check-in và KHÔNG AI huỷ/báo vắng,
 * tính như hai bên cùng đồng ý huỷ (trừ vào hạn mức 4 lần/tháng) — không còn đường "cùng im lặng" để né phạt.
 */
export function settleKeo(
  keo: KeoTiming,
  outcomes: Record<string, ParticipantOutcome>,
  mutualUsedThisMonth: Record<string, number> = {}
) {
  const entries = Object.entries(outcomes);
  const nobodyActed =
    entries.length > 1 &&
    entries.every(([, o]) => !o.checkInAt && !o.cancelledAt && !o.declaredAbsentAt && o.confirmed !== false);
  const effective: KeoTiming = nobodyActed ? { ...keo, mutualCancelAt: keo.startsAt } : keo;
  const verdicts: Record<string, Verdict> = {};
  const showedUp: string[] = [];
  const flaked: string[] = [];
  for (const [id, o] of entries) {
    const v = verdictFor(effective, o, { mutualUsedThisMonth: mutualUsedThisMonth[id] });
    verdicts[id] = v;
    if (v.kind === "on_time" || v.kind === "late_15_25") showedUp.push(id);
    else if (v.kind !== "none") flaked.push(id);
  }
  return { verdicts, showedUp, flaked, treatedAsMutual: nobodyActed };
}

/* ------------------------------------------------------------------ */
/* Nút Huỷ hiện rõ hậu quả                                             */
/* ------------------------------------------------------------------ */

export function cancelPreview(keo: KeoTiming, now: Date | string = new Date()) {
  const stage = keoStage(keo);
  if (stage !== "locked") {
    return { stage, nowDelta: 0, noShowDelta: 0, labelVi: "Huỷ bây giờ: không bị trừ điểm (kèo chưa chốt)" };
  }
  if (keo.forceMajeure) return { stage, nowDelta: 0, noShowDelta: 0, labelVi: "Bất khả kháng: huỷ không bị trừ điểm" };
  const nowIso = typeof now === "string" ? now : now.toISOString();
  const v = verdictFor(keo, { cancelledAt: nowIso });
  const nowDelta = v.delta;
  const noShowDelta = PENALTY_DELTA.absent_declared;
  return {
    stage,
    nowDelta,
    noShowDelta,
    labelVi: `Huỷ bây giờ: ${formatUt(nowDelta)} UT. Không đến: ${formatUt(noShowDelta)} UT`,
  };
}

/* ------------------------------------------------------------------ */
/* Thẻ ân hạn & lời xin lỗi                                            */
/* ------------------------------------------------------------------ */

export function canUseGrace(kind: PenaltyKind, usedThisMonth: number) {
  if (kind === "absent_silent") return { ok: false, reasonVi: "Thẻ ân hạn không dùng cho vắng im lặng" };
  if (usedThisMonth >= UT_CONFIG.GRACE_PASSES_PER_MONTH) return { ok: false, reasonVi: "Đã dùng thẻ ân hạn tháng này" };
  return { ok: true, reasonVi: "Xoá mức phạt của kèo này" };
}

export function canApologize(kind: PenaltyKind, usedThisMonth: number) {
  if (kind === "absent_silent") return { ok: false, reasonVi: "Vắng im lặng không được giảm phạt bằng lời xin lỗi" };
  if (usedThisMonth >= UT_CONFIG.APOLOGY.PER_MONTH) return { ok: false, reasonVi: "Đã dùng lời xin lỗi tháng này" };
  return { ok: true, reasonVi: `Nếu bạn tập chấp nhận, mức phạt giảm ${formatUt(UT_CONFIG.APOLOGY.REDUCE_BY)} UT` };
}

/* ------------------------------------------------------------------ */
/* Luật riêng cho host                                                 */
/* ------------------------------------------------------------------ */

export interface Member {
  id: string;
  ut: number;
}

/**
 * H2 — host rút khỏi kèo đã chốt: kèo KHÔNG bị huỷ. Quyền host chuyển cho thành viên UT cao nhất,
 * chỗ trống mở lại trên bảng kèo. Host cũ bị phạt như một thành viên huỷ.
 */
export function hostLeaves(
  keo: KeoTiming & { hostId: string; members: Member[] },
  at: string
): { newHostId: string | null; remaining: Member[]; reopen: boolean; hostVerdict: Verdict; soloChoice: boolean } {
  const remaining = keo.members.filter((m) => m.id !== keo.hostId);
  const next = [...remaining].sort((a, b) => b.ut - a.ut)[0] ?? null;
  return {
    newHostId: next?.id ?? null,
    remaining,
    reopen: remaining.length > 0,
    hostVerdict: verdictFor(keo, { cancelledAt: at }),
    /** chỉ còn 1 người: được chọn kèo thay thế hoặc tự tập có xác thực (nhận gói bù) */
    soloChoice: remaining.length === 1,
  };
}

export interface KeoEdit {
  shiftMin?: number;
  moveKm?: number;
  sportChanged?: boolean;
}

/** H1 — host sửa kèo đã chốt: dời > 10 phút, đổi chỗ > 1 km hoặc đổi môn là thay đổi lớn, cần người kia đồng ý */
export function classifyEdit(e: KeoEdit): "minor" | "major" {
  if (e.sportChanged) return "major";
  if (Math.abs(e.shiftMin ?? 0) > UT_CONFIG.TIME.MINOR_SHIFT_MAX_MIN) return "major";
  if ((e.moveKm ?? 0) > UT_CONFIG.HOST.MAJOR_MOVE_KM) return "major";
  return "minor";
}

/** Người kia từ chối đề xuất sửa lớn → họ rút KHÔNG bị phạt, host tính như huỷ tại thời điểm gửi đề xuất */
export function rejectEditProposal(keo: KeoTiming, proposedAt: string) {
  return { partnerVerdict: none("Từ chối thay đổi lớn của host: rút không bị trừ điểm"), hostVerdict: verdictFor(keo, { cancelledAt: proposedAt }) };
}

export interface KeoSignature {
  sport: string;
  startsAt: string;
  lat: number;
  lng: number;
  createdAt?: string;
  cancelledAt?: string;
}

const km = (a: { lat: number; lng: number }, b: { lat: number; lng: number }) => {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
};

/** H3 — huỷ kèo đã chốt rồi tạo lại kèo gần giống trong 2h → tính huỷ muộn + gắn cờ kèo mới */
export function isRecreateKick(cancelled: KeoSignature, created: KeoSignature) {
  if (!cancelled.cancelledAt || !created.createdAt) return false;
  const gap = (t(created.createdAt) - t(cancelled.cancelledAt)) / MIN;
  if (gap < 0 || gap > UT_CONFIG.HOST.RECREATE_WINDOW_MIN) return false;
  if (cancelled.sport !== created.sport) return false;
  if (Math.abs(t(created.startsAt) - t(cancelled.startsAt)) / MIN > UT_CONFIG.HOST.RECREATE_TIME_DIFF_MIN) return false;
  return km(cancelled, created) <= UT_CONFIG.HOST.RECREATE_DISTANCE_KM;
}

/** H4 — host vắng kèo nhóm 2 lần / 30 ngày → mất quyền tạo kèo nhóm 7 ngày */
export function groupHostBanUntil(hostGroupAbsences: string[], now: Date | string = new Date()) {
  const nowT = t(now);
  const recent = hostGroupAbsences
    .map(t)
    .filter((x) => x <= nowT && nowT - x <= UT_CONFIG.HOST.GROUP_ABSENT_LOOKBACK_DAYS * DAY)
    .sort((a, b) => a - b);
  if (recent.length < UT_CONFIG.HOST.GROUP_ABSENT_LIMIT) return null;
  const until = (recent[recent.length - 1] ?? 0) + UT_CONFIG.HOST.GROUP_BAN_DAYS * DAY;
  return until > nowT ? new Date(until).toISOString() : null;
}

/* ------------------------------------------------------------------ */
/* Hạn mức tạo kèo & xếp nhóm                                          */
/* ------------------------------------------------------------------ */

/** Đếm kèo đã TẠO trong ngày lịch của `now` (00:00 → 00:00 hôm sau), kể cả kèo đã huỷ */
export function keosCreatedToday(createdAt: string[], now: Date | string = new Date()) {
  const nowT = t(now);
  return createdAt.filter((c) => sameDay(t(c), nowT)).length;
}

export function canCreateKeo(input: {
  ut: number;
  createdToday: number;
  kind: "personal" | "group";
  groupBanUntil?: string | null;
  now?: Date | string;
}) {
  const band = getUtBand(input.ut);
  const limit = UT_CONFIG.BANDS[band].dailyKeoLimit;
  const remaining = Math.max(0, limit - input.createdToday);
  if (limit === 0) return { ok: false, limit, remaining, reasonVi: "Uy tín thấp (dưới 5 UT): chỉ được tham gia kèo nhóm" };
  if (input.kind === "group" && input.groupBanUntil && t(input.groupBanUntil) > t(input.now ?? new Date())) {
    return { ok: false, limit, remaining, reasonVi: "Tạm khoá tạo kèo nhóm 7 ngày do vắng 2 kèo nhóm mình làm host" };
  }
  if (remaining === 0) return { ok: false, limit, remaining, reasonVi: `Đã tạo đủ ${limit} kèo hôm nay. Hạn mức làm mới lúc 00:00` };
  return { ok: true, limit, remaining, reasonVi: `Còn ${remaining}/${limit} kèo được tạo hôm nay` };
}

export interface GroupPerson {
  ut: number;
  onTimeSessions: number;
}

export const isNewbie = (p: GroupPerson) => p.onTimeSessions < UT_CONFIG.NEWBIE_MAX_SESSIONS;
export const isLowTrust = (p: GroupPerson) => getUtBand(p.ut) === "low";

/** Người uy tín thấp chỉ vào kèo nhóm, và KHÔNG xếp chung nhóm với người mới (cả hai chiều) */
export function canJoinKeo(
  me: GroupPerson,
  keo: { kind: "personal" | "group"; members: GroupPerson[]; newbieFriendly?: boolean }
) {
  if (keo.kind === "personal" && isLowTrust(me)) return { ok: false, reasonVi: "Uy tín thấp: chỉ được tham gia kèo nhóm" };
  if (keo.kind === "group") {
    if (keo.newbieFriendly && me.ut < UT_CONFIG.NEWBIE_GROUP_MIN_UT) {
      return { ok: false, reasonVi: `Kèo cho người mới chỉ nhận người từ ${UT_CONFIG.NEWBIE_GROUP_MIN_UT} UT` };
    }
    if (isLowTrust(me) && keo.members.some(isNewbie)) return { ok: false, reasonVi: "Nhóm có người mới, chưa nhận người uy tín thấp" };
    if (isNewbie(me) && keo.members.some(isLowTrust)) return { ok: false, reasonVi: "Nhóm này chưa phù hợp với người mới" };
  }
  return { ok: true, reasonVi: "" };
}

/** Chặn lịch chồng: các kèo phải cách nhau ít nhất thời lượng buổi + 30 phút di chuyển */
export function overlapsCommitment(
  commitments: { startsAt: string; endsAt: string }[],
  next: { startsAt: string; endsAt: string },
  travelMin = 30
) {
  const s = t(next.startsAt);
  const e = t(next.endsAt);
  return commitments.some((c) => s < t(c.endsAt) + travelMin * MIN && t(c.startsAt) < e + travelMin * MIN);
}

/* ------------------------------------------------------------------ */
/* Gói bù cho người đã đến                                             */
/* ------------------------------------------------------------------ */

export function compensationFor(input: {
  showedUp: boolean;
  validSessions: number;
  xuThisMonth: number;
  lastCompensatedWithSamePairAt?: string | null;
  streakProtectUsedThisMonth: number;
  now?: Date | string;
}) {
  const C = UT_CONFIG.COMPENSATION;
  const nowT = t(input.now ?? new Date());
  if (!input.showedUp) return { eligible: false, xu: 0, streakProtected: false, replacementKeo: false, soloSession: false, reasonVi: "Chỉ người đã có mặt mới nhận gói bù" };
  const pairCool =
    !!input.lastCompensatedWithSamePairAt && nowT - t(input.lastCompensatedWithSamePairAt) < C.SAME_PAIR_COOLDOWN_DAYS * DAY;
  const xuAllowed = input.validSessions >= 1 && !pairCool;
  const xu = xuAllowed ? Math.max(0, Math.min(C.XU_PER_FLAKE, C.XU_MAX_PER_MONTH - input.xuThisMonth)) : 0;
  return {
    eligible: true,
    xu,
    streakProtected: input.streakProtectUsedThisMonth < C.STREAK_PROTECT_PER_MONTH,
    replacementKeo: true,
    soloSession: true,
    reasonVi: pairCool
      ? "Cùng cặp này đã được bù Xu trong 30 ngày qua"
      : input.validSessions < 1
        ? "Cần ít nhất 1 buổi hợp lệ để nhận Xu bồi thường"
        : xu === 0
          ? "Đã nhận đủ 30 Xu bồi thường tháng này"
          : `+${xu} Xu từ quỹ thưởng (không lấy từ người vắng)`,
  };
}

/** Buổi tự tập có xác thực: ≥ 30 phút tại điểm hẹn, 1 lần/ngày → +1 chuỗi, +10 Xu */
export function soloSessionCounts(minutesAtSpot: number, alreadyToday: boolean) {
  return !alreadyToday && minutesAtSpot >= UT_CONFIG.COMPENSATION.SOLO_SESSION_MIN;
}
