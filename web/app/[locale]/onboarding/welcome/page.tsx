import Link from "next/link";
import { setRequestLocale, getTranslations } from "next-intl/server";

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
        <h1 className="font-display text-3xl italic">{t("title")}</h1>
        <p className="font-body text-sm text-muted">{t("body")}</p>
      </header>
      <ol className="flex flex-col gap-3">
        {pillars.map((p) => (
          <li
            key={p.key}
            className="flex items-start gap-3 rounded-xl border border-border bg-card p-4 text-left"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-warm-glow font-mono text-sm text-accent">
              {p.symbol}
            </span>
            <div className="flex flex-col gap-1">
              <p className="font-body text-sm font-medium text-accent">
                {t(`pillars.${p.key}Title`)}
              </p>
              <p className="font-body text-xs text-muted">
                {t(`pillars.${p.key}Body`)}
              </p>
            </div>
          </li>
        ))}
      </ol>
      <Link
        href={`/${params.locale}/onboarding/goal`}
        className="mt-2 w-full rounded-md bg-accent py-3 font-body text-sm text-white"
      >
        {t("cta")}
      </Link>
    </main>
  );
}
