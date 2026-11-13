import { redirect } from "next/navigation";

/** Xem kèo đã gộp vào trang Lên kèo (D31). Giữ đường dẫn cũ để link cũ không hỏng. */
export default function XemKeoPage() {
  redirect("/len-keo");
}
