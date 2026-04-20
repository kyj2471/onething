import { useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import { useQueryClient } from "@tanstack/react-query";
import { Button, Card } from "@/components/ui";
import { typography } from "@/constants/typography";
import { useTheme } from "@/hooks/useTheme";
import { subscriptionQueryKey } from "@/hooks/useSubscription";
import { profileQueryKey } from "@/hooks/useProfile";
import { supabase } from "@/lib/supabase";
import { TRIAL_DAYS } from "@/constants/config";

export default function OnboardingTrialScreen() {
  const { palette } = useTheme();
  const qc = useQueryClient();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const endDate = new Date();
  endDate.setDate(endDate.getDate() + TRIAL_DAYS);

  const finish = async (startTrial: boolean) => {
    setError(null);
    setSubmitting(true);
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id;
    if (!userId) {
      setSubmitting(false);
      setError("Not signed in");
      return;
    }

    if (startTrial) {
      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          subscription_status: "trial",
          trial_ends_at: endDate.toISOString(),
        })
        .eq("id", userId);
      if (updateError) {
        setSubmitting(false);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
        setError(updateError.message);
        return;
      }
      await Promise.all([
        qc.invalidateQueries({ queryKey: subscriptionQueryKey(userId) }),
        qc.invalidateQueries({ queryKey: profileQueryKey(userId) }),
      ]);
    }
    setSubmitting(false);

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    router.replace("/(app)/today");
  };

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 24, gap: 20 }}>
      <View style={{ gap: 8, marginTop: 4 }}>
        <Text style={[typography.display, { color: palette.fg, fontSize: 32, lineHeight: 40 }]}>
          14-day free trial
        </Text>
        <Text style={[typography.body, { color: palette.fgMuted }]}>
          Full access. Cancel anytime before {endDate.toLocaleDateString()}.
        </Text>
      </View>

      <Card>
        <Text style={[typography.h3, { color: palette.fg }]}>What's included</Text>
        <View style={{ gap: 6, marginTop: 10 }}>
          {[
            "One goal with up to 5 targets",
            "Daily actions and streak tracking",
            "Yearly heatmap and progress stats",
            "Cross-device sync",
            "Dark mode",
          ].map((item) => (
            <Text key={item} style={[typography.bodySm, { color: palette.fgMuted }]}>
              · {item}
            </Text>
          ))}
        </View>
      </Card>

      {error ? (
        <Text style={[typography.bodySm, { color: palette.danger }]}>{error}</Text>
      ) : null}

      <View style={{ flex: 1 }} />

      <View style={{ gap: 10 }}>
        <Button
          label={submitting ? "Starting..." : "Start 14-day trial"}
          onPress={() => finish(true)}
          loading={submitting}
        />
        <Button
          label="Maybe later"
          variant="ghost"
          onPress={() => finish(false)}
          disabled={submitting}
        />
      </View>
    </ScrollView>
  );
}
