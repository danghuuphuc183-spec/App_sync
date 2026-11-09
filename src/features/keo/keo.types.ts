export type LatLng = [number, number];
export type TimeSlot = "morning_early" | "noon" | "evening" | "night";

export interface KeoPlace {
  id: string;
  name: string;
  area: string;
  position: LatLng;
  image: string;
}

export interface TimeWindow {
  day: string; // "Hôm nay" | "Ngày mai" | "Thứ Bảy" | "Chủ Nhật"
  from: string; // "05:00"
  to: string; // "07:00"
}

/** Form "Set cá nhân" */
export interface PersonalForm {
  sport: string;
  place: KeoPlace | null;
  time: TimeWindow;
  note: string;
  minTrust: number;
}

/** Form "Set nhóm" — thêm số lượng và số người đã có (hiện diện) */
export interface GroupForm extends PersonalForm {
  capacity: number;
  present: number;
}

export interface Keo {
  id: string;
  kind: "personal" | "group";
  hostId: string;
  title: string;
  sport: string;
  place: KeoPlace;
  time: TimeWindow;
  capacity: number;
  memberIds: string[];
  note: string;
  minTrust: number;
  holdTs: number;
  level?: 1 | 2 | 3 | 4;
  createdAt: string;
  mine?: boolean;
  /** Thành viên không có trong danh bạ (ví dụ người được ghép từ thuật toán) */
  guestProfiles?: Record<string, { name: string; avatar: string }>;
}

export interface Viewer {
  id: string;
  position: LatLng;
  /** Môn yêu thích, theo thứ tự ưu tiên */
  sports: string[];
  level: 1 | 2 | 3 | 4;
  usualSlots: TimeSlot[];
  trustScore: number;
  friendIds: string[];
}
