"use client";

import * as React from "react";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, MapPin, QrCode } from "lucide-react";
import Link from "next/link";

interface MyBounty {
  id: string;
  sportName: string;
  partnerName?: string;
  startsAt: string;
  location: string;
  stake: number;
  status: "waiting" | "matched" | "completed";
}

const SAMPLE_MY_BOUNTIES: MyBounty[] = [
  {
    id: "mb-1",
    sportName: "Chạy bộ (Running)",
    partnerName: "Minh Quân (Pace 6:00)",
    startsAt: "05:30 AM • Ngày mai",
    location: "Cổng chính Landmark 81, Bình Thạnh",
    stake: 50,
    status: "matched",
  },
  {
    id: "mb-2",
    sportName: "Tập kháng lực (Gym)",
    startsAt: "18:00 PM • Thứ Năm",
    location: "Phòng tập KTX Khu B ĐHQG Thủ Đức",
    stake: 30,
    status: "waiting",
  },
];

export default function MyBountiesPage() {
  const [filter, setFilter] = React.useState<"all" | "active" | "completed">("active");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Kèo Của Tôi"
        description="Quản lý các lịch tập bạn đã tạo hoặc đã nhận. Điểm danh tại điểm hẹn bằng mã QR động."
        actions={
          <Button asChild size="sm">
            <Link href="/bang-keo">Tìm thêm kèo mới</Link>
          </Button>
        }
      />

      {/* Tabs */}
      <div className="flex border-b border-border space-x-4 text-sm font-medium">
        <button
          onClick={() => setFilter("active")}
          className={`pb-2 border-b-2 transition-colors ${
            filter === "active"
              ? "border-primary text-primary font-bold"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Kèo sắp tới (2)
        </button>
        <button
          onClick={() => setFilter("completed")}
          className={`pb-2 border-b-2 transition-colors ${
            filter === "completed"
              ? "border-primary text-primary font-bold"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Lịch sử đã xong (1)
        </button>
      </div>

      {/* Danh sách */}
      <div className="space-y-4">
        {SAMPLE_MY_BOUNTIES.map((bounty) => (
          <Card key={bounty.id} className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-base font-bold">{bounty.sportName}</CardTitle>
                <CardDescription className="text-xs">
                  {bounty.partnerName ? `Bạn tập: ${bounty.partnerName}` : "Đang chờ đối tác nhận kèo..."}
                </CardDescription>
              </div>
              <Badge variant={bounty.status === "matched" ? "success" : "secondary"}>
                {bounty.status === "matched" ? "Đã ghép cặp" : "Đang tìm bạn"}
              </Badge>
            </CardHeader>

            <CardContent className="space-y-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary shrink-0" />
                <span>{bounty.startsAt}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-amber-500 shrink-0" />
                <span>{bounty.location}</span>
              </div>
            </CardContent>

            <CardFooter className="border-t border-border/70 pt-3 flex items-center justify-between">
              <span className="text-xs font-mono font-semibold text-primary">
                Cọc: {bounty.stake} TS (Đang giữ)
              </span>

              {bounty.status === "matched" ? (
                <Button size="sm" className="font-semibold gap-1.5">
                  <QrCode className="h-4 w-4" />
                  <span>Điểm danh QR tại chỗ</span>
                </Button>
              ) : (
                <Button size="sm" variant="outline" className="text-xs text-destructive hover:bg-destructive/10">
                  Hủy kèo (Trước 2h)
                </Button>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
