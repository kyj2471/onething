import { useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { ModalShell } from "@/components/layout/ModalShell";
import { Button, Input } from "@/components/ui";
import { useSession } from "@/hooks/useSession";
import { goalQueryKey } from "@/hooks/useGoal";
import { todayQueryKey } from "@/hooks/useToday";
import { supabase } from "@/lib/supabase";

export default function AddTargetModal() {
  const { t } = useTranslation();
  const { session } = useSession();
  const userId = session?.user.id;
  const qc = useQueryClient();
  const params = useLocalSearchParams<{ goalId: string }>();

  const [title, setTitle] = useState("");
  const [targetValue, setTargetValue] = useState("");
  const [saving, setSaving] = useState(false);

  const save = async () => {
    const tv = parseFloat(targetValue);
    const trimmed = title.trim();
    if (trimmed.length === 0 || !Number.isFinite(tv) || tv <= 0) return;
    setSaving(true);
    try {
      const existing = await supabase
        .from("targets")
        .select("order_index")
        .eq("goal_id", params.goalId)
        .order("order_index", { ascending: false })
        .limit(1)
        .maybeSingle();
      const nextIndex =
        ((existing.data as { order_index: number } | null)?.order_index ?? -1) +
        1;
      await supabase.from("targets").insert({
        goal_id: params.goalId,
        title: trimmed,
        target_value: tv,
        current_value: 0,
        order_index: nextIndex,
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
    <ModalShell title={t("goal.addTarget")}>
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
      <Button label={t("goal.add")} loading={saving} onPress={save} />
    </ModalShell>
  );
}
