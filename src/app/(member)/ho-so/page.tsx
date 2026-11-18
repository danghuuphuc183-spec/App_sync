"use client";

import * as React from "react";
import Link from "next/link";
import {
  Share2,
  Settings,
  Sun,
  Eye,
  Calendar,
  Zap,
  Users,
  Coins,
  ChevronRight,
  LayoutGrid,
  List,
  Plus,
  QrCode,
  ShieldCheck,
  ShieldAlert,
  Shield,
  Edit3,
  Camera,
  X,
  Check,
  MapPin,
  Lock,
  Dumbbell,
  Activity,
  Flame,
  Award,
  Clock,
} from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { LogWorkoutSheet } from "@/components/activity/log-workout-sheet";
import { TrainingLog } from "@/components/profile/training-log";
import { RewardsModal } from "@/components/profile/rewards-modal";
import { RankRoadmapModal } from "@/components/profile/rank-roadmap-modal";
import { RankBadgeIcon } from "@/components/profile/rank-badge-icon";
import { RankAuraGlow, RankPill, getRankTheme } from "@/components/profile/rank-aura";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// PRESET AVATARS FOR ATHLETES
const PRESET_AVATARS = [
  { id: "av-1", label: "Runner Nữ", url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=350&auto=format&fit=crop&q=80" },
  { id: "av-2", label: "Yoga & Stretching", url: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=350&auto=format&fit=crop&q=80" },
  { id: "av-3", label: "Runner Nam", url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=350&auto=format&fit=crop&q=80" },
  { id: "av-4", label: "Gym & Kháng Lực", url: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=350&auto=format&fit=crop&q=80" },
  { id: "av-5", label: "Marathoner Bền Bỉ", url: "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=350&auto=format&fit=crop&q=80" },
  { id: "av-6", label: "Vận Động Viên Đa Năng", url: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=350&auto=format&fit=crop&q=80" },
];

export default function ProfilePage() {
  const { user, updateProfile } = useAuth();

  // Active Tab
  type ProfileTab = "posts" | "keo" | "badges" | "buddies";
  const [activeTab, setActiveTab] = React.useState<ProfileTab>("posts");
  const [viewMode, setViewMode] = React.useState<"grid" | "list">("grid");

  // Modals state
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = React.useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = React.useState(false);
  const [isTrustRulesOpen, setIsTrustRulesOpen] = React.useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = React.useState(false);
  const [isCoinsModalOpen, setIsCoinsModalOpen] = React.useState(false);
  const [isRankRoadmapOpen, setIsRankRoadmapOpen] = React.useState(false);
  const [isNewPostModalOpen, setIsNewPostModalOpen] = React.useState(false);
  const [copiedLink, setCopiedLink] = React.useState(false);
  const [qrCountdown, setQrCountdown] = React.useState(30);
  const [isClubLeader, setIsClubLeader] = React.useState(true); // Trưởng CLB / BQL Gym vs Thành viên thường

  // Dark mode toggle
  const [isDarkMode, setIsDarkMode] = React.useState(false);
  React.useEffect(() => {
    setIsDarkMode(document.documentElement.classList.contains("dark"));
  }, []);

  const toggleTheme = () => {
    const isDark = document.documentElement.classList.toggle("dark");
    setIsDarkMode(isDark);
  };

  // User Profile Data - Defaults to Minh Thư matching mockup or current logged in user
  const [profileName, setProfileName] = React.useState(user?.name || "Minh Thư");
  const [profileAvatar, setProfileAvatar] = React.useState(user?.avatar || "");
  const [profileHandle, setProfileHandle] = React.useState(user?.handle || "minhthu_runner");
  const [profileArea, setProfileArea] = React.useState(user?.sportsProfile?.preferredArea || "Bình Thạnh");
  const [profilePace, setProfilePace] = React.useState(user?.sportsProfile?.runningPace || "5:45 /km");

  React.useEffect(() => {
    if (user?.name) setProfileName(user.name);
    if (user?.avatar) setProfileAvatar(user.avatar);
    if (user?.handle) setProfileHandle(user.handle);
    if (user?.sportsProfile?.preferredArea) setProfileArea(user.sportsProfile.preferredArea);
    if (user?.sportsProfile?.runningPace) setProfilePace(user.sportsProfile.runningPace);
  }, [user]);

  // QR Timer countdown
  React.useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isQrModalOpen) {
      setQrCountdown(30);
      timer = setInterval(() => {
        setQrCountdown((prev) => (prev > 1 ? prev - 1 : 30));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isQrModalOpen]);

  const handleShareProfile = () => {
    navigator.clipboard?.writeText?.(`https://syncsport.app/v/${profileHandle}`);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const userInitials = profileName
    .split(" ")
    .map((w) => w[0])
    .filter(Boolean)
    .slice(-2)
    .join("")
    .toUpperCase() || "MT";

  // Cấp Rank hiện tại của người dùng & Bộ màu loan đặc thù
  const currentRankLevel = 2; // Cấp 2 · Runner / Lifter
  const rankTheme = getRankTheme(currentRankLevel);

  return (
    <div className="flex flex-col w-full min-h-screen bg-background pb-24 max-w-md mx-auto text-foreground relative overflow-hidden">
      {/* AMBIENT MESH GRADIENTS (Màu loan giao diện nhẹ nhàng, thay đổi chuẩn theo Rank) */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div
          className={cn(
            "absolute -top-16 -left-10 w-96 h-96 rounded-full blur-3xl opacity-35 dark:opacity-45 rank-aura-pulse transition-all duration-700",
            `bg-linear-to-br ${rankTheme.orbGradientPrimary}`
          )}
        />
        <div
          className={cn(
            "absolute top-52 -right-16 w-80 h-80 rounded-full blur-3xl opacity-25 dark:opacity-35 transition-all duration-700",
            `bg-linear-to-bl ${rankTheme.orbGradientSecondary}`
          )}
        />
        <div className="absolute top-[650px] -left-20 w-80 h-80 bg-brand/10 dark:bg-brand/15 rounded-full blur-3xl" />
      </div>

      {/* 1. TOP HEADER: Hồ sơ + Share + Sun + Settings */}
      <div className="sticky top-0 z-40 bg-background/90 backdrop-blur-md px-4 py-3 flex items-center justify-between">
        <h1 className="text-xl font-bold tracking-tight text-foreground">Hồ sơ</h1>
        <div className="flex items-center gap-1.5">
          {/* Share */}
          <button
            type="button"
            onClick={handleShareProfile}
            aria-label="Chia sẻ hồ sơ"
            title="Chia sẻ hồ sơ"
            className="p-2 rounded-full hover:bg-muted text-foreground transition-all active:scale-95"
          >
            {copiedLink ? <Check className="h-5 w-5 text-emerald-500" /> : <Share2 className="h-5 w-5 stroke-[1.8]" />}
          </button>

          {/* Theme toggle (Sun / Moon) */}
          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Đổi giao diện sáng/tối"
            title="Đổi giao diện sáng/tối"
            className="p-2 rounded-full hover:bg-muted text-foreground transition-all active:scale-95"
          >
            {isDarkMode ? <Sun className="h-5 w-5 stroke-[1.8]" /> : <Sun className="h-5 w-5 stroke-[1.8]" />}
          </button>

          {/* Settings */}
          <Link
            href="/cai-dat"
            aria-label="Cài đặt tài khoản"
            title="Cài đặt tài khoản"
            className="p-2 rounded-full hover:bg-muted text-foreground transition-all active:scale-95"
          >
            <Settings className="h-5 w-5 stroke-[1.8]" />
          </Link>
        </div>
      </div>

      <div className="px-3.5 space-y-3.5">
        {/* 2. PROFILE CARD */}
        <div
          className={cn(
            "rounded-3xl bg-card/90 backdrop-blur-md border p-4 shadow-xs space-y-3.5 relative overflow-hidden transition-all duration-300",
            rankTheme.borderClass
          )}
        >
          {/* Rank Ambient Aura ("Màu loan" lan tỏa theo rank người dùng) */}
          <RankAuraGlow level={currentRankLevel} variant="dual-mesh" />

          <div className="flex items-start gap-3.5 relative z-10">
            {/* Avatar Circle with initials or photo & Rank Aura Halo */}
            <div className="relative shrink-0">
              <RankAuraGlow level={currentRankLevel} variant="avatar-halo" />
              <div
                className={cn(
                  "w-14 h-14 rounded-full p-[2px] shadow-xs relative z-10 bg-linear-to-tr",
                  rankTheme.avatarRingGradient
                )}
              >
                <div className="w-full h-full rounded-full bg-background overflow-hidden flex items-center justify-center">
                  {profileAvatar ? (
                    <img src={profileAvatar} alt={profileName} className="w-full h-full object-cover" />
                  ) : (
                    <span className="font-bold text-brand dark:text-brand-sky text-base">{userInitials}</span>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAvatarModalOpen(true)}
                aria-label="Đổi ảnh đại diện"
                className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-brand text-white border border-background flex items-center justify-center shadow-xs hover:scale-105 transition-transform z-20"
              >
                <Camera className="h-2.5 w-2.5" />
              </button>
            </div>

            {/* Info & Badges */}
            <div className="flex-1 min-w-0 space-y-1">
              <h2 className="text-base font-bold text-foreground tracking-tight truncate">{profileName}</h2>
              <p className="text-xs text-muted-foreground truncate">
                @{profileHandle} · {profileArea}
              </p>
              <div className="flex items-center gap-1.5 pt-0.5 flex-wrap">
                <span className="inline-flex items-center text-[10.5px] font-semibold text-brand dark:text-brand-sky bg-brand/10 dark:bg-brand/20 px-2 py-0.5 rounded-full">
                  Đã xác thực
                </span>
                {/* Clickable Rank Badge Pill with Rank Aura */}
                <RankPill
                  level={currentRankLevel}
                  label="Cấp 2 · Runner"
                  onClick={() => setIsRankRoadmapOpen(true)}
                />
                <span className="inline-flex items-center text-[10.5px] font-medium text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-full">
                  ⚡ 5:45/km
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons: [Sửa hồ sơ] & [👁] */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(true)}
              className="flex-1 py-2.5 px-4 rounded-xl bg-brand hover:bg-brand-600 active:scale-[0.99] text-white font-bold text-xs transition-all shadow-xs"
            >
              Sửa hồ sơ
            </button>
            <button
              type="button"
              onClick={() => {
                alert(`Xem trước hồ sơ công khai của @${profileHandle}`);
              }}
              aria-label="Xem trước hồ sơ"
              title="Xem trước hồ sơ công khai"
              className="w-10 h-10 rounded-xl bg-card border border-border flex items-center justify-center text-foreground hover:bg-muted active:scale-95 transition-all"
            >
              <Eye className="h-4 w-4 stroke-[1.8]" />
            </button>
          </div>
        </div>

        {/* 3. ALERT BANNER: 🟠 Xác nhận kèo 17:45 · 28 phút > */}
        <button
          type="button"
          onClick={() => setIsQrModalOpen(true)}
          className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/20 hover:border-amber-500/40 transition-all text-left group"
        >
          <div className="flex items-center gap-2 min-w-0">
            <span className="h-2 w-2 rounded-full bg-amber-500 shrink-0 animate-pulse" />
            <span className="text-xs font-bold text-foreground truncate">Xác nhận kèo 17:45</span>
            <span className="text-xs text-muted-foreground truncate">· 28 phút</span>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform shrink-0" />
        </button>

        {/* 4. THREE STATS ROW: 38 Buổi · 96% Đúng hẹn · 6 Bạn tập */}
        <div className="grid grid-cols-3 divide-x divide-border/60 text-center py-1">
          <div className="px-2">
            <p className="text-lg font-bold text-foreground">38</p>
            <p className="text-xs text-muted-foreground">Buổi</p>
          </div>
          <div className="px-2">
            <p className="text-lg font-bold text-foreground">96%</p>
            <p className="text-xs text-muted-foreground">Đúng hẹn</p>
          </div>
          <div className="px-2">
            <p className="text-lg font-bold text-foreground">6</p>
            <p className="text-xs text-muted-foreground">Bạn tập</p>
          </div>
        </div>

        {/* 5. BỐN NÚT THAO TÁC NHANH: [Lịch] [Kèo] [CLB / QL CLB] [Xu] (CÂN ĐỐI, THOÁNG MẮT, KHÔNG CHÈN ÉP) */}
        <div className="grid grid-cols-4 gap-2">
          {/* Lịch */}
          <button
            type="button"
            onClick={() => setIsScheduleModalOpen(true)}
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-card border border-border/70 hover:border-brand/40 shadow-xs active:scale-95 transition-all space-y-1.5"
          >
            <div className="w-8 h-8 rounded-xl bg-brand/10 dark:bg-brand/20 text-brand dark:text-brand-sky flex items-center justify-center">
              <Calendar className="h-4 w-4" />
            </div>
            <span className="text-[11px] font-semibold text-foreground">Lịch</span>
          </button>

          {/* Kèo */}
          <button
            type="button"
            onClick={() => setActiveTab("keo")}
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-card border border-border/70 hover:border-brand/40 shadow-xs active:scale-95 transition-all space-y-1.5"
          >
            <div className="w-8 h-8 rounded-xl bg-brand/10 dark:bg-brand/20 text-brand dark:text-brand-sky flex items-center justify-center">
              <Zap className="h-4 w-4" />
            </div>
            <span className="text-[11px] font-semibold text-foreground">Kèo</span>
          </button>

          {/* CLB / QL CLB */}
          <Link
            href={isClubLeader ? "/cau-lac-bo/quan-ly" : "/dong-doi?tab=clb"}
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-card border border-border/70 hover:border-brand/40 shadow-xs active:scale-95 transition-all space-y-1.5 group relative"
          >
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Shield className="h-4 w-4" />
            </div>
            <span className="text-[11px] font-semibold text-foreground truncate max-w-full px-0.5">
              {isClubLeader ? "QL CLB" : "CLB"}
            </span>
            {isClubLeader && (
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-blue-600 ring-2 ring-card" />
            )}
          </Link>

          {/* Xu */}
          <button
            type="button"
            onClick={() => setIsCoinsModalOpen(true)}
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-card border border-border/70 hover:border-brand/40 shadow-xs active:scale-95 transition-all space-y-1.5"
          >
            <div className="w-8 h-8 rounded-xl bg-brand/10 dark:bg-brand/20 text-brand dark:text-brand-sky flex items-center justify-center">
              <Coins className="h-4 w-4" />
            </div>
            <span className="text-[11px] font-semibold text-foreground">Xu</span>
          </button>
        </div>

        {/* 6. HAI Ô CHỈ SỐ KỶ LUẬT: [Uy tín 8,5/10] & [Chuỗi tuần 6 tuần] */}
        <div className="grid grid-cols-2 gap-2.5">
          {/* Card Uy Tín */}
          <button
            type="button"
            onClick={() => setIsTrustRulesOpen(true)}
            className="p-3.5 rounded-2xl bg-card border border-border/70 text-left shadow-xs space-y-2 hover:border-brand/40 transition-all active:scale-[0.99]"
          >
            <p className="text-[11px] text-muted-foreground font-medium">Uy tín</p>
            <p className="text-base font-bold text-foreground">
              8,5 <span className="text-xs font-normal text-muted-foreground">/10</span>
            </p>
            <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
              <div className="h-full bg-brand rounded-full" style={{ width: "85%" }} />
            </div>
          </button>

          {/* Card Chuỗi Tuần */}
          <div className="p-3.5 rounded-2xl bg-card border border-border/70 text-left shadow-xs space-y-2">
            <p className="text-[11px] text-muted-foreground font-medium">Chuỗi tuần</p>
            <p className="text-base font-bold text-foreground">6 tuần</p>
            {/* 7 streak dots: 6 active blue, 1 inactive */}
            <div className="flex items-center gap-1.5 pt-0.5">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <span key={i} className="h-1.5 w-1.5 rounded-full bg-brand" />
              ))}
              <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/30" />
            </div>
          </div>
        </div>

        {/* 7. EXP RANK BAR: Cấp 2 · Runner 1.240 / 2.000 EXP (CLICKABLE -> MỞ LỘ TRÌNH EXP & 6 RANK) */}
        <button
          type="button"
          onClick={() => setIsRankRoadmapOpen(true)}
          className={cn(
            "w-full p-3.5 rounded-2xl bg-card/90 backdrop-blur-md border shadow-xs space-y-2 text-left group transition-all active:scale-[0.99] relative overflow-hidden",
            rankTheme.borderClass,
            `hover:${rankTheme.activeBorderClass}`
          )}
        >
          {/* Rank Ambient Aura ("Màu loan" góc thẻ EXP) */}
          <RankAuraGlow level={currentRankLevel} variant="corner-orb" />

          <div className="flex items-center justify-between text-xs relative z-10">
            <div className="flex items-center gap-2">
              <RankBadgeIcon level={currentRankLevel as 1 | 2 | 3 | 4 | 5 | 6} size="xs" showAura animated />
              <div
                className={cn(
                  "flex items-center gap-1 font-bold text-foreground transition-colors",
                  `group-hover:${rankTheme.textClass}`
                )}
              >
                <span>Cấp 2 · Runner</span>
                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
            <span className="text-muted-foreground font-mono text-[11px]">1.240 / 2.000 EXP</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden relative z-10">
            <div
              className={cn("h-full rounded-full bg-linear-to-r transition-all duration-500", rankTheme.progressGradient)}
              style={{ width: "62%" }}
            />
          </div>
        </button>

        {/* 8. THẺ CÂU LẠC BỘ & QUỸ SINH HOẠT (TRẬT TỰ RÕ RÀNG, PHÂN BIỆT VAI TRÒ TRƯỞNG CLB VS HỘI VIÊN) */}
        <div className="p-3.5 rounded-2xl bg-card border border-border/70 shadow-xs space-y-3 transition-all relative overflow-hidden">
          {/* Header hàng 1: Icon CLB, Tên, Badge vai trò & Link hành động */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold shadow-xs">
                <Shield className="h-4.5 w-4.5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-xs font-bold text-foreground">
                    {isClubLeader ? "Quản lý CLB & Quỹ" : "CLB của tôi"}
                  </h3>
                  <span
                    className={cn(
                      "px-1.5 py-0.5 rounded-md font-extrabold text-[9.5px]",
                      isClubLeader
                        ? "bg-blue-500/15 text-blue-700 dark:text-blue-300"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {isClubLeader ? "Trưởng CLB" : "Hội viên"}
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  FTU2 Run Club · {isClubLeader ? "1.240 thành viên" : "1.240 tv · 4 sự kiện tuần"}
                </p>
              </div>
            </div>

            <Link
              href={isClubLeader ? "/cau-lac-bo/quan-ly" : "/dong-doi?tab=clb"}
              className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white active:scale-95 text-xs font-bold transition-all shadow-xs flex items-center gap-1"
            >
              <span>{isClubLeader ? "Quản lý" : "Trang CLB"}</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* Nội dung theo phân quyền */}
          {isClubLeader ? (
            /* TRƯỞNG CLB: HIỂN THỊ QUỸ VÀ THU HỘI PHÍ (2 Ô CÂN ĐỐI, TRẬT TỰ RÕ RÀNG) */
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/60 text-xs">
              <div className="p-2.5 rounded-xl bg-muted/40 border border-border/60 space-y-0.5">
                <p className="text-[10px] text-muted-foreground font-medium">Số dư Quỹ CLB</p>
                <p className="text-sm font-black text-brand dark:text-brand-sky">12.450.000đ</p>
                <p className="text-[9.5px] text-emerald-600 dark:text-emerald-400 font-medium">94% thực nhận sau phí</p>
              </div>
              <div className="p-2.5 rounded-xl bg-muted/40 border border-border/60 space-y-0.5">
                <p className="text-[10px] text-muted-foreground font-medium">Hội phí Quý IV</p>
                <p className="text-sm font-black text-emerald-600 dark:text-emerald-400">41/50 đã nộp</p>
                <p className="text-[9.5px] text-muted-foreground">Tiến độ thu 82%</p>
              </div>
            </div>
          ) : (
            /* HỘI VIÊN THƯỜNG: BẢO MẬT QUỸ (KHÔNG THẤY TIỀN), HIỂN THỊ HOẠT ĐỘNG */
            <div className="pt-2 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5 text-[11px]">
                <Lock className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <span>Không thấy quỹ sinh hoạt (Chỉ Ban quản lý)</span>
              </span>
              <span className="text-[10.5px] font-medium text-foreground bg-muted/60 px-2 py-0.5 rounded-md">
                Kèo chạy T4 & CN
              </span>
            </div>
          )}

          {/* Dòng điều hướng demo vai trò tinh tế ở góc dưới, không phá vỡ UI chính */}
          <div className="flex items-center justify-between pt-1 text-[10px] text-muted-foreground border-t border-border/30">
            <span>Vai trò: <strong className="text-foreground">{isClubLeader ? "Trưởng CLB (Có quyền Quỹ)" : "Thành viên (Bảo mật Quỹ)"}</strong></span>
            <button
              type="button"
              onClick={() => setIsClubLeader(!isClubLeader)}
              className="text-brand dark:text-brand-sky hover:underline font-semibold"
            >
              {isClubLeader ? "Xem vai Member" : "Chuyển vai Trưởng CLB"}
            </button>
          </div>
        </div>

        {/* 8. GHI NHẬN TẬP LUYỆN (CHUẨN CHI TIẾT: THỐNG KÊ THÁNG, BẢN ĐỒ NHIỆT 20 TUẦN, BIỂU ĐỒ PHÂN BỐ & GHI BUỔI TẬP) */}
        <TrainingLog className="rounded-3xl bg-card/90 backdrop-blur-md border border-border/70 shadow-xs" />

        {/* 10. 2x2 SPECS GRID */}
        <div className="grid grid-cols-2 gap-2.5">
          {/* Card 1: Pace & kỷ lục */}
          <div className="p-3 rounded-2xl bg-card border border-border/70 shadow-xs space-y-1">
            <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
              <span>Pace & kỷ lục</span>
              <Lock className="h-3 w-3" />
            </div>
            <p className="text-xs font-bold text-foreground">{profilePace}</p>
          </div>

          {/* Card 2: Lịch cố định */}
          <div className="p-3 rounded-2xl bg-card border border-border/70 shadow-xs space-y-1">
            <p className="text-[11px] text-muted-foreground">Lịch cố định</p>
            <p className="text-xs font-bold text-foreground">T3 · T5 - 5:30</p>
          </div>

          {/* Card 3: Cung đường quen */}
          <div className="p-3 rounded-2xl bg-card border border-border/70 shadow-xs space-y-1">
            <p className="text-[11px] text-muted-foreground">Cung đường quen</p>
            <p className="text-xs font-bold text-foreground">Thanh Đa</p>
          </div>

          {/* Card 4: Môn & band */}
          <div className="p-3 rounded-2xl bg-card border border-border/70 shadow-xs space-y-1">
            <p className="text-[11px] text-muted-foreground">Môn & band</p>
            <p className="text-xs font-bold text-foreground">R2 · S1</p>
          </div>
        </div>

        {/* 11. FOUR TABS: Bài đăng 6 · Kèo 2 · Huy hiệu 7 · Bạn tập 6 */}
        <div className="pt-2">
          <div className="flex items-center justify-between border-b border-border/60 text-xs">
            {[
              { id: "posts" as const, label: "Bài đăng 6" },
              { id: "keo" as const, label: "Kèo 2" },
              { id: "badges" as const, label: "Huy hiệu 7" },
              { id: "buddies" as const, label: "Bạn tập 6" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "py-2 px-1 font-semibold transition-all relative",
                  activeTab === tab.id ? "text-brand dark:text-brand-sky font-bold" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <span>{tab.label}</span>
                {activeTab === tab.id && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand rounded-full" />}
              </button>
            ))}
          </div>

          {/* SUB-BAR: Grid/List View switcher & [+ Đăng] */}
          <div className="flex items-center justify-between py-2.5">
            <div className="flex items-center gap-1 text-muted-foreground">
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                aria-label="Xem lưới"
                className={cn("p-1.5 rounded-lg transition-colors", viewMode === "grid" ? "text-brand bg-brand/10" : "hover:text-foreground")}
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("list")}
                aria-label="Xem danh sách"
                className={cn("p-1.5 rounded-lg transition-colors", viewMode === "list" ? "text-brand bg-brand/10" : "hover:text-foreground")}
              >
                <List className="h-4 w-4" />
              </button>
            </div>

            <button
              type="button"
              onClick={() => setIsNewPostModalOpen(true)}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-brand text-white font-bold text-xs hover:bg-brand-600 active:scale-95 transition-all shadow-xs"
            >
              <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
              <span>Đăng</span>
            </button>
          </div>

          {/* 12. TAB CONTENT */}
          {activeTab === "posts" && (
            <div className={cn(viewMode === "grid" ? "grid grid-cols-3 gap-2" : "space-y-2")}>
              {/* Item 1: 10 km route */}
              <div className="aspect-square rounded-2xl bg-card border border-border/70 p-2.5 flex flex-col justify-between shadow-xs hover:border-brand/40 transition-all">
                <div className="flex-1 flex items-center justify-center">
                  <svg className="w-10 h-10 stroke-brand fill-none stroke-[2]" viewBox="0 0 24 24">
                    <polygon points="6,4 18,3 21,14 14,20 4,16 6,4" />
                  </svg>
                </div>
                <span className="text-[11px] font-bold text-foreground text-left">10 km</span>
              </div>

              {/* Item 2: Gym - 45' */}
              <div className="aspect-square rounded-2xl bg-card border border-border/70 p-2.5 flex flex-col justify-between shadow-xs hover:border-brand/40 transition-all">
                <div className="flex-1 flex items-center justify-center text-muted-foreground/60">
                  <Dumbbell className="h-8 w-8" />
                </div>
                <span className="text-[11px] font-bold text-foreground text-left">Gym - 45&apos;</span>
              </div>

              {/* Item 3: 6,2 km graph */}
              <div className="aspect-square rounded-2xl bg-card border border-border/70 p-2.5 flex flex-col justify-between shadow-xs hover:border-brand/40 transition-all">
                <div className="flex-1 flex items-center justify-center">
                  <svg className="w-10 h-10 stroke-brand fill-none stroke-[2]" viewBox="0 0 24 24">
                    <path d="M3 18 L8 14 L14 17 L21 6" />
                  </svg>
                </div>
                <span className="text-[11px] font-bold text-foreground text-left">6,2 km</span>
              </div>

              {/* Item 4: Calisthenics */}
              <div className="aspect-square rounded-2xl bg-card border border-border/70 p-2.5 flex flex-col justify-between shadow-xs hover:border-brand/40 transition-all">
                <div className="flex-1 flex items-center justify-center text-muted-foreground/60">
                  <Activity className="h-8 w-8" />
                </div>
                <span className="text-[11px] font-bold text-foreground text-left">Calisthenics</span>
              </div>

              {/* Item 5: 8 km polygon */}
              <div className="aspect-square rounded-2xl bg-card border border-border/70 p-2.5 flex flex-col justify-between shadow-xs hover:border-brand/40 transition-all">
                <div className="flex-1 flex items-center justify-center">
                  <svg className="w-10 h-10 stroke-brand fill-none stroke-[2]" viewBox="0 0 24 24">
                    <polygon points="12,3 20,8 18,19 6,19 4,8" />
                  </svg>
                </div>
                <span className="text-[11px] font-bold text-foreground text-left">8 km</span>
              </div>

              {/* Item 6: Squad */}
              <div className="aspect-square rounded-2xl bg-card border border-border/70 p-2.5 flex flex-col justify-between shadow-xs hover:border-brand/40 transition-all">
                <div className="flex-1 flex items-center justify-center text-muted-foreground/60">
                  <Users className="h-8 w-8" />
                </div>
                <span className="text-[11px] font-bold text-foreground text-left">Squad</span>
              </div>
            </div>
          )}

          {/* TAB 2: KÈO (2) */}
          {activeTab === "keo" && (
            <div className="space-y-2">
              <div className="p-3 rounded-2xl bg-card border border-border/70 shadow-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground">Chạy Bờ Kè Thanh Đa · 10km</span>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full">Sắp tới</span>
                </div>
                <p className="text-[11px] text-muted-foreground">Hôm nay 17:45 · Spot Bờ Kè Bán Đảo Thanh Đa</p>
                <div className="flex items-center justify-between pt-1 border-t border-border/50 text-[11px]">
                  <span className="text-muted-foreground">Bạn tập: Hữu Phúc (UT 8.5)</span>
                  <button
                    type="button"
                    onClick={() => setIsQrModalOpen(true)}
                    className="font-bold text-brand hover:underline"
                  >
                    Mã Check-in &gt;
                  </button>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-card border border-border/70 shadow-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground">Gym Legday · The New Gym</span>
                  <span className="text-[10px] font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded-full">Đã xong</span>
                </div>
                <p className="text-[11px] text-muted-foreground">Hôm qua 06:00 · Quét QR đúng giờ (+0.5 UT)</p>
              </div>
            </div>
          )}

          {/* TAB 3: HUY HIỆU (7) */}
          {activeTab === "badges" && (
            <div className="grid grid-cols-2 gap-2 text-xs">
              {[
                { title: "Kỷ lục 10K", desc: "Hoàn thành 10km trong 58 phút", icon: Flame },
                { title: "Đúng hẹn 100%", desc: "10 kèo liên tiếp không muộn", icon: ShieldCheck },
                { title: "Chiến binh Chuỗi", desc: "Giữ chuỗi 6 tuần liên tiếp", icon: Award },
                { title: "Bạn tập Thân thiết", desc: "Ghép đôi thành công 15 bạn", icon: Users },
                { title: "Early Bird", desc: "Chạy sớm trước 6:00 sáng", icon: Clock },
                { title: "Khám phá Spot", desc: "Check-in 5 điểm hẹn khác nhau", icon: MapPin },
                { title: "Zero Cọc Master", desc: "Đạt mốc 8.5 UT miễn cọc 100%", icon: Shield },
              ].map((badge) => {
                const Icon = badge.icon;
                return (
                  <div key={badge.title} className="p-2.5 rounded-2xl bg-card border border-border/70 shadow-xs space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-foreground">
                      <Icon className="h-4 w-4 text-brand dark:text-brand-sky" />
                      <span className="truncate">{badge.title}</span>
                    </div>
                    <p className="text-[10.5px] text-muted-foreground line-clamp-1">{badge.desc}</p>
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 4: BẠN TẬP (6) */}
          {activeTab === "buddies" && (
            <div className="space-y-2">
              {[
                { name: "Đặng Hữu Phúc", role: "Runner · Pace 5:30", ut: "8.5", area: "Bình Thạnh" },
                { name: "Ngọc Mai", role: "Yoga & Run · Pace 6:15", ut: "9.2", area: "Q.2 Sala" },
                { name: "Hoàng Nam", role: "Marathoner · Sub 4", ut: "9.6", area: "Landmark 81" },
                { name: "Khánh Linh", role: "Gym & Fitness", ut: "8.8", area: "Phú Nhuận" },
                { name: "Tuấn Anh", role: "Calisthenics & Run", ut: "8.2", area: "Thảo Điền" },
                { name: "Thanh Trúc", role: "Cầu lông & Jogging", ut: "8.9", area: "Q.1 Bến Nghé" },
              ].map((buddy) => (
                <div key={buddy.name} className="p-2.5 rounded-2xl bg-card border border-border/70 flex items-center justify-between shadow-xs">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-brand/10 text-brand font-bold text-xs flex items-center justify-center">
                      {buddy.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-foreground">{buddy.name}</p>
                      <p className="text-[10px] text-muted-foreground">{buddy.role} · {buddy.area}</p>
                    </div>
                  </div>
                  <span className="text-[11px] font-bold text-brand bg-brand/10 px-2 py-0.5 rounded-full">
                    {buddy.ut} UT
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* =================================================================== */}
      {/* MODALS */}
      {/* =================================================================== */}

      {/* MODAL: SỬA HỒ SƠ */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border w-full max-w-sm rounded-3xl p-5 space-y-3.5 shadow-2xl relative">
            <button
              onClick={() => setIsEditModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-muted text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="space-y-0.5">
              <h2 className="text-base font-extrabold text-foreground flex items-center gap-1.5">
                <Edit3 className="h-4 w-4 text-brand dark:text-brand-sky" />
                <span>Chỉnh Sửa Hồ Sơ</span>
              </h2>
              <p className="text-xs text-muted-foreground">Thông tin cá nhân và định hướng tập luyện.</p>
            </div>

            <div className="space-y-2.5 text-xs">
              <div>
                <label className="text-[11px] font-bold text-foreground block mb-1">Tên hiển thị:</label>
                <input
                  type="text"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-muted/60 border border-border text-foreground font-semibold outline-none focus:border-brand"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-foreground block mb-1">Username (@handle):</label>
                <input
                  type="text"
                  value={profileHandle}
                  onChange={(e) => setProfileHandle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-muted/60 border border-border text-foreground font-semibold outline-none focus:border-brand"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-foreground block mb-1">Khu vực thường tập:</label>
                <input
                  type="text"
                  value={profileArea}
                  onChange={(e) => setProfileArea(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-muted/60 border border-border text-foreground font-semibold outline-none focus:border-brand"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-foreground block mb-1">Pace & kỷ lục quen thuộc:</label>
                <input
                  type="text"
                  value={profilePace}
                  onChange={(e) => setProfilePace(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-muted/60 border border-border text-foreground font-semibold outline-none focus:border-brand"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <Button
                variant="outline"
                onClick={() => setIsEditModalOpen(false)}
                className="flex-1 rounded-xl text-xs font-semibold h-10"
              >
                Hủy
              </Button>
              <Button
                onClick={() => {
                  updateProfile({
                    name: profileName,
                    handle: profileHandle,
                    sportsProfile: {
                      ...(user?.sportsProfile || {
                        preferredSports: [],
                        fitnessGoal: "",
                        maxDistance: "",
                        gymExperience: "",
                        racketLevel: "",
                        preferredTime: "",
                        workoutFrequency: "",
                        buddyStyle: "",
                        privacyZoneEnabled: true,
                      }),
                      preferredArea: profileArea,
                      runningPace: profilePace,
                    },
                  });
                  setIsEditModalOpen(false);
                }}
                className="flex-1 rounded-xl text-xs font-bold bg-brand text-white h-10"
              >
                Lưu Thay Đổi
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ĐỔI AVATAR */}
      {isAvatarModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border w-full max-w-sm rounded-3xl p-5 space-y-4 shadow-2xl relative text-center">
            <button
              onClick={() => setIsAvatarModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-muted text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="space-y-1">
              <h3 className="text-base font-extrabold text-foreground">Chọn Ảnh Đại Diện Thể Thao</h3>
              <p className="text-xs text-muted-foreground">Chọn hình mẫu phù hợp với phong cách tập luyện của bạn.</p>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {PRESET_AVATARS.map((av) => (
                <button
                  key={av.id}
                  type="button"
                  onClick={() => setProfileAvatar(av.url)}
                  className={cn(
                    "relative aspect-square rounded-xl overflow-hidden border-2 transition-all p-0.5",
                    profileAvatar === av.url ? "border-brand scale-105 shadow-md" : "border-border hover:border-brand/40 opacity-75 hover:opacity-100"
                  )}
                >
                  <img src={av.url} alt={av.label} className="w-full h-full object-cover rounded-lg" />
                  {profileAvatar === av.url && (
                    <span className="absolute bottom-1 right-1 h-4 w-4 rounded-full bg-brand text-white flex items-center justify-center">
                      <Check className="h-2.5 w-2.5" />
                    </span>
                  )}
                </button>
              ))}
            </div>

            <Button
              onClick={() => {
                updateProfile({ avatar: profileAvatar });
                setIsAvatarModalOpen(false);
              }}
              className="w-full rounded-xl text-xs font-bold bg-brand text-white h-10"
            >
              Cập Nhật Avatar
            </Button>
          </div>
        </div>
      )}

      {/* MODAL: CHECK-IN QR ĐIỂM HẸN */}
      {isQrModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border w-full max-w-sm rounded-3xl p-5 space-y-4 shadow-2xl relative text-center">
            <button
              onClick={() => setIsQrModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-muted text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="space-y-1">
              <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-brand dark:text-brand-sky">
                <QrCode className="h-4 w-4" />
                <span>QUÉT QR ĐIỂM HẸN 2 CHIỀU</span>
              </div>
              <h3 className="text-base font-extrabold text-foreground">Điểm Danh Kèo 17:45</h3>
              <p className="text-xs text-muted-foreground">Đưa mã QR lại gần bạn tập để xác nhận đúng giờ và hoàn tiền cọc.</p>
            </div>

            {/* QR Code Graphic */}
            <div className="p-4 rounded-2xl bg-white border-2 border-brand/20 flex flex-col items-center justify-center space-y-2 shadow-inner mx-auto w-44 h-44">
              <div className="w-32 h-32 border-4 border-slate-900 rounded-xl p-2 flex flex-col justify-between bg-white relative">
                <div className="w-7 h-7 bg-slate-900 rounded-xs" />
                <div className="absolute top-2 right-2 w-7 h-7 bg-slate-900 rounded-xs" />
                <div className="absolute bottom-2 left-2 w-7 h-7 bg-slate-900 rounded-xs" />
                <div className="absolute inset-8 grid grid-cols-3 gap-1 p-1">
                  <div className="bg-slate-900 rounded-xs" />
                  <div className="bg-slate-400 rounded-xs" />
                  <div className="bg-slate-900 rounded-xs" />
                  <div className="bg-slate-900 rounded-xs" />
                  <div className="bg-slate-300 rounded-xs" />
                  <div className="bg-slate-900 rounded-xs" />
                </div>
              </div>
            </div>

            <div className="space-y-0.5">
              <p className="text-xs font-mono font-bold text-foreground">
                Mã: <span className="text-brand dark:text-brand-sky">SYNC-81-MT-2026</span>
              </p>
              <p className="text-[11px] text-muted-foreground">
                Tự làm mới sau: <strong className="text-foreground">{qrCountdown}s</strong>
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => alert("Mở camera quét QR bạn tập...")}
                className="flex-1 rounded-xl text-xs font-bold h-10"
              >
                <Camera className="h-3.5 w-3.5 mr-1" />
                Quét mã
              </Button>
              <Button
                onClick={() => {
                  alert("Điểm danh thành công! Cả 2 đã đúng giờ. +0.5 UT!");
                  setIsQrModalOpen(false);
                }}
                className="flex-1 rounded-xl text-xs font-bold bg-brand text-white h-10"
              >
                Xác nhận
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CÁCH TÍNH ĐIỂM UY TÍN (UT) - CHUẨN MASTER SPEC MỤC 9 */}
      {isTrustRulesOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border w-full max-w-sm rounded-3xl p-5 space-y-4 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsTrustRulesOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-muted text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-brand">
                <ShieldCheck className="h-4 w-4" />
                <span>QUY CHUẨN ĐIỂM UY TÍN (UT)</span>
              </div>
              <h3 className="text-base font-extrabold text-foreground">Thang Điểm 0–10 & Phục Hồi</h3>
              <p className="text-xs text-muted-foreground">Điểm Uy Tín quản lý cam kết đúng hẹn và mở/khóa đặc quyền công cụ.</p>
            </div>

            <div className="space-y-2 text-xs">
              {/* Phân tầng UT */}
              <div className="p-3 rounded-2xl bg-muted/40 border border-border/80 space-y-1">
                <p className="font-bold text-foreground text-[11px] uppercase tracking-wide">Thang điểm UT hệ thống</p>
                <ul className="space-y-1 text-[11px] text-muted-foreground">
                  <li>• <strong>9–10 UT:</strong> Uy tín cao (mở tối đa 3 kèo/24h)</li>
                  <li>• <strong>7–8 UT:</strong> Cần chú ý (tạo tối đa 2 kèo/24h)</li>
                  <li>• <strong>5–6 UT:</strong> Hạn chế (chỉ tạo 1 kèo/24h, đóng băng lịch định kỳ)</li>
                  <li>• <strong>0–4 UT:</strong> Uy tín thấp (tạm khóa kèo 1-1, chỉ vào kèo nhóm)</li>
                </ul>
              </div>

              {/* Cộng điểm */}
              <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 space-y-1">
                <p className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span>Cộng điểm & Phục hồi (+UT)</span>
                </p>
                <ul className="space-y-1 text-[11px] text-muted-foreground">
                  <li>• Khởi điểm đăng ký: <strong>7.0 UT</strong> (Tân binh: <strong>8.0 UT</strong>)</li>
                  <li>• Buổi tập đúng hẹn: <strong>+0.5 UT</strong> (tối đa 1 lần/ngày)</li>
                  <li>• Lời xin lỗi được bạn tập chấp nhận: <strong>+0.5 UT</strong> (1 lần/kèo)</li>
                </ul>
              </div>

              {/* Trừ điểm */}
              <div className="p-3 rounded-2xl bg-red-500/10 border border-red-500/20 space-y-1">
                <p className="font-bold text-red-600 flex items-center gap-1">
                  <ShieldAlert className="h-3.5 w-3.5" />
                  <span>Trừ điểm vi phạm (-UT)</span>
                </p>
                <ul className="space-y-1 text-[11px] text-muted-foreground">
                  <li>• Hủy trong vòng 30 phút trước giờ hẹn: <strong>-0.5 UT</strong></li>
                  <li>• Đến trễ trong vòng 15 phút: <strong>-0.25 UT</strong> (sau 15p tính vắng)</li>
                  <li>• Vắng có khai báo trong 24 giờ: <strong>-1.0 UT</strong></li>
                  <li>• Vắng im lặng (không báo): <strong>-1.5 UT</strong></li>
                  <li>• Mưa bão chính thức hoặc địa điểm đóng cửa: <strong>Không trừ UT</strong></li>
                </ul>
              </div>
            </div>

            <Button onClick={() => setIsTrustRulesOpen(false)} className="w-full rounded-xl bg-brand text-white font-bold text-xs h-10">
              Tôi Đã Hiểu
            </Button>
          </div>
        </div>
      )}

      {/* MODAL: HÀNH TRÌNH EXP & 6 BẬC RANK (CHUẨN MASTER SPEC III.9) */}
      <RankRoadmapModal
        isOpen={isRankRoadmapOpen}
        onClose={() => setIsRankRoadmapOpen(false)}
        currentExp={1240}
        currentUt={8.5}
        onOpenRewardsModal={() => setIsCoinsModalOpen(true)}
      />

      {/* MODAL: ĐỔI THƯỞNG EXP, VOUCHER ĐỐI TÁC & HIỆN VẬT SYNESIS */}
      <RewardsModal
        isOpen={isCoinsModalOpen}
        onClose={() => setIsCoinsModalOpen(false)}
        userRankTitle="Cấp 2 · Runner"
      />

      {/* MODAL: ĐĂNG BÀI MỚI */}
      {isNewPostModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border w-full max-w-sm rounded-3xl p-5 space-y-3.5 shadow-2xl relative">
            <button
              onClick={() => setIsNewPostModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-muted text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="space-y-0.5">
              <h3 className="text-base font-extrabold text-foreground">Chia Sẻ Buổi Tập Mới</h3>
              <p className="text-xs text-muted-foreground">Đăng cung đường GPS hoặc ảnh check-in lên bảng tin hồ sơ.</p>
            </div>
            <textarea
              rows={3}
              placeholder="Hôm nay buổi chạy thế nào? Cung đường có đẹp không?..."
              className="w-full p-3 rounded-2xl bg-muted/60 border border-border text-foreground text-xs leading-relaxed outline-none focus:border-brand"
            />
            <Button
              onClick={() => {
                alert("Đã đăng bài tập luyện mới thành công!");
                setIsNewPostModalOpen(false);
              }}
              className="w-full rounded-xl bg-brand text-white font-bold text-xs h-10"
            >
              Đăng Ngay
            </Button>
          </div>
        </div>
      )}

      {/* MODAL: GHI BUỔI TẬP VÀO LỊCH */}
      <LogWorkoutSheet
        open={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        onSave={(data) => {
          alert(`Đã ghi nhận buổi tập: ${data.sport} (${data.minutes} phút) vào nhật ký.`);
          setIsScheduleModalOpen(false);
        }}
      />
    </div>
  );
}
