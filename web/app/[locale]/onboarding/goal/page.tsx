import { setRequestLocale, getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { OnboardingGoalForm } from "@/components/onboarding/OnboardingGoalForm";

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
    <main className="flex flex-1 flex-col gap-6">
      <header>
        <p className="font-mono text-xs uppercase tracking-wider text-muted">
          {t("step")}
        </p>
        <h1 className="mt-1 font-display text-3xl italic">{t("title")}</h1>
        <p className="mt-2 font-body text-sm text-muted">{t("body")}</p>
      </header>
      <OnboardingGoalForm locale={params.locale} initial={existing} />
    </main>
  );
}
