import Link from "next/link";
import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { PublicNav } from "@/components/layout/PublicNav";
import { PublicFooter } from "@/components/layout/PublicFooter";

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const t = await getTranslations({
    locale: params.locale,
    namespace: "pricing.meta",
  });
  return {
    title: t("title"),
    description: t("description"),
  };
}

const FEATURE_KEYS = ["f1", "f2", "f3", "f4", "f5", "f6", "f7", "f8"] as const;

export default async function PricingPage({
  params,
}: {
  params: { locale: string };
}) {
  setRequestLocale(params.locale);
  const t = await getTranslations("pricing");

  return (
    <div className="flex min-h-screen flex-col bg-bg text-accent">
      <PublicNav locale={params.locale} />

      <main className="flex-1">
        <section className="mx-auto flex max-w-3xl flex-col items-center gap-4 px-6 py-16 text-center sm:py-20">
          <h1 className="font-display text-4xl italic leading-tight sm:text-5xl">
            {t("title")}
          </h1>
          <p className="max-w-xl font-body text-base text-muted">
            {t("subtitle")}
          </p>
          <p className="mt-2 font-mono text-xs uppercase tracking-wider text-muted">
            {t("trial")}
          </p>
        </section>

        <section className="mx-auto max-w-4xl px-6 pb-10">
          <div className="grid gap-5 sm:grid-cols-2">
            <article className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-7">
              <div className="flex flex-col gap-1">
                <p className="font-mono text-[11px] uppercase tracking-wider text-muted">
                  {t("monthly.label")}
                </p>
                <p className="font-display text-4xl italic">
                  {t("monthly.price")}
                </p>
                <p className="font-mono text-xs text-muted">
                  {t("monthly.per")}
                </p>
              </div>
              <p className="font-body text-sm leading-relaxed text-muted">
                {t("monthly.description")}
              </p>
              <Link
                href={`/${params.locale}/signup`}
                className="mt-auto rounded-md border border-accent px-5 py-3 text-center font-body text-sm text-accent hover:bg-accent hover:text-white"
              >
                {t("cta")}
              </Link>
            </article>

            <article className="relative flex flex-col gap-4 rounded-2xl border border-accent bg-card p-7 shadow-md">
              <span className="absolute right-5 top-5 rounded-full bg-warm-glow px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-accent">
                {t("annual.save")}
              </span>
              <div className="flex flex-col gap-1">
                <p className="font-mono text-[11px] uppercase tracking-wider text-muted">
                  {t("annual.label")}
                </p>
                <p className="font-display text-4xl italic">
                  {t("annual.price")}
                </p>
                <p className="font-mono text-xs text-muted">
                  {t("annual.per")}
                </p>
              </div>
              <p className="font-body text-sm leading-relaxed text-muted">
                {t("annual.description")}
              </p>
              <Link
                href={`/${params.locale}/signup`}
                className="mt-auto rounded-md bg-accent px-5 py-3 text-center font-body text-sm text-white"
              >
                {t("cta")}
              </Link>
            </article>
          </div>
        </section>

        <section className="mx-auto max-w-3xl px-6 py-12">
          <h2 className="font-display text-2xl italic">{t("features.heading")}</h2>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2">
            {FEATURE_KEYS.map((key) => (
              <li
                key={key}
                className="flex items-start gap-3 rounded-lg border border-border bg-card p-4 font-body text-sm leading-relaxed"
              >
                <span
                  aria-hidden
                  className="mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-md border border-check bg-check text-white"
                >
                  <svg viewBox="0 0 20 20" className="h-2.5 w-2.5 fill-current">
                    <path d="M7.5 13.5L4 10l1.4-1.4 2.1 2.1 6.1-6.1L15 6z" />
                  </svg>
                </span>
                <span>{t(`features.${key}`)}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="mx-auto max-w-3xl px-6 pb-20 text-center">
          <p className="font-body text-sm text-muted">{t("guarantee")}</p>
          <div className="mt-4">
            <Link
              href={`/${params.locale}/help`}
              className="font-body text-sm text-accent underline underline-offset-4"
            >
              {t("faqLink")}
            </Link>
          </div>
        </section>
      </main>

      <PublicFooter locale={params.locale} />
    </div>
  );
}
