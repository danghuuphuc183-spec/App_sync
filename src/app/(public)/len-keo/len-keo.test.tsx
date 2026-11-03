import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import LenKeoPage from "./page";

describe("LenKeoPage - Athletic Partner Matching (No Tinder)", () => {
  it("render hồ sơ vận động viên với Khung năng lực, Thói quen, Khu vực và các nút hành động", () => {
    render(<LenKeoPage />);

    // Kiểm tra tiêu đề trang
    expect(screen.getByText("Ghép Đôi & Lên Lịch Tập")).toBeInTheDocument();

    // Kiểm tra thông tin VĐV đầu tiên: Hoàng Nam, 24 tuổi, Bình Thạnh
    expect(screen.getAllByText("Hoàng Nam").length).toBeGreaterThan(0);
    expect(screen.getByText(/24 tuổi • Nam/i)).toBeInTheDocument();
    expect(screen.getByText(/Bờ Kè Thanh Đa & Khuôn Viên Landmark 81/i)).toBeInTheDocument();

    // Kiểm tra Khung Năng Lực (Pace, Cự ly, Cấp độ, Điểm thể lực)
    expect(screen.getByText(/Khung Năng Lực & Thể Lực/i)).toBeInTheDocument();
    expect(screen.getByText("Pace 5:30 - 5:45/km")).toBeInTheDocument();
    expect(screen.getByText("21.1 km (Half Marathon)")).toBeInTheDocument();

    // Kiểm tra Thói quen & Sở thích
    expect(screen.getByText(/Thói Quen & Sở Thích Tập Luyện/i)).toBeInTheDocument();
    expect(screen.getByText(/05:30 AM Sáng sớm/i)).toBeInTheDocument();
    expect(screen.getByText(/Nghe Podcast/i)).toBeInTheDocument();

    // Kiểm tra các nút hành động cốt lõi
    expect(screen.getByRole("button", { name: /Bắt Đầu Tập Cùng/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Tạo Lịch Hẹn/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Nhắn Tin Instagram/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Lướt Người Khác/i })).toBeInTheDocument();
  });

  it("cho phép lướt sang người tiếp theo và hiển thị VĐV tiếp theo", () => {
    render(<LenKeoPage />);

    // Bấm 'Lướt Người Khác'
    const nextBtn = screen.getByRole("button", { name: /Lướt Người Khác/i });
    fireEvent.click(nextBtn);

    // Chuyển sang VĐV Thuỳ Dung (Gym, 23 tuổi)
    expect(screen.getAllByText("Thuỳ Dung").length).toBeGreaterThan(0);
    expect(screen.getByText(/23 tuổi • Nữ/i)).toBeInTheDocument();
    expect(screen.getByText(/Pace 6:15 - 6:30\/km/i)).toBeInTheDocument();
  });

  it("mở modal Tạo Lịch Hẹn và xác nhận trả về thông tin Địa Chỉ và Thời Gian cụ thể", () => {
    render(<LenKeoPage />);

    // Bấm nút Tạo Lịch Hẹn
    const appointmentBtn = screen.getByRole("button", { name: /Tạo Lịch Hẹn/i });
    fireEvent.click(appointmentBtn);

    // Modal hiển thị trường thời gian & địa chỉ
    expect(screen.getByText(/Tạo Lịch Hẹn Với Hoàng Nam/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Thời gian & Ngày hẹn cụ thể/i)).toBeInTheDocument();
    expect(screen.getByText(/Địa chỉ điểm hẹn tập/i)).toBeInTheDocument();

    // Xác nhận hẹn
    const confirmBtn = screen.getByRole("button", { name: /Xác Nhận Hẹn/i });
    fireEvent.click(confirmBtn);

    // Banner xác nhận hiển thị địa chỉ & thời gian rõ ràng
    expect(screen.getByText(/Lịch Hẹn Tập Đã Xác Nhận!/i)).toBeInTheDocument();
    expect(screen.getByText(/Thời gian:/i)).toBeInTheDocument();
    expect(screen.getByText(/Địa chỉ:/i)).toBeInTheDocument();
    expect(screen.getByText(/Mở Chat Instagram Với Hoàng Nam/i)).toBeInTheDocument();
  });
});
