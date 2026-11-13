import type { SessionDetails } from "./session-details";

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
  day: string; // ISO "YYYY-MM-DD" (nhãn cũ "Ngày mai"… vẫn đọc được qua resolveDay)
  from: string; // "05:00"
  to: string; // "07:00"
}

/** Form "Set cá nhân" */
export interface PersonalForm {
  sport: string;
  place: KeoPlace | null;
  time: TimeWindow;
  note: string;
  /** Không còn ô nhập trên form (D31) — mặc định 0, giữ để đọc dữ liệu cũ */
  minTrust: number;
  /** Chi tiết buổi tập theo môn: cự ly, pace, nhóm cơ, mức tạ… */
  details?: SessionDetails;
}

/** Kế hoạch tự tập (Cá nhân — một mình): riêng tư, không hiện trên bảng kèo, không cộng/trừ UT */
export interface SoloPlan {
  id: string;
  sport: string;
  place: KeoPlace;
  time: TimeWindow;
  note: string;
  details?: SessionDetails;
  createdAt: string;
  /** đã mở cho người khác tham gia → id kèo 1:1 được tạo */
  openedAsKeoId?: string;
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
  details?: SessionDetails;
  level?: 1 | 2 | 3 | 4;
  createdAt: string;
  mine?: boolean;
  /** Thành viên không có trong danh bạ (ví dụ người được ghép từ thuật toán) */
  guestProfiles?: Record<string, { name: string; avatar: string }>;
  /** Đề xuất đổi địa điểm (vd. vì mưa dông) — chỉ áp dụng khi MỌI thành viên xác nhận */
  venueChange?: VenueChange;
  /** Người host đã từ chối: bị bỏ khỏi kèo và không còn thấy kèo này (D35) */
  declinedIds?: string[];
  /** Huỷ / đổi lịch vì thời tiết: không trừ UT bên nào */
  weatherWaiver?: boolean;
  status?: "open" | "cancelled";
}

export interface VenueChange {
  to: KeoPlace;
  from: KeoPlace;
  reason: "weather";
  proposedBy: string;
  confirmedBy: string[];
  declinedBy: string[];
  status: "pending" | "accepted" | "declined";
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
