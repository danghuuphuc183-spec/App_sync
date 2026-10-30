import { describe, it, expect } from "vitest";
import {
  recommendSports,
  buildUserVector,
  calculateSportScore,
} from "./recommend";
import { SEED_SPORTS, type SportItem } from "./sports.data";
import { quizAnswersSchema, type QuizAnswers } from "./quiz.config";

const baseAnswers: QuizAnswers = {
  q1_goal: "giam_mo",
  q2_frequency: "3_4",
  q3_time_slot: "sang_som",
  q4_social_comfort: "binh_thuong",
  q5_budget: "mien_phi",
  q6_area: "area-binh-thanh",
  q7_experience: "duoi_6_thang",
};

describe("Quiz Recommendation Algorithm (recommend.ts)", () => {
  // Ca 1: Mục tiêu tăng cơ -> Gym phải đứng đầu
  it("Ca 1: Mục tiêu tăng cơ (tang_co) ưu tiên Gym", () => {
    const answers: QuizAnswers = { ...baseAnswers, q1_goal: "tang_co", q5_budget: "linh_hoat" };
    const res = recommendSports(answers, SEED_SPORTS);
    expect(res.length).toBeGreaterThan(0);
    expect(res[0]?.sport.slug).toBe("gym");
  });

  // Ca 2: Mục tiêu tăng sức bền -> Chạy bộ đứng đầu
  it("Ca 2: Mục tiêu tăng sức bền (tang_suc_ben) ưu tiên Chạy bộ", () => {
    const answers: QuizAnswers = { ...baseAnswers, q1_goal: "tang_suc_ben" };
    const res = recommendSports(answers, SEED_SPORTS);
    expect(res.length).toBeGreaterThan(0);
    expect(res[0]?.sport.slug).toBe("chay-bo");
  });

  // Ca 3: Ngại giao tiếp -> Đề xuất Ghost Mode
  it("Ca 3: Ngại giao tiếp (hoi_ngai) kích hoạt cờ recommendGhostMode", () => {
    const answers: QuizAnswers = { ...baseAnswers, q4_social_comfort: "hoi_ngai" };
    const res = recommendSports(answers, SEED_SPORTS);
    expect(res[0]?.recommendGhostMode).toBe(true);
  });

  // Ca 4: Rất thoải mái giao tiếp -> social + 1
  it("Ca 4: Thoải mái giao tiếp (thoai_mai) tăng điểm social", () => {
    const vector = buildUserVector({ ...baseAnswers, q4_social_comfort: "thoai_mai" });
    expect(vector.social).toBe(1);
    expect(vector.recommendGhostMode).toBe(false);
  });

  // Ca 5: Ngân sách miễn phí -> low_cost + 3
  it("Ca 5: Ngân sách miễn phí (mien_phi) tăng tối đa low_cost", () => {
    const vector = buildUserVector({ ...baseAnswers, q5_budget: "mien_phi" });
    expect(vector.low_cost).toBe(3);
  });

  // Ca 6: Ngân sách dưới 300k -> low_cost + 1
  it("Ca 6: Ngân sách dưới 300k (duoi_300k) tăng low_cost + 1", () => {
    const vector = buildUserVector({ ...baseAnswers, q5_budget: "duoi_300k" });
    expect(vector.low_cost).toBe(1);
  });

  // Ca 7: Ngân sách linh hoạt -> low_cost = 0
  it("Ca 7: Ngân sách linh hoạt (linh_hoat) giữ low_cost = 0", () => {
    const vector = buildUserVector({ ...baseAnswers, q5_budget: "linh_hoat" });
    expect(vector.low_cost).toBe(0);
  });

  // Ca 8: Tân binh mới bắt đầu -> beginner_friendly + 2
  it("Ca 8: Tân binh mới bắt đầu (moi_bat_dau) tăng beginner_friendly", () => {
    const vector = buildUserVector({ ...baseAnswers, q7_experience: "moi_bat_dau" });
    expect(vector.beginner_friendly).toBe(2);
  });

  // Ca 9: Mục tiêu kết bạn -> social + 3
  it("Ca 9: Mục tiêu kết bạn (ket_ban) tăng điểm social cao nhất", () => {
    const vector = buildUserVector({ ...baseAnswers, q1_goal: "ket_ban" });
    expect(vector.social).toBe(3);
  });

  // Ca 10: Mục tiêu giữ thói quen -> beginner_friendly + 2, social + 1
  it("Ca 10: Mục tiêu giữ thói quen (giu_thoi_quen) tăng cả beginner_friendly và social", () => {
    const vector = buildUserVector({ ...baseAnswers, q1_goal: "giu_thoi_quen" });
    expect(vector.beginner_friendly).toBe(2);
    expect(vector.social).toBe(1);
  });

  // Ca 11: Hòa điểm -> môn có sortOrder nhỏ hơn xếp trước
  it("Ca 11: Hòa điểm thì môn có sortOrder nhỏ hơn đứng trước", () => {
    const mockSports: SportItem[] = [
      {
        id: "s1",
        slug: "sport-a",
        nameVi: "Môn A",
        category: "endurance",
        verificationMode: "auto_api",
        phase: 1,
        isActive: true,
        sortOrder: 2,
        descriptionVi: "",
        traits: { endurance: 2, strength: 0, social: 0, low_cost: 0, beginner_friendly: 0 },
      },
      {
        id: "s2",
        slug: "sport-b",
        nameVi: "Môn B",
        category: "endurance",
        verificationMode: "auto_api",
        phase: 1,
        isActive: true,
        sortOrder: 1,
        descriptionVi: "",
        traits: { endurance: 2, strength: 0, social: 0, low_cost: 0, beginner_friendly: 0 },
      },
    ];

    const answers: QuizAnswers = { ...baseAnswers, q1_goal: "tang_suc_ben" };
    const res = recommendSports(answers, mockSports);
    expect(res[0]?.sport.sortOrder).toBe(1);
    expect(res[1]?.sport.sortOrder).toBe(2);
  });

  // Ca 12: Catalog rỗng -> trả về mảng rỗng
  it("Ca 12: Catalog rỗng trả về mảng rỗng", () => {
    const res = recommendSports(baseAnswers, []);
    expect(res).toEqual([]);
  });

  // Ca 13: Toàn bộ môn inactive -> trả về mảng rỗng
  it("Ca 13: Toàn bộ môn inactive trả về mảng rỗng", () => {
    const allInactive = SEED_SPORTS.map((s) => ({ ...s, isActive: false }));
    const res = recommendSports(baseAnswers, allInactive);
    expect(res).toEqual([]);
  });

  // Ca 14: Điểm không môn nào dương -> fallback về môn active đầu tiên
  it("Ca 14: Khi điểm = 0, fallback về môn active đầu tiên kèm nhãn isDefaultFallback", () => {
    const zeroTraitsSport: SportItem[] = [
      {
        id: "zero",
        slug: "zero",
        nameVi: "Môn Zero",
        category: "mind_body",
        verificationMode: "peer_confirm",
        phase: 1,
        isActive: true,
        sortOrder: 1,
        descriptionVi: "",
        traits: { endurance: 0, strength: 0, social: 0, low_cost: 0, beginner_friendly: 0 },
      },
    ];
    const res = recommendSports(baseAnswers, zeroTraitsSport);
    expect(res.length).toBe(1);
    expect(res[0]?.isDefaultFallback).toBe(true);
  });

  // Ca 15: Kiểm tra hàm tính điểm calculateSportScore
  it("Ca 15: calculateSportScore tính đúng tích vô hướng giữa vector và traits", () => {
    const vector = {
      endurance: 2,
      strength: 3,
      social: 1,
      low_cost: 2,
      beginner_friendly: 1,
      recommendGhostMode: false,
    };
    const traits = {
      endurance: 3,
      strength: 2,
      social: 1,
      low_cost: 0,
      beginner_friendly: 2,
    };
    // 2*3 + 3*2 + 1*1 + 2*0 + 1*2 = 6 + 6 + 1 + 0 + 2 = 15
    const score = calculateSportScore(vector, traits);
    expect(score).toBe(15);
  });

  // Ca 16: Zod schema xác thực dữ liệu câu trả lời Quiz
  it("Ca 16: Zod schema từ chối dữ liệu câu trả lời không hợp lệ", () => {
    const invalidAnswers = {
      ...baseAnswers,
      q1_goal: "invalid_goal_value",
    };
    const parsed = quizAnswersSchema.safeParse(invalidAnswers);
    expect(parsed.success).toBe(false);
  });
});
