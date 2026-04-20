import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import Constants from "expo-constants";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Button, Card } from "@/components/ui";
import { ConfirmModal } from "@/components/layout/ConfirmModal";
import { typography } from "@/constants/typography";
import type { ThemeMode } from "@/constants/colors";
import { useTheme } from "@/hooks/useTheme";
import { useSession } from "@/hooks/useSession";
import { useProfile, profileQueryKey } from "@/hooks/useProfile";
import {
  subscriptionQueryKey,
  useSubscription,
} from "@/hooks/useSubscription";
import { useAppStore } from "@/store/appStore";
import { i18n, SUPPORTED_LOCALES, type Locale } from "@/lib/i18n";
import { supabase } from "@/lib/supabase";
import { requestDeletion, updateProfile } from "@/lib/mutations";
import {
  PRO_ENTITLEMENT,
  logOutRevenueCat,
  restorePurchases,
} from "@/lib/revenuecat";

export default function SettingsScreen() {
  const { palette } = useTheme();
  const { t } = useTranslation();
  const { session } = useSession();
  const userId = session?.user.id;
  const qc = useQueryClient();
  const { data: profile, isLoading } = useProfile(userId);
  const { data: subscription } = useSubscription(userId);

  const storedTheme = useAppStore((s) => s.theme);
  const setTheme = useAppStore((s) => s.setTheme);
  const storedLocale = useAppStore((s) => s.locale);
  const setLocale = useAppStore((s) => s.setLocale);

  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [restoring, setRestoring] = useState(false);

  const invalidate = () => {
    if (userId) qc.invalidateQueries({ queryKey: profileQueryKey(userId) });
  };

  const onChangeTheme = async (mode: ThemeMode) => {
    setTheme(mode);
    if (userId) {
      await updateProfile({ userId, patch: { theme: mode } });
      invalidate();
    }
  };

  const onChangeLocale = async (locale: Locale) => {
    setLocale(locale);
    await i18n.changeLanguage(locale);
    if (userId) {
      await updateProfile({ userId, patch: { locale } });
      invalidate();
    }
  };

  const signOut = async () => {
    await logOutRevenueCat();
    await supabase.auth.signOut();
    router.replace("/(auth)/welcome");
  };

  const onRestore = async () => {
    setRestoring(true);
    try {
      const info = await restorePurchases();
      const isPro = Boolean(info.entitlements.active[PRO_ENTITLEMENT]);
      if (userId) {
        qc.invalidateQueries({ queryKey: subscriptionQueryKey(userId) });
      }
      if (isPro) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert("Restored", "Your subscription is active.");
      } else {
        Alert.alert("No purchases to restore");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Restore failed";
      Alert.alert("Restore failed", message);
    } finally {
      setRestoring(false);
    }
  };

  const handleDelete = async () => {
    if (!userId || !profile?.email) return;
    setDeleting(true);
    try {
      await requestDeletion({ userId, email: profile.email });
      await logOutRevenueCat();
      await supabase.auth.signOut();
      router.replace("/(auth)/welcome");
    } finally {
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  if (!userId || isLoading || !profile) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: palette.bg }} edges={["top"]}>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator color={palette.fg} />
        </View>
      </SafeAreaView>
    );
  }

  const themeValue = storedTheme ?? profile.theme ?? "system";
  const localeValue: Locale =
    storedLocale ?? (SUPPORTED_LOCALES.includes(profile.locale as Locale)
      ? (profile.locale as Locale)
      : "en");
  const reminderShort = (profile.reminder_time ?? "09:00:00").slice(0, 5);
  const version = Constants.expoConfig?.version ?? "";

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: palette.bg }} edges={["top"]}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40, gap: 20 }}>
        <Text style={[typography.display, { color: palette.fg }]}>
          {t("settings.title")}
        </Text>

        <Section title={t("settings.account")}>
          <Card>
            <View style={{ gap: 12 }}>
              <Row label={t("settings.displayName")} value={profile.display_name ?? "—"} />
              <Divider />
              <Row label={t("settings.email")} value={profile.email ?? "—"} />
            </View>
          </Card>
        </Section>

        <Section title={t("settings.notifications")}>
          <Pressable
            onPress={() =>
              router.push({
                pathname: "/modals/reminder",
                params: { current: reminderShort },
              })
            }
          >
            <Card>
              <Row label={t("settings.reminderTime")} value={reminderShort} showChevron />
            </Card>
          </Pressable>
        </Section>

        <Section title={t("settings.app")}>
          <Card>
            <View style={{ gap: 16 }}>
              <View style={{ gap: 8 }}>
                <Text style={[typography.caption, { color: palette.fgSubtle }]}>
                  {t("settings.theme")}
                </Text>
                <SegmentedControl
                  value={themeValue}
                  options={[
                    { value: "light", label: t("settings.themeLight") },
                    { value: "dark", label: t("settings.themeDark") },
                    { value: "system", label: t("settings.themeSystem") },
                  ]}
                  onChange={(v) => onChangeTheme(v as ThemeMode)}
                />
              </View>
              <Divider />
              <View style={{ gap: 8 }}>
                <Text style={[typography.caption, { color: palette.fgSubtle }]}>
                  {t("settings.language")}
                </Text>
                <SegmentedControl
                  value={localeValue}
                  options={[
                    { value: "en", label: "English" },
                    { value: "ko", label: "한국어" },
                  ]}
                  onChange={(v) => onChangeLocale(v as Locale)}
                />
              </View>
            </View>
          </Card>
        </Section>

        <Section title={t("settings.subscription")}>
          <Card>
            <View style={{ gap: 12 }}>
              <Row
                label={t("settings.plan")}
                value={subscription?.tier ?? profile.subscription_status ?? "free"}
              />
              {subscription?.expiresAt ? (
                <>
                  <Divider />
                  <Row
                    label="Renews"
                    value={new Date(subscription.expiresAt).toLocaleDateString(
                      localeValue,
                    )}
                  />
                </>
              ) : profile.trial_ends_at ? (
                <>
                  <Divider />
                  <Row
                    label={t("settings.trialEnds")}
                    value={new Date(profile.trial_ends_at).toLocaleDateString(
                      localeValue,
                    )}
                  />
                </>
              ) : null}
              {subscription && !subscription.isPro ? (
                <Button
                  label={t("pricing.cta")}
                  onPress={() => router.push("/modals/paywall")}
                />
              ) : null}
              <Button
                label="Restore purchases"
                variant="secondary"
                loading={restoring}
                onPress={onRestore}
              />
            </View>
          </Card>
        </Section>

        <Section title={t("settings.legal")}>
          <Card>
            <View style={{ gap: 12 }}>
              <LinkRow
                label={t("settings.privacy")}
                onPress={() => router.push("/modals/privacy")}
              />
              <Divider />
              <LinkRow
                label={t("settings.terms")}
                onPress={() => router.push("/modals/terms")}
              />
              <Divider />
              <LinkRow
                label={t("settings.refund")}
                onPress={() => router.push("/modals/refund")}
              />
              <Divider />
              <LinkRow
                label={t("settings.help")}
                onPress={() => router.push("/modals/help")}
              />
            </View>
          </Card>
        </Section>

        <Pressable onPress={signOut} hitSlop={8}>
          <Card>
            <Text
              style={[typography.body, { color: palette.fg, textAlign: "center" }]}
            >
              {t("settings.signOut")}
            </Text>
          </Card>
        </Pressable>

        <Section title={t("settings.dangerZone")}>
          <Pressable onPress={() => setConfirmDelete(true)} hitSlop={8}>
            <Card>
              <View style={{ gap: 4 }}>
                <Text style={[typography.body, { color: palette.danger }]}>
                  {t("settings.deleteAccount")}
                </Text>
                <Text style={[typography.bodySm, { color: palette.fgMuted }]}>
                  {t("settings.deleteBody")}
                </Text>
              </View>
            </Card>
          </Pressable>
        </Section>

        {version ? (
          <Text
            style={[
              typography.caption,
              {
                color: palette.fgSubtle,
                textAlign: "center",
                textTransform: "none",
                letterSpacing: 0,
              },
            ]}
          >
            v{version}
          </Text>
        ) : null}
      </ScrollView>

      <ConfirmModal
        visible={confirmDelete}
        title={t("settings.deleteConfirmTitle")}
        body={t("settings.deleteConfirmBody")}
        confirmLabel={t("settings.deleteConfirmCta")}
        cancelLabel={t("settings.deleteCancel")}
        destructive
        pending={deleting}
        onCancel={() => setConfirmDelete(false)}
        onConfirm={handleDelete}
      />
    </SafeAreaView>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const { palette } = useTheme();
  return (
    <View style={{ gap: 10 }}>
      <Text style={[typography.caption, { color: palette.fgSubtle }]}>
        {title}
      </Text>
      {children}
    </View>
  );
}

function Row({
  label,
  value,
  showChevron = false,
}: {
  label: string;
  value: string;
  showChevron?: boolean;
}) {
  const { palette } = useTheme();
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
      }}
    >
      <Text style={[typography.body, { color: palette.fg }]}>{label}</Text>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <Text
          style={[typography.bodySm, { color: palette.fgMuted }]}
          numberOfLines={1}
        >
          {value}
        </Text>
        {showChevron ? (
          <Text style={[typography.bodySm, { color: palette.fgSubtle }]}>
            ›
          </Text>
        ) : null}
      </View>
    </View>
  );
}

function LinkRow({ label, onPress }: { label: string; onPress: () => void }) {
  const { palette } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
      }}
      hitSlop={6}
    >
      <Text style={[typography.body, { color: palette.fg }]}>{label}</Text>
      <Text style={[typography.bodySm, { color: palette.fgSubtle }]}>›</Text>
    </Pressable>
  );
}

function Divider() {
  const { palette } = useTheme();
  return <View style={{ height: 1, backgroundColor: palette.border }} />;
}

function SegmentedControl({
  value,
  options,
  onChange,
}: {
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
}) {
  const { palette } = useTheme();
  return (
    <View
      style={{
        flexDirection: "row",
        borderRadius: 8,
        backgroundColor: palette.surfaceMuted,
        padding: 3,
      }}
    >
      {options.map((o) => {
        const active = value === o.value;
        return (
          <Pressable
            key={o.value}
            onPress={() => onChange(o.value)}
            style={{
              flex: 1,
              paddingVertical: 8,
              alignItems: "center",
              borderRadius: 6,
              backgroundColor: active ? palette.surface : "transparent",
            }}
          >
            <Text
              style={[
                typography.bodySm,
                {
                  color: active ? palette.fg : palette.fgMuted,
                  fontWeight: active ? "500" : "400",
                },
              ]}
            >
              {o.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
