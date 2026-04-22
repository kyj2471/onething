import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useFieldArray, useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import * as Haptics from "expo-haptics";
import { useTranslation } from "react-i18next";
import { Button, Card, Input } from "@/components/ui";
import { typography } from "@/constants/typography";
import { useTheme } from "@/hooks/useTheme";
import { supabase } from "@/lib/supabase";

const MIN_TARGETS = 2;
const MAX_TARGETS = 5;

const schema = z.object({
  targets: z
    .array(
      z.object({
        title: z.string().min(1, "Required").max(120, "Max 120"),
        current_value: z.coerce.number().min(0, "≥ 0"),
        target_value: z.coerce.number().positive("> 0"),
      }),
    )
    .min(MIN_TARGETS)
    .max(MAX_TARGETS),
});

type FormValues = z.infer<typeof schema>;

export default function OnboardingTargetsScreen() {
  const { palette } = useTheme();
  const { t } = useTranslation();
  const { goalId } = useLocalSearchParams<{ goalId: string }>();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      targets: [
        { title: "", current_value: 0, target_value: 0 },
        { title: "", current_value: 0, target_value: 0 },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "targets" });

  const onSubmit = async (values: FormValues) => {
    if (!goalId) {
      setSubmitError("Missing goal reference");
      return;
    }
    setSubmitError(null);
    setSubmitting(true);

    const rows = values.targets.map((row, i) => ({
      goal_id: goalId,
      title: row.title,
      current_value: row.current_value,
      target_value: row.target_value,
      order_index: i,
    }));

    const { error } = await supabase.from("targets").insert(rows);
    setSubmitting(false);
    if (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
      setSubmitError(error.message);
      return;
    }
    router.push({ pathname: "/(onboarding)/actions", params: { goalId } });
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex: 1 }}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 24, gap: 20 }}>
        <View style={{ gap: 8, marginTop: 4 }}>
          <Text style={[typography.display, { color: palette.fg, fontSize: 32, lineHeight: 40 }]}>
            {t("onboarding.targets.title")}
          </Text>
          <Text style={[typography.body, { color: palette.fgMuted }]}>
            {t("onboarding.targets.body")}
          </Text>
        </View>

        <View style={{ gap: 12 }}>
          {fields.map((field, idx) => (
            <Card key={field.id} padded={false} style={{ padding: 16, gap: 12 }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <Text style={[typography.caption, { color: palette.fgSubtle }]}>
                  Target {idx + 1}
                </Text>
                {fields.length > MIN_TARGETS ? (
                  <Pressable onPress={() => remove(idx)} hitSlop={6}>
                    <Text style={[typography.bodySm, { color: palette.fgMuted }]}>
                      {t("onboarding.targets.remove")}
                    </Text>
                  </Pressable>
                ) : null}
              </View>
              <Controller
                control={control}
                name={`targets.${idx}.title`}
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    placeholder={t("onboarding.targets.titlePlaceholder")}
                    error={errors.targets?.[idx]?.title?.message}
                  />
                )}
              />
              <View style={{ flexDirection: "row", gap: 12 }}>
                <View style={{ flex: 1 }}>
                  <Controller
                    control={control}
                    name={`targets.${idx}.current_value`}
                    render={({ field: { onChange, onBlur, value } }) => (
                      <Input
                        label={t("onboarding.targets.currentLabel")}
                        value={String(value ?? 0)}
                        onChangeText={(v) => onChange(v)}
                        onBlur={onBlur}
                        placeholder={t("onboarding.targets.currentPlaceholder")}
                        keyboardType="decimal-pad"
                        error={errors.targets?.[idx]?.current_value?.message}
                      />
                    )}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Controller
                    control={control}
                    name={`targets.${idx}.target_value`}
                    render={({ field: { onChange, onBlur, value } }) => (
                      <Input
                        label={t("onboarding.targets.targetLabel")}
                        value={String(value ?? 0)}
                        onChangeText={(v) => onChange(v)}
                        onBlur={onBlur}
                        placeholder={t("onboarding.targets.targetPlaceholder")}
                        keyboardType="decimal-pad"
                        error={errors.targets?.[idx]?.target_value?.message}
                      />
                    )}
                  />
                </View>
              </View>
            </Card>
          ))}

          {fields.length < MAX_TARGETS ? (
            <Button
              label={t("onboarding.targets.addRow")}
              variant="secondary"
              onPress={() =>
                append({ title: "", current_value: 0, target_value: 0 })
              }
            />
          ) : null}
        </View>

        {submitError ? (
          <Text style={[typography.bodySm, { color: palette.danger }]}>{submitError}</Text>
        ) : null}

        <Button
          label={submitting ? "Saving..." : t("onboarding.targets.cta")}
          onPress={handleSubmit(onSubmit)}
          loading={submitting}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
