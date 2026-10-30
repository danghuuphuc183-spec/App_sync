# Khế Ước Kỷ Luật Thể Thao Đô Thị

Nền tảng kết nối đối tác tập luyện thể thao phong trào (chạy bộ & gym) theo mô hình **Khế ước kỷ luật**, số hóa áp lực đồng trang lứa và cam kết bằng **Điểm Uy Tín (Trust Score, TS)**.

---

## 1. Yêu cầu môi trường

- **Node.js**: >= 20.x
- **pnpm**: >= 12.x (sử dụng `corepack enable pnpm`)
- **Docker & Supabase CLI**: Phục vụ database Postgres và RLS local từ P3

## 2. Cài đặt & Chạy ứng dụng

```bash
# Cài đặt thư viện
pnpm install

# Khởi chạy server phát triển
pnpm dev

# Mở trình duyệt: http://localhost:3000
# Trang kiểm thử Design System: http://localhost:3000/design-system
```

## 3. Cổng kiểm tra chất lượng (Quality Gates)

Dự án áp dụng quy tắc kiểm tra nghiêm ngặt không lỗi trước khi commit:

```bash
pnpm typecheck   # tsc --noEmit
pnpm lint        # ESLint với TypeScript strict
pnpm test        # Vitest kiểm tra đơn vị và tích hợp
pnpm build       # Next.js build bundle
pnpm test:e2e    # Playwright end-to-end tests
pnpm test:db     # Kiểm tra RLS và SQL Functions (từ P3)
```

## 4. Cấu trúc thư mục

```
src/
├── app/                  # Next.js App Router (Public, Auth, Member, Club, Admin)
│   ├── (public)/         # Tuyến đường công khai (Landing, Môn thể thao)
│   ├── (auth)/           # Luồng xác thực, cổng tuổi, đồng ý điều khoản
│   ├── (member)/         # Không gian người tập (Bảng kèo, Ví TS, Hồ sơ)
│   ├── (club)/           # Club OS: Ban chủ nhiệm, điểm danh, thành viên
│   ├── (partner)/        # Đối tác địa điểm tập luyện
│   ├── (admin)/          # Console quản trị nền tảng & nhật ký kiểm toán
│   └── design-system/    # Môi trường dev showcase toàn bộ component
├── components/
│   ├── ui/               # Thành phần giao diện nền tảng (Button, Card, Badge...)
│   └── shared/           # Thành phần dùng chung (TrustMeter, TierBadge, SportCard...)
├── features/             # Mô-đun nghiệp vụ độc lập
│   ├── auth/             # Xác thực Supabase & phiên
│   ├── rbac/             # Phân quyền & cấu hình thanh điều hướng theo vai trò
│   ├── sports/           # Danh mục môn, traits, thuật toán gợi ý Quiz
│   ├── trust/            # Single Source of Truth cho Trust Score, thưởng/phạt
│   ├── bounty/           # Bảng kèo Workout Bounty, giữ chỗ (hold)
│   ├── clubs/            # Quản lý câu lạc bộ, mã mời crypto, điểm danh
│   ├── venues/           # Điểm chạm thể thao, micro-tags
│   ├── admin/            # Phê duyệt, cấp vai trò, audit log
│   └── privacy/          # Quản lý sự đồng ý, xuất/xóa dữ liệu (Luật BVBDCN)
├── lib/
│   ├── date/             # Xử lý UTC & múi giờ Asia/Ho_Chi_Minh
│   ├── errors/           # Định nghĩa AppError & Result<T, E>
│   ├── i18n/             # Dịch thuật tiếng Việt chuẩn
│   └── utils/            # Helper tiện ích Tailwind
├── messages/
│   └── vi.json           # File từ điển tiếng Việt toàn hệ thống
docs/
├── PROJECT_CONTEXT.md    # Bối cảnh & quy tắc nghiệp vụ bất biến
├── DECISIONS.md          # Nhật ký quyết định & giả định kỹ thuật
└── ENV_REPORT.md         # Báo cáo kiểm tra môi trường
```

## 5. Ràng buộc bảo mật & Riêng tư

- Mọi thay đổi Trust Score được ghi bất biến vào `trust_ledger` thông qua hàm bảo mật Postgres `apply_trust_delta`.
- Tuân thủ Luật Bảo vệ dữ liệu cá nhân 2026: Không thu thập dữ liệu nhạy cảm dạng nhập tự do, không lưu GPS liên tục, bảo đảm quyền xuất/xóa dữ liệu.
