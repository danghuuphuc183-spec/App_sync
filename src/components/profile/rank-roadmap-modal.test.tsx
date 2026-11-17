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
    expect(screen.getByText("Hành Trình EXP & 6 Bậc Rank")).toBeDefined();
    // Rank hiện tại
    expect(screen.getByText("Cấp 2 · Thành Viên Chính Thức")).toBeDefined();
    // Số EXP
    expect(screen.getByText(/1\.240 \/ 2\.000 EXP/)).toBeDefined();
    // Số EXP còn thiếu
    expect(screen.getByText(/Còn 760 EXP/)).toBeDefined();
    // Trạng thái UT kiểm soát chéo
    expect(screen.getByText(/8\.5\/10 UT/)).toBeDefined();
    expect(screen.getByText(/Đạt chuẩn UT ≥ 7\.0/)).toBeDefined();
  });

  it("chuyển tab xem bí kíp cày EXP và công thức trần tuần", () => {
    render(
      <RankRoadmapModal
        isOpen={true}
        onClose={() => {}}
        currentExp={1240}
        currentUt={8.5}
      />
    );

    const earnTabBtn = screen.getByText("Bí kíp cày EXP & Luật chuỗi");
    fireEvent.click(earnTabBtn);

    // Nội dung công thức
    expect(screen.getByText(/Nguyên Lý Tích Lũy EXP Một Chiều/)).toBeDefined();
    expect(screen.getByText(/3 buổi nhận EXP\/tuần = 300 EXP\/tuần/)).toBeDefined();
    expect(screen.getByText(/Duy trì Chuỗi Tuần \(Weekly Streak\)/)).toBeDefined();
    expect(screen.getByText(/Chuỗi Đôi \(Duo Streak\) hoặc Host nhóm/)).toBeDefined();
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

    const perksTabBtn = screen.getByText("Đổi thưởng & Hiện vật");
    fireEvent.click(perksTabBtn);

    expect(screen.getByText(/Danh Mục Phần Thưởng Đổi Từ EXP & Xu/)).toBeDefined();
    expect(screen.getByText(/Tầng 4: Hiện Vật Độc Quyền Synesis/)).toBeDefined();

    const ctaBtn = screen.getByText("Vào Cửa Hàng Đổi Thưởng Ngay");
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
    expect(screen.getAllByText(/Kỷ Luật Thép/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/Tag 'Iron Core – Kỷ Luật Thép' kèm viền Avatar kim loại/)).toBeDefined();
  });
});
