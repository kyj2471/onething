import Link from "next/link";
import type { ReactNode } from "react";

export function LegalPageShell({
  locale,
  title,
  lastUpdated,
  children,
}: {
  locale: string;
  title: string;
  lastUpdated: string;
  children: ReactNode;
}) {
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-8 bg-bg px-6 py-12 text-fg">
      <nav>
        <Link
          href={`/${locale}`}
          className="text-caption text-fg-subtle transition hover:text-fg"
        >
          ← OneThing
        </Link>
      </nav>
      <header className="flex flex-col gap-2">
        <h1 className="font-display text-[36px] italic leading-tight text-fg">
          {title}
        </h1>
        <p className="text-mono text-fg-subtle">
          {locale === "ko" ? "최종 업데이트" : "Last updated"}: {lastUpdated}
        </p>
      </header>
      <article className="flex flex-col gap-7 text-body leading-relaxed text-fg">
        {children}
      </article>
    </main>
  );
}
