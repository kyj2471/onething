import { Pressable, Text, View } from "react-native";
import Svg, { Polyline } from "react-native-svg";
import { typography } from "@/constants/typography";
import { useTheme } from "@/hooks/useTheme";

type Props = {
  value: boolean;
  onChange: (next: boolean) => void;
  label: string;
  error?: string;
};

export function Checkbox({ value, onChange, label, error }: Props) {
  const { palette } = useTheme();
  return (
    <View style={{ gap: 6 }}>
      <Pressable
        onPress={() => onChange(!value)}
        style={{ flexDirection: "row", gap: 10, alignItems: "flex-start" }}
        hitSlop={8}
      >
        <View
          style={{
            width: 20,
            height: 20,
            marginTop: 2,
            borderRadius: 6,
            borderWidth: 1.5,
            borderColor: value ? "transparent" : palette.borderStrong,
            backgroundColor: value ? palette.brand : "transparent",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {value ? (
            <Svg width={14} height={14} viewBox="0 0 16 16">
              <Polyline
                points="3,8.5 6.5,12 13,5"
                fill="none"
                stroke={palette.onBrand}
                strokeWidth={3}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          ) : null}
        </View>
        <Text
          style={[
            typography.bodySm,
            { color: palette.fg, flex: 1, lineHeight: 20 },
          ]}
        >
          {label}
        </Text>
      </Pressable>
      {error ? (
        <Text
          style={[typography.bodySm, { color: palette.danger, marginLeft: 30 }]}
        >
          {error}
        </Text>
      ) : null}
    </View>
  );
}
