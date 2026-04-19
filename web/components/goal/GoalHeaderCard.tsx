"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { CircleProgress } from "@/components/goal/CircleProgress";
import { ConfirmModal } from "@/components/layout/ConfirmModal";
import {
  Badge,
  Button,
  Card,
  IconButton,
  Input,
} from "@/components/ui";
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
    <Card className="relative flex flex-col gap-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1.5">
          <p className="text-caption text-fg-subtle">{t("label")}</p>
          <h1 className="font-display text-[28px] italic leading-tight text-fg">
            {title}
          </h1>
          {description ? (
            <p className="text-body text-fg-muted">{description}</p>
          ) : null}
        </div>
        <div className="relative">
          <IconButton
            size="sm"
            aria-label={t("more")}
            onClick={() => setMenuOpen((v) => !v)}
          >
            <span aria-hidden className="text-body-sm">⋯</span>
          </IconButton>
          {menuOpen ? (
            <div
              className="absolute right-0 top-full z-10 mt-1 flex w-32 flex-col overflow-hidden rounded-md border border-border bg-surface-elevated shadow-md"
              onMouseLeave={() => setMenuOpen(false)}
            >
              <button
                type="button"
                onClick={() => {
                  setEditing(true);
                  setMenuOpen(false);
                }}
                className="px-3 py-2 text-left text-body-sm text-fg hover:bg-accent-subtle"
              >
                {t("edit")}
              </button>
              <button
                type="button"
                onClick={() => {
                  setConfirmDelete(true);
                  setMenuOpen(false);
                }}
                className="px-3 py-2 text-left text-body-sm text-danger hover:bg-danger-bg"
              >
                {t("delete")}
              </button>
            </div>
          ) : null}
        </div>
      </div>

      <div className="flex items-center gap-5">
        <CircleProgress percent={percent} size={112} stroke={6} />
        <div className="flex flex-col gap-2">
          <div>
            <p className="text-caption text-fg-subtle">{t("period")}</p>
            <p className="mt-1 text-mono text-fg">
              {startDate && endDate
                ? `${startDate} → ${endDate}`
                : t("noPeriod")}
            </p>
          </div>
          {dDay ? (
            <Badge variant="brand" className="self-start">
              {dDay}
            </Badge>
          ) : null}
        </div>
      </div>

      {editing ? (
        <form
          action={updateGoal}
          onSubmit={onSubmitEdit}
          className="flex flex-col gap-3 border-t border-border pt-4"
        >
          <label className="flex flex-col gap-1.5">
            <span className="text-caption text-fg-subtle">{t("label")}</span>
            <Input
              type="text"
              name="title"
              required
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              placeholder={t("goalTitlePlaceholder")}
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-caption text-fg-subtle">
              {t("descriptionPlaceholder")}
            </span>
            <Input
              type="text"
              name="description"
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
            />
          </label>
          <div className="flex gap-2">
            <label className="flex flex-1 flex-col gap-1.5">
              <span className="text-caption text-fg-subtle">
                {t("startDate")}
              </span>
              <Input
                type="date"
                name="start_date"
                required
                value={formStart}
                onChange={(e) => setFormStart(e.target.value)}
                className="font-mono"
              />
            </label>
            <label className="flex flex-1 flex-col gap-1.5">
              <span className="text-caption text-fg-subtle">
                {t("endDate")}
              </span>
              <Input
                type="date"
                name="end_date"
                required
                value={formEnd}
                onChange={(e) => setFormEnd(e.target.value)}
                className="font-mono"
              />
            </label>
          </div>
          {dateError ? (
            <p className="text-body-sm text-danger">{t("endBeforeStart")}</p>
          ) : null}
          <div className="flex gap-2">
            <Button type="submit" block>
              {t("save")}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setEditing(false);
                setFormTitle(title);
                setFormDescription(description ?? "");
                setFormStart(startDate ?? "");
                setFormEnd(endDate ?? "");
                setDateError(false);
              }}
            >
              {t("cancel")}
            </Button>
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
    </Card>
  );
}
