"use client";

import * as React from "react";
import {
  Sparkles,
  Search,
  Users,
  ShieldCheck,
  CheckCircle2,
  TrendingUp,
} from "lucide-react";
import { SAMPLE_COACHES, DEFAULT_USER_PROFILE } from "@/features/coaching/coaching.data";
import { Coach, CoachingMode, UserCoachProfile } from "@/features/coaching/coaching.types";
import { rankCoaches } from "@/features/coaching/matchmaker";
import { CoachCard } from "./coach-card";
import { CoachPersonalizeWidget } from "./coach-personalize-widget";
import { CoachDetailModal } from "./coach-detail-modal";
import { CoachBookingModal } from "./coach-booking-modal";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CoachSectionProps {
  initialModeFilter?: "all" | "1:1" | "group";
}

export function CoachSection({ initialModeFilter = "all" }: CoachSectionProps) {
  const [profile, setProfile] = React.useState<UserCoachProfile>(DEFAULT_USER_PROFILE);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [modeFilter, setModeFilter] = React.useState<"all" | "1:1" | "group">(initialModeFilter);

  // Modal states
  const [selectedCoachForDetail, setSelectedCoachForDetail] = React.useState<Coach | null>(null);
  const [selectedCoachForBooking, setSelectedCoachForBooking] = React.useState<Coach | null>(null);
  const [bookingMode, setBookingMode] = React.useState<CoachingMode>("1:1");

  // Success toast state
  const [toastMessage, setToastMessage] = React.useState<string | null>(null);

  // Dynamic ranking of coaches
  const rankedCoaches = React.useMemo(() => {
    return rankCoaches(SAMPLE_COACHES, profile, searchQuery, modeFilter);
  }, [profile, searchQuery, modeFilter]);

  const handleOpenDetail = (coach: Coach) => {
    setSelectedCoachForDetail(coach);
  };

  const handleOpenBooking = (coach: Coach, mode: CoachingMode = "1:1") => {
    setSelectedCoachForDetail(null);
    setSelectedCoachForBooking(coach);
    setBookingMode(mode);
  };

  const handleBookingSuccess = (details: {
    coachName: string;
    mode: CoachingMode;
    date: string;
    time: string;
    location: string;
    totalPrice: number;
  }) => {
    setToastMessage(
      `🎉 Bạn đã đặt lịch thành công với HLV ${details.coachName} (${details.mode === "1:1" ? "Gói kèm 1:1" : "Gói Nhóm Squad"}) vào ${details.time} - ${details.date} tại ${details.location}! HLV sẽ liên hệ xác nhận trong 15 phút.`
    );
    setTimeout(() => {
      setToastMessage(null);
    }, 8000);
  };

  return (
    <div className="space-y-3.5">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="p-3 rounded-2xl bg-emerald-600 text-white text-xs font-semibold shadow-lg flex items-start gap-2 animate-in slide-in-from-top">
          <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
          <div className="flex-1 leading-relaxed">{toastMessage}</div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-white/80 hover:text-white font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Hero Banner Coaching */}
      <div className="p-4 rounded-3xl bg-gradient-to-r from-[#1b3554] via-[#294c77] to-[#1b3554] text-white shadow-md relative overflow-hidden space-y-2">
        <div className="relative z-10 space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-[#c0e6fd] font-bold">
            <Sparkles className="h-3.5 w-3.5 fill-[#c0e6fd]" />
            <span>MẠNG LƯỚI COACHING BẢO CHỨNG CHUYÊN NGHIỆP</span>
          </div>
          <h2 className="text-base sm:text-lg font-black tracking-tight leading-snug">
            Huấn Luyện Viên 1:1 & Ghép Nhóm Tập Luyện
          </h2>
          <p className="text-xs text-[#c0e6fd]/90 leading-relaxed max-w-lg">
            Kèm riêng chuẩn form từng động tác hoặc rủ Micro-Squad tập cùng HLV để chia sẻ chi phí tiết kiệm đến 60%.
          </p>
        </div>

        <div className="relative z-10 flex flex-wrap items-center gap-2 pt-1 text-[11px] font-semibold text-white/95">
          <span className="flex items-center gap-1 bg-white/15 px-2.5 py-1 rounded-full backdrop-blur-xs">
            <ShieldCheck className="h-3.5 w-3.5 text-[#c0e6fd]" />
            100% Bằng cấp xác minh
          </span>
          <span className="flex items-center gap-1 bg-white/15 px-2.5 py-1 rounded-full backdrop-blur-xs">
            <Users className="h-3.5 w-3.5 text-[#c0e6fd]" />
            Ghép nhóm từ 140k/bạn
          </span>
          <span className="flex items-center gap-1 bg-white/15 px-2.5 py-1 rounded-full backdrop-blur-xs">
            <TrendingUp className="h-3.5 w-3.5 text-[#c0e6fd]" />
            Đo Inbody & Giáo án số
          </span>
        </div>
      </div>

      {/* AI Personalize Matchmaker Widget */}
      <CoachPersonalizeWidget
        profile={profile}
        onChangeProfile={setProfile}
        onReset={() => setProfile(DEFAULT_USER_PROFILE)}
      />

      {/* Search & Mode Filter Controls */}
      <div className="space-y-2">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Tìm theo tên HLV, môn tập (Gym, Chạy, Yoga, Boxing) hoặc khu vực..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-8.5 rounded-full border border-border bg-background pl-8 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-hidden"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-2.5 text-xs text-muted-foreground hover:text-foreground"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Mode Filter Pills */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            {[
              { id: "all", label: "Tất cả HLV" },
              { id: "1:1", label: "Chuyên 1:1" },
              { id: "group", label: "Hỗ trợ Nhóm (Tiết kiệm 60%)" },
            ].map((m) => (
              <button
                key={m.id}
                onClick={() => setModeFilter(m.id as "all" | "1:1" | "group")}
                className={cn(
                  "px-3 py-1 rounded-full text-[11px] font-bold transition-all border",
                  modeFilter === m.id
                    ? "bg-[#1b3554] text-white border-[#1b3554] shadow-xs"
                    : "bg-muted/50 border-border text-muted-foreground hover:text-foreground"
                )}
              >
                {m.label}
              </button>
            ))}
          </div>

          <span className="text-[11px] text-muted-foreground font-semibold">
            Tìm thấy <strong>{rankedCoaches.length}</strong> HLV phù hợp
          </span>
        </div>
      </div>

      {/* Coach Cards List */}
      <div className="space-y-3">
        {rankedCoaches.length > 0 ? (
          rankedCoaches.map((item) => (
            <CoachCard
              key={item.coach.id}
              matchResult={item}
              onViewDetails={() => handleOpenDetail(item.coach)}
              onBookSession={() => handleOpenBooking(item.coach, profile.preferredMode === "group" ? "group" : "1:1")}
            />
          ))
        ) : (
          <div className="p-8 rounded-3xl bg-muted/40 border border-border text-center space-y-2">
            <p className="text-xs font-bold text-foreground">Không tìm thấy Huấn luyện viên phù hợp với bộ lọc hiện tại.</p>
            <p className="text-[11px] text-muted-foreground">Hãy thử nới lỏng mức ngân sách hoặc chọn lại môn thể thao.</p>
            <Button
              onClick={() => {
                setProfile(DEFAULT_USER_PROFILE);
                setSearchQuery("");
                setModeFilter("all");
              }}
              size="sm"
              className="rounded-full bg-[#1b3554] text-white text-xs font-bold"
            >
              Đặt Lại Toàn Bộ Lọc
            </Button>
          </div>
        )}
      </div>

      {/* Squad Callout Banner */}
      <div className="p-3.5 rounded-3xl bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 border border-emerald-500/30 flex items-center justify-between gap-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5 text-xs font-black text-emerald-800 dark:text-emerald-300">
            <Users className="h-4 w-4" />
            <span>Bạn đã có Micro-Squad 2-4 người?</span>
          </div>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Thuê chung Huấn Luyện Viên 1 buổi cuối tuần để chỉnh tư thế và lên giáo án đồng bộ, chi phí chỉ từ 140k/người!
          </p>
        </div>
        <Button
          onClick={() => setModeFilter("group")}
          size="sm"
          className="rounded-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs h-8 px-3 shrink-0"
        >
          Xem HLV Nhóm
        </Button>
      </div>

      {/* Detail Modal */}
      <CoachDetailModal
        coach={selectedCoachForDetail}
        isOpen={!!selectedCoachForDetail}
        onClose={() => setSelectedCoachForDetail(null)}
        onBookSession={handleOpenBooking}
      />

      {/* Booking Modal */}
      <CoachBookingModal
        coach={selectedCoachForBooking}
        initialMode={bookingMode}
        isOpen={!!selectedCoachForBooking}
        onClose={() => setSelectedCoachForBooking(null)}
        onSuccess={handleBookingSuccess}
      />
    </div>
  );
}
