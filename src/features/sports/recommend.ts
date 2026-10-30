import type { SportItem, SportTraits } from "./sports.data";
import type { QuizAnswers } from "./quiz.config";

export interface UserVector {
  endurance: number;
  strength: number;
  social: number;
  low_cost: number;
  beginner_friendly: number;
  recommendGhostMode: boolean;
}

export interface RecommendationResult {
  sport: SportItem;
  score: number;
  reasonsVi: string[];
  recommendGhostMode: boolean;
  isDefaultFallback?: boolean;
}

/**
 * Xây dựng Vector trọng số người dùng từ câu trả lời Quiz.
 * Thuật toán thuần túy (Rule-based), không phụ thuộc mô hình AI.
 */
export function buildUserVector(answers: QuizAnswers): UserVector {
  const vector: UserVector = {
    endurance: 0,
    strength: 0,
    social: 0,
    low_cost: 0,
    beginner_friendly: 0,
    recommendGhostMode: false,
  };

  // Q1: Mục tiêu
  switch (answers.q1_goal) {
    case "giam_mo":
      vector.endurance += 2;
      vector.strength += 1;
      break;
    case "tang_co":
      vector.strength += 3;
      break;
    case "tang_suc_ben":
      vector.endurance += 3;
      break;
    case "ket_ban":
      vector.social += 3;
      break;
    case "giu_thoi_quen":
      vector.beginner_friendly += 2;
      vector.social += 1;
      break;
  }

  // Q4: Mức thoải mái khi tập cùng người lạ
  switch (answers.q4_social_comfort) {
    case "hoi_ngai":
      vector.social -= 1;
      vector.recommendGhostMode = true;
      break;
    case "thoai_mai":
      vector.social += 1;
      break;
    case "binh_thuong":
      // Giữ nguyên
      break;
  }

  // Q5: Ngân sách
  switch (answers.q5_budget) {
    case "mien_phi":
      vector.low_cost += 3;
      break;
    case "duoi_300k":
      vector.low_cost += 1;
      break;
    case "linh_hoat":
      // Không ưu tiên đặc biệt về chi phí thấp
      break;
  }

  // Q7: Kinh nghiệm
  if (answers.q7_experience === "moi_bat_dau") {
    vector.beginner_friendly += 2;
  }

  return vector;
}

/**
 * Tính điểm tương thích giữa Vector người dùng và Traits của môn thể thao.
 * Điểm = vector.endurance * traits.endurance + ...
 */
export function calculateSportScore(vector: UserVector, traits: SportTraits): number {
  return (
    vector.endurance * traits.endurance +
    vector.strength * traits.strength +
    vector.social * traits.social +
    vector.low_cost * traits.low_cost +
    vector.beginner_friendly * traits.beginner_friendly
  );
}

/**
 * Tạo danh sách lý do gợi ý bằng tiếng Việt.
 */
export function generateReasons(vector: UserVector, sport: SportItem): string[] {
  const reasons: string[] = [];

  if (vector.endurance > 0 && sport.traits.endurance >= 2) {
    reasons.push("Phù hợp mục tiêu phát triển sức bền tim mạch");
  }
  if (vector.strength > 0 && sport.traits.strength >= 2) {
    reasons.push("Tối ưu cho mục tiêu tăng cơ và thể lực kháng lực");
  }
  if (vector.low_cost > 0 && sport.traits.low_cost >= 2) {
    reasons.push("Chi phí tập luyện tiết kiệm, không gian mở miễn phí");
  }
  if (vector.beginner_friendly > 0 && sport.traits.beginner_friendly >= 2) {
    reasons.push("Dễ tiếp cận cho người mới bắt đầu hình thành thói quen");
  }
  if (vector.social > 0 && sport.traits.social >= 2) {
    reasons.push("Dễ kết nối và tập luyện cùng cộng đồng");
  }

  if (reasons.length === 0) {
    reasons.push("Môn thể thao nền tảng phù hợp với thể trạng của bạn");
  }

  return reasons;
}

/**
 * Thuật toán chính: Gợi ý môn thể thao từ Quiz.
 */
export function recommendSports(
  answers: QuizAnswers,
  catalog: SportItem[]
): RecommendationResult[] {
  const activeSports = catalog.filter((s) => s.isActive);

  // Xử lý biên: Danh mục môn rỗng hoặc không có môn nào active
  if (activeSports.length === 0) {
    return [];
  }

  const userVector = buildUserVector(answers);

  const scoredSports = activeSports.map((sport) => {
    const score = calculateSportScore(userVector, sport.traits);
    const reasonsVi = generateReasons(userVector, sport);
    return {
      sport,
      score,
      reasonsVi,
      recommendGhostMode: userVector.recommendGhostMode,
    };
  });

  // Lọc môn có điểm > 0 và sắp xếp giảm dần theo điểm; hòa điểm thì sortOrder nhỏ hơn đứng trước
  const positiveScored = scoredSports
    .filter((item) => item.score > 0)
    .sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      return a.sport.sortOrder - b.sport.sortOrder;
    });

  // Nếu không có môn nào dương điểm: Trả về môn active đầu tiên làm fallback
  if (positiveScored.length === 0) {
    const defaultSport = [...activeSports].sort((a, b) => a.sortOrder - b.sortOrder)[0];
    if (!defaultSport) return [];
    return [
      {
        sport: defaultSport,
        score: 0,
        reasonsVi: ["Gợi ý mặc định theo thứ tự ưu tiên của nền tảng"],
        recommendGhostMode: userVector.recommendGhostMode,
        isDefaultFallback: true,
      },
    ];
  }

  return positiveScored;
}
