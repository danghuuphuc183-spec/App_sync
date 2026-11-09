import type { FeedPost, LatLng, Person } from "./feed.types";

export const SPORT_LABEL: Record<string, string> = {
  running: "Chạy bộ",
  cycling: "Đạp xe",
  gym: "Gym",
  pickleball: "Pickleball",
  badminton: "Cầu lông",
  table_tennis: "Bóng bàn",
  football: "Bóng đá",
  basketball: "Bóng rổ",
  swimming: "Bơi lội",
  yoga: "Yoga",
};

const pad = (n: number) => String(n).padStart(2, "0");

/** Thời gian đăng bài kiểu mạng xã hội: "Vừa xong", "15 phút trước", "Hôm qua lúc 06:10"... */
export function formatPostTime(iso: string, now: Date = new Date()): string {
  const d = new Date(iso);
  const diffMin = Math.floor((now.getTime() - d.getTime()) / 60_000);
  if (diffMin < 1) return "Vừa xong";
  if (diffMin < 60) return `${diffMin} phút trước`;
  const diffH = Math.floor(diffMin / 60);
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  if (d.getTime() >= startOfToday) return `${diffH} giờ trước`;
  if (d.getTime() >= startOfToday - 86_400_000) return `Hôm qua lúc ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  const diffD = Math.floor((startOfToday - d.getTime()) / 86_400_000) + 1;
  if (diffD < 7) return `${diffD} ngày trước`;
  return `${d.getDate()} tháng ${d.getMonth() + 1}${d.getFullYear() !== now.getFullYear() ? `, ${d.getFullYear()}` : ""}`;
}

export function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (n >= 10_000) return `${Math.round(n / 1000)}K`;
  if (n >= 1_000) return `${(n / 1000).toFixed(1).replace(/\.0$/, "")}K`;
  return String(n);
}

/**
 * Chiếu toạ độ GPS vào khung SVG (giữ đúng tỉ lệ, căn giữa).
 * Trả về path "M x,y L x,y ..." cùng điểm đầu/cuối.
 */
export function projectRoute(coords: LatLng[], width: number, height: number, padding = 24, offsetY = 0) {
  if (coords.length === 0) return { d: "", start: [0, 0] as [number, number], end: [0, 0] as [number, number] };
  const lat0 = coords.reduce((s, c) => s + c[0], 0) / coords.length;
  const k = Math.cos((lat0 * Math.PI) / 180);
  const xs = coords.map((c) => c[1] * k);
  const ys = coords.map((c) => -c[0]);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const spanX = maxX - minX || 1e-9;
  const spanY = maxY - minY || 1e-9;
  const scale = Math.min((width - padding * 2) / spanX, (height - padding * 2) / spanY);
  const offX = (width - spanX * scale) / 2;
  const offY = offsetY + (height - spanY * scale) / 2;
  const pts = xs.map((x, i) => [offX + (x - minX) * scale, offY + (ys[i]! - minY) * scale] as [number, number]);
  const d = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
  return { d, start: pts[0]!, end: pts[pts.length - 1]! };
}

export type FeedFilter = "all" | "following" | "clubs" | "invites" | string;

export function filterPosts(
  posts: FeedPost[],
  people: Record<string, Person>,
  opts: { query?: string; filter?: FeedFilter; following?: ReadonlySet<string> }
): FeedPost[] {
  const q = opts.query?.trim().toLowerCase() ?? "";
  const filter = opts.filter ?? "all";
  return posts.filter((p) => {
    const author = people[p.authorId];
    if (q) {
      const hay = [p.caption, author?.name, author?.handle, p.location?.name, p.location?.area, SPORT_LABEL[p.sport], ...(p.tags ?? [])]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      if (!hay.includes(q)) return false;
    }
    switch (filter) {
      case "all":
        return true;
      case "following":
        return !!opts.following?.has(p.authorId);
      case "clubs":
        return author?.kind === "club";
      case "invites":
        return !!p.invite;
      default:
        // lọc theo môn; quảng cáo vẫn được giữ lại nếu cùng môn
        return p.sport === filter;
    }
  });
}
