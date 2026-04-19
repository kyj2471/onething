"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { todayISO } from "@/lib/calculations";

async function requireUser() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/en/login");
  return { supabase, user };
}

async function requireActiveGoal() {
  const { supabase, user } = await requireUser();
  const { data: goal } = await supabase
    .from("goals")
    .select("id")
    .eq("user_id", user.id)
    .eq("status", "active")
    .maybeSingle();
  if (!goal) throw new Error("no_active_goal");
  return { supabase, user, goal };
}

export async function toggleAction(formData: FormData): Promise<void> {
  const actionId = String(formData.get("action_id") ?? "");
  const completed = String(formData.get("completed") ?? "") === "true";
  if (!actionId) throw new Error("missing_action_id");

  const { supabase, user } = await requireUser();
  const date = todayISO();

  if (completed) {
    await supabase
      .from("action_logs")
      .delete()
      .eq("user_id", user.id)
      .eq("action_id", actionId)
      .eq("completed_date", date);
  } else {
    const { error } = await supabase.from("action_logs").insert({
      action_id: actionId,
      user_id: user.id,
      completed_date: date,
    });
    if (error && !error.message.includes("duplicate"))
      throw new Error(error.message);
  }

  revalidatePath("/", "layout");
}

const targetValueSchema = z.object({
  target_id: z.string().uuid(),
  current_value: z.coerce.number().min(0),
});

export async function updateTargetValue(formData: FormData): Promise<void> {
  const parsed = targetValueSchema.safeParse({
    target_id: formData.get("target_id"),
    current_value: formData.get("current_value"),
  });
  if (!parsed.success) throw new Error("invalid_target_value");

  const { supabase } = await requireActiveGoal();

  const { error } = await supabase
    .from("targets")
    .update({ current_value: parsed.data.current_value })
    .eq("id", parsed.data.target_id);
  if (error) throw new Error(error.message);

  revalidatePath("/", "layout");
}

const addTargetSchema = z.object({
  title: z.string().trim().min(1).max(120),
  target_value: z.coerce.number().positive(),
});

export async function addTarget(formData: FormData): Promise<void> {
  const parsed = addTargetSchema.safeParse({
    title: formData.get("title"),
    target_value: formData.get("target_value"),
  });
  if (!parsed.success) throw new Error("invalid_target");

  const { supabase, goal } = await requireActiveGoal();

  const { data: lastRow } = await supabase
    .from("targets")
    .select("order_index")
    .eq("goal_id", goal.id)
    .order("order_index", { ascending: false })
    .limit(1)
    .maybeSingle();
  const nextIndex = (lastRow?.order_index ?? -1) + 1;

  const { error } = await supabase.from("targets").insert({
    goal_id: goal.id,
    title: parsed.data.title,
    target_value: parsed.data.target_value,
    order_index: nextIndex,
  });
  if (error) throw new Error(error.message);

  revalidatePath("/", "layout");
}

const updateTargetSchema = z.object({
  target_id: z.string().uuid(),
  title: z.string().trim().min(1).max(120),
  target_value: z.coerce.number().positive(),
});

export async function updateTarget(formData: FormData): Promise<void> {
  const parsed = updateTargetSchema.safeParse({
    target_id: formData.get("target_id"),
    title: formData.get("title"),
    target_value: formData.get("target_value"),
  });
  if (!parsed.success) throw new Error("invalid_target");

  const { supabase } = await requireActiveGoal();

  const { error } = await supabase
    .from("targets")
    .update({
      title: parsed.data.title,
      target_value: parsed.data.target_value,
    })
    .eq("id", parsed.data.target_id);
  if (error) throw new Error(error.message);

  revalidatePath("/", "layout");
}

export async function deleteTarget(formData: FormData): Promise<void> {
  const targetId = String(formData.get("target_id") ?? "");
  if (!targetId) throw new Error("missing_target_id");

  const { supabase } = await requireActiveGoal();

  const { error } = await supabase.from("targets").delete().eq("id", targetId);
  if (error) throw new Error(error.message);

  revalidatePath("/", "layout");
}

const addActionSchema = z.object({
  target_id: z.string().uuid(),
  title: z.string().trim().min(1).max(120),
});

export async function addAction(formData: FormData): Promise<void> {
  const parsed = addActionSchema.safeParse({
    target_id: formData.get("target_id"),
    title: formData.get("title"),
  });
  if (!parsed.success) throw new Error("invalid_action");

  const { supabase } = await requireActiveGoal();

  const { error } = await supabase.from("actions").insert({
    target_id: parsed.data.target_id,
    title: parsed.data.title,
  });
  if (error) throw new Error(error.message);

  revalidatePath("/", "layout");
}

const updateActionSchema = z.object({
  action_id: z.string().uuid(),
  title: z.string().trim().min(1).max(120),
});

export async function updateAction(formData: FormData): Promise<void> {
  const parsed = updateActionSchema.safeParse({
    action_id: formData.get("action_id"),
    title: formData.get("title"),
  });
  if (!parsed.success) throw new Error("invalid_action");

  const { supabase } = await requireActiveGoal();

  const { error } = await supabase
    .from("actions")
    .update({ title: parsed.data.title })
    .eq("id", parsed.data.action_id);
  if (error) throw new Error(error.message);

  revalidatePath("/", "layout");
}

export async function deleteAction(formData: FormData): Promise<void> {
  const actionId = String(formData.get("action_id") ?? "");
  if (!actionId) throw new Error("missing_action_id");

  const { supabase } = await requireActiveGoal();

  const { error } = await supabase.from("actions").delete().eq("id", actionId);
  if (error) throw new Error(error.message);

  revalidatePath("/", "layout");
}

const updateGoalSchema = z
  .object({
    title: z.string().trim().min(1).max(200),
    description: z.string().trim().max(500).optional(),
    start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  })
  .refine((v) => v.end_date >= v.start_date, {
    message: "end_before_start",
    path: ["end_date"],
  });

export async function updateGoal(formData: FormData): Promise<void> {
  const parsed = updateGoalSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description") ?? undefined,
    start_date: formData.get("start_date"),
    end_date: formData.get("end_date"),
  });
  if (!parsed.success) throw new Error("invalid_goal");

  const { supabase, goal } = await requireActiveGoal();

  const { error } = await supabase
    .from("goals")
    .update({
      title: parsed.data.title,
      description: parsed.data.description ?? null,
      start_date: parsed.data.start_date,
      end_date: parsed.data.end_date,
    })
    .eq("id", goal.id);
  if (error) throw new Error(error.message);

  revalidatePath("/", "layout");
}

export async function deleteGoal(formData: FormData): Promise<void> {
  const locale = String(formData.get("locale") ?? "en");
  const { supabase, goal } = await requireActiveGoal();

  const { error } = await supabase.from("goals").delete().eq("id", goal.id);
  if (error) throw new Error(error.message);

  revalidatePath("/", "layout");
  redirect(`/${locale}/onboarding/welcome`);
}

export async function completeGoal(formData: FormData): Promise<void> {
  const locale = String(formData.get("locale") ?? "en");
  const { supabase, goal } = await requireActiveGoal();

  const { error } = await supabase
    .from("goals")
    .update({ status: "completed", completed_at: new Date().toISOString() })
    .eq("id", goal.id);
  if (error) throw new Error(error.message);

  revalidatePath("/", "layout");
  redirect(`/${locale}/onboarding/welcome`);
}
