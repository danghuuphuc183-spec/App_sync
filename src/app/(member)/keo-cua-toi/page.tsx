"use client";

import * as React from "react";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CancelKeoSheet, type CancelableKeo, type CancelOutcome } from "@/components/keo/cancel-keo-sheet";
import { UT_CONFIG, formatUt } from "@/features/trust/config";
import { cancelPreview, keoStage } from "@/features/trust/ut-rules";
import { Clock, MapPin, QrCode, Crown } from "lucide-react";
import Link from "next/link";

type Status = "active" | "cancelled" | "left" | "mutual_pending" | "shift_pending";

interface MyKeo extends CancelableKeo {
  location: string;
  status: Status;
  note?: string;
}

const inMin = (m: number) => new Date(Date.now() + m * 60_000).toISOString();

const ME = { id: "me", name: "Bạn", ut: 8.5 };

/** Dữ liệu mẫu: 1 kèo sát giờ, 1 kèo mai, 1 kèo bạn làm host nhóm, 1 kèo chưa chốt */
const seed = (): MyKeo[] => [
  {
    id: "mk-1",
    title: "Chạy 10 km Landmark 81 · Minh Quân",
    startsAt: inMin(25),
    lockedAt: inMin(-20 * 60),
    acceptedBy: ["me"],
    kind: "personal",
    role: "member",
    hostId: "u-mq",
    members: [{ id: "u-mq", name: "Minh Quân", ut: 9 }, ME],
    location: "Cổng chính Landmark 81, Bình Thạnh",
    status: "active",
  },
  {
    id: "mk-2",
    title: "Gym chân Fit24 · Thuỳ Dung",
    startsAt: inMin(18 * 60),
    lockedAt: inMin(-3 * 60),
    acceptedBy: ["u-td"],
    kind: "personal",
    role: "host",
    hostId: "me",
    members: [ME, { id: "u-td", name: "Thuỳ Dung", ut: 7.5 }],
    location: "Fit24 Điện Biên Phủ, Bình Thạnh",
    status: "active",
  },
  {
    id: "mk-3",
    title: "Interval nhóm bờ kè Thanh Đa (4 người)",
    startsAt: inMin(26 * 60),
    lockedAt: inMin(-5 * 60),
    acceptedBy: ["u-ma", "u-dt", "u-yn"],
    kind: "group",
    role: "host",
    hostId: "me",
    members: [ME, { id: "u-ma", name: "Minh Anh", ut: 9.5 }, { id: "u-dt", name: "Đức Trọng", ut: 7 }, { id: "u-yn", name: "Yến Nhi", ut: 8 }],
    location: "Bờ kè Thanh Đa",
    status: "active",
  },
  {
    id: "mk-4",
    title: "Calisthenics Tao Đàn",
    startsAt: inMin(40 * 60),
    acceptedBy: ["u-hk"],
    kind: "personal",
    role: "host",
    hostId: "me",
    members: [ME],
    location: "Công viên Tao Đàn, Q.1",
    status: "active",
  },
];

const STATUS_LABEL: Record<Status, string> = {
  active: "",
  cancelled: "Đã huỷ",
  left: "Đã rút",
  mutual_pending: "Chờ bạn tập đồng ý huỷ",
  shift_pending: "Chờ bạn tập đồng ý dời giờ",
};

export default function MyKeosPage() {
  const [keos, setKeos] = React.useState<MyKeo[]>([]);
  const [target, setTarget] = React.useState<MyKeo | null>(null);
  const [graceUsed, setGraceUsed] = React.useState(0);
  const [ut, setUt] = React.useState(ME.ut);

  // tạo dữ liệu mẫu phía client (giờ tương đối theo thời điểm mở trang)
  React.useEffect(() => setKeos(seed()), []);

  const done = (o: CancelOutcome) => {
    if (!target) return;
    const id = target.id;
    setKeos((prev) =>
      prev.map((k) => {
        if (k.id !== id) return k;
        if (o.type === "withdraw_free") return { ...k, status: "cancelled", note: "Đã rút trước khi chốt, không bị trừ điểm." };
        if (o.type === "mutual_requested") return { ...k, status: "mutual_pending", note: "Nếu bạn tập đồng ý, cả hai không bị trừ điểm." };
        if (o.type === "shift_requested") return { ...k, status: "shift_pending", note: "Đã gửi đề nghị dời 5–10 phút vào chat kèo." };
        const pts = o.delta === 0 ? "0 UT" : `${formatUt(o.delta)} UT`;
        const grace = o.usedGrace ? " (dùng thẻ ân hạn)" : "";
        if (o.newHostName) return { ...k, status: "left", note: `Bạn đã rút: ${pts}${grace}. Kèo vẫn diễn ra, ${o.newHostName} là host mới, chỗ của bạn mở lại.` };
        return { ...k, status: "cancelled", note: `Đã huỷ: ${pts}${grace}.` };
      })
    );
    if (o.type === "cancelled") {
      setUt((u) => Math.max(0, u + o.delta));
      if (o.usedGrace) setGraceUsed((g) => g + 1);
    }
    setTarget(null);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Kèo của tôi"
        description={`Điểm Uy tín hiện tại: ${formatUt(ut)} UT. Trước khi chốt, huỷ không bị trừ điểm. Sau khi chốt, nút Huỷ luôn hiện số điểm bị trừ.`}
        actions={
          <Button asChild size="sm">
            <Link href="/bang-keo">Tìm thêm kèo</Link>
          </Button>
        }
      />

      <div className="space-y-4">
        {keos.map((k) => {
          const stage = keoStage(k);
          const preview = cancelPreview(k);
          const when = new Date(k.startsAt).toLocaleString("vi-VN", { weekday: "short", hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit" });
          return (
            <Card key={k.id} className="shadow-sm" data-testid={`keo-${k.id}`}>
              <CardHeader className="flex flex-row items-start justify-between gap-3 pb-3">
                <div className="min-w-0">
                  <CardTitle className="text-base font-bold flex items-center gap-1.5">
                    {k.role === "host" && <Crown className="h-4 w-4 shrink-0" aria-label="Bạn là host" />}
                    <span className="truncate">{k.title}</span>
                  </CardTitle>
                  <CardDescription className="text-xs">
                    {k.role === "host" ? "Bạn là host" : "Bạn đã nhận kèo"} · {k.kind === "group" ? "Kèo nhóm" : "Kèo 1-1"}
                  </CardDescription>
                </div>
                <Badge variant={k.status === "cancelled" || k.status === "left" ? "secondary" : stage === "locked" ? "success" : "outline"} className="shrink-0">
                  {k.status !== "active" ? STATUS_LABEL[k.status] : stage === "locked" ? "Đã chốt" : "Chưa chốt"}
                </Badge>
              </CardHeader>

              <CardContent className="space-y-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-foreground shrink-0" />
                  <span>{when}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-foreground shrink-0" />
                  <span>{k.location}</span>
                </div>
                {k.note && <p className="text-foreground font-medium">{k.note}</p>}
              </CardContent>

              {k.status === "active" && (
                <CardFooter className="border-t border-border/70 pt-3 flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-muted-foreground">{preview.labelVi}</span>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="text-xs text-destructive hover:bg-destructive/10" onClick={() => setTarget(k)}>
                      {stage !== "locked" && k.role === "member" ? "Rút" : "Huỷ kèo"}
                    </Button>
                    {stage === "locked" && (
                      <Button size="sm" className="font-semibold gap-1.5">
                        <QrCode className="h-4 w-4" />
                        <span>Check-in</span>
                      </Button>
                    )}
                  </div>
                </CardFooter>
              )}
            </Card>
          );
        })}
      </div>

      <p className="text-[11.5px] text-muted-foreground">
        Đúng hẹn (trễ không quá {UT_CONFIG.TIME.LATE_GRACE_MIN} phút) +{formatUt(UT_CONFIG.RECOVERY.ON_TIME)} UT. Trễ 15–25 phút{" "}
        {formatUt(UT_CONFIG.PENALTY.LATE_15_25)} UT, quá 25 phút tính là vắng. Xem đủ luật ở{" "}
        <Link href="/vi-uy-tin" className="underline">Ví UT</Link>.
      </p>

      <CancelKeoSheet
        keo={target}
        open={!!target}
        onClose={() => setTarget(null)}
        onDone={done}
        graceUsedThisMonth={graceUsed}
      />
    </div>
  );
}
