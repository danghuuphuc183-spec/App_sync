"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { TrainingLog } from "@/components/profile/training-log";
import { MyConnections, MyPosts, SocialStatsBar, type SocialTab } from "@/components/profile/my-social";
import { useKeoStore } from "@/features/keo/use-keo-store";
import { SEED_KEOS, hostOf, hostTrust } from "@/features/keo/keo.data";
import { PEOPLE } from "@/features/feed/feed.data";
import {
  Shield,
  ShieldCheck,
  Download,
  Share2,
  VolumeX,
  QrCode,
  MapPin,
  TrendingUp,
  Activity,
  Lock,
  EyeOff,
  UserCheck,
  Dumbbell,
  Calendar,
  Settings,
  Edit3,
  BarChart2,
  ChevronRight,
  Sunrise,
  Handshake,
  Flame,
  Award,
  Clock,
  CheckCircle2,
  Sparkles,
  Camera,
  X,
  Copy,
  ExternalLink,
  Info,
  Check,
  LogOut,
  Fingerprint,
  Bell,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrustMeter } from "@/components/shared/trust-meter";
import { TierBadge } from "@/components/shared/tier-badge";
import { useAuth } from "@/context/auth-context";
import { cn } from "@/lib/utils";

// 6 HUY HIỆU KỶ LUẬT (ICON TRẮNG ĐEN MONOCHROME THEO YÊU CẦU)
const SYSTEM_BADGES = [
  { id: "early_bird", icon: Sunrise, title: "Early Bird", desc: "Hoàn thành 5 buổi tập trước 7h sáng", unlocked: true, progress: "5/5 buổi" },
  { id: "reliable_partner", icon: Handshake, title: "Reliable Partner", desc: "10 kèo liên tiếp không no-show", unlocked: true, progress: "10/10 kèo" },
  { id: "duo_streak", icon: Flame, title: "Duo Streak", desc: "Tập cùng 1 partner 5 buổi liên tục", unlocked: true, progress: "5/5 buổi" },
  { id: "squad_builder", icon: Shield, title: "Squad Builder", desc: "Duy trì nhóm 3-4 người trong 4 tuần", unlocked: false, progress: "2/4 tuần" },
  { id: "mentor", icon: Award, title: "Mentor", desc: "Kèm 3 tân binh hoàn thành buổi đầu", unlocked: true, progress: "3/3 người" },
  { id: "local_legend", icon: MapPin, title: "Local Legend", desc: "Hoàn thành 20 buổi tại khu vực Bình Thạnh", unlocked: true, progress: "20/20 buổi" },
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

// KÈO CỦA TÔI (4 TRẠNG THÁI)
const MY_BOUNTIES = {
  upcoming: [
    {
      id: "b-up-1",
      title: "Chạy 10km sáng sớm ven sông Sài Gòn",
      partner: "Hoàng Nam",
      partnerAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
      partnerTs: 135,
      timeVi: "05:30 AM • Sáng mai (Thứ Hai)",
      location: "Công viên Landmark 81, Bình Thạnh",
      holdTs: 30,
      statusVi: "Đã chốt — Đang giữ cọc",
      canCheckin: true,
    },
  ],
  history: [
    {
      id: "b-his-1",
      title: "Chạy 8.5km bờ kè Hoàng Sa",
      partner: "Quốc Hưng",
      partnerAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
      partnerTs: 142,
      timeVi: "Hôm qua lúc 05:45 AM",
      location: "Chân cầu Thị Nghè, Bình Thạnh",
      holdTs: 20,
      statusVi: "Hoàn thành (+2 TS)",
      canCheckin: false,
    },
    {
      id: "b-his-2",
      title: "Đỡ tạ Spotter Ngực Dưới (Chest Day)",
      partner: "Tuấn Khang",
      partnerAvatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80",
      partnerTs: 118,
      timeVi: "3 ngày trước • 18:30 PM",
      location: "The New Gym Điện Biên Phủ",
      holdTs: 25,
      statusVi: "Hoàn thành (+2 TS)",
      canCheckin: false,
    },
  ],
  pending: [
    {
      id: "b-pen-1",
      title: "Chạy Easy 6km Sala Quận 2",
      partner: "Chờ đối phương xác nhận",
      partnerAvatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
      partnerTs: 110,
      timeVi: "06:00 AM • Thứ Bảy tuần này",
      location: "Khu đô thị Sala, TP. Thủ Đức",
      holdTs: 15,
      statusVi: "Đang chờ đối phương nhận kèo",
      canCheckin: false,
    },
  ],
  cancelled: [
    {
      id: "b-can-1",
      title: "Chạy chiều mưa Thanh Đa",
      partner: "Hải Yến",
      partnerAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
      partnerTs: 120,
      timeVi: "Tuần trước",
      location: "Bờ kè Thanh Đa",
      holdTs: 20,
      statusVi: "Đã hủy có báo trước 2h (Hoàn 100% TS)",
      canCheckin: false,
    },
  ],
};

export default function ProfilePage() {
  const router = useRouter();
  const { user, logout, updatePermissions, toggleBiometric, toggleAppConnection } = useAuth();

  const [metricTab, setMetricTab] = React.useState<"distance" | "duration" | "volume">("distance");
  type ProfileTab = "posts" | "friends" | "snapshot" | "bounties" | "badges" | "privacy";
  const [activeTab, setActiveTab] = React.useState<ProfileTab>("posts");
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
  const [bountySubTab, setBountySubTab] = React.useState<"upcoming" | "history" | "pending" | "cancelled">("upcoming");
  const keoStore = useKeoStore();

  // Mở thẳng tab "Kèo của tôi" khi đi từ Lên kèo (?tab=bounties)
  React.useEffect(() => {
    if (new URLSearchParams(window.location.search).get("tab") === "bounties") setActiveTab("bounties");
  }, []);

  // Kèo tạo/tham gia ở mục Lên kèo hiện ở "Sắp tới"
  const myBounties = React.useMemo(() => {
    const mine = [...keoStore.mine, ...SEED_KEOS.filter((k) => keoStore.joined.has(k.id))];
    const upcoming = mine.map((k) => {
      const partnerId = k.memberIds.find((id) => id !== "me");
      const guest = partnerId ? k.guestProfiles?.[partnerId] : undefined;
      const host = hostOf(k.mine ? (partnerId ?? "me") : k.hostId);
      const partner = guest ?? (host ? { name: host.name, avatar: host.avatar } : { name: "Đang chờ người nhận", avatar: PEOPLE.me!.avatar });
      return {
        id: k.id,
        title: k.title,
        partner: k.kind === "group" ? `${partner.name} · nhóm ${k.memberIds.length}/${k.capacity}` : partner.name,
        partnerAvatar: partner.avatar,
        partnerTs: partnerId ? hostTrust(partnerId) : 0,
        timeVi: `${k.time.from} – ${k.time.to} • ${k.time.day}`,
        location: k.place.name,
        holdTs: k.holdTs,
        statusVi: k.mine ? (k.memberIds.length >= k.capacity ? "Đã chốt — Đang giữ cọc" : "Đang chờ thêm người") : "Đã tham gia — Đang giữ cọc",
        canCheckin: true,
      };
    });
    return { ...MY_BOUNTIES, upcoming: [...upcoming, ...MY_BOUNTIES.upcoming] };
  }, [keoStore.mine, keoStore.joined]);

  // Privacy & PDP 2026 settings state
  const [ghostMode, setGhostMode] = React.useState<boolean>(false);
  const [hidePace, setHidePace] = React.useState<boolean>(false);
  const [hideExactLocation, setHideExactLocation] = React.useState<boolean>(true);
  const [clubOnlyBounties, setClubOnlyBounties] = React.useState<boolean>(false);
  const [sameGenderOnly, setSameGenderOnly] = React.useState<boolean>(false);
  const [isExporting, setIsExporting] = React.useState<boolean>(false);

  // Modals state
  const [isQrModalOpen, setIsQrModalOpen] = React.useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = React.useState(false);
  const [copiedLink, setCopiedLink] = React.useState(false);
  const [qrCountdown, setQrCountdown] = React.useState(30);

  // Editable profile state
  const [profileName, setProfileName] = React.useState("Minh Thư");
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

  return (
    <div className="flex flex-col w-full pb-16 space-y-3.5 px-3 pt-1">
      {/* 1. ATHLETE COVER & STATUS BAR */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-brand via-black to-brand-800 text-white p-4 shadow-md border border-brand-300/20">
        {/* Subtle athletic background glow */}
        <div className="absolute top-0 right-0 w-44 h-44 bg-brand-sky/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-brand-100/5 rounded-full blur-xl pointer-events-none" />

        {/* Top Actions on Card */}
        <div className="flex items-center justify-between relative z-10 pb-3">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-mono font-bold tracking-tight text-brand-200">@minhthu_runner</span>
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" title="Đang online sẵn sàng tập" />
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsQrModalOpen(true)}
              aria-label="Mã QR Điểm Hẹn"
              className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-brand-200 transition-colors active:scale-95"
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
              {copiedLink ? <Check className="h-4 w-4 text-emerald-400" /> : <Share2 className="h-4 w-4" />}
            </button>
            <button
              onClick={() => setIsEditModalOpen(true)}
              aria-label="Chỉnh sửa hồ sơ"
              className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors active:scale-95"
              title="Chỉnh sửa hồ sơ"
            >
              <Edit3 className="h-4 w-4" />
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
              className="p-1.5 rounded-full bg-red-500/20 hover:bg-red-500/35 text-red-200 border border-red-500/30 transition-all active:scale-95"
              title="Đăng xuất khỏi thiết bị"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Athlete Core Identity */}
        <div className="flex items-start gap-3.5 relative z-10">
          <div className="relative shrink-0">
            <div className="w-16 h-16 rounded-2xl p-0.5 bg-gradient-to-tr from-brand-sky via-brand-100 to-white shadow-md">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=250&auto=format&fit=crop&q=80"
                alt="Avatar Minh Thư"
                className="w-full h-full rounded-2xl object-cover"
              />
            </div>
            <span className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-brand border border-white/60 flex items-center justify-center shadow-xs">
              <CheckCircle2 className="h-3 w-3 text-brand-200" />
            </span>
          </div>

          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h1 className="text-base font-extrabold tracking-tight text-white">{profileName}</h1>
              <TierBadge tier="gold" />
            </div>

            <div className="flex items-center gap-1 text-[11px] text-brand-200/80">
              <MapPin className="h-3 w-3 shrink-0 text-brand-sky" />
              <span className="truncate">{profileArea}</span>
            </div>

            <div className="flex items-center gap-1.5 text-[10px] text-white/70 pt-0.5">
              <span className="px-1.5 py-0.5 rounded-md bg-white/10 font-medium">Bán Chuyên</span>
              <span>•</span>
              <span className="text-brand-200 font-medium">CLB FTU2 Run</span>
            </div>
          </div>
        </div>

        {/* Athlete Bio snippet */}
        <p className="text-xs text-white/80 leading-relaxed pt-2.5 pb-1 relative z-10 line-clamp-2">
          {profileBio}
        </p>

        {/* 4-Column Key Metrics Mobile Strip */}
        <div className="grid grid-cols-4 gap-1 text-center pt-3 mt-2 border-t border-white/10 relative z-10">
          <div className="px-1">
            <div className="text-base font-black text-white">28</div>
            <div className="text-[10px] text-brand-200/80 font-medium whitespace-nowrap">Kèo tập</div>
          </div>
          <div className="px-1 border-l border-white/10">
            <div className="text-base font-black text-brand-200">96%</div>
            <div className="text-[10px] text-white/70 font-medium whitespace-nowrap">Đúng giờ</div>
          </div>
          <div className="px-1 border-l border-white/10">
            <div className="text-base font-black text-white">125</div>
            <div className="text-[10px] text-brand-200/80 font-medium whitespace-nowrap">Điểm TS</div>
          </div>
          <div className="px-1 border-l border-white/10">
            <div className="text-base font-black text-emerald-300">32.4</div>
            <div className="text-[10px] text-white/70 font-medium whitespace-nowrap">km tuần</div>
          </div>
        </div>
      </div>

      {/* 1b. BÀI VIẾT · BẠN BÈ · ĐANG THEO DÕI · NGƯỜI THEO DÕI */}
      <SocialStatsBar onSelect={openSection} />

      {/* 2. VÍ KỶ LUẬT & ĐIỂM UY TÍN (TRUST SCORE CARD) */}
      <div className="rounded-3xl border border-border bg-card p-3.5 space-y-2.5 shadow-xs">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 font-bold text-foreground">
            <ShieldCheck className="h-4 w-4 text-brand dark:text-brand-sky" />
            <span>Ví Kỷ Luật & Điểm Uy Tín</span>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            Hạng Vàng (125 TS)
          </span>
        </div>

        <TrustMeter currentScore={125} heldScore={20} />

        <div className="grid grid-cols-3 gap-1.5 text-center text-xs pt-1">
          <div className="p-2 rounded-2xl bg-muted/40 border border-border/50">
            <div className="text-[9px] text-muted-foreground">Khả dụng</div>
            <div className="text-xs font-black text-foreground">105 TS</div>
          </div>
          <div className="p-2 rounded-2xl bg-muted/40 border border-border/50">
            <div className="text-[9px] text-muted-foreground">Đang cọc (1 kèo)</div>
            <div className="text-xs font-black text-amber-600 dark:text-amber-400">20 TS</div>
          </div>
          <div className="p-2 rounded-2xl bg-muted/40 border border-border/50">
            <div className="text-[9px] text-muted-foreground">Thẻ ân hạn</div>
            <div className="text-xs font-black text-emerald-600 dark:text-emerald-400">2 lượt</div>
          </div>
        </div>

        <div className="flex items-center justify-between text-[11px] pt-1 text-muted-foreground border-t border-border/40">
          <span>Khởi điểm 100 TS • Mốc 130 TS lên Kim Cương</span>
          <Link
            href="/vi-uy-tin"
            className="text-[10px] font-bold text-brand dark:text-brand-sky hover:underline flex items-center gap-0.5"
          >
            Chi tiết ví →
          </Link>
        </div>
      </div>

      {/* 2b. GHI NHẬN TẬP LUYỆN THEO NGÀY TRONG TUẦN & THÁNG (BẢN ĐỒ NHIỆT) */}
      <TrainingLog />

      {/* 3. NHỊP ĐIỆU TẬP LUYỆN TUẦN NÀY (7-DAY ACTIVITY RHYTHM CHART) */}
      <div className="rounded-3xl border border-border bg-card p-3.5 space-y-2.5 shadow-xs">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs font-black text-foreground flex items-center gap-1.5">
              <BarChart2 className="h-4 w-4 text-brand dark:text-brand-sky" />
              <span>Nhịp Điệu Tập Luyện Tuần Này</span>
            </div>
            <div className="text-[10px] text-muted-foreground">
              Đã hoàn thành 3 buổi • Chuỗi 14 ngày kỷ luật
            </div>
          </div>

          {/* Metric Selector Tabs */}
          <div className="flex items-center p-0.5 rounded-lg bg-muted text-[10px] font-bold">
            <button
              onClick={() => setMetricTab("distance")}
              className={cn(
                "px-2 py-0.5 rounded-md transition-all",
                metricTab === "distance"
                  ? "bg-brand text-white shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Cự ly
            </button>
            <button
              onClick={() => setMetricTab("duration")}
              className={cn(
                "px-2 py-0.5 rounded-md transition-all",
                metricTab === "duration"
                  ? "bg-brand text-white shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Thời gian
            </button>
            <button
              onClick={() => setMetricTab("volume")}
              className={cn(
                "px-2 py-0.5 rounded-md transition-all",
                metricTab === "volume"
                  ? "bg-brand text-white shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Khối lượng
            </button>
          </div>
        </div>

        {/* 7-Day Visual Bars */}
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
                      d.completed
                        ? "bg-gradient-to-t from-brand to-brand-sky"
                        : "bg-muted-foreground/20"
                    )}
                  />
                </div>
                <div
                  className={cn(
                    "text-[10px] font-black rounded-full h-5 w-5 flex items-center justify-center transition-all",
                    d.completed
                      ? "bg-brand text-white"
                      : "text-muted-foreground"
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
            <span>Ngày hoàn thành</span>
          </span>
          <span>Tổng tuần: 32.4 km • 14.5 Tấn • 243 Phút</span>
        </div>
      </div>

      {/* 4. CHỈ SỐ NHANH 2x2 (INBODY & THỂ LỰC) */}
      <div className="grid grid-cols-2 gap-2">
        <div className="p-3 rounded-2xl bg-card border border-border shadow-xs space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
            <Activity className="h-3.5 w-3.5 text-brand dark:text-brand-sky" />
            <span>Chỉ Số Hình Thể</span>
          </div>
          <div className="text-xs font-black text-foreground">162 cm • 51 kg</div>
          <div className="text-[10px] text-muted-foreground">Mỡ: 19.5% • HR Max 182 bpm</div>
        </div>

        <div className="p-3 rounded-2xl bg-card border border-border shadow-xs space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
            <TrendingUp className="h-3.5 w-3.5 text-brand dark:text-brand-sky" />
            <span>Pace & Kỷ Lục</span>
          </div>
          <div className="text-xs font-black text-foreground">{profilePace}</div>
          <div className="text-[10px] text-muted-foreground">Kỷ lục HM: 21.1km (1h58m)</div>
        </div>

        <div className="p-3 rounded-2xl bg-card border border-border shadow-xs space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
            <Calendar className="h-3.5 w-3.5 text-brand dark:text-brand-sky" />
            <span>Lịch Tập Cố Định</span>
          </div>
          <div className="text-xs font-black text-foreground">Sáng 05:30 AM</div>
          <div className="text-[10px] text-muted-foreground">Thứ 3 • Thứ 5 • Thứ 7</div>
        </div>

        <div className="p-3 rounded-2xl bg-card border border-border shadow-xs space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
            <MapPin className="h-3.5 w-3.5 text-brand dark:text-brand-sky" />
            <span>Cung Đường Quen</span>
          </div>
          <div className="text-xs font-black text-foreground truncate">Công viên Landmark 81</div>
          <div className="text-[10px] text-muted-foreground truncate">& Bờ kè Thanh Đa</div>
        </div>
      </div>

      {/* 5. TABS: Bài viết · Bạn bè · Thể lực · Kèo · Huy hiệu · Riêng tư */}
      <div ref={tabsRef} className="scroll-mt-16 flex gap-1 p-1 rounded-2xl bg-muted/70 border border-border/80 overflow-x-auto no-scrollbar" role="tablist">
        {(
          [
            { id: "posts", label: "Bài viết" },
            { id: "friends", label: "Bạn bè" },
            { id: "snapshot", label: "Thể lực" },
            { id: "bounties", label: `Kèo (${myBounties.upcoming.length + myBounties.pending.length})` },
            { id: "badges", label: "Huy hiệu" },
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

      {activeTab === "posts" && <MyPosts />}
      {activeTab === "friends" && <MyConnections initialTab={socialTab} />}

      {/* =================================================================== */}
      {/* 6. TAB 1: THỂ LỰC & ẢNH KHOẢNH KHẮC */}
      {/* =================================================================== */}
      {activeTab === "snapshot" && (
        <div className="space-y-3">
          {/* Strava Sync Card */}
          <div className="p-3 rounded-3xl bg-card border border-border shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-bold text-xs text-foreground">
                <TrendingUp className="h-4 w-4 text-brand-600 stroke-[2]" />
                <span>Chạy Bộ (Strava Linked)</span>
              </div>
              <Badge className="bg-brand-600/10 text-brand-700 dark:text-brand-400 border border-brand-600/20 text-[9px] font-bold">
                Đồng bộ tự động
              </Badge>
            </div>
            <div className="grid grid-cols-3 gap-1.5 text-center text-xs">
              <div className="p-2 rounded-xl bg-muted/40">
                <div className="text-[9px] text-muted-foreground">Pace TB</div>
                <div className="font-black text-foreground">5:45/km</div>
              </div>
              <div className="p-2 rounded-xl bg-muted/40">
                <div className="text-[9px] text-muted-foreground">Tuần này</div>
                <div className="font-black text-brand dark:text-brand-sky">32.4 km</div>
              </div>
              <div className="p-2 rounded-xl bg-muted/40">
                <div className="text-[9px] text-muted-foreground">Long Run</div>
                <div className="font-black text-foreground">21.1 km</div>
              </div>
            </div>
          </div>

          {/* Hevy Sync Card */}
          <div className="p-3 rounded-3xl bg-card border border-border shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-bold text-xs text-foreground">
                <Dumbbell className="h-4 w-4 text-brand dark:text-brand-sky stroke-[2]" />
                <span>Gym & Kháng Lực (Hevy Linked)</span>
              </div>
              <Badge className="bg-brand-100/60 text-brand dark:bg-brand/50 dark:text-brand-sky border border-brand/20 text-[9px] font-bold">
                Đồng bộ tự động
              </Badge>
            </div>
            <div className="grid grid-cols-3 gap-1.5 text-center text-xs">
              <div className="p-2 rounded-xl bg-muted/40">
                <div className="text-[9px] text-muted-foreground">Tần suất</div>
                <div className="font-black text-foreground">4 buổi/tuần</div>
              </div>
              <div className="p-2 rounded-xl bg-muted/40">
                <div className="text-[9px] text-muted-foreground">Phân chia</div>
                <div className="font-bold text-foreground text-[10px]">Ngực-Lưng-Chân</div>
              </div>
              <div className="p-2 rounded-xl bg-muted/40">
                <div className="text-[9px] text-muted-foreground">Volume Load</div>
                <div className="font-black text-brand dark:text-brand-sky">14.5 Tấn</div>
              </div>
            </div>
          </div>

          {/* Photos Grid */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-bold text-foreground px-0.5">
              <span>Khoảnh khắc tập luyện ({MY_POSTS_GRID.length})</span>
              <span className="text-[10px] text-muted-foreground">Nhật ký hình ảnh</span>
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
        </div>
      )}

      {/* =================================================================== */}
      {/* 7. TAB 2: KÈO CỦA TÔI (4 TRẠNG THÁI) */}
      {/* =================================================================== */}
      {activeTab === "bounties" && (
        <div className="space-y-3">
          {/* Sub-tabs pills */}
          <div className="flex gap-1 overflow-x-auto scrollbar-none pb-0.5">
            {[
              { id: "upcoming", label: `Sắp tới (${myBounties.upcoming.length})` },
              { id: "history", label: `Lịch sử (${myBounties.history.length})` },
              { id: "pending", label: `Đang chờ (${myBounties.pending.length})` },
              { id: "cancelled", label: `Đã hủy (${myBounties.cancelled.length})` },
            ].map((sub) => (
              <button
                key={sub.id}
                onClick={() => setBountySubTab(sub.id as "upcoming" | "history" | "pending" | "cancelled")}
                className={cn(
                  "px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap border transition-all",
                  bountySubTab === sub.id
                    ? "bg-brand text-white border-brand shadow-xs"
                    : "bg-muted/60 text-muted-foreground border-border hover:text-foreground"
                )}
              >
                {sub.label}
              </button>
            ))}
          </div>

          {/* List items */}
          <div className="space-y-2">
            {myBounties[bountySubTab].map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-2xl bg-card border border-border shadow-xs space-y-2 text-xs"
              >
                <div className="flex items-start justify-between gap-2 font-bold text-foreground">
                  <span>{item.title}</span>
                  <Badge
                    variant="outline"
                    className="shrink-0 text-[9px] font-bold border-brand/30 text-brand dark:text-brand-sky bg-brand-100/30 dark:bg-brand/40"
                  >
                    {item.statusVi}
                  </Badge>
                </div>

                <div className="flex items-center gap-2">
                  <img
                    src={item.partnerAvatar}
                    alt={item.partner}
                    className="w-6 h-6 rounded-full object-cover border border-border"
                  />
                  <span className="text-[11px] text-muted-foreground">
                    Bạn tập: <strong className="text-foreground">{item.partner}</strong> ({item.partnerTs} TS)
                  </span>
                </div>

                <div className="text-[11px] text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3 shrink-0" />
                  <span>{item.timeVi}</span>
                </div>

                <div className="text-[11px] text-muted-foreground flex items-center gap-1">
                  <MapPin className="h-3 w-3 shrink-0" />
                  <span>{item.location}</span>
                </div>

                <div className="flex items-center justify-between pt-1.5 border-t border-border/40">
                  <span className="text-[10px] text-brand dark:text-brand-sky font-semibold">
                    Cọc bảo chứng: {item.holdTs} TS
                  </span>

                  {item.canCheckin && (
                    <Button
                      size="sm"
                      onClick={() => setIsQrModalOpen(true)}
                      className="h-7 px-3 text-[10px] font-bold bg-brand text-white rounded-full flex items-center gap-1 shadow-xs"
                    >
                      <QrCode className="h-3 w-3" />
                      <span>Check-in QR Điểm Hẹn</span>
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* 8. TAB 3: HUY HIỆU DANH DỰ (6 HUY HIỆU KỶ LUẬT) */}
      {/* =================================================================== */}
      {activeTab === "badges" && (
        <div className="space-y-2.5">
          <div className="text-xs text-muted-foreground">
            Huy hiệu danh dự bảo chứng độ uy tín và tinh thần không bỏ rơi bạn tập:
          </div>
          <div className="grid grid-cols-2 gap-2">
            {SYSTEM_BADGES.map((badge) => {
              const IconComp = badge.icon;
              return (
                <div
                  key={badge.id}
                  className={cn(
                    "p-3 rounded-2xl border text-xs space-y-1.5 transition-all",
                    badge.unlocked
                      ? "bg-card border-border shadow-xs"
                      : "bg-muted/40 border-border/50 opacity-60"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-muted border border-border text-foreground">
                      <IconComp className="h-4 w-4 stroke-[2]" />
                    </div>
                    <Badge
                      className={cn(
                        "text-[9px] font-bold",
                        badge.unlocked
                          ? "bg-brand-100/60 text-brand dark:bg-brand/50 dark:text-brand-sky border border-brand/20"
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      {badge.unlocked ? "Đã mở" : "Chưa đạt"}
                    </Badge>
                  </div>
                  <div className="font-black text-foreground pt-0.5">{badge.title}</div>
                  <div className="text-[10px] text-muted-foreground leading-tight">{badge.desc}</div>
                  <div className="text-[9px] font-bold text-brand dark:text-brand-sky">
                    Tiến độ: {badge.progress}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* 9. TAB 4: QUYỀN RIÊNG TƯ & AN TOÀN (PDP 2026) */}
      {/* =================================================================== */}
      {activeTab === "privacy" && (
        <div className="space-y-3 text-xs">
          <div className="p-3.5 rounded-3xl bg-card border border-border shadow-xs space-y-3">
            <div className="font-bold text-foreground flex items-center gap-1.5">
              <Lock className="h-4 w-4 text-foreground stroke-[2]" />
              <span>Bảo vệ quyền riêng tư VĐV (PDP 2026)</span>
            </div>

            {/* Toggle 1: Ghost Mode */}
            <div className="flex items-center justify-between py-1.5 border-b border-border/40">
              <div className="space-y-0.5 max-w-[75%]">
                <div className="font-bold text-foreground flex items-center gap-1.5">
                  <VolumeX className="h-3.5 w-3.5 text-foreground stroke-[2]" />
                  Ghost Mode (Hướng nội)
                </div>
                <div className="text-[10px] text-muted-foreground">
                  Chỉ nhận kèo chạy song song giữ nhịp im lặng, không yêu cầu bắt chuyện xã giao.
                </div>
              </div>
              <input
                type="checkbox"
                checked={ghostMode}
                onChange={(e) => setGhostMode(e.target.checked)}
                className="h-4 w-4 rounded accent-brand cursor-pointer"
              />
            </div>

            {/* Toggle 2: Hide Exact Location */}
            <div className="flex items-center justify-between py-1.5 border-b border-border/40">
              <div className="space-y-0.5 max-w-[75%]">
                <div className="font-bold text-foreground flex items-center gap-1.5">
                  <EyeOff className="h-3.5 w-3.5 text-foreground stroke-[2]" />
                  Ẩn vị trí chính xác trước khi cọc
                </div>
                <div className="text-[10px] text-muted-foreground">
                  Chỉ hiện bán kính khu vực (Bình Thạnh); chỉ mở tọa độ khi cả hai đã khóa cọc TS.
                </div>
              </div>
              <input
                type="checkbox"
                checked={hideExactLocation}
                onChange={(e) => setHideExactLocation(e.target.checked)}
                className="h-4 w-4 rounded accent-brand cursor-pointer"
              />
            </div>

            {/* Toggle 3: Same Gender Only */}
            <div className="flex items-center justify-between py-1.5 border-b border-border/40">
              <div className="space-y-0.5 max-w-[75%]">
                <div className="font-bold text-foreground flex items-center gap-1.5">
                  <UserCheck className="h-3.5 w-3.5 text-foreground stroke-[2]" />
                  Chỉ ghép bạn tập cùng giới tính
                </div>
                <div className="text-[10px] text-muted-foreground">
                  Chỉ hiện đề xuất và nhận yêu cầu bắt kèo từ các VĐV nữ.
                </div>
              </div>
              <input
                type="checkbox"
                checked={sameGenderOnly}
                onChange={(e) => setSameGenderOnly(e.target.checked)}
                className="h-4 w-4 rounded accent-brand cursor-pointer"
              />
            </div>

            {/* Toggle 4: Hide Pace */}
            <div className="flex items-center justify-between py-1.5 border-b border-border/40">
              <div className="space-y-0.5 max-w-[75%]">
                <div className="font-bold text-foreground flex items-center gap-1.5">
                  <TrendingUp className="h-3.5 w-3.5 text-foreground stroke-[2]" />
                  Ẩn dải pace cá nhân với người lạ
                </div>
                <div className="text-[10px] text-muted-foreground">
                  Chỉ hiển thị pace trung bình sau khi đối phương đã gửi yêu cầu bắt kèo.
                </div>
              </div>
              <input
                type="checkbox"
                checked={hidePace}
                onChange={(e) => setHidePace(e.target.checked)}
                className="h-4 w-4 rounded accent-brand cursor-pointer"
              />
            </div>

            {/* Toggle 5: Club Only */}
            <div className="flex items-center justify-between py-1.5">
              <div className="space-y-0.5 max-w-[75%]">
                <div className="font-bold text-foreground flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-foreground stroke-[2]" />
                  Chỉ nhận kèo từ thành viên CLB
                </div>
                <div className="text-[10px] text-muted-foreground">
                  Ưu tiên bạn tập từ FTU2 Run và các CLB đã xác thực.
                </div>
              </div>
              <input
                type="checkbox"
                checked={clubOnlyBounties}
                onChange={(e) => setClubOnlyBounties(e.target.checked)}
                className="h-4 w-4 rounded accent-brand cursor-pointer"
              />
            </div>
          </div>

          {/* Device Permissions & AI Hardware Sensor Hub */}
          <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-brand-sky/15 text-brand dark:text-brand-sky">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-foreground">Quyền Cảm Biến AI & Thiết Bị</h3>
                  <p className="text-[10px] text-muted-foreground">Phục vụ tính năng điểm danh và thuật toán gợi ý bạn tập</p>
                </div>
              </div>
              <Badge variant="outline" className="text-[9px] font-mono border-emerald-500/30 text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30">
                PDP 2026 Ready
              </Badge>
            </div>

            <div className="space-y-2 pt-1 text-xs">
              {/* Camera */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-muted/40 border border-border/40">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-brand-500/10 text-brand-600 dark:text-brand-400">
                    <Camera className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="font-semibold text-foreground text-[11px]">Máy ảnh (Camera Check-in & Form AI)</div>
                    <div className="text-[9.5px] text-muted-foreground">Quét QR điểm hẹn và ghi nhận tư thế tập</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => updatePermissions({ camera: user?.permissions?.camera ? false : true })}
                  className={cn(
                    "px-2.5 py-1 rounded-full text-[10px] font-bold transition-all",
                    user?.permissions?.camera
                      ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  )}
                >
                  {user?.permissions?.camera ? "Đã cấp phép" : "Chưa bật"}
                </button>
              </div>

              {/* GPS */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-muted/40 border border-border/40">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="font-semibold text-foreground text-[11px]">Định vị GPS (Bán kính bạn tập & Sân bãi)</div>
                    <div className="text-[9.5px] text-muted-foreground">Tính khoảng cách ghép đôi, ẩn nhà riêng 200m</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => updatePermissions({ gps: user?.permissions?.gps ? false : true })}
                  className={cn(
                    "px-2.5 py-1 rounded-full text-[10px] font-bold transition-all",
                    user?.permissions?.gps
                      ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  )}
                >
                  {user?.permissions?.gps ? "Đã cấp phép" : "Chưa bật"}
                </button>
              </div>

              {/* Notifications */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-muted/40 border border-border/40">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                    <Bell className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="font-semibold text-foreground text-[11px]">Thông báo tức thì (Kèo & Nhắc lịch)</div>
                    <div className="text-[9.5px] text-muted-foreground">Nhắc nhở trước 30p, báo partner tới điểm hẹn</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => updatePermissions({ notifications: user?.permissions?.notifications ? false : true })}
                  className={cn(
                    "px-2.5 py-1 rounded-full text-[10px] font-bold transition-all",
                    user?.permissions?.notifications
                      ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  )}
                >
                  {user?.permissions?.notifications ? "Đã cấp phép" : "Chưa bật"}
                </button>
              </div>

              {/* Biometrics */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-muted/40 border border-border/40">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-brand-500/10 text-brand-600 dark:text-brand-400">
                    <Fingerprint className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="font-semibold text-foreground text-[11px]">Khóa vân tay / FaceID cổng ứng dụng</div>
                    <div className="text-[9.5px] text-muted-foreground">Bảo vệ thông tin ký quỹ và lịch trình thể thao</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => toggleBiometric()}
                  className={cn(
                    "px-2.5 py-1 rounded-full text-[10px] font-bold transition-all",
                    user?.biometricEnabled
                      ? "bg-brand-500/15 text-brand-700 dark:text-brand-400 border border-brand-500/30"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  )}
                >
                  {user?.biometricEnabled ? "Đang bật" : "Tắt"}
                </button>
              </div>
            </div>
          </div>

          {/* ỨNG DỤNG & THIẾT BỊ ĐO THỂ CHẤT (ĐỒNG BỘ DỮ LIỆU) */}
          <div className="p-4 rounded-3xl bg-card border border-border/80 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-xl bg-brand-600/10 text-[#FC4C02]">
                  <Activity className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-foreground">Ứng Dụng & Thiết Bị Thể Chất</h3>
                  <p className="text-[10px] text-muted-foreground">Đồng bộ tự động pace, lộ trình, nhịp tim và hoạt động</p>
                </div>
              </div>
              <Badge variant="outline" className="text-[9px] font-mono border-brand-600/30 text-brand-700 bg-brand-50 dark:bg-brand-950/30">
                Tự động
              </Badge>
            </div>

            <div className="space-y-2 pt-1 text-xs">
              {/* Strava */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-muted/40 border border-border/40">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#FC4C02] text-white flex items-center justify-center font-black text-xs shadow-xs">
                    S
                  </div>
                  <div>
                    <div className="font-semibold text-foreground text-[11px] flex items-center gap-1.5">
                      <span>Strava</span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-brand-600/10 text-[#FC4C02] font-semibold">Khuyên dùng</span>
                    </div>
                    <div className="text-[9.5px] text-muted-foreground">Lộ trình bài tập, Pace, Quãng đường chạy bộ</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => toggleAppConnection("strava")}
                  className={cn(
                    "px-3 py-1 rounded-full text-[10px] font-bold transition-all",
                    user?.connectedApps?.strava
                      ? "bg-[#FC4C02] text-white shadow-xs"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  )}
                >
                  {user?.connectedApps?.strava ? "Đã liên kết" : "Liên kết"}
                </button>
              </div>

              {/* Apple Health */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-muted/40 border border-border/40">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-black text-white dark:bg-white dark:text-black flex items-center justify-center font-bold text-xs shadow-xs">
                    
                  </div>
                  <div>
                    <div className="font-semibold text-foreground text-[11px] flex items-center gap-1.5">
                      <span>Apple Health</span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-red-500/10 text-red-500 font-semibold">Apple Watch</span>
                    </div>
                    <div className="text-[9.5px] text-muted-foreground">Nhịp tim, Năng lượng, Bước chân, Đi bộ & Chạy</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => toggleAppConnection("appleHealth")}
                  className={cn(
                    "px-3 py-1 rounded-full text-[10px] font-bold transition-all",
                    user?.connectedApps?.appleHealth
                      ? "bg-red-500 text-white shadow-xs"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  )}
                >
                  {user?.connectedApps?.appleHealth ? "Đã liên kết" : "Liên kết"}
                </button>
              </div>

              {/* Garmin Connect */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-muted/40 border border-border/40">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#007cc3] text-white flex items-center justify-center font-black text-[10px] shadow-xs">
                    ▲
                  </div>
                  <div>
                    <div className="font-semibold text-foreground text-[11px]">Garmin Connect</div>
                    <div className="text-[9.5px] text-muted-foreground">Forerunner, Fenix, Epix (VO2 Max, Nhịp tim)</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => toggleAppConnection("garmin")}
                  className={cn(
                    "px-3 py-1 rounded-full text-[10px] font-bold transition-all",
                    user?.connectedApps?.garmin
                      ? "bg-[#007cc3] text-white shadow-xs"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  )}
                >
                  {user?.connectedApps?.garmin ? "Đã liên kết" : "Liên kết"}
                </button>
              </div>

              {/* COROS */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-muted/40 border border-border/40">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 flex items-center justify-center font-bold text-[9px] shadow-xs">
                    COROS
                  </div>
                  <div>
                    <div className="font-semibold text-foreground text-[11px]">COROS Pace / Vertix</div>
                    <div className="text-[9.5px] text-muted-foreground">EvoLab, Tải trọng luyện tập & Ngưỡng lactate</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => toggleAppConnection("coros")}
                  className={cn(
                    "px-3 py-1 rounded-full text-[10px] font-bold transition-all",
                    user?.connectedApps?.coros
                      ? "bg-foreground text-background shadow-xs"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  )}
                >
                  {user?.connectedApps?.coros ? "Đã liên kết" : "Liên kết"}
                </button>
              </div>

              {/* WHOOP */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-muted/40 border border-border/40">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-zinc-800 text-white flex items-center justify-center font-bold text-[8px] shadow-xs">
                    WHOOP
                  </div>
                  <div>
                    <div className="font-semibold text-foreground text-[11px]">WHOOP 4.0</div>
                    <div className="text-[9.5px] text-muted-foreground">Phục hồi thể chất, Căng thẳng (Strain) & Giấc ngủ</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => toggleAppConnection("whoop")}
                  className={cn(
                    "px-3 py-1 rounded-full text-[10px] font-bold transition-all",
                    user?.connectedApps?.whoop
                      ? "bg-zinc-800 text-white shadow-xs"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  )}
                >
                  {user?.connectedApps?.whoop ? "Đã liên kết" : "Liên kết"}
                </button>
              </div>
            </div>
          </div>

          {/* AI Onboarding Survey Status & Re-assessment */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-brand/10 via-background to-brand-sky/10 border border-brand-300/30 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono font-bold text-brand dark:text-brand-sky uppercase tracking-wider">
                  THUẬT TOÁN CÁ NHÂN HÓA AI
                </span>
                <h3 className="text-xs font-bold text-foreground">Hồ Sơ Năng Lực & Thói Quen Thể Thao</h3>
              </div>
              <Badge className="bg-brand text-white text-[9px] font-bold">
                {user?.isSurveyCompleted ? "100% Hoàn Tất" : "Chưa Hoàn Tất"}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[10.5px]">
              <div className="p-2 rounded-xl bg-background/80 border border-border/60">
                <div className="text-muted-foreground text-[9px]">Môn thể thao chính:</div>
                <div className="font-bold text-foreground truncate">
                  {user?.sportsProfile?.preferredSports?.join(", ") || "Chạy bộ, Cầu lông"}
                </div>
              </div>
              <div className="p-2 rounded-xl bg-background/80 border border-border/60">
                <div className="text-muted-foreground text-[9px]">Khung giờ vàng:</div>
                <div className="font-bold text-foreground truncate">
                  {user?.sportsProfile?.preferredTime || "05:30 - 07:00 (Sáng sớm)"}
                </div>
              </div>
              <div className="p-2 rounded-xl bg-background/80 border border-border/60">
                <div className="text-muted-foreground text-[9px]">Trình độ / Thể lực:</div>
                <div className="font-bold text-foreground truncate">
                  {user?.sportsProfile?.runningPace || "Pace 5:30 - 6:00/km"}
                </div>
              </div>
              <div className="p-2 rounded-xl bg-background/80 border border-border/60">
                <div className="text-muted-foreground text-[9px]">Mục tiêu cốt lõi:</div>
                <div className="font-bold text-foreground truncate">
                  {user?.sportsProfile?.fitnessGoal || "Kỷ luật & Tìm đồng đội"}
                </div>
              </div>
            </div>

            <div className="pt-1 flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => router.push("/bat-dau")}
                className="w-full text-xs h-8 rounded-full font-bold border-brand-300/40 hover:bg-brand-sky/10 text-brand dark:text-brand-sky"
              >
                <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
                Làm Lại Khảo Sát Cá Nhân Hoá AI
              </Button>
            </div>
          </div>

          {/* Account Security & Logout */}
          <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-foreground">Cổng Bảo Mật & Phiên Đăng Nhập</h3>
                <p className="text-[10px] text-muted-foreground">
                  Đăng nhập qua: <span className="font-semibold text-foreground capitalize">{user?.authProvider || "Email"}</span> • {user?.email || user?.phone || "minhthu@runner.vn"}
                </p>
              </div>
              <div className="flex items-center gap-1 text-[10px] font-mono text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded-full">
                <ShieldCheck className="h-3 w-3" />
                <span>Active</span>
              </div>
            </div>

            <div className="pt-1 flex flex-col gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsLogoutModalOpen(true)}
                className="w-full text-xs h-8 rounded-full font-bold text-red-600 dark:text-red-400 border-red-500/30 hover:bg-red-500/10 hover:border-red-500/50"
              >
                <LogOut className="h-3.5 w-3.5 mr-1.5" />
                Đăng Xuất Khỏi Thiết Bị Này
              </Button>
            </div>
          </div>

          {/* Export Personal Data */}
          <div className="p-3 rounded-2xl bg-muted/50 border border-border/60 flex items-center justify-between">
            <span className="text-[11px] text-muted-foreground font-semibold">Dữ liệu cá nhân (JSON):</span>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setIsExporting(true);
                setTimeout(() => {
                  setIsExporting(false);
                  alert("Đã xuất tệp dữ liệu cá nhân (sync-athlete-data-2026.json) thành công!");
                }, 800);
              }}
              className="text-xs h-7 px-3 rounded-full font-semibold border-border"
            >
              <Download className="h-3 w-3 mr-1 text-foreground" />
              {isExporting ? "Đang xuất..." : "Tải Về Dữ Liệu"}
            </Button>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* 10. MODAL: ĐIỂM DANH CHECK-IN QR TẠI ĐIỂM HẸN */}
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
              <h2 className="text-base font-extrabold text-foreground">Điểm Danh & Mở Khóa Cọc</h2>
              <p className="text-[11px] text-muted-foreground">
                Cùng đưa mã QR lại gần điện thoại của bạn tập để hệ thống ghi nhận có mặt đúng giờ.
              </p>
            </div>

            {/* Dynamic QR Code Canvas Simulation */}
            <div className="p-4 rounded-2xl bg-white border-2 border-brand/20 flex flex-col items-center justify-center space-y-2 shadow-inner mx-auto w-48 h-48">
              <div className="w-36 h-36 border-4 border-slate-900 rounded-xl p-2 flex flex-col justify-between bg-white relative">
                {/* 4 corner markers */}
                <div className="w-8 h-8 bg-slate-900 rounded-xs" />
                <div className="absolute top-2 right-2 w-8 h-8 bg-slate-900 rounded-xs" />
                <div className="absolute bottom-2 left-2 w-8 h-8 bg-slate-900 rounded-xs" />
                {/* Simulated QR matrix */}
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
                {/* Center logo */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-7 h-7 rounded-md bg-brand text-white flex items-center justify-center shadow-xs">
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
                className="flex-1 rounded-full text-xs font-bold"
              >
                <Camera className="h-3.5 w-3.5 mr-1" />
                <span>Quét mã bạn tập</span>
              </Button>
              <Button
                onClick={() => {
                  alert("Điểm danh thành công! Cả 2 đã đúng hẹn. Đã hoàn 100% cọc + thưởng 2 TS.");
                  setIsQrModalOpen(false);
                }}
                className="flex-1 rounded-full text-xs font-bold bg-brand text-white"
              >
                Xác nhận đã gặp
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* 11. MODAL: CHỈNH SỬA HỒ SƠ VĐV */}
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
              <h2 className="text-base font-extrabold text-foreground">Chỉnh Sửa Hồ Sơ VĐV</h2>
              <p className="text-[11px] text-muted-foreground">
                Cập nhật thông tin để thuật toán ghép bạn tập chuẩn xác hơn.
              </p>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[11px] font-bold text-foreground block mb-1">Tên hiển thị:</label>
                <input
                  type="text"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl bg-muted/50 border border-border text-foreground font-semibold"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-foreground block mb-1">Pace tập luyện:</label>
                <input
                  type="text"
                  value={profilePace}
                  onChange={(e) => setProfilePace(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl bg-muted/50 border border-border text-foreground font-semibold"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-foreground block mb-1">Khu vực ưu tiên:</label>
                <input
                  type="text"
                  value={profileArea}
                  onChange={(e) => setProfileArea(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl bg-muted/50 border border-border text-foreground font-semibold"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-foreground block mb-1">Mô tả / Thói quen tập:</label>
                <textarea
                  rows={3}
                  value={profileBio}
                  onChange={(e) => setProfileBio(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl bg-muted/50 border border-border text-foreground text-xs leading-relaxed"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => setIsEditModalOpen(false)}
                className="flex-1 rounded-full text-xs font-semibold"
              >
                Hủy
              </Button>
              <Button
                onClick={() => {
                  setIsEditModalOpen(false);
                  alert("Đã cập nhật hồ sơ cá nhân thành công!");
                }}
                className="flex-1 rounded-full text-xs font-bold bg-brand text-white"
              >
                Lưu thay đổi
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* 12. MODAL: XÁC NHẬN ĐĂNG XUẤT */}
      {/* =================================================================== */}
      {isLogoutModalOpen && (
        <div className="fixed inset-0 z-[90] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-card border border-border w-full max-w-sm rounded-3xl p-5 space-y-4 shadow-2xl relative text-center">
            <div className="w-12 h-12 rounded-2xl bg-red-500/15 border border-red-500/30 flex items-center justify-center mx-auto text-red-600 dark:text-red-400">
              <LogOut className="h-6 w-6" />
            </div>

            <div className="space-y-1">
              <h2 className="text-base font-extrabold text-foreground">Đăng Xuất Khỏi SYNESIS?</h2>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Bạn có chắc chắn muốn đăng xuất? Các kèo thể thao đang tham gia và điểm TrustScore của bạn vẫn được lưu trữ an toàn trên máy chủ bảo mật.
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-muted/40 border border-border/60 text-left text-[11px] space-y-1">
              <div className="flex items-center justify-between text-muted-foreground">
                <span>Vận động viên:</span>
                <span className="font-bold text-foreground">{user?.name || profileName}</span>
              </div>
              <div className="flex items-center justify-between text-muted-foreground">
                <span>Điểm TrustScore:</span>
                <span className="font-bold text-brand dark:text-brand-sky">{user?.trustScore || 98}/100</span>
              </div>
              <div className="flex items-center justify-between text-muted-foreground">
                <span>Bảo mật thiết bị:</span>
                <span className="text-emerald-600 font-semibold">AES-256 Mã hóa cục bộ</span>
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <Button
                variant="outline"
                onClick={() => setIsLogoutModalOpen(false)}
                className="flex-1 rounded-full text-xs font-semibold"
              >
                Ở lại tập tiếp
              </Button>
              <Button
                onClick={() => {
                  setIsLogoutModalOpen(false);
                  logout();
                  router.push("/dang-nhap");
                }}
                className="flex-1 rounded-full text-xs font-bold bg-red-600 hover:bg-red-700 text-white"
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

