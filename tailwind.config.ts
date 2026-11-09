import type { Config } from "tailwindcss";

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
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [],
};

export default config;
