"use client";

import { useOptimistic, useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { updateTargetValue } from "@/lib/goal/mutations";
import { targetProgressPercent } from "@/lib/calculations";

type Item = {
  id: string;
  title: string;
  current_value: number;
  target_value: number;
};

export function TargetProgressList({ targets }: { targets: Item[] }) {
  const t = useTranslations("today");
  if (targets.length === 0) return null;

  return (
    <div className="flex flex-col gap-3">
      <ul className="flex flex-col gap-3">
        {targets.map((item) => (
          <TargetProgressRow key={item.id} item={item} />
        ))}
      </ul>
      <p className="font-body text-xs text-muted">{t("editCurrentHint")}</p>
    </div>
  );
}

function TargetProgressRow({ item }: { item: Item }) {
  const t = useTranslations("today");
  const [editing, setEditing] = useState(false);
  const [, startTransition] = useTransition();
  const [optimistic, setOptimistic] = useOptimistic(
    item.current_value,
    (_: number, next: number) => next,
  );

  const save = (raw: string) => {
    setEditing(false);
    const next = parseFloat(raw);
    if (!Number.isFinite(next) || next < 0) return;
    if (next === item.current_value) return;

    startTransition(async () => {
      setOptimistic(next);
      const fd = new FormData();
      fd.set("target_id", item.id);
      fd.set("current_value", String(next));
      await updateTargetValue(fd);
    });
  };

  const percent = targetProgressPercent(optimistic, item.target_value);

  return (
    <li className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between gap-3">
        <span className="font-body text-sm text-accent">{item.title}</span>
        <span className="flex items-baseline gap-1 font-mono text-xs tabular-nums text-muted">
          {editing ? (
            <input
              type="number"
              autoFocus
              defaultValue={optimistic}
              min={0}
              step="any"
              onBlur={(e) => save(e.currentTarget.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  save(e.currentTarget.value);
                } else if (e.key === "Escape") {
                  e.preventDefault();
                  setEditing(false);
                }
              }}
              className="w-16 rounded border border-accent bg-bg px-1 py-0.5 text-right font-mono text-xs tabular-nums text-accent outline-none"
            />
          ) : (
            <button
              type="button"
              onClick={() => setEditing(true)}
              aria-label={t("editCurrentAria")}
              className="inline-flex items-center gap-1 rounded-md bg-check-bg px-1.5 py-0.5 font-mono text-xs tabular-nums text-accent transition hover:bg-warm-glow"
            >
              <PencilIcon />
              {optimistic}
            </button>
          )}
          <span>
            {" / "}
            {item.target_value} · {Math.round(percent)}%
          </span>
        </span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-progress-bg">
        <div
          className="h-full rounded-full bg-progress transition-all"
          style={{ width: `${percent}%` }}
        />
      </div>
    </li>
  );
}

function PencilIcon() {
  return (
    <svg
      width={12}
      height={12}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-muted"
      aria-hidden="true"
    >
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 1 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  );
}
