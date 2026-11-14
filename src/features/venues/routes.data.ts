import { BINH_THANH_ROUTES } from "./routes-binh-thanh.data";
import { SALA_ROUTES } from "./routes-sala.data";

export interface StravaRoute {
  id: string;
  sport: "running" | "cycling";
  name: string;
  subtitle: string;
  district: string;
  areaVi: string;
  distanceKm: number;
  elevationGainM: number;
  difficulty: "Dễ" | "Vừa phải" | "Thử thách";
  difficultyColor: "emerald" | "amber" | "rose";
  estimatedTime: string;
  targetPaceOrSpeed: string;
  surface: string;
  safetyScore: number;
  highlights: string[];
  waterStations: number;
  coordinates: [number, number][];
  elevationPoints: number[];
  bestRecord: {
    holder: string;
    time: string;
    paceOrSpeed: string;
  };
  rating?: number;
  reviewCount?: number;
}

export const OTHER_RUNNING_ROUTES: StravaRoute[] = [
  {
    id: "route-run-5",
    sport: "running",
    name: "Cung đường Hồ Bán Nguyệt & Cầu Ánh Sao",
    subtitle: "Không gian sinh thái chuẩn quốc tế, vỉa hè không khói bụi tại Phú Mỹ Hưng",
    district: "Quận 7",
    areaVi: "Khu đô thị Phú Mỹ Hưng",
    distanceKm: 6.8,
    elevationGainM: 10,
    difficulty: "Dễ",
    difficultyColor: "emerald",
    estimatedTime: "38 - 45 phút",
    targetPaceOrSpeed: "Pace 5:45 - 6:15/km",
    surface: "Gạch đi bộ hồ sinh thái & Đường nhựa nội khu",
    safetyScore: 97,
    highlights: ["Không khí cực sạch", "Cây xanh rợp bóng", "Cầu Ánh Sao lãng mạn", "Bảo vệ Phú Mỹ Hưng"],
    waterStations: 3,
    coordinates: [
      [10.728, 106.716],
      [10.732, 106.721],
      [10.735, 106.725],
      [10.731, 106.729],
      [10.726, 106.724],
      [10.728, 106.716],
    ],
    elevationPoints: [3, 5, 8, 10, 7, 4],
    bestRecord: {
      holder: "Tuấn Khang",
      time: "32:15",
      paceOrSpeed: "4:44/km",
    },
    rating: 4.8,
    reviewCount: 114,
  },
];

export const CYCLING_ROUTES: StravaRoute[] = [
  {
    id: "route-cyc-1",
    sport: "cycling",
    name: "Cung đường Đạp Xe Đại Lộ Sala - Thủ Thiêm - Ba Son",
    subtitle: "Lộ trình bằng phẳng, đèn đường rực rỡ, điểm hẹn yêu thích của các hội nhóm xe đạp TP.HCM",
    district: "Thủ Đức / Q.2 - Q.1",
    areaVi: "Khu đô thị Sala & Cầu Ba Son",
    distanceKm: 16.5,
    elevationGainM: 28,
    difficulty: "Dễ",
    difficultyColor: "emerald",
    estimatedTime: "40 - 50 phút",
    targetPaceOrSpeed: "Vận tốc 22 - 27 km/h",
    surface: "Nhựa Asphalt cao cấp, 4 làn xe rộng rãi",
    safetyScore: 95,
    highlights: ["Đường nhựa cực êm", "Đèn đường sáng trưng", "Có làn xe đạp riêng tại Sala", "Gió sông mát rượi"],
    waterStations: 3,
    coordinates: [
      [10.768, 106.718],
      [10.776, 106.729],
      [10.785, 106.714],
      [10.779, 106.705],
      [10.772, 106.711],
      [10.768, 106.718],
    ],
    elevationPoints: [5, 12, 28, 18, 8, 5],
    bestRecord: {
      holder: "Nguyễn Hải (Saigon Cyclists)",
      time: "31:20",
      paceOrSpeed: "31.5 km/h",
    },
  },
  {
    id: "route-cyc-2",
    sport: "cycling",
    name: "Cung đường Đại Lộ Võ Văn Kiệt - Bến Vân Đồn",
    subtitle: "Trục đại lộ ven kênh dài nhất TP.HCM, thẳng tắp và tầm nhìn thoáng đãng",
    district: "Quận 1 - Q.5 - Q.6",
    areaVi: "Đại lộ Võ Văn Kiệt & Kênh Tàu Hủ",
    distanceKm: 22.0,
    elevationGainM: 12,
    difficulty: "Vừa phải",
    difficultyColor: "amber",
    estimatedTime: "55 - 65 phút",
    targetPaceOrSpeed: "Vận tốc 24 - 28 km/h",
    surface: "Nhựa thẳng tắp, ít giao lộ cắt ngang",
    safetyScore: 90,
    highlights: ["Đường thẳng kéo pace", "Gió xuôi theo bờ kênh", "Thích hợp tập luyện đường trường"],
    waterStations: 4,
    coordinates: [
      [10.768, 106.702],
      [10.762, 106.691],
      [10.755, 106.678],
      [10.748, 106.662],
      [10.753, 106.675],
      [10.764, 106.698],
      [10.768, 106.702],
    ],
    elevationPoints: [4, 6, 8, 12, 9, 6, 4],
    bestRecord: {
      holder: "Văn Thuận",
      time: "42:10",
      paceOrSpeed: "31.3 km/h",
    },
  },
  {
    id: "route-cyc-3",
    sport: "cycling",
    name: "Cung đường Khu Công Nghệ Cao (SHTP) - Đường D2 & D1",
    subtitle: "Thiên đường đạp xe cuối tuần: không xe tải, cây xanh mát mẻ và đường phẳng mịn",
    district: "Thủ Đức / Q.9",
    areaVi: "Khu Công Nghệ Cao TP.HCM",
    distanceKm: 18.0,
    elevationGainM: 24,
    difficulty: "Vừa phải",
    difficultyColor: "amber",
    estimatedTime: "42 - 52 phút",
    targetPaceOrSpeed: "Vận tốc 26 - 32 km/h",
    surface: "Mặt đường tiêu chuẩn cao cấp, không ổ gà",
    safetyScore: 98,
    highlights: ["Vắng xe máy và xe tải", "Peloton chạy theo nhóm an toàn", "Bảo vệ KCNC tuần tra liên tục"],
    waterStations: 2,
    coordinates: [
      [10.854, 106.792],
      [10.861, 106.804],
      [10.868, 106.815],
      [10.862, 106.822],
      [10.853, 106.812],
      [10.849, 106.799],
      [10.854, 106.792],
    ],
    elevationPoints: [8, 14, 24, 18, 12, 9, 8],
    bestRecord: {
      holder: "Trần Bảo Quân",
      time: "32:45",
      paceOrSpeed: "33.0 km/h",
    },
  },
  {
    id: "route-cyc-4",
    sport: "cycling",
    name: "Cung đường Rừng Sác - Cần Giờ (Phà Bình Khánh)",
    subtitle: "Hành trình sức bền dã ngoại qua khu dự trữ sinh quyển thế giới",
    district: "Nhà Bè - Cần Giờ",
    areaVi: "Đại lộ Rừng Sác",
    distanceKm: 42.0,
    elevationGainM: 35,
    difficulty: "Thử thách",
    difficultyColor: "rose",
    estimatedTime: "1 giờ 30 phút - 2 giờ",
    targetPaceOrSpeed: "Vận tốc 25 - 30 km/h",
    surface: "Nhựa trải dài 6 làn xe qua rừng ngập mặn",
    safetyScore: 88,
    highlights: ["Rừng cây xanh mát 2 bên đường", "Thử thách sức bền cự ly dài", "Điểm đến bãi biển 30/4"],
    waterStations: 5,
    coordinates: [
      [10.665, 106.758],
      [10.612, 106.782],
      [10.556, 106.821],
      [10.498, 106.862],
      [10.452, 106.895],
      [10.512, 106.851],
      [10.589, 106.802],
      [10.665, 106.758],
    ],
    elevationPoints: [4, 10, 18, 35, 22, 14, 8, 4],
    bestRecord: {
      holder: "Peloton Sài Gòn Velo",
      time: "1:18:20",
      paceOrSpeed: "32.2 km/h",
    },
  },
];

export const STRAVA_ROUTES: StravaRoute[] = [
  ...BINH_THANH_ROUTES,
  ...SALA_ROUTES,
  ...OTHER_RUNNING_ROUTES,
  ...CYCLING_ROUTES,
];
