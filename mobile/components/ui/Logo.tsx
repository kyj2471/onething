import Svg, { Circle } from "react-native-svg";
import { useColorScheme } from "react-native";
import { darkColors, lightColors } from "@/constants/colors";

export function Logo({ size = 24 }: { size?: number }) {
  const scheme = useColorScheme();
  const palette = scheme === "dark" ? darkColors : lightColors;
  return (
    <Svg width={size} height={size} viewBox="0 0 32 32">
      <Circle
        cx={16}
        cy={16}
        r={12}
        fill="none"
        stroke={palette.fg}
        strokeWidth={1.75}
      />
      <Circle cx={16} cy={16} r={4} fill={palette.brand} />
    </Svg>
  );
}
