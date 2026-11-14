/**
 * Định nghĩa kiểu dữ liệu cho Cổng thanh toán payOS VietQR Split Payment
 * Nền tảng thể thao Synesis
 */

export type SplitPaymentKind =
  | "club_membership"     // Thu quỹ hội viên CLB (3% phí)
  | "event_ticket"        // Bán vé sự kiện / giải chạy (3% - 5%)
  | "coaching_starter"    // Khóa học PT 8 buổi (18% phí)
  | "coaching_reorder"    // Học viên cũ học tiếp PT (8% phí)
  | "gym_trial_ticket"    // Vé trải nghiệm phòng tập (30% phí)
  | "gym_membership_1m"   // Gói thẻ gym 1-3 tháng (30% phí)
  | "gym_membership_6m"   // Gói thẻ gym 6 tháng (20% phí)
  | "gym_membership_12m"; // Gói thẻ gym 12 tháng (15% phí, trần 800k)

export interface BankInfo {
  bin: string;          // Mã BIN chuẩn NAPAS (VD: Vietcombank = 970436)
  code: string;         // Mã ngắn (VD: VCB, MB, TCB, ACB)
  name: string;         // Tên ngân hàng
  shortName: string;    // Tên giao dịch
}

export interface BankAccount {
  accountName: string;  // Tên chủ tài khoản (viết hoa không dấu)
  accountNumber: string;// Số tài khoản
  bankBin: string;      // Mã BIN NAPAS
  bankCode: string;     // Mã ngân hàng (VCB, MB...)
  bankName: string;     // Tên ngân hàng
}

/**
 * Tài khoản nhận hoa hồng nền tảng của Synesis (theo yêu cầu của Founder)
 */
export const SYNESIS_PLATFORM_ACCOUNT: BankAccount = {
  accountName: "CONG TY TNHH SYNISIS",
  accountNumber: "09090909",
  bankBin: "970436",
  bankCode: "VCB",
  bankName: "Vietcombank (Ngân hàng TMCP Ngoại thương Việt Nam)",
};

/**
 * Danh mục tài khoản mẫu của các Đối tác phục vụ chạy thử nghiệm dòng tiền
 */
export type MockPartnerKey = "the_new_gym" | "coach_tuan_anh" | "club_running_ftu2";

export const MOCK_PARTNER_ACCOUNTS: Record<MockPartnerKey, BankAccount> = {
  the_new_gym: {
    accountName: "THE NEW GYM DIEN BIEN PHU",
    accountNumber: "1122334455",
    bankBin: "970422",
    bankCode: "MB",
    bankName: "MBBank (Ngân hàng TMCP Quân Đội)",
  },
  coach_tuan_anh: {
    accountName: "NGUYEN TUAN ANH",
    accountNumber: "1903668899",
    bankBin: "970407",
    bankCode: "TCB",
    bankName: "Techcombank (Ngân hàng TMCP Kỹ Thương Việt Nam)",
  },
  club_running_ftu2: {
    accountName: "CLB RUNNING FTU2",
    accountNumber: "8899889988",
    bankBin: "970416",
    bankCode: "ACB",
    bankName: "ACB (Ngân hàng TMCP Á Châu)",
  },
};

/**
 * Các ngân hàng phổ biến tại Việt Nam
 */
export const POPULAR_BANKS: Record<string, BankInfo> = {
  VCB: { bin: "970436", code: "VCB", name: "Ngân hàng Ngoại thương Việt Nam", shortName: "Vietcombank" },
  MB: { bin: "970422", code: "MB", name: "Ngân hàng Quân Đội", shortName: "MBBank" },
  TCB: { bin: "970407", code: "TCB", name: "Ngân hàng Kỹ Thương", shortName: "Techcombank" },
  ACB: { bin: "970416", code: "ACB", name: "Ngân hàng Á Châu", shortName: "ACB" },
  VPB: { bin: "970432", code: "VPB", name: "Ngân hàng Việt Nam Thịnh Vượng", shortName: "VPBank" },
  ICB: { bin: "970415", code: "ICB", name: "Ngân hàng Công Thương Việt Nam", shortName: "VietinBank" },
  BIDV: { bin: "970418", code: "BIDV", name: "Ngân hàng Đầu tư và Phát triển", shortName: "BIDV" },
  TPB: { bin: "970458", code: "TPB", name: "Ngân hàng Tiên Phong", shortName: "TPBank" },
};

export type OrderStatus = "PENDING" | "PAID" | "CANCELLED" | "EXPIRED";

export interface SplitPaymentBreakdown {
  totalAmountVnd: number;        // Tổng số tiền khách hàng thanh toán
  platformFeePercent: number;    // % phí Synesis
  platformFeeVnd: number;        // Số tiền Synesis thu về TK Vietcombank 09090909
  gatewayFeeVnd: number;         // Phí cổng payOS (ước tính 1%)
  partnerReceivePercent: number; // % đối tác nhận
  partnerReceiveVnd: number;     // Số tiền Đối tác nhận về STK của họ
  isCapped?: boolean;            // Có bị chạm trần phí (ví dụ trần 800k gói năm) không
}

export interface SplitPaymentOrder {
  orderCode: number;             // Mã đơn hàng số nguyên dương (chuẩn payOS)
  orderId: string;               // Mã chuỗi hiển thị: SYNC-XXXXXX
  kind: SplitPaymentKind;
  title: string;                 // Tên giao dịch
  description: string;           // Nội dung chuyển khoản chuẩn: SYNC <orderCode>
  buyerName: string;
  buyerPhone?: string;
  buyerEmail?: string;
  totalAmount: number;           // Tổng số tiền VNĐ
  status: OrderStatus;
  createdAt: string;
  expiresAt: string;             // Thời gian hết hạn (thường sau 15 phút)
  paidAt?: string;
  
  // Thông tin phân tách dòng tiền
  breakdown: SplitPaymentBreakdown;
  platformAccount: BankAccount;
  partnerAccount: BankAccount;

  // Dữ liệu thanh toán VietQR
  vietQrUrl: string;             // Link ảnh VietQR động
  qrCodeRaw?: string;            // Chuỗi ký tự VietQR EMVCo nếu cần quét trực tiếp
  checkoutUrl?: string;          // Link trang thanh toán payOS nếu redirect
}

export interface PayOSWebhookPayload {
  code: string;                  // "00" là thành công
  desc: string;                  // "success"
  data: {
    orderCode: number;
    amount: number;
    description: string;
    accountNumber: string;
    reference: string;
    transactionDateTime: string;
    currency: string;
    paymentLinkId: string;
    code: string;
    desc: string;
    counterAccountBankId?: string;
    counterAccountBankName?: string;
    counterAccountName?: string;
    counterAccountNumber?: string;
    virtualAccountName?: string;
    virtualAccountNumber?: string;
  };
  signature: string;
}
