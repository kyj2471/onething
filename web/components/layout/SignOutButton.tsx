"use client";

import { useTranslations } from "next-intl";
import { signout } from "@/app/auth/actions";
import { Button } from "@/components/ui";

export function SignOutButton({ locale }: { locale: string }) {
  const t = useTranslations("settings");
  return (
    <form action={signout.bind(null, locale)}>
      <Button type="submit" variant="secondary" block>
        {t("signOut")}
      </Button>
    </form>
  );
}
