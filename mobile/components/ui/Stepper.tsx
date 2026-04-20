import { View } from "react-native";
import { useTheme } from "@/hooks/useTheme";

type Props = {
  total: number;
  current: number;
};

export function Stepper({ total, current }: Props) {
  const { palette } = useTheme();
  return (
    <View style={{ flexDirection: "row", gap: 6 }}>
      {Array.from({ length: total }).map((_, i) => {
        const filled = i < current;
        const active = i === current - 1;
        return (
          <View
            key={i}
            style={{
              flex: 1,
              height: 4,
              borderRadius: 999,
              backgroundColor: filled
                ? palette.accent
                : active
                  ? palette.fgMuted
                  : palette.border,
            }}
          />
        );
      })}
    </View>
  );
}
