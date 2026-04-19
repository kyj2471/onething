import { setRequestLocale, getTranslations } from "next-intl/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SignOutButton } from "@/components/layout/SignOutButton";
import { DeleteAccountButton } from "@/components/layout/DeleteAccountButton";
import {
  updateReminderTime,
  updateTheme,
  updateLanguage,
} from "@/lib/settings/mutations";

export default async function SettingsPage({
  params,
}: {
  params: { locale: string };
}) {
  setRequestLocale(params.locale);
  const t = await getTranslations("settings");

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/${params.locale}/login`);

  const { data: profile } = await supabase
    .from("profiles")
    .select("email, display_name, reminder_time, theme, locale, subscription_status, trial_ends_at")
    .eq("id", user.id)
    .maybeSingle();

  const reminder = profile?.reminder_time?.slice(0, 5) ?? "09:00";
  const theme = profile?.theme ?? "system";
  const locale = profile?.locale ?? params.locale;
  const status = profile?.subscription_status ?? "trial";
  const trialEnd = profile?.trial_ends_at
    ? new Date(profile.trial_ends_at).toLocaleDateString(params.locale)
    : null;

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="font-display text-2xl italic text-accent">{t("title")}</h1>
      </header>

      <Section title={t("account")}>
        <Row label={t("displayName")}>
          <span className="font-body text-sm text-accent">
            {profile?.display_name ?? "-"}
          </span>
        </Row>
        <Row label={t("email")}>
          <span className="font-mono text-sm text-muted">
            {profile?.email ?? user.email}
          </span>
        </Row>
      </Section>

      <Section title={t("notifications")}>
        <form action={updateReminderTime} className="flex items-center gap-3">
          <label className="flex-1 font-body text-sm text-accent">
            {t("reminderTime")}
          </label>
          <input
            type="time"
            name="reminder_time"
            defaultValue={reminder}
            className="rounded-md border border-border bg-card px-3 py-1.5 font-mono text-sm"
          />
          <button
            type="submit"
            className="rounded-md bg-accent px-3 py-1.5 font-body text-xs text-white"
          >
            {t("save")}
          </button>
        </form>
      </Section>

      <Section title={t("app")}>
        <form action={updateTheme} className="flex items-center gap-3">
          <label className="flex-1 font-body text-sm text-accent">
            {t("theme")}
          </label>
          <select
            name="theme"
            defaultValue={theme}
            className="rounded-md border border-border bg-card px-3 py-1.5 font-body text-sm"
          >
            <option value="system">{t("themeSystem")}</option>
            <option value="light">{t("themeLight")}</option>
            <option value="dark">{t("themeDark")}</option>
          </select>
          <button
            type="submit"
            className="rounded-md bg-accent px-3 py-1.5 font-body text-xs text-white"
          >
            {t("save")}
          </button>
        </form>
        <form action={updateLanguage} className="flex items-center gap-3">
          <input type="hidden" name="current" value={params.locale} />
          <label className="flex-1 font-body text-sm text-accent">
            {t("language")}
          </label>
          <select
            name="locale"
            defaultValue={locale}
            className="rounded-md border border-border bg-card px-3 py-1.5 font-body text-sm"
          >
            <option value="en">English</option>
            <option value="ko">한국어</option>
          </select>
          <button
            type="submit"
            className="rounded-md bg-accent px-3 py-1.5 font-body text-xs text-white"
          >
            {t("save")}
          </button>
        </form>
      </Section>

      <Section title={t("subscription")}>
        <Row label={t("plan")}>
          <span className="font-mono text-sm text-accent">{status}</span>
        </Row>
        {trialEnd ? (
          <Row label={t("trialEnds")}>
            <span className="font-mono text-sm text-muted">{trialEnd}</span>
          </Row>
        ) : null}
        <div className="flex items-center justify-between gap-3">
          <span className="font-body text-sm text-accent">
            {t("manageSubscription")}
          </span>
          <span
            aria-disabled
            className="rounded-md border border-border px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider text-muted"
          >
            {t("comingSoon")}
          </span>
        </div>
      </Section>

      <Section title={t("legal")}>
        <LinkRow href={`/${params.locale}/privacy`}>{t("privacy")}</LinkRow>
        <LinkRow href={`/${params.locale}/terms`}>{t("terms")}</LinkRow>
        <LinkRow href={`/${params.locale}/refund`}>{t("refund")}</LinkRow>
        <LinkRow href={`/${params.locale}/help`}>{t("help")}</LinkRow>
      </Section>

      <SignOutButton locale={params.locale} />

      <section className="flex flex-col gap-3">
        <h2 className="font-mono text-[11px] uppercase tracking-wider text-danger">
          {t("dangerZone")}
        </h2>
        <div className="rounded-xl border border-danger bg-danger-bg p-4">
          <DeleteAccountButton
            locale={params.locale}
            labels={{
              deleteAccount: t("deleteAccount"),
              deleteBody: t("deleteBody"),
              confirmTitle: t("deleteConfirmTitle"),
              confirmBody: t("deleteConfirmBody"),
              confirmCta: t("deleteConfirmCta"),
              cancel: t("deleteCancel"),
            }}
          />
        </div>
      </section>

      <p className="text-center font-mono text-[11px] text-muted">
        OneThing · v0.1.0
      </p>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="font-mono text-[11px] uppercase tracking-wider text-muted">
        {title}
      </h2>
      <div className="flex flex-col divide-y divide-border rounded-xl border border-border bg-card">
        {(Array.isArray(children) ? children : [children])
          .filter((c) => c !== null && c !== false && c !== undefined)
          .map((child, i) => (
            <div key={i} className="px-4 py-3">
              {child}
            </div>
          ))}
      </div>
    </section>
  );
}

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="font-body text-sm text-accent">{label}</span>
      {children}
    </div>
  );
}

function LinkRow({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between font-body text-sm text-accent"
    >
      <span>{children}</span>
      <span aria-hidden className="text-muted">›</span>
    </Link>
  );
}
