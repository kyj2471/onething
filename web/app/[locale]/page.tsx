import Link from "next/link";
import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { PublicNav } from "@/components/layout/PublicNav";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { LandingMockup } from "@/components/layout/LandingMockup";

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
    <div className="flex min-h-screen flex-col bg-bg text-accent">
      <PublicNav locale={params.locale} />

      <main className="flex-1">
        {/* Hero */}
        <section className="mx-auto flex max-w-3xl flex-col items-center gap-6 px-6 py-20 text-center sm:py-28">
          <h1 className="font-display text-5xl italic leading-tight sm:text-6xl">
            {t("hero.title")}
          </h1>
          <p className="max-w-xl font-body text-lg text-muted">
            {t("hero.tagline")}
          </p>
          <div className="mt-4 flex flex-col items-center gap-3 sm:flex-row">
            <Link
              href={`/${params.locale}/signup`}
              className="rounded-md bg-accent px-6 py-3 font-body text-sm text-white"
            >
              {t("hero.cta")}
            </Link>
            <Link
              href={`/${params.locale}/pricing`}
              className="font-body text-sm text-muted underline-offset-4 hover:underline"
            >
              {t("hero.ctaSecondary")}
            </Link>
          </div>
          <p className="font-mono text-xs uppercase tracking-wider text-muted">
            {t("hero.trust")}
          </p>
        </section>

        {/* Value props */}
        <section className="mx-auto max-w-5xl px-6 py-16">
          <div className="grid gap-6 sm:grid-cols-3">
            {(["focus", "okr", "streak"] as const).map((key) => (
              <article
                key={key}
                className="flex flex-col gap-3 rounded-xl border border-border bg-card p-6"
              >
                <span
                  aria-hidden
                  className="font-mono text-[11px] uppercase tracking-wider text-muted"
                >
                  {t(`valueProps.${key}.kicker`)}
                </span>
                <h2 className="font-display text-xl italic">
                  {t(`valueProps.${key}.title`)}
                </h2>
                <p className="font-body text-sm leading-relaxed text-muted">
                  {t(`valueProps.${key}.body`)}
                </p>
              </article>
            ))}
          </div>
        </section>

        {/* Product mockup */}
        <section className="mx-auto max-w-5xl px-6 py-16">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div className="flex flex-col gap-4">
              <h2 className="font-display text-3xl italic">
                {t("mockup.title")}
              </h2>
              <p className="font-body text-base leading-relaxed text-muted">
                {t("mockup.body")}
              </p>
              <ul className="mt-2 flex flex-col gap-2 font-body text-sm text-accent">
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
        <section className="mx-auto max-w-3xl px-6 py-16">
          <div className="flex flex-col items-center gap-3 text-center">
            <h2 className="font-display text-3xl italic">
              {t("pricingPreview.title")}
            </h2>
            <p className="font-body text-base text-muted">
              {t("pricingPreview.body")}
            </p>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-border bg-card p-6">
              <p className="font-mono text-[11px] uppercase tracking-wider text-muted">
                {t("pricingPreview.monthly")}
              </p>
              <p className="mt-2 font-display text-3xl italic">$4.99</p>
              <p className="font-mono text-xs text-muted">
                {t("pricingPreview.perMonth")}
              </p>
            </div>
            <div className="relative rounded-xl border border-accent bg-card p-6">
              <span className="absolute right-4 top-4 rounded-full bg-warm-glow px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-accent">
                {t("pricingPreview.save")}
              </span>
              <p className="font-mono text-[11px] uppercase tracking-wider text-muted">
                {t("pricingPreview.annual")}
              </p>
              <p className="mt-2 font-display text-3xl italic">$34.99</p>
              <p className="font-mono text-xs text-muted">
                {t("pricingPreview.perYear")}
              </p>
            </div>
          </div>
          <div className="mt-6 flex justify-center">
            <Link
              href={`/${params.locale}/pricing`}
              className="font-body text-sm text-accent underline underline-offset-4"
            >
              {t("pricingPreview.cta")}
            </Link>
          </div>
        </section>

        {/* Final CTA */}
        <section className="mx-auto max-w-3xl px-6 py-20 text-center">
          <h2 className="font-display text-3xl italic">
            {t("finalCta.title")}
          </h2>
          <p className="mt-3 font-body text-base text-muted">
            {t("finalCta.body")}
          </p>
          <Link
            href={`/${params.locale}/signup`}
            className="mt-6 inline-block rounded-md bg-accent px-6 py-3 font-body text-sm text-white"
          >
            {t("hero.cta")}
          </Link>
        </section>
      </main>

      <PublicFooter locale={params.locale} />
    </div>
  );
}
