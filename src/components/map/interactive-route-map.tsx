"use client";

import * as React from "react";
import Link from "next/link";
import type * as Leaflet from "leaflet";
import {
  Bookmark,
  ChevronDown,
  Clock,
  ExternalLink,
  Layers,
  LocateFixed,
  MapPin,
  Pause,
  Play,
  Radio,
  RotateCcw,
  Search,
  ShieldCheck,
  SquarePen,
  Star,
  X,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { POPULAR_GROUP_SPORTS, type SportKey } from "@/features/sports/sports.data";
import { STRAVA_ROUTES, type StravaRoute } from "@/features/venues/routes.data";
import {
  SPORTS_VENUES_DATABASE,
  DISTRICT_LIST,
  type SportsVenue,
  type DistrictName,
} from "@/features/venues/venues.data";
import { ARRIVAL_RADIUS_M, type LatLng, type LiveSpot } from "@/features/live/live-session";
import { useLiveSession } from "./use-live-session";
import { CheckInSheet } from "./check-in-sheet";
import { LiveSessionPanel } from "./live-session-panel";

type BaseLayer = "map" | "satellite";

const SPORT_EMOJI: Record<string, string> = {
  running: "🏃",
  cycling: "🚴",
  gym: "🏋️",
  pickleball: "🏓",
  badminton: "🏸",
  table_tennis: "🏓",
  football: "⚽",
  basketball: "🏀",
};

const LENGTH_FILTERS = [
  { id: "all", label: "Độ dài", test: () => true },
  { id: "short", label: "< 10 km", test: (km: number) => km < 10 },
  { id: "mid", label: "10–25 km", test: (km: number) => km >= 10 && km <= 25 },
  { id: "long", label: "> 25 km", test: (km: number) => km > 25 },
] as const;
const DIFFICULTY_FILTERS = ["Khó khăn", "Dễ", "Vừa phải", "Thử thách"] as const;
const SAVED_KEY = "sync.savedSpots.v1";

/** SYNESIS: đường/điểm đang chọn = Royal Blue, còn lại = Sky Blue, vị trí của bạn = đen */
const BRAND = "#0567E1";
const BRAND_SKY = "#39A1F4";
const ME = "#000000";

function loadSaved(): string[] {
  try {
    return JSON.parse(window.localStorage.getItem(SAVED_KEY) ?? "[]") as string[];
  } catch {
    return [];
  }
}

function avatarIcon(L: typeof Leaflet, src: string, opts: { size: number; ring: string; pulse?: boolean; label?: string }) {
  const { size, ring, pulse, label } = opts;
  return L.divIcon({
    className: "sync-avatar-pin",
    html: `
      <div style="position:relative;width:${size}px;height:${size}px;">
        ${pulse ? `<div class="sync-pulse" style="position:absolute;inset:0;border-radius:9999px;background:${ring};"></div>` : ""}
        <img src="${src}" alt="" style="position:relative;width:${size}px;height:${size}px;border-radius:9999px;object-fit:cover;border:3px solid ${ring};box-shadow:0 4px 10px rgba(0,0,0,.35);background:#fff;" />
        ${label ? `<div style="position:absolute;left:50%;top:${size + 2}px;transform:translateX(-50%);white-space:nowrap;background:#fff;color:#111;font:700 10px/1.2 system-ui;padding:2px 6px;border-radius:9999px;box-shadow:0 2px 6px rgba(0,0,0,.25);">${label}</div>` : ""}
      </div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

function ElevationSpark({ points, className }: { points: number[]; className?: string }) {
  if (points.length < 2) return null;
  const max = Math.max(...points);
  const min = Math.min(...points);
  const span = max - min || 1;
  const d = points
    .map((p, i) => `${(i / (points.length - 1)) * 100},${30 - ((p - min) / span) * 26}`)
    .join(" L ");
  return (
    <svg viewBox="0 0 100 32" preserveAspectRatio="none" className={className} aria-hidden>
      <path d={`M 0,32 L ${d} L 100,32 Z`} fill={BRAND} fillOpacity={0.18} />
      <path d={`M ${d}`} fill="none" stroke={BRAND} strokeWidth={2} vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

export function InteractiveRouteMap() {
  const mapContainerRef = React.useRef<HTMLDivElement>(null);
  const LRef = React.useRef<typeof Leaflet | null>(null);
  const mapRef = React.useRef<Leaflet.Map | null>(null);
  const baseLayerRef = React.useRef<Leaflet.Layer[]>([]);
  const contentGroupRef = React.useRef<Leaflet.LayerGroup | null>(null);
  const liveGroupRef = React.useRef<Leaflet.LayerGroup | null>(null);
  const runnerMarkerRef = React.useRef<Leaflet.Marker | null>(null);
  const carouselRef = React.useRef<HTMLDivElement>(null);
  const [mapReady, setMapReady] = React.useState(false);

  // ---- Bộ lọc & lựa chọn ----
  const [selectedSport, setSelectedSport] = React.useState<SportKey>("running");
  const [isSportMenuOpen, setIsSportMenuOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedDistrict, setSelectedDistrict] = React.useState<DistrictName>("Tất cả");
  const [lengthIdx, setLengthIdx] = React.useState(0);
  const [difficultyIdx, setDifficultyIdx] = React.useState(0);
  const [savedOnly, setSavedOnly] = React.useState(false);
  const [savedIds, setSavedIds] = React.useState<string[]>([]);
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [isSheetExpanded, setIsSheetExpanded] = React.useState(false);
  const [baseLayer, setBaseLayer] = React.useState<BaseLayer>("map");
  const [checkInSpot, setCheckInSpot] = React.useState<LiveSpot | null>(null);

  // ---- Mô phỏng GPS cung đường (tính năng cũ) ----
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [runnerProgress, setRunnerProgress] = React.useState(0);

  const live = useLiveSession(2);
  const isLive = live.state.phase !== "idle";

  React.useEffect(() => setSavedIds(loadSaved()), []);

  const isRouteMode = selectedSport === "running" || selectedSport === "cycling";
  const sportMeta = POPULAR_GROUP_SPORTS.find((s) => s.key === selectedSport);

  const routes = React.useMemo(() => {
    if (!isRouteMode) return [];
    const q = searchQuery.trim().toLowerCase();
    const lengthTest = LENGTH_FILTERS[lengthIdx]!.test;
    const diff = DIFFICULTY_FILTERS[difficultyIdx];
    return STRAVA_ROUTES.filter(
      (r) =>
        r.sport === selectedSport &&
        lengthTest(r.distanceKm) &&
        (difficultyIdx === 0 || r.difficulty === diff) &&
        (!savedOnly || savedIds.includes(r.id)) &&
        (!q || `${r.name} ${r.areaVi} ${r.district}`.toLowerCase().includes(q))
    );
  }, [isRouteMode, selectedSport, searchQuery, lengthIdx, difficultyIdx, savedOnly, savedIds]);

  const venues = React.useMemo(() => {
    if (isRouteMode) return [];
    const q = searchQuery.trim().toLowerCase();
    return SPORTS_VENUES_DATABASE.filter(
      (v) =>
        v.sport === selectedSport &&
        (selectedDistrict === "Tất cả" || v.district === selectedDistrict) &&
        (!savedOnly || savedIds.includes(v.id)) &&
        (!q || `${v.name} ${v.address}`.toLowerCase().includes(q))
    );
  }, [isRouteMode, selectedSport, searchQuery, selectedDistrict, savedOnly, savedIds]);

  const itemIds = React.useMemo(() => (isRouteMode ? routes.map((r) => r.id) : venues.map((v) => v.id)), [isRouteMode, routes, venues]);

  // Giữ lựa chọn hợp lệ khi danh sách thay đổi.
  React.useEffect(() => {
    if (!selectedId || !itemIds.includes(selectedId)) setSelectedId(itemIds[0] ?? null);
  }, [itemIds, selectedId]);

  const selectedRoute: StravaRoute | null = isRouteMode ? routes.find((r) => r.id === selectedId) ?? null : null;
  const selectedVenue: SportsVenue | null = !isRouteMode ? venues.find((v) => v.id === selectedId) ?? null : null;

  const toggleSaved = (id: string) => {
    setSavedIds((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      try {
        window.localStorage.setItem(SAVED_KEY, JSON.stringify(next));
      } catch {
        /* bỏ qua */
      }
      return next;
    });
  };

  const spotFromRoute = (r: StravaRoute): LiveSpot => ({
    id: r.id,
    name: r.name,
    kind: "route",
    sport: r.sport,
    position: r.coordinates[0] ?? [10.795, 106.721],
  });
  const spotFromVenue = (v: SportsVenue): LiveSpot => ({
    id: v.id,
    name: v.name,
    kind: "venue",
    sport: v.sport,
    position: [v.lat, v.lng],
  });

  // =====================================================================
  // LEAFLET: khởi tạo
  // =====================================================================
  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      const L = await import("leaflet");
      if (cancelled || !mapContainerRef.current || mapRef.current) return;
      LRef.current = L;
      const map = L.map(mapContainerRef.current, { zoomControl: false, attributionControl: false }).setView(
        [10.795, 106.721],
        13
      );
      contentGroupRef.current = L.layerGroup().addTo(map);
      liveGroupRef.current = L.layerGroup().addTo(map);
      map.on("click", () => setIsSportMenuOpen(false));
      mapRef.current = map;
      setMapReady(true);
      setTimeout(() => map.invalidateSize(), 50);
    })();
    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  // Lớp nền: bản đồ đường phố / vệ tinh
  React.useEffect(() => {
    const L = LRef.current;
    const map = mapRef.current;
    if (!mapReady || !L || !map) return;
    baseLayerRef.current.forEach((l) => map.removeLayer(l));
    baseLayerRef.current =
      baseLayer === "satellite"
        ? [
            L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", { maxZoom: 19 }),
            L.tileLayer(
              "https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}",
              { maxZoom: 19 }
            ),
          ]
        : [L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19 })];
    baseLayerRef.current.forEach((l) => {
      l.addTo(map);
      (l as Leaflet.TileLayer).bringToBack();
    });
  }, [baseLayer, mapReady]);

  // =====================================================================
  // LEAFLET: cung đường / sân bãi
  // =====================================================================
  React.useEffect(() => {
    const L = LRef.current;
    const map = mapRef.current;
    const group = contentGroupRef.current;
    if (!mapReady || !L || !map || !group) return;
    group.clearLayers();
    runnerMarkerRef.current = null;

    if (isRouteMode) {
      routes.forEach((r) => {
        const selected = r.id === selectedId;
        if (selected) {
          L.polyline(r.coordinates, { color: "#ffffff", weight: 10, opacity: 0.9, lineCap: "round" }).addTo(group);
        }
        const line = L.polyline(r.coordinates, {
          color: selected ? BRAND : BRAND_SKY,
          weight: selected ? 6 : 4,
          opacity: selected ? 1 : 0.55,
          lineCap: "round",
          lineJoin: "round",
        }).addTo(group);
        line.on("click", () => setSelectedId(r.id));
        const start = r.coordinates[0];
        if (start) {
          const pin = L.marker(start, {
            icon: L.divIcon({
              className: "sync-route-pin",
              html: `<div style="width:${selected ? 38 : 30}px;height:${selected ? 38 : 30}px;border-radius:9999px 9999px 9999px 2px;transform:rotate(-45deg);background:${selected ? BRAND : "#fff"};border:2px solid ${BRAND};display:flex;align-items:center;justify-content:center;box-shadow:0 4px 10px rgba(0,0,0,.3);"><span style="transform:rotate(45deg);font-size:${selected ? 18 : 14}px;">${SPORT_EMOJI[r.sport]}</span></div>`,
              iconSize: [selected ? 38 : 30, selected ? 38 : 30],
              iconAnchor: [selected ? 4 : 3, selected ? 38 : 30],
            }),
            zIndexOffset: selected ? 500 : 0,
          }).addTo(group);
          pin.on("click", () => setSelectedId(r.id));
        }
        if (selected && start && !isLive) {
          runnerMarkerRef.current = L.marker(start, {
            icon: L.divIcon({
              className: "sync-runner",
              html: `<div style="position:relative;width:22px;height:22px"><div class="sync-pulse" style="position:absolute;inset:0;border-radius:9999px;background:${BRAND_SKY}"></div><div style="position:relative;width:22px;height:22px;border-radius:9999px;background:${BRAND_SKY};border:3px solid #fff;box-shadow:0 3px 8px rgba(0,0,0,.35)"></div></div>`,
              iconSize: [22, 22],
              iconAnchor: [11, 11],
            }),
            zIndexOffset: 800,
          }).addTo(group);
        }
      });
    } else {
      venues.forEach((v) => {
        const selected = v.id === selectedId;
        const marker = L.marker([v.lat, v.lng], {
          icon: L.divIcon({
            className: "sync-venue-pin",
            html: `<div style="display:flex;align-items:center;gap:3px;white-space:nowrap;background:${selected ? BRAND : "#fff"};color:${selected ? "#fff" : "#111"};height:${selected ? 32 : 26}px;padding:0 9px;border-radius:9999px;font:800 ${selected ? 12 : 11}px/1 system-ui;border:2px solid ${selected ? "#fff" : BRAND};box-shadow:0 4px 10px rgba(0,0,0,.3);"><span>${SPORT_EMOJI[v.sport]}</span><span>★${v.rating.toFixed(1)}</span></div>`,
            iconSize: [70, selected ? 32 : 26],
            iconAnchor: [35, selected ? 16 : 13],
          }),
          zIndexOffset: selected ? 500 : 0,
        }).addTo(group);
        marker.on("click", () => setSelectedId(v.id));
      });
    }
  }, [mapReady, isRouteMode, routes, venues, selectedId, isLive]);

  // Khung nhìn: phóng tới mục đang chọn
  React.useEffect(() => {
    const L = LRef.current;
    const map = mapRef.current;
    if (!mapReady || !L || !map || isLive) return;
    const pad = { paddingTopLeft: [20, 130] as [number, number], paddingBottomRight: [60, 260] as [number, number] };
    if (selectedRoute) map.flyToBounds(L.latLngBounds(selectedRoute.coordinates), { ...pad, duration: 0.6 });
    else if (selectedVenue) map.flyTo([selectedVenue.lat, selectedVenue.lng], 16, { duration: 0.6 });
  }, [mapReady, selectedRoute, selectedVenue, isLive]);

  // =====================================================================
  // LEAFLET: phiên tập trực tiếp (bạn, người gần, bạn tập đã ghép)
  // =====================================================================
  const fittedMatchRef = React.useRef<string | null>(null);
  const liveView = React.useMemo(
    () => ({ state: live.state, nearby: live.nearby, partner: live.partner }),
    [live.state, live.nearby, live.partner]
  );
  React.useEffect(() => {
    const L = LRef.current;
    const map = mapRef.current;
    const group = liveGroupRef.current;
    if (!mapReady || !L || !map || !group) return;
    group.clearLayers();
    const { state, nearby, partner } = liveView;
    if (state.phase === "idle" || !state.spot || !state.myPos) {
      fittedMatchRef.current = null;
      return;
    }

    L.circle(state.spot.position, {
      radius: ARRIVAL_RADIUS_M,
      color: BRAND,
      weight: 1,
      fillColor: BRAND,
      fillOpacity: 0.08,
      dashArray: "4 6",
    }).addTo(group);

    const matched = (state.phase === "matched" || state.phase === "met") && partner && state.partnerPos;

    if (!matched) {
      nearby.forEach((a) => {
        L.marker(a.position, { icon: avatarIcon(L, a.avatar, { size: 36, ring: BRAND }) })
          .addTo(group)
          .bindTooltip(`${a.name} · ${a.focus}`, { direction: "top", offset: [0, -18] });
      });
    } else {
      L.polyline([state.myPos, state.partnerPos!], { color: BRAND, weight: 4, dashArray: "2 10", lineCap: "round" }).addTo(group);
      L.marker(state.partnerPos!, {
        icon: avatarIcon(L, partner!.avatar, { size: 46, ring: BRAND, pulse: true, label: partner!.name }),
        zIndexOffset: 900,
      }).addTo(group);
    }

    L.marker(state.myPos, {
      icon: L.divIcon({
        className: "sync-me",
        html: `<div style="position:relative;width:24px;height:24px"><div class="sync-pulse" style="position:absolute;inset:0;border-radius:9999px;background:${ME}"></div><div style="position:relative;width:24px;height:24px;border-radius:9999px;background:${ME};border:4px solid #fff;box-shadow:0 3px 8px rgba(0,0,0,.4)"></div></div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      }),
      zIndexOffset: 1000,
    }).addTo(group);

    // Phóng khung một lần khi bắt đầu / khi vừa ghép đội
    const key = `${state.startedAt}-${state.partnerId ?? "none"}`;
    if (fittedMatchRef.current !== key) {
      fittedMatchRef.current = key;
      const pts: LatLng[] = matched ? [state.myPos, state.partnerPos!] : [state.myPos, ...nearby.map((a) => a.position)];
      map.flyToBounds(L.latLngBounds(pts), { paddingTopLeft: [40, 140], paddingBottomRight: [60, 340], maxZoom: 17, duration: 0.6 });
    }
  }, [mapReady, liveView]);

  // =====================================================================
  // Mô phỏng chạy thử cung đường
  // =====================================================================
  React.useEffect(() => {
    if (!isPlaying || !selectedRoute) return;
    const t = setInterval(() => {
      setRunnerProgress((prev) => {
        const next = prev + 1;
        if (next >= selectedRoute.coordinates.length) {
          setIsPlaying(false);
          return 0;
        }
        const pos = selectedRoute.coordinates[next];
        if (pos) {
          runnerMarkerRef.current?.setLatLng(pos);
          mapRef.current?.panTo(pos, { animate: true });
        }
        return next;
      });
    }, 1200);
    return () => clearInterval(t);
  }, [isPlaying, selectedRoute]);

  const resetSimulator = () => {
    setIsPlaying(false);
    setRunnerProgress(0);
    const start = selectedRoute?.coordinates[0];
    if (start) runnerMarkerRef.current?.setLatLng(start);
  };

  React.useEffect(() => {
    setIsPlaying(false);
    setRunnerProgress(0);
  }, [selectedId]);

  // Đồng bộ carousel khi chọn trên bản đồ
  React.useEffect(() => {
    if (!selectedId || isSheetExpanded) return;
    const el = carouselRef.current?.querySelector<HTMLElement>(`[data-item-id="${selectedId}"]`);
    el?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }, [selectedId, isSheetExpanded]);

  const locateMe = () => {
    const map = mapRef.current;
    if (!map) return;
    if (live.state.myPos) {
      map.flyTo(live.state.myPos, 17, { duration: 0.5 });
      return;
    }
    navigator.geolocation?.getCurrentPosition(
      (p) => map.flyTo([p.coords.latitude, p.coords.longitude], 15, { duration: 0.5 }),
      () => undefined,
      { timeout: 8000 }
    );
  };

  const itemCount = isRouteMode ? routes.length : venues.length;

  return (
    <div className="relative w-full h-full overflow-hidden bg-neutral-200 dark:bg-neutral-900">
      <div ref={mapContainerRef} className="absolute inset-0 z-0" aria-label="Bản đồ" />

      {/* ============================ THANH TRÊN ============================ */}
      <div className="absolute top-3 inset-x-3 z-[600] space-y-2">
        <div className="flex items-stretch h-12 rounded-full bg-background/95 backdrop-blur shadow-lg border border-border/60">
          <button
            onClick={() => setIsSportMenuOpen((v) => !v)}
            disabled={isLive}
            aria-label={`Môn: ${sportMeta?.nameVi ?? ""}`}
            aria-expanded={isSportMenuOpen}
            className="flex items-center gap-0.5 pl-4 pr-2.5 border-r border-border disabled:opacity-50"
          >
            <span className="text-xl leading-none">{SPORT_EMOJI[selectedSport]}</span>
            <ChevronDown className="h-4 w-4 text-brand-700" />
          </button>
          <div className="relative flex-1 min-w-0 flex items-center">
            <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isRouteMode ? `${sportMeta?.nameVi ?? ""}: tìm cung đường...` : "Tìm sân, phòng tập, tên đường..."}
              aria-label="Tìm kiếm trên bản đồ"
              className="w-full h-full bg-transparent pl-9 pr-8 text-[13.5px] text-foreground placeholder:text-muted-foreground outline-none"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} aria-label="Xoá tìm kiếm" className="absolute right-2 p-1 text-muted-foreground">
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          <button
            onClick={() => setSavedOnly((v) => !v)}
            aria-pressed={savedOnly}
            className={cn(
              "flex items-center gap-1 px-3.5 rounded-r-full text-[12.5px] font-bold border-l border-border",
              savedOnly ? "bg-brand-600 text-white" : "bg-muted/60 text-foreground"
            )}
          >
            <Bookmark className={cn("h-4 w-4", savedOnly && "fill-current")} />
            Đã lưu
          </button>
        </div>

        {/* Menu chọn môn */}
        {isSportMenuOpen && (
          <div className="rounded-2xl bg-background/98 backdrop-blur shadow-xl border border-border p-2 grid grid-cols-2 gap-1 animate-in fade-in slide-in-from-top-1">
            {POPULAR_GROUP_SPORTS.filter((s) => s.key).map((s) => (
              <button
                key={s.key}
                onClick={() => {
                  setSelectedSport(s.key!);
                  setSelectedId(null);
                  setSearchQuery("");
                  setIsSportMenuOpen(false);
                }}
                className={cn(
                  "flex items-center gap-2 rounded-xl px-3 py-2 text-[13px] font-semibold text-left",
                  selectedSport === s.key ? "bg-brand-600 text-white" : "hover:bg-muted text-foreground"
                )}
              >
                <span>{SPORT_EMOJI[s.key!]}</span>
                <span className="flex-1">{s.nameVi}</span>
                <span className="text-[10px] opacity-70">{s.requiresVenue ? "Sân" : "Cung đường"}</span>
              </button>
            ))}
          </div>
        )}

        {/* Chip lọc */}
        {!isLive && !isSportMenuOpen && (
          <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-3 px-3 pb-1">
            {isRouteMode ? (
              <>
                <span className="shrink-0 h-9 px-4 rounded-full border-2 border-brand-600 bg-background/95 text-brand-700 text-[13px] font-bold flex items-center gap-1 shadow-sm">
                  {sportMeta?.nameVi} · {itemCount}
                </span>
                <FilterChip
                  label={LENGTH_FILTERS[lengthIdx]!.label}
                  active={lengthIdx > 0}
                  cycles
                  onClick={() => setLengthIdx((i) => (i + 1) % LENGTH_FILTERS.length)}
                />
                <FilterChip
                  label={DIFFICULTY_FILTERS[difficultyIdx]!}
                  active={difficultyIdx > 0}
                  cycles
                  onClick={() => setDifficultyIdx((i) => (i + 1) % DIFFICULTY_FILTERS.length)}
                />
              </>
            ) : (
              DISTRICT_LIST.map((d) => (
                <FilterChip key={d} label={d} active={selectedDistrict === d} onClick={() => setSelectedDistrict(d)} />
              ))
            )}
          </div>
        )}

        {/* Trạng thái chia sẻ */}
        {isLive && (
          <div className="inline-flex items-center gap-2 rounded-full bg-brand-600 text-white px-3.5 py-1.5 text-[12px] font-bold shadow-lg">
            <Radio className="h-3.5 w-3.5 animate-pulse" />
            Đang chia sẻ vị trí · {live.nearby.length} người tập gần bạn
          </div>
        )}
      </div>

      {/* ============================ NÚT NỔI BÊN PHẢI ============================ */}
      <div className={cn("absolute right-3 top-[132px] z-[600] flex flex-col gap-2.5", isSheetExpanded && !isLive && "hidden")}>
        <FloatBtn
          label={baseLayer === "map" ? "Chuyển sang vệ tinh" : "Chuyển sang bản đồ đường phố"}
          onClick={() => setBaseLayer((b) => (b === "map" ? "satellite" : "map"))}
          active={baseLayer === "satellite"}
        >
          <Layers className="h-5 w-5" />
        </FloatBtn>
        <FloatBtn label="Vị trí của tôi" onClick={locateMe}>
          <LocateFixed className="h-5 w-5" />
        </FloatBtn>
        {!isLive && (
          <Link
            href="/len-keo"
            aria-label="Lên kèo mới"
            className="h-12 w-12 rounded-full bg-background/95 shadow-lg border border-border/60 flex items-center justify-center text-foreground active:scale-95"
          >
            <SquarePen className="h-5 w-5" />
          </Link>
        )}
      </div>

      <p className="absolute left-2 bottom-[70px] z-[500] text-[9px] text-neutral-600 dark:text-neutral-300 bg-white/60 dark:bg-black/40 px-1 rounded">
        {baseLayer === "satellite" ? "© Esri, Maxar" : "© OpenStreetMap"}
      </p>

      {/* ============================ TẤM DƯỚI ============================ */}
      <div className="absolute inset-x-0 bottom-[72px] z-[700]">
        {isLive ? (
          <div className="px-3">
            <LiveSessionPanel
              state={live.state}
              nearby={live.nearby}
              athletes={live.athletes}
              partner={live.partner}
              onInvite={live.invite}
              onAnswerIncoming={live.answerIncoming}
              onCancelMatch={live.cancelMatch}
              onStop={live.stop}
              onFocusAthlete={(a) => mapRef.current?.flyTo(a.position, 17, { duration: 0.5 })}
            />
          </div>
        ) : isSheetExpanded ? (
          <div className="mx-0 rounded-t-3xl bg-background shadow-2xl border-t border-border max-h-[62vh] flex flex-col animate-in slide-in-from-bottom-4 duration-200">
            <button onClick={() => setIsSheetExpanded(false)} className="w-full pt-2.5 pb-1.5 flex flex-col items-center" aria-label="Thu gọn danh sách">
              <span className="h-1.5 w-10 rounded-full bg-neutral-300 dark:bg-neutral-600" />
            </button>
            <div className="px-4 pb-2 flex items-baseline justify-between">
              <h2 className="text-[17px] font-bold text-foreground">
                {isRouteMode ? `Cung đường ${sportMeta?.nameVi.toLowerCase()}` : "Sân bãi & phòng tập"}
              </h2>
              <span className="text-[12px] text-muted-foreground">{itemCount} kết quả</span>
            </div>
            <div className="overflow-y-auto px-3 pb-4 space-y-2.5">
              {isRouteMode
                ? routes.map((r) => (
                    <RouteDetailCard
                      key={r.id}
                      route={r}
                      selected={r.id === selectedId}
                      saved={savedIds.includes(r.id)}
                      onSelect={() => setSelectedId(r.id)}
                      onToggleSave={() => toggleSaved(r.id)}
                      onStartLive={() => setCheckInSpot(spotFromRoute(r))}
                      simulator={
                        r.id === selectedId
                          ? { isPlaying, progress: runnerProgress, onToggle: () => setIsPlaying((p) => !p), onReset: resetSimulator }
                          : null
                      }
                    />
                  ))
                : venues.map((v) => (
                    <VenueDetailCard
                      key={v.id}
                      venue={v}
                      selected={v.id === selectedId}
                      saved={savedIds.includes(v.id)}
                      onSelect={() => setSelectedId(v.id)}
                      onToggleSave={() => toggleSaved(v.id)}
                      onStartLive={() => setCheckInSpot(spotFromVenue(v))}
                    />
                  ))}
              {itemCount === 0 && <EmptyResult />}
              <SafetyNote />
            </div>
          </div>
        ) : (
          <div>
            <div ref={carouselRef} className="flex gap-2.5 overflow-x-auto snap-x snap-mandatory no-scrollbar px-3 pb-2">
              {isRouteMode
                ? routes.map((r) => (
                    <PeekCard
                      key={r.id}
                      id={r.id}
                      selected={r.id === selectedId}
                      saved={savedIds.includes(r.id)}
                      onSelect={() => setSelectedId(r.id)}
                      onToggleSave={() => toggleSaved(r.id)}
                      onStartLive={() => setCheckInSpot(spotFromRoute(r))}
                      thumb={<ElevationSpark points={r.elevationPoints} className="w-full h-full" />}
                      title={r.name}
                      badge={r.difficulty}
                      meta={`${r.distanceKm} km · +${r.elevationGainM} m · ${r.estimatedTime}`}
                      sub={`${r.district} · An toàn ${r.safetyScore}%`}
                    />
                  ))
                : venues.map((v) => (
                    <PeekCard
                      key={v.id}
                      id={v.id}
                      selected={v.id === selectedId}
                      saved={savedIds.includes(v.id)}
                      onSelect={() => setSelectedId(v.id)}
                      onToggleSave={() => toggleSaved(v.id)}
                      onStartLive={() => setCheckInSpot(spotFromVenue(v))}
                      thumb={
                        <div className="w-full h-full flex flex-col items-center justify-center bg-brand-50 dark:bg-brand-950/40">
                          <span className="text-2xl">{SPORT_EMOJI[v.sport]}</span>
                          <span className="text-[11px] font-black text-brand-700 flex items-center gap-0.5">
                            <Star className="h-3 w-3 fill-current" />
                            {v.rating.toFixed(1)}
                          </span>
                        </div>
                      }
                      title={v.name}
                      badge={v.district}
                      meta={`${v.priceRange} · ${v.openHours}`}
                      sub={v.address}
                    />
                  ))}
              {itemCount === 0 && (
                <div className="w-full rounded-3xl bg-background shadow-xl p-4">
                  <EmptyResult />
                </div>
              )}
            </div>
            <div className="bg-background rounded-t-3xl shadow-[0_-4px_20px_rgba(0,0,0,0.12)] border-t border-border">
              <button
                onClick={() => setIsSheetExpanded(true)}
                className="w-full pt-2.5 pb-3 flex flex-col items-center gap-1.5"
                aria-label="Mở rộng danh sách"
              >
                <span className="h-1.5 w-10 rounded-full bg-neutral-300 dark:bg-neutral-600" />
                <span className="text-[13px] font-bold text-foreground">
                  {itemCount} {isRouteMode ? "cung đường" : "địa điểm"} · Xem danh sách
                </span>
              </button>
            </div>
          </div>
        )}
      </div>

      {checkInSpot && (
        <CheckInSheet
          spot={checkInSpot}
          onClose={() => setCheckInSpot(null)}
          onConfirm={(pos, realGps) => {
            setIsSheetExpanded(false);
            setIsPlaying(false);
            live.start(checkInSpot, pos, realGps);
            setCheckInSpot(null);
          }}
        />
      )}
    </div>
  );
}

/* ====================================================================== */

function FilterChip({
  label,
  active,
  onClick,
  cycles = false,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  cycles?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "shrink-0 h-9 px-4 rounded-full text-[13px] font-semibold shadow-sm border transition-colors flex items-center gap-1",
        active ? "bg-brand-600 border-brand-600 text-white" : "bg-background/95 border-border text-foreground"
      )}
    >
      {label}
      {cycles && <ChevronDown className="h-3.5 w-3.5 opacity-60" />}
    </button>
  );
}

function FloatBtn({
  label,
  onClick,
  active,
  children,
}: {
  label: string;
  onClick: () => void;
  active?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      title={label}
      className={cn(
        "h-12 w-12 rounded-full shadow-lg border flex items-center justify-center active:scale-95 transition-colors",
        active ? "bg-brand-600 border-brand-600 text-white" : "bg-background/95 border-border/60 text-foreground"
      )}
    >
      {children}
    </button>
  );
}

function StartLiveButton({ onClick, compact }: { onClick: () => void; compact?: boolean }) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className={cn(
        "rounded-full bg-brand-600 hover:bg-brand-700 text-white font-bold flex items-center justify-center gap-1.5 active:scale-95 transition-all",
        compact ? "h-8 px-3 text-[12px]" : "h-9 px-4 text-[13px] flex-1"
      )}
    >
      <Radio className="h-3.5 w-3.5" />
      Tập tại đây
    </button>
  );
}

function SaveButton({ saved, onClick }: { saved: boolean; onClick: () => void }) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      aria-label={saved ? "Bỏ lưu" : "Lưu"}
      aria-pressed={saved}
      className="h-8 w-8 shrink-0 rounded-full bg-muted flex items-center justify-center"
    >
      <Bookmark className={cn("h-4 w-4", saved ? "fill-brand-600 text-brand-600" : "text-foreground")} />
    </button>
  );
}

function PeekCard(props: {
  id: string;
  selected: boolean;
  saved: boolean;
  onSelect: () => void;
  onToggleSave: () => void;
  onStartLive: () => void;
  thumb: React.ReactNode;
  title: string;
  badge: string;
  meta: string;
  sub: string;
}) {
  return (
    <article
      data-item-id={props.id}
      onClick={props.onSelect}
      className={cn(
        "snap-center shrink-0 w-[88%] rounded-3xl bg-background shadow-xl border flex overflow-hidden cursor-pointer transition-all",
        props.selected ? "border-brand-600 ring-1 ring-brand-600/40" : "border-border/60"
      )}
    >
      <div className="w-[76px] shrink-0 bg-muted/60 p-2 flex items-end">{props.thumb}</div>
      <div className="flex-1 min-w-0 p-3 space-y-1">
        <div className="flex items-start gap-2">
          <h3 className="flex-1 text-[14px] font-bold text-foreground leading-snug line-clamp-1">{props.title}</h3>
          <SaveButton saved={props.saved} onClick={props.onToggleSave} />
        </div>
        <div className="flex items-center gap-1.5 text-[12px] text-muted-foreground">
          <span className="shrink-0 rounded-md bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 px-1.5 py-0.5 text-[10.5px] font-bold">
            {props.badge}
          </span>
          <span className="truncate">{props.meta}</span>
        </div>
        <div className="flex items-center gap-2 pt-0.5">
          <p className="flex-1 min-w-0 text-[11.5px] text-muted-foreground truncate flex items-center gap-1">
            <MapPin className="h-3 w-3 shrink-0" />
            {props.sub}
          </p>
          <StartLiveButton onClick={props.onStartLive} compact />
        </div>
      </div>
    </article>
  );
}

function RouteDetailCard({
  route,
  selected,
  saved,
  onSelect,
  onToggleSave,
  onStartLive,
  simulator,
}: {
  route: StravaRoute;
  selected: boolean;
  saved: boolean;
  onSelect: () => void;
  onToggleSave: () => void;
  onStartLive: () => void;
  simulator: { isPlaying: boolean; progress: number; onToggle: () => void; onReset: () => void } | null;
}) {
  return (
    <article
      onClick={onSelect}
      className={cn(
        "rounded-3xl border p-3.5 space-y-2.5 cursor-pointer",
        selected ? "border-brand-600 bg-card shadow-md" : "border-border bg-card/70"
      )}
    >
      <div className="flex items-start gap-2">
        <div className="flex-1 min-w-0">
          <h3 className="text-[14.5px] font-bold text-foreground leading-snug">{route.name}</h3>
          <p className="text-[11.5px] text-muted-foreground">📍 {route.areaVi} ({route.district})</p>
        </div>
        <SaveButton saved={saved} onClick={onToggleSave} />
      </div>
      <p className="text-[12px] text-muted-foreground leading-relaxed">{route.subtitle}</p>
      <ElevationSpark points={route.elevationPoints} className="w-full h-8" />
      <div className="grid grid-cols-4 gap-1.5 text-center">
        {[
          ["Cự ly", `${route.distanceKm} km`],
          ["Độ cao", `+${route.elevationGainM} m`],
          ["Độ khó", route.difficulty],
          ["Mục tiêu", route.targetPaceOrSpeed.replace(/^Pace |^Tốc độ /, "")],
        ].map(([k, v]) => (
          <div key={k} className="rounded-xl bg-muted/60 py-1.5 px-1">
            <p className="text-[9.5px] text-muted-foreground">{k}</p>
            <p className="text-[11.5px] font-bold text-foreground truncate">{v}</p>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-1">
        {route.highlights.map((h) => (
          <span key={h} className="px-2 py-0.5 rounded-full bg-muted/60 text-[10.5px] text-muted-foreground">
            {h}
          </span>
        ))}
      </div>
      <div className="flex items-center justify-between text-[11px] text-muted-foreground border-t border-border/60 pt-2">
        <span className="flex items-center gap-1">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
          An toàn {route.safetyScore}% · {route.waterStations} trạm nước · {route.surface}
        </span>
      </div>
      <p className="text-[11px] text-muted-foreground">
        Kỷ lục: <b className="text-foreground">{route.bestRecord.holder}</b> ({route.bestRecord.time})
      </p>

      {simulator && (
        <div className="flex items-center gap-2 rounded-2xl bg-black text-white p-2" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={simulator.onToggle}
            aria-label={simulator.isPlaying ? "Tạm dừng mô phỏng" : "Chạy thử cung đường"}
            className="h-8 w-8 rounded-full bg-white/15 flex items-center justify-center"
          >
            {simulator.isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ml-0.5" />}
          </button>
          <button onClick={simulator.onReset} aria-label="Về điểm xuất phát" className="h-8 w-8 rounded-full hover:bg-white/10 flex items-center justify-center">
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
          <div className="flex-1">
            <p className="text-[10px] text-brand-200 font-bold">Mô phỏng GPS cung đường</p>
            <p className="text-[12px] font-mono font-bold">
              {((simulator.progress / (route.coordinates.length || 1)) * route.distanceKm).toFixed(1)} / {route.distanceKm} km
            </p>
          </div>
        </div>
      )}

      <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
        <StartLiveButton onClick={onStartLive} />
        <Link
          href="/len-keo"
          className="flex-1 h-9 rounded-full bg-brand hover:bg-brand-700 text-white text-[13px] font-bold flex items-center justify-center gap-1"
        >
          <Zap className="h-3.5 w-3.5" /> Lên kèo
        </Link>
      </div>
    </article>
  );
}

function VenueDetailCard({
  venue,
  selected,
  saved,
  onSelect,
  onToggleSave,
  onStartLive,
}: {
  venue: SportsVenue;
  selected: boolean;
  saved: boolean;
  onSelect: () => void;
  onToggleSave: () => void;
  onStartLive: () => void;
}) {
  return (
    <article
      onClick={onSelect}
      className={cn(
        "rounded-3xl border p-3.5 space-y-2.5 cursor-pointer",
        selected ? "border-brand-600 bg-card shadow-md" : "border-border bg-card/70"
      )}
    >
      <div className="flex items-start gap-2">
        <div className="flex-1 min-w-0">
          <h3 className="text-[14.5px] font-bold text-foreground leading-snug">{venue.name}</h3>
          <p className="text-[11.5px] text-muted-foreground flex items-center gap-1">
            <MapPin className="h-3 w-3 shrink-0" />
            <span className="truncate">{venue.address}</span>
          </p>
        </div>
        <div className="flex flex-col items-end shrink-0">
          <span className="flex items-center gap-0.5 rounded-full bg-brand-600 text-white px-2 py-0.5 text-[12px] font-bold">
            <Star className="h-3 w-3 fill-current" />
            {venue.rating.toFixed(1)}
          </span>
          <span className="text-[10px] text-muted-foreground">({venue.reviewCount} đánh giá)</span>
        </div>
        <SaveButton saved={saved} onClick={onToggleSave} />
      </div>
      <p className="text-[12px] text-muted-foreground leading-relaxed">{venue.highlights}</p>
      <div className="grid grid-cols-2 gap-1.5 rounded-2xl bg-muted/60 p-2">
        <div>
          <p className="text-[9.5px] text-muted-foreground">Mức giá tham khảo</p>
          <p className="text-[12px] font-bold text-foreground">{venue.priceRange}</p>
        </div>
        <div>
          <p className="text-[9.5px] text-muted-foreground">Giờ hoạt động</p>
          <p className="text-[12px] font-semibold text-foreground flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {venue.openHours}
          </p>
        </div>
      </div>
      <div className="flex flex-wrap gap-1">
        {venue.amenities.map((a) => (
          <span key={a} className="px-2 py-0.5 rounded-full bg-muted/60 text-[10.5px] text-muted-foreground">
            {a}
          </span>
        ))}
      </div>
      <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
        <StartLiveButton onClick={onStartLive} />
        <a
          href={venue.googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="h-9 px-3 rounded-full border border-border text-foreground text-[12px] font-bold flex items-center gap-1 hover:bg-muted"
        >
          <ExternalLink className="h-3.5 w-3.5" /> Chỉ đường
        </a>
        <Link
          href="/len-keo"
          aria-label="Lên kèo tại sân này"
          className="h-9 w-9 shrink-0 rounded-full bg-brand hover:bg-brand-700 text-white flex items-center justify-center"
        >
          <Zap className="h-4 w-4" />
        </Link>
      </div>
    </article>
  );
}

function EmptyResult() {
  return (
    <p className="text-center text-[13px] text-muted-foreground py-3">
      Không có kết quả phù hợp. Thử đổi bộ lọc hoặc từ khoá.
    </p>
  );
}

function SafetyNote() {
  return (
    <div className="rounded-2xl bg-muted/50 p-3 text-[11.5px] text-muted-foreground space-y-1">
      <p className="font-bold text-foreground flex items-center gap-1.5">
        <ShieldCheck className="h-4 w-4" /> Tiêu chuẩn cung đường an toàn
      </p>
      <p>Ưu tiên cung đường có chiếu sáng, vòi nước sạch công cộng và chốt hỗ trợ SOS gần đó.</p>
    </div>
  );
}
