import { useEffect } from "react";
import { View, ActivityIndicator, Text } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { supabase } from "@/lib/supabase";
import { useTheme } from "@/hooks/useTheme";
import { typography } from "@/constants/typography";

export default function AuthCallbackScreen() {
  const { palette } = useTheme();
  const params = useLocalSearchParams<{
    code?: string;
    access_token?: string;
    refresh_token?: string;
    error_description?: string;
  }>();

  useEffect(() => {
    (async () => {
      if (params.error_description) {
        router.replace("/(auth)/welcome");
        return;
      }

      if (params.access_token && params.refresh_token) {
        const { error } = await supabase.auth.setSession({
          access_token: params.access_token,
          refresh_token: params.refresh_token,
        });
        if (error) {
          router.replace("/(auth)/login");
          return;
        }
      } else if (params.code) {
        const { error } = await supabase.auth.exchangeCodeForSession(params.code);
        if (error) {
          router.replace("/(auth)/login");
          return;
        }
      }

      router.replace("/(onboarding)/welcome");
    })();
  }, [params]);

  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: palette.bg,
        gap: 16,
      }}
    >
      <ActivityIndicator color={palette.fg} />
      <Text style={[typography.bodySm, { color: palette.fgMuted }]}>
        Finishing sign in...
      </Text>
    </View>
  );
}
