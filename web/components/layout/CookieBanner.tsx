"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui";

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
      className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-surface-elevated px-4 py-3 shadow-lg"
    >
      <div className="mx-auto flex max-w-2xl flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-body-sm text-fg-muted">
          {t("message")}{" "}
          <Link
            href={`/${locale}/privacy`}
            className="text-fg underline underline-offset-2 hover:text-accent"
          >
            {t("learnMore")}
          </Link>
        </p>
        <Button type="button" size="sm" onClick={accept} className="shrink-0">
          {t("accept")}
        </Button>
      </div>
    </div>
  );
}
