import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { Button, Logo } from "@/components/ui";
import { typography } from "@/constants/typography";
import { useTheme } from "@/hooks/useTheme";

export default function WelcomeScreen() {
  const { palette } = useTheme();
  const { t } = useTranslation();

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: palette.bg }}
      edges={["top", "bottom"]}
    >
      <View style={{ flex: 1, paddingHorizontal: 24, paddingVertical: 32 }}>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", gap: 20 }}>
          <Logo size={72} />
          <Text
            style={[
              typography.display,
              { color: palette.fg, fontSize: 52, lineHeight: 60, textAlign: "center" },
            ]}
          >
            {t("landing.hero.title", "One goal. Every day.")}
          </Text>
          <Text
            style={[
              typography.body,
              {
                color: palette.fgMuted,
                textAlign: "center",
                fontSize: 17,
                lineHeight: 26,
                maxWidth: 320,
              },
            ]}
          >
            {t(
              "landing.hero.tagline",
              "OneThing keeps you locked on the single thing that matters most.",
            )}
          </Text>
        </View>

        <View style={{ gap: 12 }}>
          <Button
            label={t("landing.nav.signup", "Sign up")}
            onPress={() => router.push("/(auth)/signup")}
          />
          <Button
            label={t("landing.nav.login", "Log in")}
            variant="secondary"
            onPress={() => router.push("/(auth)/login")}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}
