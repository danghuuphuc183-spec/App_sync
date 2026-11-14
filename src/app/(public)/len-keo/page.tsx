"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, ChevronRight, Lock, Plus, UserRound, Users, UsersRound } from "lucide-react";
import { BottomSheet } from "@/components/feed/bottom-sheet";
import { BrowseKeos } from "@/components/keo/browse-keos";
import { MyKeosSection } from "@/components/keo/my-keos";
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
    <div className="px-4 pt-4 pb-28">
      <h1 className="text-[24px] font-extrabold tracking-tight text-foreground">Lên kèo</h1>
      <p className="text-[13px] text-muted-foreground mb-4">Tạo kèo mới hoặc nhận kèo gần bạn</p>

      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        className="w-full flex items-center gap-4 rounded-2xl bg-brand hover:bg-brand-700 text-white p-4 shadow-md shadow-brand/20 active:scale-[0.99] transition-all"
      >
        <span className="h-12 w-12 shrink-0 rounded-xl bg-white/15 flex items-center justify-center">
          <Plus className="h-7 w-7" />
        </span>
        <span className="flex-1 text-left">
          <span className="block text-[19px] font-extrabold">Tạo kèo</span>
          <span className="block text-[12.5px] text-white/85">Cá nhân · Nhóm · 1:1</span>
        </span>
        <ChevronRight className="h-5 w-5 shrink-0" />
      </button>

      {/* Lối tắt xem Kèo của bạn (đã chuyển sang trang Bạn / Profile theo yêu cầu) */}
      <div className="mt-4 flex items-center justify-between rounded-2xl bg-muted/40 border border-border px-3.5 py-2.5">
        <div className="flex items-center gap-2.5">
          <span className="h-8 w-8 rounded-xl bg-brand/10 text-brand dark:text-brand-sky flex items-center justify-center">
            <UsersRound className="h-4 w-4" />
          </span>
          <div>
            <span className="block text-[13px] font-bold text-foreground">Kèo của bạn</span>
            <span className="block text-[11px] text-muted-foreground">Quản lý kèo đã tạo & đã nhận tại trang Bạn</span>
          </div>
        </div>
        <Link
          href="/ho-so?tab=bounties"
          className="text-[12px] font-bold text-brand dark:text-brand-sky hover:underline flex items-center gap-1"
        >
          Xem kèo →
        </Link>
      </div>

      {plans.length > 0 && (
        <section className="mt-4" aria-label="Kế hoạch tự tập của bạn">
          <p className="mb-2 flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-wider text-muted-foreground">
            <Lock className="h-3.5 w-3.5" /> Kế hoạch tự tập của bạn
          </p>
          <ul className="space-y-1.5">
            {plans.map((p) => (
              <li key={p.id} className="flex items-center gap-3 rounded-xl border border-border px-3 py-2.5">
                <SportIcon sport={p.sport} className="h-5 w-5 shrink-0" />
                <span className="flex-1 min-w-0">
                  <span className="block text-[13.5px] font-semibold text-foreground truncate">
                    {SPORT_LABEL[p.sport]} tại {p.place.name}
                  </span>
                  <span className="block text-[11.5px] text-muted-foreground">
                    {formatKeoDay(p.time.day)} · {p.time.from}–{p.time.to}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <h2 className="mt-6 mb-2 text-[16px] font-extrabold text-foreground">Kèo đang mở</h2>
      <BrowseKeos />

      <BottomSheet open={open} onClose={() => setOpen(false)} title="Tạo kèo" bodyClassName="p-3 pb-8 space-y-2">
        {OPTIONS.map((o) => (
          <Link
            key={o.id}
            href={`/len-keo?loai=${o.id}`}
            onClick={() => setOpen(false)}
            className="flex items-center gap-3.5 rounded-2xl border border-border p-3.5 hover:bg-muted active:scale-[0.99] transition-all text-foreground"
          >
            <span className="h-12 w-12 shrink-0 rounded-2xl border border-foreground/80 flex items-center justify-center">
              <o.icon className="h-6 w-6" />
            </span>
            <span className="flex-1 min-w-0">
              <span className="block text-[16px] font-bold">{o.title}</span>
              <span className="block text-[12.5px] text-muted-foreground">{o.desc}</span>
            </span>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </Link>
        ))}
      </BottomSheet>
    </div>
  );
}
