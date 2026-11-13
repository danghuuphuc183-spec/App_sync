"use client";

import * as React from "react";
import { PageHeader } from "@/components/shared/page-header";
import { TrustMeter } from "@/components/shared/trust-meter";
import { TierBadge } from "@/components/shared/tier-badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UT_CONFIG, formatUt } from "@/features/trust/config";
import { computeUt, UT_EVENT_LABEL, type UtEvent } from "@/features/trust/ut-rules";
import { Shield, ArrowUpRight, ArrowDownRight, Minus, HeartHandshake, Crown, Users, Gift } from "lucide-react";
import { cn } from "@/lib/utils";

const daysAgo = (n: number, h = 6) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(h, 0, 0, 0);
  return d.toISOString();
};

/** Dữ liệu mẫu — backend thật sẽ trả về danh sách sự kiện UT của người dùng */
const SAMPLE_EVENTS: (UtEvent & { titleVi: string })[] = [
  { id: "e1", kind: "on_time", at: daysAgo(20), titleVi: "Chạy 10 km Landmark 81 cùng Minh Anh" },
  { id: "e2", kind: "cancel_early", at: daysAgo(16, 17), titleVi: "Gym chân – Fit24 Bình Thạnh", waiver: "grace" },
  { id: "e3", kind: "on_time", at: daysAgo(9), titleVi: "Interval bờ kè Thanh Đa" },
  { id: "e4", kind: "late_15_25", at: daysAgo(6), titleVi: "Calisthenics Công viên Tao Đàn (trễ 18 phút)" },
  { id: "e5", kind: "on_time", at: daysAgo(2), titleVi: "Long run Vinhomes Central Park" },
];

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleString("vi-VN", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });

const RULES: { delta: number; title: string; note: string }[] = [
  { delta: UT_CONFIG.RECOVERY.ON_TIME, title: "Đúng hẹn (trễ không quá 15 phút)", note: "Tối đa 1 lần/ngày và +1 UT/tuần" },
  { delta: 0, title: "Huỷ khi kèo chưa chốt", note: "Host từ chối người nhận, hoặc người nhận tự rút" },
  { delta: UT_CONFIG.PENALTY.CANCEL_EARLY, title: "Huỷ sớm (trước giờ tập hơn 30 phút)", note: "Kèo mở lại, người kia nhận kèo thay thế" },
  { delta: UT_CONFIG.PENALTY.CANCEL_LATE, title: "Huỷ trong vòng 30 phút", note: "Cũng áp dụng khi host huỷ rồi tạo lại kèo gần giống trong 2h" },
  { delta: UT_CONFIG.PENALTY.UNCONFIRMED, title: "Không xác nhận lần cuối trước T−30", note: "Kèo tự huỷ, người đã xác nhận được kèo thay thế ngay" },
  { delta: UT_CONFIG.PENALTY.LATE_15_25, title: "Đến trễ 15–25 phút", note: "Sau 15 phút người kia chọn: chờ / tự tập / tìm người thay" },
  { delta: UT_CONFIG.PENALTY.ABSENT_DECLARED, title: "Vắng có báo, hoặc trễ quá 25 phút", note: "Báo trong 24 giờ sau giờ tập" },
  { delta: UT_CONFIG.PENALTY.ABSENT_SILENT, title: "Vắng im lặng", note: "Không huỷ, không đến, không báo. Không được dùng thẻ ân hạn hay xin lỗi" },
  { delta: 0, title: "Hai bên cùng đồng ý huỷ", note: `${UT_CONFIG.MUTUAL_CANCEL_PER_MONTH} lần/tháng. Quá hạn mức: ${formatUt(UT_CONFIG.PENALTY.MUTUAL_OVER_QUOTA)} mỗi người. Cả hai cùng im lặng không check-in cũng tính vào đây` },
  { delta: 0, title: "Bất khả kháng", note: "Mưa dông có cảnh báo chính thức, địa điểm đóng cửa, app lỗi" },
];

export default function TrustWalletPage() {
  const { score, ledger } = React.useMemo(() => computeUt(SAMPLE_EVENTS), []);
  const titles = React.useMemo(() => new Map(SAMPLE_EVENTS.map((e) => [e.id, e.titleVi])), []);
  const graceUsed = SAMPLE_EVENTS.filter((e) => e.waiver === "grace" && new Date(e.at).getMonth() === new Date().getMonth()).length;
  const graceLeft = Math.max(0, UT_CONFIG.GRACE_PASSES_PER_MONTH - graceUsed);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Ví Uy tín (UT)"
        description={`Thang 0–10, mọi tài khoản bắt đầu ở ${UT_CONFIG.INITIAL}. Điểm tính trên các buổi trong ${UT_CONFIG.WINDOW_DAYS} ngày gần nhất. Không có cọc điểm.`}
        badge={<TierBadge score={score} />}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <TrustMeter currentScore={score} />
        </div>

        <Card className="border-border shadow-sm flex flex-col justify-between">
          <CardHeader className="space-y-1">
            <div className="flex items-center gap-2 text-primary font-bold text-sm">
              <HeartHandshake className="h-4 w-4" />
              <span>Thẻ ân hạn & lời xin lỗi</span>
            </div>
            <CardTitle className="text-xl font-bold">Thẻ ân hạn</CardTitle>
            <CardDescription className="text-xs">
              {UT_CONFIG.GRACE_PASSES_PER_MONTH} thẻ/tháng, xoá 1 lần phạt, không cần giải thích. Không dùng cho vắng im lặng.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-xl bg-muted/60 border border-border">
              <span className="text-xs font-medium">Còn lại tháng này</span>
              <span className="text-lg font-mono font-bold text-primary">
                {graceLeft} / {UT_CONFIG.GRACE_PASSES_PER_MONTH}
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground leading-normal">
              Lời xin lỗi được bạn tập chấp nhận: giảm {formatUt(UT_CONFIG.APOLOGY.REDUCE_BY)} UT mức phạt, {UT_CONFIG.APOLOGY.PER_MONTH} lần/tháng.
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border shadow-sm">
        <CardHeader className="border-b border-border/70 pb-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Shield className="h-5 w-5 text-foreground" />
                <span>Nhật ký uy tín</span>
              </CardTitle>
              <CardDescription className="text-xs mt-1">Chỉ thêm, không sửa hay xoá. Bắt đầu từ {UT_CONFIG.INITIAL} UT.</CardDescription>
            </div>
            <Badge variant="outline" className="text-xs shrink-0">{UT_CONFIG.WINDOW_DAYS} ngày gần nhất</Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {[...ledger].reverse().map(({ event, delta, balance, note }) => (
              <div key={event.id} className="p-4 sm:p-5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-muted text-foreground">
                    {delta > 0 ? <ArrowUpRight className="h-5 w-5" /> : delta < 0 ? <ArrowDownRight className="h-5 w-5" /> : <Minus className="h-4 w-4" />}
                  </div>
                  <div className="space-y-0.5 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{titles.get(event.id)}</p>
                    <p className="text-xs text-muted-foreground">
                      {UT_EVENT_LABEL[event.kind]}
                      {note ? ` · ${note}` : ""} · {fmtDate(event.at)}
                    </p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className={cn("text-sm font-mono font-bold", delta < 0 ? "text-destructive" : "text-foreground")}>
                    {delta === 0 ? "0" : formatUt(delta, { sign: true })} UT
                  </p>
                  <p className="text-[11px] text-muted-foreground">Còn {formatUt(balance)}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Luật huỷ kèo & phạt</CardTitle>
          <CardDescription className="text-xs">
            Áp dụng như nhau cho host và người nhận sau khi kèo đã chốt. Mỗi người chỉ bị phạt 1 lần/kèo, lấy mức nặng nhất. Điểm phạt không chuyển cho ai.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {RULES.map((r) => (
              <div key={r.title} className="p-3 rounded-lg border border-border bg-muted/20 space-y-1">
                <span className={cn("font-bold font-mono block", r.delta < 0 ? "text-destructive" : "text-foreground")}>
                  {r.delta === 0 ? "0 UT" : `${formatUt(r.delta, { sign: true })} UT`}
                </span>
                <p className="text-foreground font-semibold">{r.title}</p>
                <p className="text-muted-foreground text-[11px]">{r.note}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 text-xs">
        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2"><Crown className="h-4 w-4" /> Luật riêng cho host</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-muted-foreground">
            <p><b className="text-foreground">Rút khỏi kèo đã chốt:</b> kèo không bị huỷ. Quyền host chuyển cho thành viên UT cao nhất, chỗ trống mở lại. Host cũ bị phạt như một thành viên huỷ.</p>
            <p><b className="text-foreground">Sửa kèo:</b> dời quá {UT_CONFIG.TIME.MINOR_SHIFT_MAX_MIN} phút, đổi chỗ xa hơn {UT_CONFIG.HOST.MAJOR_MOVE_KM} km hoặc đổi môn cần người kia đồng ý. Nếu họ từ chối, họ rút không bị trừ, host tính như huỷ.</p>
            <p><b className="text-foreground">Huỷ rồi tạo lại để đổi người:</b> trong 2 giờ, cùng môn, lệch ≤ 1 giờ, cách ≤ 1 km → tính huỷ muộn.</p>
            <p><b className="text-foreground">Vắng kèo nhóm mình làm host</b> {UT_CONFIG.HOST.GROUP_ABSENT_LIMIT} lần/{UT_CONFIG.HOST.GROUP_ABSENT_LOOKBACK_DAYS} ngày → khoá tạo kèo nhóm {UT_CONFIG.HOST.GROUP_BAN_DAYS} ngày.</p>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2"><Users className="h-4 w-4" /> Hạn mức & xếp nhóm</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-muted-foreground">
            {(Object.keys(UT_CONFIG.BANDS) as (keyof typeof UT_CONFIG.BANDS)[]).map((b) => (
              <p key={b}><b className="text-foreground">{UT_CONFIG.BANDS[b].nameVi}:</b> {UT_CONFIG.BANDS[b].descriptionVi}</p>
            ))}
            <p>Hạn mức tính theo ngày lịch (00:00–24:00). Kèo đã tạo rồi huỷ vẫn tính.</p>
            <p>Người uy tín thấp không được xếp chung kèo nhóm với người mới (dưới {UT_CONFIG.NEWBIE_MAX_SESSIONS} buổi đúng hẹn).</p>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2"><Gift className="h-4 w-4" /> Gói bù cho người đã đến</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-muted-foreground">
            <p><b className="text-foreground">Tự tập có xác thực:</b> ở điểm hẹn ≥ {UT_CONFIG.COMPENSATION.SOLO_SESSION_MIN} phút → +1 chuỗi, +{UT_CONFIG.COMPENSATION.SOLO_SESSION_XU} Xu, 1 lần/ngày.</p>
            <p><b className="text-foreground">Bảo vệ chuỗi:</b> {UT_CONFIG.COMPENSATION.STREAK_PROTECT_PER_MONTH} lần/tháng.</p>
            <p><b className="text-foreground">Kèo thay thế:</b> kèo gần nhất bắt đầu trong 30 phút hoặc trong hôm nay.</p>
            <p><b className="text-foreground">Xu bồi thường:</b> +{UT_CONFIG.COMPENSATION.XU_PER_FLAKE} Xu từ quỹ thưởng, tối đa {UT_CONFIG.COMPENSATION.XU_MAX_PER_MONTH} Xu/tháng, cùng cặp 1 lần/{UT_CONFIG.COMPENSATION.SAME_PAIR_COOLDOWN_DAYS} ngày.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
