# QUY TẮC DỰ ÁN (LUÔN ÁP DỤNG)

## A. Hành vi của agent
1. Đọc `docs/PROJECT_CONTEXT.md` trước khi làm bất cứ việc gì. Nếu prompt mâu thuẫn với file này, DỪNG VÀ HỎI.
2. Chỉ làm đúng phạm vi của prompt hiện tại. Không thêm tính năng "tiện thể". Không sửa file ngoài phạm vi trừ khi bắt buộc để build chạy; nếu có, nêu rõ trong báo cáo.
3. DỪNG VÀ HỎI (không đoán) khi: thiếu thông tin nghiệp vụ; cần thêm dependency lớn; cần thao tác phá hủy (xóa file/bảng/dữ liệu, force push, reset); cần khóa bí mật; luật nghiệp vụ mơ hồ.
4. Không bịa: không bịa số liệu thị trường, API, tên hàm thư viện, hay kết quả test. Nếu không chắc một API tồn tại, đọc tài liệu/kiểm tra trong node_modules trước khi dùng.
5. Không được tuyên bố "hoàn tất" nếu bất kỳ cổng kiểm tra nào chưa chạy hoặc đang đỏ. Báo cáo kết quả THẬT của lệnh, không tóm tắt cảm tính.
6. Mọi giả định mới phải ghi vào `docs/DECISIONS.md` (ngày, giả định, lý do, ai cần xác nhận).

## B. Mã nguồn
7. TypeScript `strict: true`. Cấm `any` (dùng `unknown` rồi thu hẹp). Cấm `// @ts-ignore`, `eslint-disable` không kèm lý do.
8. Mọi dữ liệu đi qua ranh giới (form, route handler, server action, kết quả DB, biến môi trường) phải qua Zod.
9. Hàm có thể lỗi trả về kiểu `Result<T, AppError>` hoặc ném `AppError` có mã; không nuốt lỗi (`catch {}` rỗng bị cấm).
10. Không lặp quy tắc nghiệp vụ: hằng số/luật (TS, hạng, phạt) nằm ở MỘT nơi (`src/features/trust/config.ts`) và được DB function tham chiếu cùng giá trị qua test đối chiếu.
11. Thời gian: luôn UTC trong DB, hiển thị theo Asia/Ho_Chi_Minh. Không tự cộng/trừ giờ bằng tay.
12. Không dùng `Math.random` cho mã mời/token; dùng crypto.

## C. Bảo mật và dữ liệu
13. RLS bật cho MỌI bảng trong schema public. Mặc định từ chối; chỉ mở bằng policy rõ ràng.
14. Service-role key chỉ dùng phía server, trong module riêng, không bao giờ import vào code chạy ở client. Có test/lint chặn.
15. Không commit `.env*` (trừ `.env.example` không chứa giá trị thật).
16. Không ghi PII (email, tên, vị trí chính xác) vào log.
17. Phân quyền kiểm tra ở server VÀ DB; UI chỉ phản ánh.
18. Migration chỉ đi tiến (forward-only), có tên có thứ tự, không sửa migration đã áp dụng; sửa bằng migration mới.

## D. UI/UX
19. Mobile-first (rộng 360px là chuẩn tối thiểu). Chạm tối thiểu 44x44px.
20. Mọi màn hình dữ liệu phải có đủ 4 trạng thái: đang tải, rỗng, lỗi (có nút thử lại), thành công.
21. Tiếng Việt lấy từ `src/messages/vi.json`; không hard-code chuỗi trong component.
22. Truy cập: tương phản chữ tối thiểu 4.5:1; focus nhìn thấy; điều khiển được bằng bàn phím; ảnh có alt; form có label và thông báo lỗi liên kết bằng aria.
23. Không dùng logo/ảnh/tên thương hiệu thật không có bản quyền; dùng placeholder và ghi TODO.

## E. Phụ thuộc
24. Ghim phiên bản (lockfile). Thêm dependency mới phải nêu lý do, kích thước, giấy phép; ưu tiên thư viện phổ biến, còn được bảo trì.
25. Không thêm thư viện cho việc làm được bằng vài dòng.

## F. Cổng kiểm tra (Definition of Done chung)
Trước khi báo hoàn tất, chạy và dán kết quả:
`pnpm typecheck && pnpm lint && pnpm test && pnpm build`
và nếu prompt có đụng DB: `supabase db reset && pnpm test:db`.
Cả hai phải xanh.

## G. Git
26. Mỗi prompt xong để agent chuẩn bị mô tả commit, nhưng KHÔNG tự push, KHÔNG force push, KHÔNG xóa nhánh.
