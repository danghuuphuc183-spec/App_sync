import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { TierBadge } from "./tier-badge";
import { TrustMeter } from "./trust-meter";
import { SportCard } from "./sport-card";
import { EmptyState } from "./empty-state";
import { ErrorState } from "./error-state";
import { FormField } from "./form-field";
import { Input } from "@/components/ui/input";

describe("Shared UI Components", () => {
  describe("TierBadge", () => {
    it("render có chữ 'Hạng Đồng' và điểm số", () => {
      render(<TierBadge score={50} showScore />);
      expect(screen.getByText(/Hạng Đồng/i)).toBeInTheDocument();
      expect(screen.getByText(/\(50\)/i)).toBeInTheDocument();
    });

    it("render đúng Hạng Kim Cương cho điểm 140", () => {
      render(<TierBadge score={140} />);
      expect(screen.getByText(/Hạng Kim Cương/i)).toBeInTheDocument();
    });
  });

  describe("TrustMeter", () => {
    it("hiển thị đúng điểm hiện tại, điểm khả dụng và điểm đang giữ (hold)", () => {
      render(<TrustMeter currentScore={100} heldScore={20} />);
      expect(screen.getAllByText("100").length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText(/Khả dụng: 80/i)).toBeInTheDocument();
      expect(screen.getByText(/Đang cọc: 20/i)).toBeInTheDocument();
      expect(screen.getByRole("region", { name: /Thanh đo Điểm Uy Tín/i })).toBeInTheDocument();
    });
  });

  describe("SportCard", () => {
    it("môn active hiển thị nút 'Chọn môn này'", () => {
      render(
        <SportCard
          id="sp-1"
          slug="chay-bo"
          nameVi="Chạy bộ"
          category="endurance"
          verificationMode="auto_api"
          phase={1}
          isActive={true}
        />
      );
      expect(screen.getByText("Chạy bộ")).toBeInTheDocument();
      expect(screen.getByRole("link", { name: /Chọn môn này/i })).toBeInTheDocument();
    });

    it("môn inactive hiển thị nhãn 'Sắp ra mắt' và không có link chọn", () => {
      render(
        <SportCard
          id="sp-2"
          slug="dap-xe"
          nameVi="Đạp xe"
          category="endurance"
          verificationMode="qr_only"
          phase={2}
          isActive={false}
        />
      );
      expect(screen.getByText("Đạp xe")).toBeInTheDocument();
      expect(screen.getByText(/Sắp ra mắt/i)).toBeInTheDocument();
      expect(screen.queryByRole("link", { name: /Chọn môn này/i })).not.toBeInTheDocument();
    });
  });

  describe("EmptyState & ErrorState", () => {
    it("EmptyState kích hoạt onAction khi bấm nút", () => {
      const handleAction = vi.fn();
      render(
        <EmptyState
          title="Không có kèo"
          description="Chưa có ai tạo kèo"
          actionLabel="Tạo kèo"
          onAction={handleAction}
        />
      );
      expect(screen.getByText("Không có kèo")).toBeInTheDocument();
      fireEvent.click(screen.getByRole("button", { name: /Tạo kèo/i }));
      expect(handleAction).toHaveBeenCalledTimes(1);
    });

    it("ErrorState kích hoạt onRetry khi bấm nút thử lại", () => {
      const handleRetry = vi.fn();
      render(
        <ErrorState
          title="Lỗi tải dữ liệu"
          message="Vui lòng thử lại"
          onRetry={handleRetry}
          retryLabel="Thử lại ngay"
        />
      );
      expect(screen.getByRole("alert")).toBeInTheDocument();
      fireEvent.click(screen.getByRole("button", { name: /Thử lại ngay/i }));
      expect(handleRetry).toHaveBeenCalledTimes(1);
    });
  });

  describe("FormField", () => {
    it("liên kết aria-describedby với hint và error id", () => {
      render(
        <FormField
          id="test-input"
          label="Tên của bạn"
          required
          hint="Gợi ý nhập liệu"
          error="Trường này bắt buộc"
        >
          {(props) => <Input {...props} />}
        </FormField>
      );

      const input = screen.getByRole("textbox", { name: /Tên của bạn/i });
      expect(input).toHaveAttribute("aria-invalid", "true");
      expect(input.getAttribute("aria-describedby")).toContain("test-input-error");
      expect(input.getAttribute("aria-describedby")).toContain("test-input-hint");
      expect(screen.getByRole("alert")).toHaveTextContent("Trường này bắt buộc");
    });
  });
});
