"use client";

import { useTranslations } from "next-intl";
import { signInWithGoogle } from "@/app/auth/actions";

export function GoogleButton({ locale }: { locale: string }) {
  const t = useTranslations("auth");
  return (
    <form action={signInWithGoogle.bind(null, locale)}>
      <button
        type="submit"
        className="w-full rounded-md border border-border bg-card py-2 font-body text-sm transition hover:bg-progress-bg"
      >
        {t("google")}
      </button>
    </form>
  );
}
