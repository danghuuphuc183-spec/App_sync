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
        <Link href="/" className="flex items-center gap-2.5 font-bold text-lg group">
          <img
            src="/logo-icon-128.png"
            alt="SYNESIS Logo"
            className="h-9 w-9 rounded-xl object-contain shadow-xs group-hover:scale-105 transition-transform"
          />
          <div className="flex flex-col text-left">
            <span className="font-extrabold text-foreground text-sm tracking-tight leading-none uppercase font-mono">
              SYNC SPORT
            </span>
            <span className="text-[8px] font-extrabold text-sky-600 dark:text-sky-400 tracking-[0.16em] uppercase leading-none mt-1">
              SYN≡SIS
            </span>
          </div>
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
