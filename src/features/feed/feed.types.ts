export type LatLng = [number, number];

export type PersonKind = "user" | "club" | "brand";

export interface Person {
  id: string;
  /** Slug dùng trong URL /nguoi-dung/[handle], không có "@" */
  handle: string;
  name: string;
  avatar: string;
  cover: string;
  kind: PersonKind;
  verified?: boolean;
  tier?: "bronze" | "silver" | "gold" | "diamond";
  trustScore?: number;
  bio: string;
  area: string;
  sports: string[];
  stats: { followers: number; following: number; posts: number; weeklyKm?: number; members?: number };
  website?: string;
  isMe?: boolean;
}

export type FeedMedia =
  | { type: "route"; coords: LatLng[]; label: string }
  | { type: "photo"; src: string; alt: string };

export interface FeedComment {
  id: string;
  authorId: string;
  text: string;
  createdAt: string;
}

export interface FeedPost {
  id: string;
  authorId: string;
  createdAt: string;
  caption: string;
  tags?: string[];
  sport: string;
  media: FeedMedia[];
  location?: { name: string; area?: string };
  activity?: {
    distanceKm?: number;
    duration: string;
    pace?: string;
    elevationM?: number;
    calories?: number;
    source?: "Strava" | "Garmin" | "Apple Health" | "SYNC";
  };
  /** Kèo tập mở — người khác có thể "Nhận kèo" */
  invite?: { dateTimeVi: string; locationName: string; intensity: string; slotsLeft: number };
  /** Thử thách của CLB */
  challenge?: { title: string; currentKm: number; targetKm: number; daysLeft: number; participants: number };
  /** Quảng cáo */
  ad?: { headline: string; ctaLabel: string; href: string };
  likes: number;
  shares: number;
  hasLiked?: boolean;
  comments: FeedComment[];
}
