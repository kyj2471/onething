"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import {
  deleteTarget,
  updateTarget,
  updateTargetValue,
} from "@/lib/goal/mutations";
import { targetProgressPercent } from "@/lib/calculations";
import { ConfirmModal } from "@/components/layout/ConfirmModal";
import { AddActionForm } from "@/components/goal/AddActionForm";
import { ActionRow } from "@/components/goal/ActionRow";

type Action = { id: string; title: string };

export function TargetCard({
  id,
  title,
  target_value,
  current_value,
  actions,
}: {
  id: string;
  title: string;
  target_value: number;
  current_value: number;
  actions: Action[];
}) {
  const t = useTranslations("goal");
  const [editingValue, setEditingValue] = useState(false);
  const [editingDetails, setEditingDetails] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [value, setValue] = useState(String(current_value));
  const [detTitle, setDetTitle] = useState(title);
  const [detValue, setDetValue] = useState(String(target_value));
  const [pending, startTransition] = useTransition();

  const percent = targetProgressPercent(current_value, target_value);

  const onDelete = () => {
    const fd = new FormData();
    fd.set("target_id", id);
    startTransition(() => {
      void deleteTarget(fd);
    });
  };

  return (
    <article className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-1 flex-col gap-1">
          <span className="font-body text-sm font-medium text-accent">
            {title}
          </span>
          <span className="font-mono text-xs text-muted">
            {current_value} / {target_value}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm tabular-nums text-accent">
            {Math.round(percent)}%
          </span>
          <div className="relative">
            <button
              type="button"
              aria-label={t("more")}
              onClick={() => setMenuOpen((v) => !v)}
              className="rounded-md border border-border px-2 py-1 font-mono text-xs text-muted hover:text-accent"
            >
              ⋯
            </button>
            {menuOpen ? (
              <div
                className="absolute right-0 top-full z-10 mt-1 flex w-28 flex-col overflow-hidden rounded-md border border-border bg-card shadow-lg"
                onMouseLeave={() => setMenuOpen(false)}
              >
                <button
                  type="button"
                  onClick={() => {
                    setEditingDetails(true);
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
      </div>

      <div className="h-2 w-full rounded-full bg-progress-bg">
        <div
          className="h-2 rounded-full bg-progress transition-all"
          style={{ width: `${percent}%` }}
        />
      </div>

      {editingDetails ? (
        <form
          action={updateTarget}
          onSubmit={() => setEditingDetails(false)}
          className="flex flex-col gap-2 border-t border-border pt-3"
        >
          <input type="hidden" name="target_id" value={id} />
          <input
            type="text"
            name="title"
            required
            value={detTitle}
            onChange={(e) => setDetTitle(e.target.value)}
            placeholder={t("titlePlaceholder")}
            className="rounded-md border border-border bg-bg px-3 py-2 font-body text-sm"
          />
          <input
            type="number"
            name="target_value"
            required
            min={1}
            step="any"
            value={detValue}
            onChange={(e) => setDetValue(e.target.value)}
            placeholder={t("valuePlaceholder")}
            className="rounded-md border border-border bg-bg px-3 py-2 font-mono text-sm"
          />
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
                setEditingDetails(false);
                setDetTitle(title);
                setDetValue(String(target_value));
              }}
              className="rounded-md border border-border px-4 py-2 font-body text-sm text-muted"
            >
              {t("cancel")}
            </button>
          </div>
        </form>
      ) : editingValue ? (
        <form
          action={updateTargetValue}
          onSubmit={() => setEditingValue(false)}
          className="flex items-center gap-2"
        >
          <input type="hidden" name="target_id" value={id} />
          <input
            type="number"
            name="current_value"
            required
            min={0}
            step="any"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="flex-1 rounded-md border border-border bg-bg px-3 py-2 font-mono text-sm"
          />
          <button
            type="submit"
            className="rounded-md bg-accent px-3 py-2 font-body text-xs text-white"
          >
            {t("save")}
          </button>
          <button
            type="button"
            onClick={() => {
              setEditingValue(false);
              setValue(String(current_value));
            }}
            className="rounded-md border border-border px-3 py-2 font-body text-xs text-muted"
          >
            {t("cancel")}
          </button>
        </form>
      ) : (
        <button
          type="button"
          onClick={() => setEditingValue(true)}
          className="self-start font-body text-xs text-muted underline-offset-2 hover:underline"
        >
          {t("updateValue")}
        </button>
      )}

      <div className="flex flex-col gap-2 border-t border-border pt-3">
        {actions.length > 0 ? (
          <ul className="flex flex-col gap-1.5">
            {actions.map((a) => (
              <ActionRow key={a.id} id={a.id} title={a.title} />
            ))}
          </ul>
        ) : null}
        <AddActionForm targetId={id} />
      </div>

      <ConfirmModal
        open={confirmDelete}
        title={t("deleteTargetTitle")}
        body={t("deleteTargetBody")}
        confirmLabel={t("deleteTargetCta")}
        cancelLabel={t("cancel")}
        pending={pending}
        onCancel={() => setConfirmDelete(false)}
        onConfirm={onDelete}
      />
    </article>
  );
}
