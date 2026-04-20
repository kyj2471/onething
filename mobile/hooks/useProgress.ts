import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { Database } from "@/types/supabase";

type HeatmapRow =
  Database["public"]["Functions"]["get_heatmap_data"]["Returns"][number];

export type ProgressData = {
  heatmap: HeatmapRow[];
  streak: number;
};

export function progressQueryKey(userId: string) {
  return ["progress", userId] as const;
}

export function useProgress(userId: string | undefined) {
  return useQuery({
    queryKey: progressQueryKey(userId ?? "_"),
    enabled: !!userId,
    queryFn: async (): Promise<ProgressData> => {
      if (!userId) throw new Error("No user");
      const [heatmapRes, streakRes] = await Promise.all([
        supabase.rpc("get_heatmap_data", { p_user_id: userId, p_days: 365 }),
        supabase.rpc("get_streak", { p_user_id: userId }),
      ]);
      return {
        heatmap: (heatmapRes.data as HeatmapRow[] | null) ?? [],
        streak: (streakRes.data as number | null) ?? 0,
      };
    },
  });
}
