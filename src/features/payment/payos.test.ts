import { describe, it, expect, beforeEach } from "vitest";
import {
  calculateSplitPayment,
  createSplitPaymentOrder,
  getOrder,
  markOrderAsPaid,
  getAllOrders,
} from "./payos-client";
import {
  generateVietQrImageUrl,
  formatVnd,
  formatTransferContent,
} from "./vietqr.service";
import {
  SYNESIS_PLATFORM_ACCOUNT,
  MOCK_PARTNER_ACCOUNTS,
} from "./payos.types";

describe("payOS VietQR Split Payment", () => {
  describe("Tài khoản thụ hưởng & Sinh mã VietQR", () => {
    it("Tài khoản Synesis Platform chuẩn xác theo yêu cầu Founder", () => {
      expect(SYNESIS_PLATFORM_ACCOUNT.accountName).toBe("CONG TY TNHH SYNISIS");
      expect(SYNESIS_PLATFORM_ACCOUNT.accountNumber).toBe("09090909");
      expect(SYNESIS_PLATFORM_ACCOUNT.bankCode).toBe("VCB");
      expect(SYNESIS_PLATFORM_ACCOUNT.bankBin).toBe("970436");
    });

    it("Sinh URL ảnh VietQR QuickLink chuẩn xác với ngân hàng và số tiền", () => {
      const url = generateVietQrImageUrl(
        SYNESIS_PLATFORM_ACCOUNT,
        150000,
        "SYNC 123456"
      );
      expect(url).toContain("https://img.vietqr.io/image/970436-09090909-compact2.png");
      expect(url).toContain("amount=150000");
      expect(url).toContain("addInfo=SYNC%20123456");
      expect(url).toContain("accountName=CONG%20TY%20TNHH%20SYNISIS");
    });

    it("Format tiền tệ VNĐ và nội dung chuyển khoản", () => {
      expect(formatVnd(100000)).toBe("100.000đ");
      expect(formatTransferContent(998877)).toBe("SYNC 998877");
    });
  });

  describe("Công thức phân tách dòng tiền (Split Payment Breakdown)", () => {
    it("CLB (club_membership): Phí nền tảng 3%, CLB nhận 97%", () => {
      const b = calculateSplitPayment("club_membership", 100_000);
      expect(b.totalAmountVnd).toBe(100_000);
      expect(b.platformFeePercent).toBe(3);
      expect(b.platformFeeVnd).toBe(3_000);
      expect(b.partnerReceiveVnd).toBe(97_000);
      expect(b.partnerReceivePercent).toBe(97);
    });

    it("Huấn luyện viên (coaching_starter): Phí nền tảng 18%, HLV nhận 82%", () => {
      const b = calculateSplitPayment("coaching_starter", 300_000);
      expect(b.totalAmountVnd).toBe(300_000);
      expect(b.platformFeePercent).toBe(18);
      expect(b.platformFeeVnd).toBe(54_000);
      expect(b.partnerReceiveVnd).toBe(246_000);
      expect(b.partnerReceivePercent).toBe(82);
    });

    it("Phòng tập (gym_trial_ticket / gym_membership_1m): Phí nền tảng 30%, Phòng tập nhận 70%", () => {
      const b = calculateSplitPayment("gym_trial_ticket", 200_000);
      expect(b.totalAmountVnd).toBe(200_000);
      expect(b.platformFeePercent).toBe(30);
      expect(b.platformFeeVnd).toBe(60_000);
      expect(b.partnerReceiveVnd).toBe(140_000);
      expect(b.partnerReceivePercent).toBe(70);
    });

    it("Phòng tập thẻ năm (gym_membership_12m): Áp trần tối đa 800.000đ", () => {
      const b = calculateSplitPayment("gym_membership_12m", 12_000_000);
      expect(b.totalAmountVnd).toBe(12_000_000);
      expect(b.platformFeeVnd).toBe(800_000); // 15% của 12tr là 1.8tr, nhưng bị trần 800k
      expect(b.isCapped).toBe(true);
      expect(b.partnerReceiveVnd).toBe(11_200_000);
    });
  });

  describe("Khởi tạo và cập nhật trạng thái đơn hàng (Order Lifecycle)", () => {
    it("Khởi tạo đơn hàng thanh toán thành công với trạng thái PENDING", async () => {
      const order = await createSplitPaymentOrder({
        kind: "club_membership",
        title: "Đóng quỹ CLB tháng 11",
        amount: 150_000,
        buyerName: "Lê Minh",
        partnerKey: "club_running_ftu2",
      });

      expect(order.orderCode).toBeGreaterThan(0);
      expect(order.status).toBe("PENDING");
      expect(order.description).toBe(`SYNC ${order.orderCode}`);
      expect(order.partnerAccount.accountNumber).toBe("8899889988");
      expect(order.vietQrUrl).toContain("8899889988");

      const fetched = getOrder(order.orderCode);
      expect(fetched).not.toBeNull();
      expect(fetched?.orderCode).toBe(order.orderCode);
    });

    it("Đánh dấu thanh toán thành công và cập nhật trạng thái sang PAID", async () => {
      const order = await createSplitPaymentOrder({
        kind: "coaching_starter",
        title: "Khóa học PT 8 buổi",
        amount: 350_000,
        buyerName: "Trần Hùng",
        partnerKey: "coach_tuan_anh",
      });

      expect(order.status).toBe("PENDING");
      const paid = markOrderAsPaid(order.orderCode);
      expect(paid?.status).toBe("PAID");
      expect(paid?.paidAt).toBeDefined();

      const refetched = getOrder(order.orderCode);
      expect(refetched?.status).toBe("PAID");
    });
  });
});
