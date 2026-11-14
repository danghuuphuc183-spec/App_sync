/**
 * Core Service: payOS VietQR Split Payment Client
 * Nền tảng Synesis
 */

import crypto from "crypto";
import {
  BankAccount,
  MOCK_PARTNER_ACCOUNTS,
  PayOSWebhookPayload,
  SYNESIS_PLATFORM_ACCOUNT,
  SplitPaymentBreakdown,
  SplitPaymentKind,
  SplitPaymentOrder,
} from "./payos.types";
import {
  formatTransferContent,
  generateOrderCode,
  generateVietQrImageUrl,
} from "./vietqr.service";

/**
 * Cấu hình payOS từ môi trường (nếu có API Key thật)
 */
export const PAYOS_ENV_CONFIG = {
  clientId: process.env.PAYOS_CLIENT_ID || "demo-client-id",
  apiKey: process.env.PAYOS_API_KEY || "demo-api-key",
  checksumKey: process.env.PAYOS_CHECKSUM_KEY || "demo-checksum-key",
  endpoint: process.env.PAYOS_ENDPOINT || "https://api-merchant.payos.vn",
  isSandbox: !process.env.PAYOS_API_KEY,
};

/**
 * Tính toán biểu phí và phân tách dòng tiền theo Quy chế Synesis đã ban hành
 */
export function calculateSplitPayment(
  kind: SplitPaymentKind,
  totalAmountVnd: number
): SplitPaymentBreakdown {
  const amount = Math.max(0, Math.round(totalAmountVnd));
  let platformFeePercent = 0;
  let isCapped = false;

  switch (kind) {
    case "club_membership":
    case "event_ticket":
      // Phí giao dịch CLB chốt 3% (bao gồm 1-1.5% phí cổng payOS + 1.5% hạ tầng)
      platformFeePercent = 3;
      break;

    case "coaching_starter":
      // Khóa học PT 8 buổi Tân binh: 18%
      platformFeePercent = 18;
      break;

    case "coaching_reorder":
      // Học viên cũ tái ký PT: giảm còn 8% chống dắt mối ngoài sàn
      platformFeePercent = 8;
      break;

    case "gym_trial_ticket":
    case "gym_membership_1m":
      // Vé trải nghiệm / thẻ 1-3 tháng: 30%
      platformFeePercent = 30;
      break;

    case "gym_membership_6m":
      // Thẻ tập 6 tháng: nhượng bộ 20%
      platformFeePercent = 20;
      break;

    case "gym_membership_12m":
      // Thẻ năm: 15%, áp trần tối đa 800.000đ
      platformFeePercent = 15;
      break;
  }

  // Tính số tiền hoa hồng của Synesis
  let platformFeeVnd = Math.round((amount * platformFeePercent) / 100);

  // Áp trần 800.000đ cho gói tập dài hạn (gym_membership_12m) theo Quyết định D37
  if (kind === "gym_membership_12m" && platformFeeVnd > 800_000) {
    platformFeeVnd = 800_000;
    isCapped = true;
  }

  // Ước tính phí cổng thanh toán payOS (khoảng 1%)
  const gatewayFeeVnd = Math.round((amount * 1) / 100);

  // Đối tác nhận phần còn lại chuyển thẳng vào tài khoản của họ
  const partnerReceiveVnd = amount - platformFeeVnd;
  const partnerReceivePercent = amount > 0 ? (partnerReceiveVnd / amount) * 100 : 0;

  return {
    totalAmountVnd: amount,
    platformFeePercent,
    platformFeeVnd,
    gatewayFeeVnd,
    partnerReceivePercent: Number(partnerReceivePercent.toFixed(1)),
    partnerReceiveVnd,
    isCapped,
  };
}

/**
 * Kho lưu trữ đơn hàng tạm thời trong bộ nhớ (In-memory Store)
 * Dùng cho các cuộc chạy thử nghiệm (Simulation) và web demo
 */
declare global {
  // eslint-disable-next-line no-var
  var __SYNESIS_PAYMENT_ORDERS__: Map<number, SplitPaymentOrder> | undefined;
}

if (!global.__SYNESIS_PAYMENT_ORDERS__) {
  global.__SYNESIS_PAYMENT_ORDERS__ = new Map<number, SplitPaymentOrder>();
}

const ordersStore = global.__SYNESIS_PAYMENT_ORDERS__;

/**
 * Khởi tạo Đơn hàng thanh toán Phân tách dòng tiền (Split Payment Order)
 */
export async function createSplitPaymentOrder(params: {
  kind: SplitPaymentKind;
  title: string;
  amount: number;
  buyerName: string;
  buyerPhone?: string;
  buyerEmail?: string;
  partnerKey?: "the_new_gym" | "coach_tuan_anh" | "club_running_ftu2";
  customPartnerAccount?: BankAccount;
}): Promise<SplitPaymentOrder> {
  const orderCode = generateOrderCode();
  const orderId = `SYNC-${orderCode}`;
  const description = formatTransferContent(orderCode);

  // Xác định tài khoản Đối tác thụ hưởng
  let partnerAccount: BankAccount = MOCK_PARTNER_ACCOUNTS.club_running_ftu2;
  if (params.customPartnerAccount) {
    partnerAccount = params.customPartnerAccount;
  } else if (params.partnerKey && params.partnerKey in MOCK_PARTNER_ACCOUNTS) {
    partnerAccount = MOCK_PARTNER_ACCOUNTS[params.partnerKey];
  } else {
    // Mặc định dựa trên loại giao dịch
    if (params.kind.startsWith("gym_")) {
      partnerAccount = MOCK_PARTNER_ACCOUNTS.the_new_gym;
    } else if (params.kind.startsWith("coaching_")) {
      partnerAccount = MOCK_PARTNER_ACCOUNTS.coach_tuan_anh;
    } else {
      partnerAccount = MOCK_PARTNER_ACCOUNTS.club_running_ftu2;
    }
  }

  // Tính toán phân bổ dòng tiền
  const breakdown = calculateSplitPayment(params.kind, params.amount);

  // Sinh mã VietQR động
  // Để khách hàng quét 1 lần duy nhất tiện lợi: mã QR chuyển tiền hướng về tài khoản thụ hưởng
  const vietQrUrl = generateVietQrImageUrl(
    partnerAccount,
    params.amount,
    description,
    "compact2"
  );

  const now = new Date();
  const expiresAt = new Date(now.getTime() + 15 * 60 * 1000); // 15 phút hết hạn

  const order: SplitPaymentOrder = {
    orderCode,
    orderId,
    kind: params.kind,
    title: params.title,
    description,
    buyerName: params.buyerName,
    buyerPhone: params.buyerPhone,
    buyerEmail: params.buyerEmail,
    totalAmount: params.amount,
    status: "PENDING",
    createdAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
    breakdown,
    platformAccount: SYNESIS_PLATFORM_ACCOUNT,
    partnerAccount,
    vietQrUrl,
    checkoutUrl: `https://pay.payos.vn/web/${orderCode}`,
  };

  // Lưu vào kho đơn hàng
  ordersStore.set(orderCode, order);

  return order;
}

/**
 * Lấy thông tin đơn hàng theo orderCode
 */
export function getOrder(orderCode: number): SplitPaymentOrder | null {
  return ordersStore.get(orderCode) || null;
}

/**
 * Lấy danh sách tất cả các đơn hàng đã tạo (phục vụ dashboard kiểm thử)
 */
export function getAllOrders(): SplitPaymentOrder[] {
  return Array.from(ordersStore.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

/**
 * Cập nhật trạng thái đơn hàng khi thanh toán thành công
 */
export function markOrderAsPaid(
  orderCode: number,
  paidAt = new Date().toISOString()
): SplitPaymentOrder | null {
  const order = ordersStore.get(orderCode);
  if (!order) return null;

  order.status = "PAID";
  order.paidAt = paidAt;
  ordersStore.set(orderCode, order);
  return order;
}

/**
 * Kiểm tra tính hợp lệ của chữ ký Webhook (HMAC-SHA256) từ payOS
 */
export function verifyPayOSSignature(
  data: Record<string, unknown>,
  signature: string,
  checksumKey: string
): boolean {
  try {
    // Sắp xếp các khóa theo alphabet theo chuẩn tài liệu payOS
    const sortedKeys = Object.keys(data).sort();
    const signString = sortedKeys
      .map((key) => `${key}=${data[key]}`)
      .join("&");

    const expectedSignature = crypto
      .createHmac("sha256", checksumKey)
      .update(signString)
      .digest("hex");

    return expectedSignature === signature;
  } catch (error) {
    console.error("Lỗi khi kiểm tra chữ ký payOS:", error);
    return false;
  }
}
