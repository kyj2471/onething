import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { ConfirmModal } from "@/components/layout/ConfirmModal";
import { GoalHeaderCard } from "@/components/goal/GoalHeaderCard";
import { TargetCard } from "@/components/goal/TargetCard";
import { Button } from "@/components/ui";
import { typography } from "@/constants/typography";
import { useSession } from "@/hooks/useSession";
import { useTheme } from "@/hooks/useTheme";
import { goalQueryKey, useGoal } from "@/hooks/useGoal";
import { todayQueryKey } from "@/hooks/useToday";
import { goalProgressPercent } from "@/lib/calculations";
import { completeGoal } from "@/lib/mutations";

export default function GoalScreen() {
  const { palette } = useTheme();
  const { t } = useTranslation();
  const { session } = useSession();
  const userId = session?.user.id;
  const qc = useQueryClient();
  const { data, isLoading, refetch, isRefetching } = useGoal(userId);

  const [confirmComplete, setConfirmComplete] = useState(false);
  const [completing, setCompleting] = useState(false);

  const invalidate = useCallback(() => {
    if (!userId) return;
    qc.invalidateQueries({ queryKey: goalQueryKey(userId) });
    qc.invalidateQueries({ queryKey: todayQueryKey(userId) });
  }, [qc, userId]);

  const onComplete = async () => {
    if (!data?.goal) return;
    setCompleting(true);
    try {
      await completeGoal(data.goal.id);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(
        () => {},
      );
      invalidate();
      router.replace("/(onboarding)/welcome");
    } catch {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(
        () => {},
      );
    } finally {
      setCompleting(false);
      setConfirmComplete(false);
    }
  };

  if (!userId || isLoading || !data) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: palette.bg }} edges={["top"]}>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator color={palette.fg} />
        </View>
      </SafeAreaView>
    );
  }

  if (!data.goal) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: palette.bg }} edges={["top"]}>
        <View
          style={{
            flex: 1,
            padding: 24,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={[typography.body, { color: palette.fgMuted, textAlign: "center" }]}>
            No active goal.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const percent = goalProgressPercent(data.targets);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: palette.bg }} edges={["top"]}>
      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: 40, gap: 20 }}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={palette.fg}
          />
        }
      >
        <GoalHeaderCard
          id={data.goal.id}
          title={data.goal.title}
          description={data.goal.description}
          startDate={data.goal.start_date}
          endDate={data.goal.end_date}
          percent={percent}
          onDeleted={() => {
            invalidate();
            router.replace("/(onboarding)/welcome");
          }}
        />

        <View
          style={{
            flexDirection: "row",
            alignItems: "baseline",
            justifyContent: "space-between",
          }}
        >
          <Text style={[typography.h3, { color: palette.fg }]}>
            {t("goal.targets")}
          </Text>
        </View>

        <View style={{ gap: 12 }}>
          {data.targets.map((target) => (
            <TargetCard
              key={target.id}
              id={target.id}
              title={target.title}
              target_value={target.target_value}
              current_value={target.current_value}
              actions={data.actionsByTarget[target.id] ?? []}
              onChanged={invalidate}
            />
          ))}
        </View>

        {data.targets.length < 5 ? (
          <Pressable
            onPress={() =>
              router.push({
                pathname: "/modals/add-target",
                params: { goalId: data.goal!.id },
              })
            }
            style={{
              alignSelf: "stretch",
              paddingVertical: 12,
              alignItems: "center",
              borderRadius: 10,
              borderWidth: 1,
              borderStyle: "dashed",
              borderColor: palette.border,
            }}
          >
            <Text style={[typography.bodySm, { color: palette.fg }]}>
              {t("goal.addTarget")}
            </Text>
          </Pressable>
        ) : null}

        <Button
          label={t("goal.complete")}
          variant="primary"
          onPress={() => setConfirmComplete(true)}
        />
      </ScrollView>

      <ConfirmModal
        visible={confirmComplete}
        title={t("goal.complete")}
        body={t("goal.deleteGoalBody")}
        confirmLabel={t("goal.complete")}
        cancelLabel={t("goal.cancel")}
        pending={completing}
        onCancel={() => setConfirmComplete(false)}
        onConfirm={onComplete}
      />
    </SafeAreaView>
  );
}
