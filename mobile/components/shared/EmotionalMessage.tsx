import { Text } from "react-native";
import { useTranslation } from "react-i18next";
import { typography } from "@/constants/typography";
import { useTheme } from "@/hooks/useTheme";
import { progressMessageKey } from "@/lib/calculations";

export function EmotionalMessage({ percent }: { percent: number }) {
  const { palette } = useTheme();
  const { t } = useTranslation();
  const key = progressMessageKey(percent);
  return (
    <Text
      style={[
        typography.display,
        {
          fontSize: 17,
          lineHeight: 24,
          textAlign: "center",
          color: palette.fgMuted,
        },
      ]}
    >
      {t(`progress.messages.${key}`)}
    </Text>
  );
}
