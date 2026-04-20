import { StyleSheet } from "react-native";

export const typography = StyleSheet.create({
  display: {
    fontFamily: "InstrumentSerif",
    fontStyle: "italic",
    fontSize: 32,
    lineHeight: 40,
    letterSpacing: -0.32,
  },
  h1: {
    fontFamily: "Pretendard",
    fontSize: 24,
    lineHeight: 32,
    letterSpacing: -0.24,
    fontWeight: "600",
  },
  h2: {
    fontFamily: "Pretendard",
    fontSize: 18,
    lineHeight: 26,
    letterSpacing: -0.09,
    fontWeight: "600",
  },
  h3: {
    fontFamily: "Pretendard",
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "600",
  },
  body: {
    fontFamily: "Pretendard",
    fontSize: 15,
    lineHeight: 22,
  },
  bodySm: {
    fontFamily: "Pretendard",
    fontSize: 14,
    lineHeight: 20,
  },
  caption: {
    fontFamily: "Pretendard",
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.48,
    textTransform: "uppercase",
    fontWeight: "500",
  },
  mono: {
    fontFamily: "JetBrainsMono",
    fontSize: 13,
    lineHeight: 18,
  },
});
