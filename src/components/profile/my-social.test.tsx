import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import { MyConnections, MyPosts, SocialStatsBar } from "./my-social";

describe("Trang Bạn — bài đăng cũ", () => {
  beforeEach(() => window.localStorage.clear());

  it("hiện lưới 6 bài cũ, bấm vào mở bài đầy đủ, chuyển được sang dạng danh sách", () => {
    render(<MyPosts />);
    expect(screen.getByText("Bài đăng của bạn (6)")).toBeInTheDocument();
    const tiles = screen.getAllByRole("button", { name: /^Xem bài:/ });
    expect(tiles).toHaveLength(6);

    fireEvent.click(tiles[0]!);
    expect(screen.getByRole("article", { name: "Bài viết của Minh Thư" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("tab", { name: "Danh sách" }));
    expect(screen.getAllByRole("article", { name: "Bài viết của Minh Thư" }).length).toBeGreaterThanOrEqual(6);
  });
});

describe("Trang Bạn — bạn bè & theo dõi", () => {
  beforeEach(() => window.localStorage.clear());

  it("bạn bè mặc định có Hoàng Nam, đang theo dõi có 3, người theo dõi có thể theo dõi lại", async () => {
    render(<MyConnections />);
    expect(await screen.findByRole("tab", { name: "Bạn bè (1)" })).toBeInTheDocument();
    expect(screen.getByText("Hoàng Nam")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("tab", { name: "Đang theo dõi (3)" }));
    const list = screen.getByRole("list");
    expect(within(list).getAllByRole("listitem")).toHaveLength(3);

    fireEvent.click(screen.getByRole("tab", { name: /Người theo dõi/ }));
    const followBack = screen.getAllByRole("button", { name: "Theo dõi lại" });
    fireEvent.click(followBack[0]!);
    expect(screen.getByRole("tab", { name: "Đang theo dõi (4)" })).toBeInTheDocument();
  });

  it("tìm kiếm trong danh sách", async () => {
    render(<MyConnections initialTab="followers" />);
    fireEvent.change(await screen.findByLabelText("Tìm trong danh sách"), { target: { value: "lan" } });
    expect(within(screen.getByRole("list")).getAllByRole("listitem")).toHaveLength(1);
    expect(screen.getByText("Lan Phương")).toBeInTheDocument();
  });

  it("thanh thống kê hiện đủ 4 số", async () => {
    render(<SocialStatsBar onSelect={() => undefined} />);
    for (const label of ["Bài viết", "Bạn bè", "Đang theo dõi", "Người theo dõi"]) {
      expect(screen.getByText(label)).toBeInTheDocument();
    }
  });
});
