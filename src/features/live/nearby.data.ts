import { offsetMeters, type LatLng, type NearbyAthlete } from "./live-session";

const img = (id: string) => `https://images.unsplash.com/${id}?w=200&auto=format&fit=crop&q=80`;

interface Profile {
  id: string;
  name: string;
  avatar: string;
  level: 1 | 2 | 3 | 4;
  focus: Record<"route" | "venue", string>;
  trustScore: number;
  /** Lệch so với điểm tập, đơn vị mét (đông, bắc) */
  offset: [number, number];
  startedMinAgo: number;
  acceptsInvites: boolean;
}

const PROFILES: Profile[] = [
  {
    id: "live-giahuy",
    name: "Gia Huy",
    avatar: img("photo-1539571696357-5a69c17a67c6"),
    level: 2,
    focus: { route: "Pace 6:00 · 8 km nhẹ", venue: "Ngực - tay sau" },
    trustScore: 118,
    offset: [140, 90],
    startedMinAgo: 4,
    acceptsInvites: true,
  },
  {
    id: "live-baongoc",
    name: "Bảo Ngọc",
    avatar: img("photo-1524504388940-b1c1722653e1"),
    level: 2,
    focus: { route: "Pace 6:20 · Easy run", venue: "Chân - mông" },
    trustScore: 104,
    offset: [-210, 160],
    startedMinAgo: 9,
    acceptsInvites: true,
  },
  {
    id: "live-tuankiet",
    name: "Tuấn Kiệt",
    avatar: img("photo-1500648767791-00dcc994a43e"),
    level: 3,
    focus: { route: "Interval 400m × 8", venue: "Lưng xô - deadlift" },
    trustScore: 131,
    offset: [420, -260],
    startedMinAgo: 2,
    acceptsInvites: false,
  },
  {
    id: "live-thuydung",
    name: "Thuỳ Dung",
    avatar: img("photo-1494790108377-be9c29b29330"),
    level: 1,
    focus: { route: "Chạy bộ 3 km làm quen", venue: "Cardio nhẹ" },
    trustScore: 96,
    offset: [-80, -330],
    startedMinAgo: 1,
    acceptsInvites: true,
  },
  {
    id: "live-ductrong",
    name: "Đức Trọng",
    avatar: img("photo-1506794778202-cad84cf45f1d"),
    level: 4,
    focus: { route: "Tempo 5:00 · 12 km", venue: "Powerlifting nặng" },
    trustScore: 142,
    offset: [900, 650],
    startedMinAgo: 15,
    acceptsInvites: true,
  },
  {
    id: "live-far",
    name: "Quang Hải",
    avatar: img("photo-1507003211169-0a1dd7228f2d"),
    level: 2,
    focus: { route: "Long run 15 km", venue: "Full body" },
    trustScore: 88,
    offset: [3200, 2400], // ngoài bán kính hiển thị 2 km
    startedMinAgo: 6,
    acceptsInvites: true,
  },
];

/**
 * Dữ liệu mẫu: những người đang check-in tập quanh một điểm.
 * Khi có backend, thay bằng truy vấn theo vị trí (PostGIS ST_DWithin) trên bảng live_sessions.
 */
export function buildNearbyAthletes(spot: LatLng, sport: string, kind: "route" | "venue"): NearbyAthlete[] {
  return PROFILES.map((p) => ({
    id: p.id,
    name: p.name,
    avatar: p.avatar,
    sport,
    level: p.level,
    focus: p.focus[kind],
    trustScore: p.trustScore,
    position: offsetMeters(spot, p.offset[0], p.offset[1]),
    startedMinAgo: p.startedMinAgo,
    acceptsInvites: p.acceptsInvites,
  }));
}
