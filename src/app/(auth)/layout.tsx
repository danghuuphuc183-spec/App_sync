import * as React from "react";
import Link from "next/link";
import { Shield } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col justify-between bg-muted/20 px-4 py-8">
      <div className="flex justify-center">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <Shield className="h-5 w-5 stroke-[2.5]" />
          </div>
          <span className="font-extrabold text-foreground tracking-tight">
            Khế Ước Thể Thao
          </span>
        </Link>
      </div>

      <div className="flex justify-center items-center my-auto">
        <div className="w-full max-w-md">{children}</div>
      </div>

      <p className="text-center text-xs text-muted-foreground">
        © 2026 Khế Ước Kỷ Luật Thể Thao • Bảo mật theo Luật BVBDCN 2026
      </p>
    </div>
  );
}
