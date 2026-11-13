"use client";

import * as React from "react";
import { BottomSheet } from "@/components/feed/bottom-sheet";
import { UT_CONFIG, formatUt } from "@/features/trust/config";
import { cancelPreview, canUseGrace, hostLeaves, keoStage, type Member } from "@/features/trust/ut-rules";
import { AlertTriangle, CalendarClock, Crown, Handshake, ShieldCheck, Ticket } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CancelableKeo {
  id: string;
  title: string;
  startsAt: string;
  lockedAt?: string;
  acceptedBy?: string[];
  kind: "personal" | "group";
  /** bạn là host hay người nhận */
  role: "host" | "member";
  hostId: string;
  members: (Member & { name: string })[];
}

export type CancelOutcome =
  | { type: "withdraw_free" }
  | { type: "mutual_requested" }
  | { type: "shift_requested" }
  | { type: "cancelled"; delta: number; usedGrace: boolean; newHostName?: string };

export function CancelKeoSheet({
  keo,
  open,
  onClose,
  onDone,
  mutualUsedThisMonth = 0,
  graceUsedThisMonth = 0,
}: {
  keo: CancelableKeo | null;
  open: boolean;
  onClose: () => void;
  onDone: (o: CancelOutcome) => void;
  mutualUsedThisMonth?: number;
  graceUsedThisMonth?: number;
}) {
  const [useGrace, setUseGrace] = React.useState(false);
  React.useEffect(() => setUseGrace(false), [keo?.id]);
  if (!keo) return null;

  const now = new Date();
  const stage = keoStage(keo);
  const preview = cancelPreview(keo, now);
  const unilateralKind = preview.nowDelta === UT_CONFIG.PENALTY.CANCEL_LATE ? "cancel_late" : "cancel_early";
  const grace = canUseGrace(unilateralKind, graceUsedThisMonth);
  const mutualLeft = Math.max(0, UT_CONFIG.MUTUAL_CANCEL_PER_MONTH - mutualUsedThisMonth);
  const minutesLeft = Math.round((Date.parse(keo.startsAt) - now.getTime()) / 60_000);
  const handover =
    keo.role === "host" && stage === "locked"
      ? hostLeaves({ ...keo, members: keo.members }, now.toISOString())
      : null;
  const newHost = handover?.newHostId ? keo.members.find((m) => m.id === handover.newHostId) : undefined;
  const finalDelta = useGrace && grace.ok ? 0 : preview.nowDelta;

  return (
    <BottomSheet open={open} onClose={onClose} title={stage === "locked" ? "Huỷ kèo đã chốt" : "Rút khỏi kèo"} bodyClassName="p-4 pb-6 space-y-3">
      <div>
        <p className="text-[14px] font-bold text-foreground">{keo.title}</p>
        <p className="text-[12.5px] text-muted-foreground">
          {stage === "locked" ? "Đã chốt" : stage === "pending" ? "Có người nhận, chưa chốt" : "Chưa ai nhận"} ·{" "}
          {minutesLeft > 0 ? `còn ${minutesLeft >= 120 ? `${Math.round(minutesLeft / 60)} giờ` : `${minutesLeft} phút`}` : "đã tới giờ tập"}
        </p>
      </div>

      <div
        role="status"
        className={cn(
          "rounded-xl border p-3 text-[13px] font-bold flex items-start gap-2",
          preview.nowDelta < 0 ? "border-destructive/40 bg-destructive/5 text-destructive" : "border-border bg-muted text-foreground"
        )}
      >
        {preview.nowDelta < 0 ? <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" /> : <ShieldCheck className="h-4 w-4 shrink-0 mt-0.5" />}
        <span>{preview.labelVi}</span>
      </div>

      {stage !== "locked" ? (
        <button
          onClick={() => onDone({ type: "withdraw_free" })}
          className="w-full rounded-lg border border-border py-3 text-[14px] font-bold text-foreground hover:bg-muted"
        >
          {keo.role === "host" ? "Huỷ kèo (không bị trừ điểm)" : "Rút khỏi kèo (không bị trừ điểm)"}
        </button>
      ) : (
        <>
          <p className="text-[12px] font-semibold text-muted-foreground">Thử cách khác trước khi huỷ</p>
          <button
            onClick={() => onDone({ type: "shift_requested" })}
            className="w-full rounded-xl border border-border p-3 text-left hover:bg-muted flex gap-3"
          >
            <CalendarClock className="h-5 w-5 shrink-0 text-foreground" />
            <span className="text-[13px]">
              <b className="block text-foreground">Đề nghị dời 5–10 phút</b>
              <span className="text-muted-foreground">Bạn tập đồng ý trong chat kèo thì không ai bị trừ điểm.</span>
            </span>
          </button>
          <button
            onClick={() => onDone({ type: "mutual_requested" })}
            disabled={keo.kind === "group"}
            className="w-full rounded-xl border border-border p-3 text-left hover:bg-muted flex gap-3 disabled:opacity-50"
          >
            <Handshake className="h-5 w-5 shrink-0 text-foreground" />
            <span className="text-[13px]">
              <b className="block text-foreground">Đề nghị cùng huỷ</b>
              <span className="text-muted-foreground">
                {keo.kind === "group"
                  ? "Chỉ áp dụng cho kèo 1-1."
                  : mutualLeft > 0
                    ? `Bạn tập đồng ý thì cả hai không bị trừ. Còn ${mutualLeft}/${UT_CONFIG.MUTUAL_CANCEL_PER_MONTH} lần tháng này.`
                    : `Đã hết ${UT_CONFIG.MUTUAL_CANCEL_PER_MONTH} lần tháng này: mỗi người ${formatUt(UT_CONFIG.PENALTY.MUTUAL_OVER_QUOTA)} UT.`}
              </span>
            </span>
          </button>

          {keo.role === "host" && (
            <div className="rounded-xl bg-muted p-3 text-[12.5px] text-foreground flex gap-2">
              <Crown className="h-4 w-4 shrink-0 mt-0.5" />
              <span>
                Bạn là host: kèo <b>không bị huỷ</b>.{" "}
                {newHost ? (
                  <>Quyền host chuyển cho <b>{newHost.name}</b> (UT cao nhất), chỗ của bạn mở lại trên bảng kèo.</>
                ) : (
                  <>Kèo mở lại trên bảng kèo.</>
                )}
                {handover?.soloChoice && ` ${newHost?.name ?? "Bạn tập"} được chọn kèo thay thế hoặc tự tập có xác thực.`}
              </span>
            </div>
          )}

          <label className={cn("flex items-center gap-3 rounded-xl border border-border p-3", !grace.ok && "opacity-50")}>
            <Ticket className="h-5 w-5 shrink-0 text-foreground" />
            <span className="flex-1 text-[12.5px]">
              <b className="block text-foreground">Dùng thẻ ân hạn</b>
              <span className="text-muted-foreground">{grace.ok ? `Còn ${UT_CONFIG.GRACE_PASSES_PER_MONTH - graceUsedThisMonth} thẻ tháng này, xoá mức phạt lần này.` : grace.reasonVi}</span>
            </span>
            <input
              type="checkbox"
              aria-label="Dùng thẻ ân hạn"
              disabled={!grace.ok}
              checked={useGrace && grace.ok}
              onChange={(e) => setUseGrace(e.target.checked)}
              className="h-5 w-5 accent-brand"
            />
          </label>

          <button
            onClick={() => onDone({ type: "cancelled", delta: finalDelta, usedGrace: useGrace && grace.ok, newHostName: newHost?.name })}
            className="w-full rounded-lg bg-destructive hover:bg-destructive/90 text-white py-3 text-[14px] font-bold"
          >
            {keo.role === "host" ? "Rút khỏi kèo" : "Huỷ một phía"} · {finalDelta === 0 ? "0 UT" : `${formatUt(finalDelta)} UT`}
          </button>
          <p className="text-[11.5px] text-muted-foreground text-center">
            Không huỷ mà không đến: {formatUt(UT_CONFIG.PENALTY.ABSENT_DECLARED)} UT nếu báo trong 24h, {formatUt(UT_CONFIG.PENALTY.ABSENT_SILENT)} UT nếu im lặng.
          </p>
        </>
      )}
    </BottomSheet>
  );
}
