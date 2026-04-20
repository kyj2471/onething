import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { Database } from "@/types/supabase";

type GoalRow = Pick<
  Database["public"]["Tables"]["goals"]["Row"],
  "id" | "title" | "description" | "start_date" | "end_date"
>;
type TargetRow = Pick<
  Database["public"]["Tables"]["targets"]["Row"],
  "id" | "title" | "target_value" | "current_value"
>;
type ActionRow = Pick<
  Database["public"]["Tables"]["actions"]["Row"],
  "id" | "title" | "target_id"
>;

export type GoalData = {
  goal: GoalRow | null;
  targets: TargetRow[];
  actionsByTarget: Record<string, ActionRow[]>;
};

export function goalQueryKey(userId: string) {
  return ["goal", userId] as const;
}

export function useGoal(userId: string | undefined) {
  return useQuery({
    queryKey: goalQueryKey(userId ?? "_"),
    enabled: !!userId,
    queryFn: async (): Promise<GoalData> => {
      if (!userId) throw new Error("No user");

      const goalRes = await supabase
        .from("goals")
        .select("id, title, description, start_date, end_date")
        .eq("user_id", userId)
        .eq("status", "active")
        .maybeSingle();

      const goal = (goalRes.data as GoalRow | null) ?? null;
      if (!goal) return { goal: null, targets: [], actionsByTarget: {} };

      const targetsRes = await supabase
        .from("targets")
        .select("id, title, target_value, current_value")
        .eq("goal_id", goal.id)
        .order("order_index", { ascending: true });

      const targets = (targetsRes.data as TargetRow[] | null) ?? [];
      const targetIds = targets.map((t) => t.id);

      const actionsByTarget: Record<string, ActionRow[]> = {};
      targetIds.forEach((id) => (actionsByTarget[id] = []));

      if (targetIds.length > 0) {
        const actionsRes = await supabase
          .from("actions")
          .select("id, title, target_id")
          .in("target_id", targetIds)
          .eq("is_active", true)
          .order("created_at", { ascending: true });
        const actions = (actionsRes.data as ActionRow[] | null) ?? [];
        for (const a of actions) {
          (actionsByTarget[a.target_id] ??= []).push(a);
        }
      }

      return { goal, targets, actionsByTarget };
    },
  });
}
