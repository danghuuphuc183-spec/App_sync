export interface SportTraits {
  endurance: number; // 0-3
  strength: number; // 0-3
  social: number; // 0-3
  low_cost: number; // 0-3
  beginner_friendly: number; // 0-3
}

export type SportCategory = "endurance" | "strength" | "mind_body" | "racket_team" | "ball_sport";

export type SportKey =
  | "running"
  | "gym"
  | "table_tennis"
  | "pickleball"
  | "badminton"
  | "football"
  | "basketball"
  | "cycling";

export interface SportItem {
  id: string;
  key?: SportKey;
  slug: string;
  nameVi: string;
  englishName?: string;
  category: SportCategory;
  requiresVenue?: boolean; // true = cần sân/dụng cụ (hiển thị địa chỉ, rating, map link); false = cung đường mở (Strava route)
  verificationMode: "auto_api" | "qr_only" | "peer_confirm";
  phase: number;
  isActive: boolean;
  sortOrder: number;
  descriptionVi: string;
  traits: SportTraits;
}

export const SEED_SPORTS: SportItem[] = [
  {
    id: "sp-running",
    key: "running",
    slug: "chay-bo",
    nameVi: "Chạy bộ",
    englishName: "Running",
    category: "endurance",
    requiresVenue: false,
    verificationMode: "auto_api",
    phase: 1,
    isActive: true,
    sortOrder: 1,
    descriptionVi:
      "Ghép cặp chạy bộ cự ly 5km - 21km theo dải Pace tương đồng. Tự động đồng bộ bài tập qua Strava & Apple Health.",
    traits: {
      endurance: 3,
      strength: 1,
      social: 2,
      low_cost: 3,
      beginner_friendly: 2,
    },
  },
  {
    id: "sp-cycling",
    key: "cycling",
    slug: "dap-xe",
    nameVi: "Đạp xe",
    englishName: "Cycling",
    category: "endurance",
    requiresVenue: false,
    verificationMode: "auto_api",
    phase: 1,
    isActive: true,
    sortOrder: 2,
    descriptionVi:
      "Tập luyện sức bền ngoài trời theo nhóm đôi hoặc đoàn peloton. Khảo sát cung đường an toàn, gió và độ dốc.",
    traits: {
      endurance: 3,
      strength: 2,
      social: 2,
      low_cost: 1,
      beginner_friendly: 2,
    },
  },
  {
    id: "sp-gym",
    key: "gym",
    slug: "gym",
    nameVi: "Gym & Kháng Lực",
    englishName: "Gym / Strength",
    category: "strength",
    requiresVenue: true,
    verificationMode: "auto_api",
    phase: 1,
    isActive: true,
    sortOrder: 3,
    descriptionVi:
      "Tìm bạn đỡ tạ (spotter) cùng khung giờ tại phòng gym cụ thể. Ràng buộc cam kết hoàn thành buổi tập không bùng kèo.",
    traits: {
      endurance: 1,
      strength: 3,
      social: 2,
      low_cost: 1,
      beginner_friendly: 1,
    },
  },
  {
    id: "sp-pickleball",
    key: "pickleball",
    slug: "pickleball",
    nameVi: "Pickleball",
    englishName: "Pickleball",
    category: "racket_team",
    requiresVenue: true,
    verificationMode: "qr_only",
    phase: 1,
    isActive: true,
    sortOrder: 4,
    descriptionVi:
      "Môn thể thao bùng nổ cho nhóm 2-4 người. Ghép cặp đánh đơn/đôi theo trình độ DUPR tại các cụm sân chất lượng cao.",
    traits: {
      endurance: 2,
      strength: 1,
      social: 3,
      low_cost: 2,
      beginner_friendly: 3,
    },
  },
  {
    id: "sp-badminton",
    key: "badminton",
    slug: "cau-long",
    nameVi: "Cầu lông",
    englishName: "Badminton",
    category: "racket_team",
    requiresVenue: true,
    verificationMode: "qr_only",
    phase: 1,
    isActive: true,
    sortOrder: 5,
    descriptionVi:
      "Tìm đối tác đánh đơn, đánh đôi giải phóng calo cực nhanh tại các cụm sân cầu lông tiêu chuẩn thảm chuyên dụng.",
    traits: {
      endurance: 2,
      strength: 2,
      social: 3,
      low_cost: 2,
      beginner_friendly: 2,
    },
  },
  {
    id: "sp-table-tennis",
    key: "table_tennis",
    slug: "bong-ban",
    nameVi: "Bóng bàn",
    englishName: "Table Tennis",
    category: "racket_team",
    requiresVenue: true,
    verificationMode: "qr_only",
    phase: 1,
    isActive: true,
    sortOrder: 6,
    descriptionVi:
      "Rèn luyện phản xạ nhanh và sự tập trung cao độ cùng đối tác ngang cơ tại các CLB bóng bàn có máy lạnh và sàn thi đấu.",
    traits: {
      endurance: 2,
      strength: 1,
      social: 2,
      low_cost: 3,
      beginner_friendly: 3,
    },
  },
  {
    id: "sp-football",
    key: "football",
    slug: "bong-da",
    nameVi: "Bóng đá",
    englishName: "Football / Mini Soccer",
    category: "ball_sport",
    requiresVenue: true,
    verificationMode: "qr_only",
    phase: 1,
    isActive: true,
    sortOrder: 7,
    descriptionVi:
      "Tìm slot đá ké hoặc gom người cho đội hình sân 5 và sân 7 cỏ nhân tạo, cam kết đúng giờ và không bỏ vị trí.",
    traits: {
      endurance: 3,
      strength: 2,
      social: 3,
      low_cost: 2,
      beginner_friendly: 2,
    },
  },
  {
    id: "sp-basketball",
    key: "basketball",
    slug: "bong-ro",
    nameVi: "Bóng rổ",
    englishName: "Basketball",
    category: "ball_sport",
    requiresVenue: true,
    verificationMode: "qr_only",
    phase: 1,
    isActive: true,
    sortOrder: 8,
    descriptionVi:
      "Tìm bạn pick-up game nửa sân 3x3 hoặc đấu giao lưu full-court 5x5 tại các sân bóng rổ ngoài trời & nhà thi đấu trong nhà.",
    traits: {
      endurance: 3,
      strength: 2,
      social: 3,
      low_cost: 2,
      beginner_friendly: 2,
    },
  },
];

export const POPULAR_GROUP_SPORTS = SEED_SPORTS;
