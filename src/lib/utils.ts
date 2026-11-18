import { type ClassValue, clsx } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/**
 * tailwind-merge phải biết các token tự định nghĩa trong tailwind.config.ts.
 * Nếu không, `text-micro` bị hiểu nhầm là MÀU chữ và bị xoá khi đi cùng `text-neutral-500`;
 * `shadow-glow` bị hiểu là màu bóng và bị xoá khi đi cùng `shadow-blue-500/25`.
 */
const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      text: ["micro", "caption", "label", "body", "title", "stat", "hero"],
      shadow: ["lift", "glow", "glow-lg", "inner-hi"],
      font: ["numeric", "display"],
      ease: ["spring", "out-expo", "in-quart"],
    },
  },
});

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
