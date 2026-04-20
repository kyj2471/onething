import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { Card } from "@/components/ui";
import { ConfirmModal } from "@/components/layout/ConfirmModal";
import { typography } from "@/constants/typography";
import { useTheme } from "@/hooks/useTheme";
import { targetProgressPercent } from "@/lib/calculations";
import { deleteAction, deleteTarget } from "@/lib/mutations";

type Action = { id: string; title: string };

export function TargetCard({
  id,
  title,
  target_value,
  current_value,
  actions,
  onChanged,
}: {
  id: string;
  title: string;
  target_value: number;
  current_value: number;
  actions: Action[];
  onChanged: () => void;
}) {
  const { palette } = useTheme();
  const { t } = useTranslation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmDeleteTarget, setConfirmDeleteTarget] = useState(false);
  const [confirmDeleteAction, setConfirmDeleteAction] = useState<Action | null>(
    null,
  );
  const [pending, setPending] = useState(false);

  const percent = targetProgressPercent(current_value, target_value);

  const onDeleteTarget = async () => {
    setPending(true);
    try {
      await deleteTarget(id);
      onChanged();
    } finally {
      setPending(false);
      setConfirmDeleteTarget(false);
    }
  };

  const onDeleteAction = async () => {
    if (!confirmDeleteAction) return;
    setPending(true);
    try {
      await deleteAction(confirmDeleteAction.id);
      onChanged();
    } finally {
      setPending(false);
      setConfirmDeleteAction(null);
    }
  };

  return (
    <Card>
      <View style={{ gap: 12 }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <View style={{ flex: 1, gap: 4 }}>
            <Text style={[typography.body, { color: palette.fg }]}>{title}</Text>
            <Text style={[typography.mono, { color: palette.fgMuted }]}>
              {current_value} / {target_value}
            </Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <Text style={[typography.mono, { color: palette.fg }]}>
              {Math.round(percent)}%
            </Text>
            <Pressable
              onPress={() => setMenuOpen((v) => !v)}
              hitSlop={6}
              accessibilityLabel={t("goal.more")}
              style={{
                width: 28,
                height: 28,
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 6,
                backgroundColor: palette.surfaceMuted,
              }}
            >
              <Text style={[typography.bodySm, { color: palette.fg }]}>⋯</Text>
            </Pressable>
          </View>
        </View>

        <View
          style={{
            height: 6,
            width: "100%",
            borderRadius: 999,
            backgroundColor: palette.surfaceMuted,
            overflow: "hidden",
          }}
        >
          <View
            style={{
              height: "100%",
              width: `${percent}%`,
              borderRadius: 999,
              backgroundColor: palette.brand,
            }}
          />
        </View>

        {menuOpen ? (
          <View
            style={{
              flexDirection: "row",
              gap: 8,
            }}
          >
            <Pressable
              onPress={() => {
                setMenuOpen(false);
                router.push({
                  pathname: "/modals/edit-target",
                  params: {
                    targetId: id,
                    title,
                    target: String(target_value),
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
                setConfirmDeleteTarget(true);
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

        <Pressable
          onPress={() =>
            router.push({
              pathname: "/modals/update-value",
              params: {
                targetId: id,
                current: String(current_value),
                target: String(target_value),
                title,
              },
            })
          }
          style={{ alignSelf: "flex-start", paddingVertical: 4 }}
          hitSlop={6}
        >
          <Text
            style={[
              typography.bodySm,
              { color: palette.fgMuted, textDecorationLine: "underline" },
            ]}
          >
            {t("goal.updateValue")}
          </Text>
        </Pressable>

        <View
          style={{
            gap: 8,
            borderTopWidth: 1,
            borderTopColor: palette.border,
            paddingTop: 12,
          }}
        >
          {actions.map((a) => (
            <View
              key={a.id}
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 8,
              }}
            >
              <Text
                style={[typography.body, { color: palette.fg, flex: 1 }]}
                numberOfLines={2}
              >
                · {a.title}
              </Text>
              <Pressable
                onPress={() => setConfirmDeleteAction(a)}
                hitSlop={6}
                style={{ paddingHorizontal: 6, paddingVertical: 2 }}
              >
                <Text style={[typography.caption, { color: palette.fgSubtle }]}>
                  ✕
                </Text>
              </Pressable>
            </View>
          ))}
          <Pressable
            onPress={() =>
              router.push({
                pathname: "/modals/add-action",
                params: { targetId: id },
              })
            }
            style={{
              alignSelf: "flex-start",
              paddingVertical: 6,
              paddingHorizontal: 10,
              borderRadius: 8,
              borderWidth: 1,
              borderColor: palette.border,
            }}
          >
            <Text style={[typography.bodySm, { color: palette.fg }]}>
              {t("goal.addAction")}
            </Text>
          </Pressable>
        </View>
      </View>

      <ConfirmModal
        visible={confirmDeleteTarget}
        title={t("goal.deleteTargetTitle")}
        body={t("goal.deleteTargetBody")}
        confirmLabel={t("goal.deleteTargetCta")}
        cancelLabel={t("goal.cancel")}
        destructive
        pending={pending}
        onCancel={() => setConfirmDeleteTarget(false)}
        onConfirm={onDeleteTarget}
      />
      <ConfirmModal
        visible={!!confirmDeleteAction}
        title={t("goal.deleteActionTitle")}
        body={t("goal.deleteActionBody")}
        confirmLabel={t("goal.deleteActionCta")}
        cancelLabel={t("goal.cancel")}
        destructive
        pending={pending}
        onCancel={() => setConfirmDeleteAction(null)}
        onConfirm={onDeleteAction}
      />
    </Card>
  );
}
