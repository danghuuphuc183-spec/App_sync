import * as React from "react";

/** Màn đăng nhập & thiết lập ban đầu: toàn màn hình, không header/thanh điều hướng */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-dvh">{children}</div>;
}
