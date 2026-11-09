import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import { TrainingLog } from "./training-log";

describe("TrainingLog (Ghi nhận tập luyện)", () => {
  beforeEach(() => window.localStorage.clear());

  it("vẽ bản đồ nhiệt 20 tuần × 7 ngày, có nhãn tháng và chú thích Ít → Nhiều", async () => {
    render(<TrainingLog />);
    const grid = await screen.findByRole("grid");
    expect(within(grid).getAllByRole("gridcell")).toHaveLength(140);
    expect(within(screen.getByRole("region", { name: "Ghi nhận tập luyện" })).getAllByText(/^Tháng \d+$/).length).toBeGreaterThanOrEqual(5);
    expect(screen.getByText("Ít")).toBeInTheDocument();
    expect(screen.getByText("Nhiều")).toBeInTheDocument();
    expect(screen.getByText(/Theo ngày trong tuần/)).toBeInTheDocument();
  });

  it("ghi buổi tập hôm nay → ô hôm nay tăng lên 1 và hiện trong chi tiết ngày", async () => {
    render(<TrainingLog />);
    await screen.findByRole("grid");
    const today = screen.getAllByRole("gridcell").find((c) => c.getAttribute("aria-selected") === "true")!;
    expect(today.getAttribute("aria-label")).toMatch(/: 0 buổi/);

    fireEvent.click(screen.getByRole("button", { name: /Ghi buổi tập$/ }));
    fireEvent.click(screen.getByRole("button", { name: /Gym/ }));
    fireEvent.click(screen.getByRole("button", { name: "Lưu buổi tập" }));

    const updated = screen.getAllByRole("gridcell").find((c) => c.getAttribute("aria-selected") === "true")!;
    expect(updated.getAttribute("aria-label")).toMatch(/: 1 buổi/);
    expect(screen.getByText(/Gym · 45 phút/)).toBeInTheDocument();

    // Xoá buổi vừa ghi
    fireEvent.click(screen.getByRole("button", { name: "Xoá buổi tập" }));
    expect(screen.getByText("Chưa có buổi tập nào.")).toBeInTheDocument();
  });

  it("ngày trong tương lai không bấm được", async () => {
    render(<TrainingLog />);
    await screen.findByRole("grid");
    const cells = screen.getAllByRole("gridcell");
    const future = cells.filter((c) => (c as HTMLButtonElement).disabled);
    // Luôn có tối đa 6 ngày tương lai trong tuần hiện tại
    expect(future.length).toBeLessThanOrEqual(6);
  });
});
