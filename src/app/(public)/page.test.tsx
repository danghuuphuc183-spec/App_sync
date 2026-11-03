import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import HomePage from "./page";

describe("HomePage - Community Controlled Activity Feed", () => {
  it("render trang chủ hoạt động thể thao thành công với quick actions, stories và 5 loại card", () => {
    render(<HomePage />);

    // Kiểm tra thanh Stories các bạn tập (có thể xuất hiện ở story và card)
    expect(screen.getAllByText("Hoàng Nam").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Thuỳ Dung").length).toBeGreaterThan(0);

    // Kiểm tra Quick Action Bar
    expect(screen.getByText("Tạo Kèo")).toBeInTheDocument();
    expect(screen.getByText("Tìm Nhóm")).toBeInTheDocument();
    expect(screen.getByText("Check-in")).toBeInTheDocument();
    expect(screen.getByText("Chia Sẻ")).toBeInTheDocument();

    // Kiểm tra Reels Cung Đường & Quãng Đường
    expect(screen.getByText(/Reels Cung Đường Đẹp/i)).toBeInTheDocument();

    // Kiểm tra banner Ghép Bạn Tập Kỷ Luật
    expect(screen.getByText(/Khám phá & Ghép đôi bạn tập thể thao/i)).toBeInTheDocument();

    // Kiểm tra bộ lọc chips
    expect(screen.getByRole("button", { name: "Tất cả" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Chạy bộ/i })).toBeInTheDocument();

    // Kiểm tra bài viết cộng đồng và nút Nhận Kèo
    expect(screen.getAllByText("Minh Anh").length).toBeGreaterThan(0);
    const joinButtons = screen.getAllByRole("button", { name: /Nhận Kèo/i });
    expect(joinButtons.length).toBeGreaterThan(0);
  });
});
