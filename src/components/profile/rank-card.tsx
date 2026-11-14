import * as React from "react";
import { Award, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { RANK_LEVELS, nextRank, rankFor } from "@/features/rank/ranking";

/** Thẻ ranking 6 cấp — tách khỏi Điểm uy tín (UT) */
export function RankCard({ verifiedSessions, compact = false }: { verifiedSessions: number; compact?: boolean }) {
  const cur = rankFor(verifiedSessions);
  const nx = nextRank(verifiedSessions);
  const pct = nx ? Math.min(100, ((verifiedSessions - cur.minSessions) / (nx.next.minSessions - cur.minSessions)) * 100) : 100;

  if (compact) {
    return (
      <section className="rounded-2xl border border-border bg-card p-3 space-y-2 shadow-xs" aria-label="Cấp tập luyện">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="h-7 w-7 rounded-lg bg-brand/10 text-brand dark:text-brand-sky flex items-center justify-center shrink-0">
              <Award className="h-4 w-4" />
            </span>
            <div>
              <div className="text-[13px] font-extrabold text-foreground flex items-center gap-1.5">
                <span>Cấp {cur.level} · {cur.nameVi}</span>
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-brand/15 text-brand dark:text-brand-sky">
                  {verifiedSessions} buổi
                </span>
              </div>
            </div>
          </div>
          <span className="text-[11px] font-semibold text-muted-foreground">
            {nx ? `Còn ${nx.remaining} buổi lên Cấp ${nx.next.level}` : "Đạt cấp tối đa"}
          </span>
        </div>

        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
          <div className="h-full rounded-full bg-brand dark:bg-brand-sky transition-all duration-500" style={{ width: `${pct}%` }} />
        </div>

        <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-0.5">
          <span className="truncate"><b>Quyền lợi:</b> {cur.titleOnly ? RANK_LEVELS[2]!.unlockVi : cur.unlockVi}</span>
          <span className="text-[10px] font-mono text-muted-foreground/80 shrink-0">Cấp {cur.level}/6</span>
        </div>
      </section>
    );
  }
  return (
    <section className="mx-3 rounded-2xl border border-border bg-card p-4 space-y-3" aria-label="Cấp tập luyện">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Cấp tập luyện · tách khỏi UT</p>
          <h2 className="text-[17px] font-extrabold text-foreground flex items-center gap-1.5">
            <Award className="h-5 w-5" /> Cấp {cur.level} · {cur.nameVi}
          </h2>
        </div>
        <p className="text-right text-[12px] text-muted-foreground">
          <b className="block text-[18px] font-black text-foreground leading-none">{verifiedSessions}</b>buổi đã xác thực
        </p>
      </div>
      <div>
        <div className="h-2 rounded-full bg-muted overflow-hidden">
          <div className="h-full rounded-full bg-brand" style={{ width: `${pct}%` }} />
        </div>
        <p className="mt-1 text-[12px] text-muted-foreground">
          {nx ? `Còn ${nx.remaining} buổi để lên ${nx.next.nameVi}` : "Đã đạt cấp cao nhất"}
        </p>
      </div>
      <ol className="grid grid-cols-6 gap-1">
        {RANK_LEVELS.map((r) => (
          <li
            key={r.id}
            title={`${r.nameVi}: ${r.unlockVi}`}
            className={cn(
              "rounded-lg border px-1 py-1.5 text-center text-[10px] font-semibold leading-tight",
              r.level === cur.level ? "border-foreground bg-foreground text-background" : r.level < cur.level ? "border-border text-foreground" : "border-dashed border-border text-muted-foreground"
            )}
          >
            <span className="block text-[12px] font-black">{r.level}</span>
            {r.nameVi}
          </li>
        ))}
      </ol>
      <p className="text-[12px] text-foreground">
        <b>Đang mở:</b> {cur.titleOnly ? RANK_LEVELS[2]!.unlockVi : cur.unlockVi}
      </p>
      <p className="flex items-start gap-1.5 text-[11.5px] text-muted-foreground">
        <Lock className="h-3.5 w-3.5 shrink-0 mt-0.5" />
        Cấp 1–3 mở dần công cụ có giới hạn. Cấp 4–6 chỉ là danh hiệu, không thêm quyền và không ảnh hưởng điểm ghép hay UT.
      </p>
    </section>
  );
}
