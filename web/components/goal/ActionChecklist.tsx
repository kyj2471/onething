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
        <h2 className="font-body text-sm font-medium text-accent">
          {t("actionsTitle")}
        </h2>
        <span className="font-mono text-xs tabular-nums text-muted">
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
                "flex w-full items-start gap-3 rounded-lg border border-border bg-card px-4 py-3 text-left transition",
                a.completed && "bg-check-bg",
              )}
            >
              <span
                className={cn(
                  "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border",
                  a.completed
                    ? "border-check bg-check text-white"
                    : "border-border bg-card",
                )}
                aria-hidden
              >
                {a.completed ? (
                  <svg viewBox="0 0 20 20" className="h-3 w-3 fill-current">
                    <path d="M7.5 13.5L4 10l1.4-1.4 2.1 2.1 6.1-6.1L15 6z" />
                  </svg>
                ) : null}
              </span>
              <span className="flex flex-1 flex-col">
                <span
                  className={cn(
                    "font-body text-sm text-accent",
                    a.completed && "line-through opacity-70",
                  )}
                >
                  {a.title}
                </span>
                <span className="font-mono text-xs uppercase tracking-wider text-muted">
                  {a.target_title}
                </span>
              </span>
            </button>
          </li>
        ))}
      </ul>
      {allDone ? (
        <p className="mt-1 text-center font-display italic text-muted">
          {t("allDone")}
        </p>
      ) : null}
    </section>
  );
}
