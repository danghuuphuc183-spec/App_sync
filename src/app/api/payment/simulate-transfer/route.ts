import { NextRequest, NextResponse } from "next/server";
import { getOrder, markOrderAsPaid } from "@/features/payment/payos-client";

/**
 * Endpoint dành riêng cho Thử nghiệm (Simulation / Sandbox Mode):
 * Bấm nút để giả lập ngân hàng gửi Webhook thông báo người dùng đã quét mã VietQR thành công
 */
export async function POST(req: NextRequest) {
  try {
    const { orderCode } = await req.json();

    if (!orderCode) {
      return NextResponse.json(
        { success: false, message: "Thiếu orderCode" },
        { status: 400 }
      );
    }

    const order = getOrder(Number(orderCode));
    if (!order) {
      return NextResponse.json(
        { success: false, message: "Không tìm thấy đơn hàng" },
        { status: 404 }
      );
    }

    if (order.status === "PAID") {
      return NextResponse.json({
        success: true,
        message: "Đơn hàng đã được thanh toán trước đó",
        data: order,
      });
    }

    const updated = markOrderAsPaid(Number(orderCode));

    return NextResponse.json({
      success: true,
      message: `[MÔ PHỎNG THÀNH CÔNG] Ngân hàng đã xác nhận thanh toán cho đơn ${order.orderId}`,
      data: updated,
    });
  } catch (error) {
    console.error("Lỗi giả lập thanh toán:", error);
    return NextResponse.json(
      { success: false, message: "Lỗi nội bộ khi giả lập thanh toán" },
      { status: 500 }
    );
  }
}
