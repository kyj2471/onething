"use client";

import Link from "next/link";
import { useSelectedLayoutSegment } from "next/navigation";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

const TABS = ["today", "goal", "progress", "settings"] as const;
type Tab = (typeof TABS)[number];

export function TabBar({ locale }: { locale: string }) {
  const active = (useSelectedLayoutSegment() ?? "today") as Tab;
  const t = useTranslations("tabs");

  return (
    <nav
      aria-label="Primary"
      className="sticky bottom-0 z-10 border-t border-border bg-surface/95 backdrop-blur"
    >
      <ul className="mx-auto flex h-16 max-w-md sm:max-w-xl lg:max-w-2xl">
        {TABS.map((tab) => {
          const isActive = tab === active;
          return (
            <li key={tab} className="relative flex-1">
              <Link
                href={`/${locale}/app/${tab}`}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "flex h-full flex-col items-center justify-center gap-1 text-caption transition",
                  isActive ? "text-fg" : "text-fg-muted hover:text-fg",
                )}
              >
                <TabIcon tab={tab} active={isActive} />
                <span className="normal-case tracking-normal">{t(tab)}</span>
              </Link>
              {isActive ? (
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-x-6 top-0 h-0.5 rounded-full bg-accent"
                />
              ) : null}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function TabIcon({ tab, active }: { tab: Tab; active: boolean }) {
  const common = {
    width: 22,
    height: 22,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: active ? 1.9 : 1.6,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  if (tab === "today") {
    return (
      <svg {...common}>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </svg>
    );
  }
  if (tab === "goal") {
    return (
      <svg {...common}>
        <circle cx="12" cy="12" r="9" />
        <circle cx="12" cy="12" r="5" />
        <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" />
      </svg>
    );
  }
  if (tab === "progress") {
    return (
      <svg {...common}>
        <path d="M4 19V5" />
        <path d="M4 19h16" />
        <rect x="7" y="12" width="3" height="7" />
        <rect x="12" y="8" width="3" height="11" />
        <rect x="17" y="4" width="3" height="15" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 4-6 8-6s8 2 8 6" />
    </svg>
  );
}
