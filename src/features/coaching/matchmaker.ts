import { Coach, UserCoachProfile, CoachMatchResult, FitnessGoal, CoachingStyle } from "./coaching.types";

export const GOAL_LABELS: Record<FitnessGoal, string> = {
  tang_co: "Tăng cơ & Tăng sức mạnh",
  giam_mo: "Giảm mỡ & Thon gọn",
  chinh_dang_posture: "Chỉnh gù/võng lưng & Giảm đau vai gáy",
  chay_marathon: "Chạy bộ bền & Chinh phục giải Marathon",
  suc_ben_the_luc: "Sức bền & Thể lực đa năng",
  phuc_hoi_chan_thuong: "Phục hồi chức năng vận động",
  san_chac_toan_than: "Săn chắc vóc dáng & Dẻo dai",
};

export const STYLE_LABELS: Record<CoachingStyle, string> = {
  strict_discipline: "Kỷ luật cao, bứt phá giới hạn",
  gentle_encouraging: "Động viên nhẹ nhàng, tích cực",
  scientific_form: "Khoa học, chuẩn giải phẫu & form",
  high_energy: "Năng lượng bùng nổ, vui vẻ",
};

/**
 * Calculates a match score (0 - 100) between a user's personal profile and a coach.
 */
export function calculateCoachMatch(coach: Coach, profile: UserCoachProfile): CoachMatchResult {
  let score = 25; // Điểm cơ sở
  const matchReasons: string[] = [];

  // 1. Kiểm tra Mục tiêu tập luyện (Trọng số 25)
  const goal = profile.fitnessGoal;
  const isGoalMatched = coach.specialties.some((spec) => {
    const s = spec.toLowerCase();
    if (goal === "tang_co" && (s.includes("tăng cơ") || s.includes("hypertrophy") || s.includes("sức mạnh") || s.includes("powerlifting"))) return true;
    if (goal === "giam_mo" && (s.includes("giảm mỡ") || s.includes("giảm cân") || s.includes("đốt mỡ") || s.includes("định hình") || s.includes("cardio") || s.includes("fat loss"))) return true;
    if (goal === "chinh_dang_posture" && (s.includes("tư thế") || s.includes("gù lưng") || s.includes("võng lưng") || s.includes("cột sống") || s.includes("posture"))) return true;
    if (goal === "chay_marathon" && (s.includes("marathon") || s.includes("chạy bộ") || s.includes("pace") || s.includes("sức bền"))) return true;
    if (goal === "phuc_hoi_chan_thuong" && (s.includes("phục hồi") || s.includes("chấn thương") || s.includes("corrective") || s.includes("cốt lõi"))) return true;
    if (goal === "san_chac_toan_than" && (s.includes("săn chắc") || s.includes("dẻo dai") || s.includes("core") || s.includes("pilates") || s.includes("yoga") || s.includes("glute"))) return true;
    return false;
  });

  if (isGoalMatched) {
    score += 25;
    matchReasons.push(`Chuyên sâu mục tiêu: ${GOAL_LABELS[goal]}`);
  } else {
    score += 4;
  }

  // 2. Môn thể thao ưu tiên (Trọng số 20)
  if (profile.preferredSport === "all") {
    score += 15;
  } else if (coach.sportCategory === profile.preferredSport) {
    score += 20;
    matchReasons.push(`Bộ môn đúng sở thích: ${coach.sportCategory}`);
  } else {
    // Không trùng môn thể thao đã chọn
    score -= 5;
  }

  // 3. Hình thức tập luyện mong muốn (Trọng số 15)
  if (profile.preferredMode === "all") {
    score += 12;
    matchReasons.push("Hỗ trợ linh hoạt cả 1:1 lẫn Tập Nhóm Squad");
  } else if (coach.trainingModes.includes(profile.preferredMode)) {
    score += 15;
    if (profile.preferredMode === "1:1") {
      matchReasons.push("Chuyên kèm 1:1 cá nhân hóa giáo án từng buổi");
    } else {
      matchReasons.push(`Nhóm ${coach.pricing.groupCoaching.minMembers}-${coach.pricing.groupCoaching.maxMembers} người tiết kiệm ${coach.pricing.groupCoaching.savingsPercent}%`);
    }
  }

  // 4. Ngân sách chi trả (Trọng số 15)
  const effectivePrice =
    profile.preferredMode === "group"
      ? coach.pricing.groupCoaching.pricePerPersonPerSession
      : coach.pricing.single1on1.pricePerSession;

  if (effectivePrice <= profile.maxBudgetPerSession) {
    score += 15;
    matchReasons.push(`Mức phí tối ưu (${effectivePrice.toLocaleString("vi-VN")}đ/buổi)`);
  } else if (effectivePrice <= profile.maxBudgetPerSession * 1.2) {
    score += 8;
  } else {
    score += 2;
  }

  // 5. Phong cách huấn luyện (Trọng số 12)
  if (profile.coachingStyle === "any") {
    score += 8;
  } else if (coach.coachingStyles.includes(profile.coachingStyle)) {
    score += 12;
    matchReasons.push(`Đúng phong cách: ${STYLE_LABELS[profile.coachingStyle]}`);
  }

  // 6. Khu vực tập luyện (Trọng số 8)
  if (profile.preferredArea === "all") {
    score += 6;
  } else if (coach.locations.some((loc) => loc.includes(profile.preferredArea))) {
    score += 8;
    matchReasons.push(`Khu vực thuận tiện tại ${profile.preferredArea}`);
  }

  // 7. Giới tính ưu tiên (nếu có)
  if (profile.preferredGender && profile.preferredGender !== "any") {
    if (coach.gender === profile.preferredGender) {
      score += 5;
    }
  }

  // Điểm đánh giá và Điểm Uy tín thêm tối đa 5 điểm cộng
  const ratingBonus = Math.round((coach.rating - 4.5) * 6);
  score += Math.max(0, ratingBonus);

  // Giới hạn điểm từ 65 đến 99
  const boundedScore = Math.min(99, Math.max(65, Math.round(score)));

  let compatibilityHighlight = "";
  if (boundedScore >= 95) {
    compatibilityHighlight = "Khớp gần như tuyệt đối với thể trạng và mục tiêu của bạn";
  } else if (boundedScore >= 88) {
    compatibilityHighlight = "Lựa chọn rất lý tưởng cho mục tiêu của bạn";
  } else if (boundedScore >= 78) {
    compatibilityHighlight = "Phù hợp tốt với định hướng tập luyện";
  } else {
    compatibilityHighlight = "HLV có kinh nghiệm tương thích cơ bản";
  }

  return {
    coach,
    matchScore: boundedScore,
    matchReasons: matchReasons.slice(0, 3),
    compatibilityHighlight,
  };
}

/**
 * Ranks all coaches based on personal profile and optional search filters.
 */
export function rankCoaches(
  coaches: Coach[],
  profile: UserCoachProfile,
  searchQuery: string = "",
  modeFilter: "all" | "1:1" | "group" = "all"
): CoachMatchResult[] {
  return coaches
    .filter((coach) => {
      // Lọc theo mode nếu người dùng chọn tab nhanh
      if (modeFilter !== "all" && !coach.trainingModes.includes(modeFilter)) {
        return false;
      }
      // Lọc theo search text
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = coach.name.toLowerCase().includes(q);
        const matchesSport = coach.sportCategory.toLowerCase().includes(q);
        const matchesSpec = coach.specialties.some((s) => s.toLowerCase().includes(q));
        const matchesLoc = coach.locations.some((l) => l.toLowerCase().includes(q));
        const matchesStyle = coach.hobbies.some((h) => h.toLowerCase().includes(q));
        if (!matchesName && !matchesSport && !matchesSpec && !matchesLoc && !matchesStyle) {
          return false;
        }
      }
      return true;
    })
    .map((coach) => calculateCoachMatch(coach, profile))
    .sort((a, b) => {
      if (b.matchScore !== a.matchScore) {
        return b.matchScore - a.matchScore;
      }
      // Phá vỡ hòa bằng rating rồi đến trustScore
      if (b.coach.rating !== a.coach.rating) {
        return b.coach.rating - a.coach.rating;
      }
      return b.coach.trustScore - a.coach.trustScore;
    });
}
