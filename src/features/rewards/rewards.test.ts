import { describe, it, expect, beforeEach } from "vitest";
import {
  REWARDS_CATALOG,
  getStoredUserExp,
  setStoredUserExp,
  getStoredRedeemedItems,
  setStoredRedeemedItems,
  generateVoucherCode,
  DEFAULT_USER_EXP,
} from "./rewards.data";

describe("Rewards Data & EXP Redemption Rules", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("chứa đầy đủ các tầng quà theo đúng quy chế đã duyệt", () => {
    // Tầng 1: 100 EXP (Voucher TP chức năng / Bù khoáng / Gel)
    const tier1 = REWARDS_CATALOG.filter((r) => r.tier === 1);
    expect(tier1.length).toBeGreaterThanOrEqual(3);
    expect(tier1.every((r) => r.expCost === 100)).toBe(true);
    expect(tier1.some((r) => r.tag === "TP Chức Năng")).toBe(true);

    // Tầng 2: 200 - 300 EXP (Voucher giá trị cao hơn / Bình lắc)
    const tier2 = REWARDS_CATALOG.filter((r) => r.tier === 2);
    expect(tier2.length).toBeGreaterThanOrEqual(3);
    expect(tier2.some((r) => r.expCost === 200)).toBe(true);
    expect(tier2.some((r) => r.expCost === 300)).toBe(true);

    // Tầng 4: Trên 1.000 EXP (Hiện vật in hình Synesis)
    const tier4 = REWARDS_CATALOG.filter((r) => r.tier === 4);
    expect(tier4.length).toBeGreaterThanOrEqual(4);
    expect(tier4.every((r) => r.expCost >= 1000)).toBe(true);
    expect(tier4.every((r) => r.category === "physical")).toBe(true);
    expect(tier4.every((r) => r.requiresShipping === true)).toBe(true);

    // Có Bình nước, Áo tập, Balo
    expect(tier4.some((r) => r.title.includes("Bình Nước"))).toBe(true);
    expect(tier4.some((r) => r.title.includes("Áo Tập"))).toBe(true);
    expect(tier4.some((r) => r.title.includes("Balo"))).toBe(true);
  });

  it("quản lý số dư EXP khả dụng với localStorage", () => {
    expect(getStoredUserExp()).toBe(DEFAULT_USER_EXP);

    setStoredUserExp(240);
    expect(getStoredUserExp()).toBe(240);
  });

  it("lưu trữ và lấy danh sách quà đã đổi", () => {
    const initial = getStoredRedeemedItems();
    expect(initial.length).toBeGreaterThan(0);

    const testItem = {
      id: "test-item-1",
      rewardId: "r-synesis-bottle",
      rewardTitle: "Bình Nước Thể Thao Synesis Pro",
      partnerName: "Synesis Official Gear",
      category: "physical" as const,
      expCost: 1000,
      redeemedAt: "17/11/2026",
      status: "shipping" as const,
    };

    setStoredRedeemedItems([testItem]);
    expect(getStoredRedeemedItems()).toEqual([testItem]);
  });

  it("tạo mã voucher chuẩn định dạng SYN-XXXX-XXXX", () => {
    const code = generateVoucherCode("SYN");
    expect(code).toMatch(/^SYN-[A-Z0-9]{4}-[A-Z0-9]{4}$/);
  });
});
