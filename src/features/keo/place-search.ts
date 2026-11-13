/**
 * TÌM ĐỊA ĐIỂM trong form Lên kèo (Cá nhân · Nhóm · 1:1).
 * - Tìm theo tên, khu vực/quận, địa chỉ, không phân biệt dấu ("nhieu loc" → "Kênh Nhiêu Lộc").
 * - Mọi từ gõ vào đều phải khớp. Ưu tiên: tên bắt đầu bằng từ khoá → tên chứa từ khoá → khớp khu vực/địa chỉ, rồi gần hơn.
 * - Nguồn hiện tại: dữ liệu sẵn có của app. Khi có Google Places API key, thay nguồn ở `searchPlaces`.
 */
import { STRAVA_ROUTES } from "@/features/venues/routes.data";
import { SPORTS_VENUES_DATABASE } from "@/features/venues/venues.data";
import { placesForSport } from "./keo.data";
import { distanceKm } from "./keo.algo";
import type { KeoPlace, LatLng } from "./keo.types";

/** "Kênh Nhiêu Lộc, Q.3" → "kenh nhieu loc, q.3" */
export function normalizeVi(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

/** Thông tin phụ để tìm: địa chỉ sân, khu vực cung đường */
const EXTRA: Record<string, string> = Object.fromEntries([
  ...SPORTS_VENUES_DATABASE.map((v) => [v.id, `${v.address} ${v.district}`] as const),
  ...STRAVA_ROUTES.map((r) => [r.id, `${r.subtitle} ${r.areaVi} ${r.district}`] as const),
]);

export interface PlaceHit {
  place: KeoPlace;
  distanceKm: number;
}

export function searchPlaces(sport: string, query: string, from: LatLng): PlaceHit[] {
  const q = normalizeVi(query);
  if (!q) return [];
  const words = q.split(" ");
  return placesForSport(sport)
    .map((p) => {
      const name = normalizeVi(p.name);
      const hay = `${name} ${normalizeVi(p.area)} ${normalizeVi(EXTRA[p.id] ?? "")}`;
      if (!words.every((w) => hay.includes(w))) return null;
      const rank = name.startsWith(q) ? 0 : name.includes(q) ? 1 : 2;
      return { place: p, distanceKm: distanceKm(from, p.position), rank };
    })
    .filter((x): x is PlaceHit & { rank: number } => x !== null)
    .sort((a, b) => a.rank - b.rank || a.distanceKm - b.distanceKm)
    .map(({ place, distanceKm: d }) => ({ place, distanceKm: d }));
}
