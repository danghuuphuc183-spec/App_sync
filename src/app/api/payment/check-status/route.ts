import { NextRequest, NextResponse } from "next/server";
import { getOrder, getAllOrders } from "@/features/payment/payos-client";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const orderCodeStr = searchParams.get("orderCode");

    if (!orderCodeStr) {
      // Nếu không truyền orderCode, trả về danh sách các đơn gần nhất (dùng cho debug/demo)
      const all = getAllOrders();
      return NextResponse.json({ success: true, data: all });
    }

    const orderCode = Number(orderCodeStr);
    const order = getOrder(orderCode);

    if (!order) {
      return NextResponse.json(
        { success: false, message: "Không tìm thấy đơn hàng" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error("Lỗi kiểm tra trạng thái thanh toán:", error);
    return NextResponse.json(
      { success: false, message: "Lỗi nội bộ khi kiểm tra đơn hàng" },
      { status: 500 }
    );
  }
}
