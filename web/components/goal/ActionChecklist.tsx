"use client";

import { useOptimistic, useTransition } from "react";
import { useTranslations } from "next-intl";
import { toggleAction } from "@/lib/goal/mutations";
import { cn } from "@/lib/utils";

type ActionItem = {
  id: string;
  title: string;
  target_title: string;
  completed: boolean;
};

export function ActionChecklist({ actions }: { actions: ActionItem[] }) {
  const t = useTranslations("today");
  const [optimistic, setOptimistic] = useOptimistic(
    actions,
    (state, id: string) =>
      state.map((a) => (a.id === id ? { ...a, completed: !a.completed } : a)),
  );
  const [, startTransition] = useTransition();

  const done = optimistic.filter((a) => a.completed).length;
  const total = optimistic.length;
  const allDone = total > 0 && done === total;

  const onToggle = (a: ActionItem) => {
    startTransition(async () => {
      setOptimistic(a.id);
      const fd = new FormData();
      fd.set("action_id", a.id);
      fd.set("completed", String(a.completed));
      await toggleAction(fd);
    });
  };

  return (
    <section className="flex flex-col gap-3">
      <header className="flex items-baseline justify-between">
        <h2 className="text-h3 text-fg">{t("actionsTitle")}</h2>
        <span className="text-mono tabular-nums text-fg-muted">
          {done}/{total}
        </span>
      </header>
      <ul className="flex flex-col gap-2">
        {optimistic.map((a) => (
          <li key={a.id}>
            <button
              type="button"
              onClick={() => onToggle(a)}
              className={cn(
                "flex w-full items-start gap-3 rounded-md border border-border bg-surface px-4 py-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
                a.completed
                  ? "bg-brand-bg border-transparent"
                  : "hover:border-border-strong",
              )}
            >
              <span
                className={cn(
                  "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition",
                  a.completed
                    ? "border-transparent bg-brand text-on-brand"
                    : "border-border-strong bg-surface",
                )}
                aria-hidden
              >
                {a.completed ? (
                  <svg viewBox="0 0 20 20" className="h-3 w-3 fill-current">
                    <path d="M7.5 13.5L4 10l1.4-1.4 2.1 2.1 6.1-6.1L15 6z" />
                  </svg>
                ) : null}
              </span>
              <span className="flex flex-1 flex-col gap-0.5">
                <span
                  className={cn(
                    "text-body text-fg",
                    a.completed && "line-through text-fg-muted",
                  )}
                >
                  {a.title}
                </span>
                <span className="text-caption text-fg-subtle">
                  {a.target_title}
                </span>
              </span>
            </button>
          </li>
        ))}
      </ul>
      {allDone ? (
        <p className="mt-1 text-center font-display italic text-fg-muted">
          {t("allDone")}
        </p>
      ) : null}
    </section>
  );
}
