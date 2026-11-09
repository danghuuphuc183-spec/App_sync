import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import ClubsPage from "./page";

describe("ClubsPage & Coaching Integration", () => {
  it("trang Nhóm chỉ có 2 chức năng: Câu lạc bộ và Huấn luyện viên, không có tạo kèo", () => {
    render(<ClubsPage />);

    expect(screen.getByRole("heading", { name: "Nhóm" })).toBeInTheDocument();
    expect(screen.getAllByRole("tab").map((t) => t.textContent)).toEqual(["Câu lạc bộ", "Huấn luyện viên"]);
    expect(screen.queryByText(/Tạo kèo/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Lên Kèo Squad/i)).not.toBeInTheDocument();
    expect(screen.getByText("Khám phá câu lạc bộ")).toBeInTheDocument();
  });

  it("xin gia nhập CLB chuyển nút sang 'Đã gửi yêu cầu'", () => {
    render(<ClubsPage />);
    fireEvent.click(screen.getAllByRole("button", { name: "Xin gia nhập" })[0]!);
    expect(screen.getByRole("button", { name: "Đã gửi yêu cầu" })).toBeDisabled();
  });

  it("switches to HLV & Coach tab and displays personalized matchmaker and coaches", () => {
    render(<ClubsPage />);

    // Click on "HLV & Coach" tab
    const coachTabButton = screen.getByRole("tab", { name: "Huấn luyện viên" });
    fireEvent.click(coachTabButton);

    // Verify Coaching Section header is rendered
    expect(screen.getByText("Huấn Luyện Viên 1:1 & Ghép Nhóm Tập Luyện")).toBeInTheDocument();
    expect(screen.getByText("Ghép Đôi Huấn Luyện Viên Cá Nhân Hoá")).toBeInTheDocument();

    // Verify coach cards are shown
    expect(screen.getByText("Hoàng Minh Long (Alex)")).toBeInTheDocument();
    expect(screen.getByText("Nguyễn Mai Linh")).toBeInTheDocument();
  });

  it("allows switching filter mode from 1:1 to Nhóm Squad in coaching tab", () => {
    render(<ClubsPage />);

    // Switch to coaching tab
    fireEvent.click(screen.getByRole("tab", { name: "Huấn luyện viên" }));

    // Click on "Hỗ trợ Nhóm (Tiết kiệm 60%)" filter button
    const groupFilterBtn = screen.getByText("Hỗ trợ Nhóm (Tiết kiệm 60%)");
    fireEvent.click(groupFilterBtn);

    // Verify cards are still rendered and group benefits are visible
    expect(screen.getAllByText(/Gói Nhóm/i).length).toBeGreaterThan(0);
  });
});
