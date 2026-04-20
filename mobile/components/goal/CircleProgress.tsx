import { View, Text } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { typography } from "@/constants/typography";
import { useTheme } from "@/hooks/useTheme";
import { circleDashArray } from "@/lib/calculations";

export function CircleProgress({
  percent,
  size = 200,
  stroke = 8,
}: {
  percent: number;
  size?: number;
  stroke?: number;
}) {
  const { palette } = useTheme();
  const radius = (size - stroke) / 2;
  const { circumference, offset } = circleDashArray(percent, radius);
  const display = Math.round(percent);

  return (
    <View
      style={{
        width: size,
        height: size,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={{ transform: [{ rotate: "-90deg" }] }}
      >
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={palette.surfaceMuted}
          strokeWidth={stroke}
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={palette.brand}
          strokeWidth={stroke}
          strokeDasharray={`${circumference}`}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </Svg>
      <View
        style={{
          position: "absolute",
          flexDirection: "row",
          alignItems: "baseline",
        }}
      >
        <Text
          style={[
            typography.display,
            { fontSize: 56, lineHeight: 56, color: palette.fg },
          ]}
        >
          {display}
        </Text>
        <Text style={[typography.bodySm, { color: palette.fgMuted }]}>%</Text>
      </View>
    </View>
  );
}
