import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import ClubOsPage from "./page";

describe("Club OS", () => {
  beforeEach(() => window.localStorage.clear());

  it("có đủ roster, bảng tin, sự kiện QR, nhóm kín, mời, thu phí", async () => {
    render(<ClubOsPage />);
    expect(await screen.findByText("Quản lý CLB")).toBeInTheDocument();
    expect(screen.getAllByRole("tab").map((t) => t.textContent)).toEqual(["Thành viên", "Bảng tin", "Sự kiện QR", "Nhóm kín", "Mời", "Thu phí"]);
    expect(await screen.findByText("Quốc Hưng")).toBeInTheDocument();
  });

  it("mời bằng CSV chỉ gửi lời mời, số thành viên không đổi", async () => {
    render(<ClubOsPage />);
    expect(await screen.findByText(/6 thành viên/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("tab", { name: /Mời/ }));
    fireEvent.change(screen.getByLabelText("Nội dung CSV"), { target: { value: "Email\na@x.vn\nb@x.vn" } });
    fireEvent.click(screen.getByRole("button", { name: "Gửi 2 lời mời" }));
    expect(screen.getByText(/Đã gửi 2 lời mời/)).toBeInTheDocument();
    expect(screen.getByText(/6 thành viên/)).toBeInTheDocument();
  });

  it("quỹ phạt không bị thu phí nền tảng", async () => {
    render(<ClubOsPage />);
    fireEvent.click(await screen.findByRole("tab", { name: /Thu phí/ }));
    fireEvent.click(screen.getByRole("button", { name: /Quỹ phạt CLB/ }));
    expect(screen.getByText("Giao dịch này không thu phí nền tảng.")).toBeInTheDocument();
  });
});
