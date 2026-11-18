"use client";

import * as React from "react";
import { BadgeCheck, UserCheck, X } from "lucide-react";
import { suggestFollows, type ViewerContext } from "@/features/social/follow-suggest";
import { DEMO_VIEWER, SUGGESTION_CANDIDATES } from "@/features/social/suggestions.data";
import { cn } from "@/lib/utils";

export function SuggestedFollows({ viewer = DEMO_VIEWER }: { viewer?: ViewerContext }) {
  const [dismissedIds, setDismissedIds] = React.useState<string[]>([]);
  const [followedIds, setFollowedIds] = React.useState<string[]>([]);
  const [showAll, setShowAll] = React.useState(false);

  // Người vừa bấm "Theo dõi" vẫn hiển thị (để có thể bỏ theo dõi), chỉ người bị "Xóa" mới biến mất.
  const suggestions = React.useMemo(
    () => suggestFollows({ ...viewer, dismissedIds }, SUGGESTION_CANDIDATES, { limit: 10, featuredEvery: 3 }),
    [viewer, dismissedIds]
  );

  const toggleFollow = (id: string) =>
    setFollowedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  if (suggestions.length === 0) return null;

  return (
    <section aria-label="Nên theo dõi" className="py-1">
      <div className="flex items-center justify-between px-3.5 mb-1.5">
        <div className="flex items-center gap-1.5">
          <h2 className="text-xs font-bold text-foreground">Nên theo dõi</h2>
          <span className="text-[10px] text-muted-foreground font-medium">· Gợi ý bạn tập</span>
        </div>
        <button
          type="button"
          onClick={() => setShowAll((v) => !v)}
          className="text-[11px] font-semibold text-brand dark:text-brand-sky hover:underline"
        >
          {showAll ? "Thu gọn" : "Xem tất cả"}
        </button>
      </div>

      <div
        className={cn(
          "px-3",
          showAll
            ? "grid grid-cols-3 gap-2"
            : "flex gap-2 overflow-x-auto snap-x snap-mandatory no-scrollbar pb-1"
        )}
      >
        {suggestions.map(({ candidate: c, reason, track }) => {
          const isFollowing = followedIds.includes(c.id);
          return (
            <article
              key={c.id}
              className={cn(
                "rounded-xl border border-border/70 bg-card shadow-2xs p-2.5 flex flex-col items-center text-center relative transition-all",
                !showAll && "w-[118px] min-w-[118px] shrink-0 snap-start"
              )}
            >
              {/* Nút Xóa / Bỏ qua gợi ý ở góc trên bên phải */}
              <button
                type="button"
                onClick={() => setDismissedIds((prev) => [...prev, c.id])}
                disabled={isFollowing}
                aria-label="Xóa"
                title="Bỏ qua gợi ý"
                className={cn(
                  "absolute top-1 right-1 p-1 rounded-full text-muted-foreground/60 hover:text-foreground hover:bg-muted transition-colors",
                  isFollowing && "invisible pointer-events-none"
                )}
              >
                <X className="h-3 w-3 stroke-[2]" />
              </button>

              {/* Avatar nhỏ gọn phù hợp khung điện thoại */}
              <div className="relative mt-0.5">
                <img
                  src={c.avatar}
                  alt={c.name}
                  className={cn(
                    "h-11 w-11 rounded-full object-cover",
                    track === "featured"
                      ? "ring-2 ring-brand ring-offset-1.5 ring-offset-background"
                      : "ring-1 ring-border"
                  )}
                />
                {c.isVerified && (
                  <BadgeCheck
                    aria-label="Đã xác minh"
                    className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 text-blue-500 fill-white dark:fill-card"
                  />
                )}
              </div>

              {/* Tên & Lý do gợi ý */}
              <h3 className="mt-1.5 text-xs font-bold text-foreground leading-tight line-clamp-1 w-full px-0.5">
                {c.name}
              </h3>
              <p className="mt-0.5 text-[10px] text-muted-foreground leading-tight line-clamp-1 w-full px-0.5">
                {reason}
              </p>

              {/* Nút Theo dõi nhỏ gọn */}
              <div className="mt-2 w-full">
                <button
                  type="button"
                  onClick={() => toggleFollow(c.id)}
                  aria-pressed={isFollowing}
                  className={cn(
                    "w-full rounded-xl py-1 px-1.5 text-[11px] font-bold transition-all duration-150 active:scale-95 flex items-center justify-center gap-1 shadow-2xs select-none",
                    isFollowing
                      ? "bg-muted text-foreground border border-border hover:bg-muted/80"
                      : "bg-gradient-to-r from-[#0567E1] to-[#1C8DFF] text-white shadow-xs shadow-blue-500/20 hover:brightness-105"
                  )}
                >
                  {isFollowing && <UserCheck className="h-3 w-3" />}
                  <span>{isFollowing ? "Đang theo dõi" : "Theo dõi"}</span>
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
