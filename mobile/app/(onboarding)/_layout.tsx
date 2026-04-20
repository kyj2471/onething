import { Redirect, Stack, usePathname } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, ActivityIndicator } from "react-native";
import { Stepper } from "@/components/ui";
import { useSession } from "@/hooks/useSession";
import { useTheme } from "@/hooks/useTheme";

const ORDER = ["welcome", "goal", "targets", "actions", "reminder", "trial"] as const;

export default function OnboardingLayout() {
  const { palette } = useTheme();
  const { session, loading } = useSession();
  const pathname = usePathname();

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: palette.bg }}>
        <ActivityIndicator color={palette.fg} />
      </View>
    );
  }

  if (!session) return <Redirect href="/(auth)/welcome" />;

  const segment = ORDER.find((s) => pathname.endsWith(`/${s}`)) ?? "welcome";
  const current = ORDER.indexOf(segment) + 1;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: palette.bg }} edges={["top"]}>
      <View style={{ paddingHorizontal: 24, paddingTop: 16, paddingBottom: 8 }}>
        <Stepper total={ORDER.length} current={current} />
      </View>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: palette.bg },
        }}
      />
    </SafeAreaView>
  );
}
