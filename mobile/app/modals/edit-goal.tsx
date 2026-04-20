import { useState } from "react";
import { View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { ModalShell } from "@/components/layout/ModalShell";
import { Button, Input } from "@/components/ui";
import { useSession } from "@/hooks/useSession";
import { goalQueryKey } from "@/hooks/useGoal";
import { todayQueryKey } from "@/hooks/useToday";
import { updateGoal } from "@/lib/mutations";

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export default function EditGoalModal() {
  const { t } = useTranslation();
  const { session } = useSession();
  const userId = session?.user.id;
  const qc = useQueryClient();
  const params = useLocalSearchParams<{
    goalId: string;
    title: string;
    description: string;
    startDate: string;
    endDate: string;
  }>();

  const [title, setTitle] = useState(params.title ?? "");
  const [description, setDescription] = useState(params.description ?? "");
  const [startDate, setStartDate] = useState(params.startDate ?? "");
  const [endDate, setEndDate] = useState(params.endDate ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const save = async () => {
    const trimmed = title.trim();
    if (trimmed.length === 0) return;
    if (!DATE_REGEX.test(startDate) || !DATE_REGEX.test(endDate)) {
      setError("YYYY-MM-DD");
      return;
    }
    if (endDate < startDate) {
      setError(t("goal.endBeforeStart"));
      return;
    }
    setError(null);
    setSaving(true);
    try {
      await updateGoal({
        goalId: params.goalId,
        title: trimmed,
        description: description.trim() || null,
        startDate,
        endDate,
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
    <ModalShell title={t("goal.edit")}>
      <Input
        value={title}
        onChangeText={setTitle}
        label={t("goal.label")}
        placeholder={t("goal.goalTitlePlaceholder")}
        maxLength={200}
        autoFocus
      />
      <Input
        value={description}
        onChangeText={setDescription}
        placeholder={t("goal.descriptionPlaceholder")}
        maxLength={500}
        multiline
      />
      <View style={{ flexDirection: "row", gap: 8 }}>
        <View style={{ flex: 1 }}>
          <Input
            value={startDate}
            onChangeText={setStartDate}
            label={t("goal.startDate")}
            placeholder="YYYY-MM-DD"
            autoCapitalize="none"
          />
        </View>
        <View style={{ flex: 1 }}>
          <Input
            value={endDate}
            onChangeText={setEndDate}
            label={t("goal.endDate")}
            placeholder="YYYY-MM-DD"
            autoCapitalize="none"
            error={error ?? undefined}
          />
        </View>
      </View>
      <Button label={t("goal.save")} loading={saving} onPress={save} />
    </ModalShell>
  );
}
