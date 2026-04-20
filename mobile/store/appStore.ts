import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { Locale } from "@/lib/i18n";
import type { ThemeMode } from "@/constants/colors";

type AppState = {
  theme: ThemeMode;
  locale: Locale | null;
  hydrated: boolean;
  setTheme: (theme: ThemeMode) => void;
  setLocale: (locale: Locale) => void;
  setHydrated: (value: boolean) => void;
};

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      theme: "system",
      locale: null,
      hydrated: false,
      setTheme: (theme) => set({ theme }),
      setLocale: (locale) => set({ locale }),
      setHydrated: (value) => set({ hydrated: value }),
    }),
    {
      name: "onething-app-store",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ theme: state.theme, locale: state.locale }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    },
  ),
);
