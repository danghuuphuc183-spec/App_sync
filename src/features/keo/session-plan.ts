/**
 * KẾ HOẠCH BUỔI TẬP cho mỗi người được gợi ý (bước "Gợi ý" khi lên kèo cá nhân).
 *
 * Chạy bộ / đạp xe: cung đường (bản đồ) · cự ly · pace chung · thời lượng · giờ bắt đầu–kết thúc · cường độ
 * Gym:              tên phòng tập · nhóm cơ của ngày (chân / ngực / lưng...) · bài tập · số hiệp · giờ · cường độ
 *
 * Giờ bắt đầu = giờ người kia hay tập, kẹp vào khung giờ bạn chọn (để vừa với cả hai).
 */
import type { MatchCandidate } from "@/features/match/candidates.data";
import type { StravaRoute } from "@/features/venues/routes.data";
import type { SportsVenue } from "@/features/venues/venues.data";
import type { TimeWindow } from "./keo.types";
import { toMinutes } from "./keo.algo";
import { resolveDay } from "./keo-date";

const hhmm = (m: number) => `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(Math.round(m % 60)).padStart(2, "0")}`;

/** "05:45 AM Sáng sớm" / "18:30 PM Buổi tối" → phút trong ngày */
export function parsePreferredTime(text: string): number | null {
  const m = text.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
  if (!m) return null;
  let h = Number(m[1]);
  if (m[3]?.toUpperCase() === "PM" && h < 12) h += 12;
  return h * 60 + Number(m[2]);
}

/** Giờ bắt đầu chung: giờ quen của người kia, kẹp trong khung giờ bạn chọn, làm tròn 15 phút */
export function proposeStart(window: TimeWindow, preferred: number | null, durationMin: number) {
  const from = toMinutes(window.from);
  const to = toMinutes(window.to);
  const latest = Math.max(from, to - durationMin);
  const raw = preferred === null ? from : Math.min(Math.max(preferred, from), latest);
  const start = Math.round(raw / 15) * 15;
  return { start: hhmm(start), end: hhmm(start + durationMin), fitsWindow: start + durationMin <= to };
}

export const paceText = (sec: number) => `${Math.floor(sec / 60)}:${String(Math.round(sec % 60)).padStart(2, "0")}/km`;

export type Intensity = "Nhẹ" | "Vừa" | "Cao";

/* ------------------------------------------------------------------ */
/* Chạy bộ / đạp xe                                                     */
/* ------------------------------------------------------------------ */
export interface RunPlan {
  kind: "run";
  route: StravaRoute;
  distanceKm: number;
  pace: string;
  paceNote: string;
  durationMin: number;
  start: string;
  end: string;
  intensity: Intensity;
  intensityNote: string;
}

export function runPlan(route: StravaRoute, candidate: MatchCandidate, window: TimeWindow, myPaceSec = 360): RunPlan {
  if (route.sport === "cycling") {
    const speed = 28;
    const durationMin = Math.round((route.distanceKm / speed) * 60);
    const t = proposeStart(window, parsePreferredTime(candidate.habitsAndPreferences.preferredTime), durationMin);
    return {
      kind: "run",
      route,
      distanceKm: route.distanceKm,
      pace: `~${speed} km/h`,
      paceNote: "Tốc độ nhóm ổn định, đạp theo hàng",
      durationMin,
      ...t,
      intensity: route.difficulty === "Thử thách" ? "Cao" : "Vừa",
      intensityNote: route.difficulty === "Thử thách" ? "Có đoạn kéo tốc, cần xe road" : "Đạp đều, giữ nhịp tim vùng 2–3",
    };
  }
  // Pace chung theo người chậm hơn để hai người chạy cùng nhau được
  const partnerPace = candidate.capabilities.targetPaceSec ?? myPaceSec;
  const shared = Math.max(myPaceSec, partnerPace);
  const durationMin = Math.round((route.distanceKm * shared) / 60) + 10; // + khởi động / giãn cơ
  const t = proposeStart(window, parsePreferredTime(candidate.habitsAndPreferences.preferredTime), durationMin);
  const intensity: Intensity = shared <= 300 ? "Cao" : shared <= 345 ? "Vừa" : "Nhẹ";
  const intensityNote =
    intensity === "Cao" ? "Tempo — thở gấp, nói được vài từ" : intensity === "Vừa" ? "Chạy đều, nhịp tim vùng 3" : "Zone 2 — vừa chạy vừa nói chuyện được";
  return {
    kind: "run",
    route,
    distanceKm: route.distanceKm,
    pace: paceText(shared),
    paceNote: shared > myPaceSec ? "Theo pace của bạn tập" : partnerPace < myPaceSec ? "Theo pace của bạn" : "Pace hai người như nhau",
    durationMin,
    ...t,
    intensity,
    intensityNote,
  };
}

/* ------------------------------------------------------------------ */
/* Gym                                                                  */
/* ------------------------------------------------------------------ */
export interface GymSplit {
  key: "push" | "pull" | "legs" | "full" | "boxing" | "calisthenics";
  label: string;
  muscles: string;
  exercises: string[];
}

export const GYM_SPLITS: Record<GymSplit["key"], GymSplit> = {
  push: { key: "push", label: "Ngày Ngực – Vai – Tay sau", muscles: "Ngực, vai trước, tay sau", exercises: ["Bench press", "Incline dumbbell press", "Overhead press", "Triceps pushdown"] },
  pull: { key: "pull", label: "Ngày Lưng – Tay trước", muscles: "Xô, lưng giữa, tay trước", exercises: ["Deadlift", "Pull-up / Lat pulldown", "Barbell row", "Biceps curl"] },
  legs: { key: "legs", label: "Ngày Chân (Leg day)", muscles: "Đùi trước, đùi sau, mông, bắp chân", exercises: ["Back squat", "Romanian deadlift", "Leg press", "Walking lunge"] },
  full: { key: "full", label: "Ngày Toàn thân", muscles: "Toàn thân", exercises: ["Goblet squat", "Push-up", "Dumbbell row", "Plank"] },
  boxing: { key: "boxing", label: "Ngày Boxing & Thể lực", muscles: "Vai, core, sức bền tim mạch", exercises: ["Nhảy dây 3 hiệp", "Đấm bao cát", "Tập pad cùng bạn", "Burpee"] },
  calisthenics: { key: "calisthenics", label: "Ngày Kéo – Đẩy bodyweight", muscles: "Lưng, ngực, tay, core", exercises: ["Pull-up", "Dips", "Push-up", "Hanging leg raise"] },
};

/** Lịch Push–Pull–Legs theo thứ trong tuần (T2..CN), lệch theo từng người */
const WEEK_SPLIT: GymSplit["key"][] = ["push", "pull", "legs", "push", "pull", "legs", "full"];

export { resolveDay };

const hash = (s: string) => [...s].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);

export function gymSplitFor(candidate: MatchCandidate, day: Date): GymSplit {
  const weekday = (day.getDay() + 6) % 7;
  const style = candidate.sportVi.toLowerCase();
  if (style.includes("boxing") || style.includes("võ")) return GYM_SPLITS.boxing;
  if (style.includes("calisthenics") || style.includes("bodyweight")) return GYM_SPLITS.calisthenics;
  if (candidate.capabilities.level === "Mới Bắt Đầu") return GYM_SPLITS.full;
  return GYM_SPLITS[WEEK_SPLIT[(weekday + (hash(candidate.id) % 3)) % 7]!];
}

export interface GymPlan {
  kind: "gym";
  venue: SportsVenue;
  split: GymSplit;
  sets: string;
  durationMin: number;
  start: string;
  end: string;
  intensity: Intensity;
  intensityNote: string;
}

export function gymPlan(venue: SportsVenue, candidate: MatchCandidate, window: TimeWindow, now = new Date()): GymPlan {
  const split = gymSplitFor(candidate, resolveDay(window.day, now));
  const lvl = candidate.capabilities.level;
  const intensity: Intensity = lvl === "Chuyên Nghiệp" || lvl === "Bán Chuyên" ? "Cao" : lvl === "Phong Trào" ? "Vừa" : "Nhẹ";
  let sets = intensity === "Cao" ? "4–5 hiệp × 5–8 lần · RPE 8" : intensity === "Vừa" ? "4 hiệp × 8–10 lần · RPE 7" : "3 hiệp × 12 lần · tạ nhẹ, đúng form";
  let note = intensity === "Cao" ? "Tạ nặng, cần người spot" : intensity === "Vừa" ? "Tạ vừa sức, nghỉ 90 giây/hiệp" : "Làm quen máy & kỹ thuật";
  if (split.key === "boxing") {
    sets = intensity === "Nhẹ" ? "4 hiệp × 2 phút · nghỉ 1 phút" : "6 hiệp × 3 phút · nghỉ 1 phút";
    note = "Nhịp tim cao — mang găng & băng tay";
  } else if (split.key === "calisthenics") {
    sets = intensity === "Nhẹ" ? "3 hiệp × 6–8 lần (có dây hỗ trợ)" : "4 hiệp × tối đa số lần";
    note = "Giữ form chuẩn, nghỉ 2 phút/hiệp";
  }
  const durationMin = intensity === "Nhẹ" ? 60 : 75;
  const t = proposeStart(window, parsePreferredTime(candidate.habitsAndPreferences.preferredTime), durationMin);
  return {
    kind: "gym",
    venue,
    split,
    sets,
    durationMin,
    ...t,
    intensity,
    intensityNote: note,
  };
}

/* ------------------------------------------------------------------ */
/* Đánh giá địa điểm (cho người mới chưa đăng ký phòng tập)             */
/* ------------------------------------------------------------------ */
export interface VenueReview {
  author: string;
  stars: number;
  text: string;
  when: string;
}

const REVIEW_POOL = [
  { stars: 5, text: "Máy móc mới, khu tạ tự do rộng, giờ cao điểm vẫn có chỗ tập.", author: "Quang Huy" },
  { stars: 5, text: "Nhân viên hỗ trợ người mới nhiệt tình, được hướng dẫn dùng máy miễn phí.", author: "Ngọc Trâm" },
  { stars: 4, text: "Sạch sẽ, có tủ khoá và phòng tắm. Tối 18–20h hơi đông.", author: "Minh Khoa" },
  { stars: 4, text: "Giá vé lẻ hợp lý, phù hợp tập thử trước khi đăng ký tháng.", author: "Thu Hà" },
  { stars: 3, text: "Gửi xe hơi chật vào giờ tan tầm, còn lại ổn.", author: "Đức Anh" },
];

export function venueReviews(venue: SportsVenue): { reviews: VenueReview[]; distribution: number[] } {
  const h = hash(venue.id);
  const reviews = [0, 1, 2].map((i) => {
    const r = REVIEW_POOL[(h + i * 2) % REVIEW_POOL.length]!;
    return { ...r, when: `${(i + 1) * ((h % 5) + 2)} ngày trước` };
  });
  // Phân bố 5★..1★ ước lượng từ điểm trung bình
  const p5 = Math.max(0, Math.min(0.9, (venue.rating - 4) * 1.1 + 0.25));
  const p4 = Math.max(0.05, 0.85 - p5 - 0.1);
  const rest = Math.max(0, 1 - p5 - p4);
  const distribution = [p5, p4, rest * 0.6, rest * 0.25, rest * 0.15].map((p) => Math.round(p * venue.reviewCount));
  return { reviews, distribution };
}
