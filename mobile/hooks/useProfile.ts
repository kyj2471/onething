import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { Database } from "@/types/supabase";

type ProfileRow = Pick<
  Database["public"]["Tables"]["profiles"]["Row"],
  | "email"
  | "display_name"
  | "reminder_time"
  | "theme"
  | "locale"
  | "subscription_status"
  | "trial_ends_at"
>;

export function profileQueryKey(userId: string) {
  return ["profile", userId] as const;
}

export function useProfile(userId: string | undefined) {
  return useQuery({
    queryKey: profileQueryKey(userId ?? "_"),
    enabled: !!userId,
    queryFn: async (): Promise<ProfileRow | null> => {
      if (!userId) throw new Error("No user");
      const { data } = await supabase
        .from("profiles")
        .select(
          "email, display_name, reminder_time, theme, locale, subscription_status, trial_ends_at",
        )
        .eq("id", userId)
        .maybeSingle();
      return (data as ProfileRow | null) ?? null;
    },
  });
}
