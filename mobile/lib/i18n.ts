import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { getLocales } from "expo-localization";
import en from "@/messages/en.json";
import ko from "@/messages/ko.json";

export const SUPPORTED_LOCALES = ["en", "ko"] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";

function detectDeviceLocale(): Locale {
  const code = getLocales()[0]?.languageCode ?? "en";
  return (SUPPORTED_LOCALES as readonly string[]).includes(code)
    ? (code as Locale)
    : DEFAULT_LOCALE;
}

export function initI18n(preferred?: Locale) {
  if (i18n.isInitialized) {
    if (preferred && preferred !== i18n.language) {
      i18n.changeLanguage(preferred);
    }
    return i18n;
  }

  i18n
    .use(initReactI18next)
    .init({
      resources: {
        en: { translation: en },
        ko: { translation: ko },
      },
      lng: preferred ?? detectDeviceLocale(),
      fallbackLng: DEFAULT_LOCALE,
      interpolation: { escapeValue: false },
      returnNull: false,
      compatibilityJSON: "v4",
    });

  return i18n;
}

export { i18n };
