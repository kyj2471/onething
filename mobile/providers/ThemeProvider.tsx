import { ReactNode, useEffect } from "react";
import { Appearance } from "react-native";
import { useColorScheme } from "nativewind";
import { useAppStore } from "@/store/appStore";
import type { ThemeMode } from "@/constants/colors";

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { setColorScheme } = useColorScheme();
  const theme = useAppStore((s) => s.theme);
  const hydrated = useAppStore((s) => s.hydrated);

  useEffect(() => {
    if (!hydrated) return;
    applyTheme(theme, setColorScheme);
  }, [theme, hydrated, setColorScheme]);

  useEffect(() => {
    if (theme !== "system") return;
    const sub = Appearance.addChangeListener(({ colorScheme }) => {
      setColorScheme(colorScheme === "dark" ? "dark" : "light");
    });
    return () => sub.remove();
  }, [theme, setColorScheme]);

  return <>{children}</>;
}

function applyTheme(
  mode: ThemeMode,
  apply: (scheme: "light" | "dark" | "system") => void,
) {
  if (mode === "system") {
    apply(Appearance.getColorScheme() === "dark" ? "dark" : "light");
  } else {
    apply(mode);
  }
}
