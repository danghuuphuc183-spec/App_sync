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

  it("đi hết các bước tinh giản, thanh tiến độ phân đoạn từng câu, bỏ câu hỏi giao tiếp và đỡ tạ, giao diện nền sáng", async () => {
    render(<AuthProvider><OnboardingWizard /></AuthProvider>);

    // 1. Giới thiệu — không hỏi chiều cao / cân nặng
    expect(await screen.findByText("Giới thiệu về bạn")).toBeInTheDocument();
    expect(screen.queryByText("Cân nặng")).not.toBeInTheDocument();
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

    // 6. Vibe & an toàn: KHÔNG CÒN câu "Bạn thích tập cùng thế nào?", KHÔNG CÒN "đỡ tạ"
    expect(screen.queryByText("Bạn thích tập cùng thế nào?")).not.toBeInTheDocument();
    expect(screen.queryByText("Cần người đỡ tạ (spotter)")).not.toBeInTheDocument();
    expect(screen.queryByText("Tôi đỡ tạ được")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Chỉ ghép cặp cùng giới/ })).toHaveAttribute("aria-pressed", "true");
    next();

    // 7–8. Quyền & ứng dụng: có thể để sau
    expect(screen.getByText("Vị trí (GPS)")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Để sau" }));
    expect(screen.getByText("Hevy")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Để sau" }));

    // 9. Tổng kết
    expect(screen.getByText("Sẵn sàng!")).toBeInTheDocument();
    expect(screen.getByText(/Hệ thống đã lọc giúp bạn/)).toBeInTheDocument();
    next();
    expect(push).toHaveBeenCalledWith("/");
    const saved = JSON.parse(window.localStorage.getItem("sync.onboarding.v1")!);
    expect(saved.sports).toEqual(["running"]);
    expect(saved.workoutTypes).toEqual(["long_run"]);
    expect(saved.sameGenderOnly).toBe(true);
    expect(saved).not.toHaveProperty("weightKg");
    expect(saved).not.toHaveProperty("discAnswers");
    expect(saved.completedAt).toBeTruthy();
  });
});
