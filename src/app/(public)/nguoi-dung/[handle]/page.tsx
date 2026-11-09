"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  BadgeCheck,
  CalendarPlus,
  Clock,
  Copy,
  EyeOff,
  Grid3x3,
  Layers,
  MapPin,
  MessageCircle,
  MoreHorizontal,
  UserCheck,
  UserMinus,
  UserPlus,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { INITIAL_FEED, PEOPLE, findPersonByHandle } from "@/features/feed/feed.data";
import type { FeedPost } from "@/features/feed/feed.types";
import { formatCount, SPORT_LABEL } from "@/features/feed/feed.utils";
import { useSocialPrefs } from "@/features/feed/use-social-prefs";
import { TierBadge } from "@/components/shared/tier-badge";
import { BottomSheet, useToast } from "@/components/feed/bottom-sheet";
import { PostCard } from "@/components/feed/post-card";
import { CommentsSheet, PostOptionsSheet, ShareSheet } from "@/components/feed/post-sheets";
import { RouteMapMedia } from "@/components/feed/route-map-media";
import { TrainInviteSheet } from "@/components/profile/train-invite-sheet";

const FRIEND_ACCEPT_MS = 3000;

export default function UserProfilePage() {
  const params = useParams<{ handle: string }>();
  const handle = params.handle ?? "";
  // key theo handle: chuyển sang hồ sơ khác thì toàn bộ trạng thái được làm mới
  return <ProfileView key={handle} handle={handle} />;
}

function ProfileView({ handle }: { handle: string }) {
  const router = useRouter();
  const person = findPersonByHandle(handle);
  const prefs = useSocialPrefs();
  const toast = useToast();

  const [posts, setPosts] = React.useState<FeedPost[]>(() => INITIAL_FEED.filter((p) => p.authorId === person?.id));
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [inviteOpen, setInviteOpen] = React.useState(false);
  const [viewing, setViewing] = React.useState<string | null>(null);
  const [sheet, setSheet] = React.useState<"comments" | "share" | "options" | null>(null);

  const friendStatus = person ? prefs.friendStatus(person.id) : "none";

  // Mô phỏng: người kia chấp nhận lời mời kết bạn sau vài giây.
  React.useEffect(() => {
    if (!person || friendStatus !== "pending") return;
    const t = setTimeout(() => {
      prefs.setFriendStatus(person.id, "friends");
      toast.show(`${person.name} đã chấp nhận lời mời kết bạn`);
    }, FRIEND_ACCEPT_MS);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [friendStatus, person?.id]);

  if (!person) {
    return (
      <div className="px-6 py-20 text-center space-y-3">
        <p className="text-lg font-bold">Không tìm thấy người dùng</p>
        <p className="text-sm text-muted-foreground">Tài khoản này không tồn tại hoặc đã bị gỡ.</p>
        <Link href="/" className="inline-block rounded-full bg-brand text-white px-4 py-2 text-sm font-bold">
          Về trang chủ
        </Link>
      </div>
    );
  }

  const isUser = person.kind === "user";
  const isClub = person.kind === "club";
  const isFollowing = prefs.following.has(person.id);
  const isHidden = prefs.hiddenAuthors.has(person.id);
  const viewingPost = viewing ? posts.find((p) => p.id === viewing) ?? null : null;
  const updatePost = (id: string, fn: (p: FeedPost) => FeedPost) => setPosts((prev) => prev.map((p) => (p.id === id ? fn(p) : p)));

  const onFriendClick = () => {
    if (friendStatus === "none") {
      prefs.setFriendStatus(person.id, "pending");
      toast.show(`Đã gửi lời mời kết bạn tới ${person.name}`);
    } else if (friendStatus === "pending") {
      prefs.setFriendStatus(person.id, "none");
      toast.show("Đã huỷ lời mời kết bạn");
    } else {
      toast.show(`Bạn và ${person.name} đã là bạn bè`);
    }
  };

  return (
    <div className="pb-24">
      {/* ===== ẢNH BÌA ===== */}
      <div className="relative h-40 bg-brand">
        <img src={person.cover} alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/40" />
        <button
          onClick={() => router.back()}
          aria-label="Quay lại"
          className="absolute top-3 left-3 h-9 w-9 rounded-full bg-white/90 text-black flex items-center justify-center shadow"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <button
          onClick={() => setMenuOpen(true)}
          aria-label="Tuỳ chọn hồ sơ"
          className="absolute top-3 right-3 h-9 w-9 rounded-full bg-white/90 text-black flex items-center justify-center shadow"
        >
          <MoreHorizontal className="h-5 w-5" />
        </button>
      </div>

      {/* ===== THÔNG TIN ===== */}
      <div className="px-4">
        <div className="relative z-10 flex items-end justify-between -mt-12">
          <img
            src={person.avatar}
            alt={person.name}
            className={cn("h-24 w-24 object-cover border-4 border-background shadow-md bg-background", isClub ? "rounded-2xl" : "rounded-full")}
          />
          {isUser && person.tier && <TierBadge tier={person.tier} score={person.trustScore} showScore className="mb-2" />}
        </div>

        <div className="mt-2.5">
          <h1 className="text-[22px] font-extrabold tracking-tight text-foreground flex items-center gap-1.5">
            {person.name}
            {person.verified && <BadgeCheck className="h-5 w-5 text-white fill-brand" aria-label="Đã xác minh" />}
          </h1>
          <p className="text-[13px] text-muted-foreground">
            @{person.handle}
            {isClub && " · Câu lạc bộ"}
            {person.kind === "brand" && " · Nhãn hàng"}
          </p>
          <p className="mt-2 text-[14px] text-foreground leading-relaxed">{person.bio}</p>
          <p className="mt-1.5 text-[12.5px] text-muted-foreground flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" /> {person.area}
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {person.sports.map((s) => (
              <span key={s} className="rounded-full bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-brand-200 px-2.5 py-0.5 text-[11.5px] font-semibold">
                {SPORT_LABEL[s] ?? s}
              </span>
            ))}
          </div>
        </div>

        {/* Chỉ số */}
        <div className="mt-4 grid grid-cols-4 rounded-2xl border border-border divide-x divide-border">
          {[
            ["Bài viết", formatCount(person.stats.posts)],
            ["Người theo dõi", formatCount(person.stats.followers + (isFollowing ? 1 : 0))],
            ["Đang theo dõi", formatCount(person.stats.following)],
            isClub ? ["Thành viên", formatCount(person.stats.members ?? 0)] : ["km/tuần", person.stats.weeklyKm ?? "—"],
          ].map(([k, v]) => (
            <div key={String(k)} className="py-2.5 text-center">
              <p className="text-[16px] font-extrabold font-display text-foreground">{v}</p>
              <p className="text-[10.5px] text-muted-foreground">{k}</p>
            </div>
          ))}
        </div>

        {/* ===== NÚT HÀNH ĐỘNG ===== */}
        <div className="mt-3 flex gap-2">
          {isUser ? (
            <>
              <button
                onClick={onFriendClick}
                className={cn(
                  "flex-1 h-10 rounded-xl text-[13.5px] font-bold flex items-center justify-center gap-1.5 active:scale-[0.98]",
                  friendStatus === "none" ? "bg-brand hover:bg-brand-700 text-white" : "bg-muted text-foreground"
                )}
              >
                {friendStatus === "none" && <UserPlus className="h-4 w-4" />}
                {friendStatus === "pending" && <Clock className="h-4 w-4" />}
                {friendStatus === "friends" && <UserCheck className="h-4 w-4" />}
                {friendStatus === "none" ? "Kết bạn" : friendStatus === "pending" ? "Đã gửi lời mời" : "Bạn bè"}
              </button>
              <button
                onClick={() => setInviteOpen(true)}
                className="flex-1 h-10 rounded-xl border-2 border-brand text-brand dark:text-brand-sky dark:border-brand-sky text-[13.5px] font-bold flex items-center justify-center gap-1.5 active:scale-[0.98]"
              >
                <CalendarPlus className="h-4 w-4" /> Hẹn đi tập
              </button>
            </>
          ) : (
            <button
              onClick={() => {
                prefs.toggleFollow(person.id);
                toast.show(isFollowing ? "Đã rời / bỏ theo dõi" : isClub ? `Đã tham gia ${person.name}` : `Đang theo dõi ${person.name}`);
              }}
              className={cn(
                "flex-1 h-10 rounded-xl text-[13.5px] font-bold flex items-center justify-center gap-1.5",
                isFollowing ? "bg-muted text-foreground" : "bg-brand hover:bg-brand-700 text-white"
              )}
            >
              {isClub ? <Users className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
              {isClub ? (isFollowing ? "Đã tham gia" : "Tham gia CLB") : isFollowing ? "Đang theo dõi" : "Theo dõi"}
            </button>
          )}
          <Link href="/chat" aria-label={`Nhắn tin cho ${person.name}`} className="h-10 w-12 shrink-0 rounded-xl bg-muted flex items-center justify-center">
            <MessageCircle className="h-5 w-5" />
          </Link>
        </div>

        {isUser && (
          <button
            onClick={() => {
              prefs.toggleFollow(person.id);
              toast.show(isFollowing ? `Đã bỏ theo dõi ${person.name}` : `Đang theo dõi ${person.name}`);
            }}
            className="mt-2 w-full text-[12.5px] font-semibold text-muted-foreground"
          >
            {isFollowing ? "✓ Đang theo dõi · bấm để bỏ theo dõi" : "+ Theo dõi để xem bài viết trên bảng tin"}
          </button>
        )}

        {isHidden && (
          <div className="mt-3 rounded-xl bg-muted p-3 flex items-center gap-3 text-[12.5px]">
            <EyeOff className="h-4 w-4 shrink-0" />
            <span className="flex-1">Bạn đã ẩn bài viết của {person.name} khỏi bảng tin.</span>
            <button onClick={() => prefs.unhideAuthor(person.id)} className="font-bold text-brand dark:text-brand-sky">
              Bỏ ẩn
            </button>
          </div>
        )}
      </div>

      {/* ===== LƯỚI BÀI VIẾT ===== */}
      <div className="mt-5 border-t border-border">
        <div className="flex justify-center py-2.5 text-foreground border-b-2 border-foreground w-1/2 mx-auto">
          <Grid3x3 className="h-5 w-5" aria-label="Bài viết" />
        </div>
        {posts.length === 0 ? (
          <p className="py-12 text-center text-[13px] text-muted-foreground">Chưa có bài viết nào.</p>
        ) : (
          <div className="grid grid-cols-3 gap-0.5">
            {posts.map((p) => {
              const first = p.media[0];
              return (
                <button key={p.id} onClick={() => setViewing(p.id)} className="relative aspect-square overflow-hidden bg-muted" aria-label="Xem bài viết">
                  {first?.type === "photo" ? (
                    <img src={first.src} alt={first.alt} className="w-full h-full object-cover" />
                  ) : first?.type === "route" ? (
                    <RouteMapMedia coords={first.coords} label={first.label} compact aspect={1} />
                  ) : null}
                  {p.media.length > 1 && <Layers className="absolute top-1.5 right-1.5 h-4 w-4 text-white drop-shadow" />}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* ===== XEM 1 BÀI ===== */}
      <BottomSheet open={!!viewingPost} onClose={() => setViewing(null)} className="h-[90vh]" bodyClassName="pb-6">
        {viewingPost && (
          <PostCard
            post={viewingPost}
            author={person}
            people={PEOPLE}
            isFollowing={isFollowing}
            isSaved={prefs.saved.has(viewingPost.id)}
            onLike={() => updatePost(viewingPost.id, (p) => ({ ...p, hasLiked: !p.hasLiked, likes: p.likes + (p.hasLiked ? -1 : 1) }))}
            onOpenComments={() => setSheet("comments")}
            onShare={() => setSheet("share")}
            onOpenOptions={() => setSheet("options")}
            onToggleFollow={() => prefs.toggleFollow(person.id)}
          />
        )}
      </BottomSheet>

      <CommentsSheet
        open={sheet === "comments" && !!viewingPost}
        onClose={() => setSheet(null)}
        comments={viewingPost?.comments ?? []}
        people={PEOPLE}
        me={PEOPLE.me!}
        onAdd={(text) =>
          viewingPost &&
          updatePost(viewingPost.id, (p) => ({
            ...p,
            comments: [...p.comments, { id: `c-${Date.now()}`, authorId: "me", text, createdAt: new Date().toISOString() }],
          }))
        }
      />
      <ShareSheet
        open={sheet === "share" && !!viewingPost}
        onClose={() => setSheet(null)}
        url={typeof window !== "undefined" ? window.location.href : ""}
        title={`Bài viết của ${person.name}`}
        friends={Object.values(PEOPLE).filter((p) => p.kind === "user" && !p.isMe && p.id !== person.id).slice(0, 6)}
        onShared={() => viewingPost && updatePost(viewingPost.id, (p) => ({ ...p, shares: p.shares + 1 }))}
        toast={toast.show}
      />
      <PostOptionsSheet
        open={sheet === "options" && !!viewingPost}
        onClose={() => setSheet(null)}
        author={person}
        isAd={!!viewingPost?.ad}
        isFollowing={isFollowing}
        isSaved={viewingPost ? prefs.saved.has(viewingPost.id) : false}
        onToggleFollow={() => prefs.toggleFollow(person.id)}
        onToggleSave={() => {
          if (!viewingPost) return;
          prefs.toggleSave(viewingPost.id);
          toast.show(prefs.saved.has(viewingPost.id) ? "Đã bỏ lưu bài viết" : "Đã lưu bài viết");
        }}
        onHideAuthor={() => {
          prefs.hideAuthor(person.id);
          setViewing(null);
          toast.show(`Đã ẩn ${person.name} khỏi bảng tin`);
        }}
        onHideAd={() => viewingPost && prefs.hidePost(viewingPost.id)}
      />

      {/* ===== MENU HỒ SƠ ===== */}
      <BottomSheet open={menuOpen} onClose={() => setMenuOpen(false)} bodyClassName="pb-6">
        <ul className="py-1">
          {[
            {
              icon: isFollowing ? <UserMinus className="h-[18px] w-[18px]" /> : <UserPlus className="h-[18px] w-[18px]" />,
              label: isFollowing ? `Bỏ theo dõi ${person.name}` : `Theo dõi ${person.name}`,
              onClick: () => prefs.toggleFollow(person.id),
            },
            {
              icon: <Copy className="h-[18px] w-[18px]" />,
              label: "Sao chép liên kết hồ sơ",
              onClick: () => {
                navigator.clipboard?.writeText(window.location.href).then(
                  () => toast.show("Đã sao chép liên kết"),
                  () => toast.show("Không sao chép được")
                );
              },
            },
            {
              icon: <EyeOff className="h-[18px] w-[18px]" />,
              label: isHidden ? "Bỏ ẩn người dùng này" : "Ẩn người dùng này",
              onClick: () => (isHidden ? prefs.unhideAuthor(person.id) : prefs.hideAuthor(person.id)),
              danger: !isHidden,
            },
          ].map((o) => (
            <li key={o.label}>
              <button
                onClick={() => {
                  o.onClick();
                  setMenuOpen(false);
                }}
                className={cn("w-full flex items-center gap-3.5 px-4 py-3 text-left hover:bg-muted text-[14px] font-semibold", o.danger && "text-red-600")}
              >
                <span className="h-9 w-9 rounded-full bg-muted flex items-center justify-center">{o.icon}</span>
                {o.label}
              </button>
            </li>
          ))}
        </ul>
      </BottomSheet>

      {isUser && <TrainInviteSheet open={inviteOpen} onClose={() => setInviteOpen(false)} person={person} />}
      {toast.node}
    </div>
  );
}
