export type CoachingMode = "1:1" | "group";

export type SportCoachingCategory =
  | "Gym & Kháng Lực"
  | "Chạy Bộ & Marathon"
  | "Yoga & Giãn Cơ"
  | "Pilates & Core"
  | "Boxing & Kickfit"
  | "Calisthenics & Street Workout"
  | "Bơi Lội & Kỹ Thuật";

export type FitnessGoal =
  | "tang_co"
  | "giam_mo"
  | "chinh_dang_posture"
  | "chay_marathon"
  | "suc_ben_the_luc"
  | "phuc_hoi_chan_thuong"
  | "san_chac_toan_than";

export type CoachingStyle =
  | "strict_discipline" // Kỷ luật nghiêm khắc, thúc đẩy bứt phá
  | "gentle_encouraging" // Động viên nhẹ nhàng, tích cực, không áp lực
  | "scientific_form" // Khoa học, chú trọng giải phẫu & chuẩn form
  | "high_energy"; // Năng lượng bùng nổ, vui vẻ, truyền cảm hứng

export interface CoachReview {
  id: string;
  traineeName: string;
  traineeAvatar: string;
  rating: number; // 1 to 5
  dateVi: string;
  trainingType: CoachingMode;
  comment: string;
  achievementBadge?: string;
  verifiedTrainee: boolean;
}

export interface CoachHistoryItem {
  period: string;
  role: string;
  organization: string;
  highlight: string;
}

export interface CoachPricing {
  single1on1: {
    pricePerSession: number; // VND
    durationMin: number;
    trialPrice?: number; // Giá buổi trải nghiệm & đo Inbody
    package10Price?: number;
    notes?: string;
  };
  groupCoaching: {
    minMembers: number;
    maxMembers: number;
    pricePerPersonPerSession: number; // VND/người/buổi
    durationMin: number;
    savingsPercent: number; // e.g. 60%
    groupBenefits: string[];
  };
}

export interface CoachBodyStats {
  heightCm: number;
  weightKg: number;
  bodyFatPercent?: number;
  experienceYears: number;
  totalTrainees: number;
}

export interface Coach {
  id: string;
  name: string;
  title: string;
  avatar: string;
  coverImage?: string;
  gender: "male" | "female";
  sportCategory: SportCoachingCategory;
  isVerified: boolean;
  trustScore: number; // Điểm Uy Tín TS (Hệ thống Sync)
  tier: "diamond" | "gold" | "silver";
  
  // Số đo & thể hình
  bodyStats: CoachBodyStats;
  
  // Phong cách & Sở thích
  coachingStyles: CoachingStyle[];
  hobbies: string[];
  bio: string;
  quote?: string;
  
  // Lịch sử & Chứng chỉ
  history: CoachHistoryItem[];
  certifications: string[];
  specialties: string[];
  
  // Bảng giá & Hình thức
  pricing: CoachPricing;
  trainingModes: CoachingMode[];
  
  // Khu vực & Địa điểm
  locations: string[];
  supportedGyms: string[];
  
  // Đánh giá
  rating: number; // 4.5 - 5.0
  reviewCount: number;
  reviews: CoachReview[];
  
  // Trạng thái nhận học viên
  isAcceptingNewTrainees: boolean;
  featuredHighlight?: string;
}

export interface UserCoachProfile {
  userHeightCm: number;
  userWeightKg: number;
  fitnessGoal: FitnessGoal;
  preferredMode: "all" | CoachingMode;
  coachingStyle: "any" | CoachingStyle;
  preferredSport: "all" | SportCoachingCategory;
  maxBudgetPerSession: number; // VND
  preferredArea: "all" | string;
  preferredGender?: "any" | "male" | "female";
}

export interface CoachMatchResult {
  coach: Coach;
  matchScore: number; // 0 - 100%
  matchReasons: string[];
  compatibilityHighlight: string;
}
