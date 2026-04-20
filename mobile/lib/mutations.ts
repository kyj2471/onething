import { supabase } from "@/lib/supabase";
import { todayISO } from "@/lib/calculations";

export async function toggleAction(args: {
  userId: string;
  actionId: string;
  date?: string;
  currentlyCompleted: boolean;
}) {
  const date = args.date ?? todayISO();
  if (args.currentlyCompleted) {
    const { error } = await supabase
      .from("action_logs")
      .delete()
      .eq("user_id", args.userId)
      .eq("action_id", args.actionId)
      .eq("completed_date", date);
    if (error) throw error;
    return { completed: false };
  } else {
    const { error } = await supabase.from("action_logs").insert({
      user_id: args.userId,
      action_id: args.actionId,
      completed_date: date,
    });
    if (error) throw error;
    return { completed: true };
  }
}

export async function updateTargetValue(args: {
  targetId: string;
  currentValue: number;
}) {
  if (!Number.isFinite(args.currentValue) || args.currentValue < 0) {
    throw new Error("Invalid value");
  }
  const { error } = await supabase
    .from("targets")
    .update({ current_value: args.currentValue })
    .eq("id", args.targetId);
  if (error) throw error;
}

export async function updateTarget(args: {
  targetId: string;
  title: string;
  targetValue: number;
}) {
  const { error } = await supabase
    .from("targets")
    .update({ title: args.title, target_value: args.targetValue })
    .eq("id", args.targetId);
  if (error) throw error;
}

export async function deleteTarget(targetId: string) {
  const { error } = await supabase.from("targets").delete().eq("id", targetId);
  if (error) throw error;
}

export async function addAction(args: { targetId: string; title: string }) {
  const { error } = await supabase
    .from("actions")
    .insert({ target_id: args.targetId, title: args.title });
  if (error) throw error;
}

export async function updateAction(args: { actionId: string; title: string }) {
  const { error } = await supabase
    .from("actions")
    .update({ title: args.title })
    .eq("id", args.actionId);
  if (error) throw error;
}

export async function deleteAction(actionId: string) {
  const { error } = await supabase.from("actions").delete().eq("id", actionId);
  if (error) throw error;
}

export async function updateGoal(args: {
  goalId: string;
  title: string;
  description: string | null;
  startDate: string;
  endDate: string;
}) {
  const { error } = await supabase
    .from("goals")
    .update({
      title: args.title,
      description: args.description,
      start_date: args.startDate,
      end_date: args.endDate,
    })
    .eq("id", args.goalId);
  if (error) throw error;
}

export async function completeGoal(goalId: string) {
  const { error } = await supabase
    .from("goals")
    .update({ status: "completed", completed_at: new Date().toISOString() })
    .eq("id", goalId);
  if (error) throw error;
}

export async function deleteGoal(goalId: string) {
  const { error } = await supabase.from("goals").delete().eq("id", goalId);
  if (error) throw error;
}

export async function updateProfile(args: {
  userId: string;
  patch: {
    display_name?: string;
    reminder_time?: string;
    theme?: "light" | "dark" | "system";
    locale?: string;
  };
}) {
  const { error } = await supabase
    .from("profiles")
    .update(args.patch)
    .eq("id", args.userId);
  if (error) throw error;
}

export async function requestDeletion(args: { userId: string; email: string }) {
  const { error } = await supabase.from("deletion_requests").insert({
    user_id: args.userId,
    email: args.email,
  });
  if (error) throw error;
}
