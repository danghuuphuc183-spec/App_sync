"use client";

import * as React from "react";
import type { GroupForm, Keo, PersonalForm } from "./keo.types";

/**
 * Kèo do người dùng tạo, kèo đã tham gia và "chế độ đặt làm mặc định" của form.
 * Lưu localStorage — khi có backend thay bằng bảng keos / keo_members / user_keo_defaults.
 */
interface KeoStore {
  mine: Keo[];
  joined: string[];
  defaults: { personal?: PersonalForm; group?: GroupForm };
}

const KEY = "sync.keo.v1";
const EVENT = "sync-keo-store";
const EMPTY: KeoStore = { mine: [], joined: [], defaults: {} };

function read(): KeoStore {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) return { ...EMPTY, ...(JSON.parse(raw) as Partial<KeoStore>) };
  } catch {
    /* bỏ qua */
  }
  return EMPTY;
}

export function useKeoStore() {
  const [store, setStore] = React.useState<KeoStore>(EMPTY);
  const [ready, setReady] = React.useState(false);

  React.useEffect(() => {
    setStore(read());
    setReady(true);
    const sync = () => setStore(read());
    window.addEventListener(EVENT, sync);
    return () => window.removeEventListener(EVENT, sync);
  }, []);

  const update = React.useCallback((fn: (s: KeoStore) => KeoStore) => {
    const next = fn(read());
    setStore(next);
    try {
      window.localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      /* bỏ qua */
    }
    window.dispatchEvent(new Event(EVENT));
  }, []);

  return {
    ready,
    mine: store.mine,
    joined: new Set(store.joined),
    defaults: store.defaults,
    addKeo: (k: Keo) => update((s) => ({ ...s, mine: [k, ...s.mine] })),
    removeKeo: (id: string) => update((s) => ({ ...s, mine: s.mine.filter((k) => k.id !== id) })),
    join: (id: string) => update((s) => ({ ...s, joined: s.joined.includes(id) ? s.joined : [...s.joined, id] })),
    leave: (id: string) => update((s) => ({ ...s, joined: s.joined.filter((x) => x !== id) })),
    saveDefault: (kind: "personal" | "group", form: PersonalForm | GroupForm) =>
      update((s) => ({ ...s, defaults: { ...s.defaults, [kind]: form } })),
    clearDefault: (kind: "personal" | "group") =>
      update((s) => {
        const d = { ...s.defaults };
        delete d[kind];
        return { ...s, defaults: d };
      }),
  };
}
