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
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-7 bg-bg px-6 py-14 text-fg">
      <header className="flex flex-col gap-2">
        <h1 className="font-display text-[36px] italic leading-tight text-fg">
          {t("login.title")}
        </h1>
        <p className="text-body text-fg-muted">{t("login.subtitle")}</p>
      </header>
      <LoginForm locale={params.locale} />
      <div className="flex items-center gap-3">
        <span className="h-px flex-1 bg-border" />
        <span className="text-caption text-fg-subtle">{t("or")}</span>
        <span className="h-px flex-1 bg-border" />
      </div>
      <GoogleButton locale={params.locale} />
      <p className="text-center text-body-sm text-fg-muted">
        {t("login.noAccount")}{" "}
        <Link
          href={`/${params.locale}/signup`}
          className="text-fg underline underline-offset-2 hover:text-accent"
        >
          {t("login.signupLink")}
        </Link>
      </p>
    </main>
  );
}
