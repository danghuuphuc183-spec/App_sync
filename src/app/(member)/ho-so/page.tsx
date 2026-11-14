"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { TrainingLog } from "@/components/profile/training-log";
import { MyConnections, MyPosts, SocialStatsBar, type SocialTab } from "@/components/profile/my-social";
import { MyKeosSection } from "@/components/keo/my-keos";
import { CompactTrustScoreBar } from "@/components/profile/compact-trust-score-bar";
import { RankCard } from "@/components/profile/rank-card";
import { useKeoStore } from "@/features/keo/use-keo-store";
import {
  Shield,
  ShieldCheck,
  Download,
  Share2,
  QrCode,
  MapPin,
  TrendingUp,
  Activity,
  Dumbbell,
  Calendar,
  Settings,
  Edit3,
  BarChart2,
  Camera,
  X,
  Check,
  LogOut,
  RotateCcw,
  Sparkles,
  Upload,
  CalendarDays,
  Flame,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TierBadge } from "@/components/shared/tier-badge";
import { useAuth } from "@/context/auth-context";
import { cn } from "@/lib/utils";

// DANH SÁCH ẢNH ĐẠI DIỆN MẪU PHONG CÁCH THỂ THAO
const PRESET_AVATARS = [
  { id: "av-1", label: "Runner Nữ", url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=350&auto=format&fit=crop&q=80" },
  { id: "av-2", label: "Yoga & Stretching", url: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=350&auto=format&fit=crop&q=80" },
  { id: "av-3", label: "Runner Nam", url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=350&auto=format&fit=crop&q=80" },
  { id: "av-4", label: "Gym & Kháng Lực", url: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=350&auto=format&fit=crop&q=80" },
  { id: "av-5", label: "Marathoner Bền Bỉ", url: "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=350&auto=format&fit=crop&q=80" },
  { id: "av-6", label: "Vận Động Viên Đa Năng", url: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=350&auto=format&fit=crop&q=80" },
];

const MY_POSTS_GRID = [
  {
    src: "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=500&auto=format&fit=crop&q=80",
    caption: "10km sáng sớm Landmark 81 • Pace 5:35",
    likes: 42,
  },
  {
    src: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=500&auto=format&fit=crop&q=80",
    caption: "Legday Squat 75kg tại The New Gym",
    likes: 38,
  },
  {
    src: "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=500&auto=format&fit=crop&q=80",
    caption: "Long Run 15km bờ kè Thanh Đa",
    likes: 56,
  },
  {
    src: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=500&auto=format&fit=crop&q=80",
    caption: "Buổi giãn cơ & Core sau chạy",
    likes: 29,
  },
  {
    src: "https://images.unsplash.com/photo-1599058917212-d750089bc07e?w=500&auto=format&fit=crop&q=80",
    caption: "Tập cùng Squad FTU2 Run sáng T7",
    likes: 64,
  },
  {
    src: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop&q=80",
    caption: "Check-in hoàn thành kèo 8.5km với partner",
    likes: 47,
  },
];

// DỮ LIỆU BIỂU ĐỒ 7 NGÀY TRONG TUẦN (TUẦN NÀY)
const WEEK_DAYS = [
  { day: "T2", duration: 0, volume: 0, distance: 0, completed: false, label: "Nghỉ ngơi" },
  { day: "T3", duration: 58, volume: 0, distance: 10.2, completed: true, label: "Chạy 10.2km Landmark" },
  { day: "T4", duration: 0, volume: 0, distance: 0, completed: false, label: "Nghỉ ngơi" },
  { day: "T5", duration: 65, volume: 7.2, distance: 0, completed: true, label: "Gym Kháng lực Legday" },
  { day: "T6", duration: 0, volume: 0, distance: 0, completed: false, label: "Nghỉ ngơi" },
  { day: "T7", duration: 75, volume: 0, distance: 13.5, completed: true, label: "Long Run Thanh Đa" },
  { day: "CN", duration: 45, volume: 7.3, distance: 8.7, completed: true, label: "Easy Run & Kháng lực" },
];

export default function ProfilePage() {
  const router = useRouter();
  const { user, logout, toggleAppConnection } = useAuth();
  const keoStore = useKeoStore();

  const [metricTab, setMetricTab] = React.useState<"distance" | "duration" | "volume">("distance");
  type ProfileTab = "bounties" | "posts" | "fitness" | "friends" | "privacy";
  const [activeTab, setActiveTab] = React.useState<ProfileTab>("bounties");
  const [socialTab, setSocialTab] = React.useState<SocialTab>("friends");
  const tabsRef = React.useRef<HTMLDivElement>(null);

  const openSection = (target: "posts" | SocialTab) => {
    if (target === "posts") setActiveTab("posts");
    else {
      setSocialTab(target);
      setActiveTab("friends");
    }
    requestAnimationFrame(() => tabsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
  };

  // Mở tab tương ứng khi có search params (VD: ?tab=bounties từ Lên kèo)
  React.useEffect(() => {
    const tabParam = new URLSearchParams(window.location.search).get("tab");
    if (tabParam === "bounties") setActiveTab("bounties");
    else if (tabParam === "posts") setActiveTab("posts");
    else if (tabParam === "fitness") setActiveTab("fitness");
    else if (tabParam === "friends") setActiveTab("friends");
    else if (tabParam === "privacy") setActiveTab("privacy");
  }, []);

  // Modals state
  const [isQrModalOpen, setIsQrModalOpen] = React.useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = React.useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = React.useState(false);
  const [copiedLink, setCopiedLink] = React.useState(false);
  const [qrCountdown, setQrCountdown] = React.useState(30);
  const [isExporting, setIsExporting] = React.useState<boolean>(false);

  // Editable profile state
  const [profileName, setProfileName] = React.useState(user?.name || "Minh Thư");
  const [profileAvatar, setProfileAvatar] = React.useState(
    user?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=250&auto=format&fit=crop&q=80"
  );
  const [profileBio, setProfileBio] = React.useState(
    "Pace 5:30 - 5:45/km. Kỷ luật cao, đúng giờ 100%, không hủy kèo phút chót. Tìm bạn chạy Landmark 81 & tập tạ The New Gym."
  );
  const [profilePace, setProfilePace] = React.useState("5:30 - 5:45/km");
  const [profileArea, setProfileArea] = React.useState("Bình Thạnh & Q.1, TP.HCM");

  // Timer for dynamic QR code refresh
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

  const handleCopyLink = () => {
    navigator.clipboard?.writeText?.("https://syncsport.app/v/minhthu_runner");
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const totalMyKeos = keoStore.mine.filter((k) => k.status !== "cancelled").length + keoStore.joined.size;

  return (
    <div className="flex flex-col w-full pb-20 space-y-3.5 px-3 pt-1 max-w-2xl mx-auto">
      {/* =================================================================== */}
      {/* 1. ATHLETE COVER & STATUS BAR (TINH GỌN, GIỮ NGUYÊN NỘI DUNG CHÍNH) */}
      {/* =================================================================== */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-brand via-black to-brand-800 text-white p-4 shadow-md border border-brand-300/20">
        <div className="absolute top-0 right-0 w-44 h-44 bg-brand-sky/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-brand-100/5 rounded-full blur-xl pointer-events-none" />

        {/* Top Actions: @Handle + Các nút công cụ */}
        <div className="flex items-center justify-between relative z-10 pb-3">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-mono font-bold tracking-tight text-brand-200">@minhthu_runner</span>
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" title="Đang online sẵn sàng tập" />
          </div>

          <div className="flex items-center gap-1.5">
            {/* Nút Chỉnh sửa profile nổi bật */}
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-white/15 hover:bg-white/25 text-white transition-all active:scale-95"
              title="Chỉnh sửa hồ sơ cá nhân"
            >
              <Edit3 className="h-3 w-3" />
              <span>Sửa hồ sơ</span>
            </button>

            <button
              onClick={() => setIsQrModalOpen(true)}
              aria-label="Mã QR Điểm Hẹn"
              className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors active:scale-95"
              title="Mã QR Điểm Hẹn"
            >
              <QrCode className="h-4 w-4" />
            </button>
            <button
              onClick={handleCopyLink}
              aria-label="Chia sẻ hồ sơ"
              className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors active:scale-95"
              title="Chia sẻ hồ sơ"
            >
              {copiedLink ? <Check className="h-4 w-4 text-emerald-300" /> : <Share2 className="h-4 w-4" />}
            </button>
            <button
              onClick={() => setActiveTab("privacy")}
              aria-label="Cài đặt riêng tư"
              className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors active:scale-95"
              title="Cài đặt quyền riêng tư"
            >
              <Settings className="h-4 w-4" />
            </button>
            <button
              onClick={() => setIsLogoutModalOpen(true)}
              aria-label="Đăng xuất"
              className="p-1.5 rounded-full bg-white/10 hover:bg-red-500/35 text-white border border-white/20 transition-all active:scale-95"
              title="Đăng xuất"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Athlete Core Identity (Có thể thay đổi ảnh đại diện) */}
        <div className="flex items-start gap-3.5 relative z-10">
          <div className="relative shrink-0 group">
            <div className="w-16 h-16 rounded-2xl p-0.5 bg-gradient-to-tr from-brand-sky via-brand-100 to-white shadow-md overflow-hidden">
              <img
                src={profileAvatar}
                alt={profileName}
                className="w-full h-full rounded-2xl object-cover"
              />
            </div>
            {/* Nút bấm thay đổi avatar */}
            <button
              type="button"
              onClick={() => setIsAvatarModalOpen(true)}
              aria-label="Đổi ảnh đại diện"
              className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-brand text-white border border-white/80 flex items-center justify-center shadow-md hover:scale-105 active:scale-95 transition-all"
              title="Bấm để đổi ảnh đại diện"
            >
              <Camera className="h-3 w-3" />
            </button>
          </div>

          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h1 className="text-base font-extrabold tracking-tight text-white">{profileName}</h1>
              <TierBadge score={user?.trustScore || 8.5} />
            </div>

            <div className="flex items-center gap-1 text-[11px] text-brand-200/90">
              <MapPin className="h-3 w-3 shrink-0 text-white" />
              <span className="truncate">{profileArea}</span>
            </div>

            <div className="flex items-center gap-1.5 text-[10px] text-white/80 pt-0.5">
              <span className="px-1.5 py-0.5 rounded-md bg-white/15 font-semibold">Bán Chuyên</span>
              <span>•</span>
              <span className="text-brand-200 font-semibold">CLB FTU2 Run</span>
            </div>
          </div>
        </div>

        {/* Athlete Bio snippet - Tinh gọn */}
        <p className="text-xs text-white/85 leading-relaxed pt-2 relative z-10 line-clamp-2">
          {profileBio}
        </p>

        {/* 4 Chỉ số nhanh (Loại bỏ các chú thích rườm rà phía dưới) */}
        <div className="grid grid-cols-4 gap-1 text-center pt-2.5 mt-2.5 border-t border-white/10 relative z-10">
          <div className="px-1">
            <div className="text-base font-black text-white">28</div>
            <div className="text-[10px] text-brand-200 font-semibold">Kèo tập</div>
          </div>
          <div className="px-1 border-l border-white/10">
            <div className="text-base font-black text-brand-200">96%</div>
            <div className="text-[10px] text-white/80 font-semibold">Đúng giờ</div>
          </div>
          <div className="px-1 border-l border-white/10">
            <div className="text-base font-black text-white">{(user?.trustScore || 8.5).toFixed(1)}</div>
            <div className="text-[10px] text-brand-200 font-semibold">Điểm UT</div>
          </div>
          <div className="px-1 border-l border-white/10">
            <div className="text-base font-black text-emerald-300">32.4</div>
            <div className="text-[10px] text-white/80 font-semibold">km tuần</div>
          </div>
        </div>
      </div>

      {/* =================================================================== */}
      {/* 2. ĐIỂM UY TÍN (THANH DÀI NGANG TINH GỌN + CHÚ THÍCH CÁCH TÍNH & TRỪ) */}
      {/* =================================================================== */}
      <CompactTrustScoreBar score={user?.trustScore || 8.5} />

      {/* =================================================================== */}
      {/* 3. GHI NHẬN TẬP LUYỆN (ĐƯỢC ĐẨY LÊN TRƯỚC PHẦN CẤP LUYỆN TẬP) */}
      {/* =================================================================== */}
      <TrainingLog />

      {/* =================================================================== */}
      {/* 4. CẤP TẬP LUYỆN (LÀM NHỎ LẠI THEO YÊU CẦU) */}
      {/* =================================================================== */}
      <RankCard verifiedSessions={28} compact={true} />

      {/* =================================================================== */}
      {/* 5. TABS NỘI DUNG TINH GỌN (CHỨA KÈO CỦA BẠN CHUYỂN TỪ TRANG LÊN KÈO) */}
      {/* =================================================================== */}
      <div
        ref={tabsRef}
        className="scroll-mt-16 flex gap-1 p-1 rounded-2xl bg-muted/70 border border-border/80 overflow-x-auto no-scrollbar"
        role="tablist"
      >
        {(
          [
            { id: "bounties", label: `Kèo của bạn ${totalMyKeos > 0 ? `(${totalMyKeos})` : ""}` },
            { id: "posts", label: "Khoảnh khắc" },
            { id: "fitness", label: "Thể lực & Thiết bị" },
            { id: "friends", label: "Bạn bè" },
            { id: "privacy", label: "Riêng tư" },
          ] as { id: ProfileTab; label: string }[]
        ).map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={activeTab === t.id}
            onClick={() => setActiveTab(t.id)}
            className={cn(
              "shrink-0 px-3.5 py-1.5 rounded-xl text-[12px] font-bold text-center whitespace-nowrap transition-all",
              activeTab === t.id ? "bg-brand text-white shadow-xs" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* =================================================================== */}
      {/* TAB 1: KÈO CỦA BẠN (CHUYỂN TỪ TRANG LÊN KÈO SANG) */}
      {/* =================================================================== */}
      {activeTab === "bounties" && (
        <div className="space-y-3">
          <MyKeosSection />
        </div>
      )}

      {/* =================================================================== */}
      {/* TAB 2: KHOẢNH KHẮC & BÀI VIẾT */}
      {/* =================================================================== */}
      {activeTab === "posts" && (
        <div className="space-y-3">
          {/* Photos Grid */}
          <div className="p-3.5 rounded-3xl bg-card border border-border shadow-xs space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-foreground px-0.5">
              <span>Khoảnh khắc tập luyện ({MY_POSTS_GRID.length})</span>
              <span className="text-[10px] text-muted-foreground font-normal">Ảnh gần nhất</span>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {MY_POSTS_GRID.map((p, i) => (
                <div
                  key={i}
                  className="aspect-square rounded-2xl overflow-hidden bg-muted border border-border relative group shadow-xs"
                >
                  <img src={p.src} alt={p.caption} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end p-1.5">
                    <span className="text-[9px] font-bold text-white truncate">{p.caption.split("•")[0]}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <MyPosts />
        </div>
      )}

      {/* =================================================================== */}
      {/* TAB 3: THỂ LỰC & THIẾT BỊ (GỒM NHỊP ĐIỆU TUẦN VÀ INBODY) */}
      {/* =================================================================== */}
      {activeTab === "fitness" && (
        <div className="space-y-3">
          {/* Nhịp Điệu Tập Luyện Tuần Này (7-Day Visual Bars) */}
          <div className="rounded-3xl border border-border bg-card p-3.5 space-y-2.5 shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-black text-foreground flex items-center gap-1.5">
                  <BarChart2 className="h-4 w-4 text-foreground" />
                  <span>Nhịp Điệu Tập Luyện Tuần Này</span>
                </div>
                <div className="text-[10px] text-muted-foreground">
                  3 buổi hoàn thành • Chuỗi 14 ngày kỷ luật
                </div>
              </div>

              {/* Metric Selector Tabs */}
              <div className="flex items-center p-0.5 rounded-lg bg-muted text-[10px] font-bold">
                <button
                  onClick={() => setMetricTab("distance")}
                  className={cn(
                    "px-2 py-0.5 rounded-md transition-all",
                    metricTab === "distance" ? "bg-brand text-white shadow-xs" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  Cự ly
                </button>
                <button
                  onClick={() => setMetricTab("duration")}
                  className={cn(
                    "px-2 py-0.5 rounded-md transition-all",
                    metricTab === "duration" ? "bg-brand text-white shadow-xs" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  Thời gian
                </button>
                <button
                  onClick={() => setMetricTab("volume")}
                  className={cn(
                    "px-2 py-0.5 rounded-md transition-all",
                    metricTab === "volume" ? "bg-brand text-white shadow-xs" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  Khối lượng
                </button>
              </div>
            </div>

            {/* 7-Day Bars */}
            <div className="grid grid-cols-7 gap-1 pt-3 pb-1 items-end h-28 border-b border-border/50">
              {WEEK_DAYS.map((d, index) => {
                let heightPercent = 10;
                let displayVal = "0";

                if (metricTab === "distance") {
                  heightPercent = d.distance > 0 ? Math.min(100, (d.distance / 15) * 100) : 10;
                  displayVal = d.distance > 0 ? `${d.distance}k` : "—";
                } else if (metricTab === "duration") {
                  heightPercent = d.duration > 0 ? Math.min(100, (d.duration / 80) * 100) : 10;
                  displayVal = d.duration > 0 ? `${d.duration}p` : "—";
                } else {
                  heightPercent = d.volume > 0 ? Math.min(100, (d.volume / 10) * 100) : 10;
                  displayVal = d.volume > 0 ? `${d.volume}T` : "—";
                }

                return (
                  <div key={index} className="flex flex-col items-center gap-1.5 h-full justify-end group">
                    <span className="text-[9px] font-bold text-muted-foreground group-hover:text-foreground transition-colors">
                      {displayVal}
                    </span>
                    <div className="w-full max-w-[26px] bg-muted/60 rounded-t-lg overflow-hidden flex flex-col justify-end h-16">
                      <div
                        style={{ height: `${heightPercent}%` }}
                        className={cn(
                          "w-full rounded-t-md transition-all duration-300",
                          d.completed ? "bg-gradient-to-t from-brand to-brand-sky" : "bg-muted-foreground/20"
                        )}
                      />
                    </div>
                    <div
                      className={cn(
                        "text-[10px] font-black rounded-full h-5 w-5 flex items-center justify-center transition-all",
                        d.completed ? "bg-brand text-white" : "text-muted-foreground"
                      )}
                    >
                      {d.day}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between text-[10px] text-muted-foreground px-1">
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-brand inline-block" />
                <span>Hoàn thành đúng lịch</span>
              </span>
              <span>Tổng tuần: 32.4 km • 14.5 Tấn</span>
            </div>
          </div>

          {/* Chỉ số nhanh 2x2 InBody */}
          <div className="grid grid-cols-2 gap-2">
            <div className="p-3 rounded-2xl bg-card border border-border shadow-xs space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                <Activity className="h-3.5 w-3.5 text-foreground" />
                <span>Chỉ Số Hình Thể</span>
              </div>
              <div className="text-xs font-black text-foreground">162 cm • 51 kg</div>
              <div className="text-[10px] text-muted-foreground">Mỡ: 19.5% • HR Max 182 bpm</div>
            </div>

            <div className="p-3 rounded-2xl bg-card border border-border shadow-xs space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                <TrendingUp className="h-3.5 w-3.5 text-foreground" />
                <span>Pace & Kỷ Lục</span>
              </div>
              <div className="text-xs font-black text-foreground">{profilePace}</div>
              <div className="text-[10px] text-muted-foreground">Kỷ lục HM: 21.1km (1h58m)</div>
            </div>
          </div>

          {/* Strava & Hevy Connected Apps */}
          <div className="p-3.5 rounded-3xl bg-card border border-border shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-bold text-xs text-foreground">
                <TrendingUp className="h-4 w-4 text-brand dark:text-brand-sky" />
                <span>Ứng Dụng Đã Đồng Bộ</span>
              </div>
              <span className="text-[10px] text-emerald-600 font-bold">2 ứng dụng liên kết</span>
            </div>

            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between p-2 rounded-xl bg-muted/40">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-[#FC4C02] text-white flex items-center justify-center font-black text-[10px]">
                    S
                  </div>
                  <div>
                    <span className="font-bold text-foreground block text-[11px]">Strava GPS</span>
                    <span className="text-[9.5px] text-muted-foreground">Pace TB 5:45/km • Tuần 32.4 km</span>
                  </div>
                </div>
                <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[9px] font-bold">Tự động</Badge>
              </div>

              <div className="flex items-center justify-between p-2 rounded-xl bg-muted/40">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-blue-600 text-white flex items-center justify-center font-black text-[10px]">
                    H
                  </div>
                  <div>
                    <span className="font-bold text-foreground block text-[11px]">Hevy Workout</span>
                    <span className="text-[9.5px] text-muted-foreground">Volume Load 14.5 Tấn • 4 buổi/tuần</span>
                  </div>
                </div>
                <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[9px] font-bold">Tự động</Badge>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* TAB 4: BẠN BÈ & KẾT NỐI */}
      {/* =================================================================== */}
      {activeTab === "friends" && (
        <div className="space-y-3">
          <SocialStatsBar onSelect={openSection} />
          <MyConnections initialTab={socialTab} />
        </div>
      )}

      {/* =================================================================== */}
      {/* TAB 5: RIÊNG TƯ & CÀI ĐẶT */}
      {/* =================================================================== */}
      {activeTab === "privacy" && (
        <div className="space-y-3">
          <div className="p-4 rounded-3xl bg-card border border-border shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <Shield className="h-4 w-4 text-brand dark:text-brand-sky" />
              <span>Quyền Riêng Tư & An Toàn PDP 2026</span>
            </h3>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Dữ liệu vị trí thực và thông tin cá nhân của bạn chỉ hiển thị khi có sự đồng ý song phương trong buổi tập.
            </p>

            <div className="space-y-2 pt-1 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-muted/40">
                <div>
                  <span className="font-bold text-foreground block text-[11.5px]">Ẩn vị trí chính xác</span>
                  <span className="text-[10px] text-muted-foreground">Chỉ hiển thị bán kính 500m quanh điểm hẹn</span>
                </div>
                <span className="text-[11px] font-bold text-emerald-500">Đang bật</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-muted/40">
                <div>
                  <span className="font-bold text-foreground block text-[11.5px]">Chỉ ghép bạn cùng giới</span>
                  <span className="text-[10px] text-muted-foreground">Tự động lọc kèo tập theo giới tính</span>
                </div>
                <span className="text-[11px] font-bold text-muted-foreground">Tùy chọn</span>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-card border border-border shadow-xs space-y-2.5">
            <h3 className="text-xs font-bold text-foreground">Bảo Mật Tài Khoản</h3>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Phương thức đăng nhập:</span>
              <span className="font-bold text-foreground capitalize">{user?.authProvider || "Số điện thoại / Google"}</span>
            </div>
            <div className="pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsLogoutModalOpen(true)}
                className="w-full text-xs h-9 rounded-xl font-bold text-red-600 dark:text-red-400 border-red-500/30 hover:bg-red-500/10"
              >
                <LogOut className="h-3.5 w-3.5 mr-1.5" />
                Đăng Xuất Khỏi Thiết Bị
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL 1: ĐỔI ẢNH ĐẠI DIỆN (CHỌN AVATAR MẪU HOẶC TẢI ẢNH) */}
      {/* =================================================================== */}
      {isAvatarModalOpen && (
        <div className="fixed inset-0 z-[80] bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-card border border-border w-full max-w-sm rounded-3xl p-5 space-y-4 shadow-2xl relative text-center">
            <button
              onClick={() => setIsAvatarModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-muted text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="space-y-1">
              <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-brand dark:text-brand-sky">
                <Camera className="h-4 w-4" />
                <span>ẢNH ĐẠI DIỆN HỒ SƠ</span>
              </div>
              <h2 className="text-base font-extrabold text-foreground">Thay Đổi Ảnh Đại Diện</h2>
              <p className="text-[11.5px] text-muted-foreground leading-relaxed">
                Tính năng tải trực tiếp từ thư viện ảnh thiết bị đang được hoàn thiện. Tạm thời bạn có thể chọn ngay ảnh phong cách thể thao có sẵn dưới đây:
              </p>
            </div>

            {/* Avatar hiện tại preview */}
            <div className="flex flex-col items-center py-1">
              <div className="w-20 h-20 rounded-2xl p-0.5 bg-gradient-to-tr from-brand-sky to-brand overflow-hidden shadow-md">
                <img src={profileAvatar} alt="Xem trước avatar" className="w-full h-full object-cover rounded-2xl" />
              </div>
              <span className="text-[11px] text-muted-foreground mt-1">Ảnh đại diện đang dùng</span>
            </div>

            {/* Lưới các Avatar thể thao có sẵn */}
            <div className="space-y-1.5 text-left">
              <label className="text-[11px] font-bold text-foreground">Chọn ảnh đại diện thể thao:</label>
              <div className="grid grid-cols-3 gap-2">
                {PRESET_AVATARS.map((av) => (
                  <button
                    key={av.id}
                    type="button"
                    onClick={() => setProfileAvatar(av.url)}
                    className={cn(
                      "relative aspect-square rounded-xl overflow-hidden border-2 transition-all p-0.5",
                      profileAvatar === av.url ? "border-brand dark:border-brand-sky scale-105 shadow-md" : "border-border hover:border-brand/40 opacity-70 hover:opacity-100"
                    )}
                  >
                    <img src={av.url} alt={av.label} className="w-full h-full object-cover rounded-lg" />
                    {profileAvatar === av.url && (
                      <span className="absolute bottom-1 right-1 h-4 w-4 rounded-full bg-brand text-white flex items-center justify-center shadow-xs">
                        <Check className="h-2.5 w-2.5" />
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Nút giả lập tải ảnh từ máy */}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                alert("Tính năng tải ảnh trực tiếp từ bộ nhớ đang được hoàn thiện và sẽ sớm cập nhật trong bản tới. Bạn vui lòng chọn ảnh thể thao có sẵn ở trên nhé!");
              }}
              className="w-full text-xs font-semibold h-9 rounded-xl border-dashed"
            >
              <Upload className="h-3.5 w-3.5 mr-1.5" />
              <span>Tải ảnh từ máy (Sắp ra mắt)</span>
            </Button>

            <Button
              onClick={() => {
                setIsAvatarModalOpen(false);
              }}
              className="w-full rounded-xl text-xs font-bold bg-brand text-white h-10"
            >
              Xác Nhận Đổi Ảnh
            </Button>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL 2: CHỈNH SỬA HỒ SƠ VĐV */}
      {/* =================================================================== */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-[80] bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
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
                <span>Chỉnh Sửa Hồ Sơ Cá Nhân</span>
              </h2>
              <p className="text-[11px] text-muted-foreground">
                Cập nhật thông tin để gợi ý ghép bạn tập chính xác hơn.
              </p>
            </div>

            <div className="space-y-2.5 text-xs">
              <div>
                <label className="text-[11px] font-bold text-foreground block mb-1">Họ và tên hiển thị:</label>
                <input
                  type="text"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-muted/60 border border-border text-foreground font-semibold outline-none focus:border-brand"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-foreground block mb-1">Giới thiệu ngắn (Bio):</label>
                <textarea
                  rows={2}
                  value={profileBio}
                  onChange={(e) => setProfileBio(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl bg-muted/60 border border-border text-foreground text-xs leading-relaxed outline-none focus:border-brand"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-foreground block mb-1">Cự ly & Pace tập quen thuộc:</label>
                <input
                  type="text"
                  value={profilePace}
                  onChange={(e) => setProfilePace(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-muted/60 border border-border text-foreground font-semibold outline-none focus:border-brand"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-foreground block mb-1">Khu vực tập luyện thường xuyên:</label>
                <input
                  type="text"
                  value={profileArea}
                  onChange={(e) => setProfileArea(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-muted/60 border border-border text-foreground font-semibold outline-none focus:border-brand"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => setIsEditModalOpen(false)}
                className="flex-1 rounded-xl text-xs font-semibold h-10"
              >
                Hủy
              </Button>
              <Button
                onClick={() => {
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

      {/* =================================================================== */}
      {/* MODAL 3: CHECK-IN QR ĐIỂM HẸN */}
      {/* =================================================================== */}
      {isQrModalOpen && (
        <div className="fixed inset-0 z-[80] bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-card border border-border w-full max-w-sm rounded-3xl p-5 space-y-4 shadow-2xl relative text-center">
            <button
              onClick={() => setIsQrModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-muted text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="space-y-1">
              <div className="flex items-center justify-center gap-1.5 text-xs font-black text-brand dark:text-brand-sky">
                <QrCode className="h-4 w-4" />
                <span>QUÉT MÃ ĐIỂM HẸN 2 CHIỀU</span>
              </div>
              <h2 className="text-base font-extrabold text-foreground">Điểm Danh Đúng Hẹn</h2>
              <p className="text-[11px] text-muted-foreground">
                Cùng đưa mã QR lại gần điện thoại của bạn tập để hệ thống ghi nhận có mặt đúng giờ.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white border-2 border-brand/20 flex flex-col items-center justify-center space-y-2 shadow-inner mx-auto w-48 h-48">
              <div className="w-36 h-36 border-4 border-slate-900 rounded-xl p-2 flex flex-col justify-between bg-white relative">
                <div className="w-8 h-8 bg-slate-900 rounded-xs" />
                <div className="absolute top-2 right-2 w-8 h-8 bg-slate-900 rounded-xs" />
                <div className="absolute bottom-2 left-2 w-8 h-8 bg-slate-900 rounded-xs" />
                <div className="absolute inset-10 grid grid-cols-4 gap-1 p-1">
                  <div className="bg-slate-900 rounded-xs" />
                  <div className="bg-slate-400 rounded-xs" />
                  <div className="bg-slate-900 rounded-xs" />
                  <div className="bg-slate-900 rounded-xs" />
                  <div className="bg-slate-900 rounded-xs" />
                  <div className="bg-slate-300 rounded-xs" />
                  <div className="bg-slate-900 rounded-xs" />
                  <div className="bg-slate-900 rounded-xs" />
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-7 h-7 rounded-md bg-muted text-foreground flex items-center justify-center shadow-xs">
                    <Shield className="h-4 w-4" />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-xs font-mono font-bold text-foreground">
                Mã xác thực: <span className="text-brand dark:text-brand-sky">SYNC-81-MT-2026</span>
              </div>
              <div className="text-[10px] text-muted-foreground">
                Tự động đổi mã sau: <strong className="text-foreground">{qrCountdown}s</strong>
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <Button
                variant="outline"
                onClick={() => {
                  alert("Mở camera quét mã QR của bạn tập...");
                }}
                className="flex-1 rounded-xl text-xs font-bold h-10"
              >
                <Camera className="h-3.5 w-3.5 mr-1" />
                <span>Quét mã bạn tập</span>
              </Button>
              <Button
                onClick={() => {
                  alert("Điểm danh thành công! Cả 2 đã đúng hẹn. +0,5 UT cho mỗi người.");
                  setIsQrModalOpen(false);
                }}
                className="flex-1 rounded-xl text-xs font-bold bg-brand text-white h-10"
              >
                Xác nhận đã gặp
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL 4: XÁC NHẬN ĐĂNG XUẤT */}
      {/* =================================================================== */}
      {isLogoutModalOpen && (
        <div className="fixed inset-0 z-[90] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-card border border-border w-full max-w-sm rounded-3xl p-5 space-y-4 shadow-2xl relative text-center">
            <div className="w-12 h-12 rounded-2xl bg-muted border border-border flex items-center justify-center mx-auto text-foreground">
              <LogOut className="h-6 w-6" />
            </div>

            <div className="space-y-1">
              <h2 className="text-base font-extrabold text-foreground">Đăng Xuất Khỏi SYNESIS?</h2>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Bạn có chắc chắn muốn đăng xuất? Các kèo thể thao đang tham gia và Điểm Uy tín (UT) của bạn vẫn được lưu trữ an toàn.
              </p>
            </div>

            <div className="flex gap-2 pt-1">
              <Button
                variant="outline"
                onClick={() => setIsLogoutModalOpen(false)}
                className="flex-1 rounded-xl text-xs font-semibold h-10"
              >
                Ở lại tập tiếp
              </Button>
              <Button
                onClick={() => {
                  setIsLogoutModalOpen(false);
                  logout();
                  router.push("/dang-nhap");
                }}
                className="flex-1 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white h-10"
              >
                Đăng Xuất
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
