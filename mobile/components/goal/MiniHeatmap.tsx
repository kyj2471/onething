import { Pressable, View } from "react-native";
import * as Haptics from "expo-haptics";
import { useTheme } from "@/hooks/useTheme";
import { heatmapLevel, rangeOfDays, todayISO } from "@/lib/calculations";

type HeatmapCell = {
  completed_date: string;
  completion_rate: number;
};

export function MiniHeatmap({
  data,
  weeks = 8,
  cellSize = 14,
  gap = 4,
  onSelect,
}: {
  data: ReadonlyArray<HeatmapCell>;
  weeks?: number;
  cellSize?: number;
  gap?: number;
  onSelect?: (date: string) => void;
}) {
  const { palette } = useTheme();
  const totalDays = weeks * 7;
  const range = rangeOfDays(totalDays);
  const byDate = new Map(data.map((d) => [d.completed_date, d.completion_rate]));
  const today = todayISO();

  const columns: string[][] = [];
  for (let w = 0; w < weeks; w++) {
    columns.push(range.slice(w * 7, (w + 1) * 7));
  }

  return (
    <View
      accessibilityRole="image"
      accessibilityLabel="Recent activity heatmap"
      style={{ flexDirection: "row", gap }}
    >
      {columns.map((week, wi) => (
        <View key={wi} style={{ flexDirection: "column", gap }}>
          {week.map((date) => {
            const rate = byDate.get(date) ?? 0;
            const level = heatmapLevel(rate);
            const isToday = date === today;
            const Cell = (
              <View
                style={{
                  width: cellSize,
                  height: cellSize,
                  borderRadius: 3,
                  backgroundColor: palette.heatmap[level],
                  borderWidth: isToday ? 1 : 0,
                  borderColor: palette.accent,
                }}
              />
            );
            return onSelect ? (
              <Pressable
                key={date}
                onPress={() => {
                  Haptics.impactAsync(
                    Haptics.ImpactFeedbackStyle.Light,
                  ).catch(() => {});
                  onSelect(date);
                }}
                hitSlop={4}
                accessibilityLabel={`${date} ${Math.round(rate)}%`}
              >
                {Cell}
              </Pressable>
            ) : (
              <View key={date}>{Cell}</View>
            );
          })}
        </View>
      ))}
    </View>
  );
}
