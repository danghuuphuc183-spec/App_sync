/**
 * Chuyển dữ liệu ứng viên sẵn có (CANDIDATES_DATA) sang hồ sơ ghép v2 + tạo hồ sơ của chính bạn từ onboarding.
 * Các trường chưa có trong dữ liệu gốc (lịch rảnh, cách giao tiếp, đỡ tạ...) được suy ra ổn định
 * theo id để dữ liệu mẫu không đổi giữa các lần tải. Khi có backend: đọc trực tiếp từ hồ sơ người dùng.
 */
import type { MatchCandidate } from "./candidates.data";
import {
  DAY_PARTS,
  slotKey,
  type CommStyle,
  type DayPart,
  type FitnessBand,
  type LatLng,
  type PartnerProfile,
  type SessionType,
} from "./partner-match";

const hash = (s: string) => [...s].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 17);

export function offsetKm(p: LatLng, km: number, angleRad: number): LatLng {
  return [p[0] + (km * Math.cos(angleRad)) / 111.32, p[1] + (km * Math.sin(angleRad)) / (111.32 * Math.cos((p[0] * Math.PI) / 180))];
}

const SLOT_TO_PARTS: Record<MatchCandidate["habitsAndPreferences"]["timeSlot"], DayPart[]> = {
  morning_early: ["dawn", "morning"],
  noon: ["noon"],
  evening: ["afternoon", "evening"],
  night: ["evening", "night"],
};

/** Khung trong ngày theo giờ (phút) */
export function partOfMinute(m: number): DayPart {
  if (m < 7 * 60) return "dawn";
  if (m < 11 * 60) return "morning";
  if (m < 14 * 60) return "noon";
  if (m < 17 * 60) return "afternoon";
  if (m < 20 * 60) return "evening";
  return "night";
}

/** Khung giờ hẹn tập (ngày cụ thể, từ–đến) → danh sách slot */
export function windowToSlots(weekday: number, fromMin: number, toMin: number): string[] {
  const parts = new Set<DayPart>();
  for (let m = fromMin; m < toMin; m += 30) parts.add(partOfMinute(m));
  return [...parts].map((p) => slotKey(weekday, p));
}

const RUN_TYPES: SessionType[] = ["long_run", "recovery", "short_run", "interval", "tempo"];
const GYM_TYPES: SessionType[] = ["push", "pull", "legs", "upper", "lower"];

const BAND_OF_LEVEL: Record<MatchCandidate["capabilities"]["level"], FitnessBand> = {
  "Mới Bắt Đầu": "beginner",
  "Phong Trào": "intermediate",
  "Bán Chuyên": "advanced",
  "Chuyên Nghiệp": "elite",
};

export function candidateToPartner(c: MatchCandidate, center: LatLng): PartnerProfile {
  const h = hash(c.id);
  const male = c.gender === "Nam";
  const sv = c.sportVi.toLowerCase();

  const cali = c.sport === "gym" && sv.includes("calisthenics");
  let workoutTypes: SessionType[] = [];
  if (c.sport === "running") workoutTypes = [RUN_TYPES[h % 5]!, RUN_TYPES[(h >> 3) % 5]!];
  else if (c.sport === "gym")
    workoutTypes = cali ? ["cali_strength", "cali_skill", "pull"] : sv.includes("boxing") ? ["full_body"] : [GYM_TYPES[h % 5]!, GYM_TYPES[(h >> 3) % 5]!];
  workoutTypes = [...new Set(workoutTypes)];

  const days = [0, 1, 2, 3, 4, 5, 6].filter((d) => ((h >> d) & 1) === 1 || d === h % 7 || d === (h + 3) % 7);
  const parts = SLOT_TO_PARTS[c.habitsAndPreferences.timeSlot];
  const availability = days.flatMap((d) => parts.map((p) => slotKey(d, p)));

  const style = `${c.habitsAndPreferences.workoutStyle} ${c.habitsAndPreferences.traits.join(" ")}`.toLowerCase();
  const performance = /kỷ luật|nghiêm|tập trung|pace|pr|tempo|sub-/.test(style);
  const chatty = /vui|hài|nói chuyện|trò chuyện|cafe|cà phê|năng lượng/.test(style);
  const commStyle: CommStyle = performance ? (h % 2 ? "quiet" : "motivating") : chatty ? "chatty" : h % 2 ? "motivating" : "chatty";

  const rateMatch = c.punctualRate.match(/(\d+)%.*?\((\d+)/);
  const completionRate = rateMatch ? Number(rateMatch[1]) / 100 : 0.9;
  const completedSessions = rateMatch ? Number(rateMatch[2]) : 10;

  const position = offsetKm(center, c.distanceKm, ((h % 360) * Math.PI) / 180);
  const now = Math.floor(Date.now() / 1000);
  // Mô phỏng: một số ít tài khoản có vị trí "dịch chuyển tức thời". Một tín hiệu như vậy KHÔNG đủ kết luận;
  // chỉ những tài khoản có thêm tín hiệu (máy báo mock location) và đã xác minh thất bại mới bị hạn chế.
  const jump = h % 11 === 0;
  const mocked = jump && h % 2 === 0;
  const pings = jump
    ? [
        { lat: position[0], lng: position[1], t: now - 90, mocked },
        { lat: position[0] + 0.03, lng: position[1] + 0.02, t: now - 30, mocked },
      ]
    : [
        { lat: position[0] - 0.0008, lng: position[1], t: now - 300, accuracyM: 12 },
        { lat: position[0], lng: position[1], t: now - 60, accuracyM: 9 },
      ];

  return {
    id: c.id,
    name: c.name,
    gender: male ? "male" : "female",
    sports: cali ? [c.sport, "calisthenics"] : [c.sport],
    workoutTypes,
    availability,
    position,
    vibe: performance ? "performance" : "friendly",
    commStyle,
    sameGenderOnly: !male && h % 3 === 0,
    fitnessBand: BAND_OF_LEVEL[c.capabilities.level] ?? "intermediate",
    canSpot: c.sport === "gym" && h % 3 !== 1,
    completionRate,
    completedSessions,
    pings,
    locationVerification: mocked ? (h % 3 === 0 ? "failed" : "pending") : "none",
  };
}

/** Hồ sơ mặc định của bạn (khi chưa làm onboarding) */
export const DEFAULT_ME: Omit<PartnerProfile, "position" | "availability"> & { availability: string[] } = {
  id: "me",
  name: "Bạn",
  gender: "female",
  sports: ["running", "gym"],
  workoutTypes: ["long_run", "recovery", "legs", "push"],
  availability: [0, 1, 2, 3, 4, 5, 6].flatMap((d) => (["dawn", "evening"] as DayPart[]).map((p) => slotKey(d, p))),
  vibe: "friendly",
  commStyle: "motivating",
  sameGenderOnly: false,
  fitnessBand: "intermediate",
  needsSpotter: true,
  canSpot: false,
  completionRate: 0.96,
  completedSessions: 28,
};

export { DAY_PARTS };
