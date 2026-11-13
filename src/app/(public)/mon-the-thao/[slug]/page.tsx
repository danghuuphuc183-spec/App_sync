import * as React from "react";
import { notFound } from "next/navigation";
import { SEED_SPORTS } from "@/features/sports/sports.data";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowLeft,
  Lock,
} from "lucide-react";
import Link from "next/link";

interface SportDetailPageProps {
  params: Promise<{ slug: string }>;
}

export default async function SportDetailPage({ params }: SportDetailPageProps) {
  const { slug } = await params;
  const sport = SEED_SPORTS.find((s) => s.slug === slug);

  if (!sport) {
    notFound();
  }

  const verificationModeVi = {
    auto_api: "Đồng bộ tự động qua API (Strava, Hevy)",
    qr_only: "Quét mã QR động tại điểm hẹn công cộng",
    peer_confirm: "Đối tác tập xác nhận hoàn thành",
  }[sport.verificationMode];

  return (
    <div className="container max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      <div>
        <Button asChild variant="ghost" size="sm" className="mb-4">
          <Link href="/mon-the-thao">
            <ArrowLeft className="mr-1.5 h-4 w-4" />
            <span>Quay lại danh mục môn</span>
          </Link>
        </Button>

        <PageHeader
          title={sport.nameVi}
          description={sport.descriptionVi}
          badge={
            sport.isActive ? (
              <Badge variant="success">Phase {sport.phase} • Đang hoạt động</Badge>
            ) : (
              <Badge variant="secondary">Phase {sport.phase} • Sắp ra mắt</Badge>
            )
          }
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Cột trái: Thông tin & Cách xác thực */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-foreground" />
                <span>Quy trình xác thực khế ước buổi tập</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground leading-relaxed">
              <div className="p-3.5 rounded-lg bg-muted/60 border border-border">
                <span className="font-semibold text-foreground block mb-1">
                  Phương thức: {verificationModeVi}
                </span>
                <p className="text-xs">
                  {sport.verificationMode === "auto_api"
                    ? "Sau khi quét mã QR điểm danh lúc bắt đầu, hệ thống sẽ đối soát dữ liệu vận động thực chứng từ thiết bị đeo (thời gian, nhịp tim biến thiên, quãng đường/khối lượng tạ)."
                    : "Hai người tập gặp nhau tại địa điểm xác thực và quét mã QR để ghi nhận bắt đầu và kết thúc buổi tập."}
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold text-foreground text-xs uppercase tracking-wider">
                  Chỉ số dùng để ghép cặp vi mô (Micro-Matching)
                </h4>
                <ul className="space-y-1.5 text-xs">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-foreground shrink-0" />
                    <span>Dải trình độ tự khai & năng lực tính toán nội bộ (Beginner/Intermediate/Advanced)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-foreground shrink-0" />
                    <span>Khung giờ sinh hoạt & cụm khu vực thường tập (Bình Thạnh, Thủ Đức...)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-foreground shrink-0" />
                    <span>Tương đồng thói quen kỷ luật và Điểm Uy tín (UT)</span>
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Cột phải: Thao tác & Cam kết */}
        <div className="space-y-5">
          <Card className="border-primary/30 shadow-md">
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center gap-2 text-primary font-bold text-sm">
                <Sparkles className="h-4 w-4" />
                <span>Khế ước thể thao</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Khi chọn môn này, bạn có thể tạo hồ sơ tập luyện cá nhân và bắt đầu tìm bạn tập trên Bảng Kèo.
              </p>

              {sport.isActive ? (
                <Button asChild className="w-full font-semibold shadow-sm" size="lg">
                  <Link href={`/chon-mon/ho-so/${sport.slug}`}>
                    <span>Chọn môn này</span>
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              ) : (
                <Button disabled variant="outline" className="w-full text-xs" size="lg">
                  <Lock className="mr-2 h-4 w-4" />
                  <span>Chưa khả dụng ở MVP</span>
                </Button>
              )}
            </CardContent>
          </Card>

          <div className="rounded-xl border border-border p-4 bg-muted/30 text-xs text-muted-foreground space-y-2">
            <div className="flex items-center gap-1.5 font-semibold text-foreground">
              <Clock className="h-3.5 w-3.5 text-foreground" />
              <span>Chế độ Hướng nội (Ghost Mode)</span>
            </div>
            <p>
              Môn này hỗ trợ Ghost Mode. Bạn có thể tập cùng mà không cần trò chuyện xã giao, chỉ cần quét QR và giữ kỷ luật bài tập.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
