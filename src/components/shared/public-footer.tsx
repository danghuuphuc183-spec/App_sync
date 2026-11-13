import * as React from "react";
import Link from "next/link";
import { Shield } from "lucide-react";

export function PublicFooter() {
  return (
    <footer className="border-t border-border bg-card/60 text-muted-foreground text-xs py-8 px-4 sm:px-6">
      <div className="container max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-foreground" />
          <span className="font-semibold text-foreground">Khế Ước Kỷ Luật Thể Thao</span>
          <span>© 2026. Phát triển tại TP.HCM.</span>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 text-xs">
          <Link href="/dieu-khoan" className="hover:text-foreground transition-colors">
            Điều khoản dịch vụ
          </Link>
          <span>•</span>
          <Link href="/quyen-rieng-tu" className="hover:text-foreground transition-colors">
            Chính sách bảo vệ dữ liệu cá nhân
          </Link>
          <span>•</span>
          <span className="text-[11px] text-muted-foreground/80">
            Tuân thủ Luật BVBDCN 2026 & NĐ 356/2025/NĐ-CP (Kỹ thuật)
          </span>
        </div>
      </div>
    </footer>
  );
}
