import { setRequestLocale, getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { updateReminder } from "@/lib/onboarding/mutations";
import { Button, Input } from "@/components/ui";
import { OnboardingStepper } from "@/components/onboarding/OnboardingStepper";

export default async function ReminderStepPage({
  params,
}: {
  params: { locale: string };
}) {
  setRequestLocale(params.locale);
  const t = await getTranslations("onboarding.reminder");

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/${params.locale}/login`);

  const { data: profile } = await supabase
    .from("profiles")
    .select("reminder_time")
    .eq("id", user.id)
    .maybeSingle();

  const currentTime = profile?.reminder_time?.slice(0, 5) ?? "09:00";

  return (
    <main className="flex flex-1 flex-col gap-7">
      <OnboardingStepper step={4} ariaLabel={t("step")} />
      <header className="flex flex-col gap-2">
        <p className="text-caption text-fg-subtle">{t("step")}</p>
        <h1 className="font-display text-[32px] italic leading-tight text-fg">
          {t("title")}
        </h1>
        <p className="text-body text-fg-muted">{t("body")}</p>
      </header>
      <form action={updateReminder} className="flex flex-col gap-3">
        <input type="hidden" name="locale" value={params.locale} />
        <Input
          type="time"
          name="reminder_time"
          required
          defaultValue={currentTime}
          className="h-12 font-mono text-body"
        />
        <Button type="submit" block size="lg" className="mt-2">
          {t("cta")}
        </Button>
      </form>
    </main>
  );
}
