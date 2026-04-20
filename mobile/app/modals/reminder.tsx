import { useState } from "react";
import { Text } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { ModalShell } from "@/components/layout/ModalShell";
import { Button, Input } from "@/components/ui";
import { typography } from "@/constants/typography";
import { useTheme } from "@/hooks/useTheme";
import { useSession } from "@/hooks/useSession";
import { profileQueryKey } from "@/hooks/useProfile";
import { updateProfile } from "@/lib/mutations";
import { ensureNotificationPermissions } from "@/lib/notifications";

const TIME_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;

export default function ReminderModal() {
  const { palette } = useTheme();
  const { t } = useTranslation();
  const { session } = useSession();
  const userId = session?.user.id;
  const qc = useQueryClient();
  const params = useLocalSearchParams<{ current?: string }>();

  const [value, setValue] = useState(params.current ?? "09:00");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!TIME_REGEX.test(value)) {
      setError("HH:MM");
      return;
    }
    setError(null);
    if (!userId) return;
    setSaving(true);
    try {
      await ensureNotificationPermissions();
      await updateProfile({
        userId,
        patch: { reminder_time: `${value}:00` },
      });
      qc.invalidateQueries({ queryKey: profileQueryKey(userId) });
      router.back();
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModalShell title={t("settings.reminderTime")}>
      <Text style={[typography.body, { color: palette.fgMuted }]}>
        {t("onboarding.reminder.body")}
      </Text>
      <Input
        value={value}
        onChangeText={setValue}
        placeholder="HH:MM"
        autoCapitalize="none"
        keyboardType="numbers-and-punctuation"
        error={error ?? undefined}
        autoFocus
      />
      <Button label={t("settings.save")} loading={saving} onPress={save} />
    </ModalShell>
  );
}
