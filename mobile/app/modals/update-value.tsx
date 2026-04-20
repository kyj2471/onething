import { useState } from "react";
import { Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { ModalShell } from "@/components/layout/ModalShell";
import { Button, Input } from "@/components/ui";
import { typography } from "@/constants/typography";
import { useTheme } from "@/hooks/useTheme";
import { useSession } from "@/hooks/useSession";
import { goalQueryKey } from "@/hooks/useGoal";
import { todayQueryKey } from "@/hooks/useToday";
import { updateTargetValue } from "@/lib/mutations";

export default function UpdateValueModal() {
  const { palette } = useTheme();
  const { t } = useTranslation();
  const { session } = useSession();
  const userId = session?.user.id;
  const qc = useQueryClient();
  const params = useLocalSearchParams<{
    targetId: string;
    current: string;
    target: string;
    title: string;
  }>();

  const [value, setValue] = useState(params.current ?? "0");
  const [saving, setSaving] = useState(false);

  const save = async () => {
    const next = parseFloat(value);
    if (!Number.isFinite(next) || next < 0) return;
    setSaving(true);
    try {
      await updateTargetValue({
        targetId: params.targetId,
        currentValue: next,
      });
      if (userId) {
        qc.invalidateQueries({ queryKey: goalQueryKey(userId) });
        qc.invalidateQueries({ queryKey: todayQueryKey(userId) });
      }
      router.back();
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModalShell title={t("goal.updateValue")}>
      <Text style={[typography.body, { color: palette.fgMuted }]}>
        {params.title}
      </Text>
      <View
        style={{
          flexDirection: "row",
          alignItems: "baseline",
          gap: 6,
        }}
      >
        <Text style={[typography.caption, { color: palette.fgSubtle }]}>
          {t("goal.currentValue")}
        </Text>
        <Text style={[typography.mono, { color: palette.fgMuted }]}>
          / {params.target}
        </Text>
      </View>
      <Input
        value={value}
        onChangeText={setValue}
        keyboardType="decimal-pad"
        autoFocus
      />
      <Button label={t("goal.save")} loading={saving} onPress={save} />
    </ModalShell>
  );
}
