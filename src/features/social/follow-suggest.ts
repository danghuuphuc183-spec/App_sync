/**
 * THUẬT TOÁN GỢI Ý NGƯỜI THEO DÕI ("Nên theo dõi")
 *
 * Hai luồng ứng viên, chấm điểm riêng rồi trộn xen kẽ để danh sách luôn đa dạng:
 *
 * 1) FEATURED — Người nổi tiếng / VĐV được xác minh
 *    score = 0.50·popularity + 0.30·sportAffinity + 0.20·activity
 *
 * 2) PEER — Người có điểm chung với bạn
 *    score = 0.30·sportAffinity + 0.25·social + 0.15·proximity
 *          + 0.15·levelFit + 0.10·club + 0.05·activity
 *
 * Các tín hiệu (đều chuẩn hoá về 0..1):
 * - sportAffinity: Jaccard giữa môn của bạn và của họ, +0.25 nếu trùng môn chính.
 * - social:        1 - e^(-bạnChung/3)  → 1 bạn chung ≈ 0.28, 3 ≈ 0.63, 6 ≈ 0.86.
 * - proximity:     e^(-km/5)            → 1km ≈ 0.82, 5km ≈ 0.37, 15km ≈ 0.05.
 * - levelFit:      1 - |Δtrình độ|/3; nếu cùng chạy bộ thì trộn với độ gần pace e^(-|Δgiây|/60).
 * - club:          1 nếu cùng ít nhất một CLB.
 * - popularity:    log10(followers+1)/6 (1 triệu follower = 1.0).
 * - activity:      0.7·e^(-ngàyKhôngHoạtĐộng/7) + 0.3·min(chuỗiTuần/12, 1).
 *
 * Bộ lọc: loại chính mình, người đã theo dõi, người đã bấm "Xóa".
 * Cold start: người mới chưa có môn/bạn bè → điểm peer thấp, luồng featured tự động chiếm ưu thế.
 * Trộn: mỗi `featuredEvery` vị trí chèn 1 người nổi tiếng (mặc định 1 featured : 2 peer).
 * Mỗi gợi ý kèm lý do hiển thị, lấy từ tín hiệu đóng góp nhiều điểm nhất.
 */

export type SportKey =
  | "running"
  | "gym"
  | "pickleball"
  | "badminton"
  | "table_tennis"
  | "football"
  | "basketball"
  | "cycling"
  | "swimming"
  | "yoga"
  | "padel";

export interface SuggestionCandidate {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  headline: string;
  isVerified: boolean;
  /** Người nổi tiếng / VĐV chuyên nghiệp / KOL thể thao */
  isFeatured: boolean;
  followers: number;
  sports: SportKey[];
  /** 1 = Mới bắt đầu ... 4 = Chuyên nghiệp */
  level: 1 | 2 | 3 | 4;
  paceSecPerKm?: number;
  distanceKm: number;
  areaVi: string;
  clubIds: string[];
  /** Danh sách id những người đang theo dõi người này */
  followerIds: string[];
  lastActiveDaysAgo: number;
  weeklyStreak: number;
}

export interface ViewerContext {
  id: string;
  sports: SportKey[];
  level: 1 | 2 | 3 | 4;
  paceSecPerKm?: number;
  clubIds: string[];
  followingIds: string[];
  dismissedIds?: string[];
}

export type SuggestionReasonKind =
  | "featured"
  | "mutual"
  | "sport"
  | "nearby"
  | "level"
  | "club"
  | "active";

export interface FollowSuggestion {
  candidate: SuggestionCandidate;
  track: "featured" | "peer";
  score: number;
  reasonKind: SuggestionReasonKind;
  reason: string;
  mutualCount: number;
  signals: Record<"sportAffinity" | "social" | "proximity" | "levelFit" | "club" | "popularity" | "activity", number>;
}

export const SPORT_LABEL_VI: Record<SportKey, string> = {
  running: "Chạy bộ",
  gym: "Gym",
  pickleball: "Pickleball",
  badminton: "Cầu lông",
  table_tennis: "Bóng bàn",
  football: "Bóng đá",
  basketball: "Bóng rổ",
  cycling: "Đạp xe",
  swimming: "Bơi lội",
  yoga: "Yoga",
  padel: "Padel",
};

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

export function sportAffinity(a: SportKey[], b: SportKey[]): number {
  if (a.length === 0 || b.length === 0) return 0;
  const setA = new Set(a);
  const setB = new Set(b);
  let inter = 0;
  setA.forEach((s) => {
    if (setB.has(s)) inter += 1;
  });
  const union = new Set([...setA, ...setB]).size;
  const jaccard = inter / union;
  const primaryBonus = a[0] === b[0] ? 0.25 : 0;
  return clamp01(jaccard + primaryBonus);
}

export function computeSignals(viewer: ViewerContext, c: SuggestionCandidate) {
  const following = new Set(viewer.followingIds);
  const mutualCount = c.followerIds.filter((id) => following.has(id)).length;

  const levelDiff = 1 - Math.abs(viewer.level - c.level) / 3;
  const bothRun =
    viewer.sports.includes("running") &&
    c.sports.includes("running") &&
    viewer.paceSecPerKm !== undefined &&
    c.paceSecPerKm !== undefined;
  const levelFit = bothRun
    ? 0.5 * levelDiff + 0.5 * Math.exp(-Math.abs(viewer.paceSecPerKm! - c.paceSecPerKm!) / 60)
    : levelDiff;

  const viewerClubs = new Set(viewer.clubIds);
  const sharedClub = c.clubIds.some((id) => viewerClubs.has(id));

  return {
    mutualCount,
    signals: {
      sportAffinity: sportAffinity(viewer.sports, c.sports),
      social: 1 - Math.exp(-mutualCount / 3),
      proximity: Math.exp(-Math.max(0, c.distanceKm) / 5),
      levelFit: clamp01(levelFit),
      club: sharedClub ? 1 : 0,
      popularity: clamp01(Math.log10(c.followers + 1) / 6),
      activity:
        0.7 * Math.exp(-Math.max(0, c.lastActiveDaysAgo) / 7) + 0.3 * Math.min(c.weeklyStreak / 12, 1),
    },
  };
}

const FEATURED_WEIGHTS = { popularity: 0.5, sportAffinity: 0.3, activity: 0.2 } as const;
const PEER_WEIGHTS = {
  sportAffinity: 0.3,
  social: 0.25,
  proximity: 0.15,
  levelFit: 0.15,
  club: 0.1,
  activity: 0.05,
} as const;

function weighted<T extends Record<string, number>>(
  weights: T,
  signals: FollowSuggestion["signals"]
): { score: number; top: keyof T } {
  let score = 0;
  let top = Object.keys(weights)[0] as keyof T;
  let topContribution = -1;
  for (const key of Object.keys(weights) as (keyof T)[]) {
    const contribution = (weights[key] ?? 0) * signals[key as keyof FollowSuggestion["signals"]];
    score += contribution;
    if (contribution > topContribution) {
      topContribution = contribution;
      top = key;
    }
  }
  return { score, top };
}

function formatFollowers(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, "")}K`;
  return String(n);
}

function buildReason(
  kind: SuggestionReasonKind,
  viewer: ViewerContext,
  c: SuggestionCandidate,
  mutualCount: number
): string {
  const shared = c.sports.find((s) => viewer.sports.includes(s));
  switch (kind) {
    case "featured":
      return `Gương mặt nổi bật · ${formatFollowers(c.followers)} người theo dõi`;
    case "mutual":
      return `${mutualCount} bạn chung đang theo dõi`;
    case "sport":
      return shared ? `Cùng mê ${SPORT_LABEL_VI[shared].toLowerCase()}` : "Cùng sở thích thể thao";
    case "nearby":
      return `Tập gần bạn · ${c.distanceKm.toFixed(1).replace(/\.0$/, "")} km`;
    case "level":
      return c.paceSecPerKm && shared === "running"
        ? `Pace tương đương bạn`
        : "Cùng trình độ với bạn";
    case "club":
      return "Cùng câu lạc bộ";
    case "active":
      return `Giữ chuỗi ${c.weeklyStreak} tuần liên tiếp`;
  }
}

const PEER_REASON: Record<keyof typeof PEER_WEIGHTS, SuggestionReasonKind> = {
  sportAffinity: "sport",
  social: "mutual",
  proximity: "nearby",
  levelFit: "level",
  club: "club",
  activity: "active",
};

export function scoreCandidate(viewer: ViewerContext, c: SuggestionCandidate): FollowSuggestion {
  const { signals, mutualCount } = computeSignals(viewer, c);

  if (c.isFeatured) {
    const { score } = weighted(FEATURED_WEIGHTS, signals);
    return {
      candidate: c,
      track: "featured",
      score,
      reasonKind: "featured",
      reason: buildReason("featured", viewer, c, mutualCount),
      mutualCount,
      signals,
    };
  }

  const { score, top } = weighted(PEER_WEIGHTS, signals);
  // Bạn chung là lý do thuyết phục nhất — ưu tiên hiển thị nếu có >= 2 người.
  const reasonKind: SuggestionReasonKind = mutualCount >= 2 ? "mutual" : PEER_REASON[top];
  return {
    candidate: c,
    track: "peer",
    score,
    reasonKind,
    reason: buildReason(reasonKind, viewer, c, mutualCount),
    mutualCount,
    signals,
  };
}

const byScore = (a: FollowSuggestion, b: FollowSuggestion) =>
  b.score - a.score || a.candidate.id.localeCompare(b.candidate.id);

export function suggestFollows(
  viewer: ViewerContext,
  candidates: ReadonlyArray<SuggestionCandidate>,
  options: { limit?: number; featuredEvery?: number } = {}
): FollowSuggestion[] {
  const limit = options.limit ?? 10;
  const featuredEvery = Math.max(1, options.featuredEvery ?? 3);

  const excluded = new Set([viewer.id, ...viewer.followingIds, ...(viewer.dismissedIds ?? [])]);
  const scored = candidates.filter((c) => !excluded.has(c.id)).map((c) => scoreCandidate(viewer, c));

  const featured = scored.filter((s) => s.track === "featured").sort(byScore);
  const peers = scored.filter((s) => s.track === "peer").sort(byScore);

  // Trộn xen kẽ: vị trí 0, featuredEvery, 2·featuredEvery... dành cho người nổi tiếng.
  const result: FollowSuggestion[] = [];
  let fi = 0;
  let pi = 0;
  while (result.length < limit && (fi < featured.length || pi < peers.length)) {
    const wantFeatured = result.length % featuredEvery === 0;
    if ((wantFeatured && fi < featured.length) || pi >= peers.length) {
      result.push(featured[fi++]!);
    } else {
      result.push(peers[pi++]!);
    }
  }
  return result;
}
