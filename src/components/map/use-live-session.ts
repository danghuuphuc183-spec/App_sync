"use client";

import * as React from "react";
import {
  INITIAL_LIVE_STATE,
  liveReducer,
  rankNearby,
  stepToward,
  type LatLng,
  type LiveSpot,
  type RankedAthlete,
} from "@/features/live/live-session";
import { buildNearbyAthletes } from "@/features/live/nearby.data";

const INVITE_REPLY_MS = 2500;
const INCOMING_INVITE_MS = 9000;
const PARTNER_TICK_MS = 1000;
const PARTNER_STEP_M = 15;

/** Lấy vị trí GPS thật của thiết bị. */
export function locateUser(timeoutMs = 8000): Promise<LatLng> {
  return new Promise((resolve, reject) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      reject(new Error("unsupported"));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (p) => resolve([p.coords.latitude, p.coords.longitude]),
      (err) => reject(err),
      { enableHighAccuracy: true, timeout: timeoutMs, maximumAge: 10_000 }
    );
  });
}

/**
 * Quản lý phiên tập trực tiếp. Phần "người kia trả lời / di chuyển" đang được mô phỏng;
 * khi có backend realtime (Supabase Realtime channel theo spot), thay các setTimeout bằng sự kiện thật.
 */
export function useLiveSession(myLevel = 2) {
  const [state, dispatch] = React.useReducer(liveReducer, INITIAL_LIVE_STATE);
  const [usesRealGps, setUsesRealGps] = React.useState(false);

  const athletes = React.useMemo(
    () => (state.spot ? buildNearbyAthletes(state.spot.position, state.spot.sport, state.spot.kind) : []),
    [state.spot]
  );

  const nearby: RankedAthlete[] = React.useMemo(
    () =>
      state.spot && state.myPos
        ? rankNearby({ position: state.myPos, sport: state.spot.sport, level: myLevel }, athletes)
        : [],
    [state.spot, state.myPos, athletes, myLevel]
  );

  const stateRef = React.useRef(state);
  const nearbyRef = React.useRef(nearby);
  React.useEffect(() => {
    stateRef.current = state;
    nearbyRef.current = nearby;
  });

  // Người được mời trả lời sau vài giây.
  const scheduled = React.useRef(new Map<string, ReturnType<typeof setTimeout>>());
  React.useEffect(() => {
    for (const [id, status] of Object.entries(state.outgoing)) {
      if (status !== "pending" || scheduled.current.has(id)) continue;
      const athlete = athletes.find((a) => a.id === id);
      if (!athlete) continue;
      scheduled.current.set(
        id,
        setTimeout(() => {
          dispatch({ type: "INVITE_ANSWER", athleteId: id, accepted: athlete.acceptsInvites, partnerPos: athlete.position });
        }, INVITE_REPLY_MS)
      );
    }
  }, [state.outgoing, athletes]);

  // Một người gần đó chủ động gửi lời mời sau khi bạn bắt đầu.
  React.useEffect(() => {
    if (state.phase !== "live" || state.startedAt === null) return;
    const t = setTimeout(() => {
      const s = stateRef.current;
      if (s.phase !== "live") return;
      const inviter = nearbyRef.current.find((a) => a.acceptsInvites && !s.outgoing[a.id]);
      if (inviter) dispatch({ type: "RECEIVE_INVITE", athleteId: inviter.id });
    }, INCOMING_INVITE_MS);
    return () => clearTimeout(t);
    // chỉ chạy một lần cho mỗi phiên
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.startedAt]);

  // Sau khi ghép đội: vị trí bạn tập được cập nhật liên tục, di chuyển về phía bạn.
  React.useEffect(() => {
    if (state.phase !== "matched") return;
    const t = setInterval(() => {
      const s = stateRef.current;
      if (s.phase !== "matched" || !s.partnerPos || !s.myPos) return;
      dispatch({ type: "PARTNER_POS", pos: stepToward(s.partnerPos, s.myPos, PARTNER_STEP_M) });
    }, PARTNER_TICK_MS);
    return () => clearInterval(t);
  }, [state.phase]);

  // Theo dõi GPS thật trong lúc phiên đang bật (chỉ khi người dùng bật bằng GPS thật).
  React.useEffect(() => {
    if (state.phase === "idle" || !usesRealGps || !navigator.geolocation) return;
    const id = navigator.geolocation.watchPosition(
      (p) => dispatch({ type: "MY_POS", pos: [p.coords.latitude, p.coords.longitude] }),
      () => undefined,
      { enableHighAccuracy: true, maximumAge: 5000 }
    );
    return () => navigator.geolocation.clearWatch(id);
  }, [state.phase, usesRealGps]);

  const clearTimers = () => {
    scheduled.current.forEach((t) => clearTimeout(t));
    scheduled.current.clear();
  };

  React.useEffect(() => clearTimers, []);

  const partner = state.partnerId ? athletes.find((a) => a.id === state.partnerId) ?? null : null;

  return {
    state,
    nearby,
    athletes,
    partner,
    start: (spot: LiveSpot, myPos: LatLng, realGps: boolean) => {
      clearTimers();
      setUsesRealGps(realGps);
      dispatch({ type: "START", spot, myPos, at: Date.now() });
    },
    invite: (athleteId: string) => dispatch({ type: "SEND_INVITE", athleteId }),
    answerIncoming: (athleteId: string, accept: boolean) => {
      const a = athletes.find((x) => x.id === athleteId);
      if (a) dispatch({ type: "ANSWER_INCOMING", athleteId, accept, partnerPos: a.position });
    },
    cancelMatch: () => dispatch({ type: "CANCEL_MATCH" }),
    stop: () => {
      clearTimers();
      setUsesRealGps(false);
      dispatch({ type: "STOP" });
    },
  };
}
