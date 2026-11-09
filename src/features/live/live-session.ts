/**
 * PHIÊN TẬP TRỰC TIẾP (Live check-in) + GHÉP ĐỘI TẠI CHỖ
 *
 * Luồng:
 *  1. Người dùng chọn cung đường / phòng tập → "Bắt đầu tập tại đây".
 *  2. Đồng ý chia sẻ vị trí. Chỉ bật được khi đang ở trong bán kính ARRIVAL_RADIUS_M
 *     của điểm tập (tính năng dành cho người đã tới nơi và chuẩn bị tập).
 *  3. Trạng thái "live": vị trí của bạn hiển thị cho người cùng môn trong bán kính
 *     VISIBLE_RADIUS_M; bạn thấy họ và có thể "Mời ghép đội" (hoặc nhận lời mời).
 *  4. Khi một bên đồng ý → "matched": hai bên chia sẻ vị trí chính xác cho nhau,
 *     hiển thị khoảng cách, thời gian đi bộ và chỉ đường tới nhau.
 *  5. Khi khoảng cách <= MEET_RADIUS_M → "met": gặp nhau, tập cùng.
 *  6. "Kết thúc" bất kỳ lúc nào → dừng chia sẻ vị trí ngay lập tức.
 */

export type LatLng = [number, number];

export const ARRIVAL_RADIUS_M = 300;
export const VISIBLE_RADIUS_M = 2000;
export const MEET_RADIUS_M = 25;
const EARTH_R = 6_371_000;
const WALK_M_PER_MIN = 80;

const toRad = (d: number) => (d * Math.PI) / 180;

export function distanceMeters(a: LatLng, b: LatLng): number {
  const dLat = toRad(b[0] - a[0]);
  const dLng = toRad(b[1] - a[1]);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a[0])) * Math.cos(toRad(b[0])) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_R * Math.asin(Math.min(1, Math.sqrt(h)));
}

export function formatDistance(m: number): string {
  if (m < 1000) return `${Math.round(m)} m`;
  return `${(m / 1000).toFixed(1).replace(/\.0$/, "")} km`;
}

export function walkingMinutes(m: number): number {
  return Math.max(1, Math.ceil(m / WALK_M_PER_MIN));
}

/** Dịch một toạ độ theo mét (dx: đông, dy: bắc). */
export function offsetMeters(p: LatLng, dx: number, dy: number): LatLng {
  const dLat = dy / 111_320;
  const dLng = dx / (111_320 * Math.cos(toRad(p[0])));
  return [p[0] + dLat, p[1] + dLng];
}

/** Đi từ `from` về phía `to` một đoạn `meters` (không vượt quá đích). */
export function stepToward(from: LatLng, to: LatLng, meters: number): LatLng {
  const d = distanceMeters(from, to);
  if (d <= meters || d === 0) return to;
  const t = meters / d;
  return [from[0] + (to[0] - from[0]) * t, from[1] + (to[1] - from[1]) * t];
}

export function isAtSpot(pos: LatLng, spot: LatLng, radius = ARRIVAL_RADIUS_M): boolean {
  return distanceMeters(pos, spot) <= radius;
}

/* ------------------------------------------------------------------ */
/* Người đang tập gần đây                                              */
/* ------------------------------------------------------------------ */

export interface NearbyAthlete {
  id: string;
  name: string;
  avatar: string;
  sport: string;
  /** 1 = Mới bắt đầu ... 4 = Chuyên nghiệp */
  level: 1 | 2 | 3 | 4;
  focus: string;
  trustScore: number;
  position: LatLng;
  startedMinAgo: number;
  /** Mô phỏng phản hồi của người kia (dữ liệu mẫu). */
  acceptsInvites: boolean;
}

export interface RankedAthlete extends NearbyAthlete {
  distanceM: number;
  score: number;
}

/**
 * Xếp hạng người đang tập gần: cùng môn, trong bán kính hiển thị.
 * score = 0.6·gần (e^-d/800) + 0.3·hợp trình độ + 0.1·uy tín
 */
export function rankNearby(
  me: { position: LatLng; sport: string; level: number },
  athletes: ReadonlyArray<NearbyAthlete>,
  radiusM = VISIBLE_RADIUS_M
): RankedAthlete[] {
  return athletes
    .filter((a) => a.sport === me.sport)
    .map((a) => {
      const distanceM = distanceMeters(me.position, a.position);
      const levelFit = 1 - Math.abs(a.level - me.level) / 3;
      const score = 0.6 * Math.exp(-distanceM / 800) + 0.3 * levelFit + 0.1 * Math.min(a.trustScore / 150, 1);
      return { ...a, distanceM, score };
    })
    .filter((a) => a.distanceM <= radiusM)
    .sort((a, b) => b.score - a.score || a.distanceM - b.distanceM);
}

/* ------------------------------------------------------------------ */
/* Máy trạng thái phiên                                                */
/* ------------------------------------------------------------------ */

export interface LiveSpot {
  id: string;
  name: string;
  kind: "route" | "venue";
  sport: string;
  position: LatLng;
}

export type InviteStatus = "pending" | "declined";

export interface LiveSessionState {
  phase: "idle" | "live" | "matched" | "met";
  spot: LiveSpot | null;
  myPos: LatLng | null;
  startedAt: number | null;
  outgoing: Record<string, InviteStatus>;
  incoming: string[];
  partnerId: string | null;
  partnerPos: LatLng | null;
}

export const INITIAL_LIVE_STATE: LiveSessionState = {
  phase: "idle",
  spot: null,
  myPos: null,
  startedAt: null,
  outgoing: {},
  incoming: [],
  partnerId: null,
  partnerPos: null,
};

export type LiveAction =
  | { type: "START"; spot: LiveSpot; myPos: LatLng; at: number }
  | { type: "MY_POS"; pos: LatLng }
  | { type: "SEND_INVITE"; athleteId: string }
  | { type: "INVITE_ANSWER"; athleteId: string; accepted: boolean; partnerPos: LatLng }
  | { type: "RECEIVE_INVITE"; athleteId: string }
  | { type: "ANSWER_INCOMING"; athleteId: string; accept: boolean; partnerPos: LatLng }
  | { type: "PARTNER_POS"; pos: LatLng }
  | { type: "CANCEL_MATCH" }
  | { type: "STOP" };

function withMeetCheck(s: LiveSessionState): LiveSessionState {
  if (s.phase === "matched" && s.myPos && s.partnerPos && distanceMeters(s.myPos, s.partnerPos) <= MEET_RADIUS_M) {
    return { ...s, phase: "met" };
  }
  return s;
}

function matchWith(s: LiveSessionState, partnerId: string, partnerPos: LatLng): LiveSessionState {
  return withMeetCheck({ ...s, phase: "matched", partnerId, partnerPos, outgoing: {}, incoming: [] });
}

export function liveReducer(s: LiveSessionState, a: LiveAction): LiveSessionState {
  switch (a.type) {
    case "START":
      return { ...INITIAL_LIVE_STATE, phase: "live", spot: a.spot, myPos: a.myPos, startedAt: a.at };

    case "MY_POS":
      return s.phase === "idle" ? s : withMeetCheck({ ...s, myPos: a.pos });

    case "SEND_INVITE":
      if (s.phase !== "live" || s.outgoing[a.athleteId]) return s;
      return { ...s, outgoing: { ...s.outgoing, [a.athleteId]: "pending" } };

    case "INVITE_ANSWER":
      if (s.phase !== "live" || s.outgoing[a.athleteId] !== "pending") return s;
      return a.accepted
        ? matchWith(s, a.athleteId, a.partnerPos)
        : { ...s, outgoing: { ...s.outgoing, [a.athleteId]: "declined" } };

    case "RECEIVE_INVITE":
      if (s.phase !== "live" || s.incoming.includes(a.athleteId)) return s;
      return { ...s, incoming: [...s.incoming, a.athleteId] };

    case "ANSWER_INCOMING":
      if (s.phase !== "live" || !s.incoming.includes(a.athleteId)) return s;
      return a.accept
        ? matchWith(s, a.athleteId, a.partnerPos)
        : { ...s, incoming: s.incoming.filter((id) => id !== a.athleteId) };

    case "PARTNER_POS":
      return s.phase === "matched" ? withMeetCheck({ ...s, partnerPos: a.pos }) : s;

    case "CANCEL_MATCH":
      return s.phase === "matched" || s.phase === "met"
        ? { ...s, phase: "live", partnerId: null, partnerPos: null }
        : s;

    case "STOP":
      return INITIAL_LIVE_STATE;
  }
}
