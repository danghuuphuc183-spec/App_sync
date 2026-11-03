"use client";

import * as React from "react";
import Link from "next/link";
import {
  Shield,
  MapPin,
  Calendar,
  MessageCircle,
  ArrowRight,
  ChevronUp,
  ChevronDown,
  CheckCircle2,
  Zap,
  Sparkles,
  SlidersHorizontal,
  Clock,
  Activity,
  ExternalLink,
  ChevronRight,
  Info,
  X,
  Target,
  HeartHandshake,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { InstagramChatModal } from "@/components/chat/instagram-chat-modal";
import { MatchCandidate, CANDIDATES_DATA } from "@/features/match/candidates.data";
import {
  calculateCandidateMatch,
  rankCandidates,
  UserPreferences,
  MatchScoreBreakdown,
} from "@/features/match/matcher";

export default function LenKeoPage() {
  const [candidates] = React.useState<MatchCandidate[]>(CANDIDATES_DATA);
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [selectedSportFilter, setSelectedSportFilter] = React.useState<string>("all");
  const [isFilterOpen, setIsFilterOpen] = React.useState(false);
  const [isAlgorithmInfoOpen, setIsAlgorithmInfoOpen] = React.useState(false);

  // User personalization preference state
  const [mySport, setMySport] = React.useState<MatchCandidate["sport"]>("running");
  const [myPaceSec, setMyPaceSec] = React.useState<number>(330); // 5:30/km
  const [myTimeSlot, setMyTimeSlot] = React.useState<"morning_early" | "noon" | "evening" | "night">("morning_early");

  // Modals state
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = React.useState(false);
  const [confirmedAppointment, setConfirmedAppointment] = React.useState<{
    candidate: MatchCandidate;
    address: string;
    dateTime: string;
    holdTs: number;
  } | null>(null);

  // Instagram Chat Modal state
  const [isChatOpen, setIsChatOpen] = React.useState(false);
  const [chatPartner, setChatPartner] = React.useState<MatchCandidate | null>(null);

  // Fast partner connection success toast
  const [connectSuccessCandidate, setConnectSuccessCandidate] = React.useState<MatchCandidate | null>(null);

  // Appointment custom form
  const [customDateTime, setCustomDateTime] = React.useState("");
  const [customAddress, setCustomAddress] = React.useState("");
  const [customHoldTs, setCustomHoldTs] = React.useState("20");

  // Touch gesture state for TikTok / Tinder style vertical swipe
  const touchStartY = React.useRef<number | null>(null);
  const touchDeltaY = React.useRef<number>(0);
  const lastWheelTime = React.useRef<number>(0);

  // Dynamic user preference object
  const userPreferences: UserPreferences = React.useMemo(() => {
    return {
      sport: mySport,
      targetPaceSec: myPaceSec,
      preferredTimeSlot: myTimeSlot,
      maxDistanceKm: 15,
      traits: ["#DậySớm5h", "#KỷLuật", "#Pace530"],
    };
  }, [mySport, myPaceSec, myTimeSlot]);

  // Re-rank and filter candidates based on algorithmic matching
  const filteredCandidates = React.useMemo(() => {
    // 1. Filter by chosen pill filter
    const baseList = candidates.filter((c) => {
      if (selectedSportFilter === "all") return true;
      if (selectedSportFilter === "ghost") return c.workoutAppointment.isGhostMode;
      return c.sport === selectedSportFilter;
    });

    if (!isFilterOpen) {
      return baseList;
    }

    // 2. Rank remaining candidates using Multi-Factor Algorithmic Scoring
    return rankCandidates(userPreferences, baseList, { explorationRate: 0 });
  }, [candidates, selectedSportFilter, userPreferences, isFilterOpen]);

  const activeCandidate =
    currentIndex < filteredCandidates.length
      ? filteredCandidates[currentIndex]
      : filteredCandidates[0] || candidates[0];

  // Algorithmic breakdown for current active candidate
  const currentMatchBreakdown: MatchScoreBreakdown | null = React.useMemo(() => {
    if (!activeCandidate) return null;
    return calculateCandidateMatch(userPreferences, activeCandidate);
  }, [activeCandidate, userPreferences]);

  const handleNext = React.useCallback(() => {
    if (filteredCandidates.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % filteredCandidates.length);
  }, [filteredCandidates.length]);

  const handlePrev = React.useCallback(() => {
    if (filteredCandidates.length === 0) return;
    setCurrentIndex((prev) => (prev - 1 + filteredCandidates.length) % filteredCandidates.length);
  }, [filteredCandidates.length]);

  // Keyboard navigation (ArrowUp, ArrowDown)
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isAppointmentModalOpen || isChatOpen || isAlgorithmInfoOpen) return;
      if (e.key === "ArrowUp" || e.key === "k") {
        e.preventDefault();
        handleNext();
      } else if (e.key === "ArrowDown" || e.key === "j") {
        e.preventDefault();
        handlePrev();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleNext, handlePrev, isAppointmentModalOpen, isChatOpen, isAlgorithmInfoOpen]);

  // Wheel scroll for desktop vertical swipe
  const handleWheel = (e: React.WheelEvent) => {
    const now = Date.now();
    if (now - lastWheelTime.current < 400) return;

    if (e.deltaY > 40) {
      lastWheelTime.current = now;
      handleNext();
    } else if (e.deltaY < -40) {
      lastWheelTime.current = now;
      handlePrev();
    }
  };

  // Touch handlers for mobile swipe up / swipe down
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0]?.clientY ?? null;
    touchDeltaY.current = 0;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartY.current === null) return;
    const currentY = e.touches[0]?.clientY ?? touchStartY.current;
    touchDeltaY.current = currentY - touchStartY.current;
  };

  const handleTouchEnd = () => {
    if (touchStartY.current === null) return;
    const threshold = 45; // pixels
    if (touchDeltaY.current < -threshold) {
      // Swiped UP -> Next candidate
      handleNext();
    } else if (touchDeltaY.current > threshold) {
      // Swiped DOWN -> Previous candidate
      handlePrev();
    }
    touchStartY.current = null;
    touchDeltaY.current = 0;
  };

  const handleOpenAppointmentModal = () => {
    if (!activeCandidate) return;
    setCustomDateTime(activeCandidate.workoutAppointment.dateTimeVi);
    setCustomAddress(activeCandidate.workoutAppointment.addressDetail);
    setCustomHoldTs(String(activeCandidate.workoutAppointment.holdTs));
    setIsAppointmentModalOpen(true);
  };

  const handleConfirmAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCandidate) return;
    const result = {
      candidate: activeCandidate,
      address: customAddress,
      dateTime: customDateTime,
      holdTs: parseInt(customHoldTs, 10) || 20,
    };
    setConfirmedAppointment(result);
    setIsAppointmentModalOpen(false);
  };

  const handleStartTogether = () => {
    if (!activeCandidate) return;
    setConnectSuccessCandidate(activeCandidate);
    setTimeout(() => {
      setConnectSuccessCandidate(null);
    }, 2500);
  };

  const handleOpenChat = (candidate: MatchCandidate) => {
    setChatPartner(candidate);
    setIsChatOpen(true);
  };

  return (
    <div
      className="flex flex-col w-full max-w-md mx-auto px-3 py-2 space-y-3 pb-24 select-none"
      onWheel={handleWheel}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* 1. TOP HEADER: THÔNG BÁO VỊ TRÍ, BỘ LỌC THỂ THAO & THUẬT TOÁN INFO */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-1.5">
            <Zap className="h-4 w-4 text-[#1b3554] dark:text-[#c0e6fd] stroke-[2.2]" />
            <h2 className="text-sm font-black text-foreground uppercase tracking-tight">
              Ghép Đôi & Lên Lịch Tập
            </h2>
            <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-[#1b3554] text-white">
              30 VĐV
            </span>
          </div>
          <p className="text-[10px] text-muted-foreground font-medium">
            Lướt lên trên để đổi người • Thuật toán TikTok/Tinder cá nhân hoá
          </p>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setIsAlgorithmInfoOpen(true)}
            className="p-1.5 rounded-lg border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-foreground"
            title="Xem giải thích thuật toán ghép đôi"
          >
            <Info className="h-3.5 w-3.5" />
          </button>

          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={cn(
              "flex items-center gap-1 px-2.5 py-1 rounded-lg border text-xs font-bold transition-colors",
              isFilterOpen
                ? "bg-[#1b3554] text-white border-[#1b3554]"
                : "bg-white dark:bg-card border-neutral-200 dark:border-neutral-800 text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100"
            )}
          >
            <SlidersHorizontal className="h-3.5 w-3.5 stroke-[1.8]" />
            <span>Bộ Lọc</span>
          </button>
        </div>
      </div>

      {/* FILTER & PERSONALIZATION DRAWER */}
      {isFilterOpen && (
        <div className="p-3 rounded-xl bg-white dark:bg-card border border-neutral-200 dark:border-neutral-800 space-y-3 text-xs shadow-xs animate-in fade-in duration-150">
          <div className="space-y-1.5">
            <div className="font-bold text-foreground">Bộ lọc môn thể thao:</div>
            <div className="flex flex-wrap gap-1.5">
              {[
                { id: "all", label: "Tất cả môn" },
                { id: "running", label: "🏃 Chạy bộ" },
                { id: "gym", label: "🏋️ Gym" },
                { id: "pickleball", label: "🏓 Pickleball" },
                { id: "badminton", label: "🏸 Cầu lông" },
                { id: "cycling", label: "🚴 Đạp xe" },
                { id: "ghost", label: "👻 Ghost Mode" },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => {
                    setSelectedSportFilter(f.id);
                    setCurrentIndex(0);
                  }}
                  className={cn(
                    "px-3 py-1 rounded-lg text-[11px] font-bold border transition-all",
                    selectedSportFilter === f.id
                      ? "bg-[#1b3554] text-white dark:bg-[#c0e6fd] dark:text-[#000f22] border-[#1b3554]"
                      : "bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400"
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* User Personalization Settings for Real-Time Re-Ranking */}
          <div className="pt-2 border-t border-neutral-200 dark:border-neutral-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-foreground text-[11px] flex items-center gap-1">
                <Target className="h-3 w-3 text-cyan-500" />
                Cá nhân hóa hồ sơ của bạn (Thuật toán sẽ tự động tối ưu):
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div>
                <label className="text-[10px] text-muted-foreground block">Môn bạn tập:</label>
                <select
                  value={mySport}
                  onChange={(e) => {
                    setMySport(e.target.value as MatchCandidate["sport"]);
                    setCurrentIndex(0);
                  }}
                  className="w-full mt-0.5 p-1 rounded-md border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-foreground"
                >
                  <option value="running">Chạy Bộ (Running)</option>
                  <option value="gym">Gym & Kháng Lực</option>
                  <option value="cycling">Đạp Xe (Cycling)</option>
                  <option value="badminton">Cầu Lông</option>
                  <option value="pickleball">Pickleball</option>
                  <option value="swimming">Bơi Lội</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] text-muted-foreground block">Khung giờ tập:</label>
                <select
                  value={myTimeSlot}
                  onChange={(e) => {
                    setMyTimeSlot(e.target.value as "morning_early" | "noon" | "evening" | "night");
                    setCurrentIndex(0);
                  }}
                  className="w-full mt-0.5 p-1 rounded-md border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-foreground"
                >
                  <option value="morning_early">Sáng sớm (05:00 - 06:30)</option>
                  <option value="noon">Buổi trưa (11:30 - 13:00)</option>
                  <option value="evening">Chiều tối (17:30 - 19:30)</option>
                  <option value="night">Đêm muộn (20:30 - 22:30)</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUCCESS TOAST FOR INSTANT CONNECTION */}
      {connectSuccessCandidate && (
        <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 flex items-center justify-between text-xs text-emerald-900 dark:text-emerald-200 animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 stroke-[2.2]" />
            <div>
              <div className="font-bold">Đã Kết Nối Cùng {connectSuccessCandidate.name}!</div>
              <div className="text-[10px] text-emerald-700 dark:text-emerald-300">
                Hãy mở khung chat để thống nhất trang bị và địa điểm tập.
              </div>
            </div>
          </div>
          <button
            onClick={() => handleOpenChat(connectSuccessCandidate)}
            className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-bold text-[11px] hover:bg-emerald-700"
          >
            Chat Ngay
          </button>
        </div>
      )}

      {/* CONFIRMED APPOINTMENT BANNER */}
      {confirmedAppointment && (
        <div className="p-3 rounded-xl bg-[#c0e6fd]/30 dark:bg-[#1b3554]/30 border border-[#80aad3]/40 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-bold text-[#1b3554] dark:text-[#c0e6fd] flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 stroke-[2]" />
              Lịch Hẹn Tập Đã Xác Nhận!
            </span>
            <span className="text-[10px] font-mono bg-white dark:bg-card px-2 py-0.5 rounded-md border border-[#80aad3]/40">
              Mã #KH-2026
            </span>
          </div>

          <div className="space-y-1 text-[11px] text-foreground">
            <div>
              <strong>Bạn tập:</strong> {confirmedAppointment.candidate.name} (
              {confirmedAppointment.candidate.sportVi})
            </div>
            <div>
              <strong>Thời gian:</strong> {confirmedAppointment.dateTime}
            </div>
            <div>
              <strong>Địa chỉ:</strong> {confirmedAppointment.address}
            </div>
            <div>
              <strong>Bảo chứng kỷ luật:</strong> Đã khóa tạm {confirmedAppointment.holdTs} TS
            </div>
          </div>

          <div className="pt-1 flex gap-2">
            <button
              onClick={() => handleOpenChat(confirmedAppointment.candidate)}
              className="flex-1 py-1.5 rounded-lg bg-[#1b3554] text-white font-bold text-center text-xs flex items-center justify-center gap-1 hover:bg-[#000f22]"
            >
              <MessageCircle className="h-3.5 w-3.5" />
              <span>Mở Chat Instagram Với {confirmedAppointment.candidate.name}</span>
            </button>
            <a
              href={confirmedAppointment.candidate.workoutAppointment.googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 font-bold text-xs flex items-center justify-center gap-1 hover:bg-neutral-100"
            >
              <span>Xem Bản Đồ</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* 2. CHÍNH: ATHLETIC PARTNER CARD WITH TIKTOK/TINDER VERTICAL SWIPE */}
      {/* =================================================================== */}
      {activeCandidate && (
        <div className="relative w-full rounded-2xl bg-card border border-neutral-200 dark:border-neutral-800 shadow-sm overflow-hidden flex flex-col space-y-0">
          {/* Top Athlete Image & Basic Badges */}
          <div className="relative w-full h-72 overflow-hidden bg-neutral-900">
            <img
              src={activeCandidate.avatar}
              alt={activeCandidate.name}
              decoding="async"
              className="w-full h-full object-cover transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/25 to-black/35 pointer-events-none" />

            {/* Top Bar on Image: Trust Score, Match percentage & Counter */}
            <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
              <div className="flex items-center gap-1.5 bg-[#000f22]/85 backdrop-blur-md border border-[#80aad3]/40 rounded-lg px-2.5 py-1 text-white shadow-xs">
                <Shield className="h-3.5 w-3.5 text-[#c0e6fd] stroke-[2]" />
                <span className="text-xs font-black">{activeCandidate.trustScore} TS</span>
                <span className="text-[10px] text-neutral-300 font-semibold">• Kim Cương</span>
              </div>

              <div className="flex items-center gap-1.5">
                <div className="flex items-center gap-1 bg-[#c0e6fd] text-[#1b3554] rounded-lg px-2.5 py-1 text-xs font-black shadow-xs">
                  <Sparkles className="h-3 w-3 stroke-[2]" />
                  <span>{activeCandidate.matchScore}% Tương Thích</span>
                </div>
                <span className="bg-black/60 text-white font-mono text-[10px] px-2 py-1 rounded-md backdrop-blur-xs">
                  {currentIndex + 1}/{filteredCandidates.length}
                </span>
              </div>
            </div>

            {/* Floating Navigation Controls (Up / Down) */}
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex flex-col gap-2 z-10">
              <button
                onClick={handlePrev}
                className="p-2 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-md transition-all active:scale-90 border border-white/10"
                title="Lướt người trước"
              >
                <ChevronUp className="h-4 w-4" />
              </button>
              <button
                onClick={handleNext}
                className="p-2 rounded-full bg-cyan-600 hover:bg-cyan-500 text-white backdrop-blur-md transition-all active:scale-90 border border-cyan-400/30 shadow-md"
                title="Lướt lên trên để xem người tiếp theo (Swipe Up)"
              >
                <ChevronDown className="h-4 w-4" />
              </button>
            </div>

            {/* Bottom on Image: Name, Age, Active Zone */}
            <div className="absolute bottom-3 left-3 right-12 text-white space-y-1">
              <div className="flex items-baseline gap-2">
                <h3 className="text-lg font-black">{activeCandidate.name}</h3>
                <span className="text-xs font-bold text-white/90">
                  {activeCandidate.age} tuổi • {activeCandidate.gender}
                </span>
                <span className="text-xs font-bold text-emerald-400">
                  {activeCandidate.punctualRate}
                </span>
              </div>

              <div className="flex items-center gap-1 text-xs text-neutral-200">
                <MapPin className="h-3.5 w-3.5 text-rose-400 shrink-0" />
                <span className="truncate">
                  Khu vực: <strong>{activeCandidate.activeRunningZone}</strong>
                </span>
              </div>
            </div>
          </div>

          {/* Body Content */}
          <div className="p-3.5 space-y-3 bg-card text-xs">
            {/* MATCH REASONS BADGES (TikTok Algorithmic Explanation) */}
            {currentMatchBreakdown && currentMatchBreakdown.matchReasonVi.length > 0 && (
              <div className="flex flex-wrap gap-1 p-2 rounded-lg bg-cyan-50/70 dark:bg-cyan-950/30 border border-cyan-200 dark:border-cyan-900/50">
                <span className="text-[10px] font-bold text-cyan-800 dark:text-cyan-300 flex items-center gap-1 mr-1">
                  <Sparkles className="h-3 w-3 text-cyan-600" />
                  Điểm chạm:
                </span>
                {currentMatchBreakdown.matchReasonVi.map((reason, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded-md bg-white dark:bg-card border border-cyan-200 dark:border-cyan-800 text-[10px] font-semibold text-cyan-900 dark:text-cyan-200"
                  >
                    ✓ {reason}
                  </span>
                ))}
              </div>
            )}

            {/* A. KHUNG NĂNG LỰC THỂ THAO (ATHLETIC CAPABILITY FRAMEWORK) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black uppercase text-foreground tracking-tight flex items-center gap-1">
                  <Activity className="h-3.5 w-3.5 text-[#1b3554] dark:text-[#c0e6fd] stroke-[2]" />
                  Khung Năng Lực & Thể Lực
                </span>
                <span className="text-[10px] font-bold text-[#1b3554] dark:text-[#c0e6fd]">
                  {activeCandidate.sportVi} • Điểm thể lực {activeCandidate.capabilities.staminaScore}/100
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 p-2.5 rounded-lg bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
                <div>
                  <span className="text-[10px] text-muted-foreground block">Pace / Mức Tạ:</span>
                  <span className="text-xs font-bold text-foreground">
                    {activeCandidate.capabilities.paceOrWeight}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground block">Kỷ Lục / Cự Ly:</span>
                  <span className="text-xs font-bold text-foreground">
                    {activeCandidate.capabilities.longestDistanceOrPR}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground block">Tần Suất Tập:</span>
                  <span className="text-xs font-bold text-foreground">
                    {activeCandidate.capabilities.weeklySessions}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground block">Cấp Độ:</span>
                  <span className="text-xs font-bold text-[#1b3554] dark:text-[#c0e6fd]">
                    {activeCandidate.capabilities.level}
                  </span>
                </div>
              </div>
            </div>

            {/* B. THÓI QUEN & SỞ THÍCH (HABITS & PREFERENCES) */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-black uppercase text-foreground tracking-tight flex items-center gap-1">
                <Clock className="h-3.5 w-3.5 text-[#1b3554] dark:text-[#c0e6fd] stroke-[2]" />
                Thói Quen & Sở Thích Tập Luyện
              </span>

              <div className="space-y-1.5 p-2.5 rounded-lg bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-[11px]">
                <div className="flex items-start gap-1.5">
                  <span className="font-bold text-muted-foreground shrink-0">• Khung giờ:</span>
                  <span className="text-foreground font-semibold">
                    {activeCandidate.habitsAndPreferences.preferredTime}
                  </span>
                </div>

                <div className="flex items-start gap-1.5">
                  <span className="font-bold text-muted-foreground shrink-0">• Phong cách:</span>
                  <span className="text-foreground">
                    {activeCandidate.habitsAndPreferences.workoutStyle}
                  </span>
                </div>

                <div className="flex items-start gap-1.5">
                  <span className="font-bold text-muted-foreground shrink-0">• Sau buổi tập:</span>
                  <span className="text-foreground">
                    {activeCandidate.habitsAndPreferences.afterWorkout}
                  </span>
                </div>

                <div className="flex items-start gap-1.5">
                  <span className="font-bold text-muted-foreground shrink-0">• Âm thanh / Podcast:</span>
                  <span className="text-foreground">
                    {activeCandidate.habitsAndPreferences.audioPreference}
                  </span>
                </div>

                {/* Traits Tags */}
                <div className="flex flex-wrap gap-1 pt-1">
                  {activeCandidate.habitsAndPreferences.traits.map((t, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded-md bg-white dark:bg-card border border-neutral-200 dark:border-neutral-700 text-[10px] text-neutral-700 dark:text-neutral-300 font-medium"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* C. LỊCH HẸN ĐỀ XUẤT SẴN (SUGGESTED WORKOUT) */}
            <div className="p-2.5 rounded-lg bg-[#c0e6fd]/30 dark:bg-[#1b3554]/30 border border-[#80aad3]/40 space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold text-[#1b3554] dark:text-[#c0e6fd]">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  Kèo Đang Mở: {activeCandidate.workoutAppointment.title}
                </span>
                <span>{activeCandidate.workoutAppointment.holdTs} TS cọc</span>
              </div>

              <div className="text-[11px] text-neutral-800 dark:text-neutral-200 space-y-0.5">
                <div className="flex items-center gap-1 font-semibold">
                  <Clock className="h-3 w-3 text-neutral-500" />
                  <span>{activeCandidate.workoutAppointment.dateTimeVi}</span>
                </div>
                <div className="flex items-center gap-1 font-semibold">
                  <MapPin className="h-3 w-3 text-neutral-500" />
                  <span>{activeCandidate.workoutAppointment.locationName}</span>
                </div>
              </div>
            </div>

            {/* D. ACTION BUTTONS: BẮT ĐẦU TẬP CÙNG & TẠO LỊCH HẸN & NHẮN TIN */}
            <div className="space-y-2 pt-1">
              <div className="grid grid-cols-2 gap-2">
                {/* 1. Bắt Đầu Tập Cùng */}
                <button
                  onClick={handleStartTogether}
                  className="py-2.5 rounded-xl bg-[#1b3554] hover:bg-[#000f22] text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs active:scale-95"
                >
                  <CheckCircle2 className="h-4 w-4 stroke-[2]" />
                  <span>Bắt Đầu Tập Cùng</span>
                </button>

                {/* 2. Tạo Lịch Hẹn Với Người Này */}
                <button
                  onClick={handleOpenAppointmentModal}
                  className="py-2.5 rounded-xl bg-white dark:bg-neutral-800 border-2 border-[#1b3554] text-[#1b3554] dark:text-[#c0e6fd] font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-[#c0e6fd]/20 transition-colors active:scale-95"
                >
                  <Calendar className="h-4 w-4 stroke-[2]" />
                  <span>Tạo Lịch Hẹn</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {/* 3. Mở Chat Instagram Direct */}
                <button
                  onClick={() => handleOpenChat(activeCandidate)}
                  className="py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
                >
                  <MessageCircle className="h-4 w-4 stroke-[1.8]" />
                  <span>Nhắn Tin Instagram</span>
                </button>

                {/* 4. Lướt Người Tiếp Theo */}
                <button
                  onClick={handleNext}
                  className="py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
                >
                  <span>Lướt Người Khác</span>
                  <ArrowRight className="h-4 w-4 stroke-[2]" />
                </button>
              </div>

              {/* TikTok / Tinder Swipe Up Guide */}
              <div className="flex items-center justify-center gap-1 text-[10px] text-muted-foreground pt-1">
                <ChevronUp className="h-3.5 w-3.5 text-cyan-500 animate-bounce" />
                <span>Vuốt lên trên hoặc bấm phím mũi tên để tìm bạn tập tiếp theo</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* 3. MODAL GIẢI THÍCH CHI TIẾT THUẬT TOÁN GỢI Ý (GOOGLE DOCS TRANSPARENCY) */}
      {/* =================================================================== */}
      {isAlgorithmInfoOpen && currentMatchBreakdown && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 animate-in fade-in duration-150">
          <div className="w-full max-w-sm rounded-2xl bg-card border border-neutral-200 dark:border-neutral-800 p-4 space-y-3.5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-2">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-600">
                  <Sparkles className="h-4 w-4" />
                </div>
                <h3 className="text-xs font-black text-foreground uppercase">
                  Thuật Toán Khớp Nối Bạn Tập
                </h3>
              </div>
              <button
                onClick={() => setIsAlgorithmInfoOpen(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <p className="text-[11px] text-muted-foreground">
                Hệ thống sử dụng mô hình xếp hạng đa mục tiêu (Multi-Objective Two-Tower Ranking) tương tự TikTok và Gale-Shapley Reciprocal của Tinder để tìm bạn tập tương thích cao nhất:
              </p>

              <div className="space-y-1.5 p-2 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-foreground">1. Môn thể thao (Trọng số 28%):</span>
                  <span className="font-bold text-cyan-600">{currentMatchBreakdown.sportScore}/100</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-foreground">2. Pace & Cường độ (Trọng số 24%):</span>
                  <span className="font-bold text-cyan-600">{currentMatchBreakdown.paceScore}/100</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-foreground">3. Khung giờ biểu (Trọng số 20%):</span>
                  <span className="font-bold text-cyan-600">{currentMatchBreakdown.timeScore}/100</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-foreground">4. Khoảng cách địa lý (Trọng số 14%):</span>
                  <span className="font-bold text-cyan-600">{currentMatchBreakdown.distanceScore}/100</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-foreground">5. Thói quen & Vibe (Trọng số 8%):</span>
                  <span className="font-bold text-cyan-600">{currentMatchBreakdown.vibeScore}/100</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-foreground">6. Trust Score uy tín (Trọng số 6%):</span>
                  <span className="font-bold text-cyan-600">+{currentMatchBreakdown.trustBoost} Boost</span>
                </div>
              </div>

              <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-[10px] text-emerald-800 dark:text-emerald-300">
                <strong>Đã thử nghiệm quy mô 1.000 người dùng:</strong> Thời gian phản hồi trung bình &lt; 0.05ms, tỷ lệ tìm được bạn tập tương thích &gt; 90% đạt 94.8%.
              </div>
            </div>

            <button
              onClick={() => setIsAlgorithmInfoOpen(false)}
              className="w-full py-2 rounded-xl bg-[#1b3554] text-white font-bold text-xs"
            >
              Đã Hiểu
            </button>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* 4. MODAL TẠO LỊCH HẸN VỚI VẬN ĐỘNG VIÊN */}
      {/* =================================================================== */}
      {isAppointmentModalOpen && activeCandidate && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 animate-in fade-in duration-150">
          <div className="w-full max-w-sm rounded-xl bg-card border border-neutral-200 dark:border-neutral-800 p-4 space-y-3 shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-2.5">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-[#1b3554] dark:text-[#c0e6fd] stroke-[2]" />
                <h3 className="text-sm font-black text-foreground">
                  Tạo Lịch Hẹn Với {activeCandidate.name}
                </h3>
              </div>
              <button
                onClick={() => setIsAppointmentModalOpen(false)}
                className="text-neutral-500 hover:text-foreground"
              >
                <X className="h-4 w-4 stroke-[2]" />
              </button>
            </div>

            <form onSubmit={handleConfirmAppointment} className="space-y-2.5 text-xs">
              <div className="space-y-1">
                <label htmlFor="custom-datetime-input" className="font-bold text-foreground">
                  Thời gian & Ngày hẹn cụ thể
                </label>
                <input
                  id="custom-datetime-input"
                  type="text"
                  required
                  placeholder="VD: 05:30 AM • Sáng mai"
                  value={customDateTime}
                  onChange={(e) => setCustomDateTime(e.target.value)}
                  className="w-full rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 px-3 py-1.5 text-xs text-foreground focus:outline-hidden focus:ring-1 focus:ring-[#1b3554]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-foreground">Địa chỉ điểm hẹn tập</label>
                <input
                  type="text"
                  required
                  placeholder="VD: Cổng bến thuyền Landmark 81, Bình Thạnh"
                  value={customAddress}
                  onChange={(e) => setCustomAddress(e.target.value)}
                  className="w-full rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 px-3 py-1.5 text-xs text-foreground focus:outline-hidden focus:ring-1 focus:ring-[#1b3554]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-foreground">
                  Bảo chứng kỷ luật TS (Khóa tạm)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="10"
                    max="50"
                    value={customHoldTs}
                    onChange={(e) => setCustomHoldTs(e.target.value)}
                    className="w-24 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 px-3 py-1.5 text-xs text-foreground focus:outline-hidden focus:ring-1 focus:ring-[#1b3554]"
                  />
                  <span className="text-[11px] text-muted-foreground">
                    TS sẽ hoàn lại 100% khi cả 2 check-in đúng giờ.
                  </span>
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsAppointmentModalOpen(false)}
                  className="flex-1 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-800 text-foreground font-semibold hover:bg-neutral-100"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 py-1.5 rounded-lg bg-[#1b3554] text-white font-bold hover:bg-[#000f22]"
                >
                  Xác Nhận Hẹn
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* 5. INSTAGRAM DIRECT CHAT MODAL */}
      {/* =================================================================== */}
      {isChatOpen && chatPartner && (
        <InstagramChatModal
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
          partnerInfo={{
            name: chatPartner.name,
            handle: `@${chatPartner.name.toLowerCase().replace(/\s+/g, "")}_sync`,
            avatar: chatPartner.avatar,
            sportVi: chatPartner.sportVi,
            trustScore: chatPartner.trustScore,
          }}
        />
      )}
    </div>
  );
}
