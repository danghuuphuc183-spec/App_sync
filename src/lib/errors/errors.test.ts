import { describe, it, expect } from "vitest";
import { AppError, ok, err } from "./index";

describe("AppError & Result helpers", () => {
  it("khởi tạo AppError với đầy đủ code và message tiếng Việt", () => {
    const error = new AppError("UNAUTHORIZED", "Vui lòng đăng nhập");
    expect(error.name).toBe("AppError");
    expect(error.code).toBe("UNAUTHORIZED");
    expect(error.messageVi).toBe("Vui lòng đăng nhập");
    expect(error.message).toBe("Vui lòng đăng nhập");
    expect(error.toJSON()).toEqual({
      name: "AppError",
      code: "UNAUTHORIZED",
      message: "Vui lòng đăng nhập",
    });
  });

  it("ok() trả về cấu trúc Result thành công", () => {
    const res = ok({ id: 123, score: 100 });
    expect(res.success).toBe(true);
    if (res.success) {
      expect(res.data.id).toBe(123);
      expect(res.data.score).toBe(100);
    }
  });

  it("err() trả về cấu trúc Result thất bại", () => {
    const error = new AppError("FORBIDDEN", "Không có quyền");
    const res = err(error);
    expect(res.success).toBe(false);
    if (!res.success) {
      expect(res.error.code).toBe("FORBIDDEN");
      expect(res.error.messageVi).toBe("Không có quyền");
    }
  });
});
