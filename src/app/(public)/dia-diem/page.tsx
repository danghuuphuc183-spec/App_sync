"use client";

import * as React from "react";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, ExternalLink, ShieldCheck } from "lucide-react";
import { AREAS } from "@/features/sports/quiz.config";

interface VenueItem {
  id: string;
  name: string;
  venueType: "public_park" | "commercial_gym" | "stadium";
  areaId: string;
  areaName: string;
  address: string;
  tags: string[];
  lat: number;
  lng: number;
  isVerified: boolean;
}

const SAMPLE_VENUES: VenueItem[] = [
  {
    id: "venue-1",
    name: "Công viên Landmark 81 & Bờ kè Thanh Đa",
    venueType: "public_park",
    areaId: "area-binh-thanh",
    areaName: "Bình Thạnh",
    address: "720A Điện Biên Phủ, Phường 22, Bình Thạnh, TP.HCM",
    tags: ["Đủ sáng lúc 5h sáng", "Có vòi nước", "Đường chạy bằng phẳng"],
    lat: 10.795,
    lng: 106.721,
    isVerified: true,
  },
  {
    id: "venue-2",
    name: "Khuôn viên Hồ Đá & KTX ĐHQG Thủ Đức",
    venueType: "public_park",
    areaId: "area-thu-duc",
    areaName: "Thủ Đức",
    address: "Đường Tạ Quang Bửu, KĐT ĐHQG TP.HCM, Thủ Đức",
    tags: ["Không khí thoáng mát", "Nhiều dốc luyện sức bền", "Bảo vệ KTX 24/7"],
    lat: 10.875,
    lng: 106.801,
    isVerified: true,
  },
  {
    id: "venue-3",
    name: "Phòng Gym Sinh Viên KTX Khu B",
    venueType: "commercial_gym",
    areaId: "area-thu-duc",
    areaName: "Thủ Đức",
    address: "Khu B ĐHQG, Phường Đông Hòa, Dĩ An - Thủ Đức",
    tags: ["Vé tập lẻ sinh viên", "Đầy đủ giàn Squat", "Có gửi xe sớm"],
    lat: 10.882,
    lng: 106.782,
    isVerified: true,
  },
];

export default function VenuesPage() {
  const [selectedArea, setSelectedArea] = React.useState<string>("all");

  const filteredVenues = SAMPLE_VENUES.filter((v) => {
    if (selectedArea !== "all" && v.areaId !== selectedArea) return false;
    return true;
  });

  return (
    <div className="container max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      <PageHeader
        title="Điểm Chạm Thể Thao Xác Thực (Training Spots)"
        description="Danh bạ các không gian công cộng và phòng tập đối tác an toàn, có đầy đủ thông tin hậu cần vi mô (micro-tags)."
        badge={<Badge variant="outline">An toàn buổi tập</Badge>}
      />

      {/* Lọc khu vực */}
      <div className="flex items-center gap-3">
        <span className="text-xs font-semibold text-muted-foreground">Khu vực:</span>
        <select
          value={selectedArea}
          onChange={(e) => setSelectedArea(e.target.value)}
          className="h-9 rounded-md border border-input bg-background px-3 text-xs focus:ring-1 focus:ring-primary"
        >
          <option value="all">Tất cả khu vực</option>
          {AREAS.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </select>
      </div>

      {/* Danh sách địa điểm */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredVenues.map((venue) => (
          <Card key={venue.id} className="hover:border-primary/50 transition-all shadow-sm flex flex-col justify-between">
            <CardHeader className="space-y-2 pb-3">
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="text-xs">
                  {venue.areaName}
                </Badge>
                {venue.isVerified && (
                  <Badge variant="success" className="text-[10px] flex items-center gap-1">
                    <ShieldCheck className="h-3 w-3" />
                    Điểm công cộng an toàn
                  </Badge>
                )}
              </div>
              <CardTitle className="text-base font-bold leading-snug">{venue.name}</CardTitle>
              <CardDescription className="text-xs flex items-start gap-1.5 mt-1">
                <MapPin className="h-3.5 w-3.5 text-amber-500 shrink-0 mt-0.5" />
                <span className="line-clamp-2">{venue.address}</span>
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-2 pb-4">
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                Đặc điểm thực tế (Micro-tags):
              </p>
              <div className="flex flex-wrap gap-1.5">
                {venue.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center px-2 py-0.5 rounded-md bg-secondary text-[11px] text-foreground font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </CardContent>

            <CardFooter className="pt-2 border-t border-border/70 flex items-center justify-between">
              <span className="text-[11px] text-muted-foreground">
                Tọa độ: {venue.lat.toFixed(3)}, {venue.lng.toFixed(3)}
              </span>

              {/* Mở ứng dụng bản đồ bên ngoài - tuân thủ ràng buộc không dùng tile trả phí ở MVP */}
              <Button asChild size="sm" variant="outline" className="text-xs gap-1">
                <a
                  href={`https://maps.google.com/?q=${venue.lat},${venue.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span>Mở Google Maps</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
