import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import * as Haptics from "expo-haptics";
import { useTranslation } from "react-i18next";
import { Button, Card, Input } from "@/components/ui";
import { typography } from "@/constants/typography";
import { useTheme } from "@/hooks/useTheme";
import { supabase } from "@/lib/supabase";

type Target = { id: string; title: string };
type ActionsByTarget = Record<string, string[]>;

export default function OnboardingActionsScreen() {
  const { palette } = useTheme();
  const { t } = useTranslation();
  const { goalId } = useLocalSearchParams<{ goalId: string }>();
  const [targets, setTargets] = useState<Target[] | null>(null);
  const [actionsByTarget, setActionsByTarget] = useState<ActionsByTarget>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!goalId) return;
    (async () => {
      const { data, error } = await supabase
        .from("targets")
        .select("id, title")
        .eq("goal_id", goalId)
        .order("order_index", { ascending: true });
      if (error) {
        setSubmitError(error.message);
        return;
      }
      setTargets(data ?? []);
      const seed: ActionsByTarget = {};
      (data ?? []).forEach((t) => {
        seed[t.id] = [""];
      });
      setActionsByTarget(seed);
    })();
  }, [goalId]);

  const updateAction = (targetId: string, idx: number, value: string) => {
    setActionsByTarget((prev) => {
      const next = { ...prev, [targetId]: [...(prev[targetId] ?? [])] };
      next[targetId][idx] = value;
      return next;
    });
  };

  const addAction = (targetId: string) => {
    setActionsByTarget((prev) => ({
      ...prev,
      [targetId]: [...(prev[targetId] ?? []), ""],
    }));
  };

  const removeAction = (targetId: string, idx: number) => {
    setActionsByTarget((prev) => {
      const arr = (prev[targetId] ?? []).filter((_, i) => i !== idx);
      return { ...prev, [targetId]: arr.length ? arr : [""] };
    });
  };

  const canSubmit = (targets ?? []).every(
    (target) => (actionsByTarget[target.id] ?? []).some((a) => a.trim().length > 0),
  );

  const onSubmit = async () => {
    if (!targets) return;
    setSubmitError(null);
    setSubmitting(true);

    const rows = targets.flatMap((target) =>
      (actionsByTarget[target.id] ?? [])
        .map((title) => title.trim())
        .filter((title) => title.length > 0)
        .map((title) => ({ target_id: target.id, title })),
    );

    const { error } = await supabase.from("actions").insert(rows);
    setSubmitting(false);
    if (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
      setSubmitError(error.message);
      return;
    }
    router.push("/(onboarding)/reminder");
  };

  if (!targets) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator color={palette.fg} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex: 1 }}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 24, gap: 20 }}>
        <View style={{ gap: 8, marginTop: 4 }}>
          <Text style={[typography.display, { color: palette.fg, fontSize: 32, lineHeight: 40 }]}>
            {t("onboarding.actions.title")}
          </Text>
          <Text style={[typography.body, { color: palette.fgMuted }]}>
            {t("onboarding.actions.body")}
          </Text>
        </View>

        {targets.map((target) => (
          <Card key={target.id} padded={false} style={{ padding: 16, gap: 12 }}>
            <Text style={[typography.h3, { color: palette.fg }]}>{target.title}</Text>
            {(actionsByTarget[target.id] ?? []).map((val, idx) => (
              <View key={idx} style={{ flexDirection: "row", alignItems: "flex-end", gap: 8 }}>
                <View style={{ flex: 1 }}>
                  <Input
                    value={val}
                    onChangeText={(v) => updateAction(target.id, idx, v)}
                    placeholder={t("onboarding.actions.placeholder")}
                  />
                </View>
                {(actionsByTarget[target.id]?.length ?? 0) > 1 ? (
                  <Pressable onPress={() => removeAction(target.id, idx)} hitSlop={6} style={{ paddingVertical: 12 }}>
                    <Text style={[typography.bodySm, { color: palette.fgMuted }]}>
                      {t("onboarding.actions.remove")}
                    </Text>
                  </Pressable>
                ) : null}
              </View>
            ))}
            <Button
              label={t("onboarding.actions.addAction")}
              variant="secondary"
              onPress={() => addAction(target.id)}
            />
          </Card>
        ))}

        {submitError ? (
          <Text style={[typography.bodySm, { color: palette.danger }]}>{submitError}</Text>
        ) : null}

        <Button
          label={submitting ? "Saving..." : t("onboarding.actions.cta")}
          onPress={onSubmit}
          loading={submitting}
          disabled={!canSubmit}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
