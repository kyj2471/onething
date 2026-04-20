import { Redirect, Stack } from "expo-router";
import { useSession } from "@/hooks/useSession";
import { useTheme } from "@/hooks/useTheme";

export default function ModalsLayout() {
  const { palette } = useTheme();
  const { session, loading } = useSession();
  if (!loading && !session) return <Redirect href="/(auth)/welcome" />;
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: palette.bg },
      }}
    />
  );
}
