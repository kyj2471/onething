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
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-8 bg-bg px-6 py-10 text-accent">
      <nav>
        <Link
          href={`/${locale}`}
          className="font-mono text-xs uppercase tracking-wider text-muted hover:text-accent"
        >
          ← OneThing
        </Link>
      </nav>
      <header className="flex flex-col gap-2">
        <h1 className="font-display text-3xl italic">{title}</h1>
        <p className="font-mono text-xs text-muted">
          {locale === "ko" ? "최종 업데이트" : "Last updated"}: {lastUpdated}
        </p>
      </header>
      <article className="prose-legal flex flex-col gap-6 font-body text-sm leading-relaxed text-accent">
        {children}
      </article>
    </main>
  );
}
