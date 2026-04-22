import { ScrollView, Text, View } from "react-native";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { Button, Card } from "@/components/ui";
import { typography } from "@/constants/typography";
import { useTheme } from "@/hooks/useTheme";

export default function OnboardingWelcomeScreen() {
  const { palette } = useTheme();
  const { t } = useTranslation();

  const pillars = [
    {
      key: "goal",
      title: t("onboarding.welcome.pillars.goalTitle"),
      body: t("onboarding.welcome.pillars.goalBody"),
    },
    {
      key: "targets",
      title: t("onboarding.welcome.pillars.targetTitle"),
      body: t("onboarding.welcome.pillars.targetBody"),
    },
    {
      key: "actions",
      title: t("onboarding.welcome.pillars.actionTitle"),
      body: t("onboarding.welcome.pillars.actionBody"),
    },
  ];

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 24, gap: 20 }}>
      <View style={{ gap: 8, marginTop: 12 }}>
        <Text style={[typography.display, { color: palette.fg, fontSize: 36, lineHeight: 44 }]}>
          {t("onboarding.welcome.title")}
        </Text>
        <Text style={[typography.body, { color: palette.fgMuted }]}>
          {t("onboarding.welcome.body")}
        </Text>
      </View>

      <View style={{ gap: 12, marginTop: 12 }}>
        {pillars.map((p) => (
          <Card key={p.key}>
            <Text style={[typography.h3, { color: palette.fg }]}>{p.title}</Text>
            <Text style={[typography.bodySm, { color: palette.fgMuted, marginTop: 6 }]}>
              {p.body}
            </Text>
          </Card>
        ))}
      </View>

      <View style={{ flex: 1 }} />

      <Button
        label={t("onboarding.welcome.cta", "Start")}
        onPress={() => router.push("/(onboarding)/goal")}
      />
    </ScrollView>
  );
}
