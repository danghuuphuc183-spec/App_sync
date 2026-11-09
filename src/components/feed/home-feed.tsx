"use client";

import * as React from "react";
import { CheckCircle2, MessageCircle, Shield, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import type { FeedPost } from "@/features/feed/feed.types";
import { PEOPLE } from "@/features/feed/feed.data";
import { filterPosts, SPORT_LABEL } from "@/features/feed/feed.utils";
import { useSocialPrefs } from "@/features/feed/use-social-prefs";
import { InstagramChatModal } from "@/components/chat/instagram-chat-modal";
import { PostCard } from "./post-card";
import { CommentsSheet, PostOptionsSheet, ShareSheet } from "./post-sheets";
import { BottomSheet, useToast } from "./bottom-sheet";
import { ReelsStrip } from "./reels-strip";

const FILTERS = [
  { id: "all", label: "Tất cả" },
  { id: "following", label: "Đang theo dõi" },
  { id: "clubs", label: "CLB" },
  { id: "invites", label: "Kèo tập" },
  { id: "running", label: "🏃 Chạy bộ" },
  { id: "gym", label: "🏋️ Gym" },
  { id: "cycling", label: "🚴 Đạp xe" },
];

type ChatPartner = React.ComponentProps<typeof InstagramChatModal>["partnerInfo"];

export function HomeFeed({
  posts,
  setPosts,
  searchQuery,
  onCreatePost,
}: {
  posts: FeedPost[];
  setPosts: React.Dispatch<React.SetStateAction<FeedPost[]>>;
  searchQuery: string;
  onCreatePost: () => void;
}) {
  const prefs = useSocialPrefs();
  const toast = useToast();
  const [filter, setFilter] = React.useState("all");
  const [optionsFor, setOptionsFor] = React.useState<string | null>(null);
  const [commentsFor, setCommentsFor] = React.useState<string | null>(null);
  const [shareFor, setShareFor] = React.useState<string | null>(null);
  const [joinFor, setJoinFor] = React.useState<string | null>(null);
  const [joined, setJoined] = React.useState(false);
  const [chatPartner, setChatPartner] = React.useState<ChatPartner | null>(null);
  /** Bài vừa bị ẩn trong phiên này → hiện khung "Hoàn tác" thay vì biến mất */
  const [justHidden, setJustHidden] = React.useState<Record<string, "author" | "ad">>({});

  const me = PEOPLE.me!;
  const byId = (id: string | null) => (id ? posts.find((p) => p.id === id) ?? null : null);

  const visible = React.useMemo(() => {
    const list = filterPosts(posts, PEOPLE, { query: searchQuery, filter, following: prefs.following });
    return list.filter(
      (p) => justHidden[p.id] || (!prefs.hiddenPosts.has(p.id) && !prefs.hiddenAuthors.has(p.authorId))
    );
  }, [posts, searchQuery, filter, prefs.following, prefs.hiddenPosts, prefs.hiddenAuthors, justHidden]);

  const updatePost = (id: string, fn: (p: FeedPost) => FeedPost) => setPosts((prev) => prev.map((p) => (p.id === id ? fn(p) : p)));

  const like = (id: string) =>
    updatePost(id, (p) => ({ ...p, hasLiked: !p.hasLiked, likes: p.likes + (p.hasLiked ? -1 : 1) }));

  const optionsPost = byId(optionsFor);
  const optionsAuthor = optionsPost ? PEOPLE[optionsPost.authorId] ?? null : null;
  const commentsPost = byId(commentsFor);
  const sharePost = byId(shareFor);
  const joinPost = byId(joinFor);
  const joinAuthor = joinPost ? PEOPLE[joinPost.authorId] : undefined;

  const friends = Object.values(PEOPLE).filter((p) => p.kind === "user" && !p.isMe).slice(0, 6);

  return (
    <div className="space-y-3">
      {/* Bộ lọc */}
      <div className="w-full overflow-x-auto no-scrollbar px-3">
        <div className="flex items-center gap-1.5">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              aria-pressed={filter === f.id}
              className={cn(
                "px-3.5 py-1.5 rounded-full text-[12.5px] font-semibold whitespace-nowrap border transition-colors",
                filter === f.id
                  ? "bg-brand text-white border-brand dark:bg-brand-sky dark:text-black dark:border-brand-sky"
                  : "bg-white dark:bg-card text-foreground border-neutral-200 dark:border-neutral-800 hover:bg-muted"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {visible.length === 0 ? (
        <div className="mx-3 rounded-2xl border border-dashed border-neutral-300 dark:border-neutral-700 p-8 text-center space-y-3">
          <p className="text-[15px] font-bold text-foreground">Chưa có bài viết phù hợp</p>
          <p className="text-[13px] text-muted-foreground">Thử bộ lọc khác, hoặc chia sẻ buổi tập đầu tiên của bạn.</p>
          <button onClick={onCreatePost} className="rounded-full bg-brand text-white text-[13px] font-bold px-4 py-2">
            Đăng bài
          </button>
        </div>
      ) : (
        <div className="space-y-3 sm:px-3">
          {visible.map((post, i) => {
            const author = PEOPLE[post.authorId];
            if (!author) return null;
            const hiddenKind = justHidden[post.id];
            const isHidden = prefs.hiddenPosts.has(post.id) || prefs.hiddenAuthors.has(post.authorId);
            return (
              <React.Fragment key={post.id}>
                {hiddenKind && isHidden ? (
                  <div className="mx-3 sm:mx-0 rounded-2xl bg-muted/70 border border-border p-4 flex items-center gap-3">
                    <p className="flex-1 text-[13px] text-foreground">
                      {hiddenKind === "ad" ? "Đã ẩn quảng cáo này." : `Đã ẩn bài viết từ ${author.name}. Bạn sẽ không thấy bài của người này nữa.`}
                    </p>
                    <button
                      onClick={() => {
                        if (hiddenKind === "ad") prefs.unhidePost(post.id);
                        else prefs.unhideAuthor(post.authorId);
                        setJustHidden((h) => {
                          const next = { ...h };
                          delete next[post.id];
                          return next;
                        });
                      }}
                      className="shrink-0 text-[13px] font-bold text-brand dark:text-brand-sky"
                    >
                      Hoàn tác
                    </button>
                  </div>
                ) : (
                  <PostCard
                    post={post}
                    author={author}
                    people={PEOPLE}
                    isFollowing={prefs.following.has(author.id)}
                    isSaved={prefs.saved.has(post.id)}
                    onLike={() => like(post.id)}
                    onOpenComments={() => setCommentsFor(post.id)}
                    onShare={() => setShareFor(post.id)}
                    onOpenOptions={() => setOptionsFor(post.id)}
                    onToggleFollow={() => {
                      prefs.toggleFollow(author.id);
                      toast.show(`Đang theo dõi ${author.name}`);
                    }}
                    onJoinInvite={post.invite && !author.isMe ? () => setJoinFor(post.id) : undefined}
                  />
                )}
                {i === 1 && filter === "all" && !searchQuery && <ReelsStrip />}
              </React.Fragment>
            );
          })}
        </div>
      )}

      {/* ===== Menu 3 chấm ===== */}
      <PostOptionsSheet
        open={!!optionsPost}
        onClose={() => setOptionsFor(null)}
        author={optionsAuthor}
        isAd={!!optionsPost?.ad}
        isFollowing={optionsAuthor ? prefs.following.has(optionsAuthor.id) : false}
        isSaved={optionsPost ? prefs.saved.has(optionsPost.id) : false}
        onToggleFollow={() => {
          if (!optionsAuthor) return;
          const wasFollowing = prefs.following.has(optionsAuthor.id);
          prefs.toggleFollow(optionsAuthor.id);
          toast.show(wasFollowing ? `Đã bỏ theo dõi ${optionsAuthor.name}` : `Đang theo dõi ${optionsAuthor.name}`);
        }}
        onToggleSave={() => {
          if (!optionsPost) return;
          const wasSaved = prefs.saved.has(optionsPost.id);
          prefs.toggleSave(optionsPost.id);
          toast.show(wasSaved ? "Đã bỏ lưu bài viết" : "Đã lưu bài viết");
        }}
        onHideAuthor={() => {
          if (!optionsPost) return;
          prefs.hideAuthor(optionsPost.authorId);
          setJustHidden((h) => ({ ...h, [optionsPost.id]: "author" }));
        }}
        onHideAd={() => {
          if (!optionsPost) return;
          prefs.hidePost(optionsPost.id);
          setJustHidden((h) => ({ ...h, [optionsPost.id]: "ad" }));
        }}
      />

      {/* ===== Bình luận ===== */}
      <CommentsSheet
        open={!!commentsPost}
        onClose={() => setCommentsFor(null)}
        comments={commentsPost?.comments ?? []}
        people={PEOPLE}
        me={me}
        onAdd={(text) =>
          commentsPost &&
          updatePost(commentsPost.id, (p) => ({
            ...p,
            comments: [...p.comments, { id: `c-${Date.now()}`, authorId: "me", text, createdAt: new Date().toISOString() }],
          }))
        }
      />

      {/* ===== Chia sẻ ===== */}
      <ShareSheet
        open={!!sharePost}
        onClose={() => setShareFor(null)}
        url={typeof window !== "undefined" && sharePost ? `${window.location.origin}/?post=${sharePost.id}` : ""}
        title={sharePost ? `Bài viết của ${PEOPLE[sharePost.authorId]?.name}` : ""}
        friends={friends}
        onShared={() => sharePost && updatePost(sharePost.id, (p) => ({ ...p, shares: p.shares + 1 }))}
        toast={toast.show}
      />

      {/* ===== Nhận kèo (cọc TrustScore) ===== */}
      <BottomSheet
        open={!!joinPost}
        onClose={() => {
          setJoinFor(null);
          setJoined(false);
        }}
        title={joined ? "Nhận kèo thành công" : "Xác nhận khế ước nhận kèo"}
        bodyClassName="p-4 pb-6 space-y-3"
      >
        {joinPost?.invite && joinAuthor && (
          <>
            {joined ? (
              <div className="text-center space-y-2 py-2">
                <CheckCircle2 className="h-12 w-12 text-emerald-600 mx-auto" />
                <p className="text-[14px] text-foreground">
                  Đã giữ <b>{joinPost.invite.holdTs} TS</b> vào khế ước tập cùng <b>{joinAuthor.name}</b>.
                </p>
              </div>
            ) : (
              <div className="flex items-center gap-3 rounded-2xl bg-muted p-3">
                <img src={joinAuthor.avatar} alt="" className="h-11 w-11 rounded-full object-cover" />
                <div className="min-w-0">
                  <p className="text-[14px] font-bold text-foreground">{joinAuthor.name}</p>
                  <p className="text-[12px] text-muted-foreground truncate">{SPORT_LABEL[joinPost.sport]} · {joinPost.invite.intensity}</p>
                </div>
              </div>
            )}
            <ul className="text-[13px] space-y-1 text-foreground">
              <li>🕔 {joinPost.invite.dateTimeVi}</li>
              <li>📍 {joinPost.invite.locationName}</li>
            </ul>
            {!joined && (
              <div className="rounded-2xl border border-brand-200 dark:border-brand-800 bg-brand-50 dark:bg-brand-950/40 p-3 text-[12.5px] space-y-1">
                <p className="font-bold text-brand dark:text-brand-sky flex items-center gap-1.5">
                  <Shield className="h-4 w-4" /> Cam kết kỷ luật
                </p>
                <p className="text-muted-foreground">• Tạm giữ {joinPost.invite.holdTs} TS từ ví của bạn.</p>
                <p className="text-muted-foreground">• Check-in đúng giờ: hoàn cọc và cộng +2 TS.</p>
                <p className="text-muted-foreground">• Bùng kèo không báo trước: trừ 30 TS.</p>
              </div>
            )}
            {joined ? (
              <button
                onClick={() => {
                  setChatPartner({
                    name: joinAuthor.name,
                    avatar: joinAuthor.avatar,
                    handle: `@${joinAuthor.handle}`,
                    sportVi: SPORT_LABEL[joinPost.sport],
                    trustScore: joinAuthor.trustScore,
                    appointmentPrompt: {
                      title: `Kèo ${SPORT_LABEL[joinPost.sport]}`,
                      dateTimeVi: joinPost.invite!.dateTimeVi,
                      locationName: joinPost.invite!.locationName,
                      holdTs: joinPost.invite!.holdTs,
                    },
                  });
                  setJoinFor(null);
                  setJoined(false);
                }}
                className="w-full rounded-full bg-brand hover:bg-brand-700 text-white font-bold py-3 text-[14px] flex items-center justify-center gap-2"
              >
                <MessageCircle className="h-4 w-4" /> Nhắn tin với {joinAuthor.name}
              </button>
            ) : (
              <button
                onClick={() => {
                  setJoined(true);
                  updatePost(joinPost.id, (p) =>
                    p.invite ? { ...p, invite: { ...p.invite, slotsLeft: Math.max(0, p.invite.slotsLeft - 1) } } : p
                  );
                }}
                className="w-full rounded-full bg-brand hover:bg-brand-700 text-white font-bold py-3 text-[14px] flex items-center justify-center gap-2"
              >
                <Zap className="h-4 w-4" /> Ký khế ước ({joinPost.invite.holdTs} TS)
              </button>
            )}
          </>
        )}
      </BottomSheet>

      <InstagramChatModal isOpen={!!chatPartner} onClose={() => setChatPartner(null)} partnerInfo={chatPartner ?? undefined} />
      {toast.node}
    </div>
  );
}
