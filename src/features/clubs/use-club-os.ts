"use client";

import * as React from "react";
import type { Club, Invitation } from "./club-os";
import { seedClub, seedMyInvitations } from "./club.data";

const KEY = "sync.clubos.v1";
const EVENT = "sync-clubos";

interface State {
  club: Club;
  /** lời mời gửi tới bạn (bạn tự chấp nhận / từ chối) */
  myInvitations: Invitation[];
  /** CLB bạn đã gia nhập qua lời mời */
  joinedClubIds: string[];
}

const seed = (): State => ({ club: seedClub(), myInvitations: seedMyInvitations(), joinedClubIds: [] });

function read(): State {
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? { ...seed(), ...(JSON.parse(raw) as Partial<State>) } : seed();
  } catch {
    return seed();
  }
}

/** Trạng thái Club OS (demo lưu cục bộ). Khi có backend: thay bằng API CLB. */
export function useClubOs() {
  const [state, setState] = React.useState<State>(seed);
  const [ready, setReady] = React.useState(false);

  React.useEffect(() => {
    setState(read());
    setReady(true);
    const sync = () => setState(read());
    window.addEventListener(EVENT, sync);
    return () => window.removeEventListener(EVENT, sync);
  }, []);

  const update = React.useCallback((fn: (s: State) => State) => {
    setState((prev) => {
      const next = fn(prev);
      try {
        window.localStorage.setItem(KEY, JSON.stringify(next));
      } catch {
        /* bỏ qua */
      }
      queueMicrotask(() => window.dispatchEvent(new Event(EVENT)));
      return next;
    });
  }, []);

  const setClub = React.useCallback((fn: (c: Club) => Club) => update((s) => ({ ...s, club: fn(s.club) })), [update]);

  const respondMine = React.useCallback(
    (id: string, accept: boolean) =>
      update((s) => {
        const inv = s.myInvitations.find((i) => i.id === id);
        if (!inv || inv.status !== "sent") return s;
        return {
          ...s,
          myInvitations: s.myInvitations.map((i) => (i.id === id ? { ...i, status: accept ? "accepted" : "declined" } : i)),
          joinedClubIds: accept ? [...new Set([...s.joinedClubIds, inv.clubId])] : s.joinedClubIds,
        };
      }),
    [update]
  );

  const reset = React.useCallback(() => update(() => seed()), [update]);

  return { ...state, ready, setClub, respondMine, reset };
}
