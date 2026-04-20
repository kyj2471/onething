import {
  ActivityIndicator,
  Pressable,
  Text,
  View,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { typography } from "@/constants/typography";
import { useTheme } from "@/hooks/useTheme";

type Variant = "primary" | "secondary" | "ghost" | "danger";

type Props = Omit<PressableProps, "children" | "style"> & {
  label: string;
  variant?: Variant;
  loading?: boolean;
  fullWidth?: boolean;
  size?: "md" | "sm";
  leading?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
};

export function Button({
  label,
  variant = "primary",
  loading = false,
  fullWidth = true,
  size = "md",
  leading,
  disabled,
  style,
  ...rest
}: Props) {
  const { palette, isDark } = useTheme();
  const isDisabled = Boolean(disabled || loading);

  const styles = getVariantStyle(variant, palette, isDark);
  const height = size === "sm" ? 40 : 48;
  const paddingH = size === "sm" ? 16 : 20;

  return (
    <Pressable
      {...rest}
      disabled={isDisabled}
      style={({ pressed }) => [
        {
          height,
          paddingHorizontal: paddingH,
          borderRadius: 10,
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "row",
          gap: 8,
          opacity: isDisabled ? 0.5 : pressed ? 0.85 : 1,
          alignSelf: fullWidth ? "stretch" : "flex-start",
          ...styles.container,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={styles.text.color} size="small" />
      ) : (
        <>
          {leading ? <View>{leading}</View> : null}
          <Text style={[typography.body, { fontWeight: "500" }, styles.text]}>
            {label}
          </Text>
        </>
      )}
    </Pressable>
  );
}

function getVariantStyle(
  variant: Variant,
  palette: ReturnType<typeof useTheme>["palette"],
  isDark: boolean,
) {
  switch (variant) {
    case "primary":
      return {
        container: { backgroundColor: palette.accent },
        text: { color: palette.fgInverse },
      } as const;
    case "danger":
      return {
        container: { backgroundColor: palette.danger },
        text: { color: "#ffffff" },
      } as const;
    case "secondary":
      return {
        container: {
          backgroundColor: "transparent",
          borderWidth: 1,
          borderColor: palette.borderStrong,
        },
        text: { color: palette.fg },
      } as const;
    case "ghost":
      return {
        container: { backgroundColor: "transparent" },
        text: { color: isDark ? palette.fgMuted : palette.fgMuted },
      } as const;
  }
}
