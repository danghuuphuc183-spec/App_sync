"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { Map, Shield } from "lucide-react";

// Dynamically import map to prevent SSR Leaflet window errors
const InteractiveRouteMap = dynamic(
  () =>
    import("@/components/map/interactive-route-map").then(
      (mod) => mod.InteractiveRouteMap
    ),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[360px] rounded-3xl bg-muted/40 animate-pulse flex flex-col items-center justify-center text-muted-foreground text-xs gap-2 border border-border">
        <Map className="h-8 w-8 text-primary animate-bounce" />
        <span>Đang nạp dữ liệu bản đồ Việt Nam & toàn cầu...</span>
      </div>
    ),
  }
);

export default function MapPage() {
  return (
    <div className="flex flex-col w-full px-3 py-3 space-y-4 pb-8">
      {/* Title & Introduction */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black tracking-tight text-[#000f22] dark:text-white">
              Bản Đồ Cung Đường
            </h1>
            <p className="text-[11px] text-muted-foreground">
              GPS thời gian thực, khảo sát độ dốc & trạm an toàn đô thị
            </p>
          </div>
        </div>
      </div>

      {/* Main Interactive Map & Simulator */}
      <InteractiveRouteMap />

      {/* Urban Safety Guide */}
      <div className="rounded-3xl border border-border bg-card p-3.5 space-y-2 text-xs shadow-xs">
        <div className="font-bold text-foreground flex items-center gap-1.5">
          <Shield className="h-4 w-4 text-foreground stroke-[2]" />
          <span>Tiêu chuẩn Cung đường Kỷ luật & An toàn 2026</span>
        </div>
        <div className="grid grid-cols-2 gap-2 text-[11px] text-muted-foreground pt-1">
          <div className="p-2.5 rounded-2xl bg-muted/50 space-y-1">
            <span className="font-bold text-foreground flex items-center gap-1">
              Vòi nước sạch
            </span>
            <span className="text-[10px] leading-relaxed">Trạm nước uống công cộng được kiểm nghiệm vệ sinh.</span>
          </div>
          <div className="p-2.5 rounded-2xl bg-muted/50 space-y-1">
            <span className="font-bold text-foreground flex items-center gap-1">
              Hỗ trợ SOS
            </span>
            <span className="text-[10px] leading-relaxed">Liên kết chốt bảo vệ đô thị & cứu thương lưu động.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
