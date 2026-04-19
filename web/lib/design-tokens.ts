/**
 * Semantic tiered tokens. Values are CSS custom properties declared in
 * `app/globals.css` for light and dark themes. Tailwind reads them via
 * `var(--...)` so all components stay theme-agnostic.
 */

export const colorVars = {
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
} as const;

export const fontVars = {
  display: "var(--font-display)",
  body: "var(--font-body)",
  mono: "var(--font-mono)",
} as const;

export const radius = {
  sm: "6px",
  md: "10px",
  lg: "14px",
  xl: "20px",
  full: "9999px",
} as const;

export const shadow = {
  sm: "0 1px 2px rgba(17,17,17,.04)",
  md: "0 2px 8px rgba(17,17,17,.06), 0 1px 2px rgba(17,17,17,.04)",
  lg: "0 10px 30px rgba(17,17,17,.08), 0 4px 10px rgba(17,17,17,.05)",
} as const;

/** Heatmap palette keyed by intensity level (0–4). Values are CSS var refs so
 * they re-theme with light/dark. Components consume via inline `style`. */
export const heatmapColors = [
  "var(--heatmap-0)",
  "var(--heatmap-1)",
  "var(--heatmap-2)",
  "var(--heatmap-3)",
  "var(--heatmap-4)",
] as const;
