"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, ArrowRight, EyeOff, Lock, MessageCircle, Repeat2, ShieldCheck, Sparkles, Users, UsersRound } from "lucide-react";
import { cn } from "@/lib/utils";
import { BottomSheet } from "@/components/feed/bottom-sheet";
import { BrowseKeos } from "@/components/keo/browse-keos";
import { GroupFlow, PersonalFlow, SoloFlow } from "@/components/keo/keo-flows";
import { useKeoStore } from "@/features/keo/use-keo-store";
import { formatKeoDay } from "@/features/keo/keo-date";
import { SPORT_LABEL } from "@/features/feed/feed.utils";
import { SportIcon } from "@/components/shared/sport-icon";

type Kind = "ca-nhan" | "nhom" | "1-1";

type Fact = { icon: typeof Users; text: string };

/**
 * 3 cách tạo kèo (thứ tự founder chốt ở D31). Mỗi chip là một luật THẬT của app:
 *  - Cá nhân: chỉ mình thấy, không cộng/trừ UT, mở được thành 1:1 (keo-flows SoloFlow, D31)
 *  - Nhóm: 2–22 người (keo-form min/max), vào chat nhóm sau khi chấp nhận (D33), UT tính khi đã chốt (D23)
 *  - 1:1: gợi ý tối đa 3 người hợp nhất, UT tính khi đã chốt (D23)
 */
const OPTIONS: { id: Kind; title: string; tagline: string; people: 1 | 2 | 4; facts: Fact[] }[] = [
  {
    id: "ca-nhan",
    title: "Cá nhân",
    tagline: "Tự lên kế hoạch tập riêng cho mình",
    people: 1,
    facts: [
      { icon: EyeOff, text: "Chỉ bạn thấy" },
      { icon: Lock, text: "Không tính UT" },
      { icon: Repeat2, text: "Mở thành 1:1 khi muốn" },
    ],
  },
  {
    id: "nhom",
    title: "Nhóm",
    tagline: "Vào nhóm đang thiếu người, hoặc tự lập nhóm",
    people: 4,
    facts: [
      { icon: Users, text: "2–22 người" },
      { icon: MessageCircle, text: "Chat nhóm sau khi vào" },
      { icon: ShieldCheck, text: "Tính UT khi đã chốt" },
    ],
  },
  {
    id: "1-1",
    title: "1:1",
    tagline: "Bạn và một đồng đội hợp pace, hợp giờ",
    people: 2,
    facts: [
      { icon: Sparkles, text: "Gợi ý 3 người hợp nhất" },
      { icon: ShieldCheck, text: "Tính UT khi đã chốt" },
    ],
  },
];

/** Hình tượng số người: 1 chấm có quỹ đạo · 2 chấm nối nhau · cụm 4 chấm. Rê chuột → các chấm giãn ra. */
function PeopleGlyph({ people }: { people: 1 | 2 | 4 }) {
  const dot = "absolute rounded-full ring-2 ring-card transition-transform duration-500 ease-out-expo";
  return (
    <span
      aria-hidden
      className="relative h-14 w-14 shrink-0 rounded-2xl bg-brand-gradient-soft ring-1 ring-inset ring-brand/15 overflow-hidden"
    >
      {people === 1 && (
        <>
          <span className="absolute inset-2.5 rounded-full border border-dashed border-brand/40 transition-transform duration-700 ease-out-expo group-hover:rotate-90 group-hover:scale-110" />
          <span className={cn(dot, "left-1/2 top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 bg-brand-gradient shadow-glow")} />
        </>
      )}
      {people === 2 && (
        <>
          <span className="absolute left-4 right-4 top-1/2 h-0.5 -translate-y-1/2 rounded-full bg-brand/35" />
          <span className={cn(dot, "left-2.5 top-1/2 h-5 w-5 -translate-y-1/2 bg-brand-gradient shadow-glow group-hover:-translate-x-0.5")} />
          <span className={cn(dot, "right-2.5 top-1/2 h-5 w-5 -translate-y-1/2 bg-brand-glow group-hover:translate-x-0.5")} />
        </>
      )}
      {people === 4 && (
        <>
          <span className={cn(dot, "left-[19px] top-[18px] h-5 w-5 bg-brand-gradient shadow-glow")} />
          <span className={cn(dot, "left-2 top-2.5 h-3.5 w-3.5 bg-brand-glow group-hover:-translate-x-0.5 group-hover:-translate-y-0.5")} />
          <span className={cn(dot, "right-2 top-3 h-3.5 w-3.5 bg-brand-mist group-hover:translate-x-0.5 group-hover:-translate-y-0.5")} />
          <span className={cn(dot, "left-3 bottom-2 h-3 w-3 bg-brand-300 group-hover:-translate-x-0.5 group-hover:translate-y-0.5")} />
          <span className={cn(dot, "right-2.5 bottom-2.5 h-3.5 w-3.5 bg-brand-glow group-hover:translate-x-0.5 group-hover:translate-y-0.5")} />
        </>
      )}
    </span>
  );
}

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

      <BottomSheet open={open} onClose={() => setOpen(false)} title="Tạo kèo mới" bodyClassName="p-3.5 pb-8">
        <p className="px-0.5 pb-2.5 text-xs text-muted-foreground">Bạn muốn tập thế nào? Chọn một kiểu, rồi điền chi tiết buổi tập.</p>
        <div className="space-y-2.5 stagger-in">
          {OPTIONS.map((o) => (
            <Link
              key={o.id}
              href={`/len-keo?loai=${o.id}`}
              onClick={() => setOpen(false)}
              className="group card-interactive relative flex items-start gap-3.5 rounded-2xl border border-border/80 bg-card p-3.5 shadow-xs hover:border-brand/40 text-foreground"
            >
              <PeopleGlyph people={o.people} />
              <span className="flex-1 min-w-0 pt-0.5">
                <span className="flex items-center justify-between gap-2">
                  <span className="font-display text-[17px] font-extrabold tracking-tight text-foreground">{o.title}</span>
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground transition-all duration-300 ease-out-expo group-hover:bg-brand-gradient group-hover:text-white group-hover:shadow-glow">
                    <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
                  </span>
                </span>
                <span className="block text-xs text-muted-foreground mt-0.5">{o.tagline}</span>
                <span className="mt-2 flex flex-wrap gap-1.5">
                  {o.facts.map((f) => (
                    <span
                      key={f.text}
                      className="inline-flex items-center gap-1 rounded-md bg-muted/70 px-1.5 py-0.5 text-caption font-semibold text-foreground/80"
                    >
                      <f.icon className="h-3 w-3 text-brand dark:text-brand-glow" aria-hidden />
                      {f.text}
                    </span>
                  ))}
                </span>
              </span>
            </Link>
          ))}
        </div>
      </BottomSheet>
    </div>
  );
}
