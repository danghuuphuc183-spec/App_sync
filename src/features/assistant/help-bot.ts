/**
 * Trợ lý AI hỗ trợ sử dụng app (bản offline, dựa trên ý định + từ khoá).
 * Có thể thay `answerHelpQuestion` bằng một API LLM sau này mà không đổi giao diện.
 */

export interface HelpAnswer {
  text: string;
  link?: { href: string; label: string };
}

interface HelpIntent {
  id: string;
  keywords: string[];
  answer: HelpAnswer;
}

export function normalizeVi(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .replace(/\s+/g, " ")
    .trim();
}

const INTENTS: HelpIntent[] = [
  {
    id: "streak",
    keywords: ["chuoi", "streak", "giu chuoi", "lien tiep", "tuan"],
    answer: {
      text: "Chuỗi được tính theo TUẦN: chỉ cần ghi ít nhất 1 hoạt động mỗi tuần (Thứ Hai → Chủ Nhật) là giữ được chuỗi. Nếu tuần này chưa tập, chuỗi vẫn còn đến hết Chủ Nhật — bấm “Ghi ngay” trên trang chủ để giữ chuỗi.",
    },
  },
  {
    id: "create",
    keywords: ["tao keo", "len keo", "hen tap", "tao lich", "dat keo"],
    answer: {
      text: "Bấm nút “Lên Kèo” ở giữa thanh điều hướng dưới cùng, chọn môn, thời gian và địa điểm. Bạn tập phù hợp sẽ nhận kèo và hai bên check-in khi gặp nhau.",
      link: { href: "/len-keo", label: "Mở Lên Kèo" },
    },
  },
  {
    id: "follow",
    keywords: ["theo doi", "follow", "goi y", "ban be", "ket ban"],
    answer: {
      text: "Mục “Nên theo dõi” gợi ý người nổi tiếng và những người có điểm chung với bạn (cùng môn, gần nhà, cùng trình độ, có bạn chung). Bấm “Theo dõi” để xem hoạt động của họ, hoặc “Xóa” để ẩn gợi ý.",
    },
  },
  {
    id: "trust",
    keywords: ["ts", "trust", "trustscore", "trust score", "uy tin", "coc", "diem"],
    answer: {
      text: "Điểm Uy tín (UT) theo thang 0–10, ai cũng bắt đầu ở 7. Đúng hẹn +0,5 UT. Sau khi chốt kèo: huỷ sớm −0,25, huỷ trong 30 phút −0,5, đến trễ 15–25 phút −0,25, vắng có báo −1, vắng im lặng −1,5. Hai bạn cùng đồng ý huỷ thì không bị trừ (4 lần/tháng).",
      link: { href: "/vi-uy-tin", label: "Xem ví uy tín" },
    },
  },
  {
    id: "group",
    keywords: ["nhom", "clb", "cau lac bo", "club"],
    answer: {
      text: "Vào tab “Nhóm” để tìm câu lạc bộ theo môn và khu vực, tham gia buổi tập chung hoặc tạo nhóm riêng.",
      link: { href: "/cau-lac-bo", label: "Mở Nhóm" },
    },
  },
  {
    id: "map",
    keywords: ["ban do", "map", "dia diem", "san", "cung duong", "gan toi"],
    answer: {
      text: "Tab “Bản Đồ” hiển thị sân, phòng gym và cung đường chạy gần bạn, kèm các kèo đang mở trong khu vực.",
      link: { href: "/ban-do", label: "Mở Bản Đồ" },
    },
  },
  {
    id: "chat",
    keywords: ["chat", "nhan tin", "tin nhan", "inbox"],
    answer: {
      text: "Bấm biểu tượng tin nhắn trên thanh trên cùng để mở hộp thư với bạn tập và nhóm.",
      link: { href: "/chat", label: "Mở tin nhắn" },
    },
  },
  {
    id: "connect",
    keywords: ["strava", "garmin", "apple health", "dong bo", "ket noi", "dong ho"],
    answer: {
      text: "Vào Hồ sơ → Kết nối ứng dụng để đồng bộ Strava, Garmin, Apple Health… Hoạt động đồng bộ về sẽ tự động được tính vào chuỗi tuần.",
      link: { href: "/ho-so", label: "Mở Hồ sơ" },
    },
  },
  {
    id: "privacy",
    keywords: ["rieng tu", "an vi tri", "ghost", "bao mat", "privacy"],
    answer: {
      text: "Bạn có thể bật Ghost Mode hoặc vùng riêng tư trong Hồ sơ → Quyền riêng tư để ẩn vị trí bắt đầu/kết thúc buổi tập.",
      link: { href: "/ho-so", label: "Cài đặt riêng tư" },
    },
  },
  {
    id: "sport",
    keywords: ["chon mon", "mon nao", "phu hop", "goi y mon", "khao sat"],
    answer: {
      text: "Làm bài khảo sát ngắn để AI gợi ý môn thể thao và lộ trình phù hợp với mục tiêu, thời gian và thể trạng của bạn.",
      link: { href: "/chon-mon", label: "Làm khảo sát" },
    },
  },
];

export const HELP_SUGGESTIONS = [
  "Chuỗi tuần tính thế nào?",
  "Làm sao tạo kèo tập?",
  "Điểm Uy tín (UT) là gì?",
  "Kết nối Strava/Garmin",
];

const FALLBACK: HelpAnswer = {
  text: "Mình chưa hiểu rõ câu hỏi. Bạn có thể hỏi về: chuỗi tuần, tạo kèo, Điểm Uy tín, nhóm/CLB, bản đồ, tin nhắn, kết nối Strava/Garmin hoặc quyền riêng tư.",
};

export function answerHelpQuestion(question: string): HelpAnswer {
  const normalized = normalizeVi(question);
  if (!normalized) return FALLBACK;
  // So khớp theo ranh giới từ ("ts" không khớp nhầm bên trong từ khác).
  const q = ` ${normalized.replace(/[^a-z0-9 ]/g, " ").replace(/\s+/g, " ")} `;

  let best: HelpIntent | null = null;
  let bestScore = 0;
  for (const intent of INTENTS) {
    // Từ khoá dài (nhiều từ) có trọng số cao hơn để tránh nhầm lẫn.
    const score = intent.keywords.reduce(
      (sum, kw) => (q.includes(` ${kw} `) ? sum + kw.split(" ").length : sum),
      0
    );
    if (score > bestScore) {
      best = intent;
      bestScore = score;
    }
  }
  return best ? best.answer : FALLBACK;
}
