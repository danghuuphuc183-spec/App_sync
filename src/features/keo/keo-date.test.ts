import { describe, expect, it } from "vitest";
import { formatKeoDay, isWeekendDay, normalizeKeoDay, resolveDay, toIsoDay } from "./keo-date";

// Thứ Hai, 09/11/2026
const NOW = new Date(2026, 10, 9, 8, 0);

describe("Ngày của kèo (ISO)", () => {
  it("đọc ngày ISO và nhãn cũ", () => {
    expect(toIsoDay(resolveDay("2026-11-14", NOW))).toBe("2026-11-14");
    expect(toIsoDay(resolveDay("Ngày mai", NOW))).toBe("2026-11-10");
    expect(toIsoDay(resolveDay("Thứ Bảy", NOW))).toBe("2026-11-14");
  });

  it("hiển thị thứ + ngày/tháng, có Hôm nay / Ngày mai", () => {
    expect(formatKeoDay("2026-11-09", NOW)).toBe("Hôm nay, T2 09/11");
    expect(formatKeoDay("2026-11-10", NOW)).toBe("Ngày mai, T3 10/11");
    expect(formatKeoDay("2026-11-13", NOW)).toBe("Thứ Sáu, 13/11");
    expect(formatKeoDay("2027-01-02", NOW)).toBe("Thứ Bảy, 02/01/2027");
  });

  it("ngày mặc định đã qua → chuyển về ngày mai; nhận biết cuối tuần", () => {
    expect(normalizeKeoDay("2026-11-01", NOW)).toBe("2026-11-10");
    expect(normalizeKeoDay("2026-11-20", NOW)).toBe("2026-11-20");
    expect(isWeekendDay("2026-11-15", NOW)).toBe(true);
    expect(isWeekendDay("2026-11-11", NOW)).toBe(false);
  });
});
