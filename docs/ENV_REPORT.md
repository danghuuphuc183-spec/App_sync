# BÁO CÁO MÔI TRƯỜNG PHÁT TRIỂN (ENV_REPORT)

*Ngày kiểm tra: 30/10/2026*

| Công cụ | Phiên bản hiện tại | Yêu cầu tối thiểu | Đạt yêu cầu? | Trạng thái & Ghi chú | Cách xử lý nếu thiếu/chưa đạt |
|---|---|---|---|---|---|
| **Node.js** | `v24.19.0` | >= 20.x | ✅ Đạt | Đã cài đặt | `nvm install 20` hoặc tải từ nodejs.org |
| **pnpm** | `12.16.1` | >= 9.x | ✅ Đạt | Đã kích hoạt qua Corepack | `corepack enable pnpm` hoặc `npm i -g pnpm` |
| **Git** | `2.50.1` | >= 2.x | ✅ Đạt | Repo đã `git init` | Có sẵn qua Xcode Command Line Tools |
| **Docker** | `29.6.1` | Đang chạy daemon | ⚠️ Cần khởi động | Đã cài đặt CLI nhưng **Docker daemon chưa chạy** | Mở ứng dụng **Docker Desktop** trên macOS để khởi động daemon (cần cho Supabase local từ P3) |
| **Supabase CLI** | `2.117.0` | >= 1.x | ✅ Đạt | Đã cài đặt | `brew install supabase/tap/supabase` |

### Tóm tắt hành động cần thực hiện từ người dùng:
- Mở **Docker Desktop** trên máy Mac khi cần chạy Supabase local (`supabase db start` / `supabase db reset` cho P3 trở đi).
