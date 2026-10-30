import type { Metadata, Viewport } from "next";
import { Be_Vietnam_Pro } from "next/font/google";
import "./globals.css";

const beVietnamPro = Be_Vietnam_Pro({
  subsets: ["vietnamese", "latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-be-vietnam-pro",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Khế Ước Kỷ Luật Thể Thao | Nền Tảng Kết Nối Bạn Tập & Cam Kết Uy Tín",
  description:
    "Nền tảng kết nối người tập thể thao phong trào đô thị (chạy bộ & gym) theo mô hình khế ước kỷ luật, bảo chứng bằng Điểm Uy Tín (Trust Score).",
  keywords: ["chạy bộ", "gym", "bạn tập", "kỷ luật", "trust score", "thể thao đô thị", "bình thạnh", "thủ đức"],
  authors: [{ name: "Đội ngũ phát triển Khế Ước Thể Thao" }],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#059669",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={beVietnamPro.variable}>
      <body className="min-h-screen bg-background font-sans antialiased text-foreground">
        {children}
      </body>
    </html>
  );
}
