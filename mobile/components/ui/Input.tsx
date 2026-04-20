import { forwardRef, useState } from "react";
import {
  TextInput,
  Text,
  View,
  type TextInputProps,
} from "react-native";
import { typography } from "@/constants/typography";
import { useTheme } from "@/hooks/useTheme";

type Props = Omit<TextInputProps, "style"> & {
  label?: string;
  error?: string;
  hint?: string;
  multiline?: boolean;
};

export const Input = forwardRef<TextInput, Props>(function Input(
  { label, error, hint, multiline = false, onFocus, onBlur, ...rest },
  ref,
) {
  const { palette } = useTheme();
  const [focused, setFocused] = useState(false);
  const borderColor = error
    ? palette.danger
    : focused
      ? palette.fg
      : palette.border;

  const handleFocus: TextInputProps["onFocus"] = (e) => {
    setFocused(true);
    onFocus?.(e);
  };
  const handleBlur: TextInputProps["onBlur"] = (e) => {
    setFocused(false);
    onBlur?.(e);
  };

  return (
    <View style={{ gap: 6 }}>
      {label ? (
        <Text style={[typography.caption, { color: palette.fgSubtle }]}>{label}</Text>
      ) : null}
      <TextInput
        ref={ref}
        {...rest}
        multiline={multiline}
        placeholderTextColor={palette.fgSubtle}
        onFocus={handleFocus}
        onBlur={handleBlur}
        style={[
          typography.body,
          {
            color: palette.fg,
            backgroundColor: palette.surface,
            borderColor,
            borderWidth: 1,
            borderRadius: 10,
            paddingHorizontal: 14,
            paddingVertical: multiline ? 12 : 12,
            minHeight: multiline ? 88 : 46,
            textAlignVertical: multiline ? "top" : "center",
          },
        ]}
      />
      {error ? (
        <Text style={[typography.bodySm, { color: palette.danger }]}>{error}</Text>
      ) : hint ? (
        <Text style={[typography.bodySm, { color: palette.fgMuted }]}>{hint}</Text>
      ) : null}
    </View>
  );
});
