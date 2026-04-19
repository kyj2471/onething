import { setRequestLocale, getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { TargetRowsForm } from "@/components/goal/TargetRowsForm";

export default async function TargetsStepPage({
  params,
}: {
  params: { locale: string };
}) {
  setRequestLocale(params.locale);
  const t = await getTranslations("onboarding.targets");

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/${params.locale}/login`);

  const { data: goal } = await supabase
    .from("goals")
    .select("id, title")
    .eq("user_id", user.id)
    .eq("status", "active")
    .maybeSingle();
  if (!goal) redirect(`/${params.locale}/onboarding/goal`);

  const { data: targets } = await supabase
    .from("targets")
    .select("title, target_value, current_value, order_index")
    .eq("goal_id", goal.id)
    .order("order_index", { ascending: true });

  const initial =
    targets?.map((r) => ({
      title: r.title,
      target: String(r.target_value),
      current: r.current_value ? String(r.current_value) : "",
    })) ?? [];

  return (
    <main className="flex flex-1 flex-col gap-6">
      <header>
        <p className="font-mono text-xs uppercase tracking-wider text-muted">
          {t("step")}
        </p>
        <h1 className="mt-1 font-display text-3xl italic">{t("title")}</h1>
        <p className="mt-2 font-body text-sm text-muted">{t("body")}</p>
      </header>
      <TargetRowsForm
        locale={params.locale}
        objectiveTitle={goal.title}
        initial={initial}
      />
    </main>
  );
}
