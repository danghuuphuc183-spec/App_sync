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
  Info,
  Calendar,
  Clock,
  TrendingUp,
} from "lucide-react";
import {
  RANK_LEVELS,
  RankLevel,
  getRankByExp,
  getNextRankProgress,
  checkRankUtCrossControl,
} from "@/features/rank/ranking";
import { RankBadgeIcon } from "./rank-badge-icon";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface RankRoadmapModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentExp?: number;
  currentUt?: number;
  onOpenRewardsModal?: () => void;
}

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

  // Set selected rank initially to user's current rank
  React.useEffect(() => {
    if (isOpen) {
      setSelectedRankLevel(currentRank.level);
    }
  }, [isOpen, currentRank.level]);

  if (!isOpen) return null;

  const inspectRank = RANK_LEVELS[selectedRankLevel - 1] ?? currentRank;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="bg-card border border-border w-full max-w-lg rounded-3xl shadow-2xl flex flex-col max-h-[94vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* 1. MODAL HEADER */}
        <div className="relative px-4 py-3.5 border-b border-border/80 flex items-center justify-between shrink-0 bg-muted/20">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-brand/10 dark:bg-brand/20 text-brand dark:text-brand-sky flex items-center justify-center shrink-0">
              <Award className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-foreground tracking-tight flex items-center gap-1.5">
                <span>Hành Trình EXP & 6 Bậc Rank</span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-brand/10 text-brand">
                  Master Spec III.9
                </span>
              </h2>
              <p className="text-[11px] text-muted-foreground">Tích lũy 1 chiều · Giữ nhịp kỷ luật · Mở khóa đặc quyền</p>
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

        {/* 2. CURRENT RANK HERO BANNER */}
        <div className="p-4 bg-linear-to-b from-brand/15 via-brand/5 to-transparent border-b border-border/60 shrink-0 space-y-3">
          <div className="flex items-center gap-3.5">
            {/* Badge Icon with Aura */}
            <div className="shrink-0 p-1">
              <RankBadgeIcon
                level={currentRank.level as 1 | 2 | 3 | 4 | 5 | 6}
                size="md"
                showAura
                animated
              />
            </div>

            {/* Info and Titles */}
            <div className="flex-1 min-w-0 space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-brand uppercase tracking-wider">
                  Cấp Hiện Tại
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-brand/10 text-brand dark:text-brand-sky">
                  {currentRank.nameEn}
                </span>
              </div>
              <h3 className="text-base font-black text-foreground tracking-tight truncate">
                Cấp {currentRank.level} · {currentRank.nameVi}
              </h3>
              <p className="text-xs text-muted-foreground truncate">
                Thời gian đạt chuẩn: {currentRank.timeToAchieve.split("(")[0]}
              </p>
            </div>
          </div>

          {/* Progress Bar & Next Level Indicator */}
          <div className="space-y-1.5 bg-background/80 dark:bg-background/50 rounded-2xl p-3 border border-border/60">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-foreground">
                {currentExp.toLocaleString("vi-VN")} / {nextRank ? nextRank.minExp.toLocaleString("vi-VN") : "MAX"} EXP
              </span>
              <span className="text-xs font-semibold text-brand">
                {progressPercent}%
              </span>
            </div>

            <div className="w-full h-2 rounded-full bg-muted overflow-hidden relative">
              <div
                className="h-full bg-linear-to-r from-brand via-brand-sky to-cyan-400 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-0.5">
              {nextRank ? (
                <>
                  <span>Mục tiêu: <strong>{nextRank.badgeTitle}</strong></span>
                  <span className="text-foreground font-semibold">Còn {remainingExp.toLocaleString("vi-VN")} EXP</span>
                </>
              ) : (
                <span className="text-emerald-500 font-bold">Bạn đã đạt Rank Huyền Thoại Tối Thượng!</span>
              )}
            </div>
          </div>

          {/* Trust Score (UT) Cross-Check Status */}
          <div className={cn(
            "flex items-start gap-2 p-2.5 rounded-xl border text-xs leading-snug",
            utCrossCheck.isPrivilegeActive
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300"
              : utCrossCheck.isRestricted
              ? "bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-300"
              : "bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-300"
          )}>
            {utCrossCheck.isPrivilegeActive ? (
              <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-500 mt-0.5" />
            ) : (
              <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              <p className="font-bold">
                Kiểm soát chéo Uy Tín: {currentUt.toFixed(1)}/10 UT ({utCrossCheck.statusLabel})
              </p>
              <p className="text-[11px] opacity-90">
                {utCrossCheck.isPrivilegeActive
                  ? "Đạt chuẩn UT ≥ 7.0: Toàn bộ đặc quyền công cụ Cấp 2 đang hoạt động đầy đủ."
                  : utCrossCheck.reason}
              </p>
            </div>
          </div>
        </div>

        {/* 3. TABS FILTER */}
        <div className="flex items-center gap-1 px-4 py-2 border-b border-border/60 shrink-0 bg-background overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveTab("roadmap")}
            className={cn(
              "px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5",
              activeTab === "roadmap" ? "bg-brand text-white shadow-xs" : "text-muted-foreground hover:bg-muted"
            )}
          >
            <TrendingUp className="h-3.5 w-3.5" />
            <span>Lộ trình 6 bậc Rank</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("how-to-earn")}
            className={cn(
              "px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5",
              activeTab === "how-to-earn" ? "bg-brand text-white shadow-xs" : "text-muted-foreground hover:bg-muted"
            )}
          >
            <Zap className="h-3.5 w-3.5" />
            <span>Bí kíp cày EXP & Luật chuỗi</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("perks")}
            className={cn(
              "px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5",
              activeTab === "perks" ? "bg-brand text-white shadow-xs" : "text-muted-foreground hover:bg-muted"
            )}
          >
            <Gift className="h-3.5 w-3.5" />
            <span>Đổi thưởng & Hiện vật</span>
          </button>
        </div>

        {/* 4. TAB CONTENTS (SCROLLABLE) */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          
          {/* ================= TAB 1: ROADMAP ================= */}
          {activeTab === "roadmap" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="font-semibold">Bấm vào từng bậc để xem quyền lợi mở khóa:</span>
                <span className="text-[11px] font-mono">6 Mức Huy Hiệu</span>
              </div>

              {/* 6 Rank Badges Horizontal Selector */}
              <div className="grid grid-cols-6 gap-1.5 p-2 rounded-2xl bg-muted/40 border border-border/60">
                {RANK_LEVELS.map((r) => {
                  const isCurrent = r.level === currentRank.level;
                  const isSelected = r.level === selectedRankLevel;
                  const isAchieved = currentExp >= r.minExp;

                  return (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setSelectedRankLevel(r.level)}
                      className={cn(
                        "flex flex-col items-center gap-1 py-1.5 px-1 rounded-xl transition-all relative",
                        isSelected
                          ? "bg-card border-2 border-brand shadow-sm scale-105"
                          : "hover:bg-muted/70 opacity-80 hover:opacity-100",
                        !isAchieved && "grayscale-40"
                      )}
                    >
                      <RankBadgeIcon
                        level={r.level as 1 | 2 | 3 | 4 | 5 | 6}
                        size="xs"
                        showAura={isSelected}
                      />
                      <span className="text-[10px] font-bold text-foreground truncate max-w-full">
                        Cấp {r.level}
                      </span>
                      {isCurrent && (
                        <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-brand ring-2 ring-background animate-pulse" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Detailed Card for Inspected Rank */}
              <div className="rounded-3xl border border-border bg-card p-4 shadow-sm space-y-3.5 relative overflow-hidden">
                <div
                  className="absolute -top-12 -right-12 w-36 h-36 rounded-full blur-2xl opacity-20 pointer-events-none"
                  style={{ backgroundColor: inspectRank.theme.primaryColor }}
                />

                <div className="flex items-start gap-3.5">
                  <RankBadgeIcon
                    level={inspectRank.level as 1 | 2 | 3 | 4 | 5 | 6}
                    size="lg"
                    showAura
                  />

                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs font-extrabold uppercase px-2 py-0.5 rounded-full bg-brand/10 text-brand">
                        Rank {inspectRank.level}: {inspectRank.nameEn}
                      </span>
                      {currentExp >= inspectRank.minExp ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="h-3 w-3" />
                          <span>Đã đạt</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                          <Lock className="h-3 w-3" />
                          <span>Cần {inspectRank.minExp.toLocaleString("vi-VN")} EXP</span>
                        </span>
                      )}
                    </div>

                    <h4 className="text-base font-black text-foreground">
                      {inspectRank.nameVi}
                    </h4>

                    <p className="text-xs text-muted-foreground">
                      <strong>Mốc EXP:</strong> {inspectRank.minExp.toLocaleString("vi-VN")} – {inspectRank.maxExp === Infinity ? "Trở lên" : `${inspectRank.maxExp.toLocaleString("vi-VN")} EXP`}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      <strong>Thời gian đạt:</strong> {inspectRank.timeToAchieve}
                    </p>
                  </div>
                </div>

                {/* Section: Privileges & Unlocks */}
                <div className="space-y-2 pt-2 border-t border-border/60">
                  <h5 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-brand" />
                    <span>Quyền lợi mở khóa chi tiết:</span>
                  </h5>

                  <ul className="space-y-1.5">
                    {inspectRank.perks.map((perk, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs text-foreground/90 leading-relaxed">
                        <span className="h-1.5 w-1.5 rounded-full bg-brand shrink-0 mt-1.5" />
                        <span>{perk}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Tool limits breakdown */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/60 text-xs">
                  <div className="p-2.5 rounded-xl bg-muted/40 border border-border/60 space-y-1">
                    <span className="text-[11px] text-muted-foreground">Giới hạn kèo mở</span>
                    <p className="font-bold text-foreground">
                      Tối đa {inspectRank.tools.maxOpenKeos} kèo / 24h
                    </p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-muted/40 border border-border/60 space-y-1">
                    <span className="text-[11px] text-muted-foreground">Kèo nhóm & Squad</span>
                    <p className="font-bold text-foreground">
                      {inspectRank.tools.permanentSquad ? "Mở khóa Squad & Lịch tuần" : `Nhóm tối đa ${inspectRank.tools.maxGroupSize} người`}
                    </p>
                  </div>
                </div>

                {/* Cross-check alert note */}
                <div className="p-2.5 rounded-xl bg-background/80 border border-border/80 text-[11px] text-muted-foreground space-y-0.5">
                  <p className="font-semibold text-foreground">
                    🛡️ Nguyên tắc kiểm soát chéo Điểm Uy Tín (UT):
                  </p>
                  <p>
                    Đặc quyền Cấp 2 và Cấp 3 yêu cầu <strong>UT ≥ 7.0</strong> để kích hoạt. Nếu UT giảm xuống 5–6, quyền tạo lịch định kỳ bị tạm đóng băng (tối đa 1 kèo/24h).
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB 2: HOW TO EARN EXP ================= */}
          {activeTab === "how-to-earn" && (
            <div className="space-y-3.5">
              <div className="p-3.5 rounded-2xl bg-linear-to-r from-brand/10 to-transparent border border-brand/20 space-y-1">
                <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Zap className="h-4 w-4 text-brand" />
                  <span>Nguyên Lý Tích Lũy EXP Một Chiều</span>
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  EXP là thước đo thâm niên thể thao bền bỉ. <strong>Chỉ cộng thêm khi hoàn thành buổi tập hợp lệ, không bao giờ bị trừ khi nghỉ ốm hay hủy kèo</strong>, và tuyệt đối không thể mua bằng tiền.
                </p>
              </div>

              {/* 3 Pillars of Earning */}
              <div className="space-y-2.5">
                <div className="p-3 rounded-2xl bg-card border border-border flex items-start gap-3 shadow-2xs">
                  <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0 font-bold text-sm">
                    +100
                  </div>
                  <div className="flex-1 text-xs space-y-0.5">
                    <p className="font-bold text-foreground">Buổi tập hợp lệ (1-1, Nhóm 3-4, Sự kiện CLB)</p>
                    <p className="text-muted-foreground">
                      Cộng +100 EXP/buổi. Áp dụng trần tối đa <strong>3 buổi nhận EXP/tuần = 300 EXP/tuần</strong> để khuyến khích cơ thể nghỉ ngơi phục hồi.
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-card border border-border flex items-start gap-3 shadow-2xs">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0 font-bold text-sm">
                    +50
                  </div>
                  <div className="flex-1 text-xs space-y-0.5">
                    <p className="font-bold text-foreground">Duy trì Chuỗi Tuần (Weekly Streak)</p>
                    <p className="text-muted-foreground">
                      Cộng +50 EXP/tuần khi hoàn thành ít nhất 1 buổi tập hợp lệ trong tuần (Thứ Hai đến Chủ Nhật).
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-card border border-border flex items-start gap-3 shadow-2xs">
                  <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center shrink-0 font-bold text-sm">
                    +50
                  </div>
                  <div className="flex-1 text-xs space-y-0.5">
                    <p className="font-bold text-foreground">Chuỗi Đôi (Duo Streak) hoặc Host nhóm</p>
                    <p className="text-muted-foreground">
                      Cộng +50 EXP/tuần khi tập cùng bạn tập Duo hoặc tự đứng ra làm Host cho nhóm nhỏ 3-4 người (+10 EXP/buổi Duo, tối đa 3 Duo).
                    </p>
                  </div>
                </div>
              </div>

              {/* Standard Pace Card */}
              <div className="p-3.5 rounded-2xl bg-muted/40 border border-border/80 text-xs space-y-1.5">
                <h5 className="font-bold text-foreground flex items-center gap-1.5">
                  <TrendingUp className="h-4 w-4 text-brand" />
                  <span>Tốc Độ Cày Chuẩn (Nhịp Sinh Hoạt Đô Thị)</span>
                </h5>
                <p className="text-muted-foreground leading-relaxed">
                  Một hội viên tập luyện đều đặn 3 buổi/tuần sẽ tích lũy:
                </p>
                <div className="p-2.5 rounded-xl bg-background border border-border font-mono text-center text-brand font-bold text-sm">
                  350 – 400 EXP / tuần &nbsp;≈&nbsp; 1.500 EXP / tháng
                </div>
              </div>

              {/* Duo Streak & Freeze Rules */}
              <div className="p-3.5 rounded-2xl bg-muted/40 border border-border/80 text-xs space-y-2">
                <h5 className="font-bold text-foreground flex items-center gap-1.5">
                  <Flame className="h-4 w-4 text-amber-500" />
                  <span>Quy Tắc Chuỗi Đôi (Duo Streak) & Thẻ Nghỉ</span>
                </h5>
                <ul className="space-y-1 text-muted-foreground leading-relaxed list-disc list-inside">
                  <li><strong>Mở khóa từ Cấp 2:</strong> Hai người có từ 3 buổi hợp lệ chung sẽ kích hoạt Chuỗi Đôi.</li>
                  <li><strong>2 Lá chắn/tháng:</strong> Tự động kích hoạt giữ chuỗi nếu tuần trôi qua chưa kịp hẹn.</li>
                  <li><strong>1 Thẻ Nghỉ/tháng:</strong> Không cần khai báo lý do khi bạn ốm, thi cử hoặc công tác.</li>
                </ul>
              </div>
            </div>
          )}

          {/* ================= TAB 3: PERKS & REWARDS ================= */}
          {activeTab === "perks" && (
            <div className="space-y-3.5">
              <div className="p-3.5 rounded-2xl bg-linear-to-r from-amber-500/10 via-brand/5 to-transparent border border-amber-500/20 space-y-1">
                <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Gift className="h-4 w-4 text-amber-500" />
                  <span>Danh Mục Phần Thưởng Đổi Từ EXP & Xu</span>
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Đổi quà giải nhiệt hàng tuần, voucher dinh dưỡng và các hiện vật độc quyền in hình Synesis.
                </p>
              </div>

              <div className="space-y-2.5">
                <div className="p-3 rounded-2xl bg-card border border-border text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-foreground">Tầng 1: Giải Nhiệt Hàng Tuần (300–500 Xu / 100 EXP)</span>
                    <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                      Mở từ Cấp 2
                    </span>
                  </div>
                  <p className="text-muted-foreground">
                    Voucher giảm 10%–15% hoặc tặng thêm topping/nước suối tại quán cà phê, sinh tố, đồ ăn lành mạnh quanh khu vực tập.
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-card border border-border text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-foreground">Tầng 2: Thẻ Tập & Dịch Vụ Cơ Bản (800–1.200 Xu / 200–300 EXP)</span>
                    <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                      Mở từ Cấp 2
                    </span>
                  </div>
                  <p className="text-muted-foreground">
                    Mã giảm 50% Vé tập lẻ 1 ngày (Drop-in pass), phiếu đo InBody miễn phí, bột điện giải hoặc thanh năng lượng dùng thử.
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-card border border-border text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-foreground">Tầng 3: Thẻ Tập 100% & Dinh Dưỡng (1.500–2.500 Xu / 500–800 EXP)</span>
                    <span className="text-[10px] font-semibold text-purple-600 bg-purple-500/10 px-2 py-0.5 rounded-full">
                      Mở từ Cấp 4 (Iron Core)
                    </span>
                  </div>
                  <p className="text-muted-foreground">
                    Thẻ tập Gym/Calisthenics 1 ngày miễn phí 100%, gói Sample Whey Protein, Creatine hoặc Gel chạy bộ chính hãng.
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-card border border-border text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-foreground">Tầng 4: Hiện Vật Độc Quyền Synesis (3.500–6.000 Xu / 1.000+ EXP)</span>
                    <span className="text-[10px] font-semibold text-purple-600 bg-purple-500/10 px-2 py-0.5 rounded-full">
                      Mở từ Cấp 4 (Iron Core)
                    </span>
                  </div>
                  <p className="text-muted-foreground">
                    Bình nước thể thao Synesis Pro, Áo tập thể thao Performance Tee, Túi trống Gym Duffel Pro giao tận nhà miễn phí.
                  </p>
                </div>
              </div>

              {/* Action Button to Open Gift Shop */}
              {onOpenRewardsModal && (
                <Button
                  onClick={() => {
                    onClose();
                    onOpenRewardsModal();
                  }}
                  className="w-full py-2.5 rounded-xl bg-brand hover:bg-brand-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs"
                >
                  <Gift className="h-4 w-4" />
                  <span>Vào Cửa Hàng Đổi Thưởng Ngay</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          )}

        </div>

        {/* 5. MODAL FOOTER */}
        <div className="p-3 border-t border-border/80 bg-muted/20 shrink-0 flex items-center justify-between text-xs">
          <span className="text-muted-foreground">
            EXP Khả Dụng: <strong className="text-brand">{currentExp.toLocaleString("vi-VN")} EXP</strong>
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            className="rounded-xl text-xs h-8"
          >
            Đóng
          </Button>
        </div>

      </div>
    </div>
  );
}
