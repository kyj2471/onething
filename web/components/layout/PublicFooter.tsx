import Link from "next/link";
import { getTranslations } from "next-intl/server";

export async function PublicFooter({ locale }: { locale: string }) {
  const t = await getTranslations("landing.footer");
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-12 text-body-sm text-fg-muted sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-2">
          <p className="font-display text-[20px] italic leading-none text-fg">
            OneThing
          </p>
          <p className="text-caption normal-case tracking-normal text-fg-subtle">
            © {year} Nerd Station · {t("copyright")}
          </p>
        </div>
        <nav className="flex flex-wrap gap-x-6 gap-y-2">
          <Link
            href={`/${locale}/pricing`}
            className="transition hover:text-fg"
          >
            {t("pricing")}
          </Link>
          <Link href={`/${locale}/help`} className="transition hover:text-fg">
            {t("help")}
          </Link>
          <Link
            href={`/${locale}/privacy`}
            className="transition hover:text-fg"
          >
            {t("privacy")}
          </Link>
          <Link href={`/${locale}/terms`} className="transition hover:text-fg">
            {t("terms")}
          </Link>
          <Link
            href={`/${locale}/refund`}
            className="transition hover:text-fg"
          >
            {t("refund")}
          </Link>
        </nav>
        <div className="flex items-center gap-2 text-mono">
          <Link
            href="/en"
            className={
              locale === "en" ? "text-fg" : "text-fg-subtle hover:text-fg"
            }
          >
            EN
          </Link>
          <span className="text-fg-subtle">·</span>
          <Link
            href="/ko"
            className={
              locale === "ko" ? "text-fg" : "text-fg-subtle hover:text-fg"
            }
          >
            KO
          </Link>
        </div>
      </div>
    </footer>
  );
}
