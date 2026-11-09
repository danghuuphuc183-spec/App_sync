import * as React from "react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";

const push = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ push, replace: push }), usePathname: () => "/dang-nhap" }));

import { AuthProvider } from "@/context/auth-context";
import { AuthFlow } from "./auth-flow";
import { normalizeVnPhone } from "@/features/auth/accounts";

const renderFlow = () => render(<AuthProvider><AuthFlow /></AuthProvider>);

describe("số điện thoại VN", () => {
  it("chuẩn hoá và kiểm tra đầu số", () => {
    expect(normalizeVnPhone("0908 123 456")).toBe("0908123456");
    expect(normalizeVnPhone("+84 912 345 678")).toBe("0912345678");
    expect(normalizeVnPhone("912345678")).toBe("0912345678");
    expect(normalizeVnPhone("0123456789")).toBeNull();
    expect(normalizeVnPhone("09081234")).toBeNull();
  });
});

describe("AuthFlow", () => {
  beforeEach(() => {
    window.localStorage.clear();
    push.mockReset();
  });

  it("màn chào có Google, Số điện thoại và hướng dẫn người mới", () => {
    renderFlow();
    expect(screen.getByRole("button", { name: /Tiếp tục với Google/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Tiếp tục bằng số điện thoại/ })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Người mới\? Xem 4 bước/ }));
    expect(screen.getByRole("dialog", { name: "Bắt đầu với SYNESIS" })).toBeInTheDocument();
  });

  it("số mới: OTP sai báo lỗi, OTP đúng → đặt tên → tạo tài khoản → /bat-dau", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    renderFlow();
    fireEvent.click(screen.getByRole("button", { name: /Tiếp tục bằng số điện thoại/ }));
    const input = screen.getByLabelText("Số điện thoại");
    fireEvent.change(input, { target: { value: "0123" } });
    expect(screen.getByRole("button", { name: /Gửi mã OTP/ })).toBeDisabled();
    fireEvent.change(input, { target: { value: "0912 345 678" } });
    fireEvent.click(screen.getByRole("button", { name: /Gửi mã OTP/ }));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(800);
    });
    expect(screen.getByText(/0912 345 678/)).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Mã OTP 6 số"), { target: { value: "111111" } });
    expect(screen.getByText(/Mã OTP không đúng/)).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Mã OTP 6 số"), { target: { value: "123456" } });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(10);
    });
    expect(screen.getByText(/Tài khoản mới/)).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Tên hiển thị"), { target: { value: "Lan Anh" } });
    fireEvent.click(screen.getByRole("button", { name: /Tạo tài khoản & thiết lập/ }));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(800);
    });
    expect(push).toHaveBeenCalledWith("/bat-dau");
    vi.useRealTimers();
  });

  it("số đã có tài khoản → đăng nhập thẳng vào app", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    renderFlow();
    fireEvent.click(screen.getByRole("button", { name: /Tiếp tục bằng số điện thoại/ }));
    fireEvent.change(screen.getByLabelText("Số điện thoại"), { target: { value: "0908123456" } });
    fireEvent.click(screen.getByRole("button", { name: /Gửi mã OTP/ }));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(800);
    });
    fireEvent.change(screen.getByLabelText("Mã OTP 6 số"), { target: { value: "123456" } });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(2000);
    });
    expect(screen.getByText(/Chào mừng trở lại/)).toBeInTheDocument();
    expect(push).toHaveBeenCalledWith("/");
    vi.useRealTimers();
  });

  it("Google: tài khoản khác chưa có → tạo mới → /bat-dau", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    renderFlow();
    fireEvent.click(screen.getByRole("button", { name: /Tiếp tục với Google/ }));
    fireEvent.click(screen.getByRole("button", { name: /Dùng một tài khoản Google khác/ }));
    fireEvent.change(screen.getByLabelText("Họ tên"), { target: { value: "Quốc Bảo" } });
    fireEvent.change(screen.getByLabelText("Email Google"), { target: { value: "quocbao@gmail.com" } });
    fireEvent.click(screen.getByRole("button", { name: "Tạo tài khoản với Google" }));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(800);
    });
    expect(push).toHaveBeenCalledWith("/bat-dau");
    vi.useRealTimers();
  });
});
