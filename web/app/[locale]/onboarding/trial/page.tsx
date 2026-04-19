import { setRequestLocale, getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { finishOnboarding } from "@/lib/onboarding/mutations";

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
    <main className="flex flex-1 flex-col justify-center gap-6 text-center">
      <header>
        <p className="font-mono text-xs uppercase tracking-wider text-muted">
          {t("step")}
        </p>
        <h1 className="mt-2 font-display text-3xl italic">{t("title")}</h1>
        <p className="mt-3 font-body text-sm text-muted">{t("body")}</p>
        {trialEnd ? (
          <p className="mt-4 rounded-md bg-warm-glow px-3 py-2 font-mono text-sm">
            {t("endsOn", { date: trialEnd })}
          </p>
        ) : null}
        <p className="mt-3 font-body text-xs text-muted">{t("cardLater")}</p>
      </header>
      <form action={finishOnboarding}>
        <input type="hidden" name="locale" value={params.locale} />
        <button
          type="submit"
          className="w-full rounded-md bg-accent py-3 font-body text-sm text-white"
        >
          {t("cta")}
        </button>
      </form>
    </main>
  );
}
