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
});
