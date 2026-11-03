"use client";

import * as React from "react";
import Link from "next/link";
import {
  Users,
  ShieldCheck,
  Key,
  Trophy,
  Sparkles,
  Lock,
  ArrowRight,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { CoachSection } from "@/components/coaching/coach-section";

interface InternalBounty {
  id: string;
  title: string;
  timeVi: string;
  location: string;
  intensity: string;
  hostName: string;
  hostTs: number;
  slotsLeft: number;
}

interface ClubItem {
  id: string;
  name: string;
  sportName: string;
  avatar: string;
  memberCount: number;
  active30DaysCount: number;
  checkInRate: string;
  openBountiesThisWeek: number;
  avgTs: number;
  description: string;
  areaName: string;
  weeklySchedule: string;
  isVerified: boolean;
  myRole?: "Owner" | "Admin" | "Mentor" | "Member" | null;
  internalBounties: InternalBounty[];
  challengeTitle?: string;
  challengeProgress?: { currentKm: number; targetKm: number; daysLeft: number };
}

const SAMPLE_CLUBS: ClubItem[] = [
  {
    id: "club-1",
    name: "FTU2 Run Club (Ngoại Thương Runners)",
    sportName: "Chạy bộ",
    avatar: "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=200&auto=format&fit=crop&q=80",
    memberCount: 1240,
    active30DaysCount: 320,
    checkInRate: "86%",
    openBountiesThisWeek: 12,
    avgTs: 124,
    description: "Cộng đồng chạy bộ rèn luyện sức bền sinh viên và cựu sinh viên Ngoại Thương CS2 quanh bờ kè Thanh Đa và Landmark 81.",
    areaName: "Bình Thạnh & Q.1",
    weeklySchedule: "05:30 AM • Thứ Tư & Chủ Nhật",
    isVerified: true,
    myRole: "Member",
    challengeTitle: "Cả đội chạy 500km trong 7 ngày",
    challengeProgress: { currentKm: 340, targetKm: 500, daysLeft: 3 },
    internalBounties: [
      {
        id: "bounty-1",
        title: "10km pace 6:00 quanh bờ kè Thanh Đa",
        timeVi: "05:30 AM • Thứ Tư",
        location: "Cổng bến du thuyền Landmark 81",
        intensity: "10km • Pace 6:00",
        hostName: "Minh Anh (Mentor)",
        hostTs: 138,
        slotsLeft: 2,
      },
      {
        id: "bounty-2",
        title: "Easy Run 5km phục hồi cuối tuần",
        timeVi: "18:00 PM • Thứ Năm",
        location: "Khuôn viên Vinhomes Central Park",
        intensity: "5km • Pace 6:30",
        hostName: "Quốc Hưng (Admin)",
        hostTs: 142,
        slotsLeft: 4,
      },
    ],
  },
  {
    id: "club-2",
    name: "Saigon Runners Community (SRC)",
    sportName: "Chạy bộ Marathon",
    avatar: "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=200&auto=format&fit=crop&q=80",
    memberCount: 2150,
    active30DaysCount: 680,
    checkInRate: "92%",
    openBountiesThisWeek: 18,
    avgTs: 134,
    description: "Cộng đồng chạy bộ bán chuyên hàng đầu Sài Gòn, chuyên kéo pace dài 21km - 42km cho các giải marathon.",
    areaName: "Toàn TP.HCM",
    weeklySchedule: "05:00 AM • Thứ Bảy & Chủ Nhật",
    isVerified: true,
    myRole: null,
    internalBounties: [],
  },
  {
    id: "club-3",
    name: "Đội Kháng Lực VNU Calisthenics & Gym",
    sportName: "Gym & Calisthenics",
    avatar: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=200&auto=format&fit=crop&q=80",
    memberCount: 480,
    active30DaysCount: 195,
    checkInRate: "94%",
    openBountiesThisWeek: 9,
    avgTs: 118,
    description: "Nhóm tập luyện chia sẻ giáo án, spotter đỡ tạ an toàn và khế ước tập gym đều đặn 4 buổi/tuần.",
    areaName: "Thủ Đức",
    weeklySchedule: "17:45 PM • Thứ 2-4-6",
    isVerified: true,
    myRole: null,
    internalBounties: [],
  },
];

// MICRO SQUADS (NHÓM 2-4 NGƯỜI CHỐNG BỎ DỞ)
const MICRO_SQUADS = [
  {
    id: "squad-1",
    name: "Squad Bình Minh Landmark (Duo)",
    members: [
      { name: "Bạn (Minh Thư)", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80", ts: 125 },
      { name: "Minh Anh", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80", ts: 138 },
    ],
    sharedStreak: "14 ngày liên tục",
    weeklySchedule: "3 buổi sáng / tuần (Thứ 3 - 5 - 7)",
    groupReward: "+5 TS thưởng hàng tuần nếu không ai no-show",
    disciplineRate: "100%",
  },
  {
    id: "squad-2",
    name: "Bộ Tứ Kháng Lực The New Gym (Squad 4)",
    members: [
      { name: "Tuấn Khang", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80", ts: 118 },
      { name: "Thuỳ Dung", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80", ts: 120 },
      { name: "Đức Trọng", avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80", ts: 105 },
      { name: "Hải Yến", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80", ts: 142 },
    ],
    sharedStreak: "8 ngày",
    weeklySchedule: "4 buổi chiều / tuần (Thứ 2 - 4 - 6 - CN)",
    groupReward: "Mở khóa Huy hiệu Squad Builder (+15 TS)",
    disciplineRate: "95%",
  },
];

const LEADERBOARD = [
  { rank: 1, name: "Minh Anh", club: "FTU2 Run", km: "42.5 km", ts: 148, streak: "42 ngày" },
  { rank: 2, name: "Lan Phương", club: "FTU2 Run", km: "38.2 km", ts: 142, streak: "36 ngày" },
  { rank: 3, name: "Huy Hoàng", club: "FTU2 Run", km: "35.0 km", ts: 135, streak: "28 ngày" },
  { rank: 4, name: "Bạn (Minh Thư)", club: "FTU2 Run", km: "32.0 km", ts: 125, streak: "14 ngày" },
];

export type StreamlinedClubTab = "clb" | "hlv" | "challenges";

export default function ClubsPage() {
  const [activeTab, setActiveTab] = React.useState<StreamlinedClubTab>("clb");
  const [inviteCode, setInviteCode] = React.useState("");
  const [joinMessage, setJoinMessage] = React.useState<string | null>(null);

  // Check URL param ?tab=hlv or ?tab=coaches or ?tab=challenges on mount
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get("tab");
      if (tabParam === "coaches" || tabParam === "hlv") {
        setActiveTab("hlv");
      } else if (tabParam === "challenges" || tabParam === "squads") {
        setActiveTab("challenges");
      } else if (tabParam === "clb" || tabParam === "my_club" || tabParam === "explore") {
        setActiveTab("clb");
      }
    }
  }, []);

  const handleJoinByCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteCode) return;
    setJoinMessage(`Bạn đã gia nhập thành công CLB với mã "${inviteCode.toUpperCase()}". Kèo nội bộ đã được mở khóa!`);
    setInviteCode("");
    setTimeout(() => setJoinMessage(null), 5000);
  };

  const myClub = SAMPLE_CLUBS[0]!;

  return (
    <div className="flex flex-col w-full px-3 py-2 space-y-3 pb-16">
      {/* 1. HEADER (STREAMLINED STRAVA / HELIX STYLE) */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <h1 className="text-xl font-black tracking-tight text-[#000f22] dark:text-white">
            Nhóm & CLB
          </h1>
          <p className="text-[11px] text-muted-foreground">
            3 không gian tinh gọn: Câu lạc bộ • Huấn luyện viên • Thử thách
          </p>
        </div>
        <Button
          asChild
          size="sm"
          className="h-8 px-3 rounded-full bg-[#1b3554] hover:bg-[#000f22] text-white text-xs font-bold gap-1 shadow-xs"
        >
          <Link href="/len-keo">
            <Plus className="h-3.5 w-3.5 text-white" />
            <span>Tạo kèo nhóm</span>
          </Link>
        </Button>
      </div>

      {/* 2. SEGMENT TABS (EXACTLY 3 CLEAN TABS) */}
      <div className="grid grid-cols-3 gap-1.5 p-1 rounded-2xl bg-muted/70 border border-border/80">
        {[
          { id: "clb" as StreamlinedClubTab, label: "CLB", sublabel: "Của bạn & Khám phá" },
          { id: "hlv" as StreamlinedClubTab, label: "HLV & Coach", sublabel: "Cá nhân hoá 1:1", badge: "Mới" },
          { id: "challenges" as StreamlinedClubTab, label: "Thử Thách", sublabel: "Squads & BXH" },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={cn(
              "py-2 px-1.5 rounded-xl font-bold text-center transition-all relative flex flex-col items-center justify-center",
              activeTab === t.id
                ? "bg-[#1b3554] text-white shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <div className="flex items-center gap-1">
              <span className="text-xs sm:text-sm font-black">{t.label}</span>
              {t.badge && activeTab !== t.id && (
                <span className="text-[8px] px-1 py-0.2 bg-[#c0e6fd] text-[#1b3554] font-black rounded-full">
                  {t.badge}
                </span>
              )}
            </div>
            <span
              className={cn(
                "text-[9px] font-medium hidden sm:inline-block",
                activeTab === t.id ? "text-white/80" : "text-muted-foreground"
              )}
            >
              {t.sublabel}
            </span>
          </button>
        ))}
      </div>

      {/* =================================================================== */}
      {/* 3. TAB 1: CLB (CLB CỦA BẠN & KHÁM PHÁ CỘNG ĐỒNG) */}
      {/* =================================================================== */}
      {activeTab === "clb" && (
        <div className="space-y-4">
          {/* A. CLB CỦA TÔI */}
          <div className="rounded-3xl border border-border bg-card p-4 space-y-3 shadow-xs">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={myClub.avatar}
                  alt={myClub.name}
                  className="w-12 h-12 rounded-2xl object-cover border border-border"
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    <h2 className="text-sm font-black text-foreground">{myClub.name}</h2>
                    <ShieldCheck className="h-4 w-4 text-[#1b3554] dark:text-[#c0e6fd]" />
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    {myClub.areaName} • {myClub.sportName}
                  </div>
                  <Badge className="bg-[#c0e6fd]/60 text-[#1b3554] dark:bg-[#1b3554]/50 dark:text-[#c0e6fd] border border-[#1b3554]/20 text-[9px] mt-0.5 font-bold">
                    Vai trò: {myClub.myRole}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Sức sống CLB */}
            <div className="grid grid-cols-3 gap-2 p-2.5 rounded-2xl bg-muted/60 text-center text-xs">
              <div>
                <div className="text-[10px] text-muted-foreground">VĐV 30 ngày</div>
                <div className="font-black text-foreground text-sm">{myClub.active30DaysCount}</div>
              </div>
              <div>
                <div className="text-[10px] text-muted-foreground">Tỷ lệ check-in</div>
                <div className="font-black text-[#1b3554] dark:text-[#80aad3] text-sm">{myClub.checkInRate}</div>
              </div>
              <div>
                <div className="text-[10px] text-muted-foreground">Kèo mở tuần này</div>
                <div className="font-black text-[#1b3554] dark:text-[#80aad3] text-sm">{myClub.openBountiesThisWeek}</div>
              </div>
            </div>

            {/* Kèo Nội Bộ CLB */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Lock className="h-3.5 w-3.5 text-foreground" />
                  Kèo nội bộ độc quyền CLB
                </span>
                <Link href="/len-keo" className="text-[10px] text-[#1b3554] dark:text-[#80aad3] font-bold hover:underline">
                  + Tạo kèo CLB
                </Link>
              </div>

              {myClub.internalBounties.map((bounty) => (
                <div
                  key={bounty.id}
                  className="p-2.5 rounded-2xl bg-card border border-border flex items-center justify-between text-xs"
                >
                  <div className="space-y-0.5">
                    <div className="font-bold text-foreground">{bounty.title}</div>
                    <div className="text-[10px] text-muted-foreground">{bounty.timeVi} • {bounty.location}</div>
                    <div className="text-[10px] text-[#1b3554] dark:text-[#80aad3] font-semibold">
                      Host: {bounty.hostName} • Còn {bounty.slotsLeft} chỗ
                    </div>
                  </div>
                  <Button asChild size="sm" className="rounded-full text-xs h-7 px-3 bg-[#1b3554] hover:bg-[#000f22] text-white font-bold">
                    <Link href="/len-keo">Tham gia</Link>
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* B. GIA NHẬP BẰNG MÃ MỜI KÍN */}
          <form
            onSubmit={handleJoinByCode}
            className="p-3.5 rounded-3xl bg-muted/60 border border-border space-y-2.5"
          >
            <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
              <Key className="h-3.5 w-3.5 text-foreground" />
              <span>Gia nhập CLB kín qua mã mời</span>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Nhập mã mời (VD: SRC2026, FTU2026)..."
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                className="flex-1 rounded-full border border-border bg-background px-3 py-1.5 text-xs text-foreground focus:outline-hidden"
              />
              <Button type="submit" size="sm" className="rounded-full bg-[#1b3554] hover:bg-[#000f22] text-white font-bold text-xs h-8 px-3">
                Gia nhập
              </Button>
            </div>
            {joinMessage && (
              <p className="text-[11px] font-semibold text-[#1b3554] dark:text-[#80aad3] animate-in fade-in">
                {joinMessage}
              </p>
            )}
          </form>

          {/* C. KHÁM PHÁ CÁC CLB KHÁC */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-black text-foreground uppercase tracking-tight flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5 text-[#1b3554] dark:text-[#c0e6fd]" />
                Khám Phá Các CLB Khác
              </span>
            </div>

            {SAMPLE_CLUBS.filter((c) => c.id !== myClub.id).map((club) => (
              <div
                key={club.id}
                className="p-3.5 rounded-3xl bg-card border border-border shadow-xs space-y-2.5"
              >
                <div className="flex items-center gap-3">
                  <img src={club.avatar} alt={club.name} className="w-11 h-11 rounded-2xl object-cover border border-border" />
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1">
                      <h3 className="text-xs font-black text-foreground">{club.name}</h3>
                      {club.isVerified && <ShieldCheck className="h-3.5 w-3.5 text-[#1b3554] dark:text-[#80aad3]" />}
                    </div>
                    <div className="text-[10px] text-muted-foreground">{club.areaName} • {club.sportName}</div>
                  </div>
                </div>

                <p className="text-[11px] text-muted-foreground leading-relaxed">{club.description}</p>

                <div className="flex items-center justify-between text-[11px] pt-1 border-t border-border/60">
                  <span className="text-muted-foreground">
                    <strong>{club.memberCount}</strong> thành viên • Kỷ luật <strong>{club.checkInRate}</strong>
                  </span>
                  <Button size="sm" variant="outline" className="rounded-full text-xs h-7 px-3 font-semibold border-[#1b3554]/30 text-[#1b3554] dark:text-[#c0e6fd]">
                    Xin Gia Nhập
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* 4. TAB 2: HUẤN LUYỆN VIÊN (COACHING 1:1 & NHÓM CÁ NHÂN HOÁ) */}
      {/* =================================================================== */}
      {activeTab === "hlv" && <CoachSection />}

      {/* =================================================================== */}
      {/* 5. TAB 3: THỬ THÁCH (CHALLENGES & MICRO-SQUADS & BXH) */}
      {/* =================================================================== */}
      {activeTab === "challenges" && (
        <div className="space-y-3.5">
          {/* Thử Thách Tháng */}
          <div className="p-3.5 rounded-3xl bg-card border border-border shadow-xs space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Trophy className="h-4 w-4 text-foreground" />
                <h3 className="text-xs font-black text-foreground">Thử Thách Tháng 11: Vượt Ngưỡng 100km</h3>
              </div>
              <Badge className="bg-[#1b3554] text-white text-[9px] font-bold">Còn 12 ngày</Badge>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Tích lũy tối thiểu 100km chạy bộ hoặc 16 buổi kháng lực có check-in với bạn tập để mở khóa Huy hiệu Kỷ Luật Vàng.
            </p>
            <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
              <div className="h-full bg-[#1b3554] dark:bg-[#80aad3] rounded-full" style={{ width: "64%" }} />
            </div>
            <div className="flex justify-between text-[10px] text-muted-foreground font-semibold">
              <span>Đã hoàn thành: 64/100 km</span>
              <span className="text-[#1b3554] dark:text-[#80aad3] font-bold">+25 TS thưởng</span>
            </div>
            <Button
              size="sm"
              onClick={() => alert("Đã ghi danh tham gia Thử Thách Vượt Ngưỡng 100km!")}
              className="w-full rounded-full bg-[#1b3554] hover:bg-[#000f22] text-white font-bold text-xs h-8"
            >
              Ghi Danh Thử Thách
            </Button>
          </div>

          {/* Micro-Squads */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between px-1">
              <div className="text-xs font-black uppercase text-foreground flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-cyan-600" />
                <span>Micro-Squads (Nhóm 2-4 bạn cùng tiến)</span>
              </div>
            </div>

            {MICRO_SQUADS.map((squad) => (
              <div
                key={squad.id}
                className="p-3.5 rounded-3xl bg-card border border-border shadow-xs space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black text-foreground">{squad.name}</h3>
                  <Badge className="bg-[#c0e6fd]/50 text-[#1b3554] dark:bg-[#1b3554]/50 dark:text-[#c0e6fd] border border-[#1b3554]/20 text-[10px] font-bold">
                    {squad.sharedStreak}
                  </Badge>
                </div>

                {/* Member Avatars */}
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {squad.members.map((m, i) => (
                      <img
                        key={i}
                        src={m.avatar}
                        alt={m.name}
                        className="w-8 h-8 rounded-full object-cover border-2 border-background"
                        title={`${m.name} (${m.ts} TS)`}
                      />
                    ))}
                  </div>
                  <span className="text-[10px] text-muted-foreground font-semibold">
                    {squad.members.map((m) => m.name.split(" ")[0]).join(" • ")}
                  </span>
                </div>

                <div className="p-2 rounded-xl bg-muted/50 text-[10px] text-muted-foreground space-y-0.5">
                  <div>Lịch tập: <strong className="text-foreground">{squad.weeklySchedule}</strong></div>
                  <div>Thưởng nhóm: <strong className="text-[#1b3554] dark:text-[#80aad3]">{squad.groupReward}</strong></div>
                </div>

                <div className="flex gap-2 pt-1">
                  <Button asChild size="sm" className="flex-1 rounded-full bg-[#1b3554] hover:bg-[#000f22] text-white font-bold text-xs h-7">
                    <Link href="/len-keo">Lên Kèo Squad</Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Bảng Xếp Hạng Kỷ Luật Tuần */}
          <div className="p-3.5 rounded-3xl bg-card border border-border shadow-xs space-y-2.5">
            <div className="flex items-center justify-between text-xs font-bold text-foreground">
              <span className="flex items-center gap-1.5">
                <Trophy className="h-3.5 w-3.5 text-foreground" />
                Bảng Xếp Hạng Kỷ Luật Tuần
              </span>
              <span className="text-[10px] text-muted-foreground">Cập nhật 06:00</span>
            </div>
            <div className="space-y-1.5">
              {LEADERBOARD.map((item) => (
                <div
                  key={item.rank}
                  className="flex items-center justify-between p-2 rounded-xl bg-muted/40 text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "flex h-5 w-5 items-center justify-center rounded-full font-bold text-[10px]",
                        item.rank === 1
                          ? "bg-[#1b3554] text-white"
                          : item.rank === 2
                          ? "bg-[#3f6593] text-white"
                          : item.rank === 3
                          ? "bg-[#80aad3] text-[#000f22]"
                          : "bg-muted text-foreground"
                      )}
                    >
                      {item.rank}
                    </span>
                    <span className="font-semibold text-foreground">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[#1b3554] dark:text-[#80aad3] font-bold">{item.km}</span>
                    <span className="text-muted-foreground text-[10px]">{item.streak}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
