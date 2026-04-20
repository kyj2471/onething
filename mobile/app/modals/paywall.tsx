import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  Text,
  View,
} from "react-native";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import { useTranslation } from "react-i18next";
import { useQueryClient } from "@tanstack/react-query";
import type { PurchasesPackage } from "react-native-purchases";
import { ModalShell } from "@/components/layout/ModalShell";
import { Button, Card } from "@/components/ui";
import { typography } from "@/constants/typography";
import { PLAN, TRIAL_DAYS } from "@/constants/config";
import { useTheme } from "@/hooks/useTheme";
import { useSession } from "@/hooks/useSession";
import { subscriptionQueryKey } from "@/hooks/useSubscription";
import {
  PRO_ENTITLEMENT,
  getOfferings,
  purchasePackage,
  restorePurchases,
} from "@/lib/revenuecat";

export default function PaywallModal() {
  const { palette } = useTheme();
  const { t } = useTranslation();
  const { session } = useSession();
  const userId = session?.user.id;
  const qc = useQueryClient();

  const [loading, setLoading] = useState(true);
  const [packages, setPackages] = useState<PurchasesPackage[]>([]);
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [restoring, setRestoring] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const offering = await getOfferings();
        if (cancelled) return;
        setPackages(offering?.availablePackages ?? []);
      } catch {
        if (!cancelled) setError("Could not load offerings.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const onPurchase = async (pkg: PurchasesPackage) => {
    setPurchasing(pkg.identifier);
    setError(null);
    try {
      const info = await purchasePackage(pkg);
      const isPro = Boolean(info.entitlements.active[PRO_ENTITLEMENT]);
      if (isPro) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        if (userId) {
          qc.invalidateQueries({ queryKey: subscriptionQueryKey(userId) });
        }
        router.replace("/(app)/today");
      } else {
        setError("Purchase did not complete.");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Purchase failed";
      const userCancelled = /cancel/i.test(message);
      if (!userCancelled) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        setError(message);
      }
    } finally {
      setPurchasing(null);
    }
  };

  const onRestore = async () => {
    setRestoring(true);
    setError(null);
    try {
      const info = await restorePurchases();
      const isPro = Boolean(info.entitlements.active[PRO_ENTITLEMENT]);
      if (isPro) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        if (userId) {
          qc.invalidateQueries({ queryKey: subscriptionQueryKey(userId) });
        }
        router.replace("/(app)/today");
      } else {
        Alert.alert("No purchases to restore");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Restore failed";
      setError(message);
    } finally {
      setRestoring(false);
    }
  };

  const annualPkg = packages.find((p) =>
    /annual|year/i.test(p.product.identifier),
  );
  const monthlyPkg = packages.find((p) =>
    /month/i.test(p.product.identifier),
  );
  const ordered = [annualPkg, monthlyPkg].filter(
    (p): p is PurchasesPackage => !!p,
  );
  const fallbackList = ordered.length > 0 ? ordered : packages;

  return (
    <ModalShell title={t("pricing.title")}>
      <Text style={[typography.body, { color: palette.fgMuted }]}>
        {t("pricing.subtitle")}
      </Text>

      {loading ? (
        <View style={{ paddingVertical: 32, alignItems: "center" }}>
          <ActivityIndicator color={palette.fg} />
        </View>
      ) : fallbackList.length === 0 ? (
        <Card>
          <Text style={[typography.body, { color: palette.fgMuted }]}>
            No subscription offerings are available right now.
          </Text>
        </Card>
      ) : (
        <View style={{ gap: 12 }}>
          {fallbackList.map((pkg) => {
            const isAnnual = /annual|year/i.test(pkg.product.identifier);
            const fallbackPrice = isAnnual
              ? `$${PLAN.annual.priceUSD}`
              : `$${PLAN.monthly.priceUSD}`;
            const price = pkg.product.priceString || fallbackPrice;
            const label = isAnnual
              ? t("pricing.annual.label")
              : t("pricing.monthly.label");
            const per = isAnnual
              ? t("pricing.annual.per")
              : t("pricing.monthly.per");
            const description = isAnnual
              ? t("pricing.annual.description")
              : t("pricing.monthly.description");
            const isLoading = purchasing === pkg.identifier;
            return (
              <Card key={pkg.identifier}>
                <View style={{ gap: 12 }}>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "baseline",
                      justifyContent: "space-between",
                    }}
                  >
                    <View style={{ flex: 1, gap: 4 }}>
                      <Text style={[typography.h3, { color: palette.fg }]}>
                        {label}
                      </Text>
                      <Text
                        style={[typography.bodySm, { color: palette.fgMuted }]}
                      >
                        {description}
                      </Text>
                    </View>
                    <View style={{ alignItems: "flex-end" }}>
                      <Text
                        style={[
                          typography.display,
                          { fontSize: 22, lineHeight: 28, color: palette.fg },
                        ]}
                      >
                        {price}
                      </Text>
                      <Text
                        style={[typography.caption, { color: palette.fgSubtle }]}
                      >
                        {per}
                      </Text>
                    </View>
                  </View>
                  {isAnnual ? (
                    <View
                      style={{
                        alignSelf: "flex-start",
                        backgroundColor: palette.brandBg,
                        paddingHorizontal: 8,
                        paddingVertical: 2,
                        borderRadius: 999,
                      }}
                    >
                      <Text
                        style={[
                          typography.caption,
                          { color: palette.brandFg },
                        ]}
                      >
                        {t("pricing.annual.save")}
                      </Text>
                    </View>
                  ) : null}
                  <Button
                    label={t("pricing.cta")}
                    loading={isLoading}
                    disabled={purchasing !== null}
                    onPress={() => onPurchase(pkg)}
                  />
                </View>
              </Card>
            );
          })}
        </View>
      )}

      <Text
        style={[
          typography.bodySm,
          { color: palette.fgMuted, textAlign: "center" },
        ]}
      >
        {`${TRIAL_DAYS}-day free trial. Cancel anytime.`}
      </Text>

      {error ? (
        <Text style={[typography.bodySm, { color: palette.danger }]}>
          {error}
        </Text>
      ) : null}

      <Button
        label="Restore purchases"
        variant="ghost"
        loading={restoring}
        onPress={onRestore}
      />

      <View
        style={{
          flexDirection: "row",
          justifyContent: "center",
          gap: 16,
          marginTop: 8,
        }}
      >
        <Pressable
          onPress={() => router.push("/modals/terms")}
          hitSlop={6}
        >
          <Text
            style={[
              typography.bodySm,
              {
                color: palette.fgMuted,
                textDecorationLine: "underline",
              },
            ]}
          >
            {t("settings.terms")}
          </Text>
        </Pressable>
        <Pressable
          onPress={() => router.push("/modals/privacy")}
          hitSlop={6}
        >
          <Text
            style={[
              typography.bodySm,
              {
                color: palette.fgMuted,
                textDecorationLine: "underline",
              },
            ]}
          >
            {t("settings.privacy")}
          </Text>
        </Pressable>
      </View>
    </ModalShell>
  );
}
