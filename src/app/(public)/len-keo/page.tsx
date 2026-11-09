"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, ChevronRight, LayoutList, UserRound, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { GroupFlow, PersonalFlow } from "@/components/keo/keo-flows";

type Kind = "ca-nhan" | "nhom";

const OPTIONS: { id: Kind; title: string; desc: string; icon: typeof Users; tone: string }[] = [
  {
    id: "ca-nhan",
    title: "Cá nhân",
    desc: "Tìm 1 bạn tập — gợi ý tối đa 3 người hợp nhất để bạn chấp nhận",
    icon: UserRound,
    tone: "bg-brand text-white",
  },
  {
    id: "nhom",
    title: "Nhóm",
    desc: "Tìm nhóm đang thiếu người, hoặc tự lập nhóm mới",
    icon: Users,
    tone: "bg-brand-sky text-black",
  },
];

/**
 * LÊN KÈO = công cụ tạo một kèo MỚI trong tương lai.
 * Bước 1 theo workflow: chọn 2 lựa chọn Cá nhân / Nhóm → form thiết lập → gợi ý → xác nhận.
 * (Xem các kèo đã có nằm ở /len-keo/xem.)
 */
export default function LenKeoPage() {
  return (
    <React.Suspense fallback={null}>
      <CreateKeo />
    </React.Suspense>
  );
}

function CreateKeo() {
  const params = useSearchParams();
  const router = useRouter();
  // Hỗ trợ link cũ ?mode=...
  const raw = params.get("loai") ?? params.get("mode");
  const kind: Kind | null = raw === "ca-nhan" || raw === "nhom" ? raw : null;

  React.useEffect(() => {
    if (raw === "xem") router.replace("/len-keo/xem");
  }, [raw, router]);

  if (!kind) {
    return (
      <div className="px-4 pt-4 pb-28">
        <h1 className="text-[24px] font-extrabold tracking-tight text-foreground">Lên kèo mới</h1>
        <p className="text-[13px] text-muted-foreground mb-5">Bạn muốn tập cá nhân hay theo nhóm?</p>
        <div className="space-y-3">
          {OPTIONS.map((o) => (
            <Link
              key={o.id}
              href={`/len-keo?loai=${o.id}`}
              className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4 hover:border-brand-300 hover:shadow-md active:scale-[0.99] transition-all"
            >
              <span className={cn("h-16 w-16 shrink-0 rounded-2xl flex items-center justify-center", o.tone)}>
                <o.icon className="h-8 w-8" />
              </span>
              <span className="flex-1 min-w-0">
                <span className="block text-[18px] font-extrabold text-foreground">{o.title}</span>
                <span className="block text-[13px] text-muted-foreground leading-snug">{o.desc}</span>
              </span>
              <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
            </Link>
          ))}
        </div>
        <Link
          href="/len-keo/xem"
          className="mt-6 flex items-center justify-center gap-1.5 text-[13.5px] font-bold text-brand dark:text-brand-sky"
        >
          <LayoutList className="h-4 w-4" /> Xem các kèo mọi người đã lên
        </Link>
      </div>
    );
  }

  return (
    <div className="px-4 pt-3 pb-28">
      <div className="flex items-center gap-2 mb-3">
        <Link href="/len-keo" aria-label="Chọn lại loại kèo" className="h-9 w-9 -ml-2 rounded-full hover:bg-muted flex items-center justify-center">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-[20px] font-extrabold tracking-tight text-foreground">
          Lên kèo {kind === "ca-nhan" ? "cá nhân" : "nhóm"}
        </h1>
      </div>
      {kind === "ca-nhan" ? <PersonalFlow key="ca-nhan" /> : <GroupFlow key="nhom" />}
    </div>
  );
}
