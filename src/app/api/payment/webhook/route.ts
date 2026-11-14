import { NextRequest, NextResponse } from "next/server";
import {
  markOrderAsPaid,
  verifyPayOSSignature,
  PAYOS_ENV_CONFIG,
} from "@/features/payment/payos-client";
import { PayOSWebhookPayload } from "@/features/payment/payos.types";

/**
 * Webhook URL nhận thông báo biến động số dư từ cổng payOS
 * Cấu hình trên Dashboard payOS: https://your-domain.com/api/payment/webhook
 */
export async function POST(req: NextRequest) {
  try {
    const payload = (await req.json()) as PayOSWebhookPayload;

    if (!payload || !payload.data) {
      return NextResponse.json(
        { success: false, message: "Dữ liệu webhook không hợp lệ" },
        { status: 400 }
      );
    }

    const { orderCode } = payload.data;

    // Trong môi trường production, kiểm tra chữ ký HMAC-SHA256
    if (!PAYOS_ENV_CONFIG.isSandbox && payload.signature) {
      const isValid = verifyPayOSSignature(
        payload.data as unknown as Record<string, unknown>,
        payload.signature,
        PAYOS_ENV_CONFIG.checksumKey
      );

      if (!isValid) {
        console.warn(`[payOS Webhook] Chữ ký không hợp lệ cho đơn ${orderCode}`);
        return NextResponse.json(
          { success: false, message: "Chữ ký xác thực không hợp lệ" },
          { status: 401 }
        );
      }
    }

    // Nếu mã code là "00", giao dịch đã được thanh toán thành công
    if (payload.code === "00") {
      const updatedOrder = markOrderAsPaid(
        orderCode,
        payload.data.transactionDateTime || new Date().toISOString()
      );

      if (updatedOrder) {
        console.log(
          `[payOS Webhook] Đơn hàng ${orderCode} (${updatedOrder.orderId}) đã được thanh toán thành công. Số tiền: ${payload.data.amount}đ`
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: "Webhook đã được xử lý thành công",
    });
  } catch (error) {
    console.error("Lỗi xử lý webhook payOS:", error);
    return NextResponse.json(
      { success: false, message: "Lỗi nội bộ khi xử lý webhook" },
      { status: 500 }
    );
  }
}
