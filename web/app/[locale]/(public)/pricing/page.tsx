import Link from "next/link";
import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { PublicNav } from "@/components/layout/PublicNav";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { Card } from "@/components/ui";

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
    <div className="flex min-h-screen flex-col bg-bg text-fg">
      <PublicNav locale={params.locale} />

      <main className="flex-1">
        <section className="mx-auto flex max-w-3xl flex-col items-center gap-5 px-6 py-20 text-center sm:py-24">
          <h1 className="font-display text-[44px] italic leading-[1.1] text-fg sm:text-[56px]">
            {t("title")}
          </h1>
          <p className="max-w-xl text-[17px] leading-relaxed text-fg-muted">
            {t("subtitle")}
          </p>
          <p className="text-caption text-fg-subtle">{t("trial")}</p>
        </section>

        <section className="mx-auto max-w-4xl px-6 pb-10">
          <div className="grid gap-5 sm:grid-cols-2">
            <Card className="flex flex-col gap-4 p-7">
              <div className="flex flex-col gap-1">
                <p className="text-caption text-fg-subtle">
                  {t("monthly.label")}
                </p>
                <p className="font-display text-[40px] italic leading-none text-fg">
                  {t("monthly.price")}
                </p>
                <p className="text-mono text-fg-muted">{t("monthly.per")}</p>
              </div>
              <p className="text-body leading-relaxed text-fg-muted">
                {t("monthly.description")}
              </p>
              <Link
                href={`/${params.locale}/signup`}
                className="mt-auto inline-flex h-11 items-center justify-center rounded-md border border-border-strong px-5 text-body font-medium text-fg transition hover:border-accent hover:bg-accent hover:text-white dark:hover:text-[#111111] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
              >
                {t("cta")}
              </Link>
            </Card>

            <Card className="relative flex flex-col gap-4 border-accent p-7 shadow-md">
              <span className="absolute right-5 top-5 rounded-full bg-brand-bg px-2.5 py-0.5 text-caption text-brand-fg">
                {t("annual.save")}
              </span>
              <div className="flex flex-col gap-1">
                <p className="text-caption text-fg-subtle">
                  {t("annual.label")}
                </p>
                <p className="font-display text-[40px] italic leading-none text-fg">
                  {t("annual.price")}
                </p>
                <p className="text-mono text-fg-muted">{t("annual.per")}</p>
              </div>
              <p className="text-body leading-relaxed text-fg-muted">
                {t("annual.description")}
              </p>
              <Link
                href={`/${params.locale}/signup`}
                className="mt-auto inline-flex h-11 items-center justify-center rounded-md bg-accent px-5 text-body font-medium text-white dark:text-[#111111] shadow-sm transition hover:bg-accent-hover hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
              >
                {t("cta")}
              </Link>
            </Card>
          </div>
        </section>

        <section className="mx-auto max-w-3xl px-6 py-14">
          <h2 className="font-display text-[28px] italic leading-tight text-fg">
            {t("features.heading")}
          </h2>
          <ul className="mt-7 grid gap-3 sm:grid-cols-2">
            {FEATURE_KEYS.map((key) => (
              <li
                key={key}
                className="flex items-start gap-3 rounded-lg border border-border bg-surface p-4 text-body leading-relaxed text-fg"
              >
                <span
                  aria-hidden
                  className="mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-md bg-brand text-on-brand"
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
          <p className="text-body text-fg-muted">{t("guarantee")}</p>
          <div className="mt-4">
            <Link
              href={`/${params.locale}/help`}
              className="text-body text-fg underline underline-offset-4 hover:text-accent"
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
