import Link from "next/link";
import { getTranslations } from "next-intl/server";

export async function PublicFooter({ locale }: { locale: string }) {
  const t = await getTranslations("landing.footer");
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto flex max-w-5xl flex-col gap-6 px-6 py-10 text-sm text-muted sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-2">
          <p className="font-display text-lg italic text-accent">OneThing</p>
          <p className="font-body text-xs">
            © {year} Nerd Station · {t("copyright")}
          </p>
        </div>
        <nav className="flex flex-wrap gap-x-6 gap-y-2 font-body text-sm">
          <Link href={`/${locale}/pricing`} className="hover:text-accent">
            {t("pricing")}
          </Link>
          <Link href={`/${locale}/help`} className="hover:text-accent">
            {t("help")}
          </Link>
          <Link href={`/${locale}/privacy`} className="hover:text-accent">
            {t("privacy")}
          </Link>
          <Link href={`/${locale}/terms`} className="hover:text-accent">
            {t("terms")}
          </Link>
          <Link href={`/${locale}/refund`} className="hover:text-accent">
            {t("refund")}
          </Link>
        </nav>
        <div className="flex gap-2 font-mono text-xs">
          <Link
            href="/en"
            className={locale === "en" ? "text-accent" : "hover:text-accent"}
          >
            EN
          </Link>
          <span>·</span>
          <Link
            href="/ko"
            className={locale === "ko" ? "text-accent" : "hover:text-accent"}
          >
            KO
          </Link>
        </div>
      </div>
    </footer>
  );
}
