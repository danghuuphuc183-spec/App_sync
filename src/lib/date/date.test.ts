import { describe, it, expect } from "vitest";
import {
  toUtcIso,
  formatVietnamDateTime,
  formatVietnamTime,
  isAtLeast18YearsOld,
  isAtLeastHoursInFuture,
} from "./index";

describe("Date utilities", () => {
  it("chuyển đổi ngày hợp lệ sang chuỗi UTC ISO", () => {
    const iso = toUtcIso("2026-10-30T09:00:00Z");
    expect(iso).toBe("2026-10-30T09:00:00.000Z");
  });

  it("ném lỗi RangeError khi truyền ngày không hợp lệ vào toUtcIso", () => {
    expect(() => toUtcIso("invalid-date")).toThrow(RangeError);
  });

  it("định dạng giờ Việt Nam chính xác (UTC+7)", () => {
    // 09:00 UTC tương đương 16:00 tại Việt Nam
    const timeStr = formatVietnamTime("2026-10-30T09:00:00Z");
    expect(timeStr).toBe("16:00");
  });

  it("định dạng ngày giờ Việt Nam", () => {
    const formatted = formatVietnamDateTime("2026-10-30T09:00:00Z", { style: "short" });
    // 30/10/2026, 16:00
    expect(formatted).toContain("30");
    expect(formatted).toContain("10");
    expect(formatted).toContain("2026");
    expect(formatted).toContain("16:00");
  });

  it("kiểm tra cổng tuổi 18 chính xác theo quyết định D4", () => {
    const fixedNow = new Date("2026-10-30T10:00:00Z");

    // Sinh ngày 2008-10-30 -> Tròn 18 tuổi hôm nay -> ĐẠT
    expect(isAtLeast18YearsOld("2008-10-30", fixedNow)).toBe(true);

    // Sinh ngày 2008-10-31 -> Ngày mai mới 18 tuổi (hôm nay 17 tuổi 364 ngày) -> CHẶN
    expect(isAtLeast18YearsOld("2008-10-31", fixedNow)).toBe(false);

    // Sinh năm 2009 -> 17 tuổi -> CHẶN
    expect(isAtLeast18YearsOld("2009-05-15", fixedNow)).toBe(false);

    // Sinh năm 2000 -> 26 tuổi -> ĐẠT
    expect(isAtLeast18YearsOld("2000-01-01", fixedNow)).toBe(true);
  });

  it("kiểm tra thời điểm hẹn cách hiện tại tối thiểu 2 giờ theo quy tắc P8", () => {
    const fixedNow = new Date("2026-10-30T10:00:00Z");

    // Cách 2 giờ 1 phút (12:01) -> Hợp lệ
    const validFuture = new Date("2026-10-30T12:01:00Z");
    expect(isAtLeastHoursInFuture(validFuture, 2, fixedNow)).toBe(true);

    // Cách 1 giờ 30 phút (11:30) -> Không hợp lệ (sát giờ)
    const invalidFuture = new Date("2026-10-30T11:30:00Z");
    expect(isAtLeastHoursInFuture(invalidFuture, 2, fixedNow)).toBe(false);
  });
});
