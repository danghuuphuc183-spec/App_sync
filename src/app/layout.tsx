import type { Metadata, Viewport } from "next";
import { Barlow_Condensed, Be_Vietnam_Pro, Montserrat } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/auth-context";

const beVietnamPro = Be_Vietnam_Pro({
  subsets: ["vietnamese", "latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-be-vietnam-pro",
  display: "swap",
});

// Font tiêu đề: thay thế miễn phí, có tiếng Việt, gần với "adineue PRO Bold" trong bộ nhận diện SYNESIS
const display = Montserrat({
  subsets: ["vietnamese", "latin"],
  weight: ["600", "700", "800", "900"],
  variable: "--font-display",
  display: "swap",
});

// Font số liệu: chữ số hẹp, đậm như số trên bib chạy / bảng tỉ số (pace, km, chuỗi, EXP)
const numeric = Barlow_Condensed({
  subsets: ["vietnamese", "latin"],
  weight: ["600", "700", "800"],
  style: ["normal", "italic"],
  variable: "--font-numeric",
  display: "swap",
});

/**
 * Địa chỉ gốc của site để dựng URL tuyệt đối cho og:image / og:url (LinkedIn bắt buộc URL tuyệt đối).
 * Đặt NEXT_PUBLIC_APP_URL = tên miền thật trên Hostinger rồi build lại; thiếu thì rơi về localhost.
 */
function siteUrl(): URL {
  try {
    return new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000");
  } catch {
    return new URL("http://localhost:3000");
  }
}

const SHARE_TITLE = "Synesis — Tìm bạn tập thể thao tại TP.HCM";
const SHARE_DESCRIPTION =
  "Tìm bạn chạy bộ, gym, đạp xe hợp giờ, hợp chỗ và hợp pace. Lên kèo tập, giữ chuỗi mỗi tuần, xây uy tín bằng việc đến đúng hẹn.";

export const metadata: Metadata = {
  metadataBase: siteUrl(),
  title: "Synesis | Khế Ước Kỷ Luật Thể Thao — Kết Nối Bạn Tập & Cam Kết Uy Tín",
  applicationName: "Synesis",
  description:
    "Nền tảng kết nối người tập thể thao phong trào đô thị (chạy bộ & gym) theo mô hình khế ước kỷ luật, bảo chứng bằng Điểm Uy tín (UT).",
  keywords: ["chạy bộ", "gym", "bạn tập", "kỷ luật", "trust score", "thể thao đô thị", "bình thạnh", "thủ đức"],
  authors: [{ name: "Đội ngũ phát triển Synesis" }],
  // Thẻ xem trước khi chia sẻ link (LinkedIn đọc og:title, og:description, og:image, og:url)
  openGraph: {
    type: "website",
    siteName: "Synesis",
    locale: "vi_VN",
    url: "/",
    title: SHARE_TITLE,
    description: SHARE_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: SHARE_TITLE,
    description: SHARE_DESCRIPTION,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F6F8FC" },
    { media: "(prefers-color-scheme: dark)", color: "#070B1A" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={`${beVietnamPro.variable} ${display.variable} ${numeric.variable}`} suppressHydrationWarning>
      <head>
        {/* Giữ chế độ sáng/tối người dùng đã chọn qua các lần tải lại, áp trước khi vẽ để không nháy màu */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{if(localStorage.getItem("sync_theme")==="dark")document.documentElement.classList.add("dark")}catch(e){}`,
          }}
        />
      </head>
      <body className="min-h-screen bg-background font-sans antialiased text-foreground">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
