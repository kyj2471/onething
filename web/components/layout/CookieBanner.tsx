"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";

const STORAGE_KEY = "onething.cookie.ack";

export function CookieBanner({ locale }: { locale: string }) {
  const [visible, setVisible] = useState(false);
  const t = useTranslations("cookies");
  const pathname = usePathname();

  useEffect(() => {
    const ack = window.localStorage.getItem(STORAGE_KEY);
    if (!ack) setVisible(true);
  }, []);

  const hideOn = [`/${locale}/app`, `/${locale}/onboarding`];
  const shouldHide = hideOn.some((p) => pathname?.startsWith(p));

  if (!visible || shouldHide) return null;

  const accept = () => {
    window.localStorage.setItem(STORAGE_KEY, "1");
    setVisible(false);
  };

  return (
    <div
      role="dialog"
      aria-label={t("title")}
      className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-card px-4 py-3 shadow-lg"
    >
      <div className="mx-auto flex max-w-2xl flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="font-body text-xs text-muted">
          {t("message")}{" "}
          <Link
            href={`/${locale}/privacy`}
            className="text-accent underline"
          >
            {t("learnMore")}
          </Link>
        </p>
        <button
          type="button"
          onClick={accept}
          className="shrink-0 rounded-md bg-accent px-4 py-2 font-body text-xs text-white"
        >
          {t("accept")}
        </button>
      </div>
    </div>
  );
}
