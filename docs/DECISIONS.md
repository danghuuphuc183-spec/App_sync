# NHẬT KÝ QUYẾT ĐỊNH & GIẢ ĐỊNH KỸ THUẬT (DECISIONS LOG)

Tài liệu ghi nhận mọi giả định kỹ thuật, kiến trúc và quyết định nghiệp vụ phát sinh trong quá trình xây dựng dự án "Khế ước kỷ luật thể thao".

| Ngày | Quyết định / Giả định | Lý do | Cần ai xác nhận | Trạng thái |
|---|---|---|---|---|
| 30/10/2026 | **D1**: Dùng cờ `profiles.is_rookie` độc lập với hạng (Tier). Rookie chỉ nhận kèo `beginner_only` cho đến khi đủ dữ liệu hoặc qua thử thách đầu vào. Hạng chỉ tính từ TS. | Tài liệu gốc nêu TS khởi điểm 100 (= Vàng) nhưng Bạc được gọi là "Tân binh", gây mâu thuẫn giữa điểm số và kinh nghiệm. | Product Owner / Founder | Tạm chốt (Mặc định) |
| 30/10/2026 | **D2**: Hình thức ứng dụng là Web App responsive, mobile-first, có khả năng cài đặt như PWA. | Dùng một codebase duy nhất cho cả mobile web và desktop; tối ưu chi phí phát triển MVP ban đầu. | Founder / Tech Lead | Đã chốt |
| 30/10/2026 | **D3**: Môn thể thao không có nguồn dữ liệu tự động ở MVP sẽ để `verification_mode = qr_only` hoặc `peer_confirm`; tạm thời chưa mở ở MVP. | Giữ phạm vi MVP tinh gọn (tập trung chạy bộ và gym). | Product Owner | Đã chốt |
| 30/10/2026 | **D4**: Độ tuổi tham gia: Chỉ người dùng từ đủ 18 tuổi trở lên (18+); chặn đăng ký nếu dưới 18 tuổi. | Tuân thủ pháp lý về cam kết cá nhân và quyền riêng tư dữ liệu người chưa thành niên. | Pháp lý / Founder | Đã chốt |
| 30/10/2026 | **D5**: Đơn vị hành chính: Không hard-code danh sách quận/phường cố định (do biến động sáp nhập). Dùng bảng `areas` do admin quản lý, hiển thị dạng "khu vực" quen thuộc (ví dụ Bình Thạnh, Thủ Đức). | Linh hoạt mở rộng theo cụm trường đại học và khu đô thị thực tế. | Product Owner | Đã chốt |
| 30/10/2026 | **D6**: Lưu trữ token Strava/Hevy: MVP KHÔNG lưu token (chưa tích hợp API thật, dùng Mock Provider có kiểm chứng). | Tránh rủi ro bảo mật và vi phạm điều khoản API của bên thứ ba trong giai đoạn thử nghiệm. | Tech Lead / Security | Đã chốt |
