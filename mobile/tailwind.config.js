/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./providers/**/*.{ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        bg: "var(--bg)",
        surface: "var(--surface)",
        "surface-muted": "var(--surface-muted)",
        "surface-elevated": "var(--surface-elevated)",

        fg: "var(--fg)",
        "fg-muted": "var(--fg-muted)",
        "fg-subtle": "var(--fg-subtle)",
        "fg-inverse": "var(--fg-inverse)",

        border: "var(--border)",
        "border-strong": "var(--border-strong)",

        accent: "var(--accent)",
        "accent-hover": "var(--accent-hover)",
        "accent-subtle": "var(--accent-subtle)",

        brand: "var(--brand)",
        "brand-strong": "var(--brand-strong)",
        "brand-bg": "var(--brand-bg)",
        "brand-fg": "var(--brand-fg)",
        "on-brand": "var(--on-brand)",

        success: "var(--success)",
        "success-bg": "var(--success-bg)",
        warning: "var(--warning)",
        "warning-bg": "var(--warning-bg)",
        danger: "var(--danger)",
        "danger-bg": "var(--danger-bg)",

        "heatmap-0": "var(--heatmap-0)",
        "heatmap-1": "var(--heatmap-1)",
        "heatmap-2": "var(--heatmap-2)",
        "heatmap-3": "var(--heatmap-3)",
        "heatmap-4": "var(--heatmap-4)",
      },
      fontFamily: {
        display: ["InstrumentSerif", "serif"],
        mono: ["JetBrainsMono", "monospace"],
        body: ["Pretendard", "system-ui"],
      },
      borderRadius: {
        sm: "6px",
        md: "10px",
        lg: "14px",
        xl: "20px",
      },
      boxShadow: {
        sm: "0 1px 2px rgba(17,17,17,.04)",
        md: "0 2px 8px rgba(17,17,17,.06), 0 1px 2px rgba(17,17,17,.04)",
        lg: "0 10px 30px rgba(17,17,17,.08), 0 4px 10px rgba(17,17,17,.05)",
      },
    },
  },
  plugins: [],
};
