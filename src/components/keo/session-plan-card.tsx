"use client";

import * as React from "react";
import { CalendarClock, ChevronRight, Clock, Droplets, ExternalLink, Gauge, Info, MapPin, Mountain, Phone, ShieldCheck, Star, Dumbbell } from "lucide-react";
import { cn } from "@/lib/utils";
import type { MatchCandidate } from "@/features/match/candidates.data";
import { STRAVA_ROUTES, type StravaRoute } from "@/features/venues/routes.data";
import { SPORTS_VENUES_DATABASE, type SportsVenue } from "@/features/venues/venues.data";
import { gymPlan, runPlan, venueReviews, type Intensity } from "@/features/keo/session-plan";
import type { KeoPlace, TimeWindow } from "@/features/keo/keo.types";
import { BottomSheet } from "@/components/feed/bottom-sheet";
import { RouteMapMedia } from "@/components/feed/route-map-media";
import { formatKeoDay } from "@/features/keo/keo-date";

const INTENSITY_CLASS: Record<Intensity, string> = {
  Nhẹ: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300",
  Vừa: "bg-brand-100 text-brand-800 dark:bg-brand-900 dark:text-brand-200",
  Cao: "bg-black text-white dark:bg-white dark:text-black",
};

export function findRoute(place: KeoPlace | null) {
  return place ? STRAVA_ROUTES.find((r) => r.id === place.id) : undefined;
}
export function findVenue(place: KeoPlace | null) {
  return place ? SPORTS_VENUES_DATABASE.find((v) => v.id === place.id) : undefined;
}

function Row({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <p className="flex items-start gap-2 text-[12.5px] text-foreground">
      <span className="mt-0.5 shrink-0 text-brand dark:text-brand-sky [&>svg]:h-4 [&>svg]:w-4">{icon}</span>
      <span className="min-w-0">{children}</span>
    </p>
  );
}

function IntensityChip({ value, note }: { value: Intensity; note: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className={cn("shrink-0 rounded-lg px-2.5 py-0.5 text-[11px] font-bold", INTENSITY_CLASS[value])}>Cường độ {value.toLowerCase()}</span>
      <span className="text-[11.5px] text-muted-foreground truncate">{note}</span>
    </div>
  );
}

/**
 * Kế hoạch buổi tập với người được gợi ý.
 * Chạy/đạp: bản đồ cung đường + cự ly + pace + giờ + cường độ.
 * Gym: phòng tập + nhóm cơ của ngày + bài tập + số hiệp + giờ + cường độ + đánh giá phòng tập.
 */
export function SessionPlanBlock({ place, candidate, time }: { place: KeoPlace | null; candidate: MatchCandidate; time: TimeWindow }) {
  const [detailOpen, setDetailOpen] = React.useState(false);
  const route = findRoute(place);
  const venue = findVenue(place);

  if (route) {
    const p = runPlan(route, candidate, time);
    return (
      <div className="rounded-2xl border border-border overflow-hidden">
        <div className="relative aspect-[16/10]">
          <RouteMapMedia coords={route.coordinates} label={route.name.replace(/^Cung đường /, "")} aspect={16 / 10} />
        </div>
        <div className="grid grid-cols-3 divide-x divide-border border-b border-border text-center">
          {[
            ["Cự ly", `${p.distanceKm} km`],
            [route.sport === "cycling" ? "Tốc độ" : "Pace chung", p.pace],
            ["Thời lượng", `${p.durationMin} phút`],
          ].map(([k, v]) => (
            <div key={k} className="py-2">
              <p className="text-[10.5px] text-muted-foreground">{k}</p>
              <p className="text-[15px] font-extrabold font-display text-foreground">{v}</p>
            </div>
          ))}
        </div>
        <div className="p-3 space-y-1.5">
          <Row icon={<CalendarClock />}>
            <b>{formatKeoDay(time.day)} · {p.start} – {p.end}</b> <span className="text-muted-foreground">(gồm khởi động)</span>
          </Row>
          <Row icon={<MapPin />}>
            {route.name.replace(/^Cung đường /, "")} <span className="text-muted-foreground">· {route.district}</span>
          </Row>
          <Row icon={<Gauge />}>{p.paceNote}</Row>
          <Row icon={<Mountain />}>
            Độ cao +{route.elevationGainM} m · {route.surface} · <ShieldCheck className="inline h-3.5 w-3.5 text-foreground" /> An toàn {route.safetyScore}%
          </Row>
          <IntensityChip value={p.intensity} note={p.intensityNote} />
          <DetailButton onClick={() => setDetailOpen(true)}>Xem chi tiết cung đường</DetailButton>
        </div>
        <RouteDetailSheet open={detailOpen} onClose={() => setDetailOpen(false)} route={route} />
      </div>
    );
  }

  if (venue && venue.sport === "gym") {
    const p = gymPlan(venue, candidate, time);
    return (
      <div className="rounded-2xl border border-border p-3 space-y-2.5">
        <VenueHeader venue={venue} />
        <div className="rounded-xl bg-brand-50 dark:bg-brand-950/50 p-2.5 space-y-1.5">
          <p className="flex items-center gap-1.5 text-[13.5px] font-extrabold text-foreground">
            <Dumbbell className="h-4 w-4 text-foreground" /> {p.split.label}
          </p>
          <p className="text-[12px] text-muted-foreground">Nhóm cơ: {p.split.muscles}</p>
          <div className="flex flex-wrap gap-1">
            {p.split.exercises.map((e) => (
              <span key={e} className="rounded-lg bg-white dark:bg-black/40 border border-brand-200 dark:border-brand-800 px-2 py-0.5 text-[11px] font-semibold text-foreground">
                {e}
              </span>
            ))}
          </div>
          <p className="text-[12px] text-foreground">{p.sets}</p>
        </div>
        <Row icon={<CalendarClock />}>
          <b>{formatKeoDay(time.day)} · {p.start} – {p.end}</b> <span className="text-muted-foreground">({p.durationMin} phút)</span>
        </Row>
        <IntensityChip value={p.intensity} note={p.intensityNote} />
        <DetailButton onClick={() => setDetailOpen(true)}>Xem chi tiết & đánh giá phòng tập</DetailButton>
        <VenueDetailSheet open={detailOpen} onClose={() => setDetailOpen(false)} venue={venue} />
      </div>
    );
  }

  if (venue) {
    return (
      <div className="rounded-2xl border border-border p-3 space-y-2">
        <VenueHeader venue={venue} />
        <Row icon={<CalendarClock />}>
          <b>{formatKeoDay(time.day)} · {time.from} – {time.to}</b>
        </Row>
        <Row icon={<Gauge />}>Trình độ: {candidate.capabilities.level} · {candidate.capabilities.paceOrWeight}</Row>
        <DetailButton onClick={() => setDetailOpen(true)}>Xem chi tiết & đánh giá sân</DetailButton>
        <VenueDetailSheet open={detailOpen} onClose={() => setDetailOpen(false)} venue={venue} />
      </div>
    );
  }
  return null;
}

function VenueHeader({ venue }: { venue: SportsVenue }) {
  return (
    <div className="flex items-start gap-2.5">
      <div className="h-11 w-11 shrink-0 rounded-xl bg-muted text-foreground flex flex-col items-center justify-center leading-none">
        <Star className="h-3.5 w-3.5 fill-white" />
        <span className="text-[12px] font-extrabold mt-0.5">{venue.rating.toFixed(1)}</span>
      </div>
      <div className="min-w-0">
        <p className="text-[14px] font-bold text-foreground leading-snug">{venue.name}</p>
        <p className="text-[11.5px] text-muted-foreground truncate">
          {venue.reviewCount} đánh giá · {venue.priceRange} · {venue.district}
        </p>
      </div>
    </div>
  );
}

function DetailButton({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full mt-1 flex items-center justify-between rounded-xl border border-border px-3 py-2 text-[12.5px] font-bold text-brand dark:text-brand-sky hover:bg-muted active:scale-[0.99]"
    >
      {children}
      <ChevronRight className="h-4 w-4" />
    </button>
  );
}

/* ====================================================================== */
/* Chi tiết & đánh giá phòng tập / sân — cho người chưa đăng ký           */
/* ====================================================================== */
export function VenueDetailSheet({ open, onClose, venue }: { open: boolean; onClose: () => void; venue: SportsVenue }) {
  const { reviews, distribution } = venueReviews(venue);
  const maxD = Math.max(1, ...distribution);
  return (
    <BottomSheet open={open} onClose={onClose} title={venue.sport === "gym" ? "Chi tiết phòng tập" : "Chi tiết sân"} className="h-[88vh]" bodyClassName="p-4 pb-8 space-y-4">
      <div>
        <h3 className="text-[18px] font-extrabold text-foreground leading-snug">{venue.name}</h3>
        <p className="text-[12.5px] text-muted-foreground">{venue.address}</p>
      </div>

      <div className="flex items-start gap-2.5 rounded-xl bg-brand-50 dark:bg-brand-950/50 border border-brand-200 dark:border-brand-800 p-3">
        <Info className="h-4 w-4 shrink-0 text-foreground mt-0.5" />
        <p className="text-[12.5px] text-foreground">
          Chưa đăng ký {venue.sport === "gym" ? "phòng tập" : "sân"} này? Xem đánh giá, giá vé lẻ và giờ mở cửa — bạn có thể tập thử 1 buổi trước khi đăng ký tháng.
        </p>
      </div>

      {/* Đánh giá */}
      <div className="flex gap-4 items-center">
        <div className="text-center shrink-0">
          <p className="text-[36px] font-black font-display leading-none text-foreground">{venue.rating.toFixed(1)}</p>
          <div className="flex justify-center mt-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star key={i} className={cn("h-3.5 w-3.5", i <= Math.round(venue.rating) ?"fill-foreground text-foreground" :"text-neutral-300")} />
            ))}
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5">{venue.reviewCount} đánh giá</p>
        </div>
        <div className="flex-1 space-y-1">
          {distribution.map((n, i) => (
            <div key={i} className="flex items-center gap-2 text-[11px] text-muted-foreground">
              <span className="w-3">{5 - i}</span>
              <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                <div className="h-full rounded-full bg-brand" style={{ width: `${(n / maxD) * 100}%` }} />
              </div>
              <span className="w-8 text-right">{n}</span>
            </div>
          ))}
        </div>
      </div>

      <ul className="space-y-2.5">
        {reviews.map((r, i) => (
          <li key={i} className="rounded-xl border border-border p-3">
            <div className="flex items-center justify-between">
              <p className="text-[13px] font-bold text-foreground">{r.author}</p>
              <span className="text-[11px] text-muted-foreground">{r.when}</span>
            </div>
            <div className="flex my-0.5">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} className={cn("h-3 w-3", s <= r.stars ?"fill-foreground text-foreground" :"text-neutral-300")} />
              ))}
            </div>
            <p className="text-[12.5px] text-foreground">{r.text}</p>
          </li>
        ))}
      </ul>

      {/* Thông tin */}
      <div className="grid grid-cols-2 gap-2">
        <InfoTile label="Giá tham khảo" value={venue.priceRange} />
        <InfoTile label="Giờ mở cửa" value={venue.openHours} icon={<Clock className="h-3.5 w-3.5" />} />
      </div>
      <div className="space-y-1.5">
        <p className="text-[13px] font-bold text-foreground">Tiện ích</p>
        <div className="flex flex-wrap gap-1.5">
          {venue.amenities.map((a) => (
            <span key={a} className="rounded-lg bg-muted px-2.5 py-1 text-[11.5px] text-foreground">
              {a}
            </span>
          ))}
        </div>
      </div>
      <p className="text-[12.5px] text-muted-foreground">
        <b className="text-foreground">Phù hợp:</b> {venue.suitableFor}. {venue.highlights}
      </p>

      <div className="flex gap-2">
        <a href={`tel:${venue.phone.replace(/\s/g, "")}`} className="flex-1 rounded-lg bg-brand hover:bg-brand-700 text-white py-3 text-[13.5px] font-bold flex items-center justify-center gap-1.5">
          <Phone className="h-4 w-4" /> Gọi hỏi tập thử
        </a>
        <a
          href={venue.googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 rounded-lg border-2 border-brand text-brand dark:text-brand-sky dark:border-brand-sky py-2.5 text-[13.5px] font-bold flex items-center justify-center gap-1.5"
        >
          <ExternalLink className="h-4 w-4" /> Chỉ đường
        </a>
      </div>
      <p className="text-[11px] text-muted-foreground text-center">Nhận xét hiển thị là dữ liệu mẫu.</p>
    </BottomSheet>
  );
}

function InfoTile({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div className="rounded-xl bg-muted/70 p-2.5">
      <p className="text-[10.5px] text-muted-foreground flex items-center gap-1">
        {icon}
        {label}
      </p>
      <p className="text-[12.5px] font-bold text-foreground">{value}</p>
    </div>
  );
}

/* ====================================================================== */
/* Chi tiết cung đường                                                     */
/* ====================================================================== */
export function RouteDetailSheet({ open, onClose, route }: { open: boolean; onClose: () => void; route: StravaRoute }) {
  return (
    <BottomSheet open={open} onClose={onClose} title="Chi tiết cung đường" className="h-[88vh]" bodyClassName="pb-8">
      <div className="relative aspect-[4/3]">
        <RouteMapMedia coords={route.coordinates} label={route.name.replace(/^Cung đường /, "")} aspect={4 / 3} />
      </div>
      <div className="p-4 space-y-3">
        <div>
          <h3 className="text-[18px] font-extrabold text-foreground leading-snug">{route.name}</h3>
          <p className="text-[12.5px] text-muted-foreground">{route.subtitle}</p>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center">
          {[
            ["Cự ly", `${route.distanceKm} km`],
            ["Độ cao", `+${route.elevationGainM} m`],
            ["Độ khó", route.difficulty],
          ].map(([k, v]) => (
            <div key={k} className="rounded-xl bg-muted/70 py-2">
              <p className="text-[10.5px] text-muted-foreground">{k}</p>
              <p className="text-[14px] font-extrabold text-foreground">{v}</p>
            </div>
          ))}
        </div>
        <Row icon={<Clock />}>Thời gian ước tính {route.estimatedTime} · Mục tiêu {route.targetPaceOrSpeed}</Row>
        <Row icon={<ShieldCheck />}>An toàn {route.safetyScore}% · {route.surface}</Row>
        <Row icon={<Droplets />}>{route.waterStations} trạm nước sạch trên tuyến</Row>
        <div className="flex flex-wrap gap-1.5">
          {route.highlights.map((h) => (
            <span key={h} className="rounded-lg bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-brand-200 px-2.5 py-1 text-[11.5px] font-semibold">
              {h}
            </span>
          ))}
        </div>
        <p className="text-[12.5px] text-muted-foreground">
          Kỷ lục tuyến: <b className="text-foreground">{route.bestRecord.holder}</b> · {route.bestRecord.time} ({route.bestRecord.paceOrSpeed})
        </p>
      </div>
    </BottomSheet>
  );
}
