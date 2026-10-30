# PROJECT CONTEXT

## 1. Sản phẩm
Nền tảng kết nối người tập thể thao phong trào đô thị (ưu tiên chạy bộ và tập kháng lực/gym) theo mô hình "khế ước kỷ luật": ghép đối tác tập cùng trình độ, cam kết bằng Điểm Uy tín (Trust Score, TS), xác thực buổi tập, quản trị CLB.
Giai đoạn đầu tập trung quanh các cụm đại học ở TP.HCM (ví dụ khu Bình Thạnh, Thủ Đức).
Tài liệu gốc: "Bản Phân Tích Kinh Doanh Chuyên Sâu: Nền Tảng Kết Nối Thể Thao Kỷ Luật". Nếu tài liệu này mâu thuẫn với gốc, ghi vào Decision Log, KHÔNG tự chọn.

## 2. Ngôn ngữ
- Giao diện, thông báo lỗi, email: tiếng Việt, xưng "bạn".
- Mã nguồn, tên biến, tên bảng, commit: tiếng Anh.
- Múi giờ mặc định: Asia/Ho_Chi_Minh. Lưu DB dạng UTC (timestamptz).

## 3. Vai trò (app_role)
| Vai trò | Mô tả | Lưu ở đâu |
|---|---|---|
| guest | Chưa đăng nhập | Không lưu DB |
| member | Người tập (mọi hạng) | user_roles |
| mentor | Người tập hạng Kim Cương đã đăng ký làm Mentor | user_roles |
| club_admin | Chủ nhiệm CLB | club_members.role (theo từng CLB) |
| club_mod | Cộng tác viên CLB | club_members.role (theo từng CLB) |
| venue_partner | Đối tác địa điểm | user_roles |
| brand_partner | Nhãn hàng/BTC giải | user_roles (MVP: chỉ tồn tại vai trò, chưa có UI) |
| platform_moderator | Kiểm duyệt | user_roles |
| platform_admin | Quản trị nền tảng | user_roles |

Một người có thể có nhiều vai trò. Vai trò CLB luôn gắn với một CLB cụ thể, không toàn cục.
Hạng (Đồng/Bạc/Vàng/Kim Cương) KHÔNG phải vai trò; nó được TÍNH từ TS.

## 4. Quy tắc nghiệp vụ đã chốt
### 4.1 Trust Score (TS)
- Khoảng 0 đến 150. Mọi thay đổi TS đi qua bảng trust_ledger (chỉ thêm, không sửa, không xóa).
- Hạng tính từ TS: dưới 60 = Đồng; 60-99 = Bạc; 100-129 = Vàng; 130-150 = Kim Cương.
- Hạng Đồng: khóa tạo kèo mới 7 ngày, chỉ nhận kèo cơ bản, cọc gấp đôi.
- Hạng Bạc: tối đa 2 kèo mở cùng lúc.
- Hạng Kim Cương: được đăng ký làm Mentor.

### 4.2 Thưởng/phạt (cấu hình trong một file config, không hard-code rải rác)
| Tình huống | Δ TS |
|---|---|
| Hoàn thành đúng hẹn, đủ khối lượng | +2 (hoàn 100% điểm cọc) |
| Đến trễ 5-15 phút | -5 |
| Hủy trước giờ hẹn trên 2 giờ | -3 (hoặc 0 nếu dùng thẻ ân hạn) |
| Hủy dưới 2 giờ | -15 |
| Bùng kèo / trễ trên 15 phút | -30 |

Thẻ ân hạn (grace pass): 2 thẻ/tháng/người; reset hằng tháng (cron làm sau, MVP chỉ cần cột và logic trừ).
"Đóng băng điểm cọc" = giữ chỗ (hold), KHÔNG trừ TS ngay. Điểm khả dụng = TS hiện tại - tổng hold đang hoạt động. Không cho cọc vượt điểm khả dụng.

### 4.3 Tiền thật
MVP KHÔNG xử lý tiền thật. Mọi cọc là điểm. Không có thanh toán, không có Xu, không có Elite Token.

## 5. Quyết định MỞ (OPEN) và mặc định tạm
| ID | Vấn đề | Mặc định tạm |
|---|---|---|
| D1 | Tài liệu gốc: TS khởi điểm 100 (=Vàng) nhưng Bạc được gọi là "Tân binh" | Dùng cờ `profiles.is_rookie` độc lập với hạng. Rookie chỉ nhận kèo `beginner_only` cho đến khi đủ dữ liệu hoặc qua thử thách đầu vào. Hạng chỉ tính từ TS |
| D2 | Web hay native | Web responsive/PWA |
| D3 | Môn không có nguồn dữ liệu tự động | `verification_mode = qr_only` hoặc `peer_confirm`; không ở MVP |
| D4 | Tuổi | Chỉ 18+; chặn đăng ký nếu dưới 18 |
| D5 | Đơn vị hành chính | Không hard-code quận/phường (địa giới thay đổi). Dùng bảng `areas` do admin quản lý, hiển thị là "khu vực" quen gọi |
| D6 | Lưu token Strava/Hevy | MVP KHÔNG lưu token (chưa tích hợp thật) |

## 6. Ràng buộc nguồn dữ liệu (đừng thiết kế vượt quá)
- Strava: điều khoản API từ 11/11/2024 hạn chế ứng dụng bên thứ ba hiển thị dữ liệu hoạt động của một người cho người khác, và cấm dùng dữ liệu API cho mô hình AI. Vì vậy MVP KHÔNG hiển thị Pace/dữ liệu Strava của người này cho người khác, KHÔNG đưa dữ liệu Strava vào AI. Cần đọc lại điều khoản hiện hành trước khi tích hợp thật.
- Hevy: API chỉ cho tài khoản Hevy Pro.
- Apple Health: dữ liệu nằm trên thiết bị, web không đọc được trực tiếp.
=> Trình độ hiển thị cho người khác ở MVP là **trình độ tự khai (beginner/intermediate/advanced) + dải trình độ do hệ thống tính nội bộ, hiển thị dạng nhãn thô**, không phải số liệu gốc.

## 7. Pháp lý và quyền riêng tư
- Luật Bảo vệ dữ liệu cá nhân (hiệu lực 1/1/2026) và Nghị định 356/2025/NĐ-CP: thông tin tình trạng sức khỏe là dữ liệu nhạy cảm; cấm mua bán dữ liệu cá nhân.
- Nguyên tắc: thu thập tối thiểu, có đồng ý rõ ràng theo từng mục đích, cho phép xuất và xóa dữ liệu.
- KHÔNG có ô nhập tự do về bệnh lý/chấn thương. Chỉ dùng lựa chọn có sẵn.
- Vị trí: chỉ lưu "khu vực" (thô) ở MVP; không theo dõi GPS liên tục.
- Nhãn hàng chỉ có thể nhận số liệu tổng hợp ẩn danh (làm sau). Không bao giờ xuất danh sách cá nhân.
- Đây là nguyên tắc kỹ thuật, KHÔNG phải tư vấn pháp lý. Cần luật sư xác nhận trước khi ra mắt.

## 8. Ma trận quyền (✅ được · 🔸 có điều kiện · ❌ không)
| Chức năng | guest | member (Tân binh) | member (Bạc/Vàng) | mentor | club_admin | venue_partner | platform_admin |
|---|---|---|---|---|---|---|---|
| Xem danh mục môn/danh sách kèo | 🔸 giới hạn | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Chọn môn, tạo hồ sơ môn, làm quiz | 🔸 quiz thì được, lưu thì không | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ |
| Tạo kèo | ❌ | ❌ | ✅ | ✅ | ✅ | ❌ | ❌ |
| Nhận kèo | ❌ | 🔸 chỉ beginner_only | ✅ | ✅ | ✅ | ❌ | ❌ |
| Tạo/quản lý CLB của mình | ❌ | 🔸 gửi yêu cầu | 🔸 gửi yêu cầu | 🔸 | ✅ CLB mình | ❌ | ✅ |
| Quản lý địa điểm của mình | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| Cấu hình danh mục môn, cấp/thu hồi vai trò, duyệt CLB/địa điểm | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
Quyền được thực thi ở TẦNG DB (RLS) VÀ tầng server. Ẩn nút trên UI không được coi là phân quyền.

## 9. Thuật ngữ
Kèo = Workout Card = bounty. TS = Điểm Uy tín. Hold = điểm đang giữ cho một kèo. CLB = câu lạc bộ.
