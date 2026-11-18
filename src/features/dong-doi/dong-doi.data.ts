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
  dateVi: string;
  timeVi: string;
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
    events: [
      {
        id: "event-1",
        title: "Giải Chạy Nội Bộ FTU2 Autumn Half Marathon",
        eventType: "race",
        eventTypeName: "Giải chạy nội bộ",
        dateVi: "Chủ Nhật, 24/11",
        timeVi: "05:00 AM",
        location: "Khu Đô Thị Sala & Cầu Ba Son, TP. Thủ Đức",
        distanceOrDuration: "21km & 10km",
        hostName: "Ban Chủ Nhiệm FTU2",
        participantsCount: 48,
        maxParticipants: 60,
        isRegistered: true,
        rewardExp: 50,
        badgeText: "Huy chương Finisher",
      },
      {
        id: "event-2",
        title: "Long Run Cuối Tuần: Bờ Kè Thanh Đa - Landmark 81",
        eventType: "long_run",
        eventTypeName: "Chạy dài cuối tuần",
        dateVi: "Thứ Bảy, 16/11",
        timeVi: "05:30 AM",
        location: "Cổng Công Viên Central Park, Bình Thạnh",
        distanceOrDuration: "15km · Pace 5:45 - 6:15",
        hostName: "Minh Anh (Pacer)",
        participantsCount: 26,
        maxParticipants: 35,
        isRegistered: false,
        rewardExp: 25,
        badgeText: "Kèm pacer giữ nhịp",
      },
      {
        id: "event-3",
        title: "Workshop: Kỹ Thuật Tiếp Đất & Phòng Tránh Chấn Thương Gối",
        eventType: "workshop",
        eventTypeName: "Workshop kỹ thuật",
        dateVi: "Thứ Tư, 20/11",
        timeVi: "19:00 PM",
        location: "Phòng Sinh Hoạt Thể Thao ĐH Ngoại Thương CS2",
        distanceOrDuration: "90 phút chuyên sâu",
        hostName: "HLV Quốc Hưng & Bác sĩ Thể thao",
        participantsCount: 38,
        maxParticipants: 50,
        isRegistered: false,
        rewardExp: 20,
        badgeText: "Miễn phí hội viên",
      },
    ],
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
