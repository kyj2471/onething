import { setRequestLocale, getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { finishOnboarding } from "@/lib/onboarding/mutations";
import { Badge, Button } from "@/components/ui";
import { OnboardingStepper } from "@/components/onboarding/OnboardingStepper";

export default async function TrialStepPage({
  params,
}: {
  params: { locale: string };
}) {
  setRequestLocale(params.locale);
  const t = await getTranslations("onboarding.trial");

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/${params.locale}/login`);

  const { data: profile } = await supabase
    .from("profiles")
    .select("trial_ends_at")
    .eq("id", user.id)
    .maybeSingle();

  const trialEnd = profile?.trial_ends_at
    ? new Date(profile.trial_ends_at).toLocaleDateString(params.locale)
    : null;

  return (
    <main className="flex flex-1 flex-col gap-7">
      <OnboardingStepper step={5} ariaLabel={t("step")} />
      <div className="flex flex-1 flex-col justify-center gap-6 text-center">
        <header className="flex flex-col items-center gap-3">
          <p className="text-caption text-fg-subtle">{t("step")}</p>
          <h1 className="font-display text-[36px] italic leading-tight text-fg">
            {t("title")}
          </h1>
          <p className="text-body text-fg-muted">{t("body")}</p>
          {trialEnd ? (
            <Badge variant="brand" className="mt-2 px-4 py-1.5 text-body-sm normal-case tracking-normal">
              {t("endsOn", { date: trialEnd })}
            </Badge>
          ) : null}
          <p className="text-body-sm text-fg-subtle">{t("cardLater")}</p>
        </header>
        <form action={finishOnboarding}>
          <input type="hidden" name="locale" value={params.locale} />
          <Button type="submit" block size="lg">
            {t("cta")}
          </Button>
        </form>
      </div>
    </main>
  );
}
