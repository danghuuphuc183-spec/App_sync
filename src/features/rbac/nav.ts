export type AppRole =
  | "guest"
  | "member"
  | "mentor"
  | "club_admin"
  | "club_mod"
  | "venue_partner"
  | "brand_partner"
  | "platform_moderator"
  | "platform_admin";

export interface NavItem {
  title: string;
  href: string;
  iconName: string;
  badge?: string;
}

export const ROLE_NAVIGATION: Record<AppRole, NavItem[]> = {
  guest: [
    { title: "Trang chủ", href: "/", iconName: "Home" },
    { title: "Môn thể thao", href: "/mon-the-thao", iconName: "Activity" },
    { title: "Bảng kèo", href: "/bang-keo", iconName: "Flame" },
    { title: "Địa điểm", href: "/dia-diem", iconName: "MapPin" },
    { title: "Đăng nhập", href: "/dang-nhap", iconName: "LogIn" },
  ],
  member: [
    { title: "Bảng kèo", href: "/bang-keo", iconName: "Flame" },
    { title: "Kèo của tôi", href: "/keo-cua-toi", iconName: "Calendar" },
    { title: "Chọn môn", href: "/chon-mon", iconName: "Activity" },
    { title: "CLB", href: "/cau-lac-bo", iconName: "Users" },
    { title: "Địa điểm", href: "/dia-diem", iconName: "MapPin" },
    { title: "Ví TS", href: "/vi-uy-tin", iconName: "ShieldCheck" },
    { title: "Hồ sơ", href: "/ho-so", iconName: "User" },
  ],
  mentor: [
    { title: "Bảng kèo", href: "/bang-keo", iconName: "Flame" },
    { title: "Kèm Tân binh", href: "/mentor/tan-binh", iconName: "Award", badge: "Mentor" },
    { title: "Kèo của tôi", href: "/keo-cua-toi", iconName: "Calendar" },
    { title: "CLB", href: "/cau-lac-bo", iconName: "Users" },
    { title: "Ví TS", href: "/vi-uy-tin", iconName: "ShieldCheck" },
  ],
  club_admin: [
    { title: "CLB của tôi", href: "/clb/quan-ly", iconName: "Users" },
    { title: "Điểm danh", href: "/clb/diem-danh", iconName: "CheckSquare" },
    { title: "Thành viên", href: "/clb/thanh-vien", iconName: "UserCheck" },
    { title: "Cài đặt CLB", href: "/clb/cai-dat", iconName: "Settings" },
  ],
  club_mod: [
    { title: "CLB của tôi", href: "/clb/quan-ly", iconName: "Users" },
    { title: "Điểm danh buổi", href: "/clb/diem-danh", iconName: "CheckSquare" },
  ],
  venue_partner: [
    { title: "Địa điểm của tôi", href: "/doi-tac/dia-diem", iconName: "MapPin" },
    { title: "Thêm địa điểm", href: "/doi-tac/them-dia-diem", iconName: "PlusCircle" },
  ],
  brand_partner: [
    { title: "Tổng quan đối tác", href: "/brand/overview", iconName: "TrendingUp" },
  ],
  platform_moderator: [
    { title: "Hàng đợi duyệt", href: "/admin/duyet", iconName: "Clock" },
    { title: "Kèo tranh chấp", href: "/admin/tranh-chap", iconName: "AlertTriangle" },
  ],
  platform_admin: [
    { title: "Tổng quan Admin", href: "/admin", iconName: "BarChart" },
    { title: "Hàng đợi duyệt", href: "/admin/duyet", iconName: "CheckCircle" },
    { title: "Môn thể thao", href: "/admin/mon-the-thao", iconName: "Activity" },
    { title: "Khu vực", href: "/admin/khu-vuc", iconName: "Map" },
    { title: "Quản lý vai trò", href: "/admin/vai-tro", iconName: "Shield" },
    { title: "Nhật ký kiểm toán", href: "/admin/nhat-ky", iconName: "FileText" },
  ],
};

/**
 * Trả về danh sách điều hướng theo vai trò (mặc định guest)
 */
export function getNavForRole(role: AppRole = "guest"): NavItem[] {
  return ROLE_NAVIGATION[role] || ROLE_NAVIGATION.guest;
}
