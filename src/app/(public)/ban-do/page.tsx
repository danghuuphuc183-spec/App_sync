"use client";

import dynamic from "next/dynamic";
import { Map } from "lucide-react";

// Leaflet cần window → chỉ render phía client
const InteractiveRouteMap = dynamic(
  () => import("@/components/map/interactive-route-map").then((mod) => mod.InteractiveRouteMap),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full bg-muted/40 animate-pulse flex flex-col items-center justify-center text-muted-foreground text-xs gap-2">
        <Map className="h-8 w-8 text-primary animate-bounce" />
        <span>Đang nạp bản đồ...</span>
      </div>
    ),
  }
);

/**
 * Bản đồ toàn màn hình: chiếm toàn bộ phần dưới header (h-14), chạy xuống dưới thanh điều hướng.
 * `-mb-20` triệt tiêu khoảng đệm pb-20 của MobileContainer để không bị cuộn.
 */
export default function MapPage() {
  return (
    <div className="relative w-full h-[calc(100dvh-3.5rem)] -mb-20">
      <InteractiveRouteMap />
    </div>
  );
}
