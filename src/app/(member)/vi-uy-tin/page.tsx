"use client";

import * as React from "react";
import { PageHeader } from "@/components/shared/page-header";
import { TrustMeter } from "@/components/shared/trust-meter";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TRUST_CONFIG } from "@/features/trust/config";
import { Shield, ArrowUpRight, ArrowDownRight, Sparkles, HeartHandshake } from "lucide-react";
import { cn } from "@/lib/utils";

interface LedgerEntry {
  id: string;
  delta: number;
  balanceAfter: number;
  reasonVi: string;
  createdAtVi: string;
}

const SAMPLE_LEDGER: LedgerEntry[] = [
  {
    id: "tx-3",
    delta: 2,
    balanceAfter: 102,
    reasonVi: "Hoàn thành buổi chạy 10km Landmark 81 đúng hẹn",
    createdAtVi: "29/10/2026, 06:45",
  },
  {
    id: "tx-2",
    delta: 0,
    balanceAfter: 100,
    reasonVi: "Sử dụng Thẻ Ân Hạn (Grace Pass) hủy lịch trước 2 giờ (Miễn trừ phạt)",
    createdAtVi: "25/10/2026, 17:30",
  },
  {
    id: "tx-1",
    delta: 100,
    balanceAfter: 100,
    reasonVi: "Khởi tạo tài khoản thành viên mới (+100 TS)",
    createdAtVi: "20/10/2026, 08:00",
  },
];

export default function TrustWalletPage() {
  const currentScore = 102;
  const heldScore = 20; // Đang cọc 1 kèo
  const gracePassesLeft = 1; // 1 thẻ ân hạn còn lại

  return (
    <div className="space-y-8">
      <PageHeader
        title="Ví Điểm Uy Tín (Trust Score Wallet)"
        description="Thước đo danh dự thể thao của bạn. Điểm uy tín xác định thứ hạng đặc quyền và dùng làm tài sản thế chấp khi nhận kèo."
        badge={<Badge variant="gold">Hạng Vàng</Badge>}
      />

      {/* 1. THANH ĐO UY TÍN */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <TrustMeter currentScore={currentScore} heldScore={heldScore} />
        </div>

        {/* Thẻ ân hạn (Grace pass) */}
        <Card className="border-border shadow-sm flex flex-col justify-between">
          <CardHeader className="space-y-1">
            <div className="flex items-center gap-2 text-primary font-bold text-sm">
              <HeartHandshake className="h-4 w-4" />
              <span>Bảo hiểm & Thẻ Ân Hạn</span>
            </div>
            <CardTitle className="text-xl font-bold">Thẻ Ân Hạn (Grace Pass)</CardTitle>
            <CardDescription className="text-xs">
              Mỗi thành viên có {TRUST_CONFIG.GRACE_PASSES_PER_MONTH} thẻ/tháng để hủy kèo trước 2 giờ mà không bị trừ điểm uy tín.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-xl bg-muted/60 border border-border">
              <span className="text-xs font-medium">Số thẻ còn lại trong tháng:</span>
              <span className="text-lg font-mono font-bold text-primary">
                {gracePassesLeft} / {TRUST_CONFIG.GRACE_PASSES_PER_MONTH}
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground leading-normal">
              Thẻ được tự động làm mới vào ngày 1 hàng tháng.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 2. LỊCH SỬ BIẾN ĐỘNG SỔ CÁI (TRUST LEDGER) */}
      <Card className="border-border shadow-sm">
        <CardHeader className="border-b border-border/70 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                <span>Nhật ký Sổ Cái Uy Tín (Trust Ledger)</span>
              </CardTitle>
              <CardDescription className="text-xs mt-1">
                Sổ cái bất biến (Append-only). Mọi biến động đều được lưu vết minh bạch.
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-xs">
              Chỉ thêm • Không sửa/xóa
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {SAMPLE_LEDGER.map((tx) => (
              <div
                key={tx.id}
                className="p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={cn(
                      "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
                      tx.delta > 0
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                        : tx.delta < 0
                        ? "bg-destructive/10 text-destructive"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {tx.delta > 0 ? (
                      <ArrowUpRight className="h-5 w-5 stroke-[2.5]" />
                    ) : tx.delta < 0 ? (
                      <ArrowDownRight className="h-5 w-5 stroke-[2.5]" />
                    ) : (
                      <Sparkles className="h-4 w-4" />
                    )}
                  </div>

                  <div className="space-y-0.5 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">
                      {tx.reasonVi}
                    </p>
                    <p className="text-xs text-muted-foreground">{tx.createdAtVi}</p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <p
                    className={cn(
                      "text-sm font-mono font-bold",
                      tx.delta > 0
                        ? "text-emerald-600 dark:text-emerald-400"
                        : tx.delta < 0
                        ? "text-destructive"
                        : "text-muted-foreground"
                    )}
                  >
                    {tx.delta > 0 ? `+${tx.delta}` : tx.delta} TS
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    Số dư sau: {tx.balanceAfter} TS
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 3. BẢNG QUY TẮC THƯỞNG PHẠT CHUẨN */}
      <Card className="border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Quy Tắc Thưởng & Phạt Kỷ Luật</CardTitle>
          <CardDescription className="text-xs">
            Trích xuất trực tiếp từ file cấu hình hệ thống (PROJECT_CONTEXT 4.2).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-lg border border-border bg-muted/20 space-y-1">
              <span className="font-semibold text-emerald-600 dark:text-emerald-400 block">
                +{TRUST_CONFIG.DELTAS.COMPLETED_ON_TIME} TS
              </span>
              <p className="text-foreground">Hoàn thành đúng hẹn & đủ khối lượng bài tập</p>
              <p className="text-muted-foreground text-[11px]">Hoàn 100% điểm cọc</p>
            </div>

            <div className="p-3 rounded-lg border border-border bg-muted/20 space-y-1">
              <span className="font-semibold text-amber-600 block">
                {TRUST_CONFIG.DELTAS.LATE_5_TO_15_MIN} TS
              </span>
              <p className="text-foreground">Đến trễ từ 5 đến 15 phút</p>
              <p className="text-muted-foreground text-[11px]">Trừ uy tín vì để đối tác chờ</p>
            </div>

            <div className="p-3 rounded-lg border border-border bg-muted/20 space-y-1">
              <span className="font-semibold text-amber-600 block">
                {TRUST_CONFIG.DELTAS.CANCEL_OVER_2H} TS
              </span>
              <p className="text-foreground">Hủy kèo trước giờ hẹn trên 2 giờ</p>
              <p className="text-muted-foreground text-[11px]">0 TS nếu sử dụng Thẻ Ân Hạn</p>
            </div>

            <div className="p-3 rounded-lg border border-border bg-muted/20 space-y-1">
              <span className="font-semibold text-destructive block">
                {TRUST_CONFIG.DELTAS.CANCEL_UNDER_2H} TS
              </span>
              <p className="text-foreground">Hủy kèo sát giờ (dưới 2 giờ)</p>
              <p className="text-muted-foreground text-[11px]">Tịch thu cọc đền bù đối tác</p>
            </div>

            <div className="p-3 rounded-lg border border-border bg-muted/20 space-y-1 sm:col-span-2">
              <span className="font-semibold text-destructive block">
                {TRUST_CONFIG.DELTAS.NO_SHOW_OR_OVER_15_MIN} TS
              </span>
              <p className="text-foreground">Bùng kèo hoặc trễ quá 15 phút không báo</p>
              <p className="text-muted-foreground text-[11px]">
                Đánh tụt hạng ngay lập tức. Khóa tạo kèo 7 ngày.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
