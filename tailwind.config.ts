import type { Config } from "tailwindcss";
import plugin from "tailwindcss/plugin";

/**
 * Tiện ích chuyển động vào/ra (tương thích cú pháp tailwindcss-animate: animate-in, fade-in,
 * zoom-in-95, slide-in-from-bottom-2, duration-200…). Viết nội bộ thay vì thêm dependency
 * (quy tắc dự án #25). Trước đây ~110 lượt dùng các class này không sinh ra CSS nào.
 */
/** Kiểu tối thiểu của hàm tra theme trong cấu hình plugin (Tailwind không export PluginUtils). */
type ThemeLookup = { theme: (path: string) => Record<string, string> };

const enterExit = plugin(
  ({ addUtilities, matchUtilities, theme }) => {
    addUtilities({
      ".animate-in": {
        animationName: "enter",
        animationDuration: theme("animationDuration.DEFAULT"),
        animationTimingFunction: "var(--ease-out-expo)",
        "--tw-enter-opacity": "initial",
        "--tw-enter-scale": "initial",
        "--tw-enter-translate-x": "initial",
        "--tw-enter-translate-y": "initial",
      },
      ".animate-out": {
        animationName: "exit",
        animationDuration: theme("animationDuration.DEFAULT"),
        animationTimingFunction: "var(--ease-in-quart)",
        animationFillMode: "forwards",
        "--tw-exit-opacity": "initial",
        "--tw-exit-scale": "initial",
        "--tw-exit-translate-x": "initial",
        "--tw-exit-translate-y": "initial",
      },
    });
    matchUtilities(
      {
        "fade-in": (v) => ({ "--tw-enter-opacity": v }),
        "fade-out": (v) => ({ "--tw-exit-opacity": v }),
      },
      { values: theme("animationOpacity") }
    );
    matchUtilities(
      {
        "zoom-in": (v) => ({ "--tw-enter-scale": v }),
        "zoom-out": (v) => ({ "--tw-exit-scale": v }),
      },
      { values: theme("animationScale") }
    );
    matchUtilities(
      {
        "slide-in-from-top": (v) => ({ "--tw-enter-translate-y": `-${v}` }),
        "slide-in-from-bottom": (v) => ({ "--tw-enter-translate-y": v }),
        "slide-in-from-left": (v) => ({ "--tw-enter-translate-x": `-${v}` }),
        "slide-in-from-right": (v) => ({ "--tw-enter-translate-x": v }),
        "slide-out-to-top": (v) => ({ "--tw-exit-translate-y": `-${v}` }),
        "slide-out-to-bottom": (v) => ({ "--tw-exit-translate-y": v }),
        "slide-out-to-left": (v) => ({ "--tw-exit-translate-x": `-${v}` }),
        "slide-out-to-right": (v) => ({ "--tw-exit-translate-x": v }),
      },
      { values: theme("animationTranslate") }
    );
    // `duration-*` / `delay-*` áp cho cả transition (lõi Tailwind) lẫn animation
    matchUtilities(
      { duration: (v) => ({ animationDuration: v }) },
      { values: theme("animationDurationValues") }
    );
    matchUtilities(
      { delay: (v) => ({ animationDelay: v }) },
      { values: theme("transitionDelay") }
    );
  },
  {
    theme: {
      animationDuration: { DEFAULT: "220ms" },
      animationOpacity: ({ theme }: ThemeLookup) => ({ DEFAULT: "0", ...theme("opacity") }),
      animationScale: ({ theme }: ThemeLookup) => ({ DEFAULT: "0", ...theme("scale") }),
      animationTranslate: ({ theme }: ThemeLookup) => ({ DEFAULT: "100%", ...theme("translate") }),
      animationDurationValues: ({ theme }: ThemeLookup) => {
        // bỏ khoá DEFAULT để không sinh class `duration-DEFAULT`
        const { DEFAULT: _unused, ...rest } = theme("transitionDuration");
        void _unused;
        return rest;
      },
    },
  }
);

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/features/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "1rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))",
        },
        // SYNESIS Brand Identity — #0567E1 (Royal Blue), #39A1F4 (Sky Blue), #FFFFFF, #000000
        brand: {
          DEFAULT: "#0567E1",
          sky: "#39A1F4",
          50: "#EEF6FE",
          100: "#D8EBFD",
          200: "#B6DAFB",
          300: "#82C0F8",
          400: "#39A1F4",
          500: "#1A84EC",
          600: "#0567E1",
          700: "#0452B4",
          800: "#07448F",
          900: "#0A3A74",
          950: "#072447",
          // Dải "Electric Blue" (tham chiếu docs/design + Bộ màu mới): dùng cho gradient & phát sáng
          deep: "#0B2CB1",
          volt: "#1951FC",
          glow: "#3781FC",
          mist: "#CBE9FD",
          ink: "#070B1A",
        },
        ink: {
          DEFAULT: "#070B1A",
          900: "#0B1124",
          800: "#121A33",
          700: "#1B2645",
        },
        // 4 hạng thể thao theo quy tắc nghiệp vụ TS
        tier: {
          bronze: {
            DEFAULT: "hsl(var(--tier-bronze))",
            foreground: "hsl(var(--tier-bronze-foreground))",
          },
          silver: {
            DEFAULT: "hsl(var(--tier-silver))",
            foreground: "hsl(var(--tier-silver-foreground))",
          },
          gold: {
            DEFAULT: "hsl(var(--tier-gold))",
            foreground: "hsl(var(--tier-gold-foreground))",
          },
          diamond: {
            DEFAULT: "hsl(var(--tier-diamond))",
            foreground: "hsl(var(--tier-diamond-foreground))",
          },
        },
      },
      fontFamily: {
        sans: ["var(--font-be-vietnam-pro)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "var(--font-be-vietnam-pro)", "system-ui", "sans-serif"],
        // Số liệu thể thao (pace, km, chuỗi, EXP): kiểu số trên bib/bảng tỉ số
        numeric: ["var(--font-numeric)", "var(--font-be-vietnam-pro)", "system-ui", "sans-serif"],
      },
      // Thang cỡ chữ có tên — thay cho 14 cỡ tuỳ ý (gồm cả nửa pixel) rải rác
      fontSize: {
        micro: ["10px", { lineHeight: "14px", letterSpacing: "0.01em" }],
        caption: ["11px", { lineHeight: "15px" }],
        label: ["13px", { lineHeight: "18px" }],
        body: ["15px", { lineHeight: "22px" }],
        title: ["26px", { lineHeight: "30px", letterSpacing: "-0.025em", fontWeight: "800" }],
        stat: ["32px", { lineHeight: "32px", letterSpacing: "-0.01em" }],
        hero: ["56px", { lineHeight: "52px", letterSpacing: "-0.02em" }],
      },
      // Bóng đổ nhuốm màu mực (ink) thay vì đen thuần; xs/2xs trước đây là class Tailwind v4 không tồn tại ở v3
      boxShadow: {
        "2xs": "0 1px 1px 0 rgb(7 11 26 / 0.04)",
        xs: "0 1px 2px 0 rgb(7 11 26 / 0.06), 0 1px 1px 0 rgb(7 11 26 / 0.03)",
        sm: "0 2px 6px -1px rgb(7 11 26 / 0.07), 0 1px 2px 0 rgb(7 11 26 / 0.04)",
        md: "0 8px 20px -6px rgb(7 11 26 / 0.12), 0 2px 6px -2px rgb(7 11 26 / 0.06)",
        lift: "0 14px 32px -12px rgb(7 11 26 / 0.18), 0 4px 10px -4px rgb(7 11 26 / 0.08)",
        glow: "0 8px 22px -8px rgb(25 81 252 / 0.55), 0 2px 6px -2px rgb(11 44 177 / 0.35)",
        "glow-lg": "0 16px 40px -12px rgb(25 81 252 / 0.6), 0 0 0 1px rgb(55 129 252 / 0.25)",
        "inner-hi": "inset 0 1px 0 0 rgb(255 255 255 / 0.22)",
      },
      transitionTimingFunction: {
        spring: "cubic-bezier(0.34, 1.56, 0.64, 1)",
        "out-expo": "cubic-bezier(0.16, 1, 0.3, 1)",
        "in-quart": "cubic-bezier(0.5, 0, 0.75, 0)",
      },
      // keyframes enter/exit/shimmer/icon-pop/glow-breathe khai báo trong globals.css
      animation: {
        shimmer: "shimmer 1.6s linear infinite",
        "icon-pop": "icon-pop 420ms var(--ease-spring)",
        "glow-breathe": "glow-breathe 3.2s ease-in-out infinite",
      },
      // Bo góc mức vừa: thu nhỏ toàn bộ thang để giao diện gọn, không quá tròn
      borderRadius: {
        "3xl": "1rem", // 16px (mặc định 24px)
        "2xl": "0.75rem", // 12px (mặc định 16px)
        xl: "0.625rem", // 10px (mặc định 12px)
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xs: "0.125rem", // trước đây `rounded-xs` (cú pháp v4) không sinh CSS
      },
    },
  },
  plugins: [enterExit],
};

export default config;
