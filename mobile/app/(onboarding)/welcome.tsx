import { ScrollView, Text, View } from "react-native";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { Button, Card } from "@/components/ui";
import { typography } from "@/constants/typography";
import { useTheme } from "@/hooks/useTheme";

const PILLARS = [
  {
    key: "goal",
    title: "Your one Goal",
    body: "Pick the single outcome that matters most right now.",
  },
  {
    key: "targets",
    title: "Measurable Targets",
    body: "Break it into 2–5 numeric targets you can track.",
  },
  {
    key: "actions",
    title: "Daily Actions",
    body: "Tiny checkboxes you tick off every day to move the needle.",
  },
] as const;

export default function OnboardingWelcomeScreen() {
  const { palette } = useTheme();
  const { t } = useTranslation();

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 24, gap: 20 }}>
      <View style={{ gap: 8, marginTop: 12 }}>
        <Text style={[typography.display, { color: palette.fg, fontSize: 36, lineHeight: 44 }]}>
          Let's set up your one thing
        </Text>
        <Text style={[typography.body, { color: palette.fgMuted }]}>
          Takes about two minutes. You can edit anything later.
        </Text>
      </View>

      <View style={{ gap: 12, marginTop: 12 }}>
        {PILLARS.map((p) => (
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
