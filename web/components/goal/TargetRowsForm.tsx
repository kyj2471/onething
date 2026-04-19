"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { createTargets } from "@/lib/onboarding/mutations";
import { targetProgressPercent } from "@/lib/calculations";

type Row = { title: string; target: string; current: string };

const EMPTY: Row = { title: "", target: "", current: "" };

function previewText(
  row: Row,
  t: ReturnType<typeof useTranslations<"onboarding.targets">>,
): string | null {
  if (!row.target) return null;
  const hasCurrent = row.current.trim() !== "";
  if (hasCurrent) {
    return t("previewWithCurrent", {
      current: row.current,
      target: row.target,
    });
  }
  return t("previewNoCurrent", { target: row.target });
}

export function TargetRowsForm({
  locale,
  objectiveTitle,
  initial,
}: {
  locale: string;
  objectiveTitle: string;
  initial: Row[];
}) {
  const t = useTranslations("onboarding.targets");
  const [rows, setRows] = useState<Row[]>(
    initial.length > 0 ? initial : [EMPTY, EMPTY],
  );

  const update = (i: number, key: keyof Row, v: string) => {
    setRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, [key]: v } : r)));
  };
  const add = () => setRows((prev) => [...prev, EMPTY]);
  const remove = (i: number) =>
    setRows((prev) => (prev.length <= 1 ? prev : prev.filter((_, idx) => idx !== i)));

  return (
    <form action={createTargets} className="flex flex-col gap-4">
      <input type="hidden" name="locale" value={locale} />

      {objectiveTitle ? (
        <div className="rounded-full bg-warm-glow px-4 py-2 text-center font-body text-xs text-accent">
          {t("objectiveContext", { title: objectiveTitle })}
        </div>
      ) : null}

      {rows.map((row, i) => {
        const preview = previewText(row, t);
        const currentNum = parseFloat(row.current);
        const targetNum = parseFloat(row.target);
        const showProgress =
          row.current.trim() !== "" &&
          Number.isFinite(currentNum) &&
          Number.isFinite(targetNum) &&
          targetNum > 0;
        const percent = showProgress
          ? targetProgressPercent(currentNum, targetNum)
          : 0;
        return (
          <div
            key={i}
            className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4"
          >
            <input
              type="text"
              name="target_title"
              value={row.title}
              onChange={(e) => update(i, "title", e.target.value)}
              placeholder={t("titlePlaceholder")}
              required
              className="rounded-md border border-border bg-bg px-3 py-2 font-body text-sm"
            />

            <div className="flex gap-2">
              <label className="flex flex-1 flex-col gap-1">
                <span className="font-body text-xs text-muted">
                  {t("currentLabel")}
                </span>
                <input
                  type="number"
                  name="target_current"
                  value={row.current}
                  onChange={(e) => update(i, "current", e.target.value)}
                  placeholder={t("currentPlaceholder")}
                  min={0}
                  step="any"
                  className="rounded-md border border-border bg-bg px-3 py-2 font-mono text-sm"
                />
              </label>
              <label className="flex flex-1 flex-col gap-1">
                <span className="font-body text-xs text-muted">
                  {t("targetLabel")}
                </span>
                <input
                  type="number"
                  name="target_value"
                  value={row.target}
                  onChange={(e) => update(i, "target", e.target.value)}
                  placeholder={t("targetPlaceholder")}
                  required
                  min={0.01}
                  step="any"
                  className="rounded-md border border-border bg-bg px-3 py-2 font-mono text-sm"
                />
              </label>
            </div>

            {preview || rows.length > 1 ? (
              <div className="flex flex-col gap-2 border-t border-border pt-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-muted">
                    {preview ?? ""}
                  </span>
                  {rows.length > 1 ? (
                    <button
                      type="button"
                      onClick={() => remove(i)}
                      className="font-body text-xs text-muted hover:text-danger"
                    >
                      {t("remove")}
                    </button>
                  ) : null}
                </div>
                {showProgress ? (
                  <div className="flex items-center gap-2">
                    <div className="h-1 flex-1 overflow-hidden rounded-full bg-border">
                      <div
                        className="h-full rounded-full bg-accent transition-all"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <span className="w-10 shrink-0 text-right font-mono text-xs text-muted">
                      {t("progressLabel", { percent: Math.round(percent) })}
                    </span>
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        );
      })}

      <button
        type="button"
        onClick={add}
        className="rounded-md border border-dashed border-border py-2 font-body text-sm text-muted"
      >
        {t("addRow")}
      </button>

      <p className="font-body text-xs text-muted">{t("hint")}</p>

      <button
        type="submit"
        className="mt-2 w-full rounded-md bg-accent py-3 font-body text-sm text-white"
      >
        {t("cta")}
      </button>
    </form>
  );
}
