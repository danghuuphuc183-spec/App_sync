"use client";

import * as React from "react";
import type { Keo } from "@/features/keo/keo.types";
import { hostOf, hostTrust } from "@/features/keo/keo.data";
import { useKeoStore } from "@/features/keo/use-keo-store";
import { sysMsg, userMsg } from "@/features/keo/keo-chat";
import { toCancelable } from "@/features/keo/keo-membership";
import { formatUt } from "@/features/trust/config";
import { CancelKeoSheet, type CancelableKeo, type CancelOutcome } from "./cancel-keo-sheet";

const ME_UT = 8.5;

/**
 * Huỷ / rút khỏi một kèo trên Lên kèo, dùng màn Huỷ kèo có luật UT (D24, D36).
 * - Người nhận: chưa chốt (còn hơn 24 giờ) rút không bị trừ; đã chốt bị trừ theo bảng phạt. Chỗ mở lại cho người khác.
 * - Host: kèo 1:1 bị huỷ; kèo nhóm đã chốt thì quyền host chuyển cho người UT cao nhất (H2).
 * Trả về `start(keo)` để mở màn huỷ và `element` để render.
 */
export function useCancelKeo(onFinished?: (summaryVi: string) => void) {
  const store = useKeoStore();
  const [target, setTarget] = React.useState<{
    keo: Keo;
    data: CancelableKeo;
  } | null>(null);

  const who = React.useCallback(
    (keo: Keo) => (id: string) => ({
      name: id === "me" ? "Bạn" : (hostOf(id)?.name ?? keo.guestProfiles?.[id]?.name ?? "Bạn tập"),
      ut: id === "me" ? ME_UT : hostTrust(id),
    }),
    []
  );

  const start = (keo: Keo) => setTarget({ keo, data: toCancelable(keo, "me", who(keo)) });

  const done = (o: CancelOutcome) => {
    if (!target) return;
    const { keo, data } = target;
    const hostName = hostOf(keo.hostId)?.name ?? "host";
    const isHost = data.role === "host";
    let summary = "";

    if (o.type === "shift_requested") {
      store.appendChat(keo.id, [userMsg("me", "Mình xin dời giờ 5–10 phút được không? Đồng ý thì cả hai không bị trừ điểm.")]);
      summary = "Đã gửi đề nghị dời 5–10 phút vào chat kèo.";
    } else if (o.type === "mutual_requested") {
      store.appendChat(keo.id, [
        userMsg("me", "Mình có việc đột xuất, mình đề nghị cùng huỷ kèo này nhé. Bạn đồng ý thì cả hai không bị trừ điểm."),
        sysMsg(`Đang chờ ${isHost ? "bạn tập" : hostName} đồng ý cùng huỷ.`),
      ]);
      summary = "Đã gửi đề nghị cùng huỷ. Đang chờ bên kia đồng ý.";
    } else {
      const delta = o.type === "cancelled" ? o.delta : 0;
      const pts = delta === 0 ? "không bị trừ điểm" : `${formatUt(delta)} UT`;
      const grace = o.type === "cancelled" && o.usedGrace ? " (dùng thẻ ân hạn)" : "";
      if (!isHost) {
        store.leave(keo.id);
        store.appendChat(keo.id, [sysMsg(`Bạn đã rút khỏi kèo: ${pts}${grace}. ${hostName} đã nhận thông báo; chỗ của bạn mở lại trên bảng kèo.`)]);
        summary = `Đã rút khỏi "${data.title}": ${pts}${grace}.`;
      } else if (o.type === "cancelled" && o.newHostName) {
        store.removeKeo(keo.id);
        summary = `Bạn đã rút: ${pts}${grace}. Kèo vẫn diễn ra, ${o.newHostName} là host mới.`;
      } else {
        store.updateKeo(keo.id, (k) => ({ ...k, status: "cancelled" }));
        store.appendChat(keo.id, [sysMsg(`Bạn đã huỷ kèo: ${pts}${grace}. Mọi người trong kèo đã nhận thông báo.`)]);
        summary = `Đã huỷ "${data.title}": ${pts}${grace}.`;
      }
    }
    setTarget(null);
    onFinished?.(summary);
  };

  const element = <CancelKeoSheet keo={target?.data ?? null} open={!!target} onClose={() => setTarget(null)} onDone={done} />;

  return { start, element };
}
