import { setRequestLocale, getTranslations } from "next-intl/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SignOutButton } from "@/components/layout/SignOutButton";
import { DeleteAccountButton } from "@/components/layout/DeleteAccountButton";
import {
  Button,
  Card,
  Input,
  Row,
  Section,
  Select,
} from "@/components/ui";
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
    <div className="flex flex-col gap-7">
      <header>
        <h1 className="font-display text-display italic text-fg">{t("title")}</h1>
      </header>

      <Section title={t("account")}>
        <Card padded={false} className="divide-y divide-border">
          <div className="px-4 py-2">
            <Row label={t("displayName")}>
              <span className="text-body text-fg">
                {profile?.display_name ?? "-"}
              </span>
            </Row>
          </div>
          <div className="px-4 py-2">
            <Row label={t("email")}>
              <span className="text-mono text-fg-muted">
                {profile?.email ?? user.email}
              </span>
            </Row>
          </div>
        </Card>
      </Section>

      <Section title={t("notifications")}>
        <Card padded={false}>
          <form
            action={updateReminderTime}
            className="flex items-center gap-3 px-4 py-3"
          >
            <label className="flex-1 text-body text-fg">
              {t("reminderTime")}
            </label>
            <Input
              type="time"
              name="reminder_time"
              defaultValue={reminder}
              className="h-9 w-auto font-mono"
            />
            <Button type="submit" size="sm">
              {t("save")}
            </Button>
          </form>
        </Card>
      </Section>

      <Section title={t("app")}>
        <Card padded={false} className="divide-y divide-border">
          <form action={updateTheme} className="flex items-center gap-3 px-4 py-3">
            <label className="flex-1 text-body text-fg">{t("theme")}</label>
            <Select
              name="theme"
              defaultValue={theme}
              className="h-9 w-auto"
            >
              <option value="system">{t("themeSystem")}</option>
              <option value="light">{t("themeLight")}</option>
              <option value="dark">{t("themeDark")}</option>
            </Select>
            <Button type="submit" size="sm">
              {t("save")}
            </Button>
          </form>
          <form action={updateLanguage} className="flex items-center gap-3 px-4 py-3">
            <input type="hidden" name="current" value={params.locale} />
            <label className="flex-1 text-body text-fg">{t("language")}</label>
            <Select
              name="locale"
              defaultValue={locale}
              className="h-9 w-auto"
            >
              <option value="en">English</option>
              <option value="ko">한국어</option>
            </Select>
            <Button type="submit" size="sm">
              {t("save")}
            </Button>
          </form>
        </Card>
      </Section>

      <Section title={t("subscription")}>
        <Card padded={false} className="divide-y divide-border">
          <div className="px-4 py-2">
            <Row label={t("plan")}>
              <span className="text-mono text-fg">{status}</span>
            </Row>
          </div>
          {trialEnd ? (
            <div className="px-4 py-2">
              <Row label={t("trialEnds")}>
                <span className="text-mono text-fg-muted">{trialEnd}</span>
              </Row>
            </div>
          ) : null}
          <div className="px-4 py-3">
            <Row label={t("manageSubscription")}>
              <span
                aria-disabled
                className="rounded-full border border-border px-2.5 py-0.5 text-caption text-fg-subtle"
              >
                {t("comingSoon")}
              </span>
            </Row>
          </div>
        </Card>
      </Section>

      <Section title={t("legal")}>
        <Card padded={false} className="divide-y divide-border">
          <LinkRow href={`/${params.locale}/privacy`}>{t("privacy")}</LinkRow>
          <LinkRow href={`/${params.locale}/terms`}>{t("terms")}</LinkRow>
          <LinkRow href={`/${params.locale}/refund`}>{t("refund")}</LinkRow>
          <LinkRow href={`/${params.locale}/help`}>{t("help")}</LinkRow>
        </Card>
      </Section>

      <SignOutButton locale={params.locale} />

      <Section title={t("dangerZone")}>
        <Card className="border-danger/40 bg-danger-bg/40">
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
        </Card>
      </Section>

      <p className="text-center text-caption text-fg-subtle normal-case tracking-normal">
        OneThing · v0.1.0
      </p>
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
      className="flex items-center justify-between px-4 py-3 text-body text-fg transition hover:bg-accent-subtle"
    >
      <span>{children}</span>
      <span aria-hidden className="text-fg-subtle">›</span>
    </Link>
  );
}
