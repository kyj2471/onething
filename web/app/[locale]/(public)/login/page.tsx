import Link from "next/link";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { LoginForm } from "@/components/auth/LoginForm";
import { GoogleButton } from "@/components/auth/GoogleButton";

export default async function LoginPage({
  params,
}: {
  params: { locale: string };
}) {
  setRequestLocale(params.locale);
  const t = await getTranslations("auth");

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-6 bg-bg px-6 py-12 text-accent">
      <header className="flex flex-col gap-1">
        <h1 className="font-display text-3xl italic">{t("login.title")}</h1>
        <p className="font-body text-sm text-muted">{t("login.subtitle")}</p>
      </header>
      <LoginForm locale={params.locale} />
      <div className="flex items-center gap-3">
        <span className="h-px flex-1 bg-border" />
        <span className="font-body text-xs text-muted">{t("or")}</span>
        <span className="h-px flex-1 bg-border" />
      </div>
      <GoogleButton locale={params.locale} />
      <p className="text-center font-body text-sm text-muted">
        {t("login.noAccount")}{" "}
        <Link href={`/${params.locale}/signup`} className="text-accent underline">
          {t("login.signupLink")}
        </Link>
      </p>
    </main>
  );
}
