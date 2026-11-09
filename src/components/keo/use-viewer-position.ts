"use client";

import * as React from "react";
import { DEFAULT_POSITION } from "@/features/keo/keo.data";
import type { LatLng } from "@/features/keo/keo.types";

/** Vị trí người dùng để sắp kèo/địa điểm theo khoảng cách. Không có GPS → dùng vị trí mặc định. */
export function useViewerPosition() {
  const [position, setPosition] = React.useState<LatLng>(DEFAULT_POSITION);
  const [source, setSource] = React.useState<"default" | "gps">("default");

  React.useEffect(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (p) => {
        const pos: LatLng = [p.coords.latitude, p.coords.longitude];
        // Chỉ dùng GPS khi đang ở khu vực TP.HCM (dữ liệu kèo hiện chỉ có ở đây)
        if (Math.abs(pos[0] - 10.78) < 0.6 && Math.abs(pos[1] - 106.7) < 0.6) {
          setPosition(pos);
          setSource("gps");
        }
      },
      () => undefined,
      { timeout: 6000, maximumAge: 60_000 }
    );
  }, []);

  return { position, source };
}
