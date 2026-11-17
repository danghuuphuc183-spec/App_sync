import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import DongDoiPage from "./page";

const mockSearchParams = new URLSearchParams();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
  }),
  useSearchParams: () => mockSearchParams,
}));

describe("Đồng đội & Duo Feature Page", () => {
  it("renders the main Đồng đội screen with top personal status and urgent action", () => {
    render(<DongDoiPage />);

    // Header
    expect(screen.getByRole("heading", { name: "Đồng đội" })).toBeInTheDocument();
    expect(screen.getByText("Tập tiếp, giữ chuỗi, cùng tiến bộ")).toBeInTheDocument();

    // Personal card
    expect(screen.getByText("Hạng 3 · Reliable")).toBeInTheDocument();
    expect(screen.getAllByText(/Đúng hẹn 18\/19/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Uy tín tốt")).toBeInTheDocument();
    expect(screen.getByText("1.240 / 3.500 EXP")).toBeInTheDocument();
    expect(screen.getByText("Lên hạng 4 · Elite")).toBeInTheDocument();

    // Urgent card
    expect(screen.getByText("VIỆC CẦN LÀM HÔM NAY")).toBeInTheDocument();
    expect(screen.getByText("Chốt buổi tiếp với Thuý Dung")).toBeInTheDocument();
    expect(screen.getByText(/Chuỗi Duo 7 tuần cần 1 buổi cùng nhau/i)).toBeInTheDocument();
    expect(screen.getByText("Tuần này 0/1 buổi")).toBeInTheDocument();
  });

  it("lists active Duos and opens Duo detail view when clicked", () => {
    render(<DongDoiPage />);

    // Check Duo list item
    expect(screen.getByText("Duo của bạn")).toBeInTheDocument();
    expect(screen.getByText("Thuý Dung")).toBeInTheDocument();
    expect(screen.getByText("Đức Trọng")).toBeInTheDocument();

    // Click on Thuý Dung Duo card
    const thuyDungCard = screen.getByText("Thuý Dung").closest("div[class*='cursor-pointer']");
    expect(thuyDungCard).toBeTruthy();
    fireEvent.click(thuyDungCard!);

    // Should now be on Duo detail screen
    expect(screen.getByText("Duo với Thuý Dung")).toBeInTheDocument();
    expect(screen.getByText("tuần Duo liên tiếp")).toBeInTheDocument();
    expect(screen.getByText("7")).toBeInTheDocument();
    expect(screen.getByText(/Kỷ lục của hai bạn · bắt đầu từ 21\/09/i)).toBeInTheDocument();

    // Check Duo components
    expect(screen.getByText("Tuần này (9–15/11)")).toBeInTheDocument();
    expect(screen.getByText(/Chạy bộ nhẹ 5km · Thứ Bảy 14\/11/i)).toBeInTheDocument();
    expect(screen.getByText(/Lá chắn chuỗi: còn 2\/2 tháng này/i)).toBeInTheDocument();
    expect(screen.getByText("+10 EXP mỗi buổi chung")).toBeInTheDocument();
    expect(screen.getByText("Uy tín hai bên")).toBeInTheDocument();

    // Test back button
    const backBtn = screen.getByLabelText("Quay lại");
    fireEvent.click(backBtn);

    // Returned to main screen
    expect(screen.getByRole("heading", { name: "Đồng đội" })).toBeInTheDocument();
  });

  it("lists small groups and opens Group detail view with member status and rules", () => {
    render(<DongDoiPage />);

    // Check Small Group section
    expect(screen.getByText("Nhóm nhỏ")).toBeInTheDocument();
    expect(screen.getByText("Sáng Thanh Đa")).toBeInTheDocument();
    expect(screen.getByText("5 tuần")).toBeInTheDocument();
    expect(screen.getByText("3/4 người đã tập tuần này")).toBeInTheDocument();

    // Click on group card
    const groupCard = screen.getByText("Sáng Thanh Đa").closest("div[class*='cursor-pointer']");
    expect(groupCard).toBeTruthy();
    fireEvent.click(groupCard!);

    // Should now be on Small Group detail screen
    expect(screen.getByRole("heading", { name: "Sáng Thanh Đa" })).toBeInTheDocument();
    expect(screen.getByText(/Nhóm 5 tuần liên tiếp/i)).toBeInTheDocument();
    expect(screen.getByText(/Mỗi người đã tập nhận \+15 EXP/i)).toBeInTheDocument();

    // Check member rows
    expect(screen.getByText("Bạn")).toBeInTheDocument();
    expect(screen.getByText("Đức Trọng")).toBeInTheDocument();
    expect(screen.getByText("Dẫn nhóm")).toBeInTheDocument();
    expect(screen.getByText("Yến Nhi")).toBeInTheDocument();
    expect(screen.getByText("Minh Anh")).toBeInTheDocument();
    expect(screen.getByText(/3.25 điểm vi phạm/i)).toBeInTheDocument();

    // Next keo and rules
    expect(screen.getByText("KÈO NHÓM TIẾP THEO")).toBeInTheDocument();
    expect(screen.getByText("Xác nhận tham gia")).toBeInTheDocument();
    expect(screen.getByText(/Luật của nhóm nhỏ/i)).toBeInTheDocument();
    expect(screen.getByText(/Lập nhóm từ Hạng 2, dẫn nhóm từ Hạng 3/i)).toBeInTheDocument();

    // Toggle confirm button
    const confirmBtn = screen.getByText("Xác nhận tham gia");
    fireEvent.click(confirmBtn);
    expect(screen.getByText("Đã xác nhận tham gia")).toBeInTheDocument();
  });

  it("switches to CLB & Quỹ tab and renders financial management, fees, and VietQR payment modal", () => {
    render(<DongDoiPage />);

    // Check header category switcher
    const nhomTab = screen.getByRole("tab", { name: /Nhóm tập/i });
    const clbTab = screen.getByRole("tab", { name: /CLB & Quỹ/i });
    expect(nhomTab).toBeInTheDocument();
    expect(clbTab).toBeInTheDocument();

    // Click on CLB & Quỹ tab
    fireEvent.click(clbTab);

    // Should display CLB Fund Financial Hub
    expect(screen.getByText(/Quỹ Sinh Hoạt CLB/i)).toBeInTheDocument();
    expect(screen.getByText("12.450.000đ")).toBeInTheDocument();
    expect(screen.getAllByText("150.000đ").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/41\/50/i)).toBeInTheDocument();
    expect(screen.getAllByText(/82%/i).length).toBeGreaterThanOrEqual(1);

    // Check transparent fee quote breakdown
    expect(screen.getByText(/Phí thành viên đóng:/i)).toBeInTheDocument();
    expect(screen.getByText(/Phí nền tảng SYNESIS/i)).toBeInTheDocument();
    expect(screen.getByText(/Phí cổng đối tác VietQR/i)).toBeInTheDocument();
    expect(screen.getByText(/CLB thực nhận/i)).toBeInTheDocument();

    // Check Club card
    expect(screen.getAllByText(/FTU2 Run Club/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Quản lý Quỹ & CLB")).toBeInTheDocument();

    // Check other clubs & invite code
    expect(screen.getByText("Khám phá CLB Chạy bộ & Gym")).toBeInTheDocument();
    expect(screen.getByText(/Saigon Runners Community/i)).toBeInTheDocument();
    expect(screen.getByText("Gia nhập bằng mã mời CLB")).toBeInTheDocument();
    expect(screen.getByText("BXH Kỷ Luật CLB (Tuần này)")).toBeInTheDocument();

    // Test opening VietQR payment modal
    const payBtn = screen.getByText("Nộp quỹ qua VietQR");
    fireEvent.click(payBtn);

    // Modal should appear
    expect(screen.getByText("Hội phí CLB FTU2 Runners - Quý IV")).toBeInTheDocument();
    expect(screen.getByText(/payOS · VietQR Chuẩn NAPAS/i)).toBeInTheDocument();
    expect(screen.getByText(/Cơ chế Split Payment tự động:/i)).toBeInTheDocument();
    expect(screen.getByText(/Mô phỏng Chuyển khoản thành công/i)).toBeInTheDocument();

    // Close modal
    const closeBtn = screen.getByLabelText("Đóng cửa sổ thanh toán");
    fireEvent.click(closeBtn);
    expect(screen.queryByText("Hội phí CLB FTU2 Runners - Quý IV")).not.toBeInTheDocument();
  });

  it("opens create group modal when clicking '+ Tạo nhóm' button", () => {
    render(<DongDoiPage />);

    // Click on + Tạo nhóm
    const createGroupBtn = screen.getByText("+ Tạo nhóm");
    fireEvent.click(createGroupBtn);

    // Modal should be open
    expect(screen.getByRole("heading", { name: "Tạo Nhóm Tập Mới" })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Runners Sáng Bờ Kè Thanh Đa/i)).toBeInTheDocument();
    expect(screen.getByText(/Thành viên vừa tập chung/i)).toBeInTheDocument();
    expect(screen.getByText("Tạo nhóm ngay")).toBeInTheDocument();
  });
});
