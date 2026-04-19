import { setRequestLocale, getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { updateReminder } from "@/lib/onboarding/mutations";

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
    <main className="flex flex-1 flex-col gap-6">
      <header>
        <p className="font-mono text-xs uppercase tracking-wider text-muted">
          {t("step")}
        </p>
        <h1 className="mt-1 font-display text-3xl italic">{t("title")}</h1>
        <p className="mt-2 font-body text-sm text-muted">{t("body")}</p>
      </header>
      <form action={updateReminder} className="flex flex-col gap-3">
        <input type="hidden" name="locale" value={params.locale} />
        <input
          type="time"
          name="reminder_time"
          required
          defaultValue={currentTime}
          className="rounded-md border border-border bg-card px-3 py-2 font-mono text-base"
        />
        <button
          type="submit"
          className="mt-2 w-full rounded-md bg-accent py-3 font-body text-sm text-white"
        >
          {t("cta")}
        </button>
      </form>
    </main>
  );
}
