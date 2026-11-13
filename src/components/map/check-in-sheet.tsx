"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { Loader2, LocateFixed, MapPinOff, Radio, ShieldCheck, X } from "lucide-react";
import {
  ARRIVAL_RADIUS_M,
  VISIBLE_RADIUS_M,
  distanceMeters,
  formatDistance,
  offsetMeters,
  type LatLng,
  type LiveSpot,
} from "@/features/live/live-session";
import { locateUser } from "./use-live-session";

type Step =
  | { kind: "consent" }
  | { kind: "locating" }
  | { kind: "too_far"; distanceM: number }
  | { kind: "no_gps" };

/**
 * Xác nhận "Bắt đầu tập tại đây": xin quyền chia sẻ vị trí và kiểm tra người dùng đã tới điểm tập.
 */
export function CheckInSheet({
  spot,
  onClose,
  onConfirm,
}: {
  spot: LiveSpot;
  onClose: () => void;
  onConfirm: (myPos: LatLng, realGps: boolean) => void;
}) {
  const [step, setStep] = React.useState<Step>({ kind: "consent" });

  const startWithGps = async () => {
    setStep({ kind: "locating" });
    try {
      const pos = await locateUser();
      const d = distanceMeters(pos, spot.position);
      if (d <= ARRIVAL_RADIUS_M) onConfirm(pos, true);
      else setStep({ kind: "too_far", distanceM: d });
    } catch {
      setStep({ kind: "no_gps" });
    }
  };

  // Chế độ demo: đặt bạn cách điểm tập ~40 m.
  const startDemo = () => onConfirm(offsetMeters(spot.position, -30, -25), false);

  return createPortal(
    <div className="fixed inset-0 z-[1200] bg-black/50 flex items-end justify-center animate-in fade-in duration-150" onClick={onClose}>
      <div
        role="dialog"
        aria-label="Bắt đầu tập tại đây"
        className="w-full max-w-md bg-background rounded-t-3xl p-5 pb-7 space-y-4 animate-in slide-in-from-bottom duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-brand-700">Bắt đầu tập tại đây</p>
            <h3 className="text-base font-bold text-foreground leading-snug">{spot.name}</h3>
          </div>
          <button onClick={onClose} aria-label="Đóng" className="h-8 w-8 shrink-0 rounded-full hover:bg-muted flex items-center justify-center">
            <X className="h-4 w-4" />
          </button>
        </div>

        {(step.kind === "consent" || step.kind === "locating") && (
          <>
            <ul className="space-y-2.5 text-[13px] text-foreground">
              <li className="flex gap-2.5">
                <Radio className="h-4.5 w-4.5 shrink-0 text-foreground mt-0.5" />
                <span>
                  Vị trí của bạn được hiển thị cho người tập <b>cùng môn</b> trong bán kính{" "}
                  <b>{formatDistance(VISIBLE_RADIUS_M)}</b> để mời ghép đội.
                </span>
              </li>
              <li className="flex gap-2.5">
                <LocateFixed className="h-4.5 w-4.5 shrink-0 text-foreground mt-0.5" />
                <span>
                  Dành cho người <b>đã tới nơi</b> và chuẩn bị tập (trong vòng {ARRIVAL_RADIUS_M} m từ điểm tập).
                </span>
              </li>
              <li className="flex gap-2.5">
                <ShieldCheck className="h-4.5 w-4.5 shrink-0 text-foreground mt-0.5" />
                <span>Tự động dừng chia sẻ khi bạn bấm “Kết thúc”.</span>
              </li>
            </ul>
            <button
              onClick={startWithGps}
              disabled={step.kind === "locating"}
              className="w-full rounded-lg bg-brand-600 hover:bg-brand-700 disabled:opacity-70 text-white font-bold py-3 text-sm flex items-center justify-center gap-2"
            >
              {step.kind === "locating" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Radio className="h-4 w-4" />}
              {step.kind === "locating" ? "Đang xác định vị trí..." : "Bật chia sẻ vị trí & bắt đầu"}
            </button>
          </>
        )}

        {(step.kind === "too_far" || step.kind === "no_gps") && (
          <>
            <div className="flex gap-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 p-3">
              <MapPinOff className="h-5 w-5 shrink-0 text-foreground mt-0.5" />
              <p className="text-[13px] text-foreground leading-snug">
                {step.kind === "too_far"
                  ? `Bạn đang cách điểm tập ${formatDistance(step.distanceM)}. Hãy tới nơi (trong vòng ${ARRIVAL_RADIUS_M} m) rồi bật lại nhé.`
                  : "Không lấy được vị trí. Hãy cho phép trình duyệt truy cập vị trí và thử lại."}
              </p>
            </div>
            <div className="flex gap-2">
              <button onClick={startWithGps} className="flex-1 rounded-lg border border-border py-2.5 text-[13px] font-bold text-foreground hover:bg-muted">
                Thử lại
              </button>
              <button onClick={startDemo} className="flex-1 rounded-lg bg-brand hover:bg-brand-700 text-white py-2.5 text-[13px] font-bold">
                Dùng vị trí mô phỏng
              </button>
            </div>
            <p className="text-[11px] text-muted-foreground text-center">Vị trí mô phỏng chỉ dùng để trải nghiệm thử tính năng.</p>
          </>
        )}
      </div>
    </div>,
    document.body
  );
}
