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
import { useTranslation } from "react-i18next";
import { Card } from "@/components/ui";
import { Heatmap } from "@/components/goal/Heatmap";
import { WeeklyBarChart } from "@/components/goal/WeeklyBarChart";
import { typography } from "@/constants/typography";
import { useTheme } from "@/hooks/useTheme";
import { useSession } from "@/hooks/useSession";
import { useProgress } from "@/hooks/useProgress";
import { useAppStore } from "@/store/appStore";
import { rangeOfDays } from "@/lib/calculations";

type HeatmapRow = {
  completed_date: string;
  completed_count: number;
  total_actions: number;
  completion_rate: number;
};

function bestStreak(rows: ReadonlyArray<HeatmapRow>): number {
  let best = 0;
  let current = 0;
  for (const row of rows) {
    if (row.completed_count > 0) {
      current += 1;
      if (current > best) best = current;
    } else {
      current = 0;
    }
  }
  return best;
}

function completionRate(rows: ReadonlyArray<HeatmapRow>): number {
  if (rows.length === 0) return 0;
  const sum = rows.reduce((acc, r) => acc + Number(r.completion_rate ?? 0), 0);
  return sum / rows.length;
}

function weekAverage(rows: ReadonlyArray<HeatmapRow>, dates: string[]): number {
  const byDate = new Map(rows.map((r) => [r.completed_date, r.completion_rate]));
  const values = dates.map((d) => Number(byDate.get(d) ?? 0));
  if (values.length === 0) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

export default function ProgressScreen() {
  const { palette } = useTheme();
  const { t } = useTranslation();
  const { session } = useSession();
  const userId = session?.user.id;
  const locale = useAppStore((s) => s.locale);
  const { data, isLoading, refetch, isRefetching } = useProgress(userId);

  const handleTap = useCallback((date: string) => {
    router.push({ pathname: "/modals/day-detail", params: { date } });
  }, []);

  if (!userId || isLoading || !data) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: palette.bg }} edges={["top"]}>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator color={palette.fg} />
        </View>
      </SafeAreaView>
    );
  }

  const rows = data.heatmap;
  const best = bestStreak(rows);
  const rate = completionRate(rows);

  const last7 = rangeOfDays(7);
  const prev7Start = new Date();
  prev7Start.setDate(prev7Start.getDate() - 7);
  const prev7 = rangeOfDays(7, prev7Start);
  const thisWeek = weekAverage(rows, last7);
  const lastWeek = weekAverage(rows, prev7);
  const delta = thisWeek - lastWeek;

  const stats = [
    { label: t("progressPage.currentStreak"), value: String(data.streak) },
    { label: t("progressPage.bestStreak"), value: String(best) },
    { label: t("progressPage.completionRate"), value: `${Math.round(rate)}%` },
    {
      label: t("progressPage.vsLastWeek"),
      value: `${delta >= 0 ? "+" : ""}${Math.round(delta)}%`,
    },
  ];

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
        <Text style={[typography.display, { color: palette.fg }]}>
          {t("progressPage.title")}
        </Text>

        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
          {stats.map((s) => (
            <View
              key={s.label}
              style={{ width: "48%", flexGrow: 1, minWidth: 140 }}
            >
              <Card>
                <View style={{ gap: 6 }}>
                  <Text style={[typography.caption, { color: palette.fgSubtle }]}>
                    {s.label}
                  </Text>
                  <Text
                    style={[
                      typography.display,
                      { fontSize: 28, lineHeight: 32, color: palette.fg },
                    ]}
                  >
                    {s.value}
                  </Text>
                </View>
              </Card>
            </View>
          ))}
        </View>

        <Section title={t("progressPage.thisWeek")}>
          <Card>
            <WeeklyBarChart data={rows} locale={locale ?? "en"} />
          </Card>
        </Section>

        <Section title={t("progressPage.yearActivity")}>
          <Card>
            <Heatmap data={rows} onSelect={handleTap} />
          </Card>
        </Section>
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
