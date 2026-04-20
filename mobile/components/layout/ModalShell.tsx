import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { typography } from "@/constants/typography";
import { useTheme } from "@/hooks/useTheme";

export function ModalShell({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const { palette } = useTheme();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: palette.bg }} edges={["top", "bottom"]}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 20,
          paddingVertical: 12,
          borderBottomWidth: 1,
          borderBottomColor: palette.border,
        }}
      >
        <Text style={[typography.h2, { color: palette.fg }]}>{title}</Text>
        <Pressable
          onPress={() => router.back()}
          hitSlop={12}
          style={{ padding: 4 }}
        >
          <Text style={[typography.body, { color: palette.fgMuted }]}>✕</Text>
        </Pressable>
      </View>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ padding: 20, paddingBottom: 40, gap: 16 }}
      >
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}
