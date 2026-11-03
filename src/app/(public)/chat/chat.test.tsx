import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import ChatPage from "./page";

describe("ChatPage - Instagram Style Direct Messaging", () => {
  it("render danh sách hội thoại và khung chat Instagram Direct", () => {
    render(<ChatPage />);

    // Kiểm tra tiêu đề header chat
    expect(screen.getByText("Tin Nhắn Đồng Đội")).toBeInTheDocument();

    // Kiểm tra danh sách bạn tập có Hoàng Nam, Thuỳ Dung, Quốc Anh
    expect(screen.getAllByText("Hoàng Nam").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Thuỳ Dung").length).toBeGreaterThan(0);

    // Kiểm tra thẻ lịch hẹn đính kèm (appointment attachment card)
    expect(screen.getByText(/Khế Ước Buổi Chạy Sáng Mai/i)).toBeInTheDocument();
    expect(screen.getByText(/05:30 AM • Cổng Bến Thuyền Landmark 81/i)).toBeInTheDocument();

    // Kiểm tra thanh nhập tin nhắn phong cách Instagram (có placeholder, nút mic, ảnh, tim)
    expect(screen.getByPlaceholderText("Nhắn tin...")).toBeInTheDocument();
  });

  it("cho phép nhập và gửi tin nhắn mới trong khung chat", () => {
    render(<ChatPage />);

    const input = screen.getByPlaceholderText("Nhắn tin...");
    fireEvent.change(input, { target: { value: "Mình đã sẵn sàng chạy sáng mai nhé!" } });

    // Nút Gửi xuất hiện khi có văn bản
    const sendBtn = screen.getByRole("button", { name: /^Gửi$/ });
    fireEvent.click(sendBtn);

    // Tin nhắn xuất hiện trên màn hình
    expect(screen.getByText("Mình đã sẵn sàng chạy sáng mai nhé!")).toBeInTheDocument();
  });
});
