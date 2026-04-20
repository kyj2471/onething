import { View, Text } from "react-native";
import { useTranslation } from "react-i18next";
import { typography } from "@/constants/typography";
import { useTheme } from "@/hooks/useTheme";

export function StreakBadge({ count }: { count: number }) {
  const { palette } = useTheme();
  const { t } = useTranslation();
  if (count <= 0) return null;
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 999,
        backgroundColor: palette.brandBg,
      }}
    >
      <Text style={{ fontSize: 14 }}>🔥</Text>
      <Text style={[typography.bodySm, { color: palette.brandFg }]}>
        {t("today.streak", { count })}
      </Text>
    </View>
  );
}
