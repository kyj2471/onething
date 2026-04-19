import { setRequestLocale, getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { TargetRowsForm } from "@/components/goal/TargetRowsForm";
import { OnboardingStepper } from "@/components/onboarding/OnboardingStepper";

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
    <main className="flex flex-1 flex-col gap-7">
      <OnboardingStepper step={2} ariaLabel={t("step")} />
      <header className="flex flex-col gap-2">
        <p className="text-caption text-fg-subtle">{t("step")}</p>
        <h1 className="font-display text-[32px] italic leading-tight text-fg">
          {t("title")}
        </h1>
        <p className="text-body text-fg-muted">{t("body")}</p>
      </header>
      <TargetRowsForm
        locale={params.locale}
        objectiveTitle={goal.title}
        initial={initial}
      />
    </main>
  );
}
