import Link from "next/link";
import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { PublicNav } from "@/components/layout/PublicNav";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { LandingMockup } from "@/components/layout/LandingMockup";
import { Card } from "@/components/ui";

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const t = await getTranslations({
    locale: params.locale,
    namespace: "landing.meta",
  });
  return {
    title: t("title"),
    description: t("description"),
    openGraph: {
      title: t("title"),
      description: t("description"),
      type: "website",
      locale: params.locale,
      siteName: "OneThing",
    },
    twitter: {
      card: "summary_large_image",
      title: t("title"),
      description: t("description"),
    },
  };
}

export default async function LandingPage({
  params,
}: {
  params: { locale: string };
}) {
  setRequestLocale(params.locale);
  const t = await getTranslations("landing");

  return (
    <div className="flex min-h-screen flex-col bg-bg text-fg">
      <PublicNav locale={params.locale} />

      <main className="flex-1">
        {/* Hero */}
        <section className="mx-auto flex max-w-3xl flex-col items-center gap-7 px-6 py-20 text-center sm:py-28">
          <h1 className="font-display text-[52px] italic leading-[1.05] text-fg sm:text-[68px]">
            {t("hero.title")}
          </h1>
          <p className="max-w-xl text-[18px] leading-relaxed text-fg-muted">
            {t("hero.tagline")}
          </p>
          <div className="mt-3 flex flex-col items-center gap-4 sm:flex-row">
            <Link
              href={`/${params.locale}/signup`}
              className="inline-flex h-12 items-center justify-center rounded-md bg-accent px-7 text-body font-medium text-white dark:text-[#111111] shadow-sm transition hover:bg-accent-hover hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
            >
              {t("hero.cta")}
            </Link>
            <Link
              href={`/${params.locale}/pricing`}
              className="text-body text-fg-muted underline-offset-4 hover:text-fg hover:underline"
            >
              {t("hero.ctaSecondary")}
            </Link>
          </div>
          <p className="text-caption text-fg-subtle">{t("hero.trust")}</p>
        </section>

        {/* Value props */}
        <section className="mx-auto max-w-6xl px-6 py-14">
          <div className="grid gap-5 sm:grid-cols-3">
            {(["focus", "okr", "streak"] as const).map((key) => (
              <Card key={key} className="flex flex-col gap-3 p-6">
                <span aria-hidden className="text-caption text-fg-subtle">
                  {t(`valueProps.${key}.kicker`)}
                </span>
                <h2 className="font-display text-[22px] italic leading-snug text-fg">
                  {t(`valueProps.${key}.title`)}
                </h2>
                <p className="text-body leading-relaxed text-fg-muted">
                  {t(`valueProps.${key}.body`)}
                </p>
              </Card>
            ))}
          </div>
        </section>

        {/* Product mockup */}
        <section className="mx-auto max-w-6xl px-6 py-14">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div className="flex flex-col gap-4">
              <h2 className="font-display text-[36px] italic leading-tight text-fg">
                {t("mockup.title")}
              </h2>
              <p className="text-[17px] leading-relaxed text-fg-muted">
                {t("mockup.body")}
              </p>
              <ul className="mt-2 flex flex-col gap-2 text-body text-fg">
                <li>· {t("mockup.bullet1")}</li>
                <li>· {t("mockup.bullet2")}</li>
                <li>· {t("mockup.bullet3")}</li>
              </ul>
            </div>
            <LandingMockup
              labels={{
                myGoal: t("mockup.labels.myGoal"),
                goalTitle: t("mockup.labels.goalTitle"),
                streak: t("mockup.labels.streak"),
                actions: t("mockup.labels.actions"),
                action1: t("mockup.labels.action1"),
                action2: t("mockup.labels.action2"),
                action3: t("mockup.labels.action3"),
                target1: t("mockup.labels.target1"),
                target2: t("mockup.labels.target2"),
                completed: t("mockup.labels.completed"),
              }}
            />
          </div>
        </section>

        {/* Pricing preview */}
        <section className="mx-auto max-w-3xl px-6 py-14">
          <div className="flex flex-col items-center gap-3 text-center">
            <h2 className="font-display text-[36px] italic leading-tight text-fg">
              {t("pricingPreview.title")}
            </h2>
            <p className="text-[17px] text-fg-muted">
              {t("pricingPreview.body")}
            </p>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <Card className="p-6">
              <p className="text-caption text-fg-subtle">
                {t("pricingPreview.monthly")}
              </p>
              <p className="mt-2 font-display text-[32px] italic leading-none text-fg">
                $4.99
              </p>
              <p className="mt-1 text-mono text-fg-muted">
                {t("pricingPreview.perMonth")}
              </p>
            </Card>
            <Card className="relative border-accent p-6">
              <span className="absolute right-4 top-4 rounded-full bg-brand-bg px-2.5 py-0.5 text-caption text-brand-fg">
                {t("pricingPreview.save")}
              </span>
              <p className="text-caption text-fg-subtle">
                {t("pricingPreview.annual")}
              </p>
              <p className="mt-2 font-display text-[32px] italic leading-none text-fg">
                $34.99
              </p>
              <p className="mt-1 text-mono text-fg-muted">
                {t("pricingPreview.perYear")}
              </p>
            </Card>
          </div>
          <div className="mt-6 flex justify-center">
            <Link
              href={`/${params.locale}/pricing`}
              className="text-body text-fg underline underline-offset-4 hover:text-accent"
            >
              {t("pricingPreview.cta")}
            </Link>
          </div>
        </section>

        {/* Final CTA */}
        <section className="mx-auto max-w-3xl px-6 py-20 text-center">
          <h2 className="font-display text-[36px] italic leading-tight text-fg">
            {t("finalCta.title")}
          </h2>
          <p className="mt-3 text-[17px] text-fg-muted">
            {t("finalCta.body")}
          </p>
          <Link
            href={`/${params.locale}/signup`}
            className="mt-7 inline-flex h-12 items-center justify-center rounded-md bg-accent px-7 text-body font-medium text-white dark:text-[#111111] shadow-sm transition hover:bg-accent-hover hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
          >
            {t("hero.cta")}
          </Link>
        </section>
      </main>

      <PublicFooter locale={params.locale} />
    </div>
  );
}
