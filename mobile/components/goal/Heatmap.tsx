import { Pressable, ScrollView, View } from "react-native";
import { useTheme } from "@/hooks/useTheme";
import { heatmapLevel, rangeOfDays, todayISO } from "@/lib/calculations";

type HeatmapCell = {
  completed_date: string;
  completion_rate: number;
};

export function Heatmap({
  data,
  days = 365,
  cellSize = 12,
  gap = 3,
  onSelect,
}: {
  data: ReadonlyArray<HeatmapCell>;
  days?: number;
  cellSize?: number;
  gap?: number;
  onSelect?: (date: string) => void;
}) {
  const { palette } = useTheme();
  const range = rangeOfDays(days);
  const byDate = new Map(data.map((d) => [d.completed_date, d.completion_rate]));
  const today = todayISO();

  const weeks: string[][] = [];
  for (let i = 0; i < range.length; i += 7) {
    weeks.push(range.slice(i, i + 7));
  }

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingVertical: 4 }}
    >
      <View style={{ flexDirection: "row", gap }}>
        {weeks.map((week, wi) => (
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
                  onPress={() => onSelect(date)}
                  hitSlop={2}
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
    </ScrollView>
  );
}
