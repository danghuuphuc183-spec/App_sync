import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import ProfilePage from "./page";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("@/context/auth-context", () => ({
  useAuth: () => ({
    user: {
      id: "u-minhthu",
      name: "Hữu Phúc Đặng",
      handle: "danghuuphuc183",
      avatar: "",
      sportsProfile: {
        preferredArea: "Bình Thạnh & Q.2 Sala, TP.HCM",
        runningPace: "5:30 - 5:45/km",
      },
    },
    logout: vi.fn(),
  }),
}));

describe("Hồ sơ & Profile Page with Club Management and Role Permissions", () => {
  it("renders profile header and 4 balanced quick action buttons including Club Management", () => {
    render(<ProfilePage />);

    expect(screen.getByRole("heading", { name: "Hồ sơ" })).toBeInTheDocument();
    expect(screen.getByText("Hữu Phúc Đặng")).toBeInTheDocument();
    expect(screen.getByText(/@danghuuphuc183/i)).toBeInTheDocument();

    // Check 4 balanced quick action buttons
    expect(screen.getByText("Lịch")).toBeInTheDocument();
    expect(screen.getByText("Kèo")).toBeInTheDocument();
    expect(screen.getByText("QL CLB")).toBeInTheDocument();
    expect(screen.getByText("Xu")).toBeInTheDocument();
  });

  it("renders orderly Club Management & Fund Hub for Club Leader and hides it for normal Member", () => {
    render(<ProfilePage />);

    // DEFAULT VIEW IS CLUB LEADER:
    // Should display Club Leader Hub with 12.450.000đ fund balance
    expect(screen.getByText("Quản lý CLB & Quỹ")).toBeInTheDocument();
    expect(screen.getByText("Trưởng CLB")).toBeInTheDocument();
    expect(screen.getByText("12.450.000đ")).toBeInTheDocument();
    expect(screen.getByText(/41\/50 đã nộp/i)).toBeInTheDocument();
    expect(screen.getByText(/Tiến độ thu 82%/i)).toBeInTheDocument();

    // Switch to normal Member view
    const switchRoleBtn = screen.getByText("Xem vai Member");
    fireEvent.click(switchRoleBtn);

    // NORMAL MEMBER VIEW:
    // Fund numbers MUST BE HIDDEN
    expect(screen.queryByText("12.450.000đ")).not.toBeInTheDocument();
    expect(screen.queryByText(/41\/50 đã nộp/i)).not.toBeInTheDocument();
    expect(screen.getByText(/Không thấy quỹ/i)).toBeInTheDocument();
    expect(screen.getByText("CLB")).toBeInTheDocument();
  });
});
