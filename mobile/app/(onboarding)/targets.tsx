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
        unit: z.string().max(24, "Max 24").optional(),
      }),
    )
    .min(MIN_TARGETS)
    .max(MAX_TARGETS),
});

type FormValues = z.infer<typeof schema>;

export default function OnboardingTargetsScreen() {
  const { palette } = useTheme();
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
        { title: "", current_value: 0, target_value: 0, unit: "" },
        { title: "", current_value: 0, target_value: 0, unit: "" },
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

    const rows = values.targets.map((t, i) => ({
      goal_id: goalId,
      title: t.title,
      current_value: t.current_value,
      target_value: t.target_value,
      unit: t.unit || null,
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
            Measurable targets
          </Text>
          <Text style={[typography.body, { color: palette.fgMuted }]}>
            2–5 numbers that prove you reached the goal.
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
                    <Text style={[typography.bodySm, { color: palette.fgMuted }]}>Remove</Text>
                  </Pressable>
                ) : null}
              </View>
              <Controller
                control={control}
                name={`targets.${idx}.title`}
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="Title"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    placeholder="e.g., Kilometers run"
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
                        label="Current"
                        value={String(value ?? 0)}
                        onChangeText={(v) => onChange(v)}
                        onBlur={onBlur}
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
                        label="Target"
                        value={String(value ?? 0)}
                        onChangeText={(v) => onChange(v)}
                        onBlur={onBlur}
                        keyboardType="decimal-pad"
                        error={errors.targets?.[idx]?.target_value?.message}
                      />
                    )}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Controller
                    control={control}
                    name={`targets.${idx}.unit`}
                    render={({ field: { onChange, onBlur, value } }) => (
                      <Input
                        label="Unit"
                        value={value ?? ""}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        placeholder="km"
                      />
                    )}
                  />
                </View>
              </View>
            </Card>
          ))}

          {fields.length < MAX_TARGETS ? (
            <Button
              label="Add target"
              variant="secondary"
              onPress={() =>
                append({ title: "", current_value: 0, target_value: 0, unit: "" })
              }
            />
          ) : null}
        </View>

        {submitError ? (
          <Text style={[typography.bodySm, { color: palette.danger }]}>{submitError}</Text>
        ) : null}

        <Button
          label={submitting ? "Saving..." : "Next"}
          onPress={handleSubmit(onSubmit)}
          loading={submitting}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
