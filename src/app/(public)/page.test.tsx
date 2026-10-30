import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import HomePage from "./page";

describe("HomePage", () => {
  it("render trang chủ thành công với tiêu đề và các thành phần chính", () => {
    render(<HomePage />);

    // Kiểm tra tiêu đề chính
    expect(screen.getByRole("heading", { level: 1, name: /Khế Ước Kỷ Luật/i })).toBeInTheDocument();

    // Kiểm tra nút chọn môn và làm quiz
    expect(screen.getByRole("link", { name: /Bắt đầu chọn môn/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Làm Quiz gợi ý môn/i })).toBeInTheDocument();

    // Kiểm tra phần Trust Score
    expect(screen.getByText(/Cơ chế Điểm Uy Tín \(0 - 150 TS\)/i)).toBeInTheDocument();

    // Kiểm tra các môn thể thao trọng tâm
    expect(screen.getByText(/Chạy bộ đường dài/i)).toBeInTheDocument();
    expect(screen.getByText(/Tập kháng lực/i)).toBeInTheDocument();
  });
});
