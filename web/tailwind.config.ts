import type { Config } from "tailwindcss";
import { colorVars, fontVars, radius, shadow } from "./lib/design-tokens";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: ["class"],
  theme: {
    extend: {
      colors: {
        ...colorVars,
        // Back-compat aliases — remove after Phase D migration.
        card: colorVars.surface,
        "accent-soft": colorVars["accent-hover"],
        progress: colorVars.brand,
        "progress-bg": colorVars["surface-muted"],
        muted: colorVars["fg-muted"],
        check: colorVars.success,
        "check-bg": colorVars["success-bg"],
        "warm-glow": colorVars["brand-bg"],
      },
      fontFamily: {
        display: [fontVars.display, "Georgia", "serif"],
        body: [fontVars.body, "Pretendard Variable", "system-ui", "sans-serif"],
        mono: [fontVars.mono, "ui-monospace", "monospace"],
        sans: [fontVars.body, "Pretendard Variable", "system-ui", "sans-serif"],
      },
      fontSize: {
        display: ["32px", { lineHeight: "40px", letterSpacing: "-0.01em" }],
        h1: ["24px", { lineHeight: "32px", letterSpacing: "-0.01em", fontWeight: "600" }],
        h2: ["18px", { lineHeight: "26px", letterSpacing: "-0.005em", fontWeight: "600" }],
        h3: ["16px", { lineHeight: "24px", fontWeight: "600" }],
        body: ["15px", { lineHeight: "22px" }],
        "body-sm": ["14px", { lineHeight: "20px" }],
        caption: ["12px", { lineHeight: "16px", letterSpacing: "0.02em", fontWeight: "500" }],
        mono: ["13px", { lineHeight: "18px" }],
      },
      borderRadius: {
        sm: radius.sm,
        md: radius.md,
        lg: radius.lg,
        xl: radius.xl,
        full: radius.full,
      },
      boxShadow: {
        sm: shadow.sm,
        md: shadow.md,
        lg: shadow.lg,
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
