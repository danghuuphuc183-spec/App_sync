import { NextRequest, NextResponse } from "next/server";
import { createSplitPaymentOrder } from "@/features/payment/payos-client";
import { SplitPaymentKind } from "@/features/payment/payos.types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { kind, title, amount, buyerName, buyerPhone, buyerEmail, partnerKey } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { success: false, message: "Số tiền thanh toán không hợp lệ" },
        { status: 400 }
      );
    }

    if (!title || !buyerName) {
      return NextResponse.json(
        { success: false, message: "Thiếu thông tin người mua hoặc tiêu đề đơn hàng" },
        { status: 400 }
      );
    }

    const order = await createSplitPaymentOrder({
      kind: (kind as SplitPaymentKind) || "club_membership",
      title,
      amount: Number(amount),
      buyerName,
      buyerPhone,
      buyerEmail,
      partnerKey,
    });

    return NextResponse.json({
      success: true,
      message: "Khởi tạo đơn thanh toán payOS VietQR thành công",
      data: order,
    });
  } catch (error) {
    console.error("Lỗi tạo đơn thanh toán payOS:", error);
    return NextResponse.json(
      { success: false, message: "Lỗi nội bộ máy chủ khi khởi tạo đơn hàng" },
      { status: 500 }
    );
  }
}
