"use client";

import * as React from "react";
import type { GroupForm, Keo, PersonalForm, SoloPlan } from "./keo.types";
import { incomingAcceptMessages, sysMsg, type KeoChatMessage } from "./keo-chat";
import { acceptInto, declineMember, displayTitle } from "./keo-membership";
import { PEOPLE } from "@/features/feed/feed.data";
import { UT_CONFIG, legacyTsToUt } from "@/features/trust/config";

/**
 * Kèo do người dùng tạo, kèo đã tham gia và "chế độ đặt làm mặc định" của form.
 * Lưu localStorage — khi có backend thay bằng bảng keos / keo_members / user_keo_defaults.
 */
interface KeoStore {
  mine: Keo[];
  joined: string[];
  /** kế hoạch tự tập (Cá nhân) */
  plans?: SoloPlan[];
  /** chat chung của từng kèo: keoId → tin nhắn */
  chats?: Record<string, KeoChatMessage[]>;
  defaults: { personal?: PersonalForm; group?: GroupForm };
}

const KEY = "sync.keo.v1";
const EVENT = "sync-keo-store";
const EMPTY: KeoStore = { mine: [], joined: [], plans: [], defaults: {} };

/** Dữ liệu cũ theo thang TS 0–150 → UT 0–10 */
const fixMin = <T extends { minTrust: number }>(x: T): T => (x.minTrust > UT_CONFIG.MAX ? { ...x, minTrust: legacyTsToUt(x.minTrust) } : x);
function migrateUt(s: KeoStore): KeoStore {
  return {
    ...s,
    mine: s.mine.map(fixMin),
    defaults: {
      personal: s.defaults.personal && fixMin(s.defaults.personal),
      group: s.defaults.group && fixMin(s.defaults.group),
    },
  };
}

function read(): KeoStore {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) return migrateUt({ ...EMPTY, ...(JSON.parse(raw) as Partial<KeoStore>) });
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
    plans: store.plans ?? [],
    chats: store.chats ?? {},
    appendChat: (keoId: string, msgs: KeoChatMessage[]) =>
      update((s) => ({ ...s, chats: { ...(s.chats ?? {}), [keoId]: [...(s.chats?.[keoId] ?? []), ...msgs] } })),
    addPlan: (p: SoloPlan) => update((s) => ({ ...s, plans: [p, ...(s.plans ?? [])] })),
    removePlan: (id: string) => update((s) => ({ ...s, plans: (s.plans ?? []).filter((p) => p.id !== id) })),
    /** Mở kế hoạch tự tập cho người khác → tạo kèo 1:1 công khai */
    openPlan: (id: string, keo: Keo) =>
      update((s) => ({
        ...s,
        mine: [keo, ...s.mine],
        plans: (s.plans ?? []).map((p) => (p.id === id ? { ...p, openedAsKeoId: keo.id } : p)),
      })),
    addKeo: (k: Keo) => update((s) => ({ ...s, mine: [k, ...s.mine] })),
    /** sửa một kèo của mình (vd. có người nhận, host từ chối) */
    updateKeo: (id: string, fn: (k: Keo) => Keo) => update((s) => ({ ...s, mine: s.mine.map((k) => (k.id === id ? fn(k) : k)) })),
    /**
     * DEMO: mô phỏng một người dùng khác nhận kèo của bạn (khi có backend: sự kiện realtime thật).
     * Dùng chung luật giữ chỗ `acceptInto` → hết chỗ thì không ai vào thêm.
     */
    simulateIncomingAccept: (keoId: string) =>
      update((s) => {
        const keo = s.mine.find((k) => k.id === keoId);
        if (!keo) return s;
        const person = Object.values(PEOPLE).find(
          (p) => p.kind === "user" && p.id !== "me" && !keo.memberIds.includes(p.id) && !(keo.declinedIds ?? []).includes(p.id)
        );
        const next = person ? acceptInto(keo, person.id) : null;
        if (!person || !next) return s;
        return {
          ...s,
          mine: s.mine.map((k) => (k.id === keoId ? next : k)),
          chats: { ...(s.chats ?? {}), [keoId]: [...(s.chats?.[keoId] ?? []), ...incomingAcceptMessages(keo, person.id, person.name, PEOPLE.me?.name ?? "bạn")] },
        };
      }),
    /** Host từ chối một người đã nhận: bỏ khỏi kèo, người đó không còn thấy kèo, chỗ mở lại */
    declineMember: (keoId: string, memberId: string, memberName: string) =>
      update((s) => {
        const keo = s.mine.find((k) => k.id === keoId);
        if (!keo) return s;
        return {
          ...s,
          mine: s.mine.map((k) => (k.id === keoId ? declineMember(k, memberId) : k)),
          chats: {
            ...(s.chats ?? {}),
            [keoId]: [
              ...(s.chats?.[keoId] ?? []),
              sysMsg(`Bạn đã từ chối ${memberName}. ${memberName} được báo "Kèo đã đủ người" và không còn thấy kèo "${displayTitle(keo)}". Chỗ trống đã mở lại trên bảng kèo.`),
            ],
          },
        };
      }),
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
