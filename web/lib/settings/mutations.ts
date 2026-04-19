"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
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

const reminderSchema = z.object({
  reminder_time: z.string().regex(/^\d{2}:\d{2}$/),
});

export async function updateReminderTime(formData: FormData): Promise<void> {
  const parsed = reminderSchema.safeParse({
    reminder_time: formData.get("reminder_time"),
  });
  if (!parsed.success) throw new Error("invalid_reminder");

  const { supabase, user } = await requireUser();
  const { error } = await supabase
    .from("profiles")
    .update({ reminder_time: `${parsed.data.reminder_time}:00` })
    .eq("id", user.id);
  if (error) throw new Error(error.message);

  revalidatePath("/", "layout");
}

const themeSchema = z.object({
  theme: z.enum(["light", "dark", "system"]),
});

export async function updateTheme(formData: FormData): Promise<void> {
  const parsed = themeSchema.safeParse({ theme: formData.get("theme") });
  if (!parsed.success) throw new Error("invalid_theme");

  const { supabase, user } = await requireUser();
  const { error } = await supabase
    .from("profiles")
    .update({ theme: parsed.data.theme })
    .eq("id", user.id);
  if (error) throw new Error(error.message);

  cookies().set("onething_theme", parsed.data.theme, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });

  revalidatePath("/", "layout");
}

const languageSchema = z.object({
  locale: z.enum(["en", "ko"]),
  current: z.string(),
});

export async function updateLanguage(formData: FormData): Promise<void> {
  const parsed = languageSchema.safeParse({
    locale: formData.get("locale"),
    current: formData.get("current"),
  });
  if (!parsed.success) throw new Error("invalid_locale");

  const { supabase, user } = await requireUser();
  await supabase
    .from("profiles")
    .update({ locale: parsed.data.locale })
    .eq("id", user.id);

  revalidatePath("/", "layout");
  redirect(`/${parsed.data.locale}/app/settings`);
}
