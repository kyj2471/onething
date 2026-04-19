import Link from "next/link";
import { getTranslations } from "next-intl/server";

export async function PublicNav({ locale }: { locale: string }) {
  const t = await getTranslations("landing.nav");

  return (
    <header className="sticky top-0 z-20 border-b border-border bg-bg/80 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <Link
          href={`/${locale}`}
          className="font-display text-[22px] italic leading-none text-fg"
        >
          OneThing
        </Link>
        <nav className="flex items-center gap-5 text-body-sm">
          <Link
            href={`/${locale}/pricing`}
            className="text-fg-muted transition hover:text-fg"
          >
            {t("pricing")}
          </Link>
          <Link
            href={`/${locale}/login`}
            className="text-fg-muted transition hover:text-fg"
          >
            {t("login")}
          </Link>
          <Link
            href={`/${locale}/signup`}
            className="inline-flex h-9 items-center justify-center rounded-md bg-accent px-4 font-medium text-white dark:text-[#111111] shadow-sm transition hover:bg-accent-hover hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
          >
            {t("signup")}
          </Link>
        </nav>
      </div>
    </header>
  );
}
