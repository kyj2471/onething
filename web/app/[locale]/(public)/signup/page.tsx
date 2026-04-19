import Link from "next/link";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { SignupForm } from "@/components/auth/SignupForm";
import { GoogleButton } from "@/components/auth/GoogleButton";

export default async function SignupPage({
  params,
}: {
  params: { locale: string };
}) {
  setRequestLocale(params.locale);
  const t = await getTranslations("auth");

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-6 bg-bg px-6 py-12 text-accent">
      <header className="flex flex-col gap-1">
        <h1 className="font-display text-3xl italic">{t("signup.title")}</h1>
        <p className="font-body text-sm text-muted">{t("signup.subtitle")}</p>
      </header>
      <SignupForm locale={params.locale} />
      <div className="flex items-center gap-3">
        <span className="h-px flex-1 bg-border" />
        <span className="font-body text-xs text-muted">{t("or")}</span>
        <span className="h-px flex-1 bg-border" />
      </div>
      <GoogleButton locale={params.locale} />
      <p className="text-center font-body text-sm text-muted">
        {t("signup.haveAccount")}{" "}
        <Link href={`/${params.locale}/login`} className="text-accent underline">
          {t("signup.loginLink")}
        </Link>
      </p>
    </main>
  );
}
