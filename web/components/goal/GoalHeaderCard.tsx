"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { CircleProgress } from "@/components/goal/CircleProgress";
import { ConfirmModal } from "@/components/layout/ConfirmModal";
import { deleteGoal, updateGoal } from "@/lib/goal/mutations";

type Props = {
  locale: string;
  id: string;
  title: string;
  description: string | null;
  startDate: string | null;
  endDate: string | null;
  percent: number;
};

function formatDDay(
  endDate: string | null,
  t: ReturnType<typeof useTranslations<"goal">>,
): string | null {
  if (!endDate) return null;
  const end = new Date(`${endDate}T00:00:00`);
  const today = new Date();
  const startOfToday = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );
  const diffMs = end.getTime() - startOfToday.getTime();
  const days = Math.round(diffMs / 86400000);
  if (days === 0) return t("dDay");
  if (days > 0) return t("dDayMinus", { n: days });
  return t("dDayPlus", { n: -days });
}

export function GoalHeaderCard({
  locale,
  id,
  title,
  description,
  startDate,
  endDate,
  percent,
}: Props) {
  const t = useTranslations("goal");
  const [menuOpen, setMenuOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [pending, startTransition] = useTransition();

  const [formTitle, setFormTitle] = useState(title);
  const [formDescription, setFormDescription] = useState(description ?? "");
  const [formStart, setFormStart] = useState(startDate ?? "");
  const [formEnd, setFormEnd] = useState(endDate ?? "");
  const [dateError, setDateError] = useState(false);

  const dDay = formatDDay(endDate, t);

  const onSubmitEdit = (e: React.FormEvent<HTMLFormElement>) => {
    if (formEnd && formStart && formEnd < formStart) {
      e.preventDefault();
      setDateError(true);
      return;
    }
    setDateError(false);
    setEditing(false);
    setMenuOpen(false);
  };

  const onDeleteConfirm = () => {
    const fd = new FormData();
    fd.set("locale", locale);
    startTransition(() => {
      void deleteGoal(fd);
    });
  };

  return (
    <article className="relative flex flex-col gap-4 rounded-2xl border border-border bg-card p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <p className="font-mono text-xs uppercase tracking-wider text-muted">
            {t("label")}
          </p>
          <h1 className="font-display text-2xl italic text-accent">{title}</h1>
          {description ? (
            <p className="font-body text-sm text-muted">{description}</p>
          ) : null}
        </div>
        <div className="relative">
          <button
            type="button"
            aria-label={t("more")}
            onClick={() => setMenuOpen((v) => !v)}
            className="rounded-md border border-border px-2 py-1 font-mono text-sm text-muted hover:text-accent"
          >
            ⋯
          </button>
          {menuOpen ? (
            <div
              className="absolute right-0 top-full z-10 mt-1 flex w-32 flex-col overflow-hidden rounded-md border border-border bg-card shadow-lg"
              onMouseLeave={() => setMenuOpen(false)}
            >
              <button
                type="button"
                onClick={() => {
                  setEditing(true);
                  setMenuOpen(false);
                }}
                className="px-3 py-2 text-left font-body text-xs text-accent hover:bg-check-bg"
              >
                {t("edit")}
              </button>
              <button
                type="button"
                onClick={() => {
                  setConfirmDelete(true);
                  setMenuOpen(false);
                }}
                className="px-3 py-2 text-left font-body text-xs text-danger hover:bg-danger-bg"
              >
                {t("delete")}
              </button>
            </div>
          ) : null}
        </div>
      </div>

      <div className="flex items-center gap-5">
        <CircleProgress percent={percent} size={120} stroke={10} />
        <div className="flex flex-col gap-2 font-body text-xs text-muted">
          <div>
            <p className="uppercase tracking-wider">{t("period")}</p>
            <p className="mt-0.5 font-mono text-sm text-accent">
              {startDate && endDate
                ? `${startDate} ~ ${endDate}`
                : t("noPeriod")}
            </p>
          </div>
          {dDay ? (
            <span className="self-start rounded-full bg-warm-glow px-3 py-1 font-mono text-xs text-accent">
              {dDay}
            </span>
          ) : null}
        </div>
      </div>

      {editing ? (
        <form
          action={updateGoal}
          onSubmit={onSubmitEdit}
          className="flex flex-col gap-3 border-t border-border pt-4"
        >
          <label className="flex flex-col gap-1">
            <span className="font-body text-xs text-muted">
              {t("label")}
            </span>
            <input
              type="text"
              name="title"
              required
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              placeholder={t("goalTitlePlaceholder")}
              className="rounded-md border border-border bg-bg px-3 py-2 font-body text-sm"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="font-body text-xs text-muted">
              {t("descriptionPlaceholder")}
            </span>
            <input
              type="text"
              name="description"
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              className="rounded-md border border-border bg-bg px-3 py-2 font-body text-sm"
            />
          </label>
          <div className="flex gap-2">
            <label className="flex flex-1 flex-col gap-1">
              <span className="font-body text-xs text-muted">
                {t("startDate")}
              </span>
              <input
                type="date"
                name="start_date"
                required
                value={formStart}
                onChange={(e) => setFormStart(e.target.value)}
                className="rounded-md border border-border bg-bg px-3 py-2 font-mono text-sm"
              />
            </label>
            <label className="flex flex-1 flex-col gap-1">
              <span className="font-body text-xs text-muted">
                {t("endDate")}
              </span>
              <input
                type="date"
                name="end_date"
                required
                value={formEnd}
                onChange={(e) => setFormEnd(e.target.value)}
                className="rounded-md border border-border bg-bg px-3 py-2 font-mono text-sm"
              />
            </label>
          </div>
          {dateError ? (
            <p className="font-body text-xs text-danger">
              {t("endBeforeStart")}
            </p>
          ) : null}
          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 rounded-md bg-accent py-2 font-body text-sm text-white"
            >
              {t("save")}
            </button>
            <button
              type="button"
              onClick={() => {
                setEditing(false);
                setFormTitle(title);
                setFormDescription(description ?? "");
                setFormStart(startDate ?? "");
                setFormEnd(endDate ?? "");
                setDateError(false);
              }}
              className="rounded-md border border-border px-4 py-2 font-body text-sm text-muted"
            >
              {t("cancel")}
            </button>
          </div>
          <input type="hidden" name="goal_id" value={id} />
        </form>
      ) : null}

      <ConfirmModal
        open={confirmDelete}
        title={t("deleteGoalTitle")}
        body={t("deleteGoalBody")}
        confirmLabel={t("deleteGoalCta")}
        cancelLabel={t("cancel")}
        pending={pending}
        onCancel={() => setConfirmDelete(false)}
        onConfirm={onDeleteConfirm}
      />
    </article>
  );
}
