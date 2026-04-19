"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { createGoal } from "@/lib/onboarding/mutations";

type Initial = {
  title: string;
  description: string;
  start_date: string;
  end_date: string;
};

function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function defaults() {
  const today = new Date();
  const end = new Date();
  end.setDate(end.getDate() + 90);
  return { start: toISODate(today), end: toISODate(end) };
}

export function OnboardingGoalForm({
  locale,
  initial,
}: {
  locale: string;
  initial: Initial;
}) {
  const t = useTranslations("onboarding.goal");
  const d = defaults();

  const [title, setTitle] = useState(initial.title);
  const [description, setDescription] = useState(initial.description);
  const [startDate, setStartDate] = useState(initial.start_date || d.start);
  const [endDate, setEndDate] = useState(initial.end_date || d.end);
  const [error, setError] = useState(false);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    if (endDate < startDate) {
      e.preventDefault();
      setError(true);
      return;
    }
    setError(false);
  };

  return (
    <form action={createGoal} onSubmit={onSubmit} className="flex flex-col gap-4">
      <input type="hidden" name="locale" value={locale} />

      <label className="flex flex-col gap-1">
        <span className="font-body text-xs uppercase tracking-wider text-muted">
          {t("titleLabel")}
        </span>
        <input
          type="text"
          name="title"
          required
          maxLength={200}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={t("titlePlaceholder")}
          className="rounded-md border border-border bg-card px-3 py-2 font-body text-base"
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="font-body text-xs uppercase tracking-wider text-muted">
          {t("descriptionLabel")}
        </span>
        <input
          type="text"
          name="description"
          maxLength={500}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={t("descriptionPlaceholder")}
          className="rounded-md border border-border bg-card px-3 py-2 font-body text-sm"
        />
      </label>

      <fieldset className="flex flex-col gap-2">
        <legend className="font-body text-xs uppercase tracking-wider text-muted">
          {t("periodLabel")}
        </legend>
        <div className="flex gap-2">
          <label className="flex flex-1 flex-col gap-1">
            <span className="font-body text-xs text-muted">
              {t("startLabel")}
            </span>
            <input
              type="date"
              name="start_date"
              required
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="rounded-md border border-border bg-card px-3 py-2 font-mono text-sm"
            />
          </label>
          <label className="flex flex-1 flex-col gap-1">
            <span className="font-body text-xs text-muted">
              {t("endLabel")}
            </span>
            <input
              type="date"
              name="end_date"
              required
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="rounded-md border border-border bg-card px-3 py-2 font-mono text-sm"
            />
          </label>
        </div>
        <p className="font-body text-xs text-muted">{t("periodHint")}</p>
        {error ? (
          <p className="font-body text-xs text-danger">{t("endBeforeStart")}</p>
        ) : null}
      </fieldset>

      <button
        type="submit"
        className="mt-2 w-full rounded-md bg-accent py-3 font-body text-sm text-white"
      >
        {t("cta")}
      </button>
    </form>
  );
}
