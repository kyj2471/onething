import { Text, View } from "react-native";
import { typography } from "@/constants/typography";
import { useTheme } from "@/hooks/useTheme";
import { rangeOfDays } from "@/lib/calculations";

type HeatmapCell = {
  completed_date: string;
  completion_rate: number;
};

export function WeeklyBarChart({
  data,
  locale,
  height = 96,
}: {
  data: ReadonlyArray<HeatmapCell>;
  locale: string;
  height?: number;
}) {
  const { palette } = useTheme();
  const range = rangeOfDays(7);
  const byDate = new Map(data.map((d) => [d.completed_date, d.completion_rate]));

  return (
    <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 8 }}>
      {range.map((date) => {
        const rate = byDate.get(date) ?? 0;
        const barHeight = Math.max((rate / 100) * height, 4);
        const d = new Date(date);
        const label = d.toLocaleDateString(locale, { weekday: "narrow" });
        return (
          <View
            key={date}
            style={{ flex: 1, alignItems: "center", gap: 6 }}
          >
            <View
              style={{
                height,
                width: "100%",
                justifyContent: "flex-end",
              }}
            >
              <View
                style={{
                  height: barHeight,
                  width: "100%",
                  borderTopLeftRadius: 4,
                  borderTopRightRadius: 4,
                  backgroundColor: palette.brand,
                }}
              />
            </View>
            <Text
              style={[
                typography.caption,
                {
                  color: palette.fgSubtle,
                  textTransform: "none",
                  letterSpacing: 0,
                },
              ]}
            >
              {label}
            </Text>
          </View>
        );
      })}
    </View>
  );
}
