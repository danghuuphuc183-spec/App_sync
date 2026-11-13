/**
 * Đổi địa điểm vì thời tiết: hệ thống chỉ ĐỀ XUẤT một Spot có thật; không bao giờ tự chuyển.
 * Chủ kèo và mọi thành viên phải xác nhận. Một người từ chối → giữ địa điểm cũ; ai cũng có thể
 * huỷ hoặc đổi lịch vì thời tiết mà không bị phạt.
 */
import type { IndoorSpot } from "@/features/match/partner-match";
import { SPORTS_VENUES_DATABASE } from "@/features/venues/venues.data";
import { SPORT_IMAGE } from "./keo.data";
import type { Keo, KeoPlace } from "./keo.types";

/** Phòng tập trong nhà có thật (dữ liệu địa điểm) để đề xuất khi mưa dông */
export const INDOOR_SPOTS: IndoorSpot[] = SPORTS_VENUES_DATABASE.filter((v) => v.sport === "gym").map((v) => ({
  id: v.id,
  name: v.name,
  area: v.district,
  position: [v.lat, v.lng],
  image: SPORT_IMAGE.gym,
}));

export const spotToPlace = (s: IndoorSpot): KeoPlace => ({ id: s.id, name: s.name, area: s.area, position: s.position, image: s.image ?? SPORT_IMAGE.gym! });

export function proposeVenueChange(keo: Keo, to: KeoPlace, by: string): Keo {
  return {
    ...keo,
    venueChange: { to, from: keo.place, reason: "weather", proposedBy: by, confirmedBy: [by], declinedBy: [], status: "pending" },
    weatherWaiver: true,
  };
}

/** Ai còn phải xác nhận */
export const pendingConfirmations = (keo: Keo) =>
  keo.venueChange && keo.venueChange.status === "pending" ? keo.memberIds.filter((id) => !keo.venueChange!.confirmedBy.includes(id)) : [];

export function confirmVenueChange(keo: Keo, userId: string): Keo {
  const vc = keo.venueChange;
  if (!vc || vc.status !== "pending" || !keo.memberIds.includes(userId)) return keo;
  const confirmedBy = [...new Set([...vc.confirmedBy, userId])];
  const all = keo.memberIds.every((id) => confirmedBy.includes(id));
  return {
    ...keo,
    place: all ? vc.to : keo.place,
    venueChange: { ...vc, confirmedBy, status: all ? "accepted" : "pending" },
  };
}

export function declineVenueChange(keo: Keo, userId: string): Keo {
  const vc = keo.venueChange;
  if (!vc || vc.status !== "pending" || !keo.memberIds.includes(userId)) return keo;
  return { ...keo, place: vc.from, venueChange: { ...vc, declinedBy: [...new Set([...vc.declinedBy, userId])], status: "declined" } };
}

/** Huỷ vì thời tiết (bất khả kháng): không trừ UT bên nào */
export function cancelForWeather(keo: Keo): { keo: Keo; penaltyUt: 0 } {
  return { keo: { ...keo, status: "cancelled", weatherWaiver: true }, penaltyUt: 0 };
}
