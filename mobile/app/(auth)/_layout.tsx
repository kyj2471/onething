import { Redirect, Stack } from "expo-router";
import { View, ActivityIndicator } from "react-native";
import { useSession } from "@/hooks/useSession";
import { useTheme } from "@/hooks/useTheme";

export default function AuthLayout() {
  const { session, loading } = useSession();
  const { palette } = useTheme();

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: palette.bg,
        }}
      >
        <ActivityIndicator color={palette.fg} />
      </View>
    );
  }

  if (session) {
    return <Redirect href="/(app)/today" />;
  }

  return <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: palette.bg } }} />;
}
