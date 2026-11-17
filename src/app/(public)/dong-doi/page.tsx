"use client";

import * as React from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Bell,
  ChevronLeft,
  Flame,
  Shield,
  MessageCircle,
  MoreHorizontal,
  Plus,
  Check,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  CURRENT_USER_STATUS,
  URGENT_ACTION,
  SAMPLE_DUOS,
  SAMPLE_SMALL_GROUPS,
  SAMPLE_RECENT_PARTNERS,
} from "@/features/dong-doi/dong-doi.data";

type ScreenView = "main" | "duo" | "nhom";

export default function DongDoiPage() {
  return (
    <React.Suspense fallback={<div className="min-h-screen p-4 max-w-md mx-auto text-center text-xs text-muted-foreground">Đang tải...</div>}>
      <DongDoiContent />
    </React.Suspense>
  );
}

function DongDoiContent() {
  let router: { push: (url: string) => void } | null = null;
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    router = useRouter();
  } catch {
    router = null;
  }
  const searchParams = useSearchParams();
  const [currentView, setCurrentView] = React.useState<ScreenView>("main");
  const [selectedDuoId, setSelectedDuoId] = React.useState<string>("thuy-dung");
  const [selectedGroupId, setSelectedGroupId] = React.useState<string>("sang-thanh-da");

  // Interactive States
  const [groupWorkoutConfirmed, setGroupWorkoutConfirmed] = React.useState<boolean>(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = React.useState<boolean>(false);
  const [isNewDuoModalOpen, setIsNewDuoModalOpen] = React.useState<boolean>(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = React.useState<boolean>(false);
  const [inviteModalType, setInviteModalType] = React.useState<"duo" | "recent">("duo");
  const [toastMessage, setToastMessage] = React.useState<string | null>(null);

  // Sync URL query parameters
  React.useEffect(() => {
    const viewParam = searchParams?.get("view");
    const idParam = searchParams?.get("id");
    if (viewParam === "duo") {
      setCurrentView("duo");
      if (idParam) setSelectedDuoId(idParam);
    } else if (viewParam === "nhom") {
      setCurrentView("nhom");
      if (idParam) setSelectedGroupId(idParam);
    } else if (viewParam === "main") {
      setCurrentView("main");
    }
  }, [searchParams]);

  const openDuo = (id: string) => {
    setSelectedDuoId(id);
    setCurrentView("duo");
    router?.push(`/dong-doi?view=duo&id=${id}`);
  };

  const openGroup = (id: string) => {
    setSelectedGroupId(id);
    setCurrentView("nhom");
    router?.push(`/dong-doi?view=nhom&id=${id}`);
  };

  const goBack = () => {
    setCurrentView("main");
    router?.push("/dong-doi");
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const activeDuo =
    SAMPLE_DUOS.find((d) => d.id === selectedDuoId) || SAMPLE_DUOS[0]!;
  const activeGroup =
    SAMPLE_SMALL_GROUPS.find((g) => g.id === selectedGroupId) ||
    SAMPLE_SMALL_GROUPS[0]!;

  return (
    <div className="flex flex-col w-full min-h-screen bg-background pb-28 max-w-md mx-auto text-foreground">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-2xl bg-foreground text-background text-xs font-semibold shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-3">
          <Check className="h-4 w-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ============================================================== */}
      {/* 1. MAIN SCREEN: ĐỒNG ĐỘI                                      */}
      {/* ============================================================== */}
      {currentView === "main" && (
        <div className="flex flex-col w-full px-4 pt-4 space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold tracking-tight text-foreground">Đồng đội</h1>
              <p className="text-xs text-muted-foreground mt-0.5">Tập tiếp, giữ chuỗi, cùng tiến bộ</p>
            </div>
            <button
              type="button"
              onClick={() => showToast("Bạn có 2 lời nhắc giữ chuỗi trong tuần này")}
              aria-label="Thông báo chuỗi và đồng đội"
              className="relative p-2 rounded-full hover:bg-muted text-foreground transition-all active:scale-95"
            >
              <Bell className="h-5 w-5 stroke-[1.8]" />
              <span className="absolute top-1.5 right-1.5 h-4 w-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center leading-none">
                2
              </span>
            </button>
          </div>

          {/* Thẻ cá nhân trên cùng (Top status card) */}
          <div className="p-3.5 rounded-2xl bg-card border border-border shadow-xs space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md bg-brand/10 dark:bg-brand/20 text-brand dark:text-brand-sky font-bold text-xs">
                  {CURRENT_USER_STATUS.rankTitle}
                </span>
                <span className="text-xs text-muted-foreground">
                  Đúng hẹn {CURRENT_USER_STATUS.onTime}
                </span>
              </div>
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                {CURRENT_USER_STATUS.trustStatus}
              </span>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                <span className="font-semibold text-foreground">
                  {CURRENT_USER_STATUS.currentExp.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")} /{" "}
                  {CURRENT_USER_STATUS.targetExp.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")} EXP
                </span>
                <span>{CURRENT_USER_STATUS.nextRankTitle}</span>
              </div>
              <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-brand rounded-full transition-all duration-500"
                  style={{
                    width: `${(CURRENT_USER_STATUS.currentExp / CURRENT_USER_STATUS.targetExp) * 100}%`,
                  }}
                />
              </div>
            </div>
          </div>

          {/* Việc cần làm hôm nay (Blue solid banner card) */}
          <div className="p-4 rounded-2xl bg-brand text-white shadow-sm space-y-2.5 relative overflow-hidden">
            <p className="text-[10px] font-bold uppercase tracking-wider text-white/80">
              VIỆC CẦN LÀM HÔM NAY
            </p>
            <h2 className="text-base font-bold leading-tight">{URGENT_ACTION.title}</h2>
            <p className="text-xs text-white/90 leading-relaxed">
              {URGENT_ACTION.deadlineText}
            </p>

            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-white/95">
                <Flame className="h-4 w-4 text-amber-300 fill-amber-300" />
                <span>{URGENT_ACTION.progressText}</span>
              </div>
              <button
                type="button"
                onClick={() => openDuo("thuy-dung")}
                className="px-4 py-1.5 rounded-full bg-white text-brand font-bold text-xs hover:bg-neutral-100 active:scale-95 transition-all shadow-xs"
              >
                {URGENT_ACTION.buttonText}
              </button>
            </div>
          </div>

          {/* Section: Duo của bạn */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-foreground">Duo của bạn</h2>
              <button
                type="button"
                onClick={() => openDuo("thuy-dung")}
                className="text-xs font-semibold text-brand dark:text-brand-sky hover:underline"
              >
                Xem chi tiết
              </button>
            </div>

            {/* List Duos */}
            <div className="space-y-2.5">
              {SAMPLE_DUOS.map((duo) => (
                <div
                  key={duo.id}
                  onClick={() => openDuo(duo.id)}
                  className="p-3.5 rounded-2xl bg-card border border-border/80 hover:border-brand/40 shadow-xs cursor-pointer transition-all active:scale-[0.99] space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      {/* Avatars */}
                      <div className="flex items-center -space-x-2">
                        <div className="w-8 h-8 rounded-full bg-brand text-white flex items-center justify-center font-bold text-xs border-2 border-card">
                          B
                        </div>
                        <div className="w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold text-xs border-2 border-card">
                          {duo.partnerAvatar}
                        </div>
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-foreground leading-tight">
                          {duo.partnerName}
                        </h3>
                        <p className="text-[11px] text-muted-foreground">{duo.sportSchedule}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 text-right">
                      <Flame className="h-4 w-4 text-amber-500 fill-amber-500" />
                      <span className="text-sm font-extrabold text-foreground">
                        {duo.streakWeeks}
                      </span>
                      <span className="text-[11px] text-muted-foreground">tuần</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-border/50 text-[11px]">
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "font-semibold",
                          duo.isCompletedThisWeek
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-amber-600 dark:text-amber-400"
                        )}
                      >
                        {duo.statusText}
                      </span>
                      <span className="text-muted-foreground">·</span>
                      <span className="text-muted-foreground">{duo.onTimeRecord}</span>
                    </div>

                    {duo.bonusText ? (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
                        {duo.bonusText}
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          openDuo(duo.id);
                        }}
                        className="px-3 py-1 rounded-full bg-brand text-white font-bold text-xs hover:bg-brand-600 active:scale-95 transition-all shadow-xs"
                      >
                        Hẹn buổi
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {/* + Lập Duo mới button */}
              <button
                type="button"
                onClick={() => setIsNewDuoModalOpen(true)}
                className="w-full py-3 px-4 rounded-2xl border border-dashed border-border hover:border-brand/60 bg-card hover:bg-muted/40 text-xs font-bold text-brand dark:text-brand-sky flex items-center justify-center gap-1.5 transition-all active:scale-[0.99]"
              >
                <Plus className="h-4 w-4 stroke-[2.5]" />
                <span>+ Lập Duo mới</span>
              </button>
            </div>
          </div>

          {/* Section: Nhóm nhỏ (3-6 người) */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-foreground">Nhóm nhỏ</h2>
              <button
                type="button"
                onClick={() => openGroup("sang-thanh-da")}
                className="text-xs font-semibold text-brand dark:text-brand-sky hover:underline"
              >
                Xem nhóm
              </button>
            </div>

            {SAMPLE_SMALL_GROUPS.map((group) => (
              <div
                key={group.id}
                onClick={() => openGroup(group.id)}
                className="p-3.5 rounded-2xl bg-card border border-border/80 hover:border-brand/40 shadow-xs cursor-pointer transition-all active:scale-[0.99] space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-foreground">{group.name}</h3>
                    <p className="text-[11px] text-muted-foreground">{group.sportDescription}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Flame className="h-4 w-4 text-amber-500 fill-amber-500" />
                    <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
                      {group.streakWeeks} tuần
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-foreground">
                      {group.activeCount}/{group.targetCount} người đã tập tuần này
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      Đạt khi {Math.ceil((group.targetCount * group.targetPercent) / 100)}/
                      {group.targetCount}
                    </span>
                  </div>
                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-brand rounded-full transition-all duration-500"
                      style={{
                        width: `${(group.activeCount / group.targetCount) * 100}%`,
                      }}
                    />
                  </div>
                </div>

                {group.isTargetMet && (
                  <div className="p-2.5 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/20 text-[11px] text-emerald-700 dark:text-emerald-300 font-medium leading-relaxed">
                    Mục tiêu tuần đã đạt: mỗi người đã tập nhận +{group.rewardExp} EXP
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Section: Vừa tập cùng */}
          <div className="space-y-2.5">
            <h2 className="text-sm font-bold text-foreground">Vừa tập cùng</h2>

            {SAMPLE_RECENT_PARTNERS.map((partner) => (
              <div
                key={partner.id}
                className="p-3.5 rounded-2xl bg-card border border-border/80 shadow-xs flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0",
                      partner.avatarBgColor
                    )}
                  >
                    {partner.avatarText}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-foreground leading-tight">
                      {partner.name}
                    </h3>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {partner.activityNote} · {partner.onTimeRecord}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    showToast(`Đã gửi lời mời Duo tới ${partner.name}!`);
                  }}
                  className="px-3.5 py-1.5 rounded-full border border-border hover:border-brand/60 bg-muted/40 hover:bg-muted text-xs font-semibold text-foreground transition-all active:scale-95"
                >
                  Mời Duo
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 2. DUO DETAIL SCREEN: DUO VỚI THUÝ DUNG (Right screen mockup) */}
      {/* ============================================================== */}
      {currentView === "duo" && (
        <div className="flex flex-col w-full px-4 pt-3 space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={goBack}
              className="p-1.5 -ml-1.5 rounded-full hover:bg-muted text-foreground transition-all"
              aria-label="Quay lại"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <h1 className="text-base font-bold text-foreground">
              Duo với {activeDuo.partnerName}
            </h1>
            <button
              type="button"
              onClick={() => showToast("Cài đặt cặp Duo: Đang hoàn thiện")}
              className="p-1.5 -mr-1.5 rounded-full hover:bg-muted text-foreground transition-all"
              aria-label="Tùy chọn khác"
            >
              <MoreHorizontal className="h-5 w-5" />
            </button>
          </div>

          {/* Giant Hero Card */}
          <div className="p-5 rounded-3xl bg-card border border-border shadow-xs flex flex-col items-center text-center space-y-3">
            {/* Double Avatars */}
            <div className="flex items-center -space-x-3 mb-1">
              <div className="w-12 h-12 rounded-full bg-brand text-white flex items-center justify-center font-bold text-sm border-2 border-card shadow-xs">
                B
              </div>
              <div className="w-12 h-12 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold text-sm border-2 border-card shadow-xs">
                {activeDuo.partnerAvatar}
              </div>
            </div>

            {/* Huge Streak Number */}
            <div className="flex items-center justify-center gap-1.5">
              <Flame className="h-10 w-10 text-amber-500 fill-amber-500" />
              <span className="text-5xl font-black tracking-tight text-foreground">
                {activeDuo.streakWeeks}
              </span>
            </div>

            <div>
              <p className="text-sm font-bold text-foreground">tuần Duo liên tiếp</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Kỷ lục của hai bạn · bắt đầu từ {activeDuo.streakStartedDate}
              </p>
            </div>

            {/* Weekly Calendar Tracker Box */}
            <div className="w-full mt-2 p-3.5 rounded-2xl bg-muted/50 border border-border/60 space-y-3 text-left">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-foreground">
                  {activeDuo.weeklyCalendar.weekRange}
                </span>
                <span className="text-amber-600 dark:text-amber-400 font-semibold text-[11px]">
                  {activeDuo.weeklyCalendar.requirement}
                </span>
              </div>

              {/* 7 Day Bubbles */}
              <div className="grid grid-cols-7 gap-1.5 text-center">
                {activeDuo.weeklyCalendar.days.map((d) => (
                  <div key={d.day} className="flex flex-col items-center gap-1.5">
                    <span className="text-[10px] text-muted-foreground font-semibold">
                      {d.day}
                    </span>
                    <div
                      className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all",
                        d.isToday && "border-2 border-brand text-brand dark:text-brand-sky bg-brand/10",
                        d.isScheduled && "border-2 border-dashed border-amber-500 bg-amber-500/10 text-amber-600",
                        d.isCompleted && "bg-emerald-500 text-white",
                        !d.isToday && !d.isScheduled && !d.isCompleted && "bg-card border border-border text-muted-foreground"
                      )}
                    >
                      {d.hasFlame ? (
                        <Flame className="h-4 w-4 text-amber-500 fill-amber-500" />
                      ) : d.isCompleted ? (
                        <Check className="h-3.5 w-3.5 stroke-[3]" />
                      ) : (
                        <span className="text-[10px]">•</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* KÈO TIẾP THEO Card */}
          {activeDuo.nextSession && (
            <div className="p-4 rounded-2xl bg-card border border-border shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  KÈO TIẾP THEO
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-[11px]">
                  Cả hai đã xác nhận
                </span>
              </div>

              <div>
                <h3 className="text-sm font-bold text-foreground">
                  {activeDuo.nextSession.title}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                  {activeDuo.nextSession.location} · {activeDuo.nextSession.reminder}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsScheduleModalOpen(true)}
                  className="py-2 px-3 rounded-xl border border-border hover:bg-muted text-xs font-semibold text-foreground transition-all active:scale-95"
                >
                  Dời lịch
                </button>
                <button
                  type="button"
                  onClick={() => {
                    alert(
                      "Báo bận đột xuất: Bạn có thể thông báo trước 2 giờ để không bị trừ điểm uy tín và kích hoạt lá chắn chuỗi nếu cần."
                    );
                  }}
                  className="py-2 px-3 rounded-xl border border-border hover:bg-muted text-xs font-semibold text-foreground transition-all active:scale-95"
                >
                  Báo bận đột xuất
                </button>
              </div>
            </div>
          )}

          {/* Lá chắn chuỗi Card */}
          <div className="p-3.5 rounded-2xl bg-card border border-border shadow-xs flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-brand dark:text-brand-sky flex items-center justify-center shrink-0 mt-0.5">
              <Shield className="h-4 w-4" />
            </div>
            <div className="space-y-0.5">
              <h3 className="text-xs font-bold text-foreground">
                Lá chắn chuỗi: còn {activeDuo.shieldsRemaining}/{activeDuo.maxShields} tháng này
              </h3>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Tự dùng khi tuần trôi qua mà hai bạn chưa kịp hẹn. Không trừ điểm uy tín.
              </p>
            </div>
          </div>

          {/* Thưởng Duo Card */}
          <div className="p-4 rounded-2xl bg-card border border-border shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-foreground">Thưởng Duo</h3>
              <span className="px-2 py-0.5 rounded-full bg-brand/10 text-brand dark:text-brand-sky font-bold text-xs">
                +10 EXP mỗi buổi chung
              </span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">
                Còn {activeDuo.nextMilestone.remainingWeeks} tuần tới mốc{" "}
                {activeDuo.nextMilestone.weeks} tuần
              </span>
              <span className="font-bold text-foreground">
                {activeDuo.nextMilestone.reward}
              </span>
            </div>

            {/* Milestones Track */}
            <div className="grid grid-cols-4 gap-2 text-center pt-1">
              {activeDuo.milestones.map((m) => (
                <div key={m.weeks} className="flex flex-col items-center gap-1">
                  <div
                    className={cn(
                      "w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold",
                      m.completed
                        ? "bg-brand text-white"
                        : m.isCurrentTarget
                        ? "border-2 border-brand text-brand bg-brand/10"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {m.completed ? <Check className="h-3 w-3" /> : m.weeks}
                  </div>
                  <span className="text-[10px] text-muted-foreground font-semibold">
                    {m.weeks} tuần
                  </span>
                </div>
              ))}
            </div>

            <p className="text-[11px] text-muted-foreground leading-relaxed pt-1 border-t border-border/50">
              Thưởng Duo chỉ tính cho tối đa 2 buổi chung mỗi tuần và 3 Duo đang hoạt động, nên không thể cày bằng cách lập thật nhiều cặp.
            </p>
          </div>

          {/* Uy tín hai bên Card */}
          <div className="p-4 rounded-2xl bg-card border border-border shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-foreground">Uy tín hai bên</h3>

            <div className="grid grid-cols-2 divide-x divide-border/60 text-center py-1">
              <div className="px-2">
                <p className="text-xs text-muted-foreground">
                  {activeDuo.trustComparison.user.name}
                </p>
                <p className="text-sm font-bold text-foreground mt-0.5">
                  {activeDuo.trustComparison.user.onTime}
                </p>
                <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                  {activeDuo.trustComparison.user.status}
                </p>
              </div>
              <div className="px-2">
                <p className="text-xs text-muted-foreground">
                  {activeDuo.trustComparison.partner.name}
                </p>
                <p className="text-sm font-bold text-foreground mt-0.5">
                  {activeDuo.trustComparison.partner.onTime}
                </p>
                <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                  {activeDuo.trustComparison.partner.status}
                </p>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-muted/60 border border-border/60 text-[11px] text-muted-foreground leading-relaxed">
              {activeDuo.trustComparison.ruleNote}
            </div>
          </div>

          {/* Bottom Sticky Bar for Duo */}
          <div className="sticky bottom-16 z-40 -mx-4 px-4 py-2.5 bg-background/95 backdrop-blur-md border-t border-border flex items-center gap-2">
            <button
              type="button"
              onClick={() => showToast(`Mở hộp thoại chat cùng ${activeDuo.partnerName}`)}
              aria-label="Nhắn tin với bạn tập"
              className="w-12 h-12 rounded-2xl bg-card border border-border flex items-center justify-center text-foreground hover:bg-muted active:scale-95 transition-all shadow-xs shrink-0"
            >
              <MessageCircle className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => setIsScheduleModalOpen(true)}
              className="flex-1 py-3 px-4 rounded-2xl bg-brand hover:bg-brand-600 active:scale-[0.99] text-white font-bold text-sm transition-all shadow-sm"
            >
              Hẹn buổi tiếp theo
            </button>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 3. SMALL GROUP DETAIL SCREEN: SÁNG THANH ĐA (Left screen mockup) */}
      {/* ============================================================== */}
      {currentView === "nhom" && (
        <div className="flex flex-col w-full px-4 pt-3 space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={goBack}
              className="p-1.5 -ml-1.5 rounded-full hover:bg-muted text-foreground transition-all"
              aria-label="Quay lại"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <h1 className="text-base font-bold text-foreground">{activeGroup.name}</h1>
            <button
              type="button"
              onClick={() => showToast("Cài đặt nhóm nhỏ: Đang hoàn thiện")}
              className="p-1.5 -mr-1.5 rounded-full hover:bg-muted text-foreground transition-all"
              aria-label="Tùy chọn khác"
            >
              <MoreHorizontal className="h-5 w-5" />
            </button>
          </div>

          {/* Hero Streak Card */}
          <div className="p-4 rounded-3xl bg-card border border-border shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold text-xs flex items-center gap-1">
                <Flame className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                Nhóm {activeGroup.streakWeeks} tuần liên tiếp
              </span>
              <span className="text-xs text-muted-foreground">{activeGroup.weekRange}</span>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-black text-foreground">
                  {activeGroup.activeCount}/{activeGroup.targetCount}
                </span>
                <span className="text-xs font-semibold text-muted-foreground">
                  người đã tập tuần này
                </span>
              </div>

              <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-brand rounded-full transition-all duration-500"
                  style={{
                    width: `${(activeGroup.activeCount / activeGroup.targetCount) * 100}%`,
                  }}
                />
              </div>
            </div>

            <div className="p-2.5 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/20 text-xs text-emerald-700 dark:text-emerald-300 font-medium leading-relaxed">
              Đã đạt mục tiêu tuần (từ {Math.ceil((activeGroup.targetCount * activeGroup.targetPercent) / 100)}/
              {activeGroup.targetCount} người). Mỗi người đã tập nhận +{activeGroup.rewardExp} EXP.
            </div>
          </div>

          {/* Members List */}
          <div className="p-4 rounded-3xl bg-card border border-border shadow-xs space-y-3">
            <div className="divide-y divide-border/60">
              {activeGroup.members.map((member) => (
                <div key={member.id} className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0",
                        member.avatarBgColor
                      )}
                    >
                      {member.avatarText}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-bold text-foreground leading-tight">
                          {member.name}
                        </span>
                        {member.isLead && (
                          <span className="px-1.5 py-0.2 rounded-md bg-brand/10 text-brand dark:text-brand-sky font-bold text-[10px]">
                            Dẫn nhóm
                          </span>
                        )}
                      </div>
                      <p
                        className={cn(
                          "text-[11px] mt-0.5",
                          member.isWarning
                            ? "text-amber-600 dark:text-amber-400 font-semibold"
                            : "text-muted-foreground"
                        )}
                      >
                        {member.rankVi}
                      </p>
                    </div>
                  </div>

                  <span className="px-2.5 py-1 rounded-xl bg-muted/60 text-foreground font-bold text-xs">
                    {member.sessionsCompleted}/{member.sessionsTarget} buổi
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* KÈO NHÓM TIẾP THEO Card */}
          {activeGroup.nextKeo && (
            <div className="p-4 rounded-3xl bg-card border border-border shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  KÈO NHÓM TIẾP THEO
                </span>
                <span className="px-2 py-0.5 rounded-full bg-brand/10 text-brand dark:text-brand-sky font-bold text-[11px]">
                  {groupWorkoutConfirmed ? "4/4 xác nhận" : `${activeGroup.nextKeo.confirmedCount}/${activeGroup.nextKeo.totalCount} xác nhận`}
                </span>
              </div>

              <div>
                <h3 className="text-sm font-bold text-foreground">
                  {activeGroup.nextKeo.title}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                  {activeGroup.nextKeo.time} · {activeGroup.nextKeo.location} · Lượt dẫn:{" "}
                  {activeGroup.nextKeo.leaderName}
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setGroupWorkoutConfirmed(!groupWorkoutConfirmed);
                  showToast(
                    groupWorkoutConfirmed
                      ? "Đã huỷ xác nhận tham gia kèo nhóm"
                      : "Đã xác nhận tham gia kèo chạy Chủ nhật này!"
                  );
                }}
                className={cn(
                  "w-full py-2.5 px-4 rounded-xl font-bold text-xs transition-all active:scale-[0.99] shadow-xs flex items-center justify-center gap-1.5",
                  groupWorkoutConfirmed
                    ? "bg-emerald-600 text-white hover:bg-emerald-700"
                    : "bg-brand text-white hover:bg-brand-600"
                )}
              >
                {groupWorkoutConfirmed ? (
                  <>
                    <Check className="h-4 w-4" />
                    <span>Đã xác nhận tham gia</span>
                  </>
                ) : (
                  <span>Xác nhận tham gia</span>
                )}
              </button>
            </div>
          )}

          {/* Còn 2 chỗ trống & Mời Card */}
          <div className="p-4 rounded-3xl bg-card border border-border shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-foreground">
                Còn {activeGroup.openSlots} chỗ trống
              </h3>
              <span className="text-[11px] text-muted-foreground">
                Nhóm {activeGroup.memberCount - 1} đến {activeGroup.maxMembers} người
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setInviteModalType("duo");
                  setIsInviteModalOpen(true);
                }}
                className="py-2 px-3 rounded-xl border border-border hover:bg-muted text-xs font-semibold text-foreground transition-all active:scale-95"
              >
                Mời từ Duo
              </button>
              <button
                type="button"
                onClick={() => {
                  setInviteModalType("recent");
                  setIsInviteModalOpen(true);
                }}
                className="py-2 px-3 rounded-xl border border-border hover:bg-muted text-xs font-semibold text-foreground transition-all active:scale-95"
              >
                Mời người vừa tập
              </button>
            </div>
          </div>

          {/* Luật của nhóm nhỏ Card */}
          <div className="p-4 rounded-3xl bg-muted/40 border border-border/80 space-y-1.5">
            <h3 className="text-xs font-bold text-foreground">Luật của nhóm nhỏ</h3>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Lập nhóm từ Hạng 2, dẫn nhóm từ Hạng 3. Thành viên ở trạng thái Hạn chế không đặt được kèo nhóm. Nhóm không có quỹ, không có sự kiện, không có công cụ quản lý thành viên. Cần những thứ đó thì dùng CLB.
            </p>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: HẸN BUỔI TIẾP THEO (Duo Schedule Modal)                 */}
      {/* ============================================================== */}
      {isScheduleModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in">
          <div className="w-full max-w-md bg-background rounded-t-3xl sm:rounded-3xl border border-border p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-foreground">
                Hẹn buổi với {activeDuo.partnerName}
              </h3>
              <button
                type="button"
                onClick={() => setIsScheduleModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-muted-foreground">Môn tập</label>
                <select className="w-full mt-1 p-2.5 rounded-xl border border-border bg-card text-xs font-medium text-foreground">
                  <option>Chạy bộ nhẹ 5km (Bờ kè Thanh Đa)</option>
                  <option>Gym: Thể lực & Thân trên</option>
                  <option>Đạp xe: Cung đường Sala 15km</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Ngày hẹn</label>
                  <input
                    type="date"
                    defaultValue="2026-11-14"
                    className="w-full mt-1 p-2.5 rounded-xl border border-border bg-card text-xs font-medium text-foreground"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Giờ tập</label>
                  <input
                    type="time"
                    defaultValue="05:30"
                    className="w-full mt-1 p-2.5 rounded-xl border border-border bg-card text-xs font-medium text-foreground"
                  />
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-brand/10 border border-brand/20 text-[11px] text-brand dark:text-brand-sky leading-relaxed">
                Sau khi hẹn, đối tác sẽ nhận được thông báo để xác nhận. Hai bạn hoàn thành buổi tập hợp lệ sẽ được cộng ngay <strong>+10 EXP</strong> và duy trì chuỗi tuần.
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsScheduleModalOpen(false)}
                className="flex-1 py-2.5 px-4 rounded-xl border border-border hover:bg-muted text-xs font-semibold text-foreground transition-all"
              >
                Huỷ
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsScheduleModalOpen(false);
                  showToast(`Đã gửi lời hẹn tới ${activeDuo.partnerName}!`);
                }}
                className="flex-1 py-2.5 px-4 rounded-xl bg-brand hover:bg-brand-600 text-xs font-bold text-white transition-all shadow-xs"
              >
                Gửi lời hẹn
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: LẬP DUO MỚI                                             */}
      {/* ============================================================== */}
      {isNewDuoModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in">
          <div className="w-full max-w-md bg-background rounded-t-3xl sm:rounded-3xl border border-border p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-foreground">Lập Duo mới</h3>
                <p className="text-xs text-muted-foreground">
                  Chỉ chọn người đã có ít nhất 1 buổi tập hợp lệ cùng bạn
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsNewDuoModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-2">
              {SAMPLE_RECENT_PARTNERS.map((partner) => (
                <div
                  key={partner.id}
                  className="p-3 rounded-2xl bg-card border border-border flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs text-white",
                        partner.avatarBgColor
                      )}
                    >
                      {partner.avatarText}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-foreground">{partner.name}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {partner.activityNote} · {partner.onTimeRecord}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setIsNewDuoModalOpen(false);
                      showToast(`Đã gửi lời mời lập Duo tới ${partner.name}!`);
                    }}
                    className="py-1 px-3 rounded-full bg-brand text-white text-xs font-bold hover:bg-brand-600 transition-all shadow-xs"
                  >
                    Mời lập Duo
                  </button>
                </div>
              ))}
            </div>

            <div className="p-3 rounded-2xl bg-muted/60 text-[11px] text-muted-foreground leading-relaxed">
              Quy định chống cày: Bạn có thể duy trì tối đa 3 Duo đang hoạt động cùng lúc. Mỗi Duo được hỗ trợ 2 lá chắn mỗi tháng.
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: MỜI VÀO NHÓM NHỎ                                        */}
      {/* ============================================================== */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in">
          <div className="w-full max-w-md bg-background rounded-t-3xl sm:rounded-3xl border border-border p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-foreground">
                  {inviteModalType === "duo" ? "Mời từ bạn Duo" : "Mời người vừa tập"}
                </h3>
                <p className="text-xs text-muted-foreground">
                  Nhóm nhỏ giới hạn tối đa 6 người để giữ kỷ luật
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsInviteModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-2">
              {inviteModalType === "duo" ? (
                SAMPLE_DUOS.map((d) => (
                  <div
                    key={d.id}
                    className="p-3 rounded-2xl bg-card border border-border flex items-center justify-between"
                  >
                    <div>
                      <p className="text-xs font-bold text-foreground">{d.partnerName}</p>
                      <p className="text-[10px] text-muted-foreground">
                        Chuỗi Duo {d.streakWeeks} tuần · {d.onTimeRecord}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setIsInviteModalOpen(false);
                        showToast(`Đã gửi lời mời tham gia nhóm tới ${d.partnerName}!`);
                      }}
                      className="py-1 px-3 rounded-full bg-brand text-white text-xs font-bold hover:bg-brand-600 transition-all shadow-xs"
                    >
                      Mời
                    </button>
                  </div>
                ))
              ) : (
                SAMPLE_RECENT_PARTNERS.map((p) => (
                  <div
                    key={p.id}
                    className="p-3 rounded-2xl bg-card border border-border flex items-center justify-between"
                  >
                    <div>
                      <p className="text-xs font-bold text-foreground">{p.name}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {p.activityNote} · {p.onTimeRecord}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setIsInviteModalOpen(false);
                        showToast(`Đã gửi lời mời tham gia nhóm tới ${p.name}!`);
                      }}
                      className="py-1 px-3 rounded-full bg-brand text-white text-xs font-bold hover:bg-brand-600 transition-all shadow-xs"
                    >
                      Mời
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
