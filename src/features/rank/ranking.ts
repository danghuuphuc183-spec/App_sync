/**
 * RANKING 6 CẤP — TÁCH RIÊNG khỏi Điểm uy tín (UT).
 *
 * - Tính theo số buổi tập ĐÃ XÁC THỰC (check-in đúng hẹn), không theo UT.
 * - 3 cấp đầu mở khoá dần công cụ, có giới hạn rõ ràng.
 * - 3 cấp cao CHỈ là danh hiệu: không thêm quyền, không ảnh hưởng điểm ghép đôi hay UT.
 * - UT 0–10 quyết định hạn mức tạo kèo & hạn chế uy tín — xem features/trust/config.ts.
 */

export type RankId = "rookie" | "regular" | "disciplined" | "enduring" | "elite" | "legend";

export interface RankTools {
  /** số kèo đang mở cùng lúc tối đa */
  maxOpenKeos: number;
  /** số người tối đa của kèo nhóm (0 = chưa được tạo kèo nhóm) */
  maxGroupSize: number;
  /** được tạo kèo riêng trong nhóm kín của CLB */
  privatePoolKeo: boolean;
  /** được tạo sự kiện check-in QR cho CLB (khi có vai trò trong CLB) */
  qrEvents: boolean;
}

export interface RankLevel {
  id: RankId;
  level: 1 | 2 | 3 | 4 | 5 | 6;
  nameVi: string;
  minSessions: number;
  /** cấp 4–6: chỉ là danh hiệu */
  titleOnly: boolean;
  tools: RankTools;
  unlockVi: string;
}

const TOP_TOOLS: RankTools = { maxOpenKeos: 3, maxGroupSize: 12, privatePoolKeo: true, qrEvents: true };

export const RANK_LEVELS: readonly RankLevel[] = [
  {
    id: "rookie",
    level: 1,
    nameVi: "Tân binh",
    minSessions: 0,
    titleOnly: false,
    tools: { maxOpenKeos: 1, maxGroupSize: 0, privatePoolKeo: false, qrEvents: false },
    unlockVi: "Nhận kèo, mở 1 kèo 1:1 cùng lúc",
  },
  {
    id: "regular",
    level: 2,
    nameVi: "Đều đặn",
    minSessions: 10,
    titleOnly: false,
    tools: { maxOpenKeos: 2, maxGroupSize: 6, privatePoolKeo: false, qrEvents: false },
    unlockVi: "Mở 2 kèo cùng lúc, tạo kèo nhóm tối đa 6 người",
  },
  {
    id: "disciplined",
    level: 3,
    nameVi: "Kỷ luật",
    minSessions: 30,
    titleOnly: false,
    tools: TOP_TOOLS,
    unlockVi: "Mở 3 kèo, nhóm tối đa 12 người, kèo nhóm kín CLB, sự kiện QR",
  },
  { id: "enduring", level: 4, nameVi: "Bền bỉ", minSessions: 60, titleOnly: true, tools: TOP_TOOLS, unlockVi: "Danh hiệu — không thêm quyền" },
  { id: "elite", level: 5, nameVi: "Tinh anh", minSessions: 120, titleOnly: true, tools: TOP_TOOLS, unlockVi: "Danh hiệu — không thêm quyền" },
  { id: "legend", level: 6, nameVi: "Huyền thoại", minSessions: 250, titleOnly: true, tools: TOP_TOOLS, unlockVi: "Danh hiệu — không thêm quyền" },
];

export function rankFor(verifiedSessions: number): RankLevel {
  const n = Math.max(0, Math.floor(verifiedSessions));
  return [...RANK_LEVELS].reverse().find((r) => n >= r.minSessions) ?? RANK_LEVELS[0]!;
}

export function nextRank(verifiedSessions: number): { next: RankLevel; remaining: number } | null {
  const cur = rankFor(verifiedSessions);
  const next = RANK_LEVELS[cur.level];
  return next ? { next, remaining: next.minSessions - Math.floor(verifiedSessions) } : null;
}

/** Kiểm tra công cụ theo cấp — dùng khi tạo kèo */
export function canCreateKeo(verifiedSessions: number, openKeos: number, kind: "personal" | "group", groupSize = 2) {
  const t = rankFor(verifiedSessions).tools;
  if (openKeos >= t.maxOpenKeos) return { ok: false as const, reason: `Cấp hiện tại mở tối đa ${t.maxOpenKeos} kèo cùng lúc` };
  if (kind === "group" && groupSize > t.maxGroupSize)
    return { ok: false as const, reason: t.maxGroupSize ? `Kèo nhóm tối đa ${t.maxGroupSize} người ở cấp hiện tại` : "Đạt cấp Đều đặn (10 buổi) để tạo kèo nhóm" };
  return { ok: true as const };
}
