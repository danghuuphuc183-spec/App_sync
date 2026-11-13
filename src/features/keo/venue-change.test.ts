import { describe, it, expect } from "vitest";
import { cancelForWeather, confirmVenueChange, declineVenueChange, pendingConfirmations, proposeVenueChange, INDOOR_SPOTS, spotToPlace } from "./venue-change";
import type { Keo } from "./keo.types";

const place = { id: "p1", name: "Công viên", area: "Bình Thạnh", position: [10.8, 106.7] as [number, number], image: "" };
const keo: Keo = {
  id: "k",
  kind: "personal",
  hostId: "me",
  title: "Chạy",
  sport: "running",
  place,
  time: { day: "2026-11-14", from: "17:00", to: "18:00" },
  capacity: 2,
  memberIds: ["me", "b"],
  note: "",
  minTrust: 60,
  createdAt: "",
};
const gym = spotToPlace(INDOOR_SPOTS[0]!);

describe("đổi địa điểm vì thời tiết", () => {
  it("có Spot trong nhà thật để đề xuất", () => {
    expect(INDOOR_SPOTS.length).toBeGreaterThan(0);
  });
  it("chỉ đổi khi mọi thành viên xác nhận", () => {
    const k1 = proposeVenueChange(keo, gym, "me");
    expect(k1.place.id).toBe("p1");
    expect(pendingConfirmations(k1)).toEqual(["b"]);
    const k2 = confirmVenueChange(k1, "b");
    expect(k2.place.id).toBe(gym.id);
    expect(k2.venueChange?.status).toBe("accepted");
  });
  it("một người từ chối → giữ chỗ cũ", () => {
    const k = declineVenueChange(proposeVenueChange(keo, gym, "me"), "b");
    expect(k.place.id).toBe("p1");
    expect(k.venueChange?.status).toBe("declined");
    expect(confirmVenueChange(k, "b").place.id).toBe("p1");
  });
  it("người ngoài kèo không xác nhận thay được", () => {
    expect(confirmVenueChange(proposeVenueChange(keo, gym, "me"), "stranger").venueChange?.status).toBe("pending");
  });
  it("huỷ vì thời tiết không phạt, hoàn đủ cọc", () => {
    const r = cancelForWeather(keo);
    expect(r.penaltyUt).toBe(0);
    expect(r.keo.status).toBe("cancelled");
  });
});
