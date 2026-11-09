"use client";

import * as React from "react";
import { generateSeedHistory, type ActivityEntry } from "./activity-log";

const KEY = "sync.activityLog.v2";
const LEGACY_KEY = "sync.activityLog.v1";
const EVENT = "sync-activity-log";

function read(): ActivityEntry[] {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw) as ActivityEntry[];
    // Lần đầu: lịch sử mẫu + giữ lại các buổi người dùng đã ghi ở phiên bản cũ
    const seed = generateSeedHistory(new Date());
    const legacy = JSON.parse(window.localStorage.getItem(LEGACY_KEY) ?? "[]") as Omit<ActivityEntry, "id">[];
    const userLogged = legacy
      .filter((e) => Date.now() - new Date(e.at).getTime() < 7 * 86_400_000)
      .map((e, i) => ({ ...e, id: `legacy-${i}` }));
    const all = [...seed, ...userLogged];
    window.localStorage.setItem(KEY, JSON.stringify(all));
    return all;
  } catch {
    return generateSeedHistory(new Date());
  }
}

/** Nhật ký tập luyện dùng chung: Chuỗi tuần (trang chủ) ↔ Ghi nhận tập luyện (hồ sơ). */
export function useActivityLog() {
  const [entries, setEntries] = React.useState<ActivityEntry[] | null>(null);

  React.useEffect(() => {
    setEntries(read());
    const sync = () => setEntries(read());
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const addEntry = React.useCallback((e: Omit<ActivityEntry, "id">) => {
    const next = [...read(), { ...e, id: `log-${Date.now()}` }];
    try {
      window.localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      /* bỏ qua */
    }
    setEntries(next);
    window.dispatchEvent(new Event(EVENT));
  }, []);

  const removeEntry = React.useCallback((id: string) => {
    const next = read().filter((e) => e.id !== id);
    try {
      window.localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      /* bỏ qua */
    }
    setEntries(next);
    window.dispatchEvent(new Event(EVENT));
  }, []);

  return { entries, loaded: entries !== null, addEntry, removeEntry };
}
