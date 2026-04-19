"use client";

import { useTranslations } from "next-intl";
import { signout } from "@/app/auth/actions";

export function SignOutButton({ locale }: { locale: string }) {
  const t = useTranslations("settings");
  return (
    <form action={signout.bind(null, locale)}>
      <button
        type="submit"
        className="w-full rounded-md border border-border bg-card py-2.5 font-body text-sm text-danger"
      >
        {t("signOut")}
      </button>
    </form>
  );
}
