import { STRAVA_ROUTES } from "@/features/venues/routes.data";
import { SPORTS_VENUES_DATABASE } from "@/features/venues/venues.data";
import { PEOPLE } from "@/features/feed/feed.data";
import type { Keo, KeoPlace, Viewer } from "./keo.types";
import { resolveDay, toIsoDay } from "./keo-date";

const img = (id: string) => `https://images.unsplash.com/${id}?w=800&auto=format&fit=crop&q=80`;

export const SPORT_IMAGE: Record<string, string> = {
  running: img("photo-1552674605-db6ffd4facb5"),
  cycling: img("photo-1485965120184-e220f721d03e"),
  gym: img("photo-1534438327276-14e5300c3a48"),
  pickleball: img("photo-1626224583764-f87db24ac4ea"),
  badminton: img("photo-1626224583764-f87db24ac4ea"),
  table_tennis: img("photo-1609710228159-0fa9bd7c0827"),
  football: img("photo-1574629810360-7efbbe195018"),
  basketball: img("photo-1546519638-68e109498ffc"),
};

export const KEO_SPORTS = ["running", "gym", "pickleball", "badminton", "football", "basketball", "cycling", "table_tennis"];

/** Địa điểm theo môn: cung đường (chạy/đạp) hoặc sân/phòng tập. */
export function placesForSport(sport: string): KeoPlace[] {
  if (sport === "running" || sport === "cycling") {
    return STRAVA_ROUTES.filter((r) => r.sport === sport).map((r) => ({
      id: r.id,
      name: r.name.replace(/^Cung đường /, ""),
      area: r.district,
      position: r.coordinates[0] ?? [10.795, 106.721],
      image: SPORT_IMAGE[sport]!,
    }));
  }
  return SPORTS_VENUES_DATABASE.filter((v) => v.sport === sport).map((v) => ({
    id: v.id,
    name: v.name,
    area: v.district,
    position: [v.lat, v.lng],
    image: SPORT_IMAGE[sport] ?? SPORT_IMAGE.gym!,
  }));
}

const place = (sport: string, id: string): KeoPlace => placesForSport(sport).find((p) => p.id === id) ?? placesForSport(sport)[0]!;
/** Ngày mẫu tính theo hôm nay để kèo mẫu luôn nằm trong tương lai gần */
const seedDay = (label: string) => toIsoDay(resolveDay(label, new Date()));
const ago = (min: number) => new Date(Date.now() - min * 60_000).toISOString();

/** Vị trí mặc định khi chưa có GPS: Bình Thạnh, gần Landmark 81 */
export const DEFAULT_POSITION: [number, number] = [10.7985, 106.7185];

export const DEMO_VIEWER: Viewer = {
  id: "me",
  position: DEFAULT_POSITION,
  sports: ["running", "gym"],
  level: 2,
  usualSlots: ["morning_early", "evening"],
  trustScore: PEOPLE.me?.trustScore ?? 125,
  friendIds: ["hoangnam"],
};

/** Kèo đang mở (dữ liệu mẫu) */
export const SEED_KEOS: Keo[] = [
  {
    id: "k-1",
    kind: "personal",
    hostId: "hoangnam",
    title: "Chạy 10km ven sông, pace 5:45",
    sport: "running",
    place: place("running", "route-run-1"),
    time: { day: seedDay("Ngày mai"), from: "05:30", to: "06:30" },
    capacity: 2,
    memberIds: ["hoangnam"],
    note: "Chạy đều, không bỏ giữa chừng. Sau đó cà phê bến thuyền",
    minTrust: 6.5,
    level: 3,
    createdAt: ago(20),
  },
  {
    id: "k-2",
    kind: "group",
    hostId: "src",
    title: "Chạy nhóm bình minh Ba Son — thiếu 2 người",
    sport: "running",
    place: place("running", "route-run-4"),
    time: { day: seedDay("Ngày mai"), from: "05:15", to: "06:30" },
    capacity: 8,
    memberIds: ["src", "minhanh", "hoangnam", "haiyen", "lanphuong", "ductrong"],
    note: "Pace 6:00 – 6:30, có người dẫn pace. Mang nước theo.",
    minTrust: 5.5,
    level: 2,
    createdAt: ago(45),
  },
  {
    id: "k-3",
    kind: "group",
    hostId: "minhanh",
    title: "Pickleball đôi nam nữ — thiếu 1",
    sport: "pickleball",
    place: place("pickleball", "pck-bt-1"),
    time: { day: seedDay("Hôm nay"), from: "18:00", to: "20:00" },
    capacity: 4,
    memberIds: ["minhanh", "thuydung", "baolong"],
    note: "Trình phong trào, đã thuê sân. Chia tiền sân 60k/người.",
    minTrust: 6,
    level: 2,
    createdAt: ago(90),
  },
  {
    id: "k-4",
    kind: "personal",
    hostId: "thuydung",
    title: "Tìm bạn tập chân buổi tối",
    sport: "gym",
    place: place("gym", "gym-bt-1"),
    time: { day: seedDay("Hôm nay"), from: "19:00", to: "20:30" },
    capacity: 2,
    memberIds: ["thuydung"],
    note: "Squat + RDL, cần người spot. Ưu tiên nữ hoặc người đã tập > 6 tháng.",
    minTrust: 6.5,
    level: 2,
    createdAt: ago(30),
  },
  {
    id: "k-5",
    kind: "group",
    hostId: "ductrong",
    title: "Bóng đá 7 người — thiếu 3",
    sport: "football",
    place: place("football", "fb-bt-2"),
    time: { day: seedDay("Thứ Bảy"), from: "17:00", to: "18:30" },
    capacity: 14,
    memberIds: ["ductrong", "baolong", "tuankiet", "hoangnam", "minhanh", "lanphuong", "haiyen", "thuydung", "src", "irongym", "guest-1"],
    note: "Đá vui, không xô xát. Áo trắng / xanh.",
    minTrust: 4.5,
    level: 2,
    createdAt: ago(200),
  },
  {
    id: "k-6",
    kind: "group",
    hostId: "irongym",
    title: "Deadlift Night — học kỹ thuật cùng HLV",
    sport: "gym",
    place: place("gym", "gym-bt-3"),
    time: { day: seedDay("Ngày mai"), from: "19:00", to: "20:30" },
    capacity: 10,
    memberIds: ["irongym", "ductrong", "thuydung", "baolong"],
    note: "Phù hợp người mới. Mang giày đế bằng.",
    minTrust: 4,
    level: 1,
    createdAt: ago(300),
  },
  {
    id: "k-7",
    kind: "group",
    hostId: "baolong",
    title: "Cầu lông đánh đôi — thiếu 2",
    sport: "badminton",
    place: place("badminton", "bdm-bt-1"),
    time: { day: seedDay("Hôm nay"), from: "19:30", to: "21:00" },
    capacity: 4,
    memberIds: ["baolong", "lanphuong"],
    note: "Trình trung bình, có sẵn cầu.",
    minTrust: 5.5,
    level: 2,
    createdAt: ago(60),
  },
  {
    id: "k-8",
    kind: "personal",
    hostId: "tuankiet",
    title: "Đạp Sala 40km giữ 30 km/h",
    sport: "cycling",
    place: place("cycling", "route-cyc-1"),
    time: { day: seedDay("Chủ Nhật"), from: "05:00", to: "07:00" },
    capacity: 2,
    memberIds: ["tuankiet"],
    note: "Xe road, có đèn. Chạy theo hàng.",
    minTrust: 8,
    level: 4,
    createdAt: ago(400),
  },
  {
    id: "k-9",
    kind: "group",
    hostId: "haiyen",
    title: "Night run Nhiêu Lộc 8km — thiếu 3",
    sport: "running",
    place: place("running", "route-run-3"),
    time: { day: seedDay("Hôm nay"), from: "20:00", to: "21:00" },
    capacity: 6,
    memberIds: ["haiyen", "lanphuong", "minhanh"],
    note: "Chạy nhẹ giải toả, pace 6:30. Có đèn đường suốt tuyến.",
    minTrust: 4.5,
    level: 1,
    createdAt: ago(120),
  },
  {
    id: "k-10",
    kind: "group",
    hostId: "lanphuong",
    title: "Chạy 5K cho người mới ở Phú Mỹ Hưng",
    sport: "running",
    place: place("running", "route-run-5"),
    time: { day: seedDay("Ngày mai"), from: "05:30", to: "06:30" },
    capacity: 5,
    memberIds: ["lanphuong", "thuydung"],
    note: "Chạy chậm, vừa chạy vừa nói chuyện được.",
    minTrust: 3.5,
    level: 1,
    createdAt: ago(500),
  },
  {
    id: "k-11",
    kind: "group",
    hostId: "thuydung",
    title: "Pickleball giao lưu 6 người — thiếu 3",
    sport: "pickleball",
    place: place("pickleball", "pck-bt-1"),
    time: { day: seedDay("Hôm nay"), from: "17:00", to: "18:30" },
    capacity: 6,
    memberIds: ["thuydung", "lanphuong", "baolong"],
    note: "Xoay cặp liên tục, ai mới chơi cũng được hướng dẫn.",
    minTrust: 4.5,
    level: 1,
    createdAt: ago(35),
  },
  {
    id: "k-12",
    kind: "group",
    hostId: "tuankiet",
    title: "Pickleball đôi Thảo Điền — thiếu 2",
    sport: "pickleball",
    place: place("pickleball", "pck-td-1"),
    time: { day: seedDay("Hôm nay"), from: "17:30", to: "19:30" },
    capacity: 4,
    memberIds: ["tuankiet", "haiyen"],
    note: "Đã đặt sân 2 tiếng, trình trung bình khá.",
    minTrust: 6,
    level: 3,
    createdAt: ago(70),
  },
];

export function hostTrust(id: string): number {
  // CLB chưa có điểm riêng → mặc định thang UT 0–10 (trước đây là 140/100 của thang TS cũ)
  return PEOPLE[id]?.trustScore ?? (PEOPLE[id]?.kind === "club" ? 9.5 : 7);
}

export function hostOf(id: string) {
  return PEOPLE[id];
}
