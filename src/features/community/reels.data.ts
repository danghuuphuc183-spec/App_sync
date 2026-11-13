export interface ReelSoundtrack {
  id: string;
  title: string;
  artist: string;
  bpm: number;
  genre: "Phonk" | "Lofi" | "EDM" | "Chillhop" | "Epic" | "Indie";
  durationSeconds: number;
  descriptionVi: string;
  audioToneType: "phonk" | "lofi" | "edm" | "chill" | "epic" | "indie";
}

export const REEL_SOUNDTRACKS: ReelSoundtrack[] = [
  {
    id: "sound-1",
    title: "Phonk Gym Beast Mode",
    artist: "DJ Sync Wave",
    bpm: 140,
    genre: "Phonk",
    durationSeconds: 45,
    descriptionVi: "Bass căng tràn năng lượng, đẩy nhịp tim bứt tốc đoạn dốc và nước rút",
    audioToneType: "phonk",
  },
  {
    id: "sound-2",
    title: "Lofi Morning Run Sài Gòn",
    artist: "Chill Pacer Studio",
    bpm: 85,
    genre: "Lofi",
    durationSeconds: 52,
    descriptionVi: "Giai điệu piano êm dịu, đón bình minh ven sông mát lành",
    audioToneType: "lofi",
  },
  {
    id: "sound-3",
    title: "EDM High Cadence Road Cycling",
    artist: "Peloton Beats",
    bpm: 128,
    genre: "EDM",
    durationSeconds: 48,
    descriptionVi: "Nhịp dồn dập kích thích guồng chân đều 32 - 36 km/h trên đại lộ",
    audioToneType: "edm",
  },
  {
    id: "sound-4",
    title: "Chill R&B Sunset Stride",
    artist: "Saigon Sunset Vibes",
    bpm: 96,
    genre: "Chillhop",
    durationSeconds: 50,
    descriptionVi: "Thư giãn nhịp thở cuối ngày, chạy thả lỏng ngắm hoàng hôn Landmark",
    audioToneType: "chill",
  },
  {
    id: "sound-5",
    title: "Epic Cinematic Marathon Sprint",
    artist: "Orchestra of Champions",
    bpm: 120,
    genre: "Epic",
    durationSeconds: 60,
    descriptionVi: "Âm hưởng hào hùng tiếp thêm sức mạnh cho những km cuối cùng",
    audioToneType: "epic",
  },
  {
    id: "sound-6",
    title: "Vietnamese Indie Acoustic Stride",
    artist: "Phố Chạy Acoustic",
    bpm: 104,
    genre: "Indie",
    durationSeconds: 42,
    descriptionVi: "Giai điệu guitar mộc mạc, gần gũi với không khí sớm mai Sài Gòn",
    audioToneType: "indie",
  },
];

export interface RouteReel {
  id: string;
  title: string;
  caption: string;
  routeLocation: string;
  districtVi: string;
  distanceKm: number;
  sport: "running" | "cycling";
  sportNameVi: string;
  bestTime: string;
  surfaceQuality: string;
  mediaUrl: string;
  thumbnailUrl: string;
  author: {
    name: string;
    avatar: string;
    handle: string;
    trustScore: number;
    badgeTitle: string;
  };
  soundtrack: ReelSoundtrack;
  stats: {
    views: number;
    likes: number;
    commentsCount: number;
    sharesCount: number;
  };
  hasLiked?: boolean;
}

export const ROUTE_REELS: RouteReel[] = [
  {
    id: "reel-1",
    title: "Bình Minh Cầu Ba Son & Bến Bạch Đằng",
    caption: "Cung đường chạy sáng đẹp nhất Sài Gòn lúc 5:45 AM. Gió sông mát lạnh, ngắm trọn bình minh hướng Thủ Thiêm!",
    routeLocation: "Phố đi bộ Nguyễn Huệ - Cầu Ba Son - Công viên Bến Bạch Đằng",
    districtVi: "Quận 1 & Thủ Đức",
    distanceKm: 6.2,
    sport: "running",
    sportNameVi: "Chạy bộ",
    bestTime: "05:15 - 06:15 AM",
    surfaceQuality: "Đường lát đá & vỉa hè rộng 6m, rất an toàn",
    mediaUrl: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=900&auto=format&fit=crop&q=80",
    thumbnailUrl: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=500&auto=format&fit=crop&q=80",
    soundtrack: REEL_SOUNDTRACKS[1]!,
    author: {
      name: "Hoàng Nam",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
      handle: "@hoangnam_run",
      trustScore: 9,
      badgeTitle: "Pacer 5:30",
    },
    stats: {
      views: 3420,
      likes: 428,
      commentsCount: 36,
      sharesCount: 52,
    },
    hasLiked: false,
  },
  {
    id: "reel-2",
    title: "Bờ Kè Thanh Đa & Landmark 81 Lúc Hoàng Hôn",
    caption: "Hoàng hôn buông xuống bên Landmark 81 cực chill. Không khí trong lành, đường ven sông thoáng đãng không xe máy.",
    routeLocation: "Bờ kè Thanh Đa - Công viên Landmark 81",
    districtVi: "Bình Thạnh",
    distanceKm: 8.5,
    sport: "running",
    sportNameVi: "Chạy bộ",
    bestTime: "17:15 - 18:30 PM",
    surfaceQuality: "Bờ kè bê tông láng, có đèn led ban đêm",
    mediaUrl: "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=900&auto=format&fit=crop&q=80",
    thumbnailUrl: "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=500&auto=format&fit=crop&q=80",
    soundtrack: REEL_SOUNDTRACKS[3]!,
    author: {
      name: "Minh Thư",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      handle: "@minhthu_sync",
      trustScore: 8.5,
      badgeTitle: "Mentor Chạy Bộ",
    },
    stats: {
      views: 5890,
      likes: 672,
      commentsCount: 48,
      sharesCount: 89,
    },
    hasLiked: true,
  },
  {
    id: "reel-3",
    title: "Đại Lộ Sala - Thủ Thiêm Lúc 5h Sáng",
    caption: "Đường rộng 8 làn không một bóng xe. Nơi anh em Road Bike tụ hội kéo guồng chân 32-35 km/h đón bình minh.",
    routeLocation: "Đại lộ Mai Chí Thọ - Nguyễn Cơ Thạch (KĐT Sala)",
    districtVi: "Thủ Đức (Quận 2 cũ)",
    distanceKm: 16.5,
    sport: "cycling",
    sportNameVi: "Đạp xe",
    bestTime: "05:00 - 06:30 AM",
    surfaceQuality: "Nhựa asphalt phẳng tuyệt đối, vạch sơn rõ ràng",
    mediaUrl: "https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=900&auto=format&fit=crop&q=80",
    thumbnailUrl: "https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=500&auto=format&fit=crop&q=80",
    soundtrack: REEL_SOUNDTRACKS[2]!,
    author: {
      name: "Tuấn Kiệt",
      avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80",
      handle: "@tuankiet_road",
      trustScore: 9.5,
      badgeTitle: "Peloton Leader",
    },
    stats: {
      views: 4120,
      likes: 512,
      commentsCount: 29,
      sharesCount: 64,
    },
    hasLiked: false,
  },
  {
    id: "reel-4",
    title: "Kênh Nhiêu Lộc Lung Linh Ánh Đèn Đêm",
    caption: "Ghost Mode chạy giải tỏa áp lực đêm muộn. Dọc hai bên Hoàng Sa - Trường Sa lộng gió mát rượi.",
    routeLocation: "Hoàng Sa - Trường Sa (Cầu Thị Nghè đến Cầu Lê Văn Sỹ)",
    districtVi: "Quận 1, Q.3, Bình Thạnh, Phú Nhuận",
    distanceKm: 9.0,
    sport: "running",
    sportNameVi: "Chạy bộ",
    bestTime: "20:00 - 22:00 PM",
    surfaceQuality: "Lối đi bộ lát gạch ven sông, đèn đường sáng suốt tuyến",
    mediaUrl: "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=900&auto=format&fit=crop&q=80",
    thumbnailUrl: "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=500&auto=format&fit=crop&q=80",
    soundtrack: REEL_SOUNDTRACKS[0]!,
    author: {
      name: "Hải Yến",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
      handle: "@haiyen_night",
      trustScore: 9.5,
      badgeTitle: "Night Runner",
    },
    stats: {
      views: 6240,
      likes: 780,
      commentsCount: 62,
      sharesCount: 110,
    },
    hasLiked: false,
  },
  {
    id: "reel-5",
    title: "Hồ Bán Nguyệt & Cầu Ánh Sao Phú Mỹ Hưng",
    caption: "Cung đường xanh rợp bóng cây, cầu Ánh Sao phun nước lung linh. Điểm hẹn chạy nhẹ thư giãn cuối tuần lý tưởng.",
    routeLocation: "Khuôn viên Hồ Bán Nguyệt - Cầu Ánh Sao - Đảo Ánh Sao",
    districtVi: "Quận 7",
    distanceKm: 6.8,
    sport: "running",
    sportNameVi: "Chạy bộ",
    bestTime: "06:00 - 07:30 AM / 17:30 PM",
    surfaceQuality: "Đường dạo bộ công viên khép kín, tuyệt đối cấm xe cơ giới",
    mediaUrl: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=900&auto=format&fit=crop&q=80",
    thumbnailUrl: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=500&auto=format&fit=crop&q=80",
    soundtrack: REEL_SOUNDTRACKS[5]!,
    author: {
      name: "Đức Trọng",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
      handle: "@ductrong_pmh",
      trustScore: 8.5,
      badgeTitle: "Endurance Runner",
    },
    stats: {
      views: 3890,
      likes: 395,
      commentsCount: 22,
      sharesCount: 45,
    },
    hasLiked: false,
  },
  {
    id: "reel-6",
    title: "Cung Đường Rừng Sác Cần Giờ - Đạp Xe Xuyên Xanh",
    caption: "Hít căng lồng ngực không khí rừng ngập mặn. Thử thách độ dẻo dai 60km đạp xe cuối tuần cùng đồng đội.",
    routeLocation: "Đường Rừng Sác - Phà Bình Khánh - Cần Giờ",
    districtVi: "Huyện Cần Giờ",
    distanceKm: 42.0,
    sport: "cycling",
    sportNameVi: "Đạp xe",
    bestTime: "05:30 - 09:00 AM",
    surfaceQuality: "Đường nhựa ven biển vắng xe, hai hàng đước phủ bóng",
    mediaUrl: "https://images.unsplash.com/photo-1541625602330-2277a4c46182?w=900&auto=format&fit=crop&q=80",
    thumbnailUrl: "https://images.unsplash.com/photo-1541625602330-2277a4c46182?w=500&auto=format&fit=crop&q=80",
    soundtrack: REEL_SOUNDTRACKS[4]!,
    author: {
      name: "Bảo Long",
      avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80",
      handle: "@baolong_velo",
      trustScore: 10,
      badgeTitle: "Ultra Cyclist",
    },
    stats: {
      views: 4780,
      likes: 615,
      commentsCount: 38,
      sharesCount: 77,
    },
    hasLiked: false,
  },
  {
    id: "reel-7",
    title: "Chinh Phục Dốc Cầu Phú Mỹ Đón Gió Biển",
    caption: "Độ dốc thử thách sức mạnh cơ đùi cho anh em luyện giải marathon. Lên đỉnh cầu ngắm toàn cảnh cụm cảng Sài Gòn.",
    routeLocation: "Cầu Phú Mỹ nối Quận 7 & TP. Thủ Đức",
    districtVi: "Quận 7 & TP. Thủ Đức",
    distanceKm: 7.2,
    sport: "running",
    sportNameVi: "Chạy bộ",
    bestTime: "05:00 - 06:15 AM",
    surfaceQuality: "Làn đường xe máy & vỉa hè riêng biệt, dốc 4%",
    mediaUrl: "https://images.unsplash.com/photo-1470246973918-29a93221c455?w=900&auto=format&fit=crop&q=80",
    thumbnailUrl: "https://images.unsplash.com/photo-1470246973918-29a93221c455?w=500&auto=format&fit=crop&q=80",
    soundtrack: REEL_SOUNDTRACKS[0]!,
    author: {
      name: "Lan Phương",
      avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
      handle: "@lanphuong_run",
      trustScore: 9.5,
      badgeTitle: "Sub 2 Half-Marathon",
    },
    stats: {
      views: 5120,
      likes: 704,
      commentsCount: 51,
      sharesCount: 83,
    },
    hasLiked: true,
  },
];
