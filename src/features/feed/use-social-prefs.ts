"use client";

import * as React from "react";

/**
 * Trạng thái xã hội của người dùng (theo dõi, lưu, ẩn, kết bạn), lưu trong localStorage
 * và đồng bộ giữa các màn hình (bảng tin, hồ sơ, reels) qua một sự kiện chung.
 * Khi có backend: thay bằng các bảng follows / saved_posts / hidden_authors / friend_requests.
 */
export type FriendStatus = "none" | "pending" | "friends";

interface SocialPrefs {
  following: string[];
  saved: string[];
  hiddenAuthors: string[];
  hiddenPosts: string[];
  friends: Record<string, FriendStatus>;
}

const KEY = "sync.social.v1";
const EVENT = "sync-social-prefs";
const DEFAULTS: SocialPrefs = {
  following: ["hoangnam", "thuydung", "src"],
  saved: [],
  hiddenAuthors: [],
  hiddenPosts: [],
  friends: { hoangnam: "friends" },
};

function read(): SocialPrefs {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) return { ...DEFAULTS, ...(JSON.parse(raw) as Partial<SocialPrefs>) };
  } catch {
    /* localStorage không khả dụng */
  }
  return DEFAULTS;
}

function write(p: SocialPrefs) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(p));
  } catch {
    /* bỏ qua */
  }
  window.dispatchEvent(new Event(EVENT));
}

const toggle = (list: string[], id: string) => (list.includes(id) ? list.filter((x) => x !== id) : [...list, id]);
const remove = (list: string[], id: string) => list.filter((x) => x !== id);

export function useSocialPrefs() {
  const [prefs, setPrefs] = React.useState<SocialPrefs>(DEFAULTS);

  React.useEffect(() => {
    setPrefs(read());
    const sync = () => setPrefs(read());
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const update = React.useCallback((fn: (p: SocialPrefs) => SocialPrefs) => {
    const next = fn(read());
    setPrefs(next);
    write(next);
  }, []);

  return React.useMemo(
    () => ({
      following: new Set(prefs.following),
      saved: new Set(prefs.saved),
      hiddenAuthors: new Set(prefs.hiddenAuthors),
      hiddenPosts: new Set(prefs.hiddenPosts),
      friendStatus: (id: string): FriendStatus => prefs.friends[id] ?? "none",
      toggleFollow: (id: string) => update((p) => ({ ...p, following: toggle(p.following, id) })),
      toggleSave: (postId: string) => update((p) => ({ ...p, saved: toggle(p.saved, postId) })),
      hideAuthor: (id: string) => update((p) => ({ ...p, hiddenAuthors: [...remove(p.hiddenAuthors, id), id] })),
      unhideAuthor: (id: string) => update((p) => ({ ...p, hiddenAuthors: remove(p.hiddenAuthors, id) })),
      hidePost: (postId: string) => update((p) => ({ ...p, hiddenPosts: [...remove(p.hiddenPosts, postId), postId] })),
      unhidePost: (postId: string) => update((p) => ({ ...p, hiddenPosts: remove(p.hiddenPosts, postId) })),
      setFriendStatus: (id: string, status: FriendStatus) =>
        update((p) => ({ ...p, friends: { ...p.friends, [id]: status } })),
    }),
    [prefs, update]
  );
}
