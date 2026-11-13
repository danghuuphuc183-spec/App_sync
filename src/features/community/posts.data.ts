export type FeedCardType = "workout" | "activity" | "challenge" | "milestone" | "spot";

export interface WorkoutPost {
  id: string;
  cardType: FeedCardType;
  author: {
    name: string;
    avatar: string;
    handle: string;
    tier: "diamond" | "gold" | "silver" | "bronze";
    trustScore: number;
    badgeTitle: string;
    clubName?: string;
  };
  sport:
    | "running"
    | "gym"
    | "padel"
    | "cycling"
    | "calisthenics"
    | "pickleball"
    | "badminton"
    | "table_tennis"
    | "football"
    | "basketball";
  sportNameVi: string;
  timeAgo: string;
  images: string[];
  caption: string;
  tags: string[];
  // Workout specific
  workoutPlan?: {
    dateTimeVi: string;
    locationName: string;
    areaVi: string;
    intensity: string;
    targetPaceOrWeight?: string;
    isGhostMode?: boolean;
    slotsLeft: number;
    status?: "open" | "locked" | "completed";
  };
  // Completed activity stats
  stats?: {
    distance?: string;
    duration?: string;
    pace?: string;
    calories?: string;
    exercises?: string;
    verifiedSource?: "Strava" | "Hevy" | "Apple Health";
    partnerName?: string;
  };
  // Challenge specific
  challenge?: {
    clubName: string;
    targetTitle: string;
    currentKm: number;
    targetKm: number;
    daysLeft: number;
    participantsCount: number;
  };
  // Milestone specific
  milestone?: {
    partnerName: string;
    streakCount: number;
    badgeUnlocked: string;
    badgeIcon: string;
  };
  // Spot recommendation specific
  spot?: {
    name: string;
    rating: number;
    reviewCount: number;
    features: string[];
    recentActivity: string;
    hasWater: boolean;
    hasParking: boolean;
    hasLight: boolean;
  };
  likes: number; // strong count
  commentsCount: number;
  hasLiked?: boolean;
  comments: {
    author: string;
    avatar: string;
    text: string;
    timeVi: string;
    ts: number;
  }[];
}

export const INITIAL_POSTS: WorkoutPost[] = [
  // 1. WORKOUT CARD (Kèo sắp diễn ra)
  {
    id: "post-workout-1",
    cardType: "workout",
    author: {
      name: "Minh Anh",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      handle: "@minhanh_run",
      tier: "diamond",
      trustScore: 9,
      badgeTitle: "Mentor Chạy Bộ",
      clubName: "SRC - Saigon Runners",
    },
    sport: "running",
    sportNameVi: "Chạy bộ",
    timeAgo: "15 phút trước",
    images: [
      "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=800&auto=format&fit=crop&q=80",
    ],
    caption:
      "5:30 sáng thứ Tư — Chạy 10km pace 6:00 quanh bờ kè Thanh Đa & Landmark 81 — Bình Thạnh — còn 1 chỗ. Tìm bạn tập cùng dải thể lực để kéo nhau dậy sớm, cam kết không bùng kèo!",
    tags: ["#BìnhThạnh", "#Pace600", "#KèoChạySớm", "#KhếƯớcTS"],
    workoutPlan: {
      dateTimeVi: "05:30 AM • Thứ Tư tới",
      locationName: "Cổng công viên Landmark 81 (bến thuyền)",
      areaVi: "Bình Thạnh, TP.HCM",
      intensity: "10.0 km • Pace 6:00/km",
      targetPaceOrWeight: "Pace 6:00/km",
      slotsLeft: 1,
      status: "open",
    },
    likes: 42,
    commentsCount: 5,
    hasLiked: false,
    comments: [
      {
        author: "Quốc Hưng",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
        text: "Pace này vừa khít bài recovery của mình. Mình nhận kèo nhé Minh Anh!",
        timeVi: "8 phút trước",
        ts: 124,
      },
    ],
  },

  // 2. ACTIVITY POST (Buổi tập hoàn thành có chứng thực)
  {
    id: "post-activity-1",
    cardType: "activity",
    author: {
      name: "Hoàng Nam",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
      handle: "@hoangnam_vnu",
      tier: "diamond",
      trustScore: 9,
      badgeTitle: "Chiến Binh Kỷ Luật",
      clubName: "VNU Runners",
    },
    sport: "running",
    sportNameVi: "Chạy bộ",
    timeAgo: "1 giờ trước",
    images: [
      "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=800&auto=format&fit=crop&q=80",
    ],
    caption:
      "Vừa hoàn thành 10.2km bình minh cùng Minh Anh tại Landmark 81. Đúng giờ 05:30 xuất phát, thời tiết mát mẻ 25°C. Đúng hẹn, +0,5 UT cho cả hai!",
    tags: ["#StravaVerified", "#KhếƯớcHoànThành", "#KhôngBùngKèo", "+2TS"],
    stats: {
      distance: "10.2 km",
      duration: "58:40",
      pace: "5:45/km",
      calories: "620 kcal",
      verifiedSource: "Strava",
      partnerName: "Minh Anh (9 UT)",
    },
    likes: 76,
    commentsCount: 8,
    hasLiked: true,
    comments: [
      {
        author: "Thanh Trúc",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
        text: "Chạy đều chân quá hai bạn ơi, nhìn thích thật sự!",
        timeVi: "45 phút trước",
        ts: 110,
      },
    ],
  },

  // 3. CLUB CHALLENGE (Thử thách CLB)
  {
    id: "post-challenge-1",
    cardType: "challenge",
    author: {
      name: "CLB FTU2 Run",
      avatar: "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=150&auto=format&fit=crop&q=80",
      handle: "@ftu2_runclub",
      tier: "diamond",
      trustScore: 9.5,
      badgeTitle: "Câu Lạc Bộ Xác Thực",
      clubName: "FTU2 Run Club",
    },
    sport: "running",
    sportNameVi: "Chạy bộ",
    timeAgo: "2 giờ trước",
    images: [
      "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&auto=format&fit=crop&q=80",
    ],
    caption:
      "Thử thách tuần: Cả đội FTU2 Run quyết tâm tích lũy 500km trong 7 ngày! Đã hoàn thành 340km, hiện chỉ còn thiếu 160km nữa. Các thành viên tranh thủ bắt kèo chạy chiều và sáng sớm để về đích nhé!",
    tags: ["#FTU2Run", "#ThửThách500km", "#ClubOS", "#KỷLuậtĐồngĐội"],
    challenge: {
      clubName: "FTU2 Run Club",
      targetTitle: "Cả đội chạy 500km trong 7 ngày",
      currentKm: 340,
      targetKm: 500,
      daysLeft: 3,
      participantsCount: 48,
    },
    likes: 115,
    commentsCount: 19,
    hasLiked: false,
    comments: [
      {
        author: "Hải Yến",
        avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
        text: "Tối nay em đóng góp thêm 8km bờ kè nữa là chạm mốc 350km!",
        timeVi: "30 phút trước",
        ts: 142,
      },
    ],
  },

  // 4. MILESTONE CARD (Thành tựu kỷ luật bạn tập)
  {
    id: "post-milestone-1",
    cardType: "milestone",
    author: {
      name: "Minh Vũ",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
      handle: "@minhvu_fitness",
      tier: "gold",
      trustScore: 8.5,
      badgeTitle: "Đối Tác Tin Cậy",
      clubName: "The New Gym Squad",
    },
    sport: "gym",
    sportNameVi: "Gym & Kháng Lực",
    timeAgo: "3 giờ trước",
    images: [
      "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=800&auto=format&fit=crop&q=80",
    ],
    caption:
      "Minh và Lan vừa chính thức hoàn thành buổi tập thứ 10 liên tiếp cùng nhau không trễ 1 phút, không no-show! Cả hai đã được mở khóa Huy hiệu Kỷ Luật 'Duo Streak 10x'!",
    tags: ["#DuoStreak", "#HuyHiệuKỷLuật", "#10BuổiLiênTiếp", "#KhôngNoShow"],
    milestone: {
      partnerName: "Ngọc Lan (8,5 UT)",
      streakCount: 10,
      badgeUnlocked: "Duo Streak Partner (Cặp đôi kỷ luật)",
      badgeIcon: "",
    },
    stats: {
      exercises: "Đỡ tạ Spotter 10 buổi",
      verifiedSource: "Hevy",
      partnerName: "Ngọc Lan (8,5 UT)",
    },
    likes: 92,
    commentsCount: 14,
    hasLiked: true,
    comments: [
      {
        author: "Thuỳ Dung",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
        text: "Quá nể sự kiên trì của 2 bạn! Chúc mừng đạt huy hiệu Duo Streak!",
        timeVi: "1 giờ trước",
        ts: 120,
      },
    ],
  },

  // 5. SPOT RECOMMENDATION (Đề xuất địa điểm an toàn)
  {
    id: "post-spot-1",
    cardType: "spot",
    author: {
      name: "Cộng Đồng Runner Sài Gòn",
      avatar: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=150&auto=format&fit=crop&q=80",
      handle: "@hcmc_runner_spots",
      tier: "diamond",
      trustScore: 10,
      badgeTitle: "Bản Đồ Xác Thực",
    },
    sport: "running",
    sportNameVi: "Địa điểm tập luyện",
    timeAgo: "5 giờ trước",
    images: [
      "https://images.unsplash.com/photo-1599058917212-d750089bc07e?w=800&auto=format&fit=crop&q=80",
    ],
    caption:
      "Gợi ý địa điểm chạy sáng an toàn: Công viên Hoàng Văn Thụ (Tân Bình). Đủ đèn chiếu sáng từ 04:30 sáng, có 2 vòi nước uống miễn phí, bãi gửi xe máy mở cửa từ 05:00 và rất đông các nhóm runner sinh hoạt.",
    tags: ["#ĐịaĐiểmChạyBộ", "#AnToànĐôThị", "#HoàngVănThụ", "#CóNướcCóGửiXe"],
    spot: {
      name: "Công viên Hoàng Văn Thụ",
      rating: 4.6,
      reviewCount: 128,
      features: ["Đủ sáng lúc 5h sáng", "Có vòi nước công cộng", "Có chỗ gửi xe", "Đông runner buổi sáng"],
      recentActivity: "12 người đang bật Tìm kèo • 3 kèo chạy 5km hôm nay",
      hasWater: true,
      hasParking: true,
      hasLight: true,
    },
    likes: 64,
    commentsCount: 7,
    hasLiked: false,
    comments: [],
  },

  // 6. GHOST MODE WORKOUT CARD
  {
    id: "post-workout-2",
    cardType: "workout",
    author: {
      name: "Hải Yến",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
      handle: "@yen_silent_runner",
      tier: "diamond",
      trustScore: 9.5,
      badgeTitle: "Ghost Mode Master",
      clubName: "Sala Endurance",
    },
    sport: "running",
    sportNameVi: "Chạy bộ Hướng nội",
    timeAgo: "20:00 PM • Tối nay",
    images: [
      "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=800&auto=format&fit=crop&q=80",
    ],
    caption:
      "Kèo chạy 7km Ghost Mode (Chế độ hướng nội) tối nay lúc 20:00 dọc bờ kè Hoàng Sa. Dành cho bạn thích có người chạy song song giữ nhịp nhưng không cần trò chuyện xã giao. Quét QR check-in rồi về. Kỷ luật trong yên lặng!",
    tags: ["#GhostMode", "#ChayBoHuongNoi", "#HoangSaRun", "#YenLangNhungKyLuat"],
    workoutPlan: {
      dateTimeVi: "20:00 PM • Tối nay",
      locationName: "Chân cầu Thị Nghè (Phía bờ kè Hoàng Sa)",
      areaVi: "Quận 1 - Bình Thạnh",
      intensity: "7.0 km • Pace 6:15/km",
      isGhostMode: true,
      slotsLeft: 2,
      status: "open",
    },
    likes: 89,
    commentsCount: 11,
    hasLiked: false,
    comments: [],
  },
];
