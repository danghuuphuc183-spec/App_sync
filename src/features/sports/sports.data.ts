export interface SportTraits {
  endurance: number; // 0-3
  strength: number; // 0-3
  social: number; // 0-3
  low_cost: number; // 0-3
  beginner_friendly: number; // 0-3
}

export interface SportItem {
  id: string;
  slug: string;
  nameVi: string;
  category: "endurance" | "strength" | "mind_body" | "racket_team";
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
    slug: "chay-bo",
    nameVi: "Chạy bộ (Running)",
    category: "endurance",
    verificationMode: "auto_api",
    phase: 1,
    isActive: true,
    sortOrder: 1,
    descriptionVi:
      "Ghép cặp chạy bộ cự ly 5km - 21km theo dải Pace tương đồng. Tự động đồng bộ bài tập qua API thực chứng.",
    traits: {
      endurance: 3,
      strength: 1,
      social: 2,
      low_cost: 3,
      beginner_friendly: 2,
    },
  },
  {
    id: "sp-gym",
    slug: "gym",
    nameVi: "Tập kháng lực (Gym / Strength)",
    category: "strength",
    verificationMode: "auto_api",
    phase: 1,
    isActive: true,
    sortOrder: 2,
    descriptionVi:
      "Tìm bạn đỡ tạ (spotter) cùng khung giờ tại phòng gym cụ thể. Ràng buộc cam kết hoàn thành đủ buổi tập.",
    traits: {
      endurance: 1,
      strength: 3,
      social: 2,
      low_cost: 1,
      beginner_friendly: 1,
    },
  },
  {
    id: "sp-cycling",
    slug: "dap-xe",
    nameVi: "Đạp xe (Cycling)",
    category: "endurance",
    verificationMode: "qr_only",
    phase: 2,
    isActive: false,
    sortOrder: 3,
    descriptionVi:
      "Tập luyện sức bền ngoài trời theo đoàn hoặc nhóm đôi. Xác thực điểm hẹn bằng mã QR.",
    traits: {
      endurance: 3,
      strength: 2,
      social: 2,
      low_cost: 1,
      beginner_friendly: 2,
    },
  },
  {
    id: "sp-walking",
    slug: "di-bo-nhanh",
    nameVi: "Đi bộ nhanh (Brisk Walking)",
    category: "endurance",
    verificationMode: "peer_confirm",
    phase: 2,
    isActive: false,
    sortOrder: 4,
    descriptionVi:
      "Khởi động thói quen vận động nhẹ nhàng cho Tân binh muốn giảm cân bền vững.",
    traits: {
      endurance: 2,
      strength: 0,
      social: 2,
      low_cost: 3,
      beginner_friendly: 3,
    },
  },
  {
    id: "sp-yoga",
    slug: "yoga",
    nameVi: "Yoga & Giãn cơ",
    category: "mind_body",
    verificationMode: "qr_only",
    phase: 3,
    isActive: false,
    sortOrder: 5,
    descriptionVi:
      "Phục hồi cơ bắp và rèn luyện tâm trí cùng đối tác tập luyện tĩnh tại.",
    traits: {
      endurance: 1,
      strength: 1,
      social: 1,
      low_cost: 2,
      beginner_friendly: 3,
    },
  },
  {
    id: "sp-badminton",
    slug: "cau-long",
    nameVi: "Cầu lông (Badminton)",
    category: "racket_team",
    verificationMode: "qr_only",
    phase: 3,
    isActive: false,
    sortOrder: 6,
    descriptionVi:
      "Tìm đối tác đánh đơn hoặc đánh đôi tại các sân cầu lông khu vực Bình Thạnh và Thủ Đức.",
    traits: {
      endurance: 2,
      strength: 2,
      social: 3,
      low_cost: 2,
      beginner_friendly: 2,
    },
  },
];
