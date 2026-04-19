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
import { Button, Card, IconButton, Input, NumberInput } from "@/components/ui";

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
    <Card className="flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-1 flex-col gap-1">
          <span className="text-body text-fg">{title}</span>
          <span className="text-mono text-fg-muted">
            {current_value} / {target_value}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-mono text-fg">{Math.round(percent)}%</span>
          <div className="relative">
            <IconButton
              size="sm"
              aria-label={t("more")}
              onClick={() => setMenuOpen((v) => !v)}
            >
              <span aria-hidden>⋯</span>
            </IconButton>
            {menuOpen ? (
              <div
                className="absolute right-0 top-full z-10 mt-1 flex w-28 flex-col overflow-hidden rounded-md border border-border bg-surface-elevated shadow-md"
                onMouseLeave={() => setMenuOpen(false)}
              >
                <button
                  type="button"
                  onClick={() => {
                    setEditingDetails(true);
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
      </div>

      <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-muted">
        <div
          className="h-full rounded-full bg-brand transition-all"
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
          <Input
            type="text"
            name="title"
            required
            value={detTitle}
            onChange={(e) => setDetTitle(e.target.value)}
            placeholder={t("titlePlaceholder")}
          />
          <NumberInput
            name="target_value"
            required
            min={1}
            step="any"
            value={detValue}
            onChange={(e) => setDetValue(e.target.value)}
            placeholder={t("valuePlaceholder")}
            className="font-mono"
          />
          <div className="flex gap-2">
            <Button type="submit" block size="sm">
              {t("save")}
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => {
                setEditingDetails(false);
                setDetTitle(title);
                setDetValue(String(target_value));
              }}
            >
              {t("cancel")}
            </Button>
          </div>
        </form>
      ) : editingValue ? (
        <form
          action={updateTargetValue}
          onSubmit={() => setEditingValue(false)}
          className="flex items-center gap-2"
        >
          <input type="hidden" name="target_id" value={id} />
          <NumberInput
            name="current_value"
            required
            min={0}
            step="any"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="flex-1 font-mono"
          />
          <Button type="submit" size="sm">
            {t("save")}
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => {
              setEditingValue(false);
              setValue(String(current_value));
            }}
          >
            {t("cancel")}
          </Button>
        </form>
      ) : (
        <button
          type="button"
          onClick={() => setEditingValue(true)}
          className="self-start text-body-sm text-fg-muted underline-offset-2 hover:text-fg hover:underline"
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
    </Card>
  );
}
