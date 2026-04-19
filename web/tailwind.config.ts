import type { Config } from "tailwindcss";
import { colors, fonts, heatmapColors } from "./lib/design-tokens";

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
        bg: colors.bg,
        card: colors.card,
        accent: colors.accent,
        "accent-soft": colors.accentSoft,
        progress: colors.progress,
        "progress-bg": colors.progressBg,
        muted: colors.muted,
        border: colors.border,
        check: colors.check,
        "check-bg": colors.checkBg,
        "warm-glow": colors.warmGlow,
        danger: colors.danger,
        "danger-bg": colors.dangerBg,
        "heatmap-0": heatmapColors[0],
        "heatmap-1": heatmapColors[1],
        "heatmap-2": heatmapColors[2],
        "heatmap-3": heatmapColors[3],
        "heatmap-4": heatmapColors[4],
      },
      fontFamily: {
        display: fonts.display.split(",").map((f) => f.trim().replace(/^'|'$/g, "")),
        body: fonts.body.split(",").map((f) => f.trim().replace(/^'|'$/g, "")),
        mono: fonts.mono.split(",").map((f) => f.trim().replace(/^'|'$/g, "")),
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
