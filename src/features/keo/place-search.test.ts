import { describe, it, expect } from "vitest";
import { normalizeVi, searchPlaces } from "./place-search";
import { DEFAULT_POSITION } from "./keo.data";

describe("Tìm địa điểm", () => {
  it("bỏ dấu tiếng Việt, kể cả chữ đ", () => {
    expect(normalizeVi("  Kênh Nhiêu Lộc  Đa Kao ")).toBe("kenh nhieu loc da kao");
  });

  it("gõ không dấu vẫn ra đúng cung đường chạy", () => {
    const hits = searchPlaces("running", "nhieu loc", DEFAULT_POSITION);
    expect(hits[0]?.place.name).toMatch(/Nhiêu Lộc/);
  });

  it("tìm theo quận: mọi kết quả đều ở khu vực đó", () => {
    const hits = searchPlaces("pickleball", "binh thanh", DEFAULT_POSITION);
    expect(hits.length).toBeGreaterThan(0);
    for (const h of hits) expect(normalizeVi(h.place.area)).toContain("binh thanh");
  });

  it("tên bắt đầu bằng từ khoá xếp trước; từ khoá rỗng hoặc không khớp → rỗng", () => {
    expect(searchPlaces("running", "   ", DEFAULT_POSITION)).toEqual([]);
    expect(searchPlaces("running", "xyz khong co", DEFAULT_POSITION)).toEqual([]);
    const hits = searchPlaces("running", "landmark", DEFAULT_POSITION);
    expect(normalizeVi(hits[0]!.place.name).startsWith("landmark")).toBe(true);
  });
});
