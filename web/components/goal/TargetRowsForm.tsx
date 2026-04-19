"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { createTargets } from "@/lib/onboarding/mutations";
import { targetProgressPercent } from "@/lib/calculations";
import { Badge, Button, Card, Input, NumberInput } from "@/components/ui";

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
        <Badge variant="brand" className="self-center px-4 py-1.5 text-body-sm normal-case tracking-normal">
          {t("objectiveContext", { title: objectiveTitle })}
        </Badge>
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
          <Card key={i} className="flex flex-col gap-3">
            <Input
              type="text"
              name="target_title"
              value={row.title}
              onChange={(e) => update(i, "title", e.target.value)}
              placeholder={t("titlePlaceholder")}
              required
            />

            <div className="flex gap-2">
              <label className="flex flex-1 flex-col gap-1.5">
                <span className="text-caption text-fg-subtle">
                  {t("currentLabel")}
                </span>
                <NumberInput
                  name="target_current"
                  value={row.current}
                  onChange={(e) => update(i, "current", e.target.value)}
                  placeholder={t("currentPlaceholder")}
                  min={0}
                  step="any"
                  className="font-mono"
                />
              </label>
              <label className="flex flex-1 flex-col gap-1.5">
                <span className="text-caption text-fg-subtle">
                  {t("targetLabel")}
                </span>
                <NumberInput
                  name="target_value"
                  value={row.target}
                  onChange={(e) => update(i, "target", e.target.value)}
                  placeholder={t("targetPlaceholder")}
                  required
                  min={0.01}
                  step="any"
                  className="font-mono"
                />
              </label>
            </div>

            {preview || rows.length > 1 ? (
              <div className="flex flex-col gap-2 border-t border-border pt-3">
                <div className="flex items-center justify-between">
                  <span className="text-mono text-fg-muted">
                    {preview ?? ""}
                  </span>
                  {rows.length > 1 ? (
                    <button
                      type="button"
                      onClick={() => remove(i)}
                      className="text-body-sm text-fg-muted hover:text-danger"
                    >
                      {t("remove")}
                    </button>
                  ) : null}
                </div>
                {showProgress ? (
                  <div className="flex items-center gap-2">
                    <div className="h-1 flex-1 overflow-hidden rounded-full bg-surface-muted">
                      <div
                        className="h-full rounded-full bg-brand transition-all"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <span className="w-12 shrink-0 text-right text-mono text-fg-muted">
                      {t("progressLabel", { percent: Math.round(percent) })}
                    </span>
                  </div>
                ) : null}
              </div>
            ) : null}
          </Card>
        );
      })}

      <button
        type="button"
        onClick={add}
        className="rounded-md border border-dashed border-border-strong py-2.5 text-body text-fg-muted transition hover:border-accent hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
      >
        + {t("addRow")}
      </button>

      <p className="text-body-sm text-fg-muted">{t("hint")}</p>

      <Button type="submit" block size="lg" className="mt-2">
        {t("cta")}
      </Button>
    </form>
  );
}
