import { useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as Haptics from "expo-haptics";
import { useTranslation } from "react-i18next";
import { z } from "zod";
import { Button, Input } from "@/components/ui";
import { typography } from "@/constants/typography";
import { useTheme } from "@/hooks/useTheme";
import { supabase } from "@/lib/supabase";

const schema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Min 8 characters"),
});

type FormValues = z.infer<typeof schema>;

export default function LoginScreen() {
  const { palette } = useTheme();
  const { t } = useTranslation();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const { control, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (values: FormValues) => {
    setSubmitError(null);
    setSubmitting(true);
    const { error } = await supabase.auth.signInWithPassword(values);
    setSubmitting(false);
    if (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
      setSubmitError(error.message);
      return;
    }
    router.replace("/(app)/today");
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: palette.bg }} edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 24, gap: 20 }}>
          <Pressable onPress={() => router.back()} hitSlop={12}>
            <Text style={[typography.body, { color: palette.fgMuted }]}>
              ← {t("common.back", "Back")}
            </Text>
          </Pressable>

          <View style={{ gap: 8, marginTop: 12 }}>
            <Text style={[typography.display, { color: palette.fg, fontSize: 36, lineHeight: 44 }]}>
              {t("auth.login.title")}
            </Text>
            <Text style={[typography.body, { color: palette.fgMuted }]}>
              {t("auth.login.subtitle")}
            </Text>
          </View>

          <View style={{ gap: 16, marginTop: 12 }}>
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label={t("auth.fields.email")}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  autoCapitalize="none"
                  autoComplete="email"
                  keyboardType="email-address"
                  error={errors.email?.message}
                />
              )}
            />
            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label={t("auth.fields.password")}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  secureTextEntry
                  autoComplete="password"
                  error={errors.password?.message}
                />
              )}
            />

            {submitError ? (
              <Text style={[typography.bodySm, { color: palette.danger }]}>
                {submitError}
              </Text>
            ) : null}

            <Button
              label={submitting ? "..." : t("auth.login.submit")}
              onPress={handleSubmit(onSubmit)}
              loading={submitting}
            />

            <Pressable
              onPress={() => router.push("/(auth)/signup")}
              style={{ alignItems: "center", marginTop: 8 }}
              hitSlop={8}
            >
              <Text style={[typography.bodySm, { color: palette.fgMuted }]}>
                {t("auth.login.noAccount")}{" "}
                <Text style={{ color: palette.fg, fontWeight: "500" }}>
                  {t("auth.login.signupLink")}
                </Text>
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
