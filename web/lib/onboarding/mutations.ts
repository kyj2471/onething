"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

async function requireUser() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/en/login");
  return { supabase, user };
}

const goalSchema = z
  .object({
    title: z.string().trim().min(1).max(200),
    description: z.string().trim().max(500).optional(),
    start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    locale: z.string(),
  })
  .refine((v) => v.end_date >= v.start_date, {
    message: "end_before_start",
    path: ["end_date"],
  });

export async function createGoal(formData: FormData): Promise<void> {
  const raw = {
    title: formData.get("title"),
    description: formData.get("description") ?? undefined,
    start_date: formData.get("start_date"),
    end_date: formData.get("end_date"),
    locale: formData.get("locale"),
  };
  const parsed = goalSchema.safeParse(raw);
  if (!parsed.success) throw new Error("invalid_goal_title");

  const { supabase, user } = await requireUser();

  const { data: existing } = await supabase
    .from("goals")
    .select("id")
    .eq("user_id", user.id)
    .eq("status", "active")
    .maybeSingle();

  const payload = {
    title: parsed.data.title,
    description: parsed.data.description ?? null,
    start_date: parsed.data.start_date,
    end_date: parsed.data.end_date,
  };

  if (existing) {
    await supabase.from("goals").update(payload).eq("id", existing.id);
  } else {
    const { error } = await supabase
      .from("goals")
      .insert({ user_id: user.id, ...payload });
    if (error) throw new Error(error.message);
  }

  revalidatePath("/", "layout");
  redirect(`/${parsed.data.locale}/onboarding/targets`);
}

const targetRowSchema = z.object({
  title: z.string().trim().min(1),
  target_value: z.coerce.number().positive(),
  current_value: z.coerce.number().min(0),
});

export async function createTargets(formData: FormData): Promise<void> {
  const locale = String(formData.get("locale") ?? "en");
  const titles = formData.getAll("target_title").map(String);
  const values = formData.getAll("target_value").map(String);
  const currents = formData.getAll("target_current").map(String);

  const rows = titles
    .map((title, i) => ({
      title,
      target_value: values[i] ?? "",
      current_value: currents[i]?.trim() === "" ? 0 : (currents[i] ?? 0),
    }))
    .filter((r) => r.title.trim().length > 0);

  if (rows.length === 0) throw new Error("no_targets");

  const parsed = rows.map((r) => {
    const p = targetRowSchema.safeParse(r);
    if (!p.success) throw new Error("invalid_target_row");
    return p.data;
  });

  const { supabase, user } = await requireUser();

  const { data: goal } = await supabase
    .from("goals")
    .select("id")
    .eq("user_id", user.id)
    .eq("status", "active")
    .maybeSingle();
  if (!goal) throw new Error("no_active_goal");

  await supabase.from("targets").delete().eq("goal_id", goal.id);

  const { error } = await supabase.from("targets").insert(
    parsed.map((row, i) => ({
      goal_id: goal.id,
      title: row.title,
      target_value: row.target_value,
      current_value: row.current_value,
      order_index: i,
    })),
  );
  if (error) throw new Error(error.message);

  revalidatePath("/", "layout");
  redirect(`/${locale}/onboarding/actions`);
}

export async function createActions(formData: FormData): Promise<void> {
  const locale = String(formData.get("locale") ?? "en");
  const { supabase, user } = await requireUser();

  const { data: goal } = await supabase
    .from("goals")
    .select("id")
    .eq("user_id", user.id)
    .eq("status", "active")
    .maybeSingle();
  if (!goal) throw new Error("no_active_goal");

  const { data: targets } = await supabase
    .from("targets")
    .select("id, order_index")
    .eq("goal_id", goal.id)
    .order("order_index", { ascending: true });

  if (!targets || targets.length === 0) throw new Error("no_targets");

  await supabase
    .from("actions")
    .delete()
    .in(
      "target_id",
      targets.map((t) => t.id),
    );

  const rows: { target_id: string; title: string }[] = [];
  for (const target of targets) {
    const titles = formData
      .getAll(`actions_${target.id}`)
      .map((v) => String(v).trim())
      .filter((s) => s.length > 0);
    for (const title of titles) {
      rows.push({ target_id: target.id, title });
    }
  }

  if (rows.length === 0) throw new Error("no_actions");

  const { error } = await supabase.from("actions").insert(rows);
  if (error) throw new Error(error.message);

  revalidatePath("/", "layout");
  redirect(`/${locale}/onboarding/reminder`);
}

const reminderSchema = z.object({
  reminder_time: z.string().regex(/^\d{2}:\d{2}$/),
  locale: z.string(),
});

export async function updateReminder(formData: FormData): Promise<void> {
  const parsed = reminderSchema.safeParse({
    reminder_time: formData.get("reminder_time"),
    locale: formData.get("locale"),
  });
  if (!parsed.success) throw new Error("invalid_reminder");

  const { supabase, user } = await requireUser();

  const { error } = await supabase
    .from("profiles")
    .update({ reminder_time: `${parsed.data.reminder_time}:00` })
    .eq("id", user.id);
  if (error) throw new Error(error.message);

  revalidatePath("/", "layout");
  redirect(`/${parsed.data.locale}/onboarding/trial`);
}

export async function finishOnboarding(formData: FormData): Promise<void> {
  const locale = String(formData.get("locale") ?? "en");
  await requireUser();
  revalidatePath("/", "layout");
  redirect(`/${locale}/app/today`);
}
