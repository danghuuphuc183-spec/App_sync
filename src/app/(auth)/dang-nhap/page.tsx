"use client";

import * as React from "react";
import { IntroAnimation } from "@/components/auth/intro-animation";
import { AuthFlow } from "@/components/auth/auth-flow";

/** Màn đăng nhập: hiệu ứng mở đầu → chào mừng → Google / Số điện thoại */
export default function AuthPage() {
  const [introDone, setIntroDone] = React.useState(false);
  return (
    <>
      <AuthFlow />
      {!introDone && <IntroAnimation onDone={() => setIntroDone(true)} />}
    </>
  );
}
