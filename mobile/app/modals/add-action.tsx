import { useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { ModalShell } from "@/components/layout/ModalShell";
import { Button, Input } from "@/components/ui";
import { useSession } from "@/hooks/useSession";
import { goalQueryKey } from "@/hooks/useGoal";
import { todayQueryKey } from "@/hooks/useToday";
import { addAction } from "@/lib/mutations";

export default function AddActionModal() {
  const { t } = useTranslation();
  const { session } = useSession();
  const userId = session?.user.id;
  const qc = useQueryClient();
  const params = useLocalSearchParams<{ targetId: string }>();

  const [title, setTitle] = useState("");
  const [saving, setSaving] = useState(false);

  const save = async () => {
    const trimmed = title.trim();
    if (trimmed.length === 0 || trimmed.length > 120) return;
    setSaving(true);
    try {
      await addAction({ targetId: params.targetId, title: trimmed });
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
    <ModalShell title={t("goal.addAction")}>
      <Input
        value={title}
        onChangeText={setTitle}
        placeholder={t("goal.actionPlaceholder")}
        autoFocus
        maxLength={120}
      />
      <Button label={t("goal.add")} loading={saving} onPress={save} />
    </ModalShell>
  );
}
