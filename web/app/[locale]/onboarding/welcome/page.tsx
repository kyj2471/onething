import Link from "next/link";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Card } from "@/components/ui";

export default async function WelcomePage({
  params,
}: {
  params: { locale: string };
}) {
  setRequestLocale(params.locale);
  const t = await getTranslations("onboarding.welcome");

  const pillars = [
    { key: "goal", symbol: "1" },
    { key: "target", symbol: "2" },
    { key: "action", symbol: "3" },
  ] as const;

  return (
    <main className="flex flex-1 flex-col justify-center gap-8 text-center">
      <header className="flex flex-col gap-2">
        <h1 className="font-display text-[36px] italic leading-tight text-fg">
          {t("title")}
        </h1>
        <p className="text-body text-fg-muted">{t("body")}</p>
      </header>
      <ol className="flex flex-col gap-3">
        {pillars.map((p) => (
          <Card key={p.key} className="flex items-start gap-3 text-left">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-bg text-mono text-brand-fg">
              {p.symbol}
            </span>
            <div className="flex flex-col gap-1">
              <p className="text-body text-fg">
                {t(`pillars.${p.key}Title`)}
              </p>
              <p className="text-body-sm text-fg-muted">
                {t(`pillars.${p.key}Body`)}
              </p>
            </div>
          </Card>
        ))}
      </ol>
      <Link
        href={`/${params.locale}/onboarding/goal`}
        className="mt-2 inline-flex h-12 w-full items-center justify-center rounded-md bg-accent text-body font-medium text-white dark:text-[#111111] shadow-sm transition hover:bg-accent-hover hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
      >
        {t("cta")}
      </Link>
    </main>
  );
}
