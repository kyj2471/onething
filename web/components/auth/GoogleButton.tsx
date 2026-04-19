"use client";

import { useTranslations } from "next-intl";
import { signInWithGoogle } from "@/app/auth/actions";
import { Button } from "@/components/ui";

export function GoogleButton({ locale }: { locale: string }) {
  const t = useTranslations("auth");
  return (
    <form action={signInWithGoogle.bind(null, locale)}>
      <Button type="submit" variant="secondary" block size="lg">
        <GoogleMark />
        {t("google")}
      </Button>
    </form>
  );
}

function GoogleMark() {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#4285F4"
        d="M22.5 12.2c0-.8-.1-1.5-.2-2.2H12v4.3h5.9c-.3 1.4-1 2.6-2.2 3.4v2.8h3.6c2.1-2 3.2-4.8 3.2-8.3z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.9 0 5.4-1 7.3-2.6l-3.6-2.8c-1 .7-2.3 1.1-3.7 1.1-2.8 0-5.2-1.9-6-4.5H2.2v2.8C4.1 20.9 7.8 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M6 14.2c-.2-.7-.3-1.4-.3-2.2s.1-1.5.3-2.2V7H2.2C1.4 8.6 1 10.3 1 12s.4 3.4 1.2 5l3.8-2.8z"
      />
      <path
        fill="#EA4335"
        d="M12 5.8c1.6 0 3 .5 4.1 1.6l3.1-3.1C17.4 2.6 14.9 1.6 12 1.6 7.8 1.6 4.1 3.7 2.2 7L6 9.8c.8-2.6 3.2-4 6-4z"
      />
    </svg>
  );
}
