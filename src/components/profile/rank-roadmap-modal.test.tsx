import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { RankRoadmapModal } from "./rank-roadmap-modal";

describe("RankRoadmapModal Component", () => {
  it("không hiển thị khi isOpen = false", () => {
    const { container } = render(<RankRoadmapModal isOpen={false} onClose={() => {}} />);
    expect(container.firstChild).toBeNull();
  });

  it("hiển thị thông tin Cấp 2 · Runner chuẩn Master Spec khi mở", () => {
    render(
      <RankRoadmapModal
        isOpen={true}
        onClose={() => {}}
        currentExp={1240}
        currentUt={8.5}
      />
    );

    // Tiêu đề modal
    expect(screen.getByText("Lộ Trình Rank & Điểm Thưởng EXP")).toBeDefined();
    // Rank hiện tại
    expect(screen.getByText("Cấp 2 · Thành Viên Chính Thức")).toBeDefined();
    // Số EXP
    expect(screen.getAllByText(/1\.240 EXP/).length).toBeGreaterThanOrEqual(1);
    // Số EXP còn thiếu
    expect(screen.getByText(/Thiếu 760 EXP/)).toBeDefined();
    // Trạng thái UT kiểm soát chéo
    expect(screen.getByText(/8\.5\/10 UT/)).toBeDefined();
    expect(screen.getByText(/Đủ chuẩn UT ≥ 7/)).toBeDefined();
  });

  it("chuyển tab xem cách kiếm EXP ngắn gọn", () => {
    render(
      <RankRoadmapModal
        isOpen={true}
        onClose={() => {}}
        currentExp={1240}
        currentUt={8.5}
      />
    );

    const earnTabBtn = screen.getByText("Cách Kiếm EXP");
    fireEvent.click(earnTabBtn);

    // Nội dung công thức
    expect(screen.getByText("Buổi tập hợp lệ")).toBeDefined();
    expect(screen.getByText(/Duy trì Chuỗi Tuần/)).toBeDefined();
    expect(screen.getByText(/Chuỗi Đôi \(Duo\) hoặc Host nhóm/)).toBeDefined();
    expect(screen.getByText(/350 – 400 EXP \/ tuần/)).toBeDefined();
  });

  it("chuyển tab phần thưởng và bấm mở Cửa hàng đổi quà", () => {
    const handleOpenRewards = vi.fn();
    const handleClose = vi.fn();

    render(
      <RankRoadmapModal
        isOpen={true}
        onClose={handleClose}
        currentExp={1240}
        currentUt={8.5}
        onOpenRewardsModal={handleOpenRewards}
      />
    );

    const perksTabBtn = screen.getByText("Kho Quà Đổi EXP");
    fireEvent.click(perksTabBtn);

    expect(screen.getByText("Tầng 1: Giải Nhiệt F&B")).toBeDefined();
    expect(screen.getByText("Tầng 4: Hiện Vật Độc Quyền Synesis")).toBeDefined();

    const ctaBtn = screen.getByText("Vào Cửa Hàng Đổi Quà (Xu & EXP)");
    fireEvent.click(ctaBtn);

    expect(handleClose).toHaveBeenCalled();
    expect(handleOpenRewards).toHaveBeenCalled();
  });

  it("cho phép bấm vào huy hiệu cấp khác để xem quyền lợi chi tiết", () => {
    render(
      <RankRoadmapModal
        isOpen={true}
        onClose={() => {}}
        currentExp={1240}
        currentUt={8.5}
      />
    );

    // Bấm xem Cấp 4 (Iron Core)
    const cap4Btn = screen.getByText("Cấp 4");
    fireEvent.click(cap4Btn);

    expect(screen.getByText("Rank 4: IRON CORE")).toBeDefined();
    expect(screen.getByText("Kỷ Luật Thép")).toBeDefined();
    expect(screen.getByText("Kho Quà Tầng 3 & 4")).toBeDefined();
  });
});
