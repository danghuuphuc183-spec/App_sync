"use client";

import * as React from "react";
import Link from "next/link";
import type {
  Map as LeafletMap,
  Polyline as LeafletPolyline,
  Marker as LeafletMarker,
} from "leaflet";
import {
  Play,
  Pause,
  RotateCcw,
  Search,
  X,
  MapPin,
  Star,
  ExternalLink,
  Clock,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  POPULAR_GROUP_SPORTS,
  type SportKey,
} from "@/features/sports/sports.data";
import {
  STRAVA_ROUTES,
  type StravaRoute,
} from "@/features/venues/routes.data";
import {
  SPORTS_VENUES_DATABASE,
  DISTRICT_LIST,
  type SportsVenue,
  type DistrictName,
} from "@/features/venues/venues.data";

export function InteractiveRouteMap() {
  const mapContainerRef = React.useRef<HTMLDivElement>(null);
  const leafletMapRef = React.useRef<LeafletMap | null>(null);
  const routePolylineRef = React.useRef<LeafletPolyline | null>(null);
  const runnerMarkerRef = React.useRef<LeafletMarker | null>(null);
  const venueMarkersRef = React.useRef<LeafletMarker[]>([]);

  // 1. Sport Selector State (8 popular sports)
  const [selectedSport, setSelectedSport] = React.useState<SportKey>("running");

  // 2. Strava Route State (for running & cycling)
  const availableRoutes = React.useMemo(() => {
    return STRAVA_ROUTES.filter((r) => r.sport === selectedSport);
  }, [selectedSport]);

  const [selectedRoute, setSelectedRoute] = React.useState<StravaRoute>(
    STRAVA_ROUTES[0]!
  );

  // Sync selectedRoute when sport changes between running and cycling
  React.useEffect(() => {
    if (selectedSport === "running" || selectedSport === "cycling") {
      const first = STRAVA_ROUTES.find((r) => r.sport === selectedSport);
      if (first) {
        setSelectedRoute(first);
      }
    }
  }, [selectedSport]);

  // 3. Venues State (for gym, pickleball, badminton, table_tennis, football, basketball)
  const [selectedDistrict, setSelectedDistrict] = React.useState<DistrictName>("Tất cả");
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const [selectedVenue, setSelectedVenue] = React.useState<SportsVenue | null>(null);

  // Simulation State for GPS Route
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [runnerProgress, setRunnerProgress] = React.useState(0);

  const isRouteMode = selectedSport === "running" || selectedSport === "cycling";

  // Filtered Venues
  const filteredVenues = React.useMemo(() => {
    if (isRouteMode) return [];
    return SPORTS_VENUES_DATABASE.filter((v) => {
      // Filter by sport
      if (v.sport !== selectedSport) return false;
      // Filter by district
      if (selectedDistrict !== "Tất cả" && v.district !== selectedDistrict) return false;
      // Filter by query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = v.name.toLowerCase().includes(q);
        const matchAddress = v.address.toLowerCase().includes(q);
        if (!matchName && !matchAddress) return false;
      }
      return true;
    });
  }, [selectedSport, selectedDistrict, searchQuery, isRouteMode]);

  // Set default selected venue when list changes
  React.useEffect(() => {
    if (!isRouteMode && filteredVenues.length > 0) {
      setSelectedVenue(filteredVenues[0] || null);
    }
  }, [filteredVenues, isRouteMode]);

  // Leaflet map initialization & reactive update
  React.useEffect(() => {
    if (typeof window === "undefined" || !mapContainerRef.current) return;

    let isMounted = true;

    async function updateMap() {
      const L = await import("leaflet");

      if (!isMounted || !mapContainerRef.current) return;

      // 1. Initialize map if not yet created
      if (!leafletMapRef.current) {
        const initialCenter: [number, number] = [10.795, 106.721]; // Bình Thạnh / Landmark
        const map = L.map(mapContainerRef.current, {
          zoomControl: false,
          attributionControl: false,
        }).setView(initialCenter, 14);

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          maxZoom: 19,
        }).addTo(map);

        leafletMapRef.current = map;
      }

      const map = leafletMapRef.current;
      if (!map) return;

      // Clean existing venue markers
      venueMarkersRef.current.forEach((m) => map.removeLayer(m));
      venueMarkersRef.current = [];

      // Clean route polyline & runner marker
      if (routePolylineRef.current) {
        map.removeLayer(routePolylineRef.current);
        routePolylineRef.current = null;
      }
      if (runnerMarkerRef.current) {
        map.removeLayer(runnerMarkerRef.current);
        runnerMarkerRef.current = null;
      }

      // ==========================================
      // A. ROUTE MODE (Chạy Bộ & Đạp Xe Strava)
      // ==========================================
      if (isRouteMode && selectedRoute) {
        // Draw GPS Polyline with #1b3554 deep navy
        const polyline = L.polyline(selectedRoute.coordinates, {
          color: "#1b3554",
          weight: 5,
          opacity: 0.95,
          lineCap: "round",
          lineJoin: "round",
        }).addTo(map);
        routePolylineRef.current = polyline;

        // Auto zoom and pan to fit entire route
        map.fitBounds(polyline.getBounds(), { padding: [30, 30] });

        // Add Live Simulator marker
        const liveIcon = L.divIcon({
          className: "custom-live-marker",
          html: `
            <div style="position: relative; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center;">
              <div style="position: absolute; width: 28px; height: 28px; border-radius: 50%; background: rgba(192, 230, 253, 0.7); animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
              <div style="position: relative; width: 16px; height: 16px; border-radius: 50%; background: #1b3554; border: 3px solid #ffffff; box-shadow: 0 4px 6px rgba(0,0,0,0.3);"></div>
            </div>
          `,
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        });

        const startPos = selectedRoute.coordinates[0] || [10.795, 106.721];
        const marker = L.marker(startPos, { icon: liveIcon }).addTo(map);
        runnerMarkerRef.current = marker;
      }

      // ==========================================
      // B. VENUE MODE (Gym, Pickleball, Cầu Lông...)
      // ==========================================
      if (!isRouteMode && filteredVenues.length > 0) {
        const bounds = L.latLngBounds([]);

        filteredVenues.forEach((venue) => {
          bounds.extend([venue.lat, venue.lng]);

          // Category letter badge
          const letter =
            venue.sport === "pickleball"
              ? "PB"
              : venue.sport === "gym"
              ? "GYM"
              : venue.sport === "badminton"
              ? "CL"
              : venue.sport === "table_tennis"
              ? "BB"
              : venue.sport === "football"
              ? "FB"
              : "BK";

          const venueIcon = L.divIcon({
            className: "custom-venue-pin",
            html: `
              <div style="background: #1b3554; color: white; min-width: 32px; height: 26px; padding: 0 6px; border-radius: 13px; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 900; border: 2px solid white; box-shadow: 0 4px 10px rgba(0,0,0,0.3); cursor: pointer; white-space: nowrap;">
                <span>${letter}</span>
                <span style="margin-left: 2px; font-size: 9px; color: #c0e6fd;">★${venue.rating}</span>
              </div>
            `,
            iconSize: [36, 26],
            iconAnchor: [18, 13],
          });

          const vMarker = L.marker([venue.lat, venue.lng], { icon: venueIcon }).addTo(map);
          vMarker.on("click", () => {
            setSelectedVenue(venue);
            map.panTo([venue.lat, venue.lng]);
          });
          venueMarkersRef.current.push(vMarker);
        });

        if (bounds.isValid()) {
          map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
        }
      }
    }

    updateMap();

    return () => {
      isMounted = false;
    };
  }, [selectedSport, selectedRoute, filteredVenues, isRouteMode]);

  // Runner GPS Simulator Progress loop
  React.useEffect(() => {
    if (!isPlaying || !isRouteMode || !selectedRoute) return;

    const interval = setInterval(() => {
      setRunnerProgress((prev) => {
        const next = prev + 1;
        if (next >= selectedRoute.coordinates.length) {
          setIsPlaying(false);
          return 0;
        }

        const currentPos = selectedRoute.coordinates[next];
        if (currentPos && runnerMarkerRef.current) {
          runnerMarkerRef.current.setLatLng(currentPos);
          if (leafletMapRef.current) {
            leafletMapRef.current.panTo(currentPos, { animate: true });
          }
        }
        return next;
      });
    }, 1200);

    return () => clearInterval(interval);
  }, [isPlaying, isRouteMode, selectedRoute]);

  const handleResetSimulator = () => {
    setIsPlaying(false);
    setRunnerProgress(0);
    if (selectedRoute && runnerMarkerRef.current && selectedRoute.coordinates[0]) {
      runnerMarkerRef.current.setLatLng(selectedRoute.coordinates[0]);
      if (leafletMapRef.current) {
        leafletMapRef.current.panTo(selectedRoute.coordinates[0]);
      }
    }
  };

  const handleSelectRoute = (route: StravaRoute) => {
    setSelectedRoute(route);
    handleResetSimulator();
  };

  const handleSelectVenue = (venue: SportsVenue) => {
    setSelectedVenue(venue);
    if (leafletMapRef.current) {
      leafletMapRef.current.panTo([venue.lat, venue.lng], { animate: true });
    }
  };

  return (
    <div className="flex flex-col w-full space-y-3">
      {/* =================================================================== */}
      {/* 1. THANH CHỌN MÔN THỂ THAO (8 MÔN PHỔ BIẾN CHO NHÓM NHỎ) */}
      {/* =================================================================== */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between px-0.5">
          <span className="text-xs font-black uppercase tracking-wider text-muted-foreground">
            Chọn Bộ Môn Thể Thao ({POPULAR_GROUP_SPORTS.length})
          </span>
          <span className="text-[10px] text-[#1b3554] dark:text-[#80aad3] font-bold">
            {isRouteMode ? "Cung đường Strava" : "Sân bãi & Đánh giá"}
          </span>
        </div>

        {/* 8 Sports Horizontal Scroll Pills */}
        <div className="flex gap-1.5 overflow-x-auto scrollbar-none pb-1">
          {POPULAR_GROUP_SPORTS.map((sport) => {
            const isSelected = selectedSport === sport.key;
            return (
              <button
                key={sport.key || sport.id}
                onClick={() => {
                  if (sport.key) setSelectedSport(sport.key);
                }}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border flex items-center gap-1.5 active:scale-95",
                  isSelected
                    ? "bg-[#1b3554] text-white border-[#1b3554] shadow-xs"
                    : "bg-muted/70 text-foreground border-border hover:bg-muted"
                )}
              >
                <span>{sport.nameVi}</span>
                {sport.requiresVenue && (
                  <span className="text-[9px] opacity-70">📍 Sân</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* =================================================================== */}
      {/* 2. BỘ LỌC ĐỊA ĐIỂM THEO QUẬN & TÌM KIẾM (KHI CHỌN MÔN CẦN SÂN) */}
      {/* =================================================================== */}
      {!isRouteMode && (
        <div className="space-y-2 rounded-2xl bg-muted/40 p-2.5 border border-border">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm tên sân, phòng tập hoặc tên đường..."
              className="w-full h-8 pl-8 pr-7 rounded-full bg-background border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-hidden"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-muted-foreground hover:text-foreground"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>

          {/* District Pills */}
          <div className="flex gap-1 overflow-x-auto scrollbar-none">
            {DISTRICT_LIST.map((dist) => (
              <button
                key={dist}
                onClick={() => setSelectedDistrict(dist)}
                className={cn(
                  "px-2.5 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap transition-all border",
                  selectedDistrict === dist
                    ? "bg-[#000f22] text-white border-[#000f22]"
                    : "bg-background text-muted-foreground border-border hover:text-foreground"
                )}
              >
                {dist}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* 3. BẢN ĐỒ LEAFLET CHÍNH (INTERACTIVE MAP CANVAS) */}
      {/* =================================================================== */}
      <div className="relative w-full h-[320px] rounded-3xl overflow-hidden border border-border shadow-md">
        {/* Leaflet container */}
        <div ref={mapContainerRef} className="w-full h-full z-0" />

        {/* Top Info Overlay: Current Mode */}
        <div className="absolute top-2.5 left-2.5 z-10">
          <Badge className="bg-[#000f22]/90 backdrop-blur-md text-white border border-[#80aad3]/30 text-[10px] font-bold py-1 px-2.5 shadow-md">
            {isRouteMode ? (
              <>Cung đường Strava: {selectedRoute?.name}</>
            ) : (
              <>Sân bãi: {filteredVenues.length} địa điểm tại TP.HCM</>
            )}
          </Badge>
        </div>

        {/* Bottom HUD: GPS Simulator (Only for Running & Cycling) */}
        {isRouteMode && selectedRoute && (
          <div className="absolute bottom-2.5 left-2.5 right-2.5 z-10 rounded-2xl bg-[#000f22]/90 backdrop-blur-md border border-[#80aad3]/30 p-2.5 text-white flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1b3554] hover:bg-[#000f22] border border-[#80aad3]/40 text-white shadow-md active:scale-95 transition-transform"
                title={isPlaying ? "Tạm dừng mô phỏng" : "Chạy thử cung đường"}
              >
                {isPlaying ? (
                  <Pause className="h-4 w-4" />
                ) : (
                  <Play className="h-4 w-4 ml-0.5" />
                )}
              </button>

              <button
                onClick={handleResetSimulator}
                className="p-1.5 rounded-full hover:bg-white/10 text-white/70 hover:text-white"
                title="Quay lại điểm xuất phát"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </button>

              <div className="space-y-0.5 pl-1">
                <div className="flex items-center gap-1.5 text-[10px] text-[#c0e6fd] font-bold">
                  <span className="flex h-2 w-2 rounded-full bg-[#c0e6fd] animate-pulse" />
                  Mô phỏng GPS Strava Live
                </div>
                <div className="text-xs font-black font-mono">
                  {(
                    (runnerProgress / (selectedRoute.coordinates.length || 1)) *
                    selectedRoute.distanceKm
                  ).toFixed(1)}{" "}
                  / {selectedRoute.distanceKm} km
                </div>
              </div>
            </div>

            <div className="text-right text-xs">
              <div className="text-[10px] text-white/70">Mục tiêu</div>
              <div className="font-bold text-[#c0e6fd]">
                {selectedRoute.targetPaceOrSpeed}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* =================================================================== */}
      {/* 4. CHẾ ĐỘ CHẠY BỘ / ĐẠP XE: DANH SÁCH CUNG ĐƯỜNG STRAVA ĐỀ XUẤT */}
      {/* =================================================================== */}
      {isRouteMode && (
        <div className="space-y-2.5 pt-1">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-foreground flex items-center gap-1.5">
              <span>Cung Đường {selectedSport === "running" ? "Chạy Bộ" : "Đạp Xe"} Đề Xuất</span>
              <Badge className="bg-[#c0e6fd]/60 text-[#1b3554] dark:bg-[#1b3554]/50 dark:text-[#c0e6fd] text-[9px] font-bold">
                {availableRoutes.length} cung đường
              </Badge>
            </h3>
            <span className="text-[10px] text-muted-foreground font-semibold">
              Nhấn để soi lộ trình
            </span>
          </div>

          <div className="space-y-2">
            {availableRoutes.map((route) => {
              const isSelected = selectedRoute?.id === route.id;
              return (
                <div
                  key={route.id}
                  onClick={() => handleSelectRoute(route)}
                  className={cn(
                    "p-3.5 rounded-3xl border transition-all cursor-pointer space-y-2 text-xs",
                    isSelected
                      ? "bg-card border-[#1b3554] shadow-md ring-1 ring-[#1b3554]/30"
                      : "bg-card/70 border-border hover:bg-card shadow-xs"
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-black text-foreground text-sm">
                          {route.name}
                        </span>
                        {isSelected && (
                          <Badge className="bg-[#1b3554] text-white text-[9px] font-bold">
                            Đang xem
                          </Badge>
                        )}
                      </div>
                      <div className="text-[11px] text-muted-foreground pt-0.5">
                        📍 {route.areaVi} ({route.district})
                      </div>
                    </div>

                    <Badge
                      variant="outline"
                      className={cn(
                        "text-[9px] font-bold",
                        route.difficulty === "Dễ"
                          ? "border-[#1b3554]/30 text-[#1b3554] dark:text-[#c0e6fd] bg-[#c0e6fd]/30"
                          : route.difficulty === "Vừa phải"
                          ? "border-amber-400 text-amber-700 bg-amber-500/10"
                          : "border-rose-400 text-rose-700 bg-rose-500/10"
                      )}
                    >
                      {route.difficulty}
                    </Badge>
                  </div>

                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    {route.subtitle}
                  </p>

                  {/* 3 Metric Pills: Distance, Elevation, Target Pace */}
                  <div className="grid grid-cols-3 gap-1.5 text-center text-xs">
                    <div className="p-1.5 rounded-xl bg-muted/60">
                      <div className="text-[9px] text-muted-foreground">Cự ly</div>
                      <div className="font-black text-[#1b3554] dark:text-[#80aad3]">
                        {route.distanceKm} km
                      </div>
                    </div>
                    <div className="p-1.5 rounded-xl bg-muted/60">
                      <div className="text-[9px] text-muted-foreground">Độ dốc (Gain)</div>
                      <div className="font-bold text-foreground">
                        +{route.elevationGainM}m
                      </div>
                    </div>
                    <div className="p-1.5 rounded-xl bg-muted/60">
                      <div className="text-[9px] text-muted-foreground">Ước tính</div>
                      <div className="font-bold text-foreground truncate">
                        {route.estimatedTime}
                      </div>
                    </div>
                  </div>

                  {/* Highlights & Record */}
                  <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-1 border-t border-border/60">
                    <div className="flex items-center gap-1.5">
                      <ShieldCheck className="h-3 w-3 text-[#1b3554] dark:text-[#80aad3]" />
                      <span>An toàn: <strong>{route.safetyScore}%</strong></span>
                      <span>• {route.waterStations} trạm nước</span>
                    </div>
                    <div className="font-semibold text-foreground">
                      Kỷ lục: {route.bestRecord.holder} ({route.bestRecord.time})
                    </div>
                  </div>

                  {/* Action Link to Create Bounty on This Route */}
                  <div className="pt-1 flex gap-2">
                    <Button
                      asChild
                      size="sm"
                      className="flex-1 h-7 rounded-full bg-[#1b3554] hover:bg-[#000f22] text-white text-xs font-bold gap-1"
                    >
                      <Link href={`/len-keo`}>
                        <Zap className="h-3 w-3 text-white" />
                        <span>Lên Kèo Cung Đường Này</span>
                      </Link>
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* 5. CHẾ ĐỘ SÂN BÃI (GYM, PICKLEBALL, CẦU LÔNG, BÓNG ĐÁ, BÓNG RỔ, BÓNG BÀN) */}
      {/* =================================================================== */}
      {!isRouteMode && (
        <div className="space-y-3 pt-1">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-foreground flex items-center gap-1.5">
              <span>Địa Điểm Sân Bãi & Phòng Tập</span>
              <Badge className="bg-[#c0e6fd]/60 text-[#1b3554] dark:bg-[#1b3554]/50 dark:text-[#c0e6fd] text-[9px] font-bold">
                {filteredVenues.length} địa điểm
              </Badge>
            </h3>
            <span className="text-[10px] text-muted-foreground font-semibold">
              Kèm link Google Maps chuẩn
            </span>
          </div>

          {filteredVenues.length === 0 ? (
            <div className="p-8 text-center rounded-3xl border border-dashed border-border bg-card text-muted-foreground text-xs space-y-2">
              <div>Không tìm thấy sân bãi phù hợp với từ khóa này.</div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedDistrict("Tất cả");
                }}
                className="rounded-full text-xs"
              >
                Đặt lại bộ lọc
              </Button>
            </div>
          ) : (
            <div className="space-y-2.5">
              {filteredVenues.map((venue) => {
                const isSelected = selectedVenue?.id === venue.id;
                return (
                  <div
                    key={venue.id}
                    onClick={() => handleSelectVenue(venue)}
                    className={cn(
                      "p-3.5 rounded-3xl border transition-all space-y-2 text-xs",
                      isSelected
                        ? "bg-card border-[#1b3554] shadow-md ring-1 ring-[#1b3554]/30"
                        : "bg-card/70 border-border hover:bg-card shadow-xs"
                    )}
                  >
                    {/* Header: Name & Rating */}
                    <div className="flex items-start justify-between">
                      <div className="space-y-0.5 max-w-[70%]">
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-black text-foreground text-sm leading-tight">
                            {venue.name}
                          </h4>
                        </div>
                        <div className="text-[11px] text-muted-foreground flex items-center gap-1">
                          <MapPin className="h-3 w-3 shrink-0 text-[#1b3554] dark:text-[#80aad3]" />
                          <span className="truncate">{venue.address}</span>
                        </div>
                      </div>

                      {/* Customer Satisfaction Rating Box */}
                      <div className="flex flex-col items-end">
                        <div className="flex items-center gap-1 bg-[#1b3554] text-white px-2 py-0.5 rounded-full font-bold text-xs shadow-xs">
                          <Star className="h-3 w-3 fill-current text-white" />
                          <span>{venue.rating.toFixed(1)}</span>
                        </div>
                        <span className="text-[9px] text-muted-foreground mt-0.5">
                          ({venue.reviewCount} đánh giá)
                        </span>
                      </div>
                    </div>

                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      {venue.highlights}
                    </p>

                    {/* Price & Hours Info */}
                    <div className="grid grid-cols-2 gap-1.5 p-2 rounded-2xl bg-muted/60 text-xs">
                      <div>
                        <div className="text-[9px] text-muted-foreground">Mức giá tham khảo</div>
                        <div className="font-bold text-[#1b3554] dark:text-[#80aad3] text-xs">
                          {venue.priceRange}
                        </div>
                      </div>
                      <div>
                        <div className="text-[9px] text-muted-foreground">Giờ hoạt động</div>
                        <div className="font-semibold text-foreground text-xs flex items-center gap-1">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          <span>{venue.openHours}</span>
                        </div>
                      </div>
                    </div>

                    {/* Amenities chips */}
                    <div className="flex flex-wrap gap-1">
                      {venue.amenities.map((amenity, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded-full bg-muted/50 border border-border/60 text-[10px] text-muted-foreground font-medium"
                        >
                          {amenity}
                        </span>
                      ))}
                    </div>

                    {/* Action Buttons: Google Maps link + Lên kèo */}
                    <div className="flex gap-2 pt-1 border-t border-border/60">
                      {/* Direct Google Maps link */}
                      <a
                        href={venue.googleMapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 inline-flex items-center justify-center gap-1.5 h-8 px-3 rounded-full border border-[#1b3554]/40 bg-background hover:bg-muted text-[#1b3554] dark:text-[#c0e6fd] text-xs font-bold transition-colors"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        <span>Chỉ đường Google Maps</span>
                      </a>

                      {/* Lên Kèo tại sân này */}
                      <Button
                        asChild
                        size="sm"
                        className="flex-1 h-8 rounded-full bg-[#1b3554] hover:bg-[#000f22] text-white text-xs font-bold gap-1 shadow-xs"
                      >
                        <Link href="/len-keo">
                          <Zap className="h-3.5 w-3.5 text-white" />
                          <span>Lên Kèo Tại Sân</span>
                        </Link>
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
