import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { todayISO } from "@/lib/calculations";
import type { Database } from "@/types/supabase";

type GoalRow = Pick<
  Database["public"]["Tables"]["goals"]["Row"],
  "id" | "title"
>;
type TargetRow = Pick<
  Database["public"]["Tables"]["targets"]["Row"],
  "id" | "title" | "target_value" | "current_value"
>;
type ActionRow = Pick<
  Database["public"]["Tables"]["actions"]["Row"],
  "id" | "title" | "target_id" | "is_active"
>;
type HeatmapRow =
  Database["public"]["Functions"]["get_heatmap_data"]["Returns"][number];

export type TodayData = {
  displayName: string | null;
  goal: GoalRow | null;
  targets: TargetRow[];
  actions: ActionRow[];
  todayCompletedActionIds: string[];
  heatmap: HeatmapRow[];
  streak: number;
};

export function todayQueryKey(userId: string) {
  return ["today", userId] as const;
}

export function useToday(userId: string | undefined) {
  return useQuery({
    queryKey: todayQueryKey(userId ?? "_"),
    enabled: !!userId,
    queryFn: async (): Promise<TodayData> => {
      if (!userId) throw new Error("No user");
      const [profileRes, goalRes, heatmapRes, streakRes] = await Promise.all([
        supabase
          .from("profiles")
          .select("display_name")
          .eq("id", userId)
          .maybeSingle(),
        supabase
          .from("goals")
          .select("id, title")
          .eq("user_id", userId)
          .eq("status", "active")
          .maybeSingle(),
        supabase.rpc("get_heatmap_data", { p_user_id: userId, p_days: 56 }),
        supabase.rpc("get_streak", { p_user_id: userId }),
      ]);

      const goal = (goalRes.data as GoalRow | null) ?? null;
      if (!goal) {
        return {
          displayName: profileRes.data?.display_name ?? null,
          goal: null,
          targets: [],
          actions: [],
          todayCompletedActionIds: [],
          heatmap: (heatmapRes.data as HeatmapRow[] | null) ?? [],
          streak: (streakRes.data as number | null) ?? 0,
        };
      }

      const targetsRes = await supabase
        .from("targets")
        .select("id, title, target_value, current_value")
        .eq("goal_id", goal.id)
        .order("order_index", { ascending: true });

      const targets = (targetsRes.data as TargetRow[] | null) ?? [];
      const targetIds = targets.map((t) => t.id);

      let actions: ActionRow[] = [];
      let todayCompletedActionIds: string[] = [];
      if (targetIds.length > 0) {
        const actionsRes = await supabase
          .from("actions")
          .select("id, title, target_id, is_active")
          .in("target_id", targetIds)
          .eq("is_active", true);
        actions = (actionsRes.data as ActionRow[] | null) ?? [];

        const actionIds = actions.map((a) => a.id);
        if (actionIds.length > 0) {
          const logsRes = await supabase
            .from("action_logs")
            .select("action_id")
            .eq("user_id", userId)
            .eq("completed_date", todayISO())
            .in("action_id", actionIds);
          todayCompletedActionIds = (
            (logsRes.data as { action_id: string }[] | null) ?? []
          ).map((l) => l.action_id);
        }
      }

      return {
        displayName: profileRes.data?.display_name ?? null,
        goal,
        targets,
        actions,
        todayCompletedActionIds,
        heatmap: (heatmapRes.data as HeatmapRow[] | null) ?? [],
        streak: (streakRes.data as number | null) ?? 0,
      };
    },
  });
}
