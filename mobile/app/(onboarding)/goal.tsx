import { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from "react-native";
import { router } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import * as Haptics from "expo-haptics";
import { Button, Input } from "@/components/ui";
import { typography } from "@/constants/typography";
import { useTheme } from "@/hooks/useTheme";
import { supabase } from "@/lib/supabase";
import { toISODate } from "@/lib/calculations";

function defaultEndDate(): string {
  const d = new Date();
  d.setDate(d.getDate() + 90);
  return toISODate(d);
}

const schema = z.object({
  title: z.string().min(1, "Required").max(200, "Max 200"),
  description: z.string().max(500, "Max 500").optional(),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD"),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD"),
});

type FormValues = z.infer<typeof schema>;

export default function OnboardingGoalScreen() {
  const { palette } = useTheme();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "",
      description: "",
      start_date: toISODate(new Date()),
      end_date: defaultEndDate(),
    },
  });

  const onSubmit = async (values: FormValues) => {
    setSubmitError(null);
    setSubmitting(true);
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id;
    if (!userId) {
      setSubmitting(false);
      setSubmitError("Not signed in");
      return;
    }

    const { data, error } = await supabase
      .from("goals")
      .insert({
        user_id: userId,
        title: values.title,
        description: values.description || null,
        start_date: values.start_date,
        end_date: values.end_date,
        status: "active",
      })
      .select("id")
      .single();

    setSubmitting(false);
    if (error || !data) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
      setSubmitError(error?.message ?? "Failed to create goal");
      return;
    }
    router.push({ pathname: "/(onboarding)/targets", params: { goalId: data.id } });
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex: 1 }}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 24, gap: 20 }}>
        <View style={{ gap: 8, marginTop: 4 }}>
          <Text style={[typography.display, { color: palette.fg, fontSize: 32, lineHeight: 40 }]}>
            Your goal
          </Text>
          <Text style={[typography.body, { color: palette.fgMuted }]}>
            One outcome you want to hit by a specific date.
          </Text>
        </View>

        <View style={{ gap: 16, marginTop: 8 }}>
          <Controller
            control={control}
            name="title"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Title"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder="e.g., Run a half marathon"
                error={errors.title?.message}
              />
            )}
          />
          <Controller
            control={control}
            name="description"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Description (optional)"
                value={value ?? ""}
                onChangeText={onChange}
                onBlur={onBlur}
                multiline
                placeholder="Why does this matter?"
                error={errors.description?.message}
              />
            )}
          />
          <View style={{ flexDirection: "row", gap: 12 }}>
            <View style={{ flex: 1 }}>
              <Controller
                control={control}
                name="start_date"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="Start"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    placeholder="YYYY-MM-DD"
                    autoCapitalize="none"
                    error={errors.start_date?.message}
                  />
                )}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Controller
                control={control}
                name="end_date"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="End"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    placeholder="YYYY-MM-DD"
                    autoCapitalize="none"
                    error={errors.end_date?.message}
                  />
                )}
              />
            </View>
          </View>

          {submitError ? (
            <Text style={[typography.bodySm, { color: palette.danger }]}>{submitError}</Text>
          ) : null}

          <Button
            label={submitting ? "Saving..." : "Next"}
            onPress={handleSubmit(onSubmit)}
            loading={submitting}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
