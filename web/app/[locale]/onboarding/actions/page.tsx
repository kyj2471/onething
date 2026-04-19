import { setRequestLocale, getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { OnboardingActionsForm } from "@/components/onboarding/OnboardingActionsForm";
import { OnboardingStepper } from "@/components/onboarding/OnboardingStepper";

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
    <main className="flex flex-1 flex-col gap-7">
      <OnboardingStepper step={3} ariaLabel={t("step")} />
      <header className="flex flex-col gap-2">
        <p className="text-caption text-fg-subtle">{t("step")}</p>
        <h1 className="font-display text-[32px] italic leading-tight text-fg">
          {t("title")}
        </h1>
        <p className="text-body text-fg-muted">{t("body")}</p>
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
