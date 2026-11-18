"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, ChevronRight, Lock, UserRound, Users, UsersRound } from "lucide-react";
import { BottomSheet } from "@/components/feed/bottom-sheet";
import { BrowseKeos } from "@/components/keo/browse-keos";
import { GroupFlow, PersonalFlow, SoloFlow } from "@/components/keo/keo-flows";
import { useKeoStore } from "@/features/keo/use-keo-store";
import { formatKeoDay } from "@/features/keo/keo-date";
import { SPORT_LABEL } from "@/features/feed/feed.utils";
import { SportIcon } from "@/components/shared/sport-icon";

type Kind = "ca-nhan" | "nhom" | "1-1";

const OPTIONS: { id: Kind; title: string; desc: string; icon: typeof Users }[] = [
  { id: "ca-nhan", title: "Cá nhân", desc: "Một mình: lên kế hoạch tập riêng, chỉ bạn thấy", icon: UserRound },
  { id: "nhom", title: "Nhóm", desc: "Tìm nhóm đang thiếu người, hoặc tự lập nhóm mới", icon: Users },
  { id: "1-1", title: "1:1", desc: "Bạn và một đồng đội: gợi ý tối đa 3 người hợp nhất", icon: UsersRound },
];

const TITLE: Record<Kind, string> = { "ca-nhan": "Kế hoạch tự tập", nhom: "Tạo kèo nhóm", "1-1": "Tạo kèo 1:1" };

/**
 * LÊN KÈO = một trang gộp tạo kèo và xem kèo (D31).
 *  - Trên cùng: nút lớn "Tạo kèo" → chọn Cá nhân (một mình) · Nhóm · 1:1.
 *  - Bên dưới: các kèo mọi người đã lên, sắp xếp Phù hợp / Gần nhất.
 */
export default function LenKeoPage() {
  return (
    <React.Suspense fallback={null}>
      <LenKeo />
    </React.Suspense>
  );
}

function LenKeo() {
  const params = useSearchParams();
  const router = useRouter();
  const raw = params.get("loai");
  const kind: Kind | null = raw === "ca-nhan" || raw === "nhom" || raw === "1-1" ? raw : null;

  // link cũ ?mode=xem → trang gộp
  React.useEffect(() => {
    if (params.get("mode") === "xem") router.replace("/len-keo");
  }, [params, router]);

  if (!kind) return <Hub />;

  return (
    <div className="px-4 pt-3 pb-28">
      <div className="flex items-center gap-2 mb-3">
        <Link href="/len-keo" aria-label="Quay lại Lên kèo" className="h-9 w-9 -ml-2 rounded-full hover:bg-muted flex items-center justify-center">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-[20px] font-extrabold tracking-tight text-foreground">{TITLE[kind]}</h1>
      </div>
      {kind === "ca-nhan" ? <SoloFlow key="ca-nhan" /> : kind === "nhom" ? <GroupFlow key="nhom" /> : <PersonalFlow key="1-1" />}
    </div>
  );
}

function Hub() {
  const [open, setOpen] = React.useState(false);
  const store = useKeoStore();
  const plans = store.plans.filter((p) => !p.openedAsKeoId).slice(0, 3);

  return (
    <div className="px-4 pt-3.5 pb-28 space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-title text-foreground">Lên kèo</h1>
        <p className="text-xs text-muted-foreground mt-0.5">Tạo kèo mới hoặc nhận kèo gần bạn</p>
      </div>

      {/* Nút Tạo kèo: Căn lề giữa, chữ tinh tế nhỏ gọn nhưng thu hút với gradient & shadow (không có icon dấu cộng) */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        className="btn-electric w-full flex flex-col items-center justify-center text-center rounded-2xl py-4 px-4 shadow-glow-lg group"
      >
        <span className="font-display text-lg font-extrabold tracking-tight">Tạo kèo</span>
        <p className="text-caption text-white/85 font-medium mt-0.5">
          Cá nhân · Nhóm · 1:1
        </p>
      </button>

      {/* Lối tắt xem Kèo của bạn (toàn bộ card có thể bấm được) */}
      <Link
        href="/ho-so?tab=bounties"
        className="card-interactive flex items-center justify-between rounded-2xl bg-card border border-border/80 hover:border-brand/40 px-3.5 py-2.5 shadow-xs group"
      >
        <div className="flex items-center gap-2.5">
          <span className="w-8 h-8 rounded-xl bg-brand/10 dark:bg-brand/20 text-brand dark:text-brand-sky flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <UsersRound className="h-4 w-4" />
          </span>
          <div className="text-left">
            <span className="block text-xs font-bold text-foreground">Kèo của bạn</span>
            <span className="block text-caption text-muted-foreground">Quản lý kèo đã tạo & đã nhận tại trang Bạn</span>
          </div>
        </div>
        <span className="text-xs font-bold text-brand dark:text-brand-sky flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
          Xem kèo →
        </span>
      </Link>

      {plans.length > 0 && (
        <section className="mt-4" aria-label="Kế hoạch tự tập của bạn">
          <p className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
            <Lock className="h-3.5 w-3.5" /> Kế hoạch tự tập của bạn
          </p>
          <ul className="space-y-1.5">
            {plans.map((p) => (
              <li key={p.id} className="flex items-center gap-3 rounded-xl border border-border/80 bg-card px-3 py-2.5 shadow-2xs">
                <SportIcon sport={p.sport} className="h-5 w-5 shrink-0" />
                <span className="flex-1 min-w-0">
                  <span className="block text-label font-semibold text-foreground truncate">
                    {SPORT_LABEL[p.sport]} tại {p.place.name}
                  </span>
                  <span className="block text-caption text-muted-foreground">
                    {formatKeoDay(p.time.day)} · {p.time.from}–{p.time.to}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="pt-1">
        <h2 className="mb-2.5 text-body font-extrabold tracking-tight text-foreground">Kèo đang mở</h2>
        <BrowseKeos />
      </div>

      <BottomSheet open={open} onClose={() => setOpen(false)} title="Tạo kèo mới" bodyClassName="p-3.5 pb-8 space-y-2.5">
        {OPTIONS.map((o) => (
          <Link
            key={o.id}
            href={`/len-keo?loai=${o.id}`}
            onClick={() => setOpen(false)}
            className="flex items-center gap-3.5 rounded-2xl border border-border/80 bg-card p-3.5 hover:border-brand/40 shadow-xs active:scale-[0.99] transition-all text-foreground group"
          >
            <span className="w-11 h-11 shrink-0 rounded-xl bg-brand/10 dark:bg-brand/20 text-brand dark:text-brand-sky flex items-center justify-center group-hover:scale-105 transition-transform">
              <o.icon className="h-5 w-5" />
            </span>
            <span className="flex-1 min-w-0">
              <span className="block text-body font-bold text-foreground">{o.title}</span>
              <span className="block text-xs text-muted-foreground mt-0.5">{o.desc}</span>
            </span>
            <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
          </Link>
        ))}
      </BottomSheet>
    </div>
  );
}
