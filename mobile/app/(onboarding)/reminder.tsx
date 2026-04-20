import { useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import { useQueryClient } from "@tanstack/react-query";
import { Button, Input } from "@/components/ui";
import { typography } from "@/constants/typography";
import { useTheme } from "@/hooks/useTheme";
import { profileQueryKey } from "@/hooks/useProfile";
import { supabase } from "@/lib/supabase";
import { ensureNotificationPermissions } from "@/lib/notifications";

const TIME_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/;

export default function OnboardingReminderScreen() {
  const { palette } = useTheme();
  const qc = useQueryClient();
  const [time, setTime] = useState("09:00");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async () => {
    setError(null);
    if (!TIME_REGEX.test(time)) {
      setError("Use HH:mm (e.g., 09:00)");
      return;
    }
    setSubmitting(true);

    await ensureNotificationPermissions();

    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id;
    if (!userId) {
      setSubmitting(false);
      setError("Not signed in");
      return;
    }

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ reminder_time: `${time}:00` })
      .eq("id", userId);

    setSubmitting(false);
    if (updateError) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
      setError(updateError.message);
      return;
    }
    qc.invalidateQueries({ queryKey: profileQueryKey(userId) });

    router.push("/(onboarding)/trial");
  };

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 24, gap: 20 }}>
      <View style={{ gap: 8, marginTop: 4 }}>
        <Text style={[typography.display, { color: palette.fg, fontSize: 32, lineHeight: 40 }]}>
          Daily reminder
        </Text>
        <Text style={[typography.body, { color: palette.fgMuted }]}>
          We'll nudge you once a day so you don't break your streak.
        </Text>
      </View>

      <Input
        label="Time (24h)"
        value={time}
        onChangeText={setTime}
        placeholder="09:00"
        keyboardType="numbers-and-punctuation"
        autoCapitalize="none"
        error={error ?? undefined}
      />

      <View style={{ flex: 1 }} />

      <Button
        label={submitting ? "Saving..." : "Next"}
        onPress={onSubmit}
        loading={submitting}
      />
    </ScrollView>
  );
}
