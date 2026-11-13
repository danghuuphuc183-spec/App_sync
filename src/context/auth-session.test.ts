import { describe, it, expect } from "vitest";
import { isLeftoverDemoSession } from "./auth-context";

describe("Phiên tài khoản mẫu còn sót từ bản cũ", () => {
  it("bản production (tắt tự đăng nhập): bỏ phiên tài khoản mẫu, giữ tài khoản tự đăng ký", () => {
    expect(isLeftoverDemoSession({ id: "usr_athlete_01" }, false)).toBe(true);
    expect(isLeftoverDemoSession({ id: "usr_1794586578453" }, false)).toBe(false);
    expect(isLeftoverDemoSession({ id: "usr_google_1794586578453" }, false)).toBe(false);
  });

  it("chạy trên máy (bật tự đăng nhập): vẫn dùng tài khoản mẫu như cũ", () => {
    expect(isLeftoverDemoSession({ id: "usr_athlete_01" }, true)).toBe(false);
  });
});
