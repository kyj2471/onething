import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { CircleProgress } from "@/components/goal/CircleProgress";
import { ConfirmModal } from "@/components/layout/ConfirmModal";
import { Card } from "@/components/ui";
import { typography } from "@/constants/typography";
import { useTheme } from "@/hooks/useTheme";
import { deleteGoal } from "@/lib/mutations";

function formatDDay(
  endDate: string | null,
  t: (key: string, values?: Record<string, unknown>) => string,
): string | null {
  if (!endDate) return null;
  const end = new Date(`${endDate}T00:00:00`);
  const today = new Date();
  const startOfToday = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );
  const diffMs = end.getTime() - startOfToday.getTime();
  const days = Math.round(diffMs / 86400000);
  if (days === 0) return t("goal.dDay");
  if (days > 0) return t("goal.dDayMinus", { n: days });
  return t("goal.dDayPlus", { n: -days });
}

export function GoalHeaderCard({
  id,
  title,
  description,
  startDate,
  endDate,
  percent,
  onDeleted,
}: {
  id: string;
  title: string;
  description: string | null;
  startDate: string | null;
  endDate: string | null;
  percent: number;
  onDeleted: () => void;
}) {
  const { palette } = useTheme();
  const { t } = useTranslation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [pending, setPending] = useState(false);

  const dDay = formatDDay(endDate, t);

  const handleDelete = async () => {
    setPending(true);
    try {
      await deleteGoal(id);
      onDeleted();
    } finally {
      setPending(false);
      setConfirmDelete(false);
    }
  };

  return (
    <Card>
      <View style={{ gap: 20 }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <View style={{ flex: 1, gap: 6 }}>
            <Text style={[typography.caption, { color: palette.fgSubtle }]}>
              {t("goal.label")}
            </Text>
            <Text
              style={[
                typography.display,
                { fontSize: 28, lineHeight: 34, color: palette.fg },
              ]}
            >
              {title}
            </Text>
            {description ? (
              <Text style={[typography.body, { color: palette.fgMuted }]}>
                {description}
              </Text>
            ) : null}
          </View>
          <Pressable
            onPress={() => setMenuOpen((v) => !v)}
            hitSlop={8}
            accessibilityLabel={t("goal.more")}
            style={{
              width: 32,
              height: 32,
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 8,
              backgroundColor: palette.surfaceMuted,
            }}
          >
            <Text style={[typography.body, { color: palette.fg }]}>⋯</Text>
          </Pressable>
        </View>

        <View style={{ flexDirection: "row", alignItems: "center", gap: 20 }}>
          <CircleProgress percent={percent} size={112} stroke={6} />
          <View style={{ flex: 1, gap: 6 }}>
            <Text style={[typography.caption, { color: palette.fgSubtle }]}>
              {t("goal.period")}
            </Text>
            <Text style={[typography.mono, { color: palette.fg }]}>
              {startDate && endDate
                ? `${startDate} → ${endDate}`
                : t("goal.noPeriod")}
            </Text>
            {dDay ? (
              <View
                style={{
                  alignSelf: "flex-start",
                  backgroundColor: palette.brandBg,
                  paddingHorizontal: 10,
                  paddingVertical: 3,
                  borderRadius: 999,
                }}
              >
                <Text style={[typography.bodySm, { color: palette.brandFg }]}>
                  {dDay}
                </Text>
              </View>
            ) : null}
          </View>
        </View>

        {menuOpen ? (
          <View
            style={{
              flexDirection: "row",
              gap: 8,
              borderTopWidth: 1,
              borderTopColor: palette.border,
              paddingTop: 12,
            }}
          >
            <Pressable
              onPress={() => {
                setMenuOpen(false);
                router.push({
                  pathname: "/modals/edit-goal",
                  params: {
                    goalId: id,
                    title,
                    description: description ?? "",
                    startDate: startDate ?? "",
                    endDate: endDate ?? "",
                  },
                });
              }}
              style={{
                flex: 1,
                paddingVertical: 8,
                alignItems: "center",
                borderRadius: 8,
                backgroundColor: palette.accentSubtle,
              }}
            >
              <Text style={[typography.bodySm, { color: palette.fg }]}>
                {t("goal.edit")}
              </Text>
            </Pressable>
            <Pressable
              onPress={() => {
                setMenuOpen(false);
                setConfirmDelete(true);
              }}
              style={{
                flex: 1,
                paddingVertical: 8,
                alignItems: "center",
                borderRadius: 8,
                backgroundColor: palette.dangerBg,
              }}
            >
              <Text style={[typography.bodySm, { color: palette.danger }]}>
                {t("goal.delete")}
              </Text>
            </Pressable>
          </View>
        ) : null}
      </View>

      <ConfirmModal
        visible={confirmDelete}
        title={t("goal.deleteGoalTitle")}
        body={t("goal.deleteGoalBody")}
        confirmLabel={t("goal.deleteGoalCta")}
        cancelLabel={t("goal.cancel")}
        destructive
        pending={pending}
        onCancel={() => setConfirmDelete(false)}
        onConfirm={handleDelete}
      />
    </Card>
  );
}
