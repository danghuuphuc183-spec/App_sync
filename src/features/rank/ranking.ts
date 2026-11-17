/**
 * SYNESIS 6-RANK EXP SYSTEM & TRUST CROSS-CONTROL SPECIFICATION
 *
 * Tách biệt hoàn toàn 3 trục:
 * 1. Điểm Uy Tín (UT: 0 - 10): Quản lý giới hạn cam kết, án phạt khi bùng/trễ, và mở/khóa đặc quyền công cụ.
 * 2. Hệ thống Xu (1 Xu = 10 VNĐ): Đổi quà giải nhiệt, voucher đối tác, mẫu thử dinh dưỡng.
 * 3. Điểm Kinh Nghiệm (EXP): Tích lũy MỘT CHIỀU (không bao giờ bị trừ, không mua bằng tiền) để cày 6 bậc Rank.
 *
 * 3 Cấp đầu mở khóa dần công cụ (Kèo, Host, Duo, Squad, Recurring slot).
 * 3 Cấp cao là danh hiệu danh dự cộng đồng (Chi phí 0 VNĐ).
 *
 * Hình ảnh huy hiệu 6 Rank (media_1794913688716_d30baf1c.png):
 * - Rank 1: Đồng (Bronze Shield with White Star)
 * - Rank 2: Bạc & Neon Cyan (Cyan/Teal Neon Shield with Star)
 * - Rank 3: Đỏ Ruby Vương Miện (Crimson Crest with Crown & Silver Chevron Base)
 * - Rank 4: Tím Pha Lê (Amethyst Purple Crystal Shield with Star)
 * - Rank 5: Vàng Rực Rỡ (Solar Gold / Amber Wing Crest with Star)
 * - Rank 6: Huyền Thoại Kim Cương (Obsidian / Iridescent Diamond Star Crest)
 */

export type RankId = "rookie" | "runner" | "pacer" | "iron_core" | "vanguard" | "legend";

export interface RankTools {
  /** số kèo đang mở cùng lúc tối đa */
  maxOpenKeos: number;
  /** số người tối đa của kèo nhóm (0 = chưa được tạo kèo nhóm) */
  maxGroupSize: number;
  /** được quyền làm Host nhóm nhỏ 3-4 người */
  canHostGroup: boolean;
  /** được quyền mở khóa tính năng Chuỗi Đôi (Duo Streak) */
  duoStreakUnlocked: boolean;
  /** số thẻ nghỉ (Streak Freeze) nhận mỗi tháng */
  monthlyStreakFreezes: number;
  /** được quyền sáng lập Nhóm Cố Định (Squad) có tên riêng và nội quy */
  permanentSquad: boolean;
  /** được quyền thiết lập Lịch Tập Định Kỳ Tự Động (Recurring Slot) */
  recurringSlots: boolean;
  /** hiển thị nhãn Verified Spotter / Pacer trên thẻ tạo kèo */
  verifiedBadge: boolean;
  /** cấp tầng kho quà Xu mở khóa (0 = chỉ ví chờ, 1 = Tầng 1-2, 2 = Tầng 1-4) */
  rewardShopTierUnlocked: 0 | 1 | 2;
}

export interface RankLevel {
  id: RankId;
  level: 1 | 2 | 3 | 4 | 5 | 6;
  nameVi: string;
  nameEn: string;
  badgeTitle: string;
  minExp: number;
  maxExp: number;
  minSessions: number;
  timeToAchieve: string;
  estimatedSessionsText: string;
  /** cấp 4–6: danh hiệu vinh dự cộng đồng (chi phí 0 VNĐ) */
  titleOnly: boolean;
  tools: RankTools;
  unlockVi: string;
  perks: string[];
  theme: {
    name: string;
    primaryColor: string;
    accentColor: string;
    badgeBgGradient: string;
    borderGlow: string;
    textColor: string;
    auraColor: string;
  };
}

export const RANK_LEVELS: readonly RankLevel[] = [
  {
    id: "rookie",
    level: 1,
    nameVi: "Tân Binh",
    nameEn: "ROOKIE",
    badgeTitle: "Cấp 1 · Tân Binh",
    minExp: 0,
    maxExp: 599,
    minSessions: 0,
    timeToAchieve: "Tuần 1 – Tuần 2 (0 đến 2 tuần đầu)",
    estimatedSessionsText: "Dưới 6 buổi hợp lệ",
    titleOnly: false,
    tools: {
      maxOpenKeos: 1,
      maxGroupSize: 4,
      canHostGroup: false,
      duoStreakUnlocked: false,
      monthlyStreakFreezes: 0,
      permanentSquad: false,
      recurringSlots: false,
      verifiedBadge: false,
      rewardShopTierUnlocked: 0, // Xu vào ví chờ, chưa mở nút đổi quà
    },
    unlockVi: "Vùng đệm an toàn, tạo 1 kèo 1-1, tham gia kèo nhóm 3-4, sự kiện CLB",
    perks: [
      "Vùng đệm làm quen an toàn: 30 ngày đầu miễn phạt khi đến trễ trong vòng 15 phút",
      "Tham gia Kèo nhóm (3-4 người), tạo kèo 1-1 và sự kiện CLB",
      "Ghép đôi với Buddy/Host ở chế độ yên tĩnh (Quiet Mode)",
      "Tích lũy Xu vào ví chờ (chưa mở nút Đổi quà để chống tạo nick ảo bào voucher)",
    ],
    theme: {
      name: "Bronze Metallic",
      primaryColor: "#d97706",
      accentColor: "#b45309",
      badgeBgGradient: "from-amber-800 via-amber-700 to-yellow-900",
      borderGlow: "border-amber-600/50 shadow-amber-600/20",
      textColor: "text-amber-500 dark:text-amber-400",
      auraColor: "rgba(217, 119, 6, 0.25)",
    },
  },
  {
    id: "runner",
    level: 2,
    nameVi: "Thành Viên Chính Thức",
    nameEn: "RUNNER / LIFTER",
    badgeTitle: "Cấp 2 · Runner",
    minExp: 600,
    maxExp: 1999,
    minSessions: 6,
    timeToAchieve: "Tuần 3 – Tuần 6 (khoảng 1 đến 1.5 tháng)",
    estimatedSessionsText: "Đạt ≥ 6 buổi hợp lệ & kết thúc Rookie",
    titleOnly: false,
    tools: {
      maxOpenKeos: 2,
      maxGroupSize: 4,
      canHostGroup: true,
      duoStreakUnlocked: true,
      monthlyStreakFreezes: 1,
      permanentSquad: false,
      recurringSlots: false,
      verifiedBadge: false,
      rewardShopTierUnlocked: 1, // Mở Tầng 1 & Tầng 2
    },
    unlockVi: "Mở Cửa hàng Đổi Quà bằng Xu (Tầng 1 & 2), tự làm Host nhóm 3-4, Chuỗi Đôi (Duo)",
    perks: [
      "Mở khóa Cửa hàng Đổi Quà bằng Xu: Đổi voucher Tầng 1 & Tầng 2 (tối đa 1 món/tuần)",
      "Quyền tự làm Host cho nhóm nhỏ 3-4 người",
      "Mở khóa tính năng Chuỗi Đôi (Duo Streak) khi tập cùng 1 bạn tập từ 3 buổi trở lên",
      "Nhận 1 Thẻ Nghỉ (Streak Freeze)/tháng không cần khai báo lý do khi ốm hoặc bận việc",
    ],
    theme: {
      name: "Neon Cyan & Silver",
      primaryColor: "#06b6d4",
      accentColor: "#38bdf8",
      badgeBgGradient: "from-cyan-900 via-teal-800 to-sky-950",
      borderGlow: "border-cyan-400/60 shadow-cyan-400/30",
      textColor: "text-cyan-500 dark:text-cyan-400",
      auraColor: "rgba(6, 182, 212, 0.35)",
    },
  },
  {
    id: "pacer",
    level: 3,
    nameVi: "Người Giữ Nhịp",
    nameEn: "PACER / SPOTTER",
    badgeTitle: "Cấp 3 · Pacer",
    minExp: 2000,
    maxExp: 4499,
    minSessions: 18,
    timeToAchieve: "Tháng 2 – Tháng 3 (khoảng 6 đến 12 tuần)",
    estimatedSessionsText: "Tương đương ~15 - 18 buổi hợp lệ",
    titleOnly: false,
    tools: {
      maxOpenKeos: 3,
      maxGroupSize: 12,
      canHostGroup: true,
      duoStreakUnlocked: true,
      monthlyStreakFreezes: 2,
      permanentSquad: true,
      recurringSlots: true,
      verifiedBadge: true,
      rewardShopTierUnlocked: 1,
    },
    unlockVi: "Sáng lập Nhóm Cố Định (Squad), Lịch Tập Định Kỳ Tự Động, nhãn Verified Pacer",
    perks: [
      "Sáng lập Nhóm Cố Định (Permanent Group / Squad) có tên riêng và nội quy riêng",
      "Thiết lập Lịch Tập Định Kỳ Tự Động (Recurring Slot) lặp lại hàng tuần",
      "Mở nhãn 'Verified Spotter / Pacer' trên thẻ tạo kèo giúp thu hút bạn tập nhanh hơn",
      "Tối đa 3 kèo mở cùng lúc trong 24h (khi giữ Điểm Uy Tín ở mức 9–10 UT)",
    ],
    theme: {
      name: "Crimson / Ruby Crown",
      primaryColor: "#e11d48",
      accentColor: "#f43f5e",
      badgeBgGradient: "from-rose-950 via-red-900 to-stone-900",
      borderGlow: "border-rose-500/60 shadow-rose-500/30",
      textColor: "text-rose-500 dark:text-rose-400",
      auraColor: "rgba(225, 29, 72, 0.35)",
    },
  },
  {
    id: "iron_core",
    level: 4,
    nameVi: "Kỷ Luật Thép",
    nameEn: "IRON CORE",
    badgeTitle: "Cấp 4 · Iron Core",
    minExp: 4500,
    maxExp: 8999,
    minSessions: 45,
    timeToAchieve: "Tháng 4 – Tháng 6",
    estimatedSessionsText: "~35 - 60 buổi hợp lệ",
    titleOnly: true,
    tools: {
      maxOpenKeos: 3,
      maxGroupSize: 12,
      canHostGroup: true,
      duoStreakUnlocked: true,
      monthlyStreakFreezes: 2,
      permanentSquad: true,
      recurringSlots: true,
      verifiedBadge: true,
      rewardShopTierUnlocked: 2, // Mở toàn bộ Tầng 1-4 (Hiện vật)
    },
    unlockVi: "Huy hiệu & Tag 'Iron Core', viền Avatar kim loại, mở Kho Quà Tầng 3 & 4 (Hiện vật)",
    perks: [
      "Danh hiệu cộng đồng 1: Tag 'Iron Core – Kỷ Luật Thép' kèm viền Avatar kim loại trên bảng tìm kiếm Slot và CLB",
      "Mở khóa toàn bộ Kho Quà Tầng 3 & Tầng 4 (Thẻ tập 100%, Sample dinh dưỡng và Hiện vật Synesis: Bình nước, Áo tập, Balo)",
      "Chi phí danh hiệu 0 VNĐ, không làm phình ngân sách hệ thống",
    ],
    theme: {
      name: "Amethyst / Purple Crystal",
      primaryColor: "#9333ea",
      accentColor: "#a855f7",
      badgeBgGradient: "from-purple-950 via-violet-900 to-indigo-950",
      borderGlow: "border-purple-500/60 shadow-purple-500/30",
      textColor: "text-purple-500 dark:text-purple-400",
      auraColor: "rgba(147, 51, 234, 0.35)",
    },
  },
  {
    id: "vanguard",
    level: 5,
    nameVi: "Chiến Binh Tiên Phong",
    nameEn: "VANGUARD",
    badgeTitle: "Cấp 5 · Vanguard",
    minExp: 9000,
    maxExp: 17999,
    minSessions: 90,
    timeToAchieve: "Tháng 7 – Tháng 12",
    estimatedSessionsText: "~65 - 120 buổi hợp lệ",
    titleOnly: true,
    tools: {
      maxOpenKeos: 3,
      maxGroupSize: 12,
      canHostGroup: true,
      duoStreakUnlocked: true,
      monthlyStreakFreezes: 2,
      permanentSquad: true,
      recurringSlots: true,
      verifiedBadge: true,
      rewardShopTierUnlocked: 2,
    },
    unlockVi: "Danh hiệu 'Synesis Vanguard' phát sáng, ghi danh Bảng Vàng Kỷ Luật Khu Vực / CLB",
    perks: [
      "Danh hiệu danh dự 'Synesis Vanguard' phát sáng nổi bật trên Hồ sơ cá nhân",
      "Tự động ghi danh vào Bảng Vàng Kỷ Luật Khu Vực / CLB thể thao",
      "Biểu tượng danh dự cộng đồng chứng nhận kiên trì hơn nửa năm",
    ],
    theme: {
      name: "Solar Gold & Amber",
      primaryColor: "#f59e0b",
      accentColor: "#fbbf24",
      badgeBgGradient: "from-amber-950 via-yellow-900 to-orange-950",
      borderGlow: "border-amber-400/70 shadow-amber-400/40",
      textColor: "text-amber-500 dark:text-amber-300",
      auraColor: "rgba(245, 158, 11, 0.4)",
    },
  },
  {
    id: "legend",
    level: 6,
    nameVi: "Huyền Thoại",
    nameEn: "SYNESIS LEGEND",
    badgeTitle: "Cấp 6 · Legend",
    minExp: 18000,
    maxExp: Infinity,
    minSessions: 130,
    timeToAchieve: "Trên 1 năm duy trì đều đặn",
    estimatedSessionsText: "~130+ buổi hợp lệ",
    titleOnly: true,
    tools: {
      maxOpenKeos: 3,
      maxGroupSize: 12,
      canHostGroup: true,
      duoStreakUnlocked: true,
      monthlyStreakFreezes: 2,
      permanentSquad: true,
      recurringSlots: true,
      verifiedBadge: true,
      rewardShopTierUnlocked: 2,
    },
    unlockVi: "Danh hiệu vĩnh viễn 'Synesis Legend' – Biểu tượng danh dự cao nhất >1 năm không bỏ cuộc",
    perks: [
      "Danh hiệu vĩnh viễn 'Synesis Legend' tối thượng",
      "Viền hào quang đa sắc Prismatic & Kim Cương trên toàn hệ thống",
      "Biểu tượng danh dự cao nhất chứng nhận hơn 1 năm không bỏ cuộc trong thể thao đô thị",
    ],
    theme: {
      name: "Obsidian & Iridescent Diamond",
      primaryColor: "#38bdf8",
      accentColor: "#c084fc",
      badgeBgGradient: "from-slate-950 via-indigo-950 to-purple-950",
      borderGlow: "border-cyan-300/80 shadow-fuchsia-500/40",
      textColor: "text-transparent bg-clip-text bg-linear-to-r from-cyan-400 via-sky-300 to-fuchsia-400",
      auraColor: "rgba(56, 189, 248, 0.45)",
    },
  },
];

/** Lấy Rank dựa vào số EXP tích lũy (Chuẩn Master Spec) */
export function getRankByExp(exp: number): RankLevel {
  const safeExp = Math.max(0, Math.floor(exp));
  return [...RANK_LEVELS].reverse().find((r) => safeExp >= r.minExp) ?? RANK_LEVELS[0]!;
}

/** Lấy Rank dựa vào số buổi xác thực (hỗ trợ tương thích ngược) */
export function rankFor(verifiedSessions: number): RankLevel {
  const n = Math.max(0, Math.floor(verifiedSessions));
  return [...RANK_LEVELS].reverse().find((r) => n >= r.minSessions) ?? RANK_LEVELS[0]!;
}

/** Tính mốc thăng cấp tiếp theo và số EXP còn thiếu */
export function getNextRankProgress(exp: number): {
  currentRank: RankLevel;
  nextRank: RankLevel | null;
  remainingExp: number;
  progressPercent: number;
} {
  const currentRank = getRankByExp(exp);
  const nextRank = RANK_LEVELS[currentRank.level] ?? null;

  if (!nextRank) {
    return {
      currentRank,
      nextRank: null,
      remainingExp: 0,
      progressPercent: 100,
    };
  }

  const expInLevel = Math.max(0, exp - currentRank.minExp);
  const levelSpan = nextRank.minExp - currentRank.minExp;
  const progressPercent = Math.min(100, Math.max(0, Math.round((expInLevel / levelSpan) * 100)));
  const remainingExp = Math.max(0, nextRank.minExp - exp);

  return {
    currentRank,
    nextRank,
    remainingExp,
    progressPercent,
  };
}

/** Tương thích với `nextRank` cũ theo số buổi */
export function nextRank(verifiedSessions: number): { next: RankLevel; remaining: number } | null {
  const cur = rankFor(verifiedSessions);
  const next = RANK_LEVELS[cur.level];
  return next ? { next, remaining: next.minSessions - Math.floor(verifiedSessions) } : null;
}

/**
 * CƠ CHẾ KIỂM SOÁT CHÉO GIỮA ĐIỂM UY TÍN (UT) VÀ ĐẶC QUYỀN RANK:
 *
 * - EXP và Rank KHÔNG BAO GIỜ BỊ MẤT ĐI (tích lũy 1 chiều).
 * - Mọi đặc quyền công cụ của Rank 2 và Rank 3 đều YÊU CẦU Điểm Uy Tín (UT) hiện tại đạt từ 7.0 trở lên.
 * - Nếu UT rơi xuống 5.0 - 6.9 (Hạn chế):
 *   + Quyền tạo lịch định kỳ tự động bị đóng băng tạm thời.
 *   + Giới hạn tạo tối đa 1 kèo trong vòng 24h.
 * - Nếu UT rơi xuống 0.0 - 4.9 (Uy tín thấp):
 *   + Toàn bộ quyền tạo kèo 1-1 bị khóa.
 *   + Chỉ được tham gia kèo nhóm để tích lũy +0.5 UT/buổi đúng hẹn phục hồi.
 */
export interface UtCrossCheckResult {
  isPrivilegeActive: boolean;
  isRestricted: boolean;
  isLowTrust: boolean;
  statusLabel: string;
  reason?: string;
  maxAllowedOpenKeos: number;
  canCreateRecurringSlots: boolean;
  canCreatePersonalKeo: boolean;
}

export function checkRankUtCrossControl(rankLevel: number, currentUt: number): UtCrossCheckResult {
  // Cấp 1 không có đặc quyền cấp cao nên không bị ảnh hưởng bởi điều kiện UT >= 7
  if (rankLevel <= 1) {
    if (currentUt < 5.0) {
      return {
        isPrivilegeActive: true,
        isRestricted: false,
        isLowTrust: true,
        statusLabel: "Uy tín thấp (0–4)",
        reason: "Điểm Uy Tín dưới 5.0: Tạm khóa tạo kèo 1-1, chỉ tham gia kèo nhóm để phục hồi +0.5 UT/buổi.",
        maxAllowedOpenKeos: 0,
        canCreateRecurringSlots: false,
        canCreatePersonalKeo: false,
      };
    }
    return {
      isPrivilegeActive: true,
      isRestricted: currentUt < 7.0,
      isLowTrust: false,
      statusLabel: currentUt >= 7.0 ? "Đạt chuẩn" : "Hạn chế (5–6)",
      maxAllowedOpenKeos: currentUt >= 7.0 ? 1 : 1,
      canCreateRecurringSlots: false,
      canCreatePersonalKeo: true,
    };
  }

  // Cấp 2 và Cấp 3: Yêu cầu UT >= 7 để kích hoạt toàn bộ công cụ
  if (currentUt < 5.0) {
    return {
      isPrivilegeActive: false,
      isRestricted: false,
      isLowTrust: true,
      statusLabel: "Uy tín thấp (0–4)",
      reason: "Toàn bộ quyền tạo kèo 1-1 bị khóa do UT < 5.0. Chỉ được vào kèo nhóm để phục hồi +0.5 UT/buổi đúng hẹn.",
      maxAllowedOpenKeos: 0,
      canCreateRecurringSlots: false,
      canCreatePersonalKeo: false,
    };
  }

  if (currentUt < 7.0) {
    return {
      isPrivilegeActive: false,
      isRestricted: true,
      isLowTrust: false,
      statusLabel: "Hạn chế (5–6)",
      reason: "Điểm Uy Tín từ 5.0 – 6.9: Quyền tạo lịch định kỳ bị đóng băng, chỉ được tạo tối đa 1 kèo trong 24h.",
      maxAllowedOpenKeos: 1,
      canCreateRecurringSlots: false,
      canCreatePersonalKeo: true,
    };
  }

  // UT >= 7.0: Bình thường
  const rank = RANK_LEVELS[rankLevel - 1] ?? RANK_LEVELS[0]!;
  return {
    isPrivilegeActive: true,
    isRestricted: false,
    isLowTrust: false,
    statusLabel: currentUt >= 9.0 ? "Uy tín cao (9–10)" : "Cần chú ý (7–8)",
    maxAllowedOpenKeos: currentUt >= 9.0 ? rank.tools.maxOpenKeos : Math.min(2, rank.tools.maxOpenKeos),
    canCreateRecurringSlots: rank.tools.recurringSlots,
    canCreatePersonalKeo: true,
  };
}

/** Kiểm tra công cụ theo cấp và UT khi tạo kèo */
export function canCreateKeo(
  verifiedSessionsOrExp: number,
  openKeos: number,
  kind: "personal" | "group",
  groupSize = 2,
  currentUt = 8.5
) {
  // Hỗ trợ cả số buổi hoặc số EXP
  const rank = verifiedSessionsOrExp > 250
    ? getRankByExp(verifiedSessionsOrExp)
    : rankFor(verifiedSessionsOrExp);

  const utCheck = checkRankUtCrossControl(rank.level, currentUt);

  if (!utCheck.canCreatePersonalKeo && kind === "personal") {
    return {
      ok: false as const,
      reason: utCheck.reason ?? "Điểm Uy Tín thấp (0–4), chỉ được tham gia kèo nhóm để phục hồi.",
    };
  }

  if (openKeos >= utCheck.maxAllowedOpenKeos) {
    return {
      ok: false as const,
      reason: utCheck.isRestricted
        ? "Đang ở trạng thái Uy tín hạn chế (5–6 UT): mở tối đa 1 kèo trong 24h"
        : `Cấp hiện tại mở tối đa ${utCheck.maxAllowedOpenKeos} kèo cùng lúc`,
    };
  }

  if (kind === "group" && groupSize > rank.tools.maxGroupSize) {
    return {
      ok: false as const,
      reason: rank.tools.maxGroupSize > 0
        ? `Kèo nhóm tối đa ${rank.tools.maxGroupSize} người ở cấp hiện tại`
        : "Cần đạt Cấp 2 · Runner để tạo kèo nhóm",
    };
  }

  return { ok: true as const };
}
