"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  CreditCard,
  Building2,
  Users,
  Dumbbell,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  QrCode,
  CheckCircle2,
  ChevronRight,
  Receipt,
  RotateCcw,
} from "lucide-react";
import { SplitPaymentKind, SplitPaymentOrder } from "@/features/payment/payos.types";
import { VietQRPaymentModal } from "@/components/payment/vietqr-payment-modal";
import { formatVnd } from "@/features/payment/vietqr.service";

interface Scenario {
  id: string;
  kind: SplitPaymentKind;
  title: string;
  category: string;
  description: string;
  amount: number;
  partnerKey: "the_new_gym" | "coach_tuan_anh" | "club_running_ftu2";
  partnerName: string;
  partnerBank: string;
  platformFeePercent: number;
  isCapped?: boolean;
  badge: string;
}

const SCENARIOS: Scenario[] = [
  {
    id: "sc-club",
    kind: "club_membership",
    title: "Đóng Quỹ Sinh Hoạt Tháng 11 · CLB Running FTU2",
    category: "Câu lạc bộ (Club OS)",
    description: "Thành viên đóng quỹ sinh hoạt hàng tháng qua mã VietQR tự động.",
    amount: 100_000,
    partnerKey: "club_running_ftu2",
    partnerName: "CLB RUNNING FTU2",
    partnerBank: "ACB · STK: 8899889988",
    platformFeePercent: 3,
    badge: "Phí 3% (Quy chế D37)",
  },
  {
    id: "sc-coach",
    kind: "coaching_starter",
    title: "Khóa Học Starter Chạy Bộ & Calisthenics 8 Buổi",
    category: "Huấn luyện viên (PT)",
    description: "Lớp nhóm nhỏ 4-6 bạn trẻ học kỹ thuật căn bản và phòng tránh chấn thương.",
    amount: 300_000,
    partnerKey: "coach_tuan_anh",
    partnerName: "NGUYEN TUAN ANH (Coach)",
    partnerBank: "Techcombank · STK: 1903668899",
    platformFeePercent: 18,
    badge: "Hoa hồng 18%",
  },
  {
    id: "sc-gym-trial",
    kind: "gym_trial_ticket",
    title: "Vé Tập Thử Drop-in 1 Ngày · The New Gym Điện Biên Phủ",
    category: "Phòng tập đối tác",
    description: "Khách trải nghiệm trọn gói tiện ích 24/7 và dàn máy Matrix cao cấp.",
    amount: 200_000,
    partnerKey: "the_new_gym",
    partnerName: "THE NEW GYM DIEN BIEN PHU",
    partnerBank: "MBBank · STK: 1122334455",
    platformFeePercent: 30,
    badge: "Hoa hồng 30%",
  },
  {
    id: "sc-gym-year",
    kind: "gym_membership_12m",
    title: "Hợp Đồng Thẻ Hội Viên 1 Năm · The New Gym",
    category: "Phòng tập đối tác",
    description: "Khách hàng mới đăng ký thẻ tập cả năm sau buổi trải nghiệm trên Synesis.",
    amount: 12_000_000,
    partnerKey: "the_new_gym",
    partnerName: "THE NEW GYM DIEN BIEN PHU",
    partnerBank: "MBBank · STK: 1122334455",
    platformFeePercent: 15,
    isCapped: true,
    badge: "Áp trần tối đa 800.000đ",
  },
];

export default function PaymentDemoPage() {
  const [activeOrder, setActiveOrder] = useState<SplitPaymentOrder | null>(null);
  const [loadingScenarioId, setLoadingScenarioId] = useState<string | null>(null);
  const [completedOrders, setCompletedOrders] = useState<SplitPaymentOrder[]>([]);

  // Bắt đầu thanh toán một kịch bản
  const handleStartPayment = async (scenario: Scenario) => {
    setLoadingScenarioId(scenario.id);
    try {
      const res = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: scenario.kind,
          title: scenario.title,
          amount: scenario.amount,
          buyerName: "Nguyễn Văn An (Tester)",
          buyerPhone: "0901234567",
          buyerEmail: "an.nguyen@ftu.edu.vn",
          partnerKey: scenario.partnerKey,
        }),
      });

      const data = await res.json();
      if (data.success && data.data) {
        setActiveOrder(data.data);
      }
    } catch (err) {
      console.error("Lỗi khởi tạo đơn hàng:", err);
    } finally {
      setLoadingScenarioId(null);
    }
  };

  const handlePaymentSuccess = (paidOrder: SplitPaymentOrder) => {
    setCompletedOrders((prev) => [
      paidOrder,
      ...prev.filter((o) => o.orderCode !== paidOrder.orderCode),
    ]);
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      {/* Top Header */}
      <div className="border-b border-border/60 bg-card/60 backdrop-blur sticky top-0 z-30 px-4 py-3 sm:py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-primary/10 text-primary">
                <QrCode className="h-4 w-4" />
              </span>
              <h1 className="text-base sm:text-lg font-bold tracking-tight">
                Thử Nghiệm payOS VietQR Split Payment
              </h1>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Mô phỏng phân tách dòng tiền tự động giữa Đối tác & Tài khoản Nền tảng
            </p>
          </div>
          <Link
            href="/cau-lac-bo/quan-ly"
            className="text-xs text-primary hover:underline font-medium"
          >
            Quay lại Club OS
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
        {/* Banner Thông tin Tài khoản Thử nghiệm */}
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-primary/5 via-primary/10 to-transparent border border-primary/20 space-y-3">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-primary uppercase tracking-wider">
              <Building2 className="h-4 w-4" />
              Tài Khoản Thụ Hưởng Nền Tảng (Synesis Platform)
            </span>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-primary/20 text-primary font-medium">
              Chế độ Thí Nghiệm
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 text-xs">
            <div className="p-2.5 rounded-xl bg-card/80 border border-border/60">
              <span className="text-muted-foreground block text-[11px]">Chủ tài khoản:</span>
              <span className="font-bold text-foreground text-sm">
                CÔNG TY TNHH SYNISIS
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-card/80 border border-border/60">
              <span className="text-muted-foreground block text-[11px]">Ngân hàng:</span>
              <span className="font-bold text-foreground text-sm">
                Vietcombank (VCB)
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-card/80 border border-border/60">
              <span className="text-muted-foreground block text-[11px]">Số tài khoản (STK):</span>
              <span className="font-mono font-extrabold text-primary text-sm tracking-wider">
                09090909
              </span>
            </div>
          </div>
          <p className="text-[11px] text-muted-foreground flex items-center gap-1">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
            Tiền phí hoa hồng/dịch vụ của mọi giao dịch sẽ tự động được phân tách về STK trên.
          </p>
        </div>

        {/* 4 Kịch bản thí nghiệm dòng tiền */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-foreground uppercase tracking-wide flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-primary" />
              Chọn 1 trong 4 Kịch Bản Để Thử Nghiệm Dòng Tiền
            </h2>
            <span className="text-xs text-muted-foreground">
              Bấm &quot;Thanh toán thử&quot; để sinh VietQR
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {SCENARIOS.map((sc) => {
              const isLoading = loadingScenarioId === sc.id;

              return (
                <div
                  key={sc.id}
                  className="p-4 rounded-2xl bg-card border border-border/70 shadow-sm hover:border-primary/50 transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-muted text-muted-foreground">
                        {sc.category}
                      </span>
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20">
                        {sc.badge}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-foreground leading-snug">
                      {sc.title}
                    </h3>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {sc.description}
                    </p>

                    {/* Phân tách dòng tiền mô phỏng */}
                    <div className="p-2.5 rounded-xl bg-muted/30 border border-border/40 text-[11px] space-y-1">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Tổng tiền thanh toán:</span>
                        <span className="font-extrabold text-foreground">
                          {formatVnd(sc.amount)}
                        </span>
                      </div>
                      <div className="flex justify-between text-muted-foreground">
                        <span>👉 Đối tác ({sc.partnerName}):</span>
                        <span className="font-semibold text-foreground">
                          {formatVnd(
                            sc.isCapped
                              ? sc.amount - 800_000
                              : sc.amount * (1 - sc.platformFeePercent / 100)
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between text-muted-foreground">
                        <span>👉 Synesis (VCB 09090909):</span>
                        <span className="font-semibold text-primary">
                          {formatVnd(
                            sc.isCapped
                              ? 800_000
                              : (sc.amount * sc.platformFeePercent) / 100
                          )}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleStartPayment(sc)}
                    disabled={isLoading}
                    className="w-full py-2.5 px-3 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50"
                  >
                    {isLoading ? (
                      "Đang tạo VietQR..."
                    ) : (
                      <>
                        <QrCode className="h-4 w-4" />
                        Tạo Mã VietQR Thanh Toán
                        <ChevronRight className="h-3.5 w-3.5" />
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Lịch sử các giao dịch đã hoàn tất trong phiên */}
        {completedOrders.length > 0 && (
          <div className="p-4 rounded-2xl bg-card border border-border/70 space-y-3">
            <h3 className="text-xs font-bold text-foreground uppercase tracking-wide flex items-center gap-1.5">
              <Receipt className="h-4 w-4 text-emerald-500" />
              Lịch Sử Giao Dịch Đã Phân Tách Thành Công Trong Phiên ({completedOrders.length})
            </h3>
            <div className="divide-y divide-border/60">
              {completedOrders.map((o) => (
                <div
                  key={o.orderCode}
                  className="py-2.5 flex items-center justify-between text-xs"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-bold text-primary">
                        #{o.orderId}
                      </span>
                      <span className="font-medium text-foreground">{o.title}</span>
                    </div>
                    <div className="text-[11px] text-muted-foreground">
                      Đối tác: {o.partnerAccount.accountName} ({formatVnd(o.breakdown.partnerReceiveVnd)}) ·
                      Synesis: {formatVnd(o.breakdown.platformFeeVnd)}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600">
                      <CheckCircle2 className="h-3 w-3" />
                      ĐÃ THANH TOÁN
                    </span>
                    <div className="text-[11px] font-bold text-foreground mt-0.5">
                      {formatVnd(o.totalAmount)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modal Thanh toán VietQR */}
      {activeOrder && (
        <VietQRPaymentModal
          order={activeOrder}
          onClose={() => setActiveOrder(null)}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
}
