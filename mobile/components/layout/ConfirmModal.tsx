import { Modal, Pressable, Text, View } from "react-native";
import { Button } from "@/components/ui";
import { typography } from "@/constants/typography";
import { useTheme } from "@/hooks/useTheme";

export function ConfirmModal({
  visible,
  title,
  body,
  confirmLabel,
  cancelLabel,
  destructive = false,
  pending = false,
  onCancel,
  onConfirm,
}: {
  visible: boolean;
  title: string;
  body: string;
  confirmLabel: string;
  cancelLabel: string;
  destructive?: boolean;
  pending?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const { palette } = useTheme();

  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
      onRequestClose={onCancel}
    >
      <Pressable
        onPress={onCancel}
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.5)",
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
        }}
      >
        <View
          onStartShouldSetResponder={() => true}
          style={{
            width: "100%",
            maxWidth: 420,
            backgroundColor: palette.surfaceElevated,
            borderRadius: 14,
            padding: 20,
            gap: 12,
            borderWidth: 1,
            borderColor: palette.border,
          }}
        >
          <Text style={[typography.h2, { color: palette.fg }]}>{title}</Text>
          <Text style={[typography.body, { color: palette.fgMuted }]}>
            {body}
          </Text>
          <View style={{ flexDirection: "row", gap: 8, marginTop: 8 }}>
            <Button
              label={cancelLabel}
              variant="secondary"
              onPress={onCancel}
              disabled={pending}
              style={{ flex: 1 }}
              fullWidth={false}
            />
            <Button
              label={confirmLabel}
              variant={destructive ? "danger" : "primary"}
              onPress={onConfirm}
              loading={pending}
              style={{ flex: 1 }}
              fullWidth={false}
            />
          </View>
        </View>
      </Pressable>
    </Modal>
  );
}
