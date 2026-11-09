"use client";

import * as React from "react";
import Link from "next/link";
import { Bookmark, Heart, MapPin, MessageCircle, MoreHorizontal, Music2, Play, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import type { RouteReel } from "@/features/community/reels.data";
import { formatCount } from "@/features/feed/feed.utils";

export interface ReelItemProps {
  reel: RouteReel;
  active: boolean;
  liked: boolean;
  likes: number;
  commentsCount: number;
  shares: number;
  saved: boolean;
  isFollowing: boolean;
  isMine: boolean;
  authorHref: string;
  onLike: () => void;
  onFollow: () => void;
  onSave: () => void;
  onComments: () => void;
  onShare: () => void;
  onMore: () => void;
}

/**
 * Một reel toàn màn hình kiểu Instagram:
 * - Nhấn 1 lần: tạm dừng / phát · Nhấn đúp: thả tim
 * - Cột phải: thích, bình luận, chia sẻ, lưu, thêm, đĩa nhạc
 * - Dưới trái: tác giả + Theo dõi, chú thích, địa điểm/cự ly, nhạc chạy chữ
 */
export function ReelItem(p: ReelItemProps) {
  const { reel, active } = p;
  const [paused, setPaused] = React.useState(false);
  const [burst, setBurst] = React.useState(0);
  const [expanded, setExpanded] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const tapTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastTap = React.useRef(0);
  const playing = active && !paused;

  React.useEffect(() => {
    if (!active) {
      setPaused(false);
      setProgress(0);
    }
  }, [active]);

  // Thanh tiến trình chạy theo thời lượng bản nhạc, lặp lại như video
  React.useEffect(() => {
    if (!playing) return;
    const step = 100 / (reel.soundtrack.durationSeconds * 10);
    const t = setInterval(() => setProgress((v) => (v + step >= 100 ? 0 : v + step)), 100);
    return () => clearInterval(t);
  }, [playing, reel.soundtrack.durationSeconds]);

  const onTap = () => {
    const now = Date.now();
    if (now - lastTap.current < 280) {
      if (tapTimer.current) clearTimeout(tapTimer.current);
      if (!p.liked) p.onLike();
      setBurst((b) => b + 1);
    } else {
      tapTimer.current = setTimeout(() => setPaused((v) => !v), 280);
    }
    lastTap.current = now;
  };

  return (
    <section className="relative h-full w-full snap-start snap-always overflow-hidden bg-black text-white" aria-label={`Reel: ${reel.title}`}>
      {/* "Video" */}
      <div className="absolute inset-0" onClick={onTap}>
        <img
          src={reel.mediaUrl}
          alt={reel.title}
          className="reel-kenburns absolute inset-0 w-full h-full object-cover"
          style={{ animationPlayState: playing ? "running" : "paused" }}
          draggable={false}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/80 pointer-events-none" />
      </div>

      {paused && active && (
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-20 w-20 rounded-full bg-black/40 flex items-center justify-center pointer-events-none animate-in zoom-in-75 duration-150">
          <Play className="h-10 w-10 fill-white ml-1" />
        </div>
      )}
      {burst > 0 && (
        <Heart key={burst} className="absolute left-1/2 top-1/2 h-28 w-28 text-white fill-white drop-shadow-2xl pointer-events-none animate-heart-burst" />
      )}

      {/* Cột hành động bên phải */}
      <div className="absolute right-2.5 bottom-24 flex flex-col items-center gap-4">
        <RailButton label={p.liked ? "Bỏ thích" : "Thích"} onClick={p.onLike} count={p.likes}>
          <Heart className={cn("h-7 w-7 transition-transform", p.liked && "fill-brand-sky text-brand-sky scale-110")} />
        </RailButton>
        <RailButton label="Bình luận" onClick={p.onComments} count={p.commentsCount}>
          <MessageCircle className="h-7 w-7" />
        </RailButton>
        <RailButton label="Chia sẻ" onClick={p.onShare} count={p.shares}>
          <Send className="h-[26px] w-[26px]" />
        </RailButton>
        <RailButton label={p.saved ? "Bỏ lưu" : "Lưu"} onClick={p.onSave}>
          <Bookmark className={cn("h-7 w-7", p.saved && "fill-white")} />
        </RailButton>
        <RailButton label="Thêm" onClick={p.onMore}>
          <MoreHorizontal className="h-7 w-7" />
        </RailButton>
        <div className="h-8 w-8 rounded-md border-2 border-white overflow-hidden">
          <img
            src={reel.author.avatar}
            alt=""
            className="reel-spin w-full h-full object-cover"
            style={{ animationPlayState: playing ? "running" : "paused" }}
          />
        </div>
      </div>

      {/* Thông tin bên dưới */}
      <div className="absolute left-3 right-16 bottom-5 space-y-2.5">
        <div className="flex items-center gap-2.5">
          <Link href={p.authorHref} className="flex items-center gap-2 min-w-0">
            <img src={reel.author.avatar} alt={reel.author.name} className="h-9 w-9 rounded-full object-cover border border-white/70" />
            <span className="text-[14px] font-bold truncate">{reel.author.handle.replace(/^@/, "")}</span>
          </Link>
          {!p.isMine && (
            <button
              onClick={p.onFollow}
              className={cn(
                "shrink-0 rounded-lg border px-3 py-1 text-[12.5px] font-bold",
                p.isFollowing ? "border-white/40 text-white/80" : "border-white text-white"
              )}
            >
              {p.isFollowing ? "Đang theo dõi" : "Theo dõi"}
            </button>
          )}
        </div>

        <button onClick={() => setExpanded((v) => !v)} className="block text-left">
          <p className={cn("text-[13.5px] leading-snug", !expanded && "line-clamp-2")}>
            <b>{reel.title}.</b> {reel.caption}
          </p>
        </button>

        <div className="flex flex-wrap gap-1.5">
          <span className="inline-flex items-center gap-1 rounded-full bg-white/20 backdrop-blur px-2.5 py-1 text-[11.5px] font-semibold">
            <MapPin className="h-3.5 w-3.5" /> {reel.routeLocation.split(" - ")[0]}
          </span>
          <span className="inline-flex items-center rounded-full bg-brand px-2.5 py-1 text-[11.5px] font-bold">
            {reel.distanceKm} km · {reel.sportNameVi}
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-[12.5px] overflow-hidden">
          <Music2 className="h-3.5 w-3.5 shrink-0" />
          <div className="overflow-hidden whitespace-nowrap max-w-[220px]">
            <span className="reel-marquee inline-block" style={{ animationPlayState: playing ? "running" : "paused" }}>
              {reel.soundtrack.title} · {reel.soundtrack.artist}&nbsp;&nbsp;&nbsp;•&nbsp;&nbsp;&nbsp;{reel.soundtrack.title} · {reel.soundtrack.artist}&nbsp;&nbsp;&nbsp;•&nbsp;&nbsp;&nbsp;
            </span>
          </div>
        </div>
      </div>

      {/* Tiến trình */}
      <div className="absolute bottom-0 inset-x-0 h-[3px] bg-white/25">
        <div className="h-full bg-white" style={{ width: `${progress}%` }} />
      </div>
    </section>
  );
}

function RailButton({ label, onClick, count, children }: { label: string; onClick: () => void; count?: number; children: React.ReactNode }) {
  return (
    <button onClick={onClick} aria-label={label} className="flex flex-col items-center gap-1 drop-shadow active:scale-90 transition-transform">
      {children}
      {count !== undefined && <span className="text-[12px] font-semibold">{formatCount(count)}</span>}
    </button>
  );
}
