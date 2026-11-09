import Link from "next/link";
import { Clapperboard, Play } from "lucide-react";
import { ROUTE_REELS } from "@/features/community/reels.data";
import { formatCount } from "@/features/feed/feed.utils";

/** Dải Reels xen giữa bảng tin (giống Instagram) — bấm để mở trình xem Reels toàn màn hình. */
export function ReelsStrip() {
  return (
    <section aria-label="Reels" className="bg-white dark:bg-card border-y sm:border sm:rounded-2xl border-neutral-200/80 dark:border-neutral-800 py-3">
      <div className="flex items-center justify-between px-3.5 mb-2.5">
        <h2 className="text-[16px] font-bold text-foreground flex items-center gap-1.5">
          <Clapperboard className="h-5 w-5 text-brand" /> Reels
        </h2>
        <Link href="/reels" className="text-[13px] font-bold text-brand dark:text-brand-sky">
          Xem tất cả
        </Link>
      </div>
      <div className="flex gap-2 overflow-x-auto no-scrollbar px-3.5 snap-x">
        {ROUTE_REELS.map((r) => (
          <Link
            key={r.id}
            href={`/reels?start=${r.id}`}
            className="relative shrink-0 w-[118px] aspect-[9/16] rounded-xl overflow-hidden snap-start bg-black"
            aria-label={`Xem reel: ${r.title}`}
          >
            <img src={r.thumbnailUrl} alt="" loading="lazy" className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/20" />
            <span className="absolute top-2 left-2 rounded-full bg-brand px-1.5 py-0.5 text-[10px] font-bold text-white">
              {r.distanceKm} km
            </span>
            <div className="absolute bottom-2 inset-x-2 text-white">
              <p className="text-[11px] font-semibold leading-tight line-clamp-2">{r.title}</p>
              <p className="mt-1 flex items-center gap-1 text-[10.5px] font-bold">
                <Play className="h-3 w-3 fill-white" /> {formatCount(r.stats.views)}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
