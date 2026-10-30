import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { TierBadge } from "@/components/shared/tier-badge";
import { TrustMeter } from "@/components/shared/trust-meter";
import { SportCard } from "@/components/shared/sport-card";
import {
  Shield,
  Activity,
  Users,
  Compass,
  ArrowRight,
  Sparkles,
  Clock,
  MapPin,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="flex flex-col gap-16 py-8 sm:py-12">
      {/* 1. HERO SECTION */}
      <section className="container max-w-5xl mx-auto px-4 sm:px-6 text-center space-y-6">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1 text-xs font-semibold text-primary">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Thử nghiệm giai đoạn đầu quanh cụm đại học Bình Thạnh & Thủ Đức</span>
        </div>

        <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-foreground leading-[1.15]">
          Khế Ước Kỷ Luật <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-600 bg-clip-text text-transparent">
            Thể Thao Đô Thị
          </span>
        </h1>

        <p className="max-w-2xl mx-auto text-base sm:text-lg text-muted-foreground leading-relaxed">
          Không còn bùng kèo, không còn lạc lõng khi tập một mình. Ghép bạn tập cùng trình độ,
          ràng buộc bằng <strong>Điểm Uy Tín (Trust Score)</strong> và xác thực buổi tập thực tế.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
          <Button asChild size="lg" className="w-full sm:w-auto px-8 font-semibold shadow-lg shadow-primary/20">
            <Link href="/chon-mon">
              <span>Bắt đầu chọn môn</span>
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>

          <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
            <Link href="/chon-mon/goi-y">
              <Compass className="mr-2 h-4 w-4 text-emerald-600" />
              <span>Làm Quiz gợi ý môn</span>
            </Link>
          </Button>
        </div>

        {/* 3 Trụ cột cốt lõi */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-10 text-left">
          <Card className="border-border/80 bg-card/60 hover:border-primary/40 transition-colors">
            <CardContent className="p-5 space-y-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600">
                <Activity className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-base">Cùng trình độ thực tế</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Đánh giá theo dải năng lực nội bộ (Pace, Volume, tuần suất), không khai khống thể lực.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/80 bg-card/60 hover:border-primary/40 transition-colors">
            <CardContent className="p-5 space-y-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600">
                <Shield className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-base">Cam kết Điểm Uy Tín</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Khởi đầu 100 TS. Cọc điểm giữ chỗ mỗi kèo, đúng giờ được thưởng, bùng kèo bị trừ điểm nghiêm minh.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/80 bg-card/60 hover:border-primary/40 transition-colors">
            <CardContent className="p-5 space-y-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-600">
                <Users className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-base">Quản trị CLB (Club OS)</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Giải phóng ban chủ nhiệm khỏi Google Sheets, tự động điểm danh và xây dựng cộng đồng tập luyện văn minh.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* 2. KHÁM PHÁ MÔN THỂ THAO MVP */}
      <section className="container max-w-5xl mx-auto px-4 sm:px-6 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-2 border-b border-border/70 pb-4">
          <div>
            <Badge variant="outline" className="mb-1 text-xs">Danh mục thể thao</Badge>
            <h2 className="text-2xl font-bold tracking-tight">Môn thể thao trọng tâm</h2>
            <p className="text-xs text-muted-foreground">MVP tập trung chạy bộ và kháng lực tại các cụm thể thao đô thị</p>
          </div>
          <Button asChild variant="ghost" size="sm">
            <Link href="/mon-the-thao" className="flex items-center gap-1 text-xs font-semibold">
              Xem tất cả <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <SportCard
            id="sport-running"
            slug="chay-bo"
            nameVi="Chạy bộ đường dài (Running)"
            category="endurance"
            verificationMode="auto_api"
            phase={1}
            isActive={true}
            descriptionVi="Ghép cặp chạy bộ cự ly 5km - 21km theo dải Pace tương đồng. Khung giờ sáng sớm quanh công viên và bờ kè đô thị."
          />
          <SportCard
            id="sport-gym"
            slug="tap-khang-luc"
            nameVi="Tập kháng lực (Gym / Strength)"
            category="strength"
            verificationMode="auto_api"
            phase={1}
            isActive={true}
            descriptionVi="Tìm bạn đỡ tạ (spotter) cùng lịch tập, chia sẻ kỹ thuật và cam kết giữ lịch tập 3-4 buổi/tuần."
          />
        </div>
      </section>

      {/* 3. MÔ PHỎNG TRUST SCORE & HẠNG */}
      <section className="container max-w-5xl mx-auto px-4 sm:px-6">
        <div className="rounded-2xl border border-border bg-gradient-to-b from-card to-secondary/30 p-6 sm:p-8 space-y-6">
          <div className="max-w-xl">
            <Badge variant="secondary" className="mb-2">Thước đo danh dự</Badge>
            <h2 className="text-2xl font-bold tracking-tight">Cơ chế Điểm Uy Tín (0 - 150 TS)</h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Điểm Uy Tín không thể mua bán bằng tiền. Mọi thành viên bắt đầu ở mức 100 TS (Hạng Vàng) và tự quyết định thứ hạng qua kỷ luật.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            {/* Demo TrustMeter Component */}
            <TrustMeter currentScore={100} heldScore={20} />

            {/* 4 Hạng minh họa */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Hệ thống 4 Hạng Thể Thao
              </h4>
              <div className="grid grid-cols-2 gap-2.5">
                <div className="p-3 rounded-lg border border-border bg-background space-y-1">
                  <TierBadge tier="diamond" score={135} />
                  <p className="text-[11px] text-muted-foreground">130-150 TS: Mentor dẫn dắt</p>
                </div>
                <div className="p-3 rounded-lg border border-border bg-background space-y-1">
                  <TierBadge tier="gold" score={110} />
                  <p className="text-[11px] text-muted-foreground">100-129 TS: Kỷ luật chuẩn</p>
                </div>
                <div className="p-3 rounded-lg border border-border bg-background space-y-1">
                  <TierBadge tier="silver" score={75} />
                  <p className="text-[11px] text-muted-foreground">60-99 TS: Tối đa 2 kèo</p>
                </div>
                <div className="p-3 rounded-lg border border-border bg-background space-y-1">
                  <TierBadge tier="bronze" score={45} />
                  <p className="text-[11px] text-muted-foreground">&lt;60 TS: Cọc gấp đôi</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. PREVIEW BẢNG KÈO (WORKOUT BOUNTY) */}
      <section className="container max-w-5xl mx-auto px-4 sm:px-6 space-y-6">
        <div className="flex items-center justify-between border-b border-border/70 pb-4">
          <div>
            <Badge variant="outline" className="mb-1 text-xs">Bounty Board v0</Badge>
            <h2 className="text-2xl font-bold tracking-tight">Kèo tập đang mở quanh khu vực</h2>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link href="/bang-keo">Xem toàn bộ bảng kèo</Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card className="hover:border-primary/50 transition-colors">
            <CardContent className="p-5 space-y-3">
              <div className="flex items-center justify-between">
                <Badge variant="success">Đang mở nhận</Badge>
                <span className="text-xs font-semibold text-primary">Cọc: 50 TS</span>
              </div>
              <h4 className="font-bold text-base">Chạy 10km sáng sớm • Bình Thạnh</h4>
              <div className="space-y-1 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>05:30 AM • Thứ Tư tới</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>Khuôn viên Landmark 81 / Bờ kè Thanh Đa</span>
                </div>
              </div>
              <div className="pt-2 flex items-center justify-between border-t border-border">
                <span className="text-xs text-muted-foreground">Pace mục tiêu: 5:45 - 6:15</span>
                <Button size="sm" asChild>
                  <Link href="/bang-keo">Nhận kèo</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:border-primary/50 transition-colors">
            <CardContent className="p-5 space-y-3">
              <div className="flex items-center justify-between">
                <Badge variant="secondary">Chế độ Hướng nội (Ghost Mode)</Badge>
                <span className="text-xs font-semibold text-primary">Cọc: 30 TS</span>
              </div>
              <h4 className="font-bold text-base">Tập ngực & tay sau • Gym Thủ Đức</h4>
              <div className="space-y-1 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>18:00 PM • Thứ Năm tới</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>Phòng tập thể thao ĐHQG Thủ Đức</span>
                </div>
              </div>
              <div className="pt-2 flex items-center justify-between border-t border-border">
                <span className="text-xs text-muted-foreground">Cần người đỡ tạ (Spotter)</span>
                <Button size="sm" asChild>
                  <Link href="/bang-keo">Nhận kèo</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
