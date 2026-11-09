import * as React from "react";
import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import { HomeFeed } from "./home-feed";
import { INITIAL_FEED } from "@/features/feed/feed.data";
import type { FeedPost } from "@/features/feed/feed.types";

function Harness() {
  const [posts, setPosts] = React.useState<FeedPost[]>(INITIAL_FEED);
  return <HomeFeed posts={posts} setPosts={setPosts} searchQuery="" onCreatePost={() => undefined} />;
}

const firstPost = () => screen.getByRole("article", { name: "Bài viết của Minh Anh" });

describe("HomeFeed", () => {
  beforeEach(() => window.localStorage.clear());

  it("bài viết có tên, thời gian, nội dung, ảnh quãng đường, địa điểm và like/comment/share", () => {
    render(<Harness />);
    const post = firstPost();
    expect(within(post).getAllByRole("link", { name: /Minh Anh/ })[0]).toHaveAttribute("href", "/nguoi-dung/minhanh_run");
    expect(within(post).getByText("15 phút trước")).toBeInTheDocument();
    expect(within(post).getByText(/10km quanh bờ kè Thanh Đa/)).toBeInTheDocument();
    expect(within(post).getByRole("img", { name: /Bản đồ quãng đường/ })).toBeInTheDocument();
    expect(within(post).getByRole("button", { name: "Thích" })).toBeInTheDocument();
    expect(within(post).getByRole("button", { name: "Bình luận" })).toBeInTheDocument();
    expect(within(post).getByRole("button", { name: "Chia sẻ" })).toBeInTheDocument();
  });

  it("thích bài viết tăng số lượt thích", () => {
    render(<Harness />);
    const likeBtn = within(firstPost()).getByRole("button", { name: "Thích" });
    expect(likeBtn).toHaveTextContent("42");
    fireEvent.click(likeBtn);
    expect(within(firstPost()).getByRole("button", { name: "Bỏ thích" })).toHaveTextContent("43");
  });

  it("menu 3 chấm: theo dõi, lưu, ẩn người dùng → có thể hoàn tác", () => {
    render(<Harness />);
    fireEvent.click(within(firstPost()).getByRole("button", { name: "Tuỳ chọn bài viết" }));
    expect(screen.getByText("Theo dõi Minh Anh")).toBeInTheDocument();
    expect(screen.getByText("Lưu bài viết")).toBeInTheDocument();
    fireEvent.click(screen.getByText("Ẩn người dùng này"));

    expect(screen.queryByRole("article", { name: "Bài viết của Minh Anh" })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Hoàn tác" }));
    expect(firstPost()).toBeInTheDocument();
  });

  it("quảng cáo có nhãn 'Được tài trợ' và tuỳ chọn 'Ẩn quảng cáo'", () => {
    render(<Harness />);
    const ad = screen.getByRole("article", { name: "Bài viết của HydroPlus Điện Giải" });
    expect(within(ad).getByText("Được tài trợ")).toBeInTheDocument();
    fireEvent.click(within(ad).getByRole("button", { name: "Tuỳ chọn bài viết" }));
    fireEvent.click(screen.getByText("Ẩn quảng cáo"));
    expect(screen.getByText("Đã ẩn quảng cáo này.")).toBeInTheDocument();
  });

  it("có dải Reels dẫn tới trang reels", () => {
    render(<Harness />);
    expect(screen.getByRole("link", { name: "Xem tất cả" })).toHaveAttribute("href", "/reels");
  });
});
