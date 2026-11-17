"use client";

import * as React from "react";
import Link from "next/link";
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
  Users,
  CreditCard,
  QrCode,
  Trophy,
  CalendarDays,
  ExternalLink,
  Lock,
  ArrowRight,
  ShieldCheck,
  Building2,
  Sparkles,
  Search,
  MapPin,
  Clock,
  UserCheck,
  Award,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  CURRENT_USER_STATUS,
  URGENT_ACTION,
  SAMPLE_DUOS,
  SAMPLE_SMALL_GROUPS,
  SAMPLE_RECENT_PARTNERS,
  SAMPLE_CLUBS_LIST,
  type ClubListItem,
} from "@/features/dong-doi/dong-doi.data";
import { quoteFee, formatVnd, PAYMENT_CONFIG } from "@/features/clubs/payments";
import { VietQRPaymentModal } from "@/components/payment/vietqr-payment-modal";
import { SplitPaymentOrder, MOCK_PARTNER_ACCOUNTS, SYNESIS_PLATFORM_ACCOUNT } from "@/features/payment/payos.types";
import { generateVietQrImageUrl, generateOrderCode } from "@/features/payment/vietqr.service";
import { RankAuraGlow, getRankTheme } from "@/components/profile/rank-aura";
import { RankBadgeIcon } from "@/components/profile/rank-badge-icon";

type ScreenView = "main" | "duo" | "nhom";
type MainCategory = "nhom" | "clb";

export default function DongDoiPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen p-4 max-w-md mx-auto text-center text-xs text-muted-foreground">
          Đang tải...
        </div>
      }
    >
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
  const [activeCategory, setActiveCategory] = React.useState<MainCategory>("nhom");
  const [selectedDuoId, setSelectedDuoId] = React.useState<string>("thuy-dung");
  const [selectedGroupId, setSelectedGroupId] = React.useState<string>("sang-thanh-da");

  // Interactive States
  const [groupWorkoutConfirmed, setGroupWorkoutConfirmed] = React.useState<boolean>(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = React.useState<boolean>(false);
  const [isNewDuoModalOpen, setIsNewDuoModalOpen] = React.useState<boolean>(false);
  const [isNewGroupModalOpen, setIsNewGroupModalOpen] = React.useState<boolean>(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = React.useState<boolean>(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = React.useState<boolean>(false);
  const [inviteModalType, setInviteModalType] = React.useState<"duo" | "recent">("duo");
  const [toastMessage, setToastMessage] = React.useState<string | null>(null);

  // CLB Interaction States
  const [userClubRole, setUserClubRole] = React.useState<"member" | "leader">("member");
  const [registeredEventIds, setRegisteredEventIds] = React.useState<string[]>(["event-1"]);
  const [eventCategoryFilter, setEventCategoryFilter] = React.useState<string>("all");
  const [joinedClubIds, setJoinedClubIds] = React.useState<string[]>([]);
  const [clubInviteCode, setClubInviteCode] = React.useState<string>("");
  const [duesPaid, setDuesPaid] = React.useState<boolean>(false);

  // New Group Form States
  const [newGroupName, setNewGroupName] = React.useState<string>("Runners Sáng Bờ Kè");
  const [newGroupSport, setNewGroupSport] = React.useState<string>("Chạy bộ");
  const [selectedPartnerIds, setSelectedPartnerIds] = React.useState<string[]>(["hoang-nam"]);

  // Sync URL query parameters
  React.useEffect(() => {
    const tabParam = searchParams?.get("tab");
    if (tabParam === "clb") {
      setActiveCategory("clb");
    } else if (tabParam === "nhom") {
      setActiveCategory("nhom");
    }

    const roleParam = searchParams?.get("role");
    if (roleParam === "leader") {
      setUserClubRole("leader");
    } else if (roleParam === "member") {
      setUserClubRole("member");
    }

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

  const handleToggleEventRsvp = (eventId: string, title: string) => {
    if (registeredEventIds.includes(eventId)) {
      setRegisteredEventIds((prev) => prev.filter((id) => id !== eventId));
      showToast(`Đã huỷ đăng ký tham gia: ${title}`);
    } else {
      setRegisteredEventIds((prev) => [...prev, eventId]);
      showToast(`Đã đăng ký tham gia thành công: ${title} (+50 EXP)!`);
    }
  };

  const switchCategory = (cat: MainCategory) => {
    setActiveCategory(cat);
    setCurrentView("main");
    router?.push(`/dong-doi?tab=${cat}`);
  };

  const openDuo = (id: string) => {
    setSelectedDuoId(id);
    setCurrentView("duo");
    router?.push(`/dong-doi?view=duo&id=${id}&tab=${activeCategory}`);
  };

  const openGroup = (id: string) => {
    setSelectedGroupId(id);
    setCurrentView("nhom");
    router?.push(`/dong-doi?view=nhom&id=${id}&tab=${activeCategory}`);
  };

  const goBack = () => {
    setCurrentView("main");
    router?.push(`/dong-doi?tab=${activeCategory}`);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const handleJoinClub = (clubId: string, clubName: string) => {
    setJoinedClubIds((prev) => [...prev, clubId]);
    showToast(`Đã gửi yêu cầu gia nhập ${clubName}!`);
  };

  const handleInviteCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clubInviteCode.trim()) return;
    showToast(`Đã gửi yêu cầu gia nhập CLB với mã "${clubInviteCode.trim().toUpperCase()}"!`);
    setClubInviteCode("");
  };

  const handleCreateGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;
    setIsNewGroupModalOpen(false);
    showToast(`Đã tạo nhóm "${newGroupName}" thành công! Lời mời đã gửi tới các bạn tập.`);
  };

  const activeDuo =
    SAMPLE_DUOS.find((d) => d.id === selectedDuoId) || SAMPLE_DUOS[0]!;
  const activeGroup =
    SAMPLE_SMALL_GROUPS.find((g) => g.id === selectedGroupId) ||
    SAMPLE_SMALL_GROUPS[0]!;
  const myClub = SAMPLE_CLUBS_LIST[0]!;

  // Mock Split Payment Order for CLB Q4 Dues
  const clbDuesFee = quoteFee("club_membership", myClub.duesPerQuarterVnd);
  const sampleOrderCode = React.useMemo(() => generateOrderCode(), []);
  const clbPaymentOrder: SplitPaymentOrder = React.useMemo(() => {
    const partnerAcc = MOCK_PARTNER_ACCOUNTS.club_running_ftu2;
    return {
      orderCode: sampleOrderCode,
      orderId: `SYNC-CLB-${sampleOrderCode}`,
      kind: "club_membership",
      title: "Hội phí CLB FTU2 Runners - Quý IV",
      description: `SYNC ${sampleOrderCode}`,
      buyerName: "Minh Thư (Admin)",
      buyerEmail: "minhthu@synesis.vn",
      buyerPhone: "0903123456",
      totalAmount: myClub.duesPerQuarterVnd,
      status: duesPaid ? "PAID" : "PENDING",
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
      platformAccount: SYNESIS_PLATFORM_ACCOUNT,
      partnerAccount: partnerAcc,
      vietQrUrl: generateVietQrImageUrl(
        partnerAcc,
        myClub.duesPerQuarterVnd,
        `SYNC ${sampleOrderCode}`
      ),
      breakdown: {
        totalAmountVnd: myClub.duesPerQuarterVnd,
        platformFeePercent: PAYMENT_CONFIG.platformPercent.club_membership,
        platformFeeVnd: clbDuesFee.platformFeeVnd,
        gatewayFeeVnd: clbDuesFee.processingFeeVnd,
        partnerReceivePercent: 94,
        partnerReceiveVnd: clbDuesFee.clubReceivesVnd,
      },
    };
  }, [duesPaid, sampleOrderCode, myClub.duesPerQuarterVnd, clbDuesFee]);

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
      {/* 1. MAIN SCREEN: ĐỒNG ĐỘI & CLB                                 */}
      {/* ============================================================== */}
      {currentView === "main" && (
        <div className="flex flex-col w-full px-4 pt-4 space-y-3.5">
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

          {/* TOP SEGMENTED TAB SWITCHER: NHÓM (3-6 người) & CLB (Chạy bộ / Gym) */}
          <div className="grid grid-cols-2 gap-1 p-1 rounded-2xl bg-muted/80 border border-border/70" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={activeCategory === "nhom"}
              onClick={() => switchCategory("nhom")}
              className={cn(
                "flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold transition-all",
                activeCategory === "nhom"
                  ? "bg-card text-foreground shadow-xs border border-border/60"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Users className="h-4 w-4 text-brand" />
              <span>Nhóm tập</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-brand/10 text-brand font-semibold">
                3–6
              </span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={activeCategory === "clb"}
              onClick={() => switchCategory("clb")}
              className={cn(
                "flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold transition-all",
                activeCategory === "clb"
                  ? "bg-card text-foreground shadow-xs border border-border/60"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Shield className="h-4 w-4 text-blue-500" />
              <span>Câu Lạc Bộ</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 font-semibold">
                CLB
              </span>
            </button>
          </div>

          {/* ============================================================== */}
          {/* TAB 1: NHÓM TẬP (3-6 NGƯỜI & DUO - TỰ TẠO SAU KHI TẬP CHUNG)    */}
          {/* ============================================================== */}
          {activeCategory === "nhom" && (
            <div className="space-y-3.5 animate-in fade-in duration-200">
              {/* Guidance Info Badge */}
              <div className="px-3 py-2 rounded-xl bg-muted/50 border border-border/60 flex items-center justify-between text-[11px] text-muted-foreground">
                <span className="truncate pr-2">
                  💡 <strong>Nhóm:</strong> Tự tạo sau khi tập chung (3–6 người) · Giữ chuỗi tuần
                </span>
                <button
                  type="button"
                  onClick={() => setIsNewGroupModalOpen(true)}
                  className="text-brand dark:text-brand-sky font-bold hover:underline shrink-0"
                >
                  + Tạo nhóm
                </button>
              </div>

              {/* Thẻ cá nhân trên cùng (Top status card - Màu loan Rank 3 Ruby Cùng mẫu với CLB) */}
              {(() => {
                const userRankTheme = getRankTheme(3);
                return (
                  <div
                    className={cn(
                      "p-3.5 rounded-2xl bg-card border shadow-xs space-y-2.5 relative overflow-hidden transition-all duration-300",
                      userRankTheme.borderClass
                    )}
                  >
                    {/* Hiệu ứng màu loan đa sắc theo Rank 3 Ruby */}
                    <RankAuraGlow level={3} variant="dual-mesh" />

                    <div className="flex items-center justify-between relative z-10">
                      <div className="flex items-center gap-2">
                        <RankBadgeIcon level={3} size="xs" showAura animated />
                        <span className={cn("px-2 py-0.5 rounded-md font-bold text-xs", userRankTheme.pillClass)}>
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

                    <div className="space-y-1 relative z-10">
                      <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                        <span className="font-semibold text-foreground">
                          {CURRENT_USER_STATUS.currentExp.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")} /{" "}
                          {CURRENT_USER_STATUS.targetExp.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")} EXP
                        </span>
                        <span className={userRankTheme.textClass}>{CURRENT_USER_STATUS.nextRankTitle}</span>
                      </div>
                      <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                        <div
                          className={cn(
                            "h-full rounded-full transition-all duration-500 bg-linear-to-r",
                            userRankTheme.progressGradient
                          )}
                          style={{
                            width: `${(CURRENT_USER_STATUS.currentExp / CURRENT_USER_STATUS.targetExp) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })()}

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

              {/* Section: Nhóm nhỏ (3-6 người - CÙNG MẪU CARD) */}
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
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-xl bg-brand/10 text-brand flex items-center justify-center font-bold text-xs shrink-0">
                          <Users className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-foreground">{group.name}</h3>
                          <p className="text-[11px] text-muted-foreground">{group.sportDescription}</p>
                        </div>
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
                      <div className="p-2 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/20 text-[11px] text-emerald-700 dark:text-emerald-300 font-medium leading-relaxed">
                        Mục tiêu tuần đã đạt: mỗi người đã tập nhận +{group.rewardExp} EXP
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Section: Vừa tập cùng */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-bold text-foreground">Vừa tập cùng</h2>
                  <span className="text-[11px] text-muted-foreground">Gợi ý tạo nhóm</span>
                </div>

                {SAMPLE_RECENT_PARTNERS.map((partner) => (
                  <div
                    key={partner.id}
                    className="p-3.5 rounded-2xl bg-card border border-border/80 shadow-xs flex items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={cn(
                          "w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0",
                          partner.avatarBgColor
                        )}
                      >
                        {partner.avatarText}
                      </div>
                      <div className="truncate">
                        <h3 className="text-sm font-bold text-foreground leading-tight truncate">
                          {partner.name}
                        </h3>
                        <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
                          {partner.activityNote} · {partner.onTimeRecord}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedPartnerIds([partner.id]);
                          setIsNewGroupModalOpen(true);
                        }}
                        className="px-2.5 py-1.5 rounded-full bg-brand/10 hover:bg-brand/20 text-brand dark:text-brand-sky text-xs font-semibold transition-all active:scale-95"
                      >
                        + Nhóm
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          showToast(`Đã gửi lời mời Duo tới ${partner.name}!`);
                        }}
                        className="px-2.5 py-1.5 rounded-full border border-border hover:border-brand/60 bg-muted/40 hover:bg-muted text-xs font-semibold text-foreground transition-all active:scale-95"
                      >
                        Mời Duo
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 2: CÂU LẠC BỘ (CHẠY BỘ / PHÒNG GYM - PHÂN QUYỀN THÀNH VIÊN VS TRƯỞNG CLB) */}
          {/* ============================================================== */}
          {activeCategory === "clb" && (
            <div className="space-y-3.5 animate-in fade-in duration-200">
              {/* Guidance Info Badge */}
              <div className="px-3 py-2 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-between text-[11px] text-blue-900 dark:text-blue-300">
                <span className="truncate pr-2">
                  🛡️ <strong>CLB:</strong> Dành cho CLB chạy bộ & phòng gym · Thành viên, sự kiện & hoạt động
                </span>
                {userClubRole === "leader" && (
                  <Link
                    href="/cau-lac-bo/quan-ly"
                    className="font-bold underline shrink-0 text-blue-600 dark:text-blue-400"
                  >
                    Quản lý Quỹ
                  </Link>
                )}
              </div>

              {/* BỘ CHỌN PHÂN QUYỀN (DEMO / THỰC TẾ: THÀNH VIÊN VS TRƯỞNG CLB / BQL PHÒNG GYM) */}
              <div className="flex items-center justify-between p-2.5 rounded-2xl bg-card border border-border/80 text-xs shadow-xs">
                <div className="flex items-center gap-1.5">
                  <span className="text-muted-foreground text-[11px]">Vai trò của bạn:</span>
                  <span
                    className={cn(
                      "px-2 py-0.5 rounded-full font-bold text-[10.5px]",
                      userClubRole === "leader"
                        ? "bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30"
                        : "bg-blue-500/15 text-blue-700 dark:text-blue-300 border border-blue-500/30"
                    )}
                  >
                    {userClubRole === "leader" ? "🛡️ Trưởng CLB / BQL Gym" : "👤 Thành viên CLB"}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setUserClubRole(userClubRole === "leader" ? "member" : "leader")}
                  className="text-[11px] font-semibold text-brand dark:text-brand-sky hover:underline"
                >
                  Chuyển sang: {userClubRole === "leader" ? "Thành viên" : "Trưởng CLB"}
                </button>
              </div>

              {/* TRƯỜNG HỢP 1: TRƯỞNG CÂU LẠC BỘ / BQL PHÒNG GYM (ĐƯỢC QUẢN LÝ QUỸ & THU CHI) */}
              {userClubRole === "leader" && (
                <div className="p-4 rounded-3xl bg-card border border-border/80 shadow-xs space-y-3 relative overflow-hidden animate-in fade-in duration-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                        <CreditCard className="h-4 w-4" />
                      </div>
                      <div>
                        <h2 className="text-xs font-bold text-foreground">Quỹ Sinh Hoạt CLB</h2>
                        <p className="text-[10px] text-muted-foreground">{myClub.name}</p>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-400 font-bold text-[10.5px] border border-amber-500/30">
                      Vai trò: Trưởng CLB / Admin
                    </span>
                  </div>

                  {/* 3 Chỉ số tài chính nhanh */}
                  <div className="grid grid-cols-3 gap-2 p-2.5 rounded-2xl bg-muted/50 border border-border/60 text-center">
                    <div>
                      <p className="text-base font-black text-brand dark:text-brand-sky">
                        {formatVnd(myClub.fundBalanceVnd)}
                      </p>
                      <p className="text-[10px] text-muted-foreground">Số dư quỹ hiện tại</p>
                    </div>
                    <div>
                      <p className="text-base font-black text-foreground">
                        {formatVnd(myClub.duesPerQuarterVnd)}
                      </p>
                      <p className="text-[10px] text-muted-foreground">Phí Quý IV / tv</p>
                    </div>
                    <div>
                      <p className="text-base font-black text-emerald-600 dark:text-emerald-400">
                        {myClub.paidMembersCount}/{myClub.totalDuesMembersCount}
                      </p>
                      <p className="text-[10px] text-muted-foreground">Đã nộp quỹ (82%)</p>
                    </div>
                  </div>

                  {/* Thanh tiến độ nộp quỹ thành viên */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-foreground">Tiến độ thu quỹ Quý IV</span>
                      <span className="text-[11px] text-muted-foreground">
                        {Math.round((myClub.paidMembersCount / myClub.totalDuesMembersCount) * 100)}% hoàn thành
                      </span>
                    </div>
                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-linear-to-r from-blue-500 to-brand rounded-full transition-all duration-500"
                        style={{
                          width: `${(myClub.paidMembersCount / myClub.totalDuesMembersCount) * 100}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Cách tính tiền CLB minh bạch (Transparent Fee Breakdown) */}
                  <div className="p-2.5 rounded-2xl bg-muted/40 border border-border/50 text-[11px] space-y-1">
                    <div className="flex items-center justify-between text-muted-foreground">
                      <span>Phí thành viên đóng:</span>
                      <span className="font-semibold text-foreground">{formatVnd(clbDuesFee.amountVnd)}</span>
                    </div>
                    <div className="flex items-center justify-between text-muted-foreground">
                      <span>Phí nền tảng SYNESIS ({PAYMENT_CONFIG.platformPercent.club_membership}%):</span>
                      <span className="font-mono text-foreground">−{formatVnd(clbDuesFee.platformFeeVnd)}</span>
                    </div>
                    <div className="flex items-center justify-between text-muted-foreground">
                      <span>Phí cổng đối tác VietQR ({PAYMENT_CONFIG.processing.percent}%):</span>
                      <span className="font-mono text-foreground">−{formatVnd(clbDuesFee.processingFeeVnd)}</span>
                    </div>
                    <div className="flex items-center justify-between pt-1 border-t border-border/50 font-bold text-emerald-600 dark:text-emerald-400">
                      <span>CLB thực nhận (94%):</span>
                      <span>{formatVnd(clbDuesFee.clubReceivesVnd)} / tv</span>
                    </div>
                  </div>

                  {/* 2 Nút Hành động Quỹ dành cho Trưởng CLB */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setIsPaymentModalOpen(true)}
                      className="py-2.5 px-3 rounded-xl bg-brand hover:bg-brand-600 active:scale-95 text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5"
                    >
                      <QrCode className="h-4 w-4" />
                      <span>Thu quỹ qua VietQR</span>
                    </button>
                    <Link
                      href="/cau-lac-bo/quan-ly"
                      className="py-2.5 px-3 rounded-xl border border-border hover:bg-muted active:scale-95 text-xs font-semibold text-foreground transition-all flex items-center justify-center gap-1 text-center"
                    >
                      <span>Quản lý Quỹ & CLB</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>

                  <p className="text-[10px] text-muted-foreground pt-1 flex items-center gap-1">
                    <Lock className="h-3 w-3 shrink-0" />
                    <span>Chỉ Trưởng CLB và Ban quản lý phòng gym mới có thẩm quyền xem và quản lý quỹ.</span>
                  </p>
                </div>
              )}

              {/* TRƯỜNG HỢP 2: THÀNH VIÊN THƯỜNG (CHỈ XEM TƯ CÁCH HỘI VIÊN, KHÔNG THẤY TIỀN QUỸ CLB) */}
              {userClubRole === "member" && (
                <div className="p-3.5 rounded-2xl bg-card border border-border/80 shadow-xs space-y-2.5 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                        <UserCheck className="h-4 w-4" />
                      </div>
                      <div>
                        <h2 className="text-xs font-bold text-foreground">Tư cách hội viên: {myClub.name}</h2>
                        <p className="text-[10px] text-muted-foreground">Mã hội viên: FTU-8821 · Sinh hoạt định kỳ</p>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-[10.5px]">
                      Hội viên chính thức
                    </span>
                  </div>

                  {/* Trạng thái nộp hội phí cá nhân */}
                  <div className="p-2.5 rounded-xl bg-muted/40 border border-border/50 text-[11px] flex items-center justify-between">
                    <div>
                      <span className="text-muted-foreground">Hội phí cá nhân Quý IV: </span>
                      <strong className="text-foreground">150.000đ</strong>
                      <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">
                        {duesPaid ? "✓ Đã đóng phí (Hiệu lực đến 31/12/2026)" : "Chưa đóng phí"}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsPaymentModalOpen(true)}
                      className="px-3 py-1.5 rounded-lg bg-brand hover:bg-brand-600 active:scale-95 text-white font-bold text-xs transition-all shadow-xs flex items-center gap-1"
                    >
                      <QrCode className="h-3.5 w-3.5" />
                      <span>{duesPaid ? "Biên nhận" : "Nộp hội phí"}</span>
                    </button>
                  </div>

                  <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <Lock className="h-3 w-3 shrink-0" />
                    <span>Số dư quỹ tổng CLB chỉ hiển thị cho Trưởng CLB và Ban quản lý phòng gym.</span>
                  </p>
                </div>
              )}

              {/* SỰ KIỆN & HOẠT ĐỘNG CLB (HIỂN THỊ ĐẦY ĐỦ CHO THÀNH VIÊN & TRƯỞNG CLB) */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <CalendarDays className="h-4 w-4 text-brand" />
                    <h2 className="text-sm font-bold text-foreground">Sự kiện & Hoạt động CLB</h2>
                  </div>
                  <span className="text-[11px] font-semibold text-brand dark:text-brand-sky">
                    {myClub.events?.length || 3} hoạt động
                  </span>
                </div>

                {/* Filter badges */}
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar text-xs">
                  {[
                    { id: "all", label: "Tất cả" },
                    { id: "race", label: "Giải chạy nội bộ" },
                    { id: "long_run", label: "Long Run" },
                    { id: "workshop", label: "Workshop" },
                  ].map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setEventCategoryFilter(f.id)}
                      className={cn(
                        "px-2.5 py-1 rounded-full text-[11px] font-semibold shrink-0 transition-all",
                        eventCategoryFilter === f.id
                          ? "bg-brand text-white shadow-xs"
                          : "bg-muted/70 text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>

                {/* Danh sách Event Cards */}
                <div className="space-y-2.5">
                  {(myClub.events || [])
                    .filter((ev) => eventCategoryFilter === "all" || ev.eventType === eventCategoryFilter)
                    .map((ev) => {
                      const isRsvped = registeredEventIds.includes(ev.id);
                      return (
                        <div
                          key={ev.id}
                          className="p-3.5 rounded-2xl bg-card border border-border/80 hover:border-brand/40 shadow-xs space-y-2.5 transition-all"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="flex items-center gap-1.5 mb-1">
                                <span className="px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold text-[10px]">
                                  {ev.eventTypeName}
                                </span>
                                {ev.badgeText && (
                                  <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold text-[10px]">
                                    {ev.badgeText}
                                  </span>
                                )}
                              </div>
                              <h3 className="text-sm font-bold text-foreground leading-snug">{ev.title}</h3>
                            </div>
                            <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-extrabold text-[10px] shrink-0">
                              +{ev.rewardExp} EXP
                            </span>
                          </div>

                          <div className="space-y-1 text-[11px] text-muted-foreground">
                            <div className="flex items-center gap-1.5">
                              <Clock className="h-3.5 w-3.5 text-brand shrink-0" />
                              <span>
                                {ev.dateVi} · {ev.timeVi}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                              <span className="truncate">{ev.location}</span>
                            </div>
                            <div className="flex items-center justify-between pt-0.5">
                              <span className="font-medium text-foreground">
                                {ev.distanceOrDuration} · Chủ trì: {ev.hostName}
                              </span>
                              <span className="text-muted-foreground font-semibold">
                                {ev.participantsCount + (isRsvped && !ev.isRegistered ? 1 : 0)}/{ev.maxParticipants} vđv
                              </span>
                            </div>
                          </div>

                          <div className="pt-1 border-t border-border/50 flex items-center justify-between">
                            <span className="text-[10px] text-muted-foreground">
                              {isRsvped ? "✓ Đã đăng ký tham gia" : "Mở cho toàn thể hội viên CLB"}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleToggleEventRsvp(ev.id, ev.title)}
                              className={cn(
                                "px-3 py-1.5 rounded-xl font-bold text-xs transition-all active:scale-95 shadow-xs",
                                isRsvped
                                  ? "bg-emerald-600 text-white hover:bg-emerald-700"
                                  : "bg-brand text-white hover:bg-brand-600"
                              )}
                            >
                              {isRsvped ? "Đã đăng ký ✓" : "Đăng ký tham gia (RSVP)"}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* BAN CHỦ NHIỆM & THÀNH VIÊN CLB */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Users className="h-4 w-4 text-brand" />
                    <h2 className="text-sm font-bold text-foreground">Ban Chủ Nhiệm & Thành Viên</h2>
                  </div>
                  <span className="text-[11px] font-semibold text-muted-foreground">
                    {myClub.memberCount} thành viên
                  </span>
                </div>

                {/* Danh sách Ban Quản Trị & Ban Chủ Nhiệm */}
                <div className="space-y-2">
                  {(myClub.leadership || []).map((lead) => (
                    <div
                      key={lead.id}
                      className="p-3 rounded-2xl bg-card border border-border/80 shadow-xs flex items-center justify-between gap-2"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={cn(
                            "w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0",
                            lead.avatarBgColor
                          )}
                        >
                          {lead.avatarText}
                        </div>
                        <div className="truncate">
                          <div className="flex items-center gap-1.5">
                            <h4 className="text-xs font-bold text-foreground truncate">{lead.name}</h4>
                            <span className="px-1.5 py-0.2 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold text-[9.5px]">
                              {lead.badge}
                            </span>
                          </div>
                          <p className="text-[10.5px] text-muted-foreground truncate">{lead.roleTitle}</p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-xs font-black text-brand font-mono">{lead.weeklyKm}</span>
                        <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                          {lead.trustScore}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* CLB CỦA BẠN (CARD CÙNG MẪU VỚI NHÓM NHỎ) */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-bold text-foreground">CLB của bạn</h2>
                  <Link
                    href="/cau-lac-bo"
                    className="text-xs font-semibold text-brand dark:text-brand-sky hover:underline flex items-center gap-0.5"
                  >
                    <span>Trang CLB</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>

                <div className="p-3.5 rounded-2xl bg-card border border-border/80 hover:border-brand/40 shadow-xs space-y-2.5 transition-all">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={myClub.avatar}
                        alt={myClub.name}
                        className="w-10 h-10 rounded-xl object-cover shrink-0 border border-border"
                      />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h3 className="text-sm font-bold text-foreground">{myClub.name}</h3>
                          <ShieldCheck className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                        </div>
                        <p className="text-[11px] text-muted-foreground">{myClub.weeklySchedule}</p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-brand dark:text-brand-sky">
                      {myClub.memberCount} tv
                    </span>
                  </div>

                  {/* Thử thách km CLB tuần này (Thanh tiến độ cùng mẫu) */}
                  {myClub.challengeProgress && (
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-foreground">
                          {myClub.challengeProgress.currentKm}/{myClub.challengeProgress.targetKm} km tuần
                        </span>
                        <span className="text-[11px] text-muted-foreground">
                          Còn {myClub.challengeProgress.daysLeft} ngày
                        </span>
                      </div>
                      <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-brand rounded-full transition-all duration-500"
                          style={{
                            width: `${(myClub.challengeProgress.currentKm / myClub.challengeProgress.targetKm) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Kèo nội bộ CLB */}
                  <div className="p-2 rounded-xl bg-muted/40 border border-border/50 text-[11px] flex items-center justify-between">
                    <span className="text-muted-foreground">
                      Kèo kín tuần này: <strong>{myClub.internalBounties[0]?.title}</strong>
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-[10px] shrink-0">
                      Còn {myClub.internalBounties[0]?.slotsLeft} slot
                    </span>
                  </div>
                </div>
              </div>

              {/* KHÁM PHÁ CÁC CLB KHÁC (CARD CÙNG MẪU VỚI NHÓM NHỎ) */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-bold text-foreground">Khám phá CLB Chạy bộ & Gym</h2>
                  <span className="text-[11px] text-muted-foreground">Theo khu vực</span>
                </div>

                {SAMPLE_CLUBS_LIST.slice(1).map((club) => {
                  const isJoined = joinedClubIds.includes(club.id);
                  return (
                    <div
                      key={club.id}
                      className="p-3.5 rounded-2xl bg-card border border-border/80 shadow-xs space-y-2.5 transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={club.avatar}
                            alt={club.name}
                            className="w-10 h-10 rounded-xl object-cover shrink-0 border border-border"
                          />
                          <div>
                            <div className="flex items-center gap-1.5">
                              <h3 className="text-sm font-bold text-foreground">{club.name}</h3>
                              <ShieldCheck className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                            </div>
                            <p className="text-[11px] text-muted-foreground">{club.sportName} · {club.areaName}</p>
                          </div>
                        </div>
                        <span className="text-xs font-bold text-muted-foreground">
                          {club.memberCount} tv
                        </span>
                      </div>

                      <div className="flex items-center justify-between pt-1 border-t border-border/50 text-[11px]">
                        <span className="text-muted-foreground">
                          {club.weeklySchedule} · Đúng hẹn {club.checkInRate}
                        </span>

                        <button
                          type="button"
                          disabled={isJoined}
                          onClick={() => handleJoinClub(club.id, club.name)}
                          className={cn(
                            "py-1 px-3 rounded-full text-xs font-bold transition-all shadow-xs",
                            isJoined
                              ? "bg-muted text-muted-foreground cursor-not-allowed"
                              : "bg-brand text-white hover:bg-brand-600 active:scale-95"
                          )}
                        >
                          {isJoined ? "Đã gửi yêu cầu" : "Xin gia nhập"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Form Gia nhập nhanh bằng mã mời CLB */}
              <form
                onSubmit={handleInviteCodeSubmit}
                className="p-3.5 rounded-2xl bg-muted/40 border border-border/60 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground">Gia nhập bằng mã mời CLB</span>
                  <span className="text-[10px] text-muted-foreground">Mã do Chủ nhiệm cấp</span>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={clubInviteCode}
                    onChange={(e) => setClubInviteCode(e.target.value)}
                    placeholder="VD: FTU2-RUN2026..."
                    className="flex-1 px-3 py-1.5 rounded-xl border border-border bg-card text-xs font-mono text-foreground placeholder:text-muted-foreground outline-none focus:border-brand"
                  />
                  <button
                    type="submit"
                    className="py-1.5 px-3.5 rounded-xl bg-brand hover:bg-brand-600 text-white font-bold text-xs transition-all active:scale-95 shadow-xs"
                  >
                    Gửi yêu cầu
                  </button>
                </div>
              </form>

              {/* Bảng xếp hạng kỷ luật CLB (Tuần này) */}
              <div className="p-3.5 rounded-2xl bg-card border border-border/80 shadow-xs space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Trophy className="h-4 w-4 text-amber-500" />
                    <h3 className="text-xs font-bold text-foreground">BXH Kỷ Luật CLB (Tuần này)</h3>
                  </div>
                  <span className="text-[10px] font-semibold text-brand">Top runners</span>
                </div>

                <div className="divide-y divide-border/60 text-xs">
                  {[
                    { rank: 1, name: "Quốc Hưng", km: "48.5 km", ts: "9.5 UT", tag: "Chủ nhiệm" },
                    { rank: 2, name: "Minh Anh", km: "42.0 km", ts: "9.0 UT", tag: "Mentor" },
                    { rank: 3, name: "Hoàng Nam", km: "36.5 km", ts: "8.5 UT", tag: "Thành viên" },
                    { rank: 4, name: "Bạn (Minh Thư)", km: "32.0 km", ts: "8.5 UT", tag: "Admin" },
                  ].map((row) => (
                    <div key={row.rank} className="py-2 first:pt-1 last:pb-1 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-5 text-center font-bold text-muted-foreground">
                          #{row.rank}
                        </span>
                        <div>
                          <p className="font-bold text-foreground leading-tight">{row.name}</p>
                          <p className="text-[10px] text-muted-foreground">{row.tag}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-black text-brand font-mono">{row.km}</p>
                        <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">{row.ts}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* 2. DUO DETAIL SCREEN: DUO VỚI THUÝ DUNG (KHI BẤM VÀO DUO)       */}
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
            <div className="flex items-center -space-x-3 mb-1">
              <div className="w-12 h-12 rounded-full bg-brand text-white flex items-center justify-center font-bold text-sm border-2 border-card shadow-xs">
                B
              </div>
              <div className="w-12 h-12 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold text-sm border-2 border-card shadow-xs">
                {activeDuo.partnerAvatar}
              </div>
            </div>

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
      {/* 3. SMALL GROUP DETAIL SCREEN: SÁNG THANH ĐA (KHI BẤM VÀO NHÓM)  */}
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
      {/* MODAL: TẠO NHÓM TẬP MỚI SAU KHI TẬP CHUNG                      */}
      {/* ============================================================== */}
      {isNewGroupModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in">
          <div className="w-full max-w-md bg-background rounded-t-3xl sm:rounded-3xl border border-border p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-foreground">Tạo Nhóm Tập Mới</h3>
                <p className="text-xs text-muted-foreground">
                  Dành cho 3–6 bạn tập duy trì chuỗi và nhận +15 EXP/tuần
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsNewGroupModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateGroup} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-muted-foreground">Tên nhóm</label>
                <input
                  type="text"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  placeholder="VD: Runners Sáng Bờ Kè Thanh Đa..."
                  className="w-full mt-1 p-2.5 rounded-xl border border-border bg-card text-xs font-bold text-foreground outline-none focus:border-brand"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground">Môn thể thao</label>
                <select
                  value={newGroupSport}
                  onChange={(e) => setNewGroupSport(e.target.value)}
                  className="w-full mt-1 p-2.5 rounded-xl border border-border bg-card text-xs font-medium text-foreground outline-none"
                >
                  <option value="Chạy bộ">Chạy bộ (Running)</option>
                  <option value="Gym & Kháng lực">Gym & Kháng lực</option>
                  <option value="Calisthenics">Calisthenics</option>
                  <option value="Đạp xe">Đạp xe (Cycling)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground">
                  Thành viên vừa tập chung (chọn từ 1–5 người)
                </label>
                <div className="mt-1 space-y-1.5">
                  {SAMPLE_RECENT_PARTNERS.map((p) => {
                    const isSelected = selectedPartnerIds.includes(p.id);
                    return (
                      <div
                        key={p.id}
                        onClick={() => {
                          if (isSelected) {
                            setSelectedPartnerIds(selectedPartnerIds.filter((id) => id !== p.id));
                          } else {
                            setSelectedPartnerIds([...selectedPartnerIds, p.id]);
                          }
                        }}
                        className={cn(
                          "p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all",
                          isSelected
                            ? "bg-brand/10 border-brand text-brand"
                            : "bg-card border-border hover:bg-muted text-foreground"
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-7 h-7 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-xs">
                            {p.avatarText}
                          </span>
                          <div>
                            <p className="text-xs font-bold">{p.name}</p>
                            <p className="text-[10px] text-muted-foreground">{p.activityNote}</p>
                          </div>
                        </div>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          readOnly
                          className="h-4 w-4 text-brand rounded"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-brand/10 border border-brand/20 text-[11px] text-brand dark:text-brand-sky leading-relaxed">
                Khi nhóm đạt tối thiểu 75% thành viên hoàn thành buổi tập trong tuần, mỗi người sẽ được cộng <strong>+15 EXP</strong> và duy trì chuỗi nhóm.
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewGroupModalOpen(false)}
                  className="flex-1 py-2.5 px-4 rounded-xl border border-border hover:bg-muted text-xs font-semibold text-foreground transition-all"
                >
                  Huỷ
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 px-4 rounded-xl bg-brand hover:bg-brand-600 text-xs font-bold text-white transition-all shadow-xs"
                >
                  Tạo nhóm ngay
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: THANH TOÁN NỘP QUỸ CLB QUA VIETQR (SPLIT PAYMENT PAYOS) */}
      {/* ============================================================== */}
      {isPaymentModalOpen && (
        <VietQRPaymentModal
          order={clbPaymentOrder}
          onClose={() => setIsPaymentModalOpen(false)}
          onSuccess={() => {
            setDuesPaid(true);
            setIsPaymentModalOpen(false);
            showToast("Đã nộp quỹ CLB Quý IV thành công qua VietQR! Trạng thái đã được gia hạn.");
          }}
        />
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
    </div>
  );
}
