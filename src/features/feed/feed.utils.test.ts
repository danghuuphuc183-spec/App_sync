import { describe, it, expect } from "vitest";
import { filterPosts, formatCount, formatPostTime, projectRoute } from "./feed.utils";
import { INITIAL_FEED, PEOPLE, findPersonByHandle } from "./feed.data";

const NOW = new Date(2026, 10, 9, 18, 0); // 18:00 9/11/2026

describe("formatPostTime", () => {
  const at = (min: number) => new Date(NOW.getTime() - min * 60_000).toISOString();
  it("vừa xong / phút / giờ", () => {
    expect(formatPostTime(at(0), NOW)).toBe("Vừa xong");
    expect(formatPostTime(at(15), NOW)).toBe("15 phút trước");
    expect(formatPostTime(at(180), NOW)).toBe("3 giờ trước");
  });
  it("hôm qua kèm giờ", () => {
    expect(formatPostTime(new Date(2026, 10, 8, 6, 10).toISOString(), NOW)).toBe("Hôm qua lúc 06:10");
  });
  it("vài ngày trước và ngày cụ thể", () => {
    expect(formatPostTime(new Date(2026, 10, 6, 9, 0).toISOString(), NOW)).toBe("3 ngày trước");
    expect(formatPostTime(new Date(2026, 9, 20, 9, 0).toISOString(), NOW)).toBe("20 tháng 10");
  });
});

describe("formatCount", () => {
  it("rút gọn số lớn", () => {
    expect(formatCount(980)).toBe("980");
    expect(formatCount(4820)).toBe("4.8K");
    expect(formatCount(25600)).toBe("26K");
  });
});

describe("projectRoute", () => {
  it("vẽ path nằm trong khung", () => {
    const { d, start } = projectRoute(
      [
        [10.79, 106.72],
        [10.8, 106.73],
        [10.81, 106.72],
      ],
      300,
      200,
      20
    );
    expect(d.startsWith("M ")).toBe(true);
    const nums = d.match(/-?\d+(\.\d+)?/g)!.map(Number);
    expect(Math.min(...nums)).toBeGreaterThanOrEqual(0);
    expect(Math.max(...nums)).toBeLessThanOrEqual(300);
    expect(start[1]).toBeGreaterThan(start[0] > 0 ? 0 : -1);
  });
});

describe("filterPosts", () => {
  it("tìm theo tên, địa điểm", () => {
    expect(filterPosts(INITIAL_FEED, PEOPLE, { query: "thuỳ dung" }).map((p) => p.id)).toEqual(["fp-2"]);
    expect(filterPosts(INITIAL_FEED, PEOPLE, { query: "sala" }).map((p) => p.id)).toEqual(["fp-4"]);
  });
  it("lọc CLB, kèo, đang theo dõi, theo môn", () => {
    expect(filterPosts(INITIAL_FEED, PEOPLE, { filter: "clubs" }).every((p) => PEOPLE[p.authorId]!.kind === "club")).toBe(true);
    expect(filterPosts(INITIAL_FEED, PEOPLE, { filter: "invites" }).every((p) => !!p.invite)).toBe(true);
    expect(filterPosts(INITIAL_FEED, PEOPLE, { filter: "following", following: new Set(["thuydung"]) }).map((p) => p.id)).toEqual(["fp-2"]);
    expect(filterPosts(INITIAL_FEED, PEOPLE, { filter: "gym" }).every((p) => p.sport === "gym")).toBe(true);
  });
});

describe("dữ liệu", () => {
  it("mọi bài viết và bình luận đều có tác giả hợp lệ", () => {
    for (const p of INITIAL_FEED) {
      expect(PEOPLE[p.authorId]).toBeDefined();
      for (const c of p.comments) expect(PEOPLE[c.authorId]).toBeDefined();
      for (const m of p.media) if (m.type === "route") expect(m.coords.length).toBeGreaterThan(1);
    }
  });
  it("tìm hồ sơ theo handle", () => {
    expect(findPersonByHandle("@hoangnam_run")?.id).toBe("hoangnam");
    expect(findPersonByHandle("khong-ton-tai")).toBeUndefined();
  });
});
