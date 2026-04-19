import { createClient } from "@/lib/supabase/server";

export async function postLoginPath(locale: string): Promise<string> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return `/${locale}/login`;

  const { data: goal } = await supabase
    .from("goals")
    .select("id")
    .eq("user_id", user.id)
    .eq("status", "active")
    .maybeSingle();

  return goal ? `/${locale}/app/today` : `/${locale}/onboarding/welcome`;
}
