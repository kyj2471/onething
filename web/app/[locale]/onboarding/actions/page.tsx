import { setRequestLocale, getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { OnboardingActionsForm } from "@/components/onboarding/OnboardingActionsForm";

export default async function ActionsStepPage({
  params,
}: {
  params: { locale: string };
}) {
  setRequestLocale(params.locale);
  const t = await getTranslations("onboarding.actions");

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/${params.locale}/login`);

  const { data: goal } = await supabase
    .from("goals")
    .select("id")
    .eq("user_id", user.id)
    .eq("status", "active")
    .maybeSingle();
  if (!goal) redirect(`/${params.locale}/onboarding/goal`);

  const { data: targets } = await supabase
    .from("targets")
    .select("id, title, target_value, current_value, order_index")
    .eq("goal_id", goal.id)
    .order("order_index", { ascending: true });

  if (!targets || targets.length === 0) {
    redirect(`/${params.locale}/onboarding/targets`);
  }

  const { data: existingActions } = await supabase
    .from("actions")
    .select("target_id, title")
    .in(
      "target_id",
      targets.map((x) => x.id),
    );

  const initialByTarget: Record<string, string[]> = {};
  for (const target of targets) {
    initialByTarget[target.id] =
      existingActions
        ?.filter((a) => a.target_id === target.id)
        .map((a) => a.title) ?? [];
  }

  return (
    <main className="flex flex-1 flex-col gap-6">
      <header>
        <p className="font-mono text-xs uppercase tracking-wider text-muted">
          {t("step")}
        </p>
        <h1 className="mt-1 font-display text-3xl italic">{t("title")}</h1>
        <p className="mt-2 font-body text-sm text-muted">{t("body")}</p>
      </header>
      <OnboardingActionsForm
        locale={params.locale}
        targets={targets.map((t) => ({
          id: t.id,
          title: t.title,
          current_value: t.current_value,
          target_value: t.target_value,
        }))}
        initialByTarget={initialByTarget}
      />
    </main>
  );
}
