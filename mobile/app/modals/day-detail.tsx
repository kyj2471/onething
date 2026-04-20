import { ActivityIndicator, Text, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useTranslation } from "react-i18next";
import Svg, { Path } from "react-native-svg";
import { ModalShell } from "@/components/layout/ModalShell";
import { typography } from "@/constants/typography";
import { useTheme } from "@/hooks/useTheme";
import { useSession } from "@/hooks/useSession";
import { useDayDetail } from "@/hooks/useDayDetail";

export default function DayDetailModal() {
  const { palette } = useTheme();
  const { t } = useTranslation();
  const { session } = useSession();
  const userId = session?.user.id;
  const params = useLocalSearchParams<{ date: string }>();
  const date = params.date ?? "";
  const { data, isLoading } = useDayDetail(userId, date);

  return (
    <ModalShell title={date}>
      {isLoading || !data ? (
        <View style={{ paddingVertical: 24, alignItems: "center" }}>
          <ActivityIndicator color={palette.fg} />
        </View>
      ) : data.total === 0 ? (
        <Text style={[typography.body, { color: palette.fgMuted }]}>
          {t("today.allDone")}
        </Text>
      ) : (
        <>
          <Text style={[typography.mono, { color: palette.fgMuted }]}>
            {data.completed}/{data.total}
          </Text>
          <View style={{ gap: 8 }}>
            {data.actions.map(({ action, completed }) => (
              <View
                key={action.id}
                style={{
                  flexDirection: "row",
                  alignItems: "flex-start",
                  gap: 12,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: completed ? "transparent" : palette.border,
                  backgroundColor: completed ? palette.brandBg : palette.surface,
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                }}
              >
                <View
                  style={{
                    marginTop: 2,
                    width: 20,
                    height: 20,
                    borderRadius: 6,
                    borderWidth: 1,
                    borderColor: completed ? "transparent" : palette.borderStrong,
                    backgroundColor: completed ? palette.brand : palette.surface,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {completed ? (
                    <Svg width={12} height={12} viewBox="0 0 20 20">
                      <Path
                        d="M7.5 13.5L4 10l1.4-1.4 2.1 2.1 6.1-6.1L15 6z"
                        fill={palette.onBrand}
                      />
                    </Svg>
                  ) : null}
                </View>
                <Text
                  style={[
                    typography.body,
                    {
                      flex: 1,
                      color: completed ? palette.fgMuted : palette.fg,
                      textDecorationLine: completed ? "line-through" : "none",
                    },
                  ]}
                >
                  {action.title}
                </Text>
              </View>
            ))}
          </View>
        </>
      )}
    </ModalShell>
  );
}
