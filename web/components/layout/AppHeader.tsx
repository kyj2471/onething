"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { signout } from "@/app/auth/actions";
import { Logo } from "@/components/ui";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

function initialFrom(displayName: string | null, email: string): string {
  const source = displayName?.trim() || email;
  return (source.charAt(0) || "?").toUpperCase();
}

export function AppHeader({
  locale,
  displayName,
  email,
}: {
  locale: string;
  displayName: string | null;
  email: string;
}) {
  const t = useTranslations("settings");
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const initial = initialFrom(displayName, email);

  return (
    <div className="relative flex items-center justify-between">
      <Link
        href={`/${locale}/app/today`}
        className="flex items-center gap-2 font-display text-[20px] italic leading-none text-fg transition hover:opacity-80"
      >
        <Logo className="h-5 w-5 shrink-0" />
        OneThing
      </Link>
      <div ref={wrapRef} className="relative flex items-center gap-2">
        <ThemeToggle />
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-haspopup="menu"
          aria-expanded={open}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-muted text-h3 text-fg transition hover:bg-accent-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
        >
          {initial}
        </button>
        {open ? (
          <div
            role="menu"
            className="absolute right-0 top-12 z-20 w-60 overflow-hidden rounded-lg border border-border bg-surface-elevated shadow-lg"
          >
            <div className="flex flex-col gap-0.5 px-4 py-3">
              <span className="text-body text-fg">
                {displayName ?? email}
              </span>
              {displayName ? (
                <span className="text-body-sm text-fg-muted">{email}</span>
              ) : null}
            </div>
            <div className="border-t border-border" />
            <Link
              role="menuitem"
              href={`/${locale}/app/settings`}
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-4 py-3 text-body text-fg transition hover:bg-accent-subtle"
            >
              <SettingsIcon />
              {t("title")}
            </Link>
            <form action={signout.bind(null, locale)}>
              <button
                type="submit"
                role="menuitem"
                className="flex w-full items-center gap-2.5 px-4 py-3 text-body text-danger transition hover:bg-danger-bg"
              >
                <LogOutIcon />
                {t("signOut")}
              </button>
            </form>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function SettingsIcon() {
  return (
    <svg
      width={16}
      height={16}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 0 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 0 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3h0a1.7 1.7 0 0 0 1-1.5V3a2 2 0 0 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8v0a1.7 1.7 0 0 0 1.5 1H21a2 2 0 0 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" />
    </svg>
  );
}

function LogOutIcon() {
  return (
    <svg
      width={16}
      height={16}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}
