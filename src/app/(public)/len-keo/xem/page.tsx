"use client";

import { BrowseKeos } from "@/components/keo/browse-keos";

/** XEM KÈO = toàn bộ kèo sắp diễn ra mà mọi người đã lên, cá nhân hoá theo bạn. */
export default function XemKeoPage() {
  return (
    <div className="px-4 pt-4 pb-28">
      <h1 className="text-[24px] font-extrabold tracking-tight text-foreground">Xem kèo</h1>
      <p className="text-[13px] text-muted-foreground mb-4">Các kèo sắp diễn ra — gần bạn và cùng đam mê được ưu tiên</p>
      <BrowseKeos />
    </div>
  );
}
