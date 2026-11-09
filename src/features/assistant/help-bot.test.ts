import { describe, it, expect } from "vitest";
import { answerHelpQuestion, normalizeVi } from "./help-bot";

describe("help-bot", () => {
  it("bỏ dấu tiếng Việt", () => {
    expect(normalizeVi("Chuỗi Đường")).toBe("chuoi duong");
  });

  it("trả lời câu hỏi về chuỗi tuần", () => {
    expect(answerHelpQuestion("Chuỗi tuần tính thế nào?").text).toContain("TUẦN");
  });

  it("trả lời câu hỏi tạo kèo kèm link", () => {
    expect(answerHelpQuestion("làm sao tạo kèo tập").link?.href).toBe("/len-keo");
  });

  it("câu hỏi lạ → gợi ý chủ đề", () => {
    expect(answerHelpQuestion("thời tiết hôm nay").text).toContain("chưa hiểu");
  });
});
