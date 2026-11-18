"use client";

import * as React from "react";
import {
  X,
  Award,
  Zap,
  Sparkles,
  ShieldCheck,
  ShieldAlert,
  ChevronRight,
  Flame,
  Gift,
  Users,
  CheckCircle2,
  Lock,
  ArrowRight,
  Calendar,
  Clock,
  TrendingUp,
  Shield,
  Coffee,
  Dumbbell,
  Package,
  Crown,
  VolumeX,
  HeartHandshake,
  CalendarDays,
  Building2,
  Trophy,
  Coins,
  Star,
  Check,
} from "lucide-react";
import {
  RANK_LEVELS,
  RankLevel,
  getRankByExp,
  getNextRankProgress,
  checkRankUtCrossControl,
} from "@/features/rank/ranking";
import { RankBadgeIcon } from "./rank-badge-icon";
import { RankAuraGlow, getRankTheme } from "./rank-aura";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface RankRoadmapModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentExp?: number;
  currentUt?: number;
  onOpenRewardsModal?: () => void;
}

// Tóm tắt đặc quyền cốt lõi của từng rank - Chỉ dùng icon vẽ chữ trắng đen (Lucide vector line icons)
const CONDENSED_RANK_REWARDS: Record<
  number,
  {
    tagline: string;
    highlights: Array<{
      icon: React.ComponentType<{ className?: string }>;
      title: string;
      desc: string;
    }>;
    giftTierUnlocked: string;
    utRule: string;
  }
> = {
  1: {
    tagline: "Vùng đệm an toàn · Làm quen cộng đồng",
    highlights: [
      { icon: Shield, title: "Vùng đệm 30 ngày", desc: "Miễn phạt trễ dưới 15 phút" },
      { icon: Users, title: "Mở kèo tập", desc: "Tham gia nhóm 3-4 & tạo 1 kèo 1:1" },
      { icon: Coins, title: "Ví tích Xu", desc: "Xu tích lũy vào ví chờ" },
      { icon: VolumeX, title: "Quiet Mode", desc: "Tùy chọn ghép tập yên tĩnh" },
    ],
    giftTierUnlocked: "Xu tích lũy chờ mở khóa",
    utRule: "Khởi điểm 7.0 UT (Tân binh 8.0 UT)",
  },
  2: {
    tagline: "Mở Cửa hàng Quà tặng & Kích hoạt Chuỗi Đôi",
    highlights: [
      { icon: Gift, title: "Cửa hàng Đổi Quà", desc: "Đổi Voucher Tầng 1 & Tầng 2 hàng tuần" },
      { icon: Users, title: "Chuỗi Đôi (Duo)", desc: "Mở khi tập chung từ 3 buổi" },
      { icon: CalendarDays, title: "1 Thẻ Nghỉ/tháng", desc: "Giữ chuỗi không cần lý do" },
      { icon: Crown, title: "Host nhóm nhỏ", desc: "Tự tạo và dẫn dắt nhóm 3-4 người" },
    ],
    giftTierUnlocked: "Tầng 1 (F&B 10-15%) & Tầng 2 (Day-Pass Gym 50%)",
    utRule: "Yêu cầu UT ≥ 7.0 để kích hoạt đặc quyền",
  },
  3: {
    tagline: "Sáng lập Squad & Lập Lịch Định Kỳ Hàng Tuần",
    highlights: [
      { icon: Building2, title: "Sáng lập Squad", desc: "Nhóm cố định có tên & nội quy riêng" },
      { icon: Calendar, title: "Lịch định kỳ tuần", desc: "Recurring Slot tự động giữ giờ" },
      { icon: Star, title: "Verified Pacer", desc: "Huy hiệu uy tín nổi bật trên thẻ kèo" },
      { icon: Zap, title: "Tối đa 3 kèo/24h", desc: "Mở 3 kèo khi UT đạt 9–10" },
    ],
    giftTierUnlocked: "Tầng 1 & Tầng 2 (Ưu tiên đổi voucher sớm)",
    utRule: "Yêu cầu UT ≥ 7.0 (UT 5-6 đóng băng lịch tuần)",
  },
  4: {
    tagline: "Mở Kho Quà Hiện Vật & Viền Avatar Kim Loại",
    highlights: [
      { icon: Gift, title: "Kho Quà Tầng 3 & 4", desc: "Thẻ tập 100% & Hiện vật Synesis" },
      { icon: Package, title: "Hiện vật độc quyền", desc: "Bình nước Pro, Áo tập, Balo Gym" },
      { icon: Shield, title: "Viền kim loại", desc: "Tag 'Iron Core' & viền Avatar trên CLB" },
      { icon: Award, title: "Danh hiệu 0 VNĐ", desc: "Vinh danh kỷ luật thể thao bền bỉ" },
    ],
    giftTierUnlocked: "MỞ TOÀN BỘ TẦNG 1, 2, 3 & 4 (Hiện vật)",
    utRule: "Duy trì UT ≥ 7.0 để giữ nhãn hiển thị",
  },
  5: {
    tagline: "Danh Hiệu Phát Sáng & Vinh Danh Bảng Vàng",
    highlights: [
      { icon: Sparkles, title: "Synesis Vanguard", desc: "Danh hiệu phát sáng trên trang cá nhân" },
      { icon: Trophy, title: "Bảng Vàng Kỷ Luật", desc: "Tự động ghi danh CLB & toàn khu vực" },
      { icon: Zap, title: "Độ uy tín cao nhất", desc: "Ưu tiên hiển thị khi tìm bạn tập" },
      { icon: Award, title: "Vinh dự cộng đồng", desc: "Biểu tượng kiên trì hơn nửa năm" },
    ],
    giftTierUnlocked: "Mở toàn bộ Kho Quà & Suất ưu đãi vé BIB",
    utRule: "Tự hào dẫn đầu phong trào thể thao",
  },
  6: {
    tagline: "Biểu Tượng Danh Dự Tối Thượng >1 Năm Kỷ Luật",
    highlights: [
      { icon: Crown, title: "Synesis Legend", desc: "Danh hiệu vĩnh viễn tối cao của nền tảng" },
      { icon: Sparkles, title: "Hào quang Kim Cương", desc: "Hào quang đa sắc Prismatic độc quyền" },
      { icon: Flame, title: "Huyền thoại sống", desc: "Hơn 1 năm không bỏ cuộc trong thể thao" },
      { icon: HeartHandshake, title: "Đại sứ kỷ luật", desc: "Biểu tượng truyền cảm hứng cho cộng đồng" },
    ],
    giftTierUnlocked: "Đặc quyền Legend Box & Quà tri ân cá nhân hóa",
    utRule: "Vĩnh viễn lưu danh trong hệ thống",
  },
};

// 4 Tầng quà tặng đúc kết gọn gàng, trực quan
const CONDENSED_REWARD_TIERS = [
  {
    tier: 1,
    title: "Tầng 1: Giải Nhiệt F&B",
    cost: "100 EXP · 300–500 Xu",
    unlockRank: "Mở từ Cấp 2",
    badgeColor: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    icon: Coffee,
    summary: "Voucher giảm 10%–15% hoặc tặng topping/nước khoáng quanh điểm tập.",
  },
  {
    tier: 2,
    title: "Tầng 2: Thẻ Tập & InBody",
    cost: "200–300 EXP · 800–1.200 Xu",
    unlockRank: "Mở từ Cấp 2",
    badgeColor: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    icon: Dumbbell,
    summary: "Mã giảm 50% Day-Pass phòng Gym, phiếu đo chỉ số InBody miễn phí.",
  },
  {
    tier: 3,
    title: "Tầng 3: Thẻ Tập 100% & Dinh Dưỡng",
    cost: "500–800 EXP · 1.500–2.500 Xu",
    unlockRank: "Mở từ Cấp 4",
    badgeColor: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
    icon: Zap,
    summary: "Vé Gym/Calisthenics 1 ngày Free 100%, Sample Whey/Gel chạy bộ.",
  },
  {
    tier: 4,
    title: "Tầng 4: Hiện Vật Độc Quyền Synesis",
    cost: "1.000+ EXP · 3.500–6.000 Xu",
    unlockRank: "Mở từ Cấp 4",
    badgeColor: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    icon: Package,
    summary: "Bình nước thể thao, Áo tập Performance Tee, Balo Duffel giao tận nhà.",
  },
];

export function RankRoadmapModal({
  isOpen,
  onClose,
  currentExp = 1240,
  currentUt = 8.5,
  onOpenRewardsModal,
}: RankRoadmapModalProps) {
  const [selectedRankLevel, setSelectedRankLevel] = React.useState<number>(2);
  const [activeTab, setActiveTab] = React.useState<"roadmap" | "how-to-earn" | "perks">("roadmap");

  const { currentRank, nextRank, remainingExp, progressPercent } = React.useMemo(() => {
    return getNextRankProgress(currentExp);
  }, [currentExp]);

  const utCrossCheck = React.useMemo(() => {
    return checkRankUtCrossControl(currentRank.level, currentUt);
  }, [currentRank.level, currentUt]);

  React.useEffect(() => {
    if (isOpen) {
      setSelectedRankLevel(currentRank.level);
    }
  }, [isOpen, currentRank.level]);

  if (!isOpen) return null;

  const inspectRank = RANK_LEVELS[selectedRankLevel - 1] ?? currentRank;
  const inspectData = (CONDENSED_RANK_REWARDS[inspectRank.level] ?? CONDENSED_RANK_REWARDS[1])!;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="bg-card border border-border w-full max-w-lg rounded-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* 1. MODAL HEADER - TINH GỌN */}
        <div className="px-4 py-3 border-b border-border/80 flex items-center justify-between shrink-0 bg-muted/20">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-brand/10 text-brand flex items-center justify-center shrink-0">
              <Award className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-foreground tracking-tight">
                Lộ Trình Rank & Điểm Thưởng EXP
              </h2>
              <p className="text-caption text-muted-foreground">Tích lũy 1 chiều · Giữ nhịp kỷ luật</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng"
            className="p-1.5 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-all"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* 2. CURRENT EXP PROGRESS HERO - GỌN GÀNG, ĐẸP MẮT & MÀU LOAN THEO RANK */}
        <div className="p-3.5 bg-gradient-to-b from-brand/10 via-brand/5 to-transparent border-b border-border/60 shrink-0 space-y-2.5 relative overflow-hidden">
          <RankAuraGlow level={currentRank.level} variant="top-aurora" />
          <RankAuraGlow level={currentRank.level} variant="corner-orb" />

          <div className="flex items-center gap-3 relative z-10">
            <div className="shrink-0">
              <RankBadgeIcon
                level={currentRank.level as 1 | 2 | 3 | 4 | 5 | 6}
                size="md"
                showAura
                animated
              />
            </div>

            <div className="flex-1 min-w-0 space-y-0.5">
              <div className="flex items-center gap-1.5">
                <span className="text-micro font-bold text-brand uppercase tracking-wider">
                  Cấp Hiện Tại
                </span>
                <span className={cn("text-micro font-bold px-2 py-0.2 rounded-full", getRankTheme(currentRank.level).pillClass)}>
                  {currentRank.nameEn}
                </span>
              </div>
              <h3 className="text-sm font-extrabold text-foreground truncate">
                Cấp {currentRank.level} · {currentRank.nameVi}
              </h3>
              <p className="text-caption text-muted-foreground">
                Chuẩn: {currentRank.timeToAchieve.split("(")[0]}
              </p>
            </div>

            <div className="text-right shrink-0">
              <p className={cn("text-xs font-numeric font-black", getRankTheme(currentRank.level).textClass)}>
                {currentExp.toLocaleString("vi-VN")} EXP
              </p>
              {nextRank && (
                <p className="text-caption text-muted-foreground">
                  Thiếu {remainingExp.toLocaleString("vi-VN")} EXP
                </p>
              )}
            </div>
          </div>

          {/* Compact Progress Bar */}
          <div className="space-y-1 relative z-10">
            <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
              <div
                className={cn("h-full rounded-full transition-all duration-500 bg-gradient-to-r", getRankTheme(currentRank.level).progressGradient)}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-caption text-muted-foreground">
              <span>Tiến độ: <strong>{progressPercent}%</strong></span>
              <span>{nextRank ? `Lên Cấp ${nextRank.level} · ${nextRank.nameVi}` : "Đạt cấp tối đa"}</span>
            </div>
          </div>

          {/* One-Line UT Indicator */}
          <div className="flex items-center justify-between px-2.5 py-1.5 rounded-xl bg-background/80 border border-border/60 text-caption relative z-10">
            <div className="flex items-center gap-1.5 text-foreground">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
              <span>Uy tín: <strong>{currentUt.toFixed(1)}/10 UT</strong> ({utCrossCheck.statusLabel})</span>
            </div>
            <span className="text-micro font-semibold text-emerald-600 dark:text-emerald-400">
              {utCrossCheck.isPrivilegeActive ? "✓ Đủ chuẩn UT ≥ 7" : "Hạn chế"}
            </span>
          </div>
        </div>

        {/* 3. TABS NAVIGATION */}
        <div className="flex items-center gap-1 px-4 py-1.5 border-b border-border/60 shrink-0 bg-background">
          <button
            type="button"
            onClick={() => setActiveTab("roadmap")}
            className={cn(
              "flex-1 py-1.5 rounded-xl text-xs font-bold transition-all text-center",
              activeTab === "roadmap" ? "bg-brand text-white shadow-2xs" : "text-muted-foreground hover:bg-muted"
            )}
          >
            Lộ trình 6 Rank
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("perks")}
            className={cn(
              "flex-1 py-1.5 rounded-xl text-xs font-bold transition-all text-center",
              activeTab === "perks" ? "bg-brand text-white shadow-2xs" : "text-muted-foreground hover:bg-muted"
            )}
          >
            Kho Quà Đổi EXP
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("how-to-earn")}
            className={cn(
              "flex-1 py-1.5 rounded-xl text-xs font-bold transition-all text-center",
              activeTab === "how-to-earn" ? "bg-brand text-white shadow-2xs" : "text-muted-foreground hover:bg-muted"
            )}
          >
            Cách Kiếm EXP
          </button>
        </div>

        {/* 4. TAB CONTENTS */}
        <div className="flex-1 overflow-y-auto p-3.5 space-y-3">
          
          {/* ================= TAB 1: ROADMAP 6 RANK ================= */}
          {activeTab === "roadmap" && (
            <div className="space-y-3">
              {/* 6 Rank Badges Horizontal Picker */}
              <div className="grid grid-cols-6 gap-1 p-1.5 rounded-2xl bg-muted/40 border border-border/60">
                {RANK_LEVELS.map((r) => {
                  const isCurrent = r.level === currentRank.level;
                  const isSelected = r.level === selectedRankLevel;
                  const isAchieved = currentExp >= r.minExp;
                  const rTheme = getRankTheme(r.level);

                  return (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setSelectedRankLevel(r.level)}
                      className={cn(
                        "flex flex-col items-center gap-1 py-1.5 px-0.5 rounded-xl transition-all relative",
                        isSelected
                          ? "bg-card border-2 shadow-xs scale-105"
                          : "hover:bg-muted/70 opacity-75 hover:opacity-100",
                        !isAchieved && "grayscale-50"
                      )}
                      style={
                        isSelected
                          ? {
                              borderColor: rTheme.primaryColor,
                              boxShadow: `0 0 16px -3px ${rTheme.auraRgba}`,
                            }
                          : undefined
                      }
                    >
                      <RankBadgeIcon
                        level={r.level as 1 | 2 | 3 | 4 | 5 | 6}
                        size="xs"
                        showAura={isSelected}
                      />
                      <span className={cn("text-micro font-bold", isSelected ? rTheme.textClass : "text-foreground")}>
                        Cấp {r.level}
                      </span>
                      {isCurrent && (
                        <span className="absolute -top-1 -right-0.5 h-2 w-2 rounded-full bg-brand ring-2 ring-background animate-pulse" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Inspected Rank Detail Card - Đúc kết ngắn gọn & Màu loan rực rỡ */}
              {(() => {
                const inspectTheme = getRankTheme(inspectRank.level);
                return (
                  <div
                    className={cn(
                      "rounded-2xl border bg-card p-3.5 shadow-xs space-y-3 relative overflow-hidden transition-all duration-500",
                      inspectTheme.borderClass
                    )}
                  >
                    {/* Hiệu ứng màu loan đa tầng theo đúng màu sắc từng Rank */}
                    <RankAuraGlow level={inspectRank.level} variant="dual-mesh" />

                    <div className="flex items-center gap-3 relative z-10">
                      <RankBadgeIcon
                        level={inspectRank.level as 1 | 2 | 3 | 4 | 5 | 6}
                        size="md"
                        showAura
                        animated
                      />

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className={cn("text-caption font-bold uppercase", inspectTheme.textClass)}>
                            Rank {inspectRank.level}: {inspectRank.nameEn}
                          </span>
                          {currentExp >= inspectRank.minExp ? (
                            <span className="text-micro font-bold text-emerald-600 bg-emerald-500/10 px-1.5 py-0.2 rounded-full flex items-center gap-1">
                              <Check className="h-2.5 w-2.5 stroke-[2.5]" />
                              <span>Đã đạt</span>
                            </span>
                          ) : (
                            <span className="text-micro font-bold text-muted-foreground bg-muted px-1.5 py-0.2 rounded-full flex items-center gap-1">
                              <Lock className="h-2.5 w-2.5 stroke-[2]" />
                              <span>Cần {inspectRank.minExp.toLocaleString("vi-VN")} EXP</span>
                            </span>
                          )}
                        </div>
                        <h4 className="text-sm font-extrabold text-foreground">
                          {inspectRank.nameVi}{" "}
                          <span className="text-xs font-normal text-muted-foreground">
                            ({inspectTheme.metalName})
                          </span>
                        </h4>
                        <p className="text-caption text-muted-foreground">
                          {inspectData.tagline}
                        </p>
                      </div>
                    </div>

                    {/* 4 Feature Chips (2x2 Grid) - Chỉ dùng icon vẽ chữ trắng đen */}
                    <div className="grid grid-cols-2 gap-2 relative z-10">
                      {inspectData.highlights.map((h, i) => {
                        const IconComponent = h.icon;
                        return (
                          <div
                            key={i}
                            className={cn(
                              "p-2.5 rounded-xl bg-card/90 backdrop-blur-xs border space-y-1 transition-all",
                              inspectTheme.borderClass,
                              "hover:scale-[1.01]"
                            )}
                          >
                            <div className="flex items-center gap-1.5">
                              <div className="w-5 h-5 rounded-md bg-foreground/10 border border-border flex items-center justify-center text-foreground shrink-0">
                                <IconComponent className="h-3 w-3 stroke-[2] text-foreground" />
                              </div>
                              <span className="text-xs font-bold text-foreground truncate">{h.title}</span>
                            </div>
                            <p className="text-caption text-muted-foreground leading-tight">
                              {h.desc}
                            </p>
                          </div>
                        );
                      })}
                    </div>

                    {/* Status Bar: Kho quà & Điều kiện UT - Icon vẽ chữ trắng đen */}
                    <div className="pt-2 border-t border-border/60 space-y-1.5 text-caption relative z-10">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground flex items-center gap-1.5">
                          <Gift className="h-3.5 w-3.5 stroke-[2] text-foreground shrink-0" />
                          <span>Quà mở khóa:</span>
                        </span>
                        <strong className="text-foreground text-right">{inspectData.giftTierUnlocked}</strong>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground flex items-center gap-1.5">
                          <ShieldCheck className="h-3.5 w-3.5 stroke-[2] text-foreground shrink-0" />
                          <span>Điều kiện UT:</span>
                        </span>
                        <strong className={cn("text-right", inspectTheme.textClass)}>{inspectData.utRule}</strong>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* ================= TAB 2: KHO QUÀ ĐỔI EXP ================= */}
          {activeTab === "perks" && (
            <div className="space-y-2.5">
              <div className="grid grid-cols-1 gap-2">
                {CONDENSED_REWARD_TIERS.map((tier) => {
                  const Icon = tier.icon;
                  return (
                    <div
                      key={tier.tier}
                      className="p-3 rounded-2xl bg-card border border-border flex items-start gap-3 shadow-2xs hover:border-brand/40 transition-all"
                    >
                      <div className="w-9 h-9 rounded-xl bg-brand/10 text-brand flex items-center justify-center shrink-0">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center justify-between gap-1">
                          <h5 className="text-xs font-bold text-foreground truncate">{tier.title}</h5>
                          <span className={cn("text-micro font-bold px-2 py-0.5 rounded-full border shrink-0", tier.badgeColor)}>
                            {tier.unlockRank}
                          </span>
                        </div>
                        <p className="text-caption text-muted-foreground leading-snug">
                          {tier.summary}
                        </p>
                        <p className="text-caption font-numeric font-semibold text-brand">
                          Mức đổi: {tier.cost}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {onOpenRewardsModal && (
                <Button
                  onClick={() => {
                    onClose();
                    onOpenRewardsModal();
                  }}
                  className="w-full py-2.5 rounded-xl bg-brand hover:bg-brand-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <Gift className="h-4 w-4" />
                  <span>Vào Cửa Hàng Đổi Quà (Xu & EXP)</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          )}

          {/* ================= TAB 3: CÁCH KIẾM EXP ================= */}
          {activeTab === "how-to-earn" && (
            <div className="space-y-2.5">
              {/* 3 Thẻ công thức ngắn gọn */}
              <div className="p-3 rounded-2xl bg-card border border-border flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center font-black text-sm shrink-0">
                  +100
                </div>
                <div className="flex-1 text-xs">
                  <p className="font-bold text-foreground">Buổi tập hợp lệ</p>
                  <p className="text-caption text-muted-foreground">Tối đa 3 buổi/tuần = 300 EXP (nghỉ ngơi phục hồi)</p>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-card border border-border flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-black text-sm shrink-0">
                  +50
                </div>
                <div className="flex-1 text-xs">
                  <p className="font-bold text-foreground">Duy trì Chuỗi Tuần (Weekly Streak)</p>
                  <p className="text-caption text-muted-foreground">Có ít nhất 1 buổi hợp lệ từ Thứ 2 đến Chủ Nhật</p>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-card border border-border flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center font-black text-sm shrink-0">
                  +50
                </div>
                <div className="flex-1 text-xs">
                  <p className="font-bold text-foreground">Chuỗi Đôi (Duo) hoặc Host nhóm</p>
                  <p className="text-caption text-muted-foreground">Tập cùng partner Duo (+10 EXP/buổi) hoặc dẫn dắt nhóm nhỏ</p>
                </div>
              </div>

              {/* Tốc độ chuẩn */}
              <div className="p-3 rounded-2xl bg-muted/40 border border-border/80 text-center space-y-1">
                <p className="text-caption text-muted-foreground">Tốc độ cày chuẩn (3 buổi/tuần):</p>
                <p className="text-sm font-extrabold text-brand font-numeric">
                  350 – 400 EXP / tuần &nbsp;(≈ 1.500 EXP / tháng)
                </p>
              </div>

              {/* Cam kết 1 chiều */}
              <div className="p-2.5 rounded-xl bg-background border border-border/60 flex items-center gap-2 text-caption text-muted-foreground">
                <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />
                <span>EXP tích lũy <strong>1 chiều</strong>, không bao giờ mất khi nghỉ ốm, không mua bằng tiền.</span>
              </div>
            </div>
          )}

        </div>

        {/* 5. MODAL FOOTER */}
        <div className="p-3 border-t border-border/80 bg-muted/20 shrink-0 flex items-center justify-between text-xs">
          <span className="text-caption text-muted-foreground">
            Khả dụng: <strong className="text-brand font-numeric">{currentExp.toLocaleString("vi-VN")} EXP</strong>
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            className="rounded-xl text-xs h-8 px-4"
          >
            Đóng
          </Button>
        </div>

      </div>
    </div>
  );
}
