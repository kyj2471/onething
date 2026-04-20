import "../global.css";
import { useEffect } from "react";
import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import {
  useFonts,
  InstrumentSerif_400Regular_Italic,
} from "@expo-google-fonts/instrument-serif";
import { JetBrainsMono_400Regular } from "@expo-google-fonts/jetbrains-mono";
import { QueryProvider } from "@/providers/QueryProvider";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { RevenueCatProvider } from "@/providers/RevenueCatProvider";
import { NotificationProvider } from "@/providers/NotificationProvider";
import { useAppStore } from "@/store/appStore";
import { initI18n } from "@/lib/i18n";

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    InstrumentSerif: InstrumentSerif_400Regular_Italic,
    JetBrainsMono: JetBrainsMono_400Regular,
  });

  const hydrated = useAppStore((s) => s.hydrated);
  const locale = useAppStore((s) => s.locale);

  useEffect(() => {
    initI18n(locale ?? undefined);
  }, [locale]);

  useEffect(() => {
    if ((fontsLoaded || fontError) && hydrated) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsLoaded, fontError, hydrated]);

  if ((!fontsLoaded && !fontError) || !hydrated) return null;

  return (
    <SafeAreaProvider>
      <QueryProvider>
        <ThemeProvider>
          <RevenueCatProvider>
            <NotificationProvider>
              <StatusBar style="auto" />
              <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="index" />
                <Stack.Screen name="modals" options={{ presentation: "modal" }} />
              </Stack>
            </NotificationProvider>
          </RevenueCatProvider>
        </ThemeProvider>
      </QueryProvider>
    </SafeAreaProvider>
  );
}
