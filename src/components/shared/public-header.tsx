import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Shield, Flame, Activity } from "lucide-react";

export function PublicHeader() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/70 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="container flex h-16 items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5 font-bold text-lg text-foreground">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <Shield className="h-5 w-5 stroke-[2.5]" />
          </div>
          <div className="flex flex-col">
            <span className="leading-none text-base tracking-tight font-extrabold">
              Khế Ước Thể Thao
            </span>
            <span className="text-[10px] text-muted-foreground font-normal tracking-wide">
              Kỷ luật đô thị
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <Link
            href="/mon-the-thao"
            className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
          >
            <Activity className="h-4 w-4" />
            <span>Môn thể thao</span>
          </Link>
          <Link
            href="/bang-keo"
            className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
          >
            <Flame className="h-4 w-4 text-amber-500" />
            <span>Bảng kèo</span>
          </Link>
          <Link
            href="/design-system"
            className="text-muted-foreground hover:text-foreground transition-colors text-xs border border-border px-2 py-1 rounded"
          >
            Design System (Dev)
          </Link>
        </nav>

        {/* Auth action */}
        <div className="flex items-center gap-2.5">
          <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
            <Link href="/dang-nhap">Đăng nhập</Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/dang-nhap">Bắt đầu ngay</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
