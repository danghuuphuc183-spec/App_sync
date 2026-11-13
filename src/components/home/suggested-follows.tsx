"use client";

import * as React from "react";
import { BadgeCheck, UserCheck } from "lucide-react";
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
      <div className="flex items-center justify-between px-4 mb-2.5">
        <h2 className="text-[17px] font-bold text-foreground">Nên theo dõi</h2>
        <button
          onClick={() => setShowAll((v) => !v)}
          className="text-[13px] font-bold text-brand dark:text-brand-sky hover:underline"
        >
          {showAll ? "Thu gọn" : "Xem tất cả"}
        </button>
      </div>

      <div
        className={cn(
          "px-4",
          showAll ? "grid grid-cols-2 gap-2.5" : "flex gap-2.5 overflow-x-auto snap-x snap-mandatory no-scrollbar pb-1"
        )}
      >
        {suggestions.map(({ candidate: c, reason, track }) => {
          const isFollowing = followedIds.includes(c.id);
          return (
            <article
              key={c.id}
              className={cn(
                "rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-card shadow-xs p-3 flex flex-col items-center text-center",
                !showAll && "w-[44%] min-w-[150px] shrink-0 snap-start"
              )}
            >
              <div className="relative mt-1">
                <img
                  src={c.avatar}
                  alt={c.name}
                  className={cn(
                    "h-16 w-16 rounded-full object-cover",
                    track === "featured" ? "ring-2 ring-brand-600 ring-offset-2 ring-offset-background" : "ring-1 ring-neutral-200 dark:ring-neutral-700"
                  )}
                />
                {c.isVerified && (
                  <BadgeCheck
 aria-label="Đã xác minh"
 className="absolute -top-0.5 -right-1 h-5 w-5 text-background fill-foreground"
 />
                )}
              </div>
              <h3 className="mt-2.5 text-[14px] font-bold text-foreground leading-tight line-clamp-1">{c.name}</h3>
              <p className="mt-1 text-[11.5px] text-muted-foreground leading-snug line-clamp-2 min-h-[2.4em]">{reason}</p>
              <div className="mt-3 w-full flex flex-col gap-1.5">
                <button
                  onClick={() => toggleFollow(c.id)}
                  aria-pressed={isFollowing}
                  className={cn(
                    "w-full rounded-lg py-1.5 text-[12.5px] font-bold transition-all active:scale-95 flex items-center justify-center gap-1",
                    isFollowing
                      ? "bg-neutral-100 dark:bg-neutral-800 text-foreground"
                      : "bg-brand hover:bg-brand-700 text-white dark:bg-brand-sky dark:text-black"
                  )}
                >
                  {isFollowing && <UserCheck className="h-3.5 w-3.5" />}
                  {isFollowing ? "Đang theo dõi" : "Theo dõi"}
                </button>
                <button
                  onClick={() => setDismissedIds((prev) => [...prev, c.id])}
                  disabled={isFollowing}
                  aria-hidden={isFollowing}
                  tabIndex={isFollowing ? -1 : undefined}
                  className={cn(
                    "w-full rounded-lg py-1.5 text-[12.5px] font-bold border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800",
                    isFollowing && "invisible"
                  )}
                >
                  Xóa
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
