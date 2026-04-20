import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { Redirect } from "expo-router";
import { useSession } from "@/hooks/useSession";
import { useTheme } from "@/hooks/useTheme";
import { supabase } from "@/lib/supabase";

type ProfileCheck =
  | { status: "loading" }
  | { status: "needs-onboarding" }
  | { status: "done" }
  | { status: "missing" };

export default function IndexRedirect() {
  const { palette } = useTheme();
  const { session, loading } = useSession();
  const [profile, setProfile] = useState<ProfileCheck>({ status: "loading" });

  useEffect(() => {
    if (!session) {
      setProfile({ status: "missing" });
      return;
    }
    setProfile({ status: "loading" });
    (async () => {
      const { data, error } = await supabase
        .from("goals")
        .select("id")
        .eq("user_id", session.user.id)
        .eq("status", "active")
        .limit(1);
      if (error) {
        setProfile({ status: "needs-onboarding" });
        return;
      }
      setProfile({
        status: (data ?? []).length > 0 ? "done" : "needs-onboarding",
      });
    })();
  }, [session]);

  if (loading || profile.status === "loading") {
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

  if (!session) return <Redirect href="/(auth)/welcome" />;
  if (profile.status === "needs-onboarding")
    return <Redirect href="/(onboarding)/welcome" />;
  return <Redirect href="/(app)/today" />;
}
