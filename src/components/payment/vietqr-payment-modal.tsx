"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import {
  CheckCircle2,
  Copy,
  Check,
  Clock,
  Building2,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  QrCode,
  Info,
  X,
  RefreshCw,
} from "lucide-react";
import { SplitPaymentOrder } from "@/features/payment/payos.types";
import { formatVnd } from "@/features/payment/vietqr.service";

interface VietQRPaymentModalProps {
  order: SplitPaymentOrder;
  onClose: () => void;
  onSuccess?: (paidOrder: SplitPaymentOrder) => void;
}

export function VietQRPaymentModal({
  order: initialOrder,
  onClose,
  onSuccess,
}: VietQRPaymentModalProps) {
  const [order, setOrder] = useState<SplitPaymentOrder>(initialOrder);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15 * 60); // 15 phút đếm ngược

  // Sao chép nội dung
  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Đếm ngược thời gian hết hạn
  useEffect(() => {
    if (order.status === "PAID") return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [order.status]);

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // Tự động kiểm tra trạng thái thanh toán (Polling)
  const checkStatus = useCallback(async () => {
    if (order.status === "PAID") return;
    try {
      const res = await fetch(`/api/payment/check-status?orderCode=${order.orderCode}`);
      const data = await res.json();
      if (data.success && data.data && data.data.status === "PAID") {
        setOrder(data.data);
        if (onSuccess) {
          onSuccess(data.data);
        }
      }
    } catch (err) {
      console.error("Lỗi kiểm tra trạng thái thanh toán:", err);
    }
  }, [order.orderCode, order.status, onSuccess]);

  useEffect(() => {
    if (order.status === "PAID") return;
    const interval = setInterval(checkStatus, 2500);
    return () => clearInterval(interval);
  }, [checkStatus, order.status]);

  // Mô phỏng thanh toán thành công (Test Mode)
  const handleSimulatePayment = async () => {
    setIsSimulating(true);
    try {
      const res = await fetch("/api/payment/simulate-transfer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderCode: order.orderCode }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setOrder(data.data);
        if (onSuccess) {
          onSuccess(data.data);
        }
      }
    } catch (err) {
      console.error("Lỗi khi mô phỏng thanh toán:", err);
    } finally {
      setIsSimulating(false);
    }
  };

  const isPaid = order.status === "PAID";

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md max-h-[92vh] overflow-y-auto bg-card border border-border/80 rounded-2xl shadow-2xl flex flex-col text-card-foreground">
        {/* Nút đóng */}
        <button
          onClick={onClose}
          aria-label="Đóng cửa sổ thanh toán"
          className="absolute top-3 right-3 h-8 w-8 rounded-full bg-muted/80 hover:bg-muted flex items-center justify-center text-muted-foreground transition-colors z-10"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-border/60 bg-muted/20">
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-primary/10 text-primary border border-primary/20">
              <QrCode className="h-3 w-3" />
              payOS · VietQR Chuẩn NAPAS
            </span>
            <span className="text-xs text-muted-foreground font-mono">
              #{order.orderId}
            </span>
          </div>
          <h2 className="text-lg font-bold tracking-tight text-foreground">
            {order.title}
          </h2>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-primary">
              {formatVnd(order.totalAmount)}
            </span>
            {!isPaid && (
              <span className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400 font-medium">
                <Clock className="h-3.5 w-3.5 animate-pulse" />
                Hết hạn sau {formatTimer(timeLeft)}
              </span>
            )}
          </div>
        </div>

        {/* Nội dung thanh toán */}
        <div className="p-4 sm:p-5 space-y-4">
          {isPaid ? (
            /* TRẠNG THÁI ĐÃ THANH TOÁN THÀNH CÔNG */
            <div className="py-8 text-center space-y-4 animate-in zoom-in-95 duration-300">
              <div className="mx-auto w-16 h-16 rounded-full bg-emerald-500/10 border-2 border-emerald-500/30 flex items-center justify-center text-emerald-500">
                <CheckCircle2 className="h-10 w-10 animate-bounce" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground">
                  Thanh Toán Thành Công!
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Đã ghi nhận giao dịch vào hệ thống lúc{" "}
                  {new Date(order.paidAt || Date.now()).toLocaleTimeString("vi-VN")}
                </p>
              </div>

              {/* Tóm tắt dòng tiền đã phân tách */}
              <div className="p-3.5 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 rounded-xl text-left space-y-2 text-xs">
                <div className="font-semibold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4" />
                  Đã phân tách dòng tiền tự động (Split Payment):
                </div>
                <div className="flex justify-between py-1 border-b border-emerald-100 dark:border-emerald-800/20">
                  <span className="text-muted-foreground">
                    Đối tác ({order.partnerAccount.accountName}):
                  </span>
                  <span className="font-bold text-foreground">
                    {formatVnd(order.breakdown.partnerReceiveVnd)} (
                    {order.breakdown.partnerReceivePercent}%)
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-emerald-100 dark:border-emerald-800/20">
                  <span className="text-muted-foreground">
                    Phí nền tảng Synesis (Vietcombank 09090909):
                  </span>
                  <span className="font-bold text-primary">
                    {formatVnd(order.breakdown.platformFeeVnd)} (
                    {order.breakdown.platformFeePercent}%)
                  </span>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-full py-2.5 px-4 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors shadow-sm"
              >
                Hoàn tất & Đóng
              </button>
            </div>
          ) : (
            /* TRẠNG THÁI CHỜ QUÉT MÃ QR */
            <>
              {/* Banner chế độ thí nghiệm */}
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 flex items-start gap-2.5 text-xs text-amber-800 dark:text-amber-300">
                <Info className="h-4 w-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
                <div className="leading-relaxed">
                  <span className="font-bold">Môi trường thử nghiệm:</span> Bạn có thể
                  dùng App Ngân hàng bất kỳ quét mã QR thật bên dưới, hoặc bấm nút{" "}
                  <span className="font-bold underline">Mô phỏng thanh toán</span> để thử
                  dòng tiền ngay lập tức!
                </div>
              </div>

              {/* Khung Mã QR VietQR */}
              <div className="flex flex-col items-center justify-center p-3 bg-white rounded-xl border border-neutral-200 shadow-inner">
                <div className="relative w-56 h-56 sm:w-64 sm:h-64 flex items-center justify-center">
                  <Image
                    src={order.vietQrUrl}
                    alt={`VietQR ${order.totalAmount}`}
                    fill
                    sizes="(max-width: 640px) 224px, 256px"
                    className="object-contain rounded-lg"
                    unoptimized
                    priority
                  />
                </div>
                <p className="text-[11px] text-neutral-500 mt-1 flex items-center gap-1 font-sans">
                  <Sparkles className="h-3 w-3 text-primary" />
                  Mở ứng dụng ngân hàng hoặc MoMo để quét mã
                </p>
              </div>

              {/* Thông tin chuyển khoản chi tiết */}
              <div className="space-y-2 text-xs">
                {/* Ngân hàng */}
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-muted/40 border border-border/40">
                  <div className="text-muted-foreground flex items-center gap-1.5">
                    <Building2 className="h-3.5 w-3.5" />
                    Ngân hàng
                  </div>
                  <div className="font-semibold text-right text-foreground">
                    {order.partnerAccount.bankName}
                  </div>
                </div>

                {/* Số tài khoản */}
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-muted/40 border border-border/40">
                  <span className="text-muted-foreground">Số tài khoản:</span>
                  <div className="flex items-center gap-1.5 font-mono font-bold text-sm text-foreground">
                    {order.partnerAccount.accountNumber}
                    <button
                      onClick={() =>
                        copyToClipboard(
                          order.partnerAccount.accountNumber,
                          "accountNumber"
                        )
                      }
                      className="p-1 hover:bg-muted rounded text-muted-foreground"
                      title="Sao chép số tài khoản"
                    >
                      {copiedField === "accountNumber" ? (
                        <Check className="h-3.5 w-3.5 text-emerald-500" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Tên người thụ hưởng */}
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-muted/40 border border-border/40">
                  <span className="text-muted-foreground">Chủ tài khoản:</span>
                  <span className="font-semibold text-foreground uppercase">
                    {order.partnerAccount.accountName}
                  </span>
                </div>

                {/* Số tiền */}
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-muted/40 border border-border/40">
                  <span className="text-muted-foreground">Số tiền:</span>
                  <div className="flex items-center gap-1.5 font-bold text-primary text-sm">
                    {formatVnd(order.totalAmount)}
                    <button
                      onClick={() =>
                        copyToClipboard(order.totalAmount.toString(), "amount")
                      }
                      className="p-1 hover:bg-muted rounded text-muted-foreground"
                      title="Sao chép số tiền"
                    >
                      {copiedField === "amount" ? (
                        <Check className="h-3.5 w-3.5 text-emerald-500" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Nội dung chuyển khoản */}
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-primary/5 border border-primary/20">
                  <span className="text-muted-foreground font-medium">
                    Nội dung CK:
                  </span>
                  <div className="flex items-center gap-1.5 font-mono font-extrabold text-primary text-sm">
                    {order.description}
                    <button
                      onClick={() =>
                        copyToClipboard(order.description, "description")
                      }
                      className="p-1 hover:bg-primary/10 rounded text-primary"
                      title="Sao chép nội dung"
                    >
                      {copiedField === "description" ? (
                        <Check className="h-3.5 w-3.5 text-emerald-500" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* BẢNG MINH BẠCH PHÂN TÁCH DÒNG TIỀN (SPLIT PAYMENT BREAKDOWN) */}
              <div className="p-3 bg-muted/30 border border-border/60 rounded-xl space-y-2 text-xs">
                <div className="flex items-center justify-between font-semibold text-foreground">
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                    Cơ chế Split Payment tự động:
                  </span>
                  {order.breakdown.isCapped && (
                    <span className="text-[10px] bg-amber-500/10 text-amber-600 px-1.5 py-0.5 rounded font-normal">
                      Đã áp trần 800k
                    </span>
                  )}
                </div>
                <div className="space-y-1 pt-1 text-[11px]">
                  <div className="flex justify-between text-muted-foreground">
                    <span>
                      👉 Đối tác ({order.partnerAccount.bankCode} ·{" "}
                      {order.partnerAccount.accountNumber}):
                    </span>
                    <span className="font-semibold text-foreground">
                      {formatVnd(order.breakdown.partnerReceiveVnd)} (
                      {order.breakdown.partnerReceivePercent}%)
                    </span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>
                      👉 Hoa hồng Synesis (VCB · {order.platformAccount.accountNumber}):
                    </span>
                    <span className="font-semibold text-primary">
                      {formatVnd(order.breakdown.platformFeeVnd)} (
                      {order.breakdown.platformFeePercent}%)
                    </span>
                  </div>
                </div>
              </div>

              {/* Nút hành động */}
              <div className="pt-1 space-y-2">
                <button
                  onClick={handleSimulatePayment}
                  disabled={isSimulating}
                  className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
                >
                  {isSimulating ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Đang xử lý mô phỏng...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      Mô phỏng Chuyển khoản thành công (Test Mode)
                      <ArrowRight className="h-3.5 w-3.5" />
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
