import { setRequestLocale, getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { OnboardingGoalForm } from "@/components/onboarding/OnboardingGoalForm";
import { OnboardingStepper } from "@/components/onboarding/OnboardingStepper";

export default async function GoalStepPage({
  params,
}: {
  params: { locale: string };
}) {
  setRequestLocale(params.locale);
  const t = await getTranslations("onboarding.goal");

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let existing = {
    title: "",
    description: "",
    start_date: "",
    end_date: "",
  };
  if (user) {
    const { data } = await supabase
      .from("goals")
      .select("title, description, start_date, end_date")
      .eq("user_id", user.id)
      .eq("status", "active")
      .maybeSingle();
    if (data) {
      existing = {
        title: data.title ?? "",
        description: data.description ?? "",
        start_date: data.start_date ?? "",
        end_date: data.end_date ?? "",
      };
    }
  }

  return (
    <main className="flex flex-1 flex-col gap-7">
      <OnboardingStepper step={1} ariaLabel={t("step")} />
      <header className="flex flex-col gap-2">
        <p className="text-caption text-fg-subtle">{t("step")}</p>
        <h1 className="font-display text-[32px] italic leading-tight text-fg">
          {t("title")}
        </h1>
        <p className="text-body text-fg-muted">{t("body")}</p>
      </header>
      <OnboardingGoalForm locale={params.locale} initial={existing} />
    </main>
  );
}
