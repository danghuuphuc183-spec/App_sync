import * as React from "react";
import { PageTransition } from "@/components/motion/page-transition";

/** Template được Next remount mỗi lần đổi route → hiệu ứng chuyển trang chạy lại. */
export default function Template({ children }: { children: React.ReactNode }) {
  return <PageTransition>{children}</PageTransition>;
}
