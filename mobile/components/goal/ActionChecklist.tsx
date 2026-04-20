import { useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { MotiView } from "moti";
import * as Haptics from "expo-haptics";
import Svg, { Path } from "react-native-svg";
import { useTranslation } from "react-i18next";
import { typography } from "@/constants/typography";
import { useTheme } from "@/hooks/useTheme";
import { toggleAction } from "@/lib/mutations";

export type ActionItem = {
  id: string;
  title: string;
  target_title: string;
  completed: boolean;
};

export function ActionChecklist({
  userId,
  actions,
  onChanged,
}: {
  userId: string;
  actions: ActionItem[];
  onChanged: () => void;
}) {
  const { palette } = useTheme();
  const { t } = useTranslation();
  const [optimistic, setOptimistic] = useState<ActionItem[]>(actions);

  useEffect(() => {
    setOptimistic(actions);
  }, [actions]);

  const onToggle = async (item: ActionItem) => {
    Haptics.selectionAsync().catch(() => {});
    const next = optimistic.map((a) =>
      a.id === item.id ? { ...a, completed: !a.completed } : a,
    );
    const wasAllDone = optimistic.every((a) => a.completed);
    const nowAllDone = next.every((a) => a.completed);
    setOptimistic(next);
    if (!wasAllDone && nowAllDone) {
      Haptics.notificationAsync(
        Haptics.NotificationFeedbackType.Success,
      ).catch(() => {});
    }
    try {
      await toggleAction({
        userId,
        actionId: item.id,
        currentlyCompleted: item.completed,
      });
      onChanged();
    } catch {
      setOptimistic((prev) =>
        prev.map((a) =>
          a.id === item.id ? { ...a, completed: item.completed } : a,
        ),
      );
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(
        () => {},
      );
    }
  };

  const done = optimistic.filter((a) => a.completed).length;
  const total = optimistic.length;
  const allDone = total > 0 && done === total;

  return (
    <View style={{ gap: 12 }}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "baseline",
          justifyContent: "space-between",
        }}
      >
        <Text style={[typography.h3, { color: palette.fg }]}>
          {t("today.actionsTitle")}
        </Text>
        <Text style={[typography.mono, { color: palette.fgMuted }]}>
          {done}/{total}
        </Text>
      </View>
      <View style={{ gap: 8 }}>
        {optimistic.map((a) => (
          <Pressable
            key={a.id}
            onPress={() => onToggle(a)}
            style={{
              flexDirection: "row",
              alignItems: "flex-start",
              gap: 12,
              borderRadius: 8,
              borderWidth: 1,
              borderColor: a.completed ? "transparent" : palette.border,
              backgroundColor: a.completed ? palette.brandBg : palette.surface,
              paddingHorizontal: 16,
              paddingVertical: 12,
            }}
          >
            <MotiView
              key={`${a.id}-${a.completed}`}
              from={{ scale: a.completed ? 0.8 : 1 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", damping: 12, stiffness: 220 }}
              style={{
                marginTop: 2,
                width: 20,
                height: 20,
                borderRadius: 6,
                borderWidth: 1,
                borderColor: a.completed ? "transparent" : palette.borderStrong,
                backgroundColor: a.completed ? palette.brand : palette.surface,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {a.completed ? (
                <Svg width={12} height={12} viewBox="0 0 20 20">
                  <Path
                    d="M7.5 13.5L4 10l1.4-1.4 2.1 2.1 6.1-6.1L15 6z"
                    fill={palette.onBrand}
                  />
                </Svg>
              ) : null}
            </MotiView>
            <View style={{ flex: 1, gap: 2 }}>
              <Text
                style={[
                  typography.body,
                  {
                    color: a.completed ? palette.fgMuted : palette.fg,
                    textDecorationLine: a.completed ? "line-through" : "none",
                  },
                ]}
              >
                {a.title}
              </Text>
              <Text style={[typography.caption, { color: palette.fgSubtle }]}>
                {a.target_title}
              </Text>
            </View>
          </Pressable>
        ))}
      </View>
      {allDone ? (
        <Text
          style={[
            typography.display,
            {
              fontSize: 16,
              lineHeight: 22,
              textAlign: "center",
              color: palette.fgMuted,
            },
          ]}
        >
          {t("today.allDone")}
        </Text>
      ) : null}
    </View>
  );
}
