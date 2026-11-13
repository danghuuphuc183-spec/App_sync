"use client";

import * as React from "react";
import Link from "next/link";
import { BadgeCheck, Clock, Layers, MessageCircle, Search, UserCheck, UserPlus } from "lucide-react";
import { cn } from "@/lib/utils";
import { MY_FOLLOWER_IDS, MY_POSTS, PEOPLE } from "@/features/feed/feed.data";
import type { FeedPost, Person } from "@/features/feed/feed.types";
import { formatPostTime, SPORT_LABEL } from "@/features/feed/feed.utils";
import { useSocialPrefs } from "@/features/feed/use-social-prefs";
import { BottomSheet, useToast } from "@/components/feed/bottom-sheet";
import { PostCard, profileHref } from "@/components/feed/post-card";
import { CommentsSheet, ShareSheet } from "@/components/feed/post-sheets";
import { RouteMapMedia } from "@/components/feed/route-map-media";

/** Số liệu xã hội dùng cho thanh thống kê đầu trang */
export function useMySocialCounts() {
  const prefs = useSocialPrefs();
  const people = Object.values(PEOPLE).filter((p) => !p.isMe);
  return {
    posts: MY_POSTS.length,
    friends: people.filter((p) => prefs.friendStatus(p.id) === "friends").length,
    following: people.filter((p) => prefs.following.has(p.id)).length,
    followers: MY_FOLLOWER_IDS.length,
  };
}

/* ====================================================================== */
/* BÀI ĐĂNG CŨ                                                             */
/* ====================================================================== */
export function MyPosts() {
  const prefs = useSocialPrefs();
  const toast = useToast();
  const me = PEOPLE.me!;
  const [posts, setPosts] = React.useState<FeedPost[]>(MY_POSTS);
  const [viewing, setViewing] = React.useState<string | null>(null);
  const [sheet, setSheet] = React.useState<"comments" | "share" | null>(null);
  const [view, setView] = React.useState<"grid" | "list">("grid");
  // Thời gian tương đối chỉ tính sau khi mount: trang được prerender tĩnh nên giờ lúc build ≠ giờ trên máy người xem
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  const post = viewing ? posts.find((p) => p.id === viewing) ?? null : null;
  const update = (id: string, fn: (p: FeedPost) => FeedPost) => setPosts((prev) => prev.map((p) => (p.id === id ? fn(p) : p)));

  const card = (p: FeedPost) => (
    <PostCard
      key={p.id}
      post={p}
      author={me}
      people={PEOPLE}
      isFollowing
      isSaved={prefs.saved.has(p.id)}
      onLike={() => update(p.id, (x) => ({ ...x, hasLiked: !x.hasLiked, likes: x.likes + (x.hasLiked ? -1 : 1) }))}
      onOpenComments={() => {
        setViewing(p.id);
        setSheet("comments");
      }}
      onShare={() => {
        setViewing(p.id);
        setSheet("share");
      }}
      onOpenOptions={() => {
        prefs.toggleSave(p.id);
        toast.show(prefs.saved.has(p.id) ? "Đã bỏ lưu bài viết" : "Đã lưu bài viết");
      }}
      onToggleFollow={() => undefined}
    />
  );

  return (
    <section aria-label="Bài đăng của bạn" className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-[15px] font-extrabold text-foreground">Bài đăng của bạn ({posts.length})</h2>
        <div className="flex rounded-full bg-muted p-0.5" role="tablist" aria-label="Kiểu hiển thị">
          {(
            [
              ["grid", "Lưới"],
              ["list", "Danh sách"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              role="tab"
              aria-selected={view === id}
              onClick={() => setView(id)}
              className={cn("rounded-lg px-3 py-1 text-[12px] font-bold", view === id ? "bg-background shadow-sm text-foreground" : "text-muted-foreground")}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {view === "grid" ? (
        <div className="grid grid-cols-3 gap-0.5 rounded-2xl overflow-hidden">
          {posts.map((p) => {
            const first = p.media[0];
            return (
              <button key={p.id} onClick={() => setViewing(p.id)} className="relative aspect-square bg-muted overflow-hidden" aria-label={`Xem bài: ${p.caption.slice(0, 40)}`}>
                {first?.type === "photo" ? (
                  <img src={first.src} alt={first.alt} className="w-full h-full object-cover" />
                ) : first?.type === "route" ? (
                  <RouteMapMedia coords={first.coords} label={first.label} compact aspect={1} />
                ) : null}
                {p.media.length > 1 && <Layers className="absolute top-1.5 right-1.5 h-4 w-4 text-white drop-shadow" />}
                <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent px-1.5 pb-1 pt-4 text-left text-[10px] font-bold text-white">
                  {mounted ? formatPostTime(p.createdAt) : "\u00a0"}
                </span>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="space-y-3 -mx-3">{posts.map(card)}</div>
      )}

      <BottomSheet open={!!post && sheet === null} onClose={() => setViewing(null)} className="h-[90vh]" bodyClassName="pb-6">
        {post && card(post)}
      </BottomSheet>
      <CommentsSheet
        open={!!post && sheet === "comments"}
        onClose={() => setSheet(null)}
        comments={post?.comments ?? []}
        people={PEOPLE}
        me={me}
        onAdd={(text) =>
          post && update(post.id, (p) => ({ ...p, comments: [...p.comments, { id: `c-${Date.now()}`, authorId: "me", text, createdAt: new Date().toISOString() }] }))
        }
      />
      <ShareSheet
        open={!!post && sheet === "share"}
        onClose={() => setSheet(null)}
        url={typeof window !== "undefined" ? `${window.location.origin}/ho-so` : ""}
        title="Bài viết của Minh Thư"
        friends={Object.values(PEOPLE).filter((p) => p.kind === "user" && !p.isMe).slice(0, 6)}
        onShared={() => post && update(post.id, (p) => ({ ...p, shares: p.shares + 1 }))}
        toast={toast.show}
      />
      {toast.node}
    </section>
  );
}

/* ====================================================================== */
/* BẠN BÈ · ĐANG THEO DÕI · NGƯỜI THEO DÕI                                 */
/* ====================================================================== */
export type SocialTab = "friends" | "following" | "followers";

export function MyConnections({ initialTab = "friends" }: { initialTab?: SocialTab }) {
  const prefs = useSocialPrefs();
  const [tab, setTab] = React.useState<SocialTab>(initialTab);
  const [q, setQ] = React.useState("");
  React.useEffect(() => setTab(initialTab), [initialTab]);

  const people = Object.values(PEOPLE).filter((p) => !p.isMe);
  const friends = people.filter((p) => prefs.friendStatus(p.id) === "friends");
  const pending = people.filter((p) => prefs.friendStatus(p.id) === "pending");
  const following = people.filter((p) => prefs.following.has(p.id));
  const followers = MY_FOLLOWER_IDS.map((id) => PEOPLE[id]).filter((p): p is Person => !!p);

  const match = (p: Person) => !q.trim() || `${p.name} ${p.handle}`.toLowerCase().includes(q.trim().toLowerCase());
  const list = (tab === "friends" ? friends : tab === "following" ? following : followers).filter(match);

  return (
    <section aria-label="Bạn bè và theo dõi" className="space-y-3">
      <div className="grid grid-cols-3 rounded-full bg-muted p-1" role="tablist">
        {(
          [
            ["friends", `Bạn bè (${friends.length})`],
            ["following", `Đang theo dõi (${following.length})`],
            ["followers", `Người theo dõi (${followers.length})`],
          ] as [SocialTab, string][]
        ).map(([id, label]) => (
          <button
            key={id}
            role="tab"
            aria-selected={tab === id}
            onClick={() => setTab(id)}
            className={cn(
              "rounded-lg py-2 px-1 text-[11.5px] font-bold transition-colors",
              tab === id ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <label className="flex items-center gap-2 rounded-lg bg-muted/70 px-3.5 py-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Tìm theo tên..."
          aria-label="Tìm trong danh sách"
          className="flex-1 bg-transparent text-[13px] outline-none"
        />
      </label>

      {tab === "friends" && pending.length > 0 && (
        <div className="space-y-1">
          <p className="text-[11.5px] font-bold uppercase tracking-wider text-muted-foreground">Lời mời đã gửi</p>
          {pending.filter(match).map((p) => (
            <PersonRow key={p.id} person={p}>
              <button
                onClick={() => prefs.setFriendStatus(p.id, "none")}
                className="rounded-lg bg-muted px-3 py-1.5 text-[12px] font-bold text-foreground flex items-center gap-1"
              >
                <Clock className="h-3.5 w-3.5" /> Huỷ lời mời
              </button>
            </PersonRow>
          ))}
        </div>
      )}

      {list.length === 0 ? (
        <p className="rounded-2xl bg-muted/60 p-5 text-center text-[13px] text-muted-foreground">
          {tab === "friends"
            ? "Chưa có bạn bè. Vào hồ sơ một người và bấm “Kết bạn”."
            : tab === "following"
              ? "Bạn chưa theo dõi ai."
              : "Chưa có người theo dõi."}
        </p>
      ) : (
        <ul className="divide-y divide-border rounded-2xl border border-border bg-card">
          {list.map((p) => {
            const isFollowing = prefs.following.has(p.id);
            return (
              <li key={p.id}>
                <PersonRow person={p}>
                  {tab === "friends" ? (
                    <Link href="/chat" aria-label={`Nhắn tin cho ${p.name}`} className="h-9 w-9 rounded-full bg-muted flex items-center justify-center">
                      <MessageCircle className="h-4 w-4" />
                    </Link>
                  ) : (
                    <button
                      onClick={() => prefs.toggleFollow(p.id)}
                      className={cn(
                        "rounded-lg px-3 py-1.5 text-[12px] font-bold flex items-center gap-1 transition-colors",
                        isFollowing ? "bg-muted text-foreground" : "bg-brand text-white hover:bg-brand-700"
                      )}
                    >
                      {isFollowing ? <UserCheck className="h-3.5 w-3.5" /> : <UserPlus className="h-3.5 w-3.5" />}
                      {isFollowing ? "Đang theo dõi" : tab === "followers" ? "Theo dõi lại" : "Theo dõi"}
                    </button>
                  )}
                </PersonRow>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

function PersonRow({ person, children }: { person: Person; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 px-3 py-2.5">
      <Link href={profileHref(person)} className="flex items-center gap-3 flex-1 min-w-0">
        <img src={person.avatar} alt={person.name} className={cn("h-11 w-11 object-cover", person.kind === "club" ? "rounded-xl" : "rounded-full")} />
        <span className="min-w-0">
          <span className="flex items-center gap-1 text-[14px] font-bold text-foreground">
            <span className="truncate">{person.name}</span>
            {person.verified && <BadgeCheck className="h-4 w-4 shrink-0 text-background fill-foreground" />}
          </span>
          <span className="block text-[12px] text-muted-foreground truncate">
            @{person.handle} · {person.sports.map((s) => SPORT_LABEL[s] ?? s).join(", ")}
          </span>
        </span>
      </Link>
      {children}
    </div>
  );
}

/** Lưới ô thống kê đầu trang: Bài viết · Bạn bè · Đang theo dõi · Người theo dõi */
export function SocialStatsBar({ onSelect }: { onSelect: (target: "posts" | SocialTab) => void }) {
  const c = useMySocialCounts();
  return (
    <div className="grid grid-cols-4 rounded-3xl border border-border bg-card divide-x divide-border shadow-xs">
      {(
        [
          ["posts", c.posts, "Bài viết"],
          ["friends", c.friends, "Bạn bè"],
          ["following", c.following, "Đang theo dõi"],
          ["followers", c.followers, "Người theo dõi"],
        ] as const
      ).map(([id, v, label]) => (
        <button key={id} onClick={() => onSelect(id)} className="py-2.5 text-center hover:bg-muted/60 first:rounded-l-3xl last:rounded-r-3xl transition-colors">
          <p className="text-[18px] font-extrabold font-display text-foreground">{v}</p>
          <p className="text-[10.5px] text-muted-foreground leading-tight">{label}</p>
        </button>
      ))}
    </div>
  );
}

