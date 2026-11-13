"use client";

import * as React from "react";
import Link from "next/link";
import { Users, ShieldCheck, Key, Trophy, GraduationCap, MessageCircle, CalendarDays, Settings2, Mail } from "lucide-react";
import { useClubOs } from "@/features/clubs/use-club-os";
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
    avgTs: 8.5,
    description: "Cộng đồng chạy bộ rèn luyện sức bền sinh viên và cựu sinh viên Ngoại Thương CS2 quanh bờ kè Thanh Đa và Landmark 81.",
    areaName: "Bình Thạnh & Q.1",
    weeklySchedule: "05:30 AM • Thứ Tư & Chủ Nhật",
    isVerified: true,
    myRole: "Admin",
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
        hostTs: 9,
        slotsLeft: 2,
      },
      {
        id: "bounty-2",
        title: "Easy Run 5km phục hồi cuối tuần",
        timeVi: "18:00 PM • Thứ Năm",
        location: "Khuôn viên Vinhomes Central Park",
        intensity: "5km • Pace 6:30",
        hostName: "Quốc Hưng (Admin)",
        hostTs: 9.5,
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
    avgTs: 9,
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
    avgTs: 8,
    description: "Nhóm tập luyện chia sẻ giáo án, spotter đỡ tạ an toàn và khế ước tập gym đều đặn 4 buổi/tuần.",
    areaName: "Thủ Đức",
    weeklySchedule: "17:45 PM • Thứ 2-4-6",
    isVerified: true,
    myRole: null,
    internalBounties: [],
  },
];

// MICRO SQUADS (NHÓM 2-4 NGƯỜI CHỐNG BỎ DỞ)
const LEADERBOARD = [
  { rank: 1, name: "Minh Anh", club: "FTU2 Run", km: "42.5 km", ts: 148, streak: "42 ngày" },
  { rank: 2, name: "Lan Phương", club: "FTU2 Run", km: "38.2 km", ts: 142, streak: "36 ngày" },
  { rank: 3, name: "Huy Hoàng", club: "FTU2 Run", km: "35.0 km", ts: 135, streak: "28 ngày" },
  { rank: 4, name: "Bạn (Minh Thư)", club: "FTU2 Run", km: "32.0 km", ts: 125, streak: "14 ngày" },
];

/**
 * Trang NHÓM gồm đúng 2 chức năng riêng biệt, không trùng với Lên kèo / Xem kèo:
 *  - Câu lạc bộ: CLB của bạn (sinh hoạt, thử thách, BXH), gia nhập bằng mã, khám phá CLB
 *  - Huấn luyện viên: tìm & đặt lịch HLV 1:1 hoặc lớp nhóm
 * Việc tạo/tham gia kèo tập nằm ở nút "Lên Kèo" giữa thanh điều hướng.
 */
export type StreamlinedClubTab = "clb" | "hlv";

export default function ClubsPage() {
  const [activeTab, setActiveTab] = React.useState<StreamlinedClubTab>("clb");
  const [inviteCode, setInviteCode] = React.useState("");
  const [joinMessage, setJoinMessage] = React.useState<string | null>(null);
  const [requested, setRequested] = React.useState<string[]>([]);
  const [challengeJoined, setChallengeJoined] = React.useState(false);

  React.useEffect(() => {
    const tabParam = new URLSearchParams(window.location.search).get("tab");
    if (tabParam === "coaches" || tabParam === "hlv") setActiveTab("hlv");
  }, []);

  const handleJoinByCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteCode.trim()) return;
    setJoinMessage(`Đã gửi yêu cầu gia nhập CLB với mã "${inviteCode.trim().toUpperCase()}".`);
    setInviteCode("");
    setTimeout(() => setJoinMessage(null), 5000);
  };

  const myClub = SAMPLE_CLUBS[0]!;
  const { myInvitations, respondMine } = useClubOs();
  const pendingInvites = myInvitations.filter((i) => i.status === "sent");

  return (
    <div className="flex flex-col w-full px-4 pt-4 space-y-4 pb-28">
      <header>
        <h1 className="text-[24px] font-extrabold tracking-tight text-foreground">Nhóm</h1>
        <p className="text-[13px] text-muted-foreground">Câu lạc bộ bạn tham gia và huấn luyện viên đồng hành</p>
      </header>

      <div className="grid grid-cols-2 gap-1 p-1 rounded-full bg-muted" role="tablist">
        {(
          [
            { id: "clb", label: "Câu lạc bộ", icon: Users },
            { id: "hlv", label: "Huấn luyện viên", icon: GraduationCap },
          ] as const
        ).map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={activeTab === t.id}
            onClick={() => setActiveTab(t.id)}
            className={cn(
              "flex items-center justify-center gap-1.5 rounded-lg py-2.5 text-[13.5px] font-bold transition-colors",
              activeTab === t.id ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <t.icon className="h-4 w-4" />
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === "clb" && (
        <div className="space-y-4">
          {/* A. CLB CỦA TÔI */}
          <section className="rounded-3xl border border-border bg-card overflow-hidden shadow-xs" aria-label="CLB của bạn">
            <div className="p-4 space-y-3">
              <div className="flex items-center gap-3">
                <img src={myClub.avatar} alt={myClub.name} className="w-14 h-14 rounded-2xl object-cover border border-border" />
                <div className="min-w-0">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-brand dark:text-brand-sky">CLB của bạn</p>
                  <h2 className="text-[16px] font-extrabold text-foreground flex items-center gap-1.5">
                    {myClub.name} <ShieldCheck className="h-4 w-4 text-foreground" />
                  </h2>
                  <p className="text-[12px] text-muted-foreground">
                    {myClub.areaName} · {myClub.sportName} · {myClub.myRole}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 rounded-2xl bg-muted/60 p-2.5 text-center">
                <div>
                  <p className="text-[16px] font-extrabold font-display text-foreground">{myClub.memberCount}</p>
                  <p className="text-[10.5px] text-muted-foreground">Thành viên</p>
                </div>
                <div>
                  <p className="text-[16px] font-extrabold font-display text-foreground">{myClub.active30DaysCount}</p>
                  <p className="text-[10.5px] text-muted-foreground">Hoạt động 30 ngày</p>
                </div>
                <div>
                  <p className="text-[16px] font-extrabold font-display text-brand dark:text-brand-sky">{myClub.checkInRate}</p>
                  <p className="text-[10.5px] text-muted-foreground">Tỷ lệ check-in</p>
                </div>
              </div>
              <p className="flex items-center gap-1.5 text-[12.5px] text-muted-foreground"><CalendarDays className="h-3.5 w-3.5 shrink-0 text-foreground" />Lịch sinh hoạt: {myClub.weeklySchedule}</p>
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/chat"
                  className="flex items-center justify-center gap-1.5 rounded-lg border border-border py-2.5 text-[13px] font-bold text-foreground hover:bg-muted"
                >
                  <MessageCircle className="h-4 w-4" /> Chat CLB
                </Link>
                {(myClub.myRole === "Owner" || myClub.myRole === "Admin") && (
                  <Link
                    href="/cau-lac-bo/quan-ly"
                    className="flex items-center justify-center gap-1.5 rounded-lg bg-foreground text-background py-2.5 text-[13px] font-bold hover:opacity-90"
                  >
                    <Settings2 className="h-4 w-4" /> Quản lý CLB
                  </Link>
                )}
              </div>
            </div>

            {/* Thử thách tháng của CLB */}
            <div className="border-t border-border p-4 space-y-2.5">
              <div className="flex items-center justify-between">
                <h3 className="text-[14px] font-bold text-foreground flex items-center gap-1.5">
                  <Trophy className="h-4 w-4 text-foreground" /> Thử thách tháng 11: 100 km
                </h3>
                <Badge className="bg-brand text-white text-[10px] font-bold">Còn 12 ngày</Badge>
              </div>
              <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                <div className="h-full bg-gradient-to-r from-brand to-brand-sky rounded-full" style={{ width: "64%" }} />
              </div>
              <div className="flex justify-between text-[11.5px] text-muted-foreground">
                <span>Bạn đã chạy 64/100 km</span>
                <span className="font-bold text-brand dark:text-brand-sky">+0,5 UT khi đúng hẹn</span>
              </div>
              <Button
                size="sm"
                onClick={() => setChallengeJoined(true)}
                disabled={challengeJoined}
                className="w-full rounded-lg bg-brand hover:bg-brand-700 text-white font-bold text-xs h-9 disabled:opacity-100 disabled:bg-emerald-50 disabled:text-emerald-700"
              >
                {challengeJoined ? "✓ Đã ghi danh thử thách" : "Ghi danh thử thách"}
              </Button>
            </div>

            {/* BXH kỷ luật trong CLB */}
            <div className="border-t border-border p-4 space-y-2">
              <h3 className="text-[14px] font-bold text-foreground">Bảng xếp hạng kỷ luật tuần</h3>
              {LEADERBOARD.map((item) => (
                <div key={item.rank} className="flex items-center gap-2.5 text-[12.5px]">
                  <span
                    className={cn(
                      "h-6 w-6 shrink-0 rounded-full flex items-center justify-center text-[11px] font-bold",
                      item.rank === 1 ? "bg-brand text-white" : item.rank <= 3 ? "bg-brand-sky text-black" : "bg-muted text-foreground"
                    )}
                  >
                    {item.rank}
                  </span>
                  <span className="flex-1 font-semibold text-foreground truncate">{item.name}</span>
                  <span className="font-bold text-brand dark:text-brand-sky">{item.km}</span>
                  <span className="w-16 text-right text-muted-foreground">{item.streak}</span>
                </div>
              ))}
            </div>
          </section>

          {/* A2. LỜI MỜI GỬI TỚI BẠN — phải tự Chấp nhận mới vào CLB */}
          {pendingInvites.length > 0 && (
            <section className="space-y-2" aria-label="Lời mời CLB">
              <h2 className="text-[15px] font-bold text-foreground px-1 flex items-center gap-1.5">
                <Mail className="h-4 w-4" /> Lời mời đang chờ bạn
              </h2>
              {pendingInvites.map((inv) => (
                <div key={inv.id} className="p-3.5 rounded-2xl border border-border bg-card space-y-2.5">
                  <div>
                    <p className="text-[14px] font-bold text-foreground">{inv.clubName}</p>
                    {inv.note && <p className="text-[12px] text-muted-foreground">{inv.note}</p>}
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => respondMine(inv.id, false)} className="flex-1 rounded-lg h-9 text-[13px] font-bold">
                      Từ chối
                    </Button>
                    <Button size="sm" onClick={() => respondMine(inv.id, true)} className="flex-1 rounded-lg h-9 bg-brand hover:bg-brand-700 text-white text-[13px] font-bold">
                      Chấp nhận
                    </Button>
                  </div>
                </div>
              ))}
            </section>
          )}

          {/* B. GIA NHẬP BẰNG MÃ MỜI */}
          <form onSubmit={handleJoinByCode} className="p-4 rounded-3xl bg-muted/60 border border-border space-y-2.5">
            <div className="flex items-center gap-1.5 text-[13px] font-bold text-foreground">
              <Key className="h-4 w-4" /> Gia nhập CLB kín bằng mã mời
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="VD: SRC2026"
                aria-label="Mã mời CLB"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                className="flex-1 rounded-lg border border-border bg-background px-3.5 py-2 text-[13px] text-foreground focus:outline-hidden focus:ring-2 focus:ring-brand/30"
              />
              <Button type="submit" disabled={!inviteCode.trim()} className="rounded-lg bg-brand hover:bg-brand-700 text-white font-bold text-[13px] h-9 px-4">
                Gia nhập
              </Button>
            </div>
            {joinMessage && <p className="text-[12px] font-semibold text-brand dark:text-brand-sky animate-in fade-in">{joinMessage}</p>}
          </form>

          {/* C. KHÁM PHÁ CLB */}
          <section className="space-y-2.5" aria-label="Khám phá câu lạc bộ">
            <h2 className="text-[15px] font-bold text-foreground px-1">Khám phá câu lạc bộ</h2>
            {SAMPLE_CLUBS.filter((c) => c.id !== myClub.id).map((club) => {
              const sent = requested.includes(club.id);
              return (
                <div key={club.id} className="p-4 rounded-3xl bg-card border border-border shadow-xs space-y-2.5">
                  <div className="flex items-center gap-3">
                    <img src={club.avatar} alt={club.name} className="w-12 h-12 rounded-2xl object-cover border border-border" />
                    <div className="min-w-0">
                      <h3 className="text-[14px] font-bold text-foreground flex items-center gap-1">
                        {club.name}
                        {club.isVerified && <ShieldCheck className="h-4 w-4 text-foreground" />}
                      </h3>
                      <p className="text-[12px] text-muted-foreground">
                        {club.areaName} · {club.sportName}
                      </p>
                    </div>
                  </div>
                  <p className="text-[12.5px] text-muted-foreground leading-relaxed">{club.description}</p>
                  <div className="flex items-center justify-between pt-1 border-t border-border/60">
                    <span className="text-[12px] text-muted-foreground">
                      <strong className="text-foreground">{club.memberCount}</strong> thành viên · check-in <strong className="text-foreground">{club.checkInRate}</strong>
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={sent}
                      onClick={() => setRequested((r) => [...r, club.id])}
                      className="rounded-lg text-[12px] h-8 px-3.5 font-bold border-brand/40 text-brand dark:text-brand-sky"
                    >
                      {sent ? "Đã gửi yêu cầu" : "Xin gia nhập"}
                    </Button>
                  </div>
                </div>
              );
            })}
          </section>
        </div>
      )}

      {activeTab === "hlv" && <CoachSection />}
    </div>
  );
}
