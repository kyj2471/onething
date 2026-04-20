export const lightColors = {
  bg: "#f9f8f4",
  surface: "#ffffff",
  surfaceMuted: "#f3f1ec",
  surfaceElevated: "#ffffff",

  fg: "#111111",
  fgMuted: "#6e6b66",
  fgSubtle: "#a8a49c",
  fgInverse: "#ffffff",

  border: "#e8e6df",
  borderStrong: "#d8d4ca",

  accent: "#111111",
  accentHover: "#2a2a2a",
  accentSubtle: "#f3f1ec",

  brand: "#d9f24a",
  brandStrong: "#b5cc2e",
  brandBg: "#f5fadc",
  brandFg: "#3f4f00",
  onBrand: "#1a2200",

  success: "#3f9b56",
  successBg: "#e8f5ec",
  warning: "#c7821a",
  warningBg: "#fbf1dc",
  danger: "#c6321a",
  dangerBg: "#fbeeea",

  heatmap: ["#f0eee6", "#ecf2c8", "#e0ed9a", "#d1e368", "#b5cc2e"] as const,
} as const;

export const darkColors = {
  bg: "#0e0e0c",
  surface: "#161613",
  surfaceMuted: "#1f1f1b",
  surfaceElevated: "#1a1a17",

  fg: "#f2f1ed",
  fgMuted: "#a8a49c",
  fgSubtle: "#6e6b66",
  fgInverse: "#111111",

  border: "#2a2925",
  borderStrong: "#3a3933",

  accent: "#f2f1ed",
  accentHover: "#e2e0da",
  accentSubtle: "#1f1f1b",

  brand: "#d9f24a",
  brandStrong: "#c1dc39",
  brandBg: "#2a2e15",
  brandFg: "#d9f24a",
  onBrand: "#1a2200",

  success: "#4fb56a",
  successBg: "#1c2c1e",
  warning: "#e0a23a",
  warningBg: "#332510",
  danger: "#e6634f",
  dangerBg: "#331815",

  heatmap: ["#1f1f1b", "#2b3219", "#475524", "#7a9232", "#c1dc39"] as const,
} as const;

export type ThemeColors = typeof lightColors;
export type ThemeMode = "light" | "dark" | "system";
