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

### Dùng thử nhanh (bản demo, dữ liệu giả lập)

| Mục | Giá trị |
| --- | --- |
| Màn đăng nhập + hiệu ứng mở đầu | http://localhost:3000/dang-nhap |
| Mã OTP | `123456` |
| Tài khoản có sẵn (SĐT) | `0908123456` |
| Tài khoản có sẵn (Google) | `minhthu.run@gmail.com` |
| Tài khoản mới | Nhập SĐT/email khác → tự chuyển sang khảo sát cá nhân hoá `/bat-dau` (10 bước) |

Các trang chính: Trang chủ `/`, Bản đồ `/ban-do`, Lên kèo `/len-keo`, Xem kèo `/len-keo/xem`, Nhóm `/cau-lac-bo`, Reels `/reels`, Hồ sơ `/ho-so`.
Dữ liệu (kèo, nhật ký tập, theo dõi...) lưu trong `localStorage` của trình duyệt — xoá dữ liệu trang để bắt đầu lại. Nên mở ở chế độ điện thoại (DevTools → 390px).

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

## 6. Hướng dẫn làm việc nhóm & Đồng bộ từ xa (Git Collaboration Workflow)

Dự án được lưu trữ tại GitHub repository: [danghuuphuc183-spec/App_sync](https://github.com/danghuuphuc183-spec/App_sync)

### Dành cho bạn bè / Cộng tác viên (Contributors):
1. **Clone mã nguồn về máy:**
   ```bash
   git clone https://github.com/danghuuphuc183-spec/App_sync.git
   cd App_sync
   pnpm install
   cp .env.example .env.local
   pnpm dev
   ```

2. **Tạo nhánh tính năng mới (Branch) trước khi sửa đổi:**
   ```bash
   git checkout -b feature/ten-tinh-nang-moi
   ```

3. **Kiểm tra không có lỗi trước khi đẩy code:**
   ```bash
   pnpm typecheck
   pnpm test
   pnpm build
   ```

4. **Commit và đẩy lên GitHub:**
   ```bash
   git add .
   git commit -m "feat: mô tả tính năng vừa làm"
   git push origin feature/ten-tinh-nang-moi
   ```
   Sau đó tạo Pull Request trên GitHub để merge vào nhánh `main`.

### Dành cho bạn (Chủ dự án - Cập nhật tự động về máy khi bạn bè push code):
Mỗi khi bạn bè merge tính năng mới lên GitHub, bạn chỉ cần chạy lệnh sau tại thư mục dự án để cập nhật toàn bộ:
```bash
git checkout main
git pull origin main
pnpm install
```
Ứng dụng trên máy của bạn sẽ ngay lập tức được đồng bộ các tính năng mới nhất từ xa!
