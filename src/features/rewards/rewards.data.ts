/**
 * SYNESIS REWARDS & EXP REDEMPTION DATA
 *
 * Khung quy chế đổi điểm EXP lấy Voucher đối tác và Hiện vật độc quyền Synesis
 * Chi tiết theo tài liệu: QUY_CHE_TICH_LUY_VA_DOI_THUONG_EXP_SYNESIS.md
 *
 * Phân tầng đổi thưởng:
 * - 100 EXP: Voucher giảm giá thực phẩm chức năng / bù khoáng thể thao
 * - 200 - 300 EXP: Voucher TP chức năng giá trị cao hơn / Quà tặng mẫu thử
 * - 500 - 800 EXP: Voucher phụ kiện & Dịch vụ trải nghiệm chuyên sâu
 * - 1.000+ EXP: HIỆN VẬT VẬT CHẤT ĐỘC QUYỀN IN HÌNH SYNESIS (Bình nước, Áo tập, Balo)
 */

export type RewardCategory = "all" | "voucher" | "physical" | "history";
export type RewardTier = 1 | 2 | 3 | 4;

export interface RewardItem {
  id: string;
  title: string;
  partnerName: string;
  category: "voucher" | "physical";
  tier: RewardTier;
  expCost: number;
  tag: string;
  description: string;
  valueText: string;
  inStock: boolean;
  requiresShipping: boolean;
  terms: string[];
  iconType: "whey" | "electrolyte" | "gel" | "shaker" | "inbody" | "bottle" | "shirt" | "bag" | "combo";
}

export interface ShippingInfo {
  recipientName: string;
  phone: string;
  address: string;
  size?: string;
  note?: string;
}

export interface RedeemedItem {
  id: string;
  rewardId: string;
  rewardTitle: string;
  partnerName: string;
  category: "voucher" | "physical";
  expCost: number;
  redeemedAt: string;
  code?: string;
  expiresAt?: string;
  status: "active" | "used" | "shipping" | "delivered";
  shippingInfo?: ShippingInfo;
}

export const REWARDS_CATALOG: RewardItem[] = [
  // --- TẦNG 1: 100 EXP (Voucher Thực Phẩm Chức Năng / Bổ Sung Thể Thao) ---
  {
    id: "r-whey-15",
    title: "Voucher Giảm 15% Whey Protein & Dinh Dưỡng Thể Thao",
    partnerName: "WheyStore Chính Hãng",
    category: "voucher",
    tier: 1,
    expCost: 100,
    tag: "TP Chức Năng",
    description: "Giảm trực tiếp 15% (tối đa 50.000đ) khi mua Whey Isolate, Casein hoặc Creatine.",
    valueText: "Giảm 15% (tối đa 50k)",
    inStock: true,
    requiresShipping: false,
    terms: [
      "Áp dụng cho toàn bộ dòng Whey Protein & Creatine chính hãng",
      "Hạn dùng 30 ngày kể từ thời điểm đổi mã",
      "Áp dụng mua trực tiếp tại cửa hàng hoặc đặt online",
      "Mỗi tài khoản đổi tối đa 2 lần/tháng",
    ],
    iconType: "whey",
  },
  {
    id: "r-electrolyte-30k",
    title: "Voucher Giảm 30.000đ Combo Nước Bù Điện Giải & Bổ Sung Khoáng",
    partnerName: "Revive & Pocari Sport",
    category: "voucher",
    tier: 1,
    expCost: 100,
    tag: "Bù Điện Giải",
    description: "Giảm 30.000đ cho đơn hàng nước khoáng thể thao và viên sủi bù điện giải từ 100.000đ.",
    valueText: "Giảm 30.000đ",
    inStock: true,
    requiresShipping: false,
    terms: [
      "Áp dụng cho đơn hàng nước điện giải / bù khoáng từ 100.000đ",
      "Hạn sử dụng 30 ngày",
      "Áp dụng tại chuỗi cửa hàng tiện lợi và đại lý liên kết",
    ],
    iconType: "electrolyte",
  },
  {
    id: "r-gel-20k",
    title: "Voucher Giảm 20.000đ Gel Năng Lượng Cho Runner & Cyclist",
    partnerName: "Runner Corner",
    category: "voucher",
    tier: 1,
    expCost: 100,
    tag: "Gel Năng Lượng",
    description: "Giảm 20.000đ khi mua từ 3 gói Gel năng lượng bất kỳ (Gu, Maurten, SIS).",
    valueText: "Giảm 20.000đ",
    inStock: true,
    requiresShipping: false,
    terms: [
      "Áp dụng khi mua từ 3 gói Gel năng lượng bất kỳ",
      "Không giới hạn thương hiệu gel",
      "Hạn sử dụng 30 ngày",
    ],
    iconType: "gel",
  },

  // --- TẦNG 2: 200 - 300 EXP (Voucher Giá Trị Cao Hơn & Quà Dùng Thử) ---
  {
    id: "r-nutrition-100k",
    title: "Voucher Giảm 100.000đ Đơn Thực Phẩm Chức Năng Từ 500.000đ",
    partnerName: "GymStore Nutrition",
    category: "voucher",
    tier: 2,
    expCost: 200,
    tag: "TP Chức Năng Cao Cấp",
    description: "Giảm sâu 100.000đ cho đơn hàng Vitamin tổng hợp thể thao, Dầu cá Omega-3, BCAA phục hồi cơ.",
    valueText: "Giảm 100.000đ",
    inStock: true,
    requiresShipping: false,
    terms: [
      "Áp dụng cho đơn hàng thực phẩm chức năng từ 500.000đ",
      "Không áp dụng đồng thời với khuyến mãi khác",
      "Hạn dùng 30 ngày kể từ ngày đổi",
    ],
    iconType: "whey",
  },
  {
    id: "r-shaker-gift",
    title: "Voucher Tặng 01 Bình Lắc Shaker Chuyên Dụng (hoặc 2 Gói Gel)",
    partnerName: "FitBox VN",
    category: "voucher",
    tier: 2,
    expCost: 200,
    tag: "Quà Tặng Kèm",
    description: "Nhận miễn phí 1 bình lắc Shaker 3 tầng 500ml hoặc 2 gói Gel năng lượng khi mua hàng tại FitBox.",
    valueText: "Quà tặng 90.000đ",
    inStock: true,
    requiresShipping: false,
    terms: [
      "Tặng kèm miễn phí khi mua bất kỳ hũ thực phẩm bổ sung nào",
      "Xuất trình mã voucher tại quầy thanh toán",
      "Hạn dùng 30 ngày",
    ],
    iconType: "shaker",
  },
  {
    id: "r-daypass-50",
    title: "Voucher Giảm 50% Day-Pass (Vé Tập 1 Ngày) Cụm Gym / Bơi Đối Tác",
    partnerName: "Mạng Lưới Spot Synesis",
    category: "voucher",
    tier: 2,
    expCost: 300,
    tag: "Trải Nghiệm Spot",
    description: "Trải nghiệm trọn vẹn 1 ngày tập luyện, phòng xông hơi và bể bơi tại hệ thống đối tác.",
    valueText: "Giảm 50% Day-Pass",
    inStock: true,
    requiresShipping: false,
    terms: [
      "Áp dụng tại tất cả phòng tập có chứng nhận Spot trên ứng dụng Synesis",
      "Mỗi người dùng được đổi tối đa 2 vé/tháng",
      "Hạn sử dụng 45 ngày",
    ],
    iconType: "inbody",
  },

  // --- TẦNG 3: 500 - 800 EXP (Dịch Vụ & Trang Phục Cao Cấp) ---
  {
    id: "r-sportwear-200k",
    title: "Voucher Giảm 200.000đ Giày & Trang Phục Thể Thao Chính Hãng",
    partnerName: "Sport Official Mall",
    category: "voucher",
    tier: 3,
    expCost: 500,
    tag: "Trang Phục",
    description: "Giảm 200.000đ cho đơn hàng giày chạy bộ, quần áo thể thao từ 1.000.000đ.",
    valueText: "Giảm 200.000đ",
    inStock: true,
    requiresShipping: false,
    terms: [
      "Áp dụng đơn hàng từ 1.000.000đ",
      "Hàng chính hãng đổi trả trong 7 ngày nếu không vừa size",
      "Hạn sử dụng 30 ngày",
    ],
    iconType: "shirt",
  },
  {
    id: "r-inbody-free",
    title: "Voucher Miễn Phí 01 Buổi Đo InBody & Tư Vấn Dinh Dưỡng 1:1",
    partnerName: "Synesis Health & Coaching",
    category: "voucher",
    tier: 3,
    expCost: 600,
    tag: "Đặc Quyền Hội Viên",
    description: "Đo InBody chuyên sâu 8 chỉ số và nhận kế hoạch dinh dưỡng cá nhân hóa 1:1 cùng HLV.",
    valueText: "Miễn phí 100% (250k)",
    inStock: true,
    requiresShipping: false,
    terms: [
      "Được thực hiện bởi Coach Uy Tín của Synesis tại phòng tập đối tác",
      "Đặt lịch trước 24 giờ trên ứng dụng",
      "Hạn sử dụng 60 ngày",
    ],
    iconType: "inbody",
  },

  // --- TẦNG 4: 1.000+ EXP (HIỆN VẬT VẬT CHẤT ĐỘC QUYỀN IN HÌNH SYNESIS) ---
  {
    id: "r-synesis-bottle",
    title: "Bình Nước Thể Thao Synesis Pro (750ml)",
    partnerName: "Synesis Official Gear",
    category: "physical",
    tier: 4,
    expCost: 1000,
    tag: "Hiện Vật Synesis",
    description: "Nhựa Tritan cao cấp không chứa BPA, nắp bật thể thao chống tràn, in logo Synesis và slogan 'Kỷ luật tạo tự do'.",
    valueText: "Hiện vật độc quyền",
    inStock: true,
    requiresShipping: true,
    terms: [
      "Quà tặng vật chất in logo chính hãng Synesis",
      "Giao hàng tận nơi miễn phí toàn quốc",
      "Cam kết 1 đổi 1 trong 14 ngày nếu có lỗi kỹ thuật nắp/vỏ",
    ],
    iconType: "bottle",
  },
  {
    id: "r-synesis-tee",
    title: "Áo Tập Thể Thao Synesis Performance Tee",
    partnerName: "Synesis Official Gear",
    category: "physical",
    tier: 4,
    expCost: 1500,
    tag: "Hiện Vật Synesis",
    description: "Vải dệt kim thoáng khí Quick-Dry, co giãn 4 chiều, vạch phản quang chạy đêm, in biểu tượng Synesis ngực áo và lưng.",
    valueText: "Hiện vật độc quyền",
    inStock: true,
    requiresShipping: true,
    terms: [
      "Được chọn size áo phù hợp: S, M, L, XL, XXL",
      "Giao hàng tận nơi miễn phí toàn quốc",
      "Hỗ trợ đổi size trong 7 ngày đầu",
    ],
    iconType: "shirt",
  },
  {
    id: "r-synesis-bag",
    title: "Balo / Túi Trống Tập Gym Synesis Duffel Pro",
    partnerName: "Synesis Official Gear",
    category: "physical",
    tier: 4,
    expCost: 2200,
    tag: "Hiện Vật Synesis",
    description: "Chất liệu Oxford trượt nước cao cấp, ngăn thông hơi riêng đựng giày tập và đồ ướt, in logo Synesis sang trọng.",
    valueText: "Hiện vật độc quyền",
    inStock: true,
    requiresShipping: true,
    terms: [
      "Quà tặng hiện vật cao cấp dành riêng cho hội viên kiên trì",
      "Bảo hành khóa kéo và đường may 6 tháng",
      "Giao hàng miễn phí toàn quốc",
    ],
    iconType: "bag",
  },
  {
    id: "r-synesis-legend-box",
    title: "Full Combo Tinh Anh Synesis (Legend Box)",
    partnerName: "Synesis Official Gear",
    category: "physical",
    tier: 4,
    expCost: 3000,
    tag: "Đặc Biệt · Giới Hạn",
    description: "Trọn bộ: 01 Áo thi đấu bản giới hạn + 01 Bình giữ nhiệt inox 304 khắc tên cá nhân + 01 Balo thể thao + Giấy chứng nhận Kỷ luật.",
    valueText: "Hộp quà tri ân",
    inStock: true,
    requiresShipping: true,
    terms: [
      "Dành riêng cho những cá nhân kỷ luật xuất sắc",
      "Bình giữ nhiệt được khắc tên và handle cá nhân của bạn",
      "Đóng gói hộp quà cao cấp trao tận tay",
    ],
    iconType: "combo",
  },
];

const STORAGE_EXP_KEY = "sync_user_redeemable_exp_v1";
const STORAGE_HISTORY_KEY = "sync_user_redeemed_history_v1";

export const DEFAULT_USER_EXP = 1240; // Đồng bộ với Hồ sơ (1.240 EXP)

export const INITIAL_REDEEMED_ITEMS: RedeemedItem[] = [
  {
    id: "red-01",
    rewardId: "r-whey-15",
    rewardTitle: "Voucher Giảm 15% Whey Protein & Dinh Dưỡng Thể Thao",
    partnerName: "WheyStore Chính Hãng",
    category: "voucher",
    expCost: 100,
    redeemedAt: "10/11/2026",
    code: "SYN-WHEY-15-X98A",
    expiresAt: "10/12/2026",
    status: "active",
  },
];

export function getStoredUserExp(): number {
  if (typeof window === "undefined") return DEFAULT_USER_EXP;
  try {
    const raw = localStorage.getItem(STORAGE_EXP_KEY);
    if (!raw) return DEFAULT_USER_EXP;
    const parsed = parseInt(raw, 10);
    return isNaN(parsed) ? DEFAULT_USER_EXP : parsed;
  } catch {
    return DEFAULT_USER_EXP;
  }
}

export function setStoredUserExp(exp: number): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_EXP_KEY, exp.toString());
  } catch {
    // Ignore storage errors
  }
}

export function getStoredRedeemedItems(): RedeemedItem[] {
  if (typeof window === "undefined") return INITIAL_REDEEMED_ITEMS;
  try {
    const raw = localStorage.getItem(STORAGE_HISTORY_KEY);
    if (!raw) return INITIAL_REDEEMED_ITEMS;
    return JSON.parse(raw);
  } catch {
    return INITIAL_REDEEMED_ITEMS;
  }
}

export function setStoredRedeemedItems(items: RedeemedItem[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_HISTORY_KEY, JSON.stringify(items));
  } catch {
    // Ignore storage errors
  }
}

export function generateVoucherCode(prefix = "SYN"): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let result = `${prefix}-`;
  for (let i = 0; i < 4; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  result += "-";
  for (let i = 0; i < 4; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
