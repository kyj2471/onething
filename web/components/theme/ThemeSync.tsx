"use client";

import { useEffect } from "react";

/**
 * Syncs `html.dark` with the OS preference when the user's stored theme is
 * "system". Inert for explicit "light"/"dark" choices.
 */
export function ThemeSync() {
  useEffect(() => {
    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    const apply = () => {
      const theme = document.documentElement.dataset.theme ?? "system";
      if (theme !== "system") return;
      document.documentElement.classList.toggle("dark", mql.matches);
    };
    apply();
    mql.addEventListener("change", apply);
    return () => mql.removeEventListener("change", apply);
  }, []);
  return null;
}
