import { useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { ModalShell } from "@/components/layout/ModalShell";
import { Button, Input } from "@/components/ui";
import { useSession } from "@/hooks/useSession";
import { goalQueryKey } from "@/hooks/useGoal";
import { todayQueryKey } from "@/hooks/useToday";
import { updateTarget } from "@/lib/mutations";

export default function EditTargetModal() {
  const { t } = useTranslation();
  const { session } = useSession();
  const userId = session?.user.id;
  const qc = useQueryClient();
  const params = useLocalSearchParams<{
    targetId: string;
    title: string;
    target: string;
  }>();

  const [title, setTitle] = useState(params.title ?? "");
  const [targetValue, setTargetValue] = useState(params.target ?? "");
  const [saving, setSaving] = useState(false);

  const save = async () => {
    const tv = parseFloat(targetValue);
    const trimmed = title.trim();
    if (trimmed.length === 0 || !Number.isFinite(tv) || tv <= 0) return;
    setSaving(true);
    try {
      await updateTarget({
        targetId: params.targetId,
        title: trimmed,
        targetValue: tv,
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
        placeholder={t("goal.titlePlaceholder")}
        autoFocus
        maxLength={120}
      />
      <Input
        value={targetValue}
        onChangeText={setTargetValue}
        placeholder={t("goal.valuePlaceholder")}
        keyboardType="decimal-pad"
      />
      <Button label={t("goal.save")} loading={saving} onPress={save} />
    </ModalShell>
  );
}
