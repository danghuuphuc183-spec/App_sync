"use client";

import * as React from "react";
import Link from "next/link";
import {
  BadgeCheck,
  Bookmark,
  Heart,
  MapPin,
  MessageCircle,
  MoreHorizontal,
  Send,
  Trophy,
  Users,
  Zap,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { FeedPost, Person } from "@/features/feed/feed.types";
import { formatCount, formatPostTime, SPORT_LABEL } from "@/features/feed/feed.utils";
import { RouteMapMedia } from "./route-map-media";

export function profileHref(p: Person): string {
  if (p.isMe) return "/ho-so";
  return `/nguoi-dung/${p.handle}`;
}

export interface PostCardProps {
  post: FeedPost;
  author: Person;
  people: Record<string, Person>;
  isFollowing: boolean;
  isSaved: boolean;
  onLike: () => void;
  onOpenComments: () => void;
  onShare: () => void;
  onOpenOptions: () => void;
  onToggleFollow: () => void;
  onJoinInvite?: () => void;
}

export function PostCard({
  post,
  author,
  people,
  isFollowing,
  isSaved,
  onLike,
  onOpenComments,
  onShare,
  onOpenOptions,
  onToggleFollow,
  onJoinInvite,
}: PostCardProps) {
  const isAd = !!post.ad;
  const isClub = author.kind === "club";
  const [expanded, setExpanded] = React.useState(false);
  const [time, setTime] = React.useState("");
  React.useEffect(() => setTime(formatPostTime(post.createdAt)), [post.createdAt]);

  const lastComment = post.comments[post.comments.length - 1];
  const longCaption = post.caption.length > 140;

  return (
    <article className="bg-white dark:bg-card border-y sm:border sm:rounded-2xl border-neutral-200/80 dark:border-neutral-800" aria-label={`Bài viết của ${author.name}`}>
      {/* ===== HEADER: avatar · tên · thời gian · địa điểm · ⋯ ===== */}
      <header className="flex items-center gap-2.5 px-3.5 pt-3 pb-2">
        <Link href={profileHref(author)} className="shrink-0" aria-label={`Xem hồ sơ ${author.name}`}>
          <span className={cn("block p-[2px]", isClub ? "rounded-xl" : "rounded-full", !isAd && "bg-gradient-to-tr from-brand to-brand-sky")}>
            <img
              src={author.avatar}
              alt={author.name}
              className={cn("h-10 w-10 object-cover border-2 border-white dark:border-card", isClub ? "rounded-[10px]" : "rounded-full")}
            />
          </span>
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1 min-w-0">
            <Link href={profileHref(author)} className="text-[14px] font-bold text-foreground truncate hover:underline">
              {author.name}
            </Link>
            {author.verified && <BadgeCheck className="h-4 w-4 shrink-0 text-white fill-brand" aria-label="Đã xác minh" />}
            {isClub && (
              <span className="shrink-0 rounded-md bg-brand-100 dark:bg-brand-900 text-brand-700 dark:text-brand-200 px-1.5 text-[10px] font-bold">CLB</span>
            )}
            {!isAd && !author.isMe && !isFollowing && (
              <>
                <span className="text-muted-foreground text-[12px]">·</span>
                <button onClick={onToggleFollow} className="shrink-0 text-[13px] font-bold text-brand dark:text-brand-sky">
                  Theo dõi
                </button>
              </>
            )}
          </div>
          <p className="text-[12px] text-muted-foreground truncate">
            {isAd ? (
              "Được tài trợ"
            ) : (
              <>
                <time dateTime={time ? post.createdAt : undefined}>{time}</time>
                {isClub && author.stats.members ? ` · ${formatCount(author.stats.members)} thành viên` : ""}
              </>
            )}
          </p>
        </div>
        <button onClick={onOpenOptions} aria-label="Tuỳ chọn bài viết" className="h-9 w-9 shrink-0 rounded-full hover:bg-muted flex items-center justify-center">
          <MoreHorizontal className="h-5 w-5" />
        </button>
      </header>

      {/* ===== CÂU NGƯỜI DÙNG MUỐN NÓI ===== */}
      <div className="px-3.5 pb-2.5">
        <p className={cn("text-[14px] leading-relaxed text-foreground whitespace-pre-line", !expanded && longCaption && "line-clamp-3")}>
          {post.caption}
          {post.tags && post.tags.length > 0 && (
            <span className="text-brand dark:text-brand-sky"> {post.tags.join(" ")}</span>
          )}
        </p>
        {longCaption && !expanded && (
          <button onClick={() => setExpanded(true)} className="text-[13px] font-semibold text-muted-foreground">
            Xem thêm
          </button>
        )}
      </div>

      {/* ===== ẢNH QUÃNG ĐƯỜNG + ẢNH BUỔI TẬP ===== */}
      {post.media.length > 0 && <MediaCarousel post={post} onDoubleTap={() => !post.hasLiked && onLike()} />}

      {/* ===== ĐỊA ĐIỂM ===== */}
      {post.location && (
        <Link
          href="/ban-do"
          className="flex items-center gap-1.5 px-3.5 pt-2.5 text-[12.5px] font-medium text-foreground hover:text-brand"
        >
          <MapPin className="h-3.5 w-3.5 shrink-0 text-brand dark:text-brand-sky" />
          <span className="truncate">
            {post.location.name}
            {post.location.area && <span className="text-muted-foreground"> · {post.location.area}</span>}
          </span>
          <span className="ml-auto shrink-0 rounded-full bg-muted px-2 py-0.5 text-[10.5px] font-semibold text-muted-foreground">
            {SPORT_LABEL[post.sport] ?? post.sport}
          </span>
        </Link>
      )}

      {/* ===== QUẢNG CÁO: nút kêu gọi ===== */}
      {post.ad && (
        <Link
          href={post.ad.href}
          className="mx-3.5 mt-2.5 flex items-center justify-between rounded-xl bg-brand hover:bg-brand-700 text-white px-3.5 py-2.5"
        >
          <span className="text-[13px] font-semibold truncate">{post.ad.headline}</span>
          <span className="flex items-center text-[13px] font-bold shrink-0">
            {post.ad.ctaLabel} <ChevronRight className="h-4 w-4" />
          </span>
        </Link>
      )}

      {/* ===== THỬ THÁCH CLB ===== */}
      {post.challenge && (
        <div className="mx-3.5 mt-2.5 rounded-xl border border-brand-200 dark:border-brand-800 bg-brand-50 dark:bg-brand-950/40 p-3 space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-[13px] font-bold text-foreground flex items-center gap-1.5">
              <Trophy className="h-4 w-4 text-brand" /> {post.challenge.title}
            </p>
            <span className="text-[11px] text-muted-foreground">Còn {post.challenge.daysLeft} ngày</span>
          </div>
          <div className="h-2 rounded-full bg-brand-100 dark:bg-brand-900 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-brand to-brand-sky"
              style={{ width: `${Math.min(100, (post.challenge.currentKm / post.challenge.targetKm) * 100)}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[11.5px] text-muted-foreground">
            <span>
              <b className="text-foreground">{post.challenge.currentKm.toLocaleString("vi-VN")}</b> / {post.challenge.targetKm.toLocaleString("vi-VN")} km
            </span>
            <span className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5" /> {post.challenge.participants} người tham gia
            </span>
          </div>
        </div>
      )}

      {/* ===== KÈO TẬP MỞ ===== */}
      {post.invite && (
        <div className="mx-3.5 mt-2.5 flex items-center gap-3 rounded-xl border border-border p-2.5">
          <div className="h-10 w-10 shrink-0 rounded-lg bg-brand-100 dark:bg-brand-900 flex items-center justify-center">
            <Zap className="h-5 w-5 text-brand dark:text-brand-sky" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-bold text-foreground truncate">{post.invite.dateTimeVi}</p>
            <p className="text-[11.5px] text-muted-foreground truncate">
              {post.invite.intensity} · Cọc {post.invite.holdTs} TS · Còn {post.invite.slotsLeft} chỗ
            </p>
          </div>
          {onJoinInvite && (
            <button onClick={onJoinInvite} className="shrink-0 rounded-full bg-brand hover:bg-brand-700 text-white text-[12.5px] font-bold px-3.5 py-1.5">
              Nhận kèo
            </button>
          )}
        </div>
      )}

      {/* ===== LIKE · COMMENT · SHARE ===== */}
      <div className="flex items-center gap-1 px-2 pt-1.5">
        <ActionButton
          label={post.hasLiked ? "Bỏ thích" : "Thích"}
          active={post.hasLiked}
          onClick={onLike}
          icon={<Heart className={cn("h-[22px] w-[22px] transition-transform", post.hasLiked && "fill-brand text-brand scale-110")} />}
          count={post.likes}
        />
        <ActionButton label="Bình luận" onClick={onOpenComments} icon={<MessageCircle className="h-[22px] w-[22px]" />} count={post.comments.length} />
        <ActionButton label="Chia sẻ" onClick={onShare} icon={<Send className="h-[21px] w-[21px]" />} count={post.shares} />
        {isSaved && <Bookmark className="ml-auto mr-2 h-5 w-5 fill-foreground" aria-label="Đã lưu" />}
      </div>

      {/* ===== BÌNH LUẬN ===== */}
      <div className="px-3.5 pb-3 pt-0.5 space-y-0.5">
        {post.comments.length > 1 && (
          <button onClick={onOpenComments} className="text-[13px] text-muted-foreground">
            Xem tất cả {post.comments.length} bình luận
          </button>
        )}
        {lastComment && (
          <p className="text-[13px] text-foreground line-clamp-2">
            <b>{people[lastComment.authorId]?.name ?? "Ẩn danh"}</b> {lastComment.text}
          </p>
        )}
        {post.comments.length === 0 && (
          <button onClick={onOpenComments} className="text-[13px] text-muted-foreground">
            Viết bình luận đầu tiên...
          </button>
        )}
      </div>
    </article>
  );
}

function ActionButton({
  icon,
  count,
  label,
  onClick,
  active,
}: {
  icon: React.ReactNode;
  count: number;
  label: string;
  onClick: () => void;
  active?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      aria-pressed={active}
      className="flex items-center gap-1.5 rounded-full px-2 py-1.5 text-foreground hover:bg-muted active:scale-95 transition-all"
    >
      {icon}
      <span className="text-[13.5px] font-semibold">{formatCount(count)}</span>
    </button>
  );
}

/** Ảnh vuốt ngang + chấm trang + nhấn đúp để thích (giống Instagram). */
function MediaCarousel({ post, onDoubleTap }: { post: FeedPost; onDoubleTap: () => void }) {
  const [index, setIndex] = React.useState(0);
  const [burst, setBurst] = React.useState(0);
  const ref = React.useRef<HTMLDivElement>(null);
  const lastTap = React.useRef(0);
  const total = post.media.length;

  const handleTap = () => {
    const now = Date.now();
    if (now - lastTap.current < 300) {
      onDoubleTap();
      setBurst((b) => b + 1);
    }
    lastTap.current = now;
  };

  return (
    <div className="relative select-none">
      <div
        ref={ref}
        onScroll={() => {
          const el = ref.current;
          if (el) setIndex(Math.round(el.scrollLeft / el.clientWidth));
        }}
        onClick={handleTap}
        className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar aspect-[4/5] bg-neutral-100 dark:bg-neutral-900"
      >
        {post.media.map((m, i) => (
          <div key={i} className="relative w-full h-full shrink-0 snap-center">
            {m.type === "route" ? (
              <RouteMapMedia coords={m.coords} label={m.label} activity={post.activity} />
            ) : (
              <img src={m.src} alt={m.alt} loading="lazy" className="w-full h-full object-cover" draggable={false} />
            )}
          </div>
        ))}
      </div>

      {total > 1 && (
        <>
          <span className="absolute top-3 right-3 rounded-full bg-black/60 text-white text-[11px] font-semibold px-2 py-0.5">
            {index + 1}/{total}
          </span>
          <div className="absolute -bottom-0 inset-x-0 flex justify-center gap-1 pb-2 pointer-events-none">
            {post.media.map((_, i) => (
              <span key={i} className={cn("h-1.5 rounded-full transition-all", i === index ? "w-4 bg-white" : "w-1.5 bg-white/60")} />
            ))}
          </div>
        </>
      )}

      {post.activity?.source && (
        <span className="absolute top-3 left-3 rounded-full bg-black/60 text-white text-[10.5px] font-semibold px-2 py-0.5 pointer-events-none" style={{ display: post.media[index]?.type === "route" ? "none" : undefined }}>
          ✓ {post.activity.source}
        </span>
      )}

      {burst > 0 && (
        <Heart
          key={burst}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-24 w-24 text-white fill-white drop-shadow-xl pointer-events-none animate-heart-burst"
        />
      )}
    </div>
  );
}
