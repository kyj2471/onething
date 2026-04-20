import { useCallback } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Card } from "@/components/ui";
import { CircleProgress } from "@/components/goal/CircleProgress";
import { MiniHeatmap } from "@/components/goal/MiniHeatmap";
import { ActionChecklist } from "@/components/goal/ActionChecklist";
import { TargetProgressList } from "@/components/goal/TargetProgressList";
import { StreakBadge } from "@/components/shared/StreakBadge";
import { EmotionalMessage } from "@/components/shared/EmotionalMessage";
import { typography } from "@/constants/typography";
import { useTheme } from "@/hooks/useTheme";
import { useSession } from "@/hooks/useSession";
import { todayQueryKey, useToday } from "@/hooks/useToday";
import { goalProgressPercent } from "@/lib/calculations";
import { useAppStore } from "@/store/appStore";

export default function TodayScreen() {
  const { palette } = useTheme();
  const { t } = useTranslation();
  const { session } = useSession();
  const userId = session?.user.id;
  const locale = useAppStore((s) => s.locale);
  const qc = useQueryClient();
  const { data, isLoading, refetch, isRefetching } = useToday(userId);

  const handleHeatmapTap = useCallback((date: string) => {
    router.push({ pathname: "/modals/day-detail", params: { date } });
  }, []);

  const onChanged = useCallback(() => {
    if (userId) {
      qc.invalidateQueries({ queryKey: todayQueryKey(userId) });
    }
  }, [qc, userId]);

  if (!userId) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: palette.bg }} edges={["top"]}>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator color={palette.fg} />
        </View>
      </SafeAreaView>
    );
  }

  if (isLoading || !data) {
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
  const targetTitleById = new Map(data.targets.map((t) => [t.id, t.title]));
  const checklist = data.actions.map((a) => ({
    id: a.id,
    title: a.title,
    target_title: targetTitleById.get(a.target_id) ?? "",
    completed: data.todayCompletedActionIds.includes(a.id),
  }));

  const todayLabel = new Date().toLocaleDateString(locale ?? "en", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: palette.bg }} edges={["top"]}>
      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: 40, gap: 28 }}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={palette.fg}
          />
        }
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "baseline",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <Text style={[typography.display, { color: palette.fg }]}>
            {data.displayName
              ? t("today.greeting", { name: data.displayName })
              : t("today.title")}
          </Text>
          <Text style={[typography.caption, { color: palette.fgSubtle }]}>
            {todayLabel}
          </Text>
        </View>

        <Card>
          <View style={{ alignItems: "center", gap: 16, paddingVertical: 8 }}>
            <Text
              style={[typography.caption, { color: palette.fgSubtle }]}
            >
              {t("today.myGoal")}
            </Text>
            <Text
              style={[
                typography.display,
                {
                  fontSize: 22,
                  lineHeight: 28,
                  textAlign: "center",
                  color: palette.fg,
                },
              ]}
            >
              {data.goal.title}
            </Text>
            <CircleProgress percent={percent} />
            <EmotionalMessage percent={percent} />
            <StreakBadge count={data.streak} />
          </View>
        </Card>

        {data.targets.length > 0 ? (
          <Section title={t("today.targetsTitle")}>
            <TargetProgressList targets={data.targets} />
          </Section>
        ) : null}

        <Section title={t("today.recentActivity")}>
          <MiniHeatmap data={data.heatmap} onSelect={handleHeatmapTap} />
        </Section>

        <ActionChecklist
          userId={userId}
          actions={checklist}
          onChanged={onChanged}
        />
      </ScrollView>
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
    <View style={{ gap: 12 }}>
      <Text style={[typography.h3, { color: palette.fg }]}>{title}</Text>
      {children}
    </View>
  );
}
