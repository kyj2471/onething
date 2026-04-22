import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as Haptics from "expo-haptics";
import { useTranslation } from "react-i18next";
import { z } from "zod";
import { Button, Checkbox, Input } from "@/components/ui";
import { typography } from "@/constants/typography";
import { useTheme } from "@/hooks/useTheme";
import { supabase } from "@/lib/supabase";

const schema = z.object({
  displayName: z.string().min(1, "Required").max(24, "Max 24 characters"),
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Min 8 characters"),
  ageConfirmed: z.literal(true, {
    errorMap: () => ({ message: "Please confirm" }),
  }),
  termsAccepted: z.literal(true, {
    errorMap: () => ({ message: "Please accept terms" }),
  }),
});

type FormValues = z.infer<typeof schema>;

export default function SignupScreen() {
  const { palette } = useTheme();
  const { t } = useTranslation();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [pendingVerification, setPendingVerification] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      displayName: "",
      email: "",
      password: "",
      ageConfirmed: false as unknown as true,
      termsAccepted: false as unknown as true,
    },
  });

  const onSubmit = async (values: FormValues) => {
    setSubmitError(null);
    setSubmitting(true);

    const { data, error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: {
        data: { display_name: values.displayName },
      },
    });
    setSubmitting(false);

    if (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
      setSubmitError(error.message);
      return;
    }

    if (data.session) {
      router.replace("/(onboarding)/welcome");
    } else {
      setPendingVerification(true);
    }
  };

  if (pendingVerification) {
    return (
      <SafeAreaView
        style={{ flex: 1, backgroundColor: palette.bg }}
        edges={["top", "bottom"]}
      >
        <View style={{ flex: 1, padding: 24, gap: 20, justifyContent: "center" }}>
          <Text style={[typography.display, { color: palette.fg, fontSize: 36 }]}>
            {t("auth.signup.checkEmailTitle", "Check your email")}
          </Text>
          <Text style={[typography.body, { color: palette.fgMuted }]}>
            {t(
              "auth.signup.checkEmailBody",
              "We sent a confirmation link. Tap it to finish creating your account.",
            )}
          </Text>
          <Button
            label={t("auth.signup.backToLogin", "Back to log in")}
            variant="secondary"
            onPress={() => router.replace("/(auth)/login")}
          />
        </View>
      </SafeAreaView>
    );
  }

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
              {t("auth.signup.title")}
            </Text>
            <Text style={[typography.body, { color: palette.fgMuted }]}>
              {t("auth.signup.subtitle")}
            </Text>
          </View>

          <View style={{ gap: 16, marginTop: 12 }}>
            <Controller
              control={control}
              name="displayName"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label={t("auth.fields.displayName")}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  autoCapitalize="words"
                  placeholder={t("auth.signup.displayNamePlaceholder")}
                  error={errors.displayName?.message}
                />
              )}
            />
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
                  autoComplete="password-new"
                  hint={t("auth.signup.passwordHint")}
                  error={errors.password?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="ageConfirmed"
              render={({ field: { onChange, value } }) => (
                <Checkbox
                  value={Boolean(value)}
                  onChange={onChange}
                  label={t("auth.signup.ageCheck")}
                  error={errors.ageConfirmed?.message}
                />
              )}
            />
            <Controller
              control={control}
              name="termsAccepted"
              render={({ field: { onChange, value } }) => (
                <Checkbox
                  value={Boolean(value)}
                  onChange={onChange}
                  label={t(
                    "auth.signup.termsCheckPlain",
                    "I accept the Terms of Service and Privacy Policy.",
                  )}
                  error={errors.termsAccepted?.message}
                />
              )}
            />

            {submitError ? (
              <Text style={[typography.bodySm, { color: palette.danger }]}>
                {submitError}
              </Text>
            ) : null}

            <Button
              label={submitting ? "..." : t("auth.signup.submit")}
              onPress={handleSubmit(onSubmit)}
              loading={submitting}
            />

            <Pressable
              onPress={() => router.push("/(auth)/login")}
              style={{ alignItems: "center", marginTop: 8 }}
              hitSlop={8}
            >
              <Text style={[typography.bodySm, { color: palette.fgMuted }]}>
                {t("auth.signup.haveAccount")}{" "}
                <Text style={{ color: palette.fg, fontWeight: "500" }}>
                  {t("auth.signup.loginLink")}
                </Text>
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
