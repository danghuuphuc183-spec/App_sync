/**
 * CHI TIẾT BUỔI TẬP THEO MÔN — chỉ giữ thông tin cốt lõi của từng môn (2–3 trường).
 * Trường đầu tiên của mỗi môn luôn có giá trị mặc định → form hợp lệ ngay, người dùng chỉ chỉnh nếu cần.
 */

export interface DetailField {
  id: string;
  label: string;
  options: string[];
  /** chọn được nhiều (vd. nhóm cơ gym) */
  multi?: boolean;
  /** giá trị mặc định khi chọn môn */
  initial: string[];
}

/** Giá trị đã chọn: id trường → các lựa chọn */
export type SessionDetails = Record<string, string[]>;

const LEVEL: DetailField = { id: "level", label: "Trình độ", options: ["Mới chơi", "Trung bình", "Khá", "Giỏi"], initial: ["Trung bình"] };
const RACKET_FORMAT: DetailField = { id: "format", label: "Hình thức", options: ["Đánh đơn", "Đánh đôi", "Tập kỹ thuật"], initial: ["Đánh đôi"] };

export const SESSION_FIELDS: Record<string, DetailField[]> = {
  running: [
    { id: "distance", label: "Cự ly", options: ["3 km", "5 km", "10 km", "15 km", "21 km"], initial: ["5 km"] },
    { id: "pace", label: "Pace", options: ["Dưới 5:00", "5:00–6:00", "6:00–7:00", "Trên 7:00"], initial: ["6:00–7:00"] },
    { id: "style", label: "Kiểu chạy", options: ["Chạy nhẹ", "Chạy dài", "Tempo", "Interval"], initial: ["Chạy nhẹ"] },
  ],
  gym: [
    {
      id: "muscle",
      label: "Nhóm cơ",
      options: ["Ngực", "Lưng", "Vai", "Tay", "Chân", "Mông", "Bụng", "Toàn thân"],
      multi: true,
      initial: ["Ngực"],
    },
    { id: "load", label: "Mức tạ", options: ["Nhẹ · 15+ lần", "Trung · 8–12 lần", "Nặng · 1–6 lần"], initial: ["Trung · 8–12 lần"] },
    { id: "spot", label: "Cần người đỡ tạ", options: ["Có", "Không"], initial: ["Không"] },
  ],
  cycling: [
    { id: "distance", label: "Cự ly", options: ["20 km", "40 km", "60 km", "100 km"], initial: ["40 km"] },
    { id: "speed", label: "Tốc độ", options: ["Dưới 20 km/h", "20–25 km/h", "25–30 km/h", "Trên 30 km/h"], initial: ["20–25 km/h"] },
    { id: "style", label: "Kiểu đạp", options: ["Đạp chơi", "Đạp đều", "Leo dốc"], initial: ["Đạp đều"] },
  ],
  pickleball: [LEVEL, RACKET_FORMAT],
  badminton: [LEVEL, RACKET_FORMAT],
  table_tennis: [LEVEL, { ...RACKET_FORMAT, initial: ["Đánh đơn"] }],
  football: [{ id: "pitch", label: "Loại sân", options: ["Sân 5", "Sân 7", "Sân 11"], initial: ["Sân 7"] }, LEVEL],
  basketball: [{ id: "format", label: "Hình thức", options: ["3x3", "5x5", "Tập ném"], initial: ["3x3"] }, LEVEL],
};

export const fieldsForSport = (sport: string): DetailField[] => SESSION_FIELDS[sport] ?? [];

export function defaultDetails(sport: string): SessionDetails {
  return Object.fromEntries(fieldsForSport(sport).map((f) => [f.id, [...f.initial]]));
}

/** Chọn / bỏ chọn một lựa chọn. Trường chọn một: luôn giữ đúng 1 giá trị. Trường chọn nhiều: phải còn ít nhất 1. */
export function toggleDetail(details: SessionDetails, field: DetailField, option: string): SessionDetails {
  const cur = details[field.id] ?? [];
  if (!field.multi) return { ...details, [field.id]: [option] };
  const next = cur.includes(option) ? cur.filter((o) => o !== option) : [...cur, option];
  return { ...details, [field.id]: next.length ? next : cur };
}

/** Đủ mọi trường của môn (mỗi trường ≥ 1 lựa chọn) */
export function isDetailsComplete(sport: string, details: SessionDetails | undefined): boolean {
  return fieldsForSport(sport).every((f) => (details?.[f.id]?.length ?? 0) > 0);
}

/** "10 km · Pace 5:00–6:00 · Tempo" — dùng trên thẻ kèo & màn xác nhận */
export function summarizeDetails(sport: string, details: SessionDetails | undefined): string {
  if (!details) return "";
  return fieldsForSport(sport)
    .map((f) => {
      const v = details[f.id];
      if (!v?.length) return "";
      if (f.id === "pace") return `Pace ${v.join(", ")}/km`;
      if (f.id === "spot") return v[0] === "Có" ? "Cần người đỡ tạ" : "";
      if (f.id === "load") return `Tạ ${v.join(", ").toLowerCase()}`;
      return v.join(", ");
    })
    .filter(Boolean)
    .join(" · ");
}
