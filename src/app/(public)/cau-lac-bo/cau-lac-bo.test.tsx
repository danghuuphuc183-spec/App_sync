import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import ClubsPage from "./page";

describe("ClubsPage & Coaching Integration", () => {
  it("renders clubs page and displays the new HLV & Coach tab", () => {
    render(<ClubsPage />);

    expect(screen.getByText("Nhóm & CLB")).toBeInTheDocument();
    expect(screen.getByText("HLV & Coach")).toBeInTheDocument();
  });

  it("switches to HLV & Coach tab and displays personalized matchmaker and coaches", () => {
    render(<ClubsPage />);

    // Click on "HLV & Coach" tab
    const coachTabButton = screen.getByText("HLV & Coach");
    fireEvent.click(coachTabButton);

    // Verify Coaching Section header is rendered
    expect(screen.getByText("Huấn Luyện Viên 1:1 & Ghép Nhóm Tập Luyện")).toBeInTheDocument();
    expect(screen.getByText("Ghép Đôi Huấn Luyện Viên Cá Nhân Hoá")).toBeInTheDocument();

    // Verify coach cards are shown
    expect(screen.getByText("Hoàng Minh Long (Alex)")).toBeInTheDocument();
    expect(screen.getByText("Nguyễn Mai Linh")).toBeInTheDocument();
  });

  it("allows switching filter mode from 1:1 to Nhóm Squad in coaching tab", () => {
    render(<ClubsPage />);

    // Switch to coaching tab
    fireEvent.click(screen.getByText("HLV & Coach"));

    // Click on "Hỗ trợ Nhóm (Tiết kiệm 60%)" filter button
    const groupFilterBtn = screen.getByText("Hỗ trợ Nhóm (Tiết kiệm 60%)");
    fireEvent.click(groupFilterBtn);

    // Verify cards are still rendered and group benefits are visible
    expect(screen.getAllByText(/Gói Nhóm/i).length).toBeGreaterThan(0);
  });
});
