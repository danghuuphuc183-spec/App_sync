"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, Camera } from "lucide-react";
import { ROUTE_REELS } from "@/features/community/reels.data";
import { PEOPLE, findPersonByHandle } from "@/features/feed/feed.data";
import type { FeedComment, Person } from "@/features/feed/feed.types";
import { useSocialPrefs } from "@/features/feed/use-social-prefs";
import { ReelItem } from "@/components/reels/reel-item";
import { CommentsSheet, PostOptionsSheet, ShareSheet } from "@/components/feed/post-sheets";
import { useToast } from "@/components/feed/bottom-sheet";
import { profileHref } from "@/components/feed/post-card";

const SEED_COMMENTS = ["Cung này đẹp quá 😍", "Sáng mai rủ nhau chạy không?", "Nhạc hợp nhịp chạy ghê 🔥"];

export default function ReelsPage() {
  return (
    <React.Suspense fallback={<div className="fixed inset-0 bg-black" />}>
      <ReelsViewer />
    </React.Suspense>
  );
}

function ReelsViewer() {
  const params = useSearchParams();
  const prefs = useSocialPrefs();
  const toast = useToast();
  const scrollerRef = React.useRef<HTMLDivElement>(null);
  const [active, setActive] = React.useState(0);
  const [likes, setLikes] = React.useState<Record<string, { liked: boolean; count: number }>>(() =>
    Object.fromEntries(ROUTE_REELS.map((r) => [r.id, { liked: !!r.hasLiked, count: r.stats.likes }]))
  );
  const [shares, setShares] = React.useState<Record<string, number>>(() =>
    Object.fromEntries(ROUTE_REELS.map((r) => [r.id, r.stats.sharesCount]))
  );
  const [comments, setComments] = React.useState<Record<string, FeedComment[]>>(() =>
    Object.fromEntries(
      ROUTE_REELS.map((r, i) => [
        r.id,
        SEED_COMMENTS.slice(0, 2).map((text, j) => ({
          id: `${r.id}-c${j}`,
          authorId: ["minhanh", "thuydung", "lanphuong", "hoangnam"][(i + j) % 4]!,
          text: j === 0 ? text : SEED_COMMENTS[(i + j) % SEED_COMMENTS.length]!,
          createdAt: new Date(Date.now() - (j + 1) * 3_600_000).toISOString(),
        })),
      ])
    )
  );
  const [sheet, setSheet] = React.useState<{ kind: "comments" | "share" | "options"; reelId: string } | null>(null);

  const authorOf = (handle: string): Person | undefined => findPersonByHandle(handle);
  const reels = ROUTE_REELS.filter((r) => {
    const a = authorOf(r.author.handle);
    return !a || !prefs.hiddenAuthors.has(a.id);
  });

  // Mở đúng reel được chọn từ bảng tin (?start=reel-3)
  React.useEffect(() => {
    const start = params.get("start");
    const idx = start ? reels.findIndex((r) => r.id === start) : -1;
    if (idx > 0 && scrollerRef.current) {
      scrollerRef.current.scrollTo({ top: idx * scrollerRef.current.clientHeight });
      setActive(idx);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onScroll = () => {
    const el = scrollerRef.current;
    if (el) setActive(Math.round(el.scrollTop / el.clientHeight));
  };

  const sheetReel = sheet ? ROUTE_REELS.find((r) => r.id === sheet.reelId) : undefined;
  const sheetAuthor = sheetReel ? authorOf(sheetReel.author.handle) ?? null : null;

  return (
    <div className="fixed top-0 bottom-[60px] inset-x-0 mx-auto max-w-[430px] z-[45] bg-black">
      {/* Thanh trên */}
      <div className="absolute top-0 inset-x-0 z-10 flex items-center justify-between px-3 pt-3 pb-6 bg-gradient-to-b from-black/60 to-transparent pointer-events-none">
        <Link href="/" aria-label="Về trang chủ" className="pointer-events-auto h-9 w-9 flex items-center justify-center text-white">
          <ArrowLeft className="h-6 w-6" />
        </Link>
        <h1 className="text-[20px] font-extrabold text-white tracking-tight">Reels</h1>
        <Link href="/len-keo" aria-label="Tạo reel" className="pointer-events-auto h-9 w-9 flex items-center justify-center text-white">
          <Camera className="h-6 w-6" />
        </Link>
      </div>

      <div ref={scrollerRef} onScroll={onScroll} className="h-full overflow-y-scroll snap-y snap-mandatory no-scrollbar">
        {reels.map((r, i) => {
          const author = authorOf(r.author.handle);
          const l = likes[r.id]!;
          return (
            <div key={r.id} className="h-full">
              <ReelItem
                reel={r}
                active={i === active}
                liked={l.liked}
                likes={l.count}
                commentsCount={r.stats.commentsCount + (comments[r.id]?.length ?? 0) - 2}
                shares={shares[r.id] ?? 0}
                saved={prefs.saved.has(r.id)}
                isFollowing={author ? prefs.following.has(author.id) : false}
                isMine={!!author?.isMe}
                authorHref={author ? profileHref(author) : "/"}
                onLike={() => setLikes((s) => ({ ...s, [r.id]: { liked: !l.liked, count: l.count + (l.liked ? -1 : 1) } }))}
                onFollow={() => {
                  if (!author) return;
                  const was = prefs.following.has(author.id);
                  prefs.toggleFollow(author.id);
                  toast.show(was ? `Đã bỏ theo dõi ${author.name}` : `Đang theo dõi ${author.name}`);
                }}
                onSave={() => {
                  const was = prefs.saved.has(r.id);
                  prefs.toggleSave(r.id);
                  toast.show(was ? "Đã bỏ lưu reel" : "Đã lưu reel");
                }}
                onComments={() => setSheet({ kind: "comments", reelId: r.id })}
                onShare={() => setSheet({ kind: "share", reelId: r.id })}
                onMore={() => setSheet({ kind: "options", reelId: r.id })}
              />
            </div>
          );
        })}
        {reels.length === 0 && <p className="h-full flex items-center justify-center text-white/70 text-sm">Không còn reel nào để xem.</p>}
      </div>

      <CommentsSheet
        open={sheet?.kind === "comments"}
        onClose={() => setSheet(null)}
        comments={sheet ? comments[sheet.reelId] ?? [] : []}
        people={PEOPLE}
        me={PEOPLE.me!}
        onAdd={(text) =>
          sheet &&
          setComments((c) => ({
            ...c,
            [sheet.reelId]: [...(c[sheet.reelId] ?? []), { id: `rc-${Date.now()}`, authorId: "me", text, createdAt: new Date().toISOString() }],
          }))
        }
      />
      <ShareSheet
        open={sheet?.kind === "share"}
        onClose={() => setSheet(null)}
        url={typeof window !== "undefined" && sheet ? `${window.location.origin}/reels?start=${sheet.reelId}` : ""}
        title={sheetReel?.title ?? "Reel"}
        friends={Object.values(PEOPLE).filter((p) => p.kind === "user" && !p.isMe).slice(0, 6)}
        onShared={() => sheet && setShares((s) => ({ ...s, [sheet.reelId]: (s[sheet.reelId] ?? 0) + 1 }))}
        toast={toast.show}
      />
      <PostOptionsSheet
        open={sheet?.kind === "options" && !!sheetAuthor}
        onClose={() => setSheet(null)}
        author={sheetAuthor}
        isAd={false}
        isFollowing={sheetAuthor ? prefs.following.has(sheetAuthor.id) : false}
        isSaved={sheet ? prefs.saved.has(sheet.reelId) : false}
        onToggleFollow={() => sheetAuthor && prefs.toggleFollow(sheetAuthor.id)}
        onToggleSave={() => sheet && prefs.toggleSave(sheet.reelId)}
        onHideAuthor={() => {
          if (!sheetAuthor) return;
          prefs.hideAuthor(sheetAuthor.id);
          toast.show(`Đã ẩn reel của ${sheetAuthor.name}`);
        }}
        onHideAd={() => undefined}
      />
      {toast.node}
    </div>
  );
}
