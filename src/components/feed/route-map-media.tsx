import * as React from "react";
import { projectRoute } from "@/features/feed/feed.utils";
import type { FeedPost, LatLng } from "@/features/feed/feed.types";

const W = 400;

/**
 * "Ảnh quãng đường": vẽ tuyến GPS lên nền bản đồ cách điệu theo màu SYNESIS,
 * kèm số liệu buổi tập (giống ảnh hoạt động của Strava).
 */
export function RouteMapMedia({
  coords,
  label,
  activity,
  compact = false,
  aspect = 0.8,
}: {
  coords: LatLng[];
  label: string;
  activity?: FeedPost["activity"];
  /** Ô lưới nhỏ trên hồ sơ: ẩn nhãn địa điểm */
  compact?: boolean;
  /** Tỉ lệ rộng/cao của khung chứa (mặc định 4:5 như ảnh bài viết) để bản đồ không bị cắt */
  aspect?: number;
}) {
  const H = Math.round(W / aspect);
  const uid = React.useId().replace(/:/g, "");
  // Chừa khoảng phía trên cho nhãn địa điểm và phía dưới cho bảng số liệu
  const { d, start, end } = React.useMemo(() => {
    const top = compact ? 0 : 44;
    const bottom = activity ? 96 : 16;
    return projectRoute(coords, W, H - top - bottom, 32, top);
  }, [coords, activity, compact, H]);

  return (
    <div className="relative w-full h-full bg-brand-50 dark:bg-brand-950">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 w-full h-full"
        role="img"
        aria-label={`Bản đồ quãng đường: ${label}`}
      >
        <defs>
          <pattern
            id={`grid-${uid}`}
            width="36"
            height="36"
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(18)"
          >
            <path
              d="M 36 0 L 0 0 0 36"
              fill="none"
              className="stroke-brand-200 dark:stroke-brand-900"
              strokeWidth="1.2"
            />
          </pattern>
        </defs>
        <rect width={W} height={H} fill={`url(#grid-${uid})`} />
        {/* sông / đường lớn cách điệu */}
        <path
          d={`M -20 ${H * 0.72} C ${W * 0.3} ${H * 0.6}, ${W * 0.55} ${H * 0.95}, ${W + 20} ${H * 0.78}`}
          className="stroke-brand-200 dark:stroke-brand-800"
          strokeWidth="26"
          fill="none"
          opacity={0.7}
        />
        <path
          d={`M ${W * 0.18} -10 L ${W * 0.3} ${H + 10}`}
          className="stroke-white dark:stroke-brand-900"
          strokeWidth="9"
          fill="none"
          opacity={0.9}
        />
        <path
          d={`M -10 ${H * 0.28} L ${W + 10} ${H * 0.2}`}
          className="stroke-white dark:stroke-brand-900"
          strokeWidth="7"
          fill="none"
          opacity={0.9}
        />

        <path
          d={d}
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="11"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d={d}
          fill="none"
          stroke="#0567E1"
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle
          cx={start[0]}
          cy={start[1]}
          r="9"
          fill="#39A1F4"
          stroke="#FFFFFF"
          strokeWidth="3.5"
        />
        <circle
          cx={end[0]}
          cy={end[1]}
          r="8"
          fill="#000000"
          stroke="#FFFFFF"
          strokeWidth="3.5"
        />
      </svg>

      {!compact && (
        <div className="absolute top-3 left-3 max-w-[75%] rounded-full bg-white/90 dark:bg-black/70 backdrop-blur px-2.5 py-1 text-[11px] font-semibold text-foreground truncate">
          📍 {label}
        </div>
      )}

      {activity && (
        <div className="absolute bottom-3 inset-x-3 grid grid-cols-3 rounded-2xl bg-white/95 dark:bg-black/80 backdrop-blur shadow-md divide-x divide-border">
          {[
            [
              "Quãng đường",
              activity.distanceKm !== undefined
                ? `${activity.distanceKm} km`
                : "—",
            ],
            [
              activity.pace?.includes("km/h") ? "Tốc độ" : "Pace",
              activity.pace ?? "—",
            ],
            ["Thời gian", activity.duration],
          ].map(([k, v]) => (
            <div key={k} className="px-2 py-2 text-center">
              <p className="text-[10px] text-muted-foreground">{k}</p>
              <p className="text-[14px] font-extrabold text-foreground font-display leading-tight">
                {v}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
