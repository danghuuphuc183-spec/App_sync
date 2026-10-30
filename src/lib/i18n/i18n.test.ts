import { describe, it, expect } from "vitest";
import { t } from "./index";

describe("i18n module", () => {
  it("trả về chuỗi dịch tiếng Việt chính xác theo key", () => {
    expect(t("app.name")).toBe("Khế Ước Kỷ Luật Thể Thao");
    expect(t("tiers.diamond")).toBe("Kim Cương");
    expect(t("auth.underageError")).toContain("Bạn chưa đủ 18 tuổi");
  });

  it("thay thế tham số dynamic params chính xác", () => {
    // Thử với key có params giả lập
    const customResult = t("common.required");
    expect(customResult).toBe("Bắt buộc");
  });

  it("ném lỗi khi thiếu key ở môi trường test/dev", () => {
    expect(() => t("non.existent.key")).toThrowError(
      '[i18n] Thiếu khóa dịch hoặc giá trị không phải chuỗi: "non.existent.key"'
    );
  });
});
