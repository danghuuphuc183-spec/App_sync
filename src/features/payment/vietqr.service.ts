/**
 * Dịch vụ sinh mã VietQR chuẩn Quốc gia NAPAS 247
 * Tích hợp cho ứng dụng Synesis
 */

import { BankAccount } from "./payos.types";

export type VietQRTemplate = "compact" | "compact2" | "qr_only" | "print";

/**
 * Sinh link ảnh VietQR động theo chuẩn QuickLink của VietQR.vn
 * Chuẩn này được toàn bộ các App Ngân hàng Việt Nam (VCB, MB, Techcom, BIDV...) quét trực tiếp
 */
export function generateVietQrImageUrl(
  account: BankAccount,
  amount: number,
  description: string,
  template: VietQRTemplate = "compact2"
): string {
  const cleanAcc = account.accountNumber.trim();
  const cleanName = encodeURIComponent(account.accountName.trim());
  const cleanDesc = encodeURIComponent(description.trim());
  const cleanAmount = Math.max(0, Math.round(amount));

  // Định dạng chuẩn: https://img.vietqr.io/image/<BANK_BIN>-<ACCOUNT_NO>-<TEMPLATE>.png
  return `https://img.vietqr.io/image/${account.bankBin}-${cleanAcc}-${template}.png?amount=${cleanAmount}&addInfo=${cleanDesc}&accountName=${cleanName}`;
}

/**
 * Tạo mã số đơn hàng duy nhất dạng số nguyên dương cho payOS (yêu cầu số nguyên, tối đa 9007199254740991)
 */
export function generateOrderCode(): number {
  // Lấy 6 số cuối của timestamp kết hợp 2 số ngẫu nhiên
  const now = Date.now();
  const randomSuffix = Math.floor(Math.random() * 90) + 10;
  const timeSlice = now % 1000000;
  return Number(`${timeSlice}${randomSuffix}`);
}

/**
 * Định dạng tiền tệ VNĐ chuẩn Việt Nam
 */
export function formatVnd(amount: number): string {
  return `${amount.toLocaleString("vi-VN")}đ`;
}

/**
 * Chuẩn hóa nội dung chuyển khoản cho chuẩn payOS
 * Cú pháp: SYNC <orderCode>
 */
export function formatTransferContent(orderCode: number): string {
  return `SYNC ${orderCode}`;
}
