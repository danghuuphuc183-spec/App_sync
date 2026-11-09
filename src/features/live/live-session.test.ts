import { describe, it, expect } from "vitest";
import {
  distanceMeters,
  offsetMeters,
  stepToward,
  isAtSpot,
  rankNearby,
  liveReducer,
  INITIAL_LIVE_STATE,
  type LatLng,
  type LiveSpot,
} from "./live-session";
import { buildNearbyAthletes } from "./nearby.data";

const SPOT: LatLng = [10.795, 106.721];
const spot: LiveSpot = { id: "r1", name: "Landmark", kind: "route", sport: "running", position: SPOT };

describe("hình học", () => {
  it("offsetMeters và distanceMeters khớp nhau", () => {
    const p = offsetMeters(SPOT, 300, 400);
    expect(distanceMeters(SPOT, p)).toBeGreaterThan(495);
    expect(distanceMeters(SPOT, p)).toBeLessThan(505);
  });

  it("stepToward không vượt quá đích", () => {
    const target = offsetMeters(SPOT, 0, 100);
    expect(distanceMeters(stepToward(SPOT, target, 40), target)).toBeCloseTo(60, 0);
    expect(stepToward(SPOT, target, 500)).toEqual(target);
  });

  it("chỉ coi là đã tới nơi khi trong bán kính 300 m", () => {
    expect(isAtSpot(offsetMeters(SPOT, 100, 100), SPOT)).toBe(true);
    expect(isAtSpot(offsetMeters(SPOT, 500, 0), SPOT)).toBe(false);
  });
});

describe("rankNearby", () => {
  it("chỉ lấy người cùng môn trong bán kính 2 km, gần + hợp trình độ lên đầu", () => {
    const athletes = [
      ...buildNearbyAthletes(SPOT, "running", "route"),
      { ...buildNearbyAthletes(SPOT, "gym", "venue")[0]!, id: "gym-guy" },
    ];
    const ranked = rankNearby({ position: SPOT, sport: "running", level: 2 }, athletes);
    const ids = ranked.map((a) => a.id);
    expect(ids).not.toContain("live-far");
    expect(ids).not.toContain("gym-guy");
    expect(ids[0]).toBe("live-giahuy");
  });
});

describe("liveReducer", () => {
  const live = liveReducer(INITIAL_LIVE_STATE, { type: "START", spot, myPos: SPOT, at: 0 });
  const partnerPos = offsetMeters(SPOT, 200, 0);

  it("bắt đầu phiên live", () => {
    expect(live.phase).toBe("live");
    expect(live.spot?.id).toBe("r1");
  });

  it("mời → bị từ chối", () => {
    let s = liveReducer(live, { type: "SEND_INVITE", athleteId: "a" });
    expect(s.outgoing.a).toBe("pending");
    s = liveReducer(s, { type: "INVITE_ANSWER", athleteId: "a", accepted: false, partnerPos });
    expect(s.outgoing.a).toBe("declined");
    expect(s.phase).toBe("live");
  });

  it("mời → đồng ý → ghép đội, xoá các lời mời khác", () => {
    let s = liveReducer(live, { type: "SEND_INVITE", athleteId: "a" });
    s = liveReducer(s, { type: "RECEIVE_INVITE", athleteId: "b" });
    s = liveReducer(s, { type: "INVITE_ANSWER", athleteId: "a", accepted: true, partnerPos });
    expect(s.phase).toBe("matched");
    expect(s.partnerId).toBe("a");
    expect(s.incoming).toEqual([]);
  });

  it("nhận lời mời và đồng ý", () => {
    let s = liveReducer(live, { type: "RECEIVE_INVITE", athleteId: "b" });
    s = liveReducer(s, { type: "ANSWER_INCOMING", athleteId: "b", accept: true, partnerPos });
    expect(s.phase).toBe("matched");
    expect(s.partnerId).toBe("b");
  });

  it("tự chuyển sang 'met' khi hai người cách nhau <= 25 m", () => {
    let s = liveReducer(live, { type: "RECEIVE_INVITE", athleteId: "b" });
    s = liveReducer(s, { type: "ANSWER_INCOMING", athleteId: "b", accept: true, partnerPos });
    s = liveReducer(s, { type: "PARTNER_POS", pos: offsetMeters(SPOT, 10, 0) });
    expect(s.phase).toBe("met");
  });

  it("dừng chia sẻ xoá toàn bộ phiên", () => {
    expect(liveReducer(live, { type: "STOP" })).toEqual(INITIAL_LIVE_STATE);
  });

  it("không gửi lời mời khi chưa live", () => {
    expect(liveReducer(INITIAL_LIVE_STATE, { type: "SEND_INVITE", athleteId: "a" })).toBe(INITIAL_LIVE_STATE);
  });
});
