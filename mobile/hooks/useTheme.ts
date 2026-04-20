import { useColorScheme } from "nativewind";
import { darkColors, lightColors } from "@/constants/colors";

export type Palette = typeof lightColors | typeof darkColors;

export function useTheme(): { palette: Palette; isDark: boolean } {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  return { palette: isDark ? darkColors : lightColors, isDark };
}
