import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Cho phép chạy nhiều dev server trong cùng thư mục mà không ghi đè build của nhau
  distDir: process.env.NEXT_DIST_DIR || ".next",
  // Cho phép mở bản dev từ điện thoại cùng mạng Wi-Fi (http://192.168.x.x:port)
  allowedDevOrigins: ["192.168.*.*", "10.*.*.*", "*.local"],
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === "production" ? { exclude: ["error"] } : false,
  },
};

export default nextConfig;
