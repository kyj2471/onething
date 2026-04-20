import { useState } from "react";
import { Alert, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui";
import { Logo } from "@/components/ui/Logo";
import { typography } from "@/constants/typography";
import { useTheme } from "@/hooks/useTheme";
import { subscriptionQueryKey } from "@/hooks/useSubscription";
import {
  PRO_ENTITLEMENT,
  logOutRevenueCat,
  restorePurchases,
} from "@/lib/revenuecat";
import { supabase } from "@/lib/supabase";

export function PaywallGate({ userId }: { userId: string }) {
  const { palette } = useTheme();
  const { t } = useTranslation();
  const qc = useQueryClient();
  const [restoring, setRestoring] = useState(false);

  const onRestore = async () => {
    setRestoring(true);
    try {
      const info = await restorePurchases();
      const isPro = Boolean(info.entitlements.active[PRO_ENTITLEMENT]);
      if (isPro) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        qc.invalidateQueries({ queryKey: subscriptionQueryKey(userId) });
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

  const onSignOut = async () => {
    await logOutRevenueCat();
    await supabase.auth.signOut();
    router.replace("/(auth)/welcome");
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: palette.bg }} edges={["top", "bottom"]}>
      <ScrollView contentContainerStyle={{ padding: 24, gap: 20, flexGrow: 1, justifyContent: "center" }}>
        <View style={{ alignItems: "center", gap: 16 }}>
          <Logo size={48} />
          <Text
            style={[
              typography.display,
              { fontSize: 28, lineHeight: 34, textAlign: "center", color: palette.fg },
            ]}
          >
            {t("pricing.title")}
          </Text>
          <Text
            style={[
              typography.body,
              { textAlign: "center", color: palette.fgMuted },
            ]}
          >
            Your trial has ended. Subscribe to keep going.
          </Text>
        </View>
        <Button
          label={t("pricing.cta")}
          onPress={() => router.push("/modals/paywall")}
        />
        <Button
          label="Restore purchases"
          variant="secondary"
          loading={restoring}
          onPress={onRestore}
        />
        <Pressable onPress={onSignOut} hitSlop={8} style={{ alignItems: "center" }}>
          <Text style={[typography.bodySm, { color: palette.fgMuted }]}>
            {t("settings.signOut")}
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
