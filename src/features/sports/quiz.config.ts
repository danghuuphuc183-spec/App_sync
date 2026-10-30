import { z } from "zod";

export const QUIZ_VERSION = 1;

export const AREAS = [
  { id: "area-binh-thanh", name: "Bình Thạnh (Cụm FTU2, HUTECH, UEF)" },
  { id: "area-thu-duc", name: "Thủ Đức (Cụm ĐHQG & Sư Phạm Kỹ Thuật)" },
  { id: "area-quan-1", name: "Quận 1 (Trung tâm)" },
  { id: "area-quan-7", name: "Quận 7 (Cụm RMIT, Tôn Đức Thắng)" },
] as const;

export const quizAnswersSchema = z.object({
  q1_goal: z.enum([
    "giam_mo",
    "tang_co",
    "tang_suc_ben",
    "ket_ban",
    "giu_thoi_quen",
  ]),
  q2_frequency: z.enum(["1_2", "3_4", "5_plus"]),
  q3_time_slot: z.enum(["sang_som", "sang", "chieu", "toi"]),
  q4_social_comfort: z.enum(["thoai_mai", "binh_thuong", "hoi_ngai"]),
  q5_budget: z.enum(["mien_phi", "duoi_300k", "linh_hoat"]),
  q6_area: z.string().min(1, "Vui lòng chọn khu vực tập luyện"),
  q7_experience: z.enum(["moi_bat_dau", "duoi_6_thang", "6_24_thang", "tren_24_thang"]),
});

export type QuizAnswers = z.infer<typeof quizAnswersSchema>;

export interface QuizQuestionOption<T> {
  value: T;
  label: string;
  subLabel?: string;
}

export interface QuizQuestionConfig<T = string> {
  id: keyof QuizAnswers;
  title: string;
  description: string;
  options: QuizQuestionOption<T>[];
}

export const QUIZ_QUESTIONS: QuizQuestionConfig<string>[] = [
  {
    id: "q1_goal",
    title: "Mục tiêu tập luyện chính của bạn là gì?",
    description: "Chúng tôi sẽ điều chỉnh ưu tiên môn thể thao theo mục tiêu này.",
    options: [
      { value: "giam_mo", label: "Giảm mỡ & Đốt năng lượng", subLabel: "Ưu tiên tiêu hao calo cao" },
      { value: "tang_co", label: "Tăng cơ & Cải thiện hình thể", subLabel: "Tập trung kháng lực" },
      { value: "tang_suc_ben", label: "Tăng sức bền tim mạch", subLabel: "Chạy bộ, bơi, đạp xe" },
      { value: "ket_ban", label: "Kết bạn tập cùng kỷ luật", subLabel: "Tìm đối tác có động lực" },
      { value: "giu_thoi_quen", label: "Duy trì thói quen vận động", subLabel: "Vận động nhẹ nhàng đều đặn" },
    ],
  },
  {
    id: "q2_frequency",
    title: "Bạn muốn tập bao nhiêu buổi mỗi tuần?",
    description: "Giúp xác định cam kết lịch tập khả thi.",
    options: [
      { value: "1_2", label: "1 - 2 buổi / tuần", subLabel: "Khởi động nhẹ nhàng" },
      { value: "3_4", label: "3 - 4 buổi / tuần", subLabel: "Tần suất lý tưởng" },
      { value: "5_plus", label: "5 buổi trở lên / tuần", subLabel: "Kỷ luật cao độ" },
    ],
  },
  {
    id: "q3_time_slot",
    title: "Khung giờ bạn thường rảnh nhất để tập?",
    description: "Ghép cặp với những người có cùng đồng hồ sinh học.",
    options: [
      { value: "sang_som", label: "Sáng sớm (05:00 - 07:00)", subLabel: "Đón bình minh, không khí mát" },
      { value: "sang", label: "Buổi sáng (07:00 - 10:00)", subLabel: "Sau giờ cao điểm" },
      { value: "chieu", label: "Buổi chiều (16:30 - 18:30)", subLabel: "Sau giờ tan học / tan làm" },
      { value: "toi", label: "Buổi tối (19:00 - 21:30)", subLabel: "Tập gym, chạy tối bờ kè" },
    ],
  },
  {
    id: "q4_social_comfort",
    title: "Mức độ thoải mái khi tập cùng người lạ?",
    description: "Nếu bạn ngại giao tiếp, nền tảng có Chế độ Hướng nội (Ghost Mode).",
    options: [
      { value: "thoai_mai", label: "Rất thoải mái", subLabel: "Thích trò chuyện & mở rộng mối quan hệ" },
      { value: "binh_thuong", label: "Bình thường", subLabel: "Lịch sự, tập trung bài tập" },
      { value: "hoi_ngai", label: "Hơi ngại (Đề xuất Ghost Mode)", subLabel: "Chỉ quét QR điểm danh rồi tự tập" },
    ],
  },
  {
    id: "q5_budget",
    title: "Ngân sách tập luyện hàng tháng dự kiến?",
    description: "Lọc môn ngoài trời miễn phí hoặc phòng gym có phí.",
    options: [
      { value: "mien_phi", label: "Miễn phí (0 đ)", subLabel: "Chạy bộ công viên, bờ kè" },
      { value: "duoi_300k", label: "Dưới 300.000 đ / tháng", subLabel: "Vé tập ngày hoặc phòng sinh viên" },
      { value: "linh_hoat", label: "Linh hoạt ngân sách", subLabel: "Phòng gym thương mại, sân tập" },
    ],
  },
  {
    id: "q6_area",
    title: "Khu vực bạn muốn tập luyện?",
    description: "Chọn cụm đô thị gần bạn nhất (không nhập tự do để bảo vệ dữ liệu).",
    options: AREAS.map((a) => ({
      value: a.id,
      label: a.name,
    })),
  },
  {
    id: "q7_experience",
    title: "Kinh nghiệm rèn luyện thể thao của bạn?",
    description: "Tân binh sẽ được giới hạn kèo beginner_only để đảm bảo an toàn.",
    options: [
      { value: "moi_bat_dau", label: "Mới bắt đầu (Tân binh)", subLabel: "Chưa từng tập thường xuyên" },
      { value: "duoi_6_thang", label: "Dưới 6 tháng", subLabel: "Đang hình thành thói quen" },
      { value: "6_24_thang", label: "Từ 6 đến 24 tháng", subLabel: "Đã có nền tảng thể lực cơ bản" },
      { value: "tren_24_thang", label: "Trên 24 tháng (Kỳ cựu)", subLabel: "Tập luyện kỷ luật lâu năm" },
    ],
  },
];
