import Link from "next/link";
import { getTranslations } from "next-intl/server";

export async function PublicNav({ locale }: { locale: string }) {
  const t = await getTranslations("landing.nav");

  return (
    <header className="sticky top-0 z-20 border-b border-border bg-bg/80 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <Link
          href={`/${locale}`}
          className="font-display text-xl italic text-accent"
        >
          OneThing
        </Link>
        <nav className="flex items-center gap-4 font-body text-sm">
          <Link
            href={`/${locale}/pricing`}
            className="text-muted hover:text-accent"
          >
            {t("pricing")}
          </Link>
          <Link
            href={`/${locale}/login`}
            className="text-muted hover:text-accent"
          >
            {t("login")}
          </Link>
          <Link
            href={`/${locale}/signup`}
            className="rounded-md bg-accent px-4 py-2 text-white"
          >
            {t("signup")}
          </Link>
        </nav>
      </div>
    </header>
  );
}
