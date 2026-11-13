/**
 * THU PHÍ CLB — qua đối tác thanh toán (đã SỬA so với "VietQR tự thu + 5–8% mọi khoản thu").
 *
 * - Tiền đi qua cổng thanh toán của đối tác được cấp phép; VietQR chỉ là một phương thức của đối tác,
 *   SYNESIS không tự giữ tiền.
 * - Phí nền tảng CHỈ áp dụng cho giao dịch đủ điều kiện, hiển thị từng dòng trước khi thanh toán.
 * - KHÔNG thu phí nền tảng trên quỹ phạt (và tiền ủng hộ). Phí cổng của đối tác vẫn hiện rõ.
 *
 * Tỷ lệ dưới đây là cấu hình — cần chốt theo hợp đồng đối tác (xem docs/DECISIONS.md).
 */

export type TxKind = "club_membership" | "event_ticket" | "coaching_booking" | "penalty_fund" | "donation";

export const TX_LABEL: Record<TxKind, string> = {
  club_membership: "Phí thành viên CLB",
  event_ticket: "Vé sự kiện",
  coaching_booking: "Đặt buổi HLV",
  penalty_fund: "Quỹ phạt CLB",
  donation: "Ủng hộ CLB",
};

export const PAYMENT_CONFIG = {
  partnerNameVi: "Đối tác cổng thanh toán (được NHNN cấp phép)",
  methods: ["VietQR qua đối tác", "Thẻ ATM nội địa (NAPAS)", "Ví điện tử"],
  /** phí cổng của đối tác — thu hộ, chuyển nguyên cho đối tác */
  processing: { percent: 1, fixedVnd: 0 },
  /** phí nền tảng theo loại giao dịch; 0 = không đủ điều kiện */
  platformPercent: {
    club_membership: 5,
    event_ticket: 5,
    coaching_booking: 8,
    penalty_fund: 0,
    donation: 0,
  } satisfies Record<TxKind, number>,
} as const;

export const isFeeEligible = (kind: TxKind) => PAYMENT_CONFIG.platformPercent[kind] > 0;

export interface FeeQuote {
  kind: TxKind;
  amountVnd: number;
  eligible: boolean;
  platformFeeVnd: number;
  processingFeeVnd: number;
  clubReceivesVnd: number;
  lines: { label: string; vnd: number }[];
}

const round = (n: number) => Math.round(n);

/** Báo phí minh bạch từng dòng trước khi người dùng thanh toán */
export function quoteFee(kind: TxKind, amountVnd: number): FeeQuote {
  const amount = Math.max(0, round(amountVnd));
  const pct = PAYMENT_CONFIG.platformPercent[kind];
  const platformFeeVnd = round((amount * pct) / 100);
  const processingFeeVnd = amount ? round((amount * PAYMENT_CONFIG.processing.percent) / 100) + PAYMENT_CONFIG.processing.fixedVnd : 0;
  const clubReceivesVnd = amount - platformFeeVnd - processingFeeVnd;
  return {
    kind,
    amountVnd: amount,
    eligible: pct > 0,
    platformFeeVnd,
    processingFeeVnd,
    clubReceivesVnd,
    lines: [
      { label: TX_LABEL[kind], vnd: amount },
      { label: pct > 0 ? `Phí nền tảng SYNESIS (${pct}%)` : "Phí nền tảng SYNESIS (không áp dụng)", vnd: -platformFeeVnd },
      { label: `Phí cổng thanh toán đối tác (${PAYMENT_CONFIG.processing.percent}%)`, vnd: -processingFeeVnd },
      { label: "CLB thực nhận", vnd: clubReceivesVnd },
    ],
  };
}

export const formatVnd = (n: number) => `${n < 0 ? "−" : ""}${Math.abs(n).toLocaleString("vi-VN")}đ`;
