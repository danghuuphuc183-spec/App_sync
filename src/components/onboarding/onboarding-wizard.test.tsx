import * as React from "react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

const push = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ push, replace: push }), usePathname: () => "/bat-dau" }));

import { AuthProvider } from "@/context/auth-context";
import { OnboardingWizard } from "./onboarding-wizard";

const next = () => fireEvent.click(screen.getByRole("button", { name: /^(Tiếp tục|Vào SYNESIS)$/ }));
const nextBtn = () => screen.getByRole("button", { name: /^(Tiếp tục|Vào SYNESIS)$/ });

describe("OnboardingWizard", () => {
  beforeEach(() => {
    window.localStorage.clear();
    push.mockReset();
  });

  it("đi hết 10 bước, nút Tiếp tục khoá khi chưa đủ thông tin, cuối cùng có gợi ý bạn tập và lưu hồ sơ", async () => {
    render(<AuthProvider><OnboardingWizard /></AuthProvider>);

    // 1. Giới thiệu
    expect(await screen.findByText("Giới thiệu về bạn")).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Tên hiển thị"), { target: { value: "Lan Anh" } });
    expect(nextBtn()).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: "Nữ" }));
    next();

    // 2. Mục tiêu
    expect(nextBtn()).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: /Bền bỉ/ }));
    next();

    // 3. Môn + loại buổi tập
    fireEvent.click(screen.getByRole("button", { name: /Chạy bộ/ }));
    expect(nextBtn()).toBeDisabled(); // phải chọn loại buổi
    fireEvent.click(screen.getByRole("button", { name: /Long run/ }));
    next();

    // 4. Giờ rảnh
    expect(nextBtn()).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: /Sáng sớm mỗi ngày/ }));
    expect(screen.getByText("Đã chọn 7 khung giờ")).toBeInTheDocument();
    next();

    // 5. Khu vực
    fireEvent.click(screen.getByRole("button", { name: "Bình Thạnh" }));
    expect(screen.getByText("≤ 3 km")).toBeInTheDocument();
    next();

    // 6. DISC — 5 câu
    for (let i = 0; i < 5; i++) fireEvent.click(screen.getAllByRole("button", { pressed: false }).find((b) => /đúng thói quen|đi cùng họ|phút chót|Giãn cơ|đáng tin/.test(b.textContent ?? ""))!);
    expect(screen.getByText(/S – Người kiên định/)).toBeInTheDocument();
    next();

    // 7. Vibe & an toàn: chọn Nữ → mặc định chỉ ghép cùng giới
    expect(screen.getByRole("button", { name: /Chỉ ghép cặp cùng giới/ })).toHaveAttribute("aria-pressed", "true");
    next();

    // 8–9. Quyền & ứng dụng: có thể để sau
    expect(screen.getByText("Vị trí (GPS)")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Để sau" }));
    expect(screen.getByText("Hevy")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Để sau" }));

    // 10. Tổng kết
    expect(screen.getByText("Sẵn sàng!")).toBeInTheDocument();
    expect(screen.getByText(/Hệ thống đã lọc giúp bạn/)).toBeInTheDocument();
    next();
    expect(push).toHaveBeenCalledWith("/");
    const saved = JSON.parse(window.localStorage.getItem("sync.onboarding.v1")!);
    expect(saved.sports).toEqual(["running"]);
    expect(saved.workoutTypes).toEqual(["long_run"]);
    expect(saved.sameGenderOnly).toBe(true);
    expect(saved.completedAt).toBeTruthy();
  });
});
