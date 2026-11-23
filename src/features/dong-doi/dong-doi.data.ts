/**
 * ĐỒNG ĐỘI & DUO - LOGIC & DỮ LIỆU
 *
 * Tính năng giữ nhịp tập cùng người khác:
 * - Thẻ cá nhân: Hạng, thanh EXP, Đúng hẹn x/y
 * - Việc cần làm hôm nay: Thẻ việc gấp giữ chuỗi
 * - Duo: Cặp 2 người, chuỗi tính theo tuần, cần 1 buổi chung hợp lệ mỗi tuần
 * - Nhóm nhỏ: 3–6 người, đạt mục tiêu tuần khi có >= 75% thành viên tập
 * - Vừa tập cùng: Chỉ hiện người đã hoàn thành 1 buổi hợp lệ với bạn
 *
 * Quy tắc ăn khớp với EXP và Uy tín:
 * - EXP không bao giờ bị trừ.
 * - Duo cộng +10 EXP mỗi buổi chung.
 * - Nhóm nhỏ cộng +15 EXP cho mỗi người đã tập khi đạt mục tiêu tuần (>=75%).
 * - Chuỗi đứt chỉ mất đà, không mất điểm UT.
 * - Mỗi Duo có 2 lá chắn mỗi tháng, tự kích hoạt khi tuần trôi qua mà chưa kịp hẹn.
 * - Điểm vi phạm (3 điểm) chỉ phát sinh khi có người bị bỏ rơi (no-show). Người có mặt được giữ chuỗi tự động và nhận gói bù.
 * - Điều kiện tham gia: Lập nhóm từ Hạng 2, dẫn nhóm từ Hạng 3. Trạng thái Hạn chế không lập được Duo/nhóm.
 * - Chống cày: Thưởng Duo chỉ tính cho tối đa 3 Duo đang hoạt động và 2 buổi chung mỗi tuần.
 */

import { getNextRankProgress } from "@/features/rank/ranking";
import { vietnamDateParts } from "@/lib/date";

export interface DuoItem {
  id: string;
  partnerName: string;
  partnerAvatar: string;
  sportSchedule: string;
  streakWeeks: number;
  streakStartedDate: string;
  remainingDaysText: string;
  onTimeRecord: string;
  statusText: string;
  isCompletedThisWeek: boolean;
  bonusText?: string;
  weeklyCalendar: {
    weekRange: string;
    requirement: string;
    days: Array<{
      day: string;
      label: string;
      isToday?: boolean;
      isScheduled?: boolean;
      hasFlame?: boolean;
      isCompleted?: boolean;
    }>;
  };
  nextSession?: {
    title: string;
    date: string;
    time: string;
    location: string;
    reminder: string;
    confirmed: boolean;
  };
  shieldsRemaining: number;
  maxShields: number;
  milestones: Array<{
    weeks: number;
    completed: boolean;
    reward: string;
    isCurrentTarget?: boolean;
  }>;
  nextMilestone: {
    weeks: number;
    remainingWeeks: number;
    reward: string;
  };
  trustComparison: {
    user: {
      name: string;
      onTime: string;
      status: string;
    };
    partner: {
      name: string;
      onTime: string;
      status: string;
    };
    ruleNote: string;
  };
}

export interface GroupMember {
  id: string;
  name: string;
  avatarText: string;
  avatarBgColor: string;
  rankVi: string;
  onTime: string;
  isLead?: boolean;
  isWarning?: boolean;
  violationPoints?: number;
  sessionsCompleted: number;
  sessionsTarget: number;
}

export interface SmallGroupItem {
  id: string;
  name: string;
  streakWeeks: number;
  weekRange: string;
  memberCount: number;
  maxMembers: number;
  sportDescription: string;
  activeCount: number;
  targetCount: number;
  targetPercent: number; // 75%
  isTargetMet: boolean;
  rewardExp: number;
  members: GroupMember[];
  nextKeo?: {
    title: string;
    pace: string;
    date: string;
    time: string;
    location: string;
    leaderName: string;
    confirmedCount: number;
    totalCount: number;
  };
  openSlots: number;
}

export interface RecentPartnerItem {
  id: string;
  name: string;
  avatarText: string;
  avatarBgColor: string;
  activityNote: string;
  onTimeRecord: string;
}

export interface PersonalStatus {
  rankLevel: number;
  rankTitle: string;
  rankBadge: string;
  onTime: string;
  trustStatus: string;
  currentExp: number;
  targetExp: number;
  nextRankTitle: string;
}

export interface UrgentAction {
  title: string;
  partnerName: string;
  streakWeeks: number;
  deadlineText: string;
  progressText: string;
  buttonText: string;
}

/** EXP mẫu của người dùng hiện tại — cùng giá trị trang Hồ sơ đang hiển thị (1.240 EXP). */
const CURRENT_USER_EXP = 1240;
const currentUserRank = getNextRankProgress(CURRENT_USER_EXP);

/**
 * Hạng lấy từ MỘT nguồn duy nhất `features/rank/ranking.ts` (quy tắc dự án #10), để Đồng đội và
 * Hồ sơ luôn hiển thị cùng một cấp. Trước đây trang này viết cứng "Hạng 3 · Reliable / 3.500 EXP"
 * trong khi Hồ sơ hiện "Cấp 2 · Runner / 2.000 EXP" cho cùng một người.
 */
export const CURRENT_USER_STATUS: PersonalStatus = {
  rankLevel: currentUserRank.currentRank.level,
  rankTitle: currentUserRank.currentRank.badgeTitle,
  rankBadge: currentUserRank.currentRank.nameEn,
  onTime: "18/19",
  trustStatus: "Uy tín tốt",
  currentExp: CURRENT_USER_EXP,
  targetExp: currentUserRank.nextRank?.minExp ?? CURRENT_USER_EXP,
  nextRankTitle: currentUserRank.nextRank
    ? `Lên ${currentUserRank.nextRank.badgeTitle.replace(/^Cấp/, "cấp")}`
    : "Đã đạt cấp cao nhất",
};

export const URGENT_ACTION: UrgentAction = {
  title: "Chốt buổi tiếp với Thuý Dung",
  partnerName: "Thuý Dung",
  streakWeeks: 7,
  deadlineText: "Chuỗi Duo 7 tuần cần 1 buổi cùng nhau trước Chủ nhật 15/11. Hôm nay là Thứ Năm.",
  progressText: "Tuần này 0/1 buổi",
  buttonText: "Hẹn buổi",
};

export const SAMPLE_DUOS: DuoItem[] = [
  {
    id: "thuy-dung",
    partnerName: "Thuý Dung",
    partnerAvatar: "TD",
    sportSchedule: "Chạy bộ · T7 5:30 · Bờ kè Thanh Đa",
    streakWeeks: 7,
    streakStartedDate: "21/09",
    remainingDaysText: "Còn 3 ngày giữ chuỗi",
    onTimeRecord: "Đúng hẹn 18/19",
    statusText: "Còn 3 ngày giữ chuỗi",
    isCompletedThisWeek: false,
    weeklyCalendar: {
      weekRange: "Tuần này (9–15/11)",
      requirement: "Cần 1 buổi chung · còn 3 ngày",
      days: [
        { day: "T2", label: "Thứ 2", isCompleted: false },
        { day: "T3", label: "Thứ 3", isCompleted: false },
        { day: "T4", label: "Thứ 4", isCompleted: false },
        { day: "T5", label: "Thứ 5", isToday: true, isCompleted: false },
        { day: "T6", label: "Thứ 6", isCompleted: false },
        { day: "T7", label: "Thứ 7", isScheduled: true, hasFlame: true, isCompleted: false },
        { day: "CN", label: "Chủ nhật", isCompleted: false },
      ],
    },
    nextSession: {
      title: "Chạy bộ nhẹ 5km · Thứ Bảy 14/11",
      date: "Thứ Bảy 14/11",
      time: "5:30 sáng",
      location: "Bờ kè Thanh Đa",
      reminder: "Nhắc lúc 20:00 tối trước và 4:45 sáng",
      confirmed: true,
    },
    shieldsRemaining: 2,
    maxShields: 2,
    milestones: [
      { weeks: 4, completed: true, reward: "+60 EXP" },
      { weeks: 8, completed: false, reward: "+120 EXP", isCurrentTarget: true },
      { weeks: 12, completed: false, reward: "+200 EXP" },
      { weeks: 26, completed: false, reward: "+500 EXP" },
    ],
    nextMilestone: {
      weeks: 8,
      remainingWeeks: 1,
      reward: "+120 EXP mỗi người",
    },
    trustComparison: {
      user: {
        name: "Bạn",
        onTime: "Đúng hẹn 18/19",
        status: "Bình thường",
      },
      partner: {
        name: "Thuý Dung",
        onTime: "Đúng hẹn 24/25",
        status: "Bình thường",
      },
      ruleNote:
        "Nếu một bên vắng không báo, bên có mặt được giữ chuỗi tự động và nhận gói bù. Bên vắng chịu 3 điểm vi phạm và chuỗi tạm dừng.",
    },
  },
  {
    id: "duc-trong",
    partnerName: "Đức Trọng",
    partnerAvatar: "ĐT",
    sportSchedule: "Gym · Chân và lưng · Thứ Hai, Tư",
    streakWeeks: 3,
    streakStartedDate: "28/10",
    remainingDaysText: "Đã xong tuần này",
    onTimeRecord: "Đúng hẹn 11/11",
    statusText: "Đã xong tuần này",
    isCompletedThisWeek: true,
    bonusText: "+40 EXP",
    weeklyCalendar: {
      weekRange: "Tuần này (9–15/11)",
      requirement: "Đã hoàn thành 2 buổi chung",
      days: [
        { day: "T2", label: "Thứ 2", isCompleted: true },
        { day: "T3", label: "Thứ 3", isCompleted: false },
        { day: "T4", label: "Thứ 4", isCompleted: true },
        { day: "T5", label: "Thứ 5", isToday: true, isCompleted: false },
        { day: "T6", label: "Thứ 6", isCompleted: false },
        { day: "T7", label: "Thứ 7", isCompleted: false },
        { day: "CN", label: "Chủ nhật", isCompleted: false },
      ],
    },
    nextSession: {
      title: "Gym: Chân & Lưng · Thứ Hai tuần tới",
      date: "Thứ Hai 16/11",
      time: "18:00",
      location: "The New Gym Điện Biên Phủ",
      reminder: "Nhắc lúc 12:00 trưa",
      confirmed: true,
    },
    shieldsRemaining: 2,
    maxShields: 2,
    milestones: [
      { weeks: 4, completed: false, reward: "+60 EXP", isCurrentTarget: true },
      { weeks: 8, completed: false, reward: "+120 EXP" },
      { weeks: 12, completed: false, reward: "+200 EXP" },
      { weeks: 26, completed: false, reward: "+500 EXP" },
    ],
    nextMilestone: {
      weeks: 4,
      remainingWeeks: 1,
      reward: "+60 EXP mỗi người",
    },
    trustComparison: {
      user: {
        name: "Bạn",
        onTime: "Đúng hẹn 18/19",
        status: "Bình thường",
      },
      partner: {
        name: "Đức Trọng",
        onTime: "Đúng hẹn 40/41",
        status: "Bình thường",
      },
      ruleNote:
        "Nếu một bên vắng không báo, bên có mặt được giữ chuỗi tự động và nhận gói bù. Bên vắng chịu 3 điểm vi phạm và chuỗi tạm dừng.",
    },
  },
];

export const SAMPLE_SMALL_GROUPS: SmallGroupItem[] = [
  {
    id: "sang-thanh-da",
    name: "Sáng Thanh Đa",
    streakWeeks: 5,
    weekRange: "Tuần 9-15/11",
    memberCount: 4,
    maxMembers: 6,
    sportDescription: "4 người · Chạy bộ và gym nhẹ",
    activeCount: 3,
    targetCount: 4,
    targetPercent: 75,
    isTargetMet: true,
    rewardExp: 15,
    openSlots: 2,
    nextKeo: {
      title: "Chạy 6km, pace 6:30 · Chủ nhật 15/11",
      pace: "pace 6:30",
      date: "Chủ nhật 15/11",
      time: "5:30 sáng",
      location: "Bờ kè Thanh Đa",
      leaderName: "Yến Nhi",
      confirmedCount: 3,
      totalCount: 4,
    },
    members: [
      {
        id: "m-user",
        name: "Bạn",
        avatarText: "B",
        avatarBgColor: "bg-blue-600 text-white",
        rankVi: "Hạng 3 · Đúng hẹn 18/19",
        onTime: "18/19",
        sessionsCompleted: 2,
        sessionsTarget: 2,
      },
      {
        id: "m-trong",
        name: "Đức Trọng",
        avatarText: "ĐT",
        avatarBgColor: "bg-emerald-600 text-white",
        rankVi: "Hạng 4 · Đúng hẹn 40/41",
        onTime: "40/41",
        isLead: true,
        sessionsCompleted: 2,
        sessionsTarget: 2,
      },
      {
        id: "m-nhi",
        name: "Yến Nhi",
        avatarText: "YN",
        avatarBgColor: "bg-rose-500 text-white",
        rankVi: "Hạng 2 · Đúng hẹn 9/9",
        onTime: "9/9",
        sessionsCompleted: 1,
        sessionsTarget: 2,
      },
      {
        id: "m-minhanh",
        name: "Minh Anh",
        avatarText: "MA",
        avatarBgColor: "bg-purple-600 text-white",
        rankVi: "Cần chú ý · 3.25 điểm vi phạm",
        onTime: "8/12",
        isWarning: true,
        violationPoints: 3.25,
        sessionsCompleted: 0,
        sessionsTarget: 2,
      },
    ],
  },
];

export const SAMPLE_RECENT_PARTNERS: RecentPartnerItem[] = [
  {
    id: "hoang-nam",
    name: "Hoàng Nam",
    avatarText: "HN",
    avatarBgColor: "bg-purple-600 text-white",
    activityNote: "Chạy 5km hôm qua",
    onTimeRecord: "Đúng hẹn 22/22",
  },
];

export interface ClubEventItem {
  id: string;
  title: string;
  eventType: "race" | "long_run" | "workshop" | "social";
  eventTypeName: string;
  /** Thời điểm bắt đầu (ISO, giờ VN). `dateVi`/`timeVi` được suy ra từ đây nên thứ không bao giờ lệch. */
  startsAt?: string;
  dateVi: string;
  timeVi: string;
  /** Ảnh bìa (Unsplash License — dùng miễn phí, ghi công tác giả ở `imageCredit`) */
  image?: string;
  imageAlt?: string;
  imageCredit?: string;
  location: string;
  distanceOrDuration: string;
  hostName: string;
  participantsCount: number;
  maxParticipants?: number;
  isRegistered?: boolean;
  rewardExp: number;
  badgeText?: string;
}

export interface ClubLeaderItem {
  id: string;
  name: string;
  roleTitle: string; // Trưởng CLB / Chủ nhiệm / Chủ phòng gym / Mentor
  avatarText: string;
  avatarBgColor: string;
  weeklyKm: string;
  trustScore: string;
  badge: string;
  rankVi: string;
}

export interface ClubListItem {
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
  myRole?: "Owner" | "Admin" | "Leader" | "Mentor" | "Member" | null;
  duesPerQuarterVnd: number;
  fundBalanceVnd: number;
  paidMembersCount: number;
  totalDuesMembersCount: number;
  myDuesStatus?: {
    isPaid: boolean;
    quarterText: string;
    paidDate?: string;
    amountVnd: number;
  };
  challengeTitle?: string;
  challengeProgress?: { currentKm: number; targetKm: number; daysLeft: number };
  events?: ClubEventItem[];
  leadership?: ClubLeaderItem[];
  internalBounties: Array<{
    id: string;
    title: string;
    timeVi: string;
    location: string;
    intensity: string;
    hostName: string;
    slotsLeft: number;
  }>;
}

/** Ảnh Unsplash qua CDN chính thức (cách Unsplash khuyến nghị: hotlink, không tải về). */
const unsplash = (id: string) => `https://images.unsplash.com/photo-${id}?w=800&auto=format&fit=crop&q=75`;

type ClubEventSeed = Omit<ClubEventItem, "dateVi" | "timeVi"> & { startsAt: string };

/** Sinh `dateVi` ("Thứ Bảy, 28/11") và `timeVi` ("19:30") từ `startsAt` theo giờ Việt Nam. */
function clubEvent(seed: ClubEventSeed): ClubEventItem {
  const d = vietnamDateParts(seed.startsAt);
  return { ...seed, dateVi: d.label, timeVi: d.time };
}

/**
 * Lịch sự kiện mẫu của FTU2 Run Club (13 sự kiện, sắp theo ngày).
 * Tên giải là tên mô tả HƯ CẤU tại địa điểm có thật ở TP.HCM — không dùng tên/thương hiệu giải thật
 * (quy tắc dự án #23). Ảnh: Unsplash License; giải chạy dùng ảnh vận động viên thật, sự kiện gắn
 * địa danh dùng ảnh TP.HCM thật.
 */
const FTU2_EVENTS: ClubEventItem[] = (
  [
    {
      id: "event-1",
      title: "Giải Chạy Nội Bộ FTU2 Autumn Half Marathon",
      eventType: "race",
      eventTypeName: "Giải chạy nội bộ",
      startsAt: "2026-11-22T05:00:00+07:00",
      location: "Khu Đô Thị Sala & Cầu Ba Son, TP. Thủ Đức",
      distanceOrDuration: "21km & 10km",
      hostName: "Ban Chủ Nhiệm FTU2",
      participantsCount: 48,
      maxParticipants: 60,
      isRegistered: true,
      rewardExp: 50,
      badgeText: "Huy chương Finisher",
      image: unsplash("1777788613992-5f2655a97e72"),
      imageAlt: "Đoàn vận động viên đông người chạy trên đường trong một giải marathon",
      imageCredit: "Daniel Stiel",
    },
    {
      id: "event-2",
      title: "Long Run Cuối Tuần: Bờ Kè Thanh Đa - Landmark 81",
      eventType: "long_run",
      eventTypeName: "Chạy dài cuối tuần",
      startsAt: "2026-11-21T05:30:00+07:00",
      location: "Cổng Công Viên Central Park, Bình Thạnh",
      distanceOrDuration: "15km · Pace 5:45 - 6:15",
      hostName: "Minh Anh (Pacer)",
      participantsCount: 26,
      maxParticipants: 35,
      isRegistered: false,
      rewardExp: 25,
      badgeText: "Kèm pacer giữ nhịp",
      image: unsplash("1698996608582-24cb3690afb8"),
      imageAlt: "Toà nhà chọc trời bên bờ sông Sài Gòn",
      imageCredit: "Quinn Nguyen",
    },
    {
      id: "event-3",
      title: "Workshop: Kỹ Thuật Tiếp Đất & Phòng Tránh Chấn Thương Gối",
      eventType: "workshop",
      eventTypeName: "Workshop kỹ thuật",
      startsAt: "2026-11-25T19:00:00+07:00",
      location: "Phòng Sinh Hoạt Thể Thao ĐH Ngoại Thương CS2",
      distanceOrDuration: "90 phút chuyên sâu",
      hostName: "HLV Quốc Hưng & Bác sĩ Thể thao",
      participantsCount: 38,
      maxParticipants: 50,
      isRegistered: false,
      rewardExp: 20,
      badgeText: "Miễn phí hội viên",
      image: unsplash("1769284331730-9955c15e7dac"),
      imageAlt: "Nhóm người chạy bộ trên lối đi ven biển có hàng cọ",
      imageCredit: "Yuval Zukerman",
    },
    {
      id: "event-4",
      title: "Workshop: Chạy Đêm An Toàn — Đèn, Áo Phản Quang & Lộ Trình",
      eventType: "workshop",
      eventTypeName: "Workshop an toàn",
      startsAt: "2026-11-26T19:30:00+07:00",
      location: "Phòng Sinh Hoạt Thể Thao ĐH Ngoại Thương CS2",
      distanceOrDuration: "75 phút · chuẩn bị cho giải chạy đêm 28/11",
      hostName: "Ban Chủ Nhiệm FTU2",
      participantsCount: 26,
      maxParticipants: 50,
      isRegistered: false,
      rewardExp: 15,
      badgeText: "Miễn phí hội viên",
      image: unsplash("1774719194893-a8e7f20363b1"),
      imageAlt: "Người chạy bộ lướt nhanh trên phố vào ban đêm",
      imageCredit: "Venti Views",
    },
    {
      id: "event-5",
      title: "Giải Chạy Đêm Ven Sông Thủ Thiêm 10K",
      eventType: "race",
      eventTypeName: "Giải chạy thành phố",
      startsAt: "2026-11-28T19:30:00+07:00",
      location: "Công viên bờ sông Sài Gòn, Thủ Thiêm, TP. Thủ Đức",
      distanceOrDuration: "5K & 10K · cung đường ven sông",
      hostName: "BCN FTU2 (đăng ký theo đoàn)",
      participantsCount: 31,
      maxParticipants: 40,
      isRegistered: false,
      rewardExp: 40,
      badgeText: "Đi theo đoàn CLB",
      image: unsplash("1700500790259-a2527558c3f2"),
      imageAlt: "Trung tâm Quận 1 về đêm nhìn từ bờ sông Thủ Thiêm",
      imageCredit: "Nhat Tien Huynh",
    },
    {
      id: "event-6",
      title: "Chạy Nhặt Rác Bờ Kè Thanh Đa (Plogging)",
      eventType: "social",
      eventTypeName: "Chạy cộng đồng",
      startsAt: "2026-11-29T06:00:00+07:00",
      location: "Bờ kè Thanh Đa, Bình Thạnh",
      distanceOrDuration: "6 km · vừa chạy vừa nhặt rác",
      hostName: "BCN FTU2 & nhóm tình nguyện",
      participantsCount: 29,
      maxParticipants: 50,
      isRegistered: false,
      rewardExp: 20,
      badgeText: "Vì môi trường",
      image: unsplash("1758599668426-1cf242bb7667"),
      imageAlt: "Tình nguyện viên nhặt rác bỏ vào túi",
      imageCredit: "Vitaly Gariev",
    },
    {
      id: "event-7",
      title: "Long Run 25K Đại Lộ Võ Văn Kiệt",
      eventType: "long_run",
      eventTypeName: "Chạy dài cuối tuần",
      startsAt: "2026-12-06T04:45:00+07:00",
      location: "Chân cầu Calmette, Q.1 → Đại lộ Võ Văn Kiệt",
      distanceOrDuration: "25 km · Pace 6:00 - 6:30",
      hostName: "Hữu Tùng (Pacer)",
      participantsCount: 18,
      maxParticipants: 30,
      isRegistered: false,
      rewardExp: 30,
      badgeText: "Trạm nước mỗi 5 km",
      image: unsplash("1613936360976-8f35cf0e5461"),
      imageAlt: "Đoàn người chạy trên đường nhựa ban ngày",
      imageCredit: "Miguel A Amutio",
    },
    {
      id: "event-8",
      title: "Workshop: Khởi Động & Giãn Cơ Đúng Cách Cho Chạy Dài",
      eventType: "workshop",
      eventTypeName: "Workshop kỹ thuật",
      startsAt: "2026-12-09T19:00:00+07:00",
      location: "Công viên Vinhomes Central Park, Bình Thạnh",
      distanceOrDuration: "60 phút thực hành",
      hostName: "HLV Quốc Hưng",
      participantsCount: 21,
      maxParticipants: 30,
      isRegistered: false,
      rewardExp: 15,
      badgeText: "Miễn phí hội viên",
      image: unsplash("1683111124427-650aff5592a8"),
      imageAlt: "Ba người giãn cơ trước buổi chạy",
      imageCredit: "Sweet Life",
    },
    {
      id: "event-9",
      title: "Bán Marathon Phú Mỹ Hưng Mùa Lễ Hội",
      eventType: "race",
      eventTypeName: "Giải chạy thành phố",
      startsAt: "2026-12-13T04:30:00+07:00",
      location: "Hồ Bán Nguyệt & Cầu Ánh Sao, Phú Mỹ Hưng, Q.7",
      distanceOrDuration: "21K · 10K · 5K",
      hostName: "BCN FTU2 (đăng ký theo đoàn)",
      participantsCount: 52,
      maxParticipants: 70,
      isRegistered: false,
      rewardExp: 60,
      badgeText: "Huy chương Finisher",
      image: unsplash("1781029103015-bd978c26df57"),
      imageAlt: "Hàng trăm vận động viên xuất phát trong một giải marathon thành phố",
      imageCredit: "Miguel A Amutio",
    },
    {
      id: "event-10",
      title: "Long Run Bình Minh 18K: Sala – Cầu Ba Son",
      eventType: "long_run",
      eventTypeName: "Chạy dài cuối tuần",
      startsAt: "2026-12-19T05:15:00+07:00",
      location: "Khu đô thị Sala, TP. Thủ Đức",
      distanceOrDuration: "18 km · Pace 5:45 - 6:15",
      hostName: "Minh Anh (Pacer)",
      participantsCount: 24,
      maxParticipants: 35,
      isRegistered: false,
      rewardExp: 25,
      badgeText: "Kèm pacer giữ nhịp",
      image: unsplash("1651901927035-61cc17296ac3"),
      imageAlt: "Cầu dây văng bắc qua sông Sài Gòn lúc chiều tà",
      imageCredit: "Leo Cap",
    },
    {
      id: "event-11",
      title: "Chạy Chào Năm Mới 2027 Phố Đi Bộ Nguyễn Huệ",
      eventType: "social",
      eventTypeName: "Chạy cộng đồng",
      startsAt: "2027-01-01T05:30:00+07:00",
      location: "Phố đi bộ Nguyễn Huệ, Q.1",
      distanceOrDuration: "5 km chạy vui · mọi pace",
      hostName: "Minh Trang (Hậu cần sự kiện)",
      participantsCount: 87,
      maxParticipants: 150,
      isRegistered: false,
      rewardExp: 20,
      badgeText: "Áo kỷ niệm",
      image: unsplash("1710084118214-e10f1fe1c5f2"),
      imageAlt: "Trụ sở UBND TP.HCM ở đầu phố đi bộ Nguyễn Huệ lên đèn về đêm",
      imageCredit: "khanh vu",
    },
    {
      id: "event-12",
      title: "Giải Chạy Vượt Cầu Ba Son 12K",
      eventType: "race",
      eventTypeName: "Giải chạy thành phố",
      startsAt: "2027-01-10T05:00:00+07:00",
      location: "Cầu Ba Son (Q.1) ↔ Đại lộ Vòng Cung Thủ Thiêm",
      distanceOrDuration: "12K · 2 lần qua dốc cầu",
      hostName: "BCN FTU2 (đăng ký theo đoàn)",
      participantsCount: 22,
      maxParticipants: 40,
      isRegistered: false,
      rewardExp: 45,
      badgeText: "Cung có dốc cầu",
      image: unsplash("1761064039885-afa38ab58a21"),
      imageAlt: "Vận động viên chạy trên phố trong một giải marathon thành phố",
      imageCredit: "Jerry Wei",
    },
    {
      id: "event-13",
      title: "Chạy Gây Quỹ “Bước Chân Vì Trẻ Em Vùng Cao”",
      eventType: "race",
      eventTypeName: "Chạy gây quỹ",
      startsAt: "2027-01-24T05:30:00+07:00",
      location: "Công viên Gia Định, Gò Vấp",
      distanceOrDuration: "5K & 10K · có chip tính giờ",
      hostName: "BCN FTU2 & Hội SV Ngoại Thương",
      participantsCount: 64,
      maxParticipants: 120,
      isRegistered: false,
      rewardExp: 35,
      badgeText: "Từ thiện · phí nền tảng 0%",
      image: unsplash("1783216509054-c69ca71b8f01"),
      imageAlt: "Đông đảo người tham gia một giải chạy ngoài trời",
      imageCredit: "Joseph Prospere",
    },
  ] satisfies ClubEventSeed[]
)
  .map(clubEvent)
  .sort((a, b) => (a.startsAt ?? "").localeCompare(b.startsAt ?? ""));

export const SAMPLE_CLUBS_LIST: ClubListItem[] = [
  {
    id: "club-1",
    name: "FTU2 Run Club (Ngoại Thương Runners)",
    sportName: "Chạy bộ",
    avatar: "/posts/post-phuc.jpg",
    memberCount: 1240,
    active30DaysCount: 320,
    checkInRate: "86%",
    openBountiesThisWeek: 12,
    avgTs: 8.5,
    description: "Cộng đồng chạy bộ rèn luyện sức bền sinh viên và cựu sinh viên Ngoại Thương quanh bờ kè Thanh Đa và Landmark 81.",
    areaName: "Bình Thạnh & Q.1",
    weeklySchedule: "05:30 AM • Thứ Tư & Chủ Nhật",
    isVerified: true,
    myRole: "Admin",
    duesPerQuarterVnd: 150000,
    fundBalanceVnd: 12450000,
    paidMembersCount: 41,
    totalDuesMembersCount: 50,
    myDuesStatus: {
      isPaid: true,
      quarterText: "Quý IV/2026",
      paidDate: "15/10/2026",
      amountVnd: 150000,
    },
    challengeTitle: "Cả đội chạy 500km trong 7 ngày",
    challengeProgress: { currentKm: 340, targetKm: 500, daysLeft: 3 },
    leadership: [
      {
        id: "lead-1",
        name: "Hữu Phúc (Quốc Hưng)",
        roleTitle: "Trưởng CLB (Chủ nhiệm)",
        avatarText: "HP",
        avatarBgColor: "bg-blue-600 text-white",
        weeklyKm: "48.5 km",
        trustScore: "9.5 UT",
        badge: "Chủ nhiệm sáng lập",
        rankVi: "Cấp 5 · Master",
      },
      {
        id: "lead-2",
        name: "Lưu Thịnh (Minh Anh)",
        roleTitle: "Phó chủ nhiệm & Pacer Trưởng",
        avatarText: "LT",
        avatarBgColor: "bg-emerald-600 text-white",
        weeklyKm: "42.0 km",
        trustScore: "9.2 UT",
        badge: "Pacer 5:30",
        rankVi: "Cấp 4 · Elite",
      },
      {
        id: "lead-3",
        name: "Nguyễn Cường",
        roleTitle: "BQL Phòng Gym & Hậu cần",
        avatarText: "NC",
        avatarBgColor: "bg-purple-600 text-white",
        weeklyKm: "36.0 km",
        trustScore: "9.0 UT",
        badge: "BQL CSVC",
        rankVi: "Cấp 3 · Pacer",
      },
      {
        id: "lead-4",
        name: "Hữu Tùng",
        roleTitle: "Pacer 10K & Dẫn đoàn",
        avatarText: "HT",
        avatarBgColor: "bg-amber-600 text-white",
        weeklyKm: "32.5 km",
        trustScore: "8.9 UT",
        badge: "Pacer",
        rankVi: "Cấp 3 · Pacer",
      },
      {
        id: "lead-5",
        name: "Minh Trang",
        roleTitle: "Hậu cần sự kiện & Tiếp nước",
        avatarText: "MT",
        avatarBgColor: "bg-rose-600 text-white",
        weeklyKm: "28.0 km",
        trustScore: "9.1 UT",
        badge: "Điều phối",
        rankVi: "Cấp 3 · Pacer",
      },
    ],
    events: FTU2_EVENTS,
    internalBounties: [
      {
        id: "bounty-1",
        title: "10km pace 6:00 quanh bờ kè Thanh Đa",
        timeVi: "05:30 AM • Thứ Tư",
        location: "Cổng bến du thuyền Landmark 81",
        intensity: "10km • Pace 6:00",
        hostName: "Minh Anh (Mentor)",
        slotsLeft: 2,
      },
      {
        id: "bounty-2",
        title: "Easy Run 5km phục hồi cuối tuần",
        timeVi: "18:00 PM • Thứ Năm",
        location: "Khuôn viên Vinhomes Central Park",
        intensity: "5km • Pace 6:30",
        hostName: "Quốc Hưng (Admin)",
        slotsLeft: 4,
      },
    ],
  },
  {
    id: "club-2",
    name: "Saigon Runners Community (SRC)",
    sportName: "Chạy bộ Marathon",
    avatar: "/posts/post-cuong.jpg",
    memberCount: 2150,
    active30DaysCount: 680,
    checkInRate: "92%",
    openBountiesThisWeek: 18,
    avgTs: 9.0,
    description: "Cộng đồng chạy bộ bán chuyên hàng đầu Sài Gòn, chuyên kéo pace dài 21km - 42km cho các giải marathon.",
    areaName: "Toàn TP.HCM",
    weeklySchedule: "05:00 AM • Thứ Bảy & Chủ Nhật",
    isVerified: true,
    myRole: null,
    duesPerQuarterVnd: 200000,
    fundBalanceVnd: 28500000,
    paidMembersCount: 95,
    totalDuesMembersCount: 110,
    internalBounties: [],
  },
  {
    id: "club-3",
    name: "The New Gym Runners & Lifters Club",
    sportName: "Gym & Calisthenics",
    avatar: "/posts/post-duyen.jpg",
    memberCount: 890,
    active30DaysCount: 380,
    checkInRate: "88%",
    openBountiesThisWeek: 10,
    avgTs: 8.8,
    description: "CLB kết nối hội viên phòng tập The New Gym chi nhánh Điện Biên Phủ & Ung Văn Khiêm, kèm cặp tạ và bổ trợ thể lực.",
    areaName: "Bình Thạnh",
    weeklySchedule: "18:30 PM • Thứ Ba & Thứ Năm",
    isVerified: true,
    myRole: null,
    duesPerQuarterVnd: 100000,
    fundBalanceVnd: 9800000,
    paidMembersCount: 45,
    totalDuesMembersCount: 50,
    internalBounties: [],
  },
];
