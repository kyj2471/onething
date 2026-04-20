import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { Database } from "@/types/supabase";

type ActionRow = Pick<
  Database["public"]["Tables"]["actions"]["Row"],
  "id" | "title" | "target_id"
>;

export type DayDetailData = {
  date: string;
  total: number;
  completed: number;
  actions: Array<{ action: ActionRow; completed: boolean }>;
};

export function dayDetailQueryKey(userId: string, date: string) {
  return ["day-detail", userId, date] as const;
}

export function useDayDetail(userId: string | undefined, date: string) {
  return useQuery({
    queryKey: dayDetailQueryKey(userId ?? "_", date),
    enabled: !!userId && !!date,
    queryFn: async (): Promise<DayDetailData> => {
      if (!userId) throw new Error("No user");
      const goalRes = await supabase
        .from("goals")
        .select("id")
        .eq("user_id", userId)
        .eq("status", "active")
        .maybeSingle();
      const goalId = (goalRes.data as { id: string } | null)?.id;
      if (!goalId) {
        return { date, total: 0, completed: 0, actions: [] };
      }

      const targetsRes = await supabase
        .from("targets")
        .select("id")
        .eq("goal_id", goalId);
      const targetIds = (
        (targetsRes.data as { id: string }[] | null) ?? []
      ).map((t) => t.id);
      if (targetIds.length === 0) {
        return { date, total: 0, completed: 0, actions: [] };
      }

      const actionsRes = await supabase
        .from("actions")
        .select("id, title, target_id")
        .in("target_id", targetIds)
        .eq("is_active", true);
      const actions = (actionsRes.data as ActionRow[] | null) ?? [];

      const actionIds = actions.map((a) => a.id);
      let completedSet = new Set<string>();
      if (actionIds.length > 0) {
        const logsRes = await supabase
          .from("action_logs")
          .select("action_id")
          .eq("user_id", userId)
          .eq("completed_date", date)
          .in("action_id", actionIds);
        completedSet = new Set(
          (
            (logsRes.data as { action_id: string }[] | null) ?? []
          ).map((l) => l.action_id),
        );
      }

      return {
        date,
        total: actions.length,
        completed: completedSet.size,
        actions: actions.map((a) => ({
          action: a,
          completed: completedSet.has(a.id),
        })),
      };
    },
  });
}
