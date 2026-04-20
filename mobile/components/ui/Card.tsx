import { View, type ViewProps } from "react-native";
import { useTheme } from "@/hooks/useTheme";

type Props = ViewProps & { padded?: boolean; elevated?: boolean };

export function Card({
  padded = true,
  elevated = false,
  style,
  children,
  ...rest
}: Props) {
  const { palette } = useTheme();
  return (
    <View
      {...rest}
      style={[
        {
          backgroundColor: elevated ? palette.surfaceElevated : palette.surface,
          borderColor: palette.border,
          borderWidth: 1,
          borderRadius: 14,
          padding: padded ? 20 : 0,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}
