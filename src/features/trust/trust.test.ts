import { describe, it, expect } from "vitest";
import {
  TRUST_CONFIG,
  getTierFromScore,
  getTierNameVi,
} from "./config";

describe("Trust Score & Tier Boundary Rules (PROJECT_CONTEXT 4.1 & 4.2)", () => {
  it("xác định đúng Hạng Đồng (dưới 60 TS)", () => {
    expect(getTierFromScore(0)).toBe("bronze");
    expect(getTierFromScore(45)).toBe("bronze");
    expect(getTierFromScore(59)).toBe("bronze");
    expect(getTierNameVi("bronze")).toBe("Đồng");
  });

  it("xác định đúng Hạng Bạc (60 - 99 TS)", () => {
    expect(getTierFromScore(60)).toBe("silver");
    expect(getTierFromScore(75)).toBe("silver");
    expect(getTierFromScore(99)).toBe("silver");
    expect(getTierNameVi("silver")).toBe("Bạc");
  });

  it("xác định đúng Hạng Vàng (100 - 129 TS)", () => {
    expect(getTierFromScore(100)).toBe("gold");
    expect(getTierFromScore(115)).toBe("gold");
    expect(getTierFromScore(129)).toBe("gold");
    expect(getTierNameVi("gold")).toBe("Vàng");
  });

  it("xác định đúng Hạng Kim Cương (130 - 150 TS)", () => {
    expect(getTierFromScore(130)).toBe("diamond");
    expect(getTierFromScore(145)).toBe("diamond");
    expect(getTierFromScore(150)).toBe("diamond");
    expect(getTierNameVi("diamond")).toBe("Kim Cương");
  });

  it("kẹp điểm ngoài biên [0, 150] an toàn", () => {
    expect(getTierFromScore(-10)).toBe("bronze");
    expect(getTierFromScore(200)).toBe("diamond");
  });

  it("bảng phạt và thưởng khớp chính xác tài liệu PROJECT_CONTEXT 4.2", () => {
    expect(TRUST_CONFIG.DELTAS.COMPLETED_ON_TIME).toBe(2);
    expect(TRUST_CONFIG.DELTAS.LATE_5_TO_15_MIN).toBe(-5);
    expect(TRUST_CONFIG.DELTAS.CANCEL_OVER_2H).toBe(-3);
    expect(TRUST_CONFIG.DELTAS.CANCEL_UNDER_2H).toBe(-15);
    expect(TRUST_CONFIG.DELTAS.NO_SHOW_OR_OVER_15_MIN).toBe(-30);
    expect(TRUST_CONFIG.GRACE_PASSES_PER_MONTH).toBe(2);
  });

  it("giới hạn đặt cọc (stake) trong khoảng 10 đến 100", () => {
    expect(TRUST_CONFIG.STAKE.MIN).toBe(10);
    expect(TRUST_CONFIG.STAKE.MAX).toBe(100);
    expect(TRUST_CONFIG.STAKE.BRONZE_MULTIPLIER).toBe(2);
  });
});
