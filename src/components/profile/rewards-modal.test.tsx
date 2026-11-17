import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import * as React from "react";
import { RewardsModal } from "./rewards-modal";
import { setStoredUserExp } from "@/features/rewards/rewards.data";

describe("RewardsModal Component", () => {
  beforeEach(() => {
    localStorage.clear();
    setStoredUserExp(1240);
  });

  it("render đúng giao diện đổi thưởng khi isOpen=true", () => {
    render(<RewardsModal isOpen={true} onClose={vi.fn()} userRankTitle="Cấp 2 · Runner" />);

    expect(screen.getByText("Đổi Thưởng EXP & Hiện Vật")).toBeInTheDocument();
    expect(screen.getByText(/1\.240 EXP/)).toBeInTheDocument();
    expect(screen.getByText("Cấp 2 · Runner")).toBeInTheDocument();
    expect(screen.getByText("Tất cả quà")).toBeInTheDocument();
    expect(screen.getByText("Voucher đối tác (100–500)")).toBeInTheDocument();
    expect(screen.getByText("Hiện vật Synesis (1.000+)")).toBeInTheDocument();
  });

  it("không hiển thị gì khi isOpen=false", () => {
    const { container } = render(<RewardsModal isOpen={false} onClose={vi.fn()} />);
    expect(container.firstChild).toBeNull();
  });

  it("mở bảng xem quy tắc kiếm EXP từ dễ tới khó khi bấm nút", () => {
    render(<RewardsModal isOpen={true} onClose={vi.fn()} />);

    const rulesBtn = screen.getByText("Cách kiếm EXP");
    fireEvent.click(rulesBtn);

    expect(screen.getByText("Lộ Trình Tích Lũy Từ Dễ Tới Khó")).toBeInTheDocument();
    expect(screen.getByText(/1\. Giai đoạn Khởi Động/)).toBeInTheDocument();
    expect(screen.getByText(/2\. Giai đoạn Giữ Nhịp/)).toBeInTheDocument();
    expect(screen.getByText(/3\. Giai đoạn Kỷ Luật/)).toBeInTheDocument();

    const understandBtn = screen.getByText("Tôi Đã Hiểu");
    fireEvent.click(understandBtn);
    expect(screen.queryByText("Lộ Trình Tích Lũy Từ Dễ Tới Khó")).not.toBeInTheDocument();
  });

  it("lọc đúng tab Hiện vật Synesis (1.000+)", () => {
    render(<RewardsModal isOpen={true} onClose={vi.fn()} />);

    const physicalTab = screen.getByText("Hiện vật Synesis (1.000+)");
    fireEvent.click(physicalTab);

    expect(screen.getByText("Bình Nước Thể Thao Synesis Pro (750ml)")).toBeInTheDocument();
    expect(screen.getByText("Áo Tập Thể Thao Synesis Performance Tee")).toBeInTheDocument();
    expect(screen.getByText("Balo / Túi Trống Tập Gym Synesis Duffel Pro")).toBeInTheDocument();
    expect(screen.queryByText("Voucher Giảm 15% Whey Protein & Dinh Dưỡng Thể Thao")).not.toBeInTheDocument();
  });

  it("thực hiện luồng đổi voucher 100 EXP thành công", () => {
    render(<RewardsModal isOpen={true} onClose={vi.fn()} />);

    // Bấm đổi quà đầu tiên (100 EXP)
    const redeemButtons = screen.getAllByRole("button", { name: "Đổi ngay" });
    expect(redeemButtons.length).toBeGreaterThan(0);
    fireEvent.click(redeemButtons[0]!);

    // Hiện modal xác nhận
    expect(screen.getByText("Xác Nhận Đổi Phần Thưởng")).toBeInTheDocument();

    // Bấm xác nhận đổi
    const confirmBtn = screen.getByRole("button", { name: "Xác nhận đổi" });
    fireEvent.click(confirmBtn);

    // Hiện popup chúc mừng thành công với mã code
    expect(screen.getByText("Đổi Quà Thành Công!")).toBeInTheDocument();
    expect(screen.getByText(/Mã Voucher của bạn:/)).toBeInTheDocument();
  });
});
