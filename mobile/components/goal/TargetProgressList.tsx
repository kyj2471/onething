import { Pressable, Text, View } from "react-native";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { typography } from "@/constants/typography";
import { useTheme } from "@/hooks/useTheme";
import { targetProgressPercent } from "@/lib/calculations";

type Item = {
  id: string;
  title: string;
  current_value: number;
  target_value: number;
};

export function TargetProgressList({ targets }: { targets: Item[] }) {
  const { palette } = useTheme();
  const { t } = useTranslation();
  if (targets.length === 0) return null;

  return (
    <View style={{ gap: 12 }}>
      <View style={{ gap: 12 }}>
        {targets.map((item) => (
          <TargetProgressRow key={item.id} item={item} />
        ))}
      </View>
      <Text style={[typography.caption, { color: palette.fgSubtle, textTransform: "none", letterSpacing: 0 }]}>
        {t("today.editCurrentHint")}
      </Text>
    </View>
  );
}

function TargetProgressRow({ item }: { item: Item }) {
  const { palette } = useTheme();
  const percent = targetProgressPercent(item.current_value, item.target_value);

  return (
    <View style={{ gap: 6 }}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "baseline",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <Text style={[typography.body, { color: palette.fg, flex: 1 }]}>
          {item.title}
        </Text>
        <View
          style={{ flexDirection: "row", alignItems: "baseline", gap: 6 }}
        >
          <Pressable
            onPress={() =>
              router.push({
                pathname: "/modals/update-value",
                params: {
                  targetId: item.id,
                  current: String(item.current_value),
                  target: String(item.target_value),
                  title: item.title,
                },
              })
            }
            style={{
              backgroundColor: palette.accentSubtle,
              paddingHorizontal: 8,
              paddingVertical: 2,
              borderRadius: 4,
            }}
            hitSlop={6}
          >
            <Text style={[typography.mono, { color: palette.fg }]}>
              {item.current_value}
            </Text>
          </Pressable>
          <Text style={[typography.mono, { color: palette.fgSubtle }]}>
            {` / ${item.target_value} · ${Math.round(percent)}%`}
          </Text>
        </View>
      </View>
      <View
        style={{
          height: 6,
          borderRadius: 999,
          backgroundColor: palette.surfaceMuted,
          overflow: "hidden",
        }}
      >
        <View
          style={{
            width: `${percent}%`,
            height: "100%",
            borderRadius: 999,
            backgroundColor: palette.brand,
          }}
        />
      </View>
    </View>
  );
}
