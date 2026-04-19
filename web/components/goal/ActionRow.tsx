"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { deleteAction, updateAction } from "@/lib/goal/mutations";
import { ConfirmModal } from "@/components/layout/ConfirmModal";
import { Button, IconButton, Input } from "@/components/ui";

export function ActionRow({
  id,
  title,
}: {
  id: string;
  title: string;
}) {
  const t = useTranslations("goal");
  const [menuOpen, setMenuOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [value, setValue] = useState(title);
  const [pending, startTransition] = useTransition();

  const onDelete = () => {
    const fd = new FormData();
    fd.set("action_id", id);
    startTransition(() => {
      void deleteAction(fd);
    });
  };

  if (editing) {
    return (
      <form
        action={updateAction}
        onSubmit={() => setEditing(false)}
        className="flex items-center gap-2"
      >
        <input type="hidden" name="action_id" value={id} />
        <Input
          type="text"
          name="title"
          required
          autoFocus
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="h-9 flex-1 text-body-sm"
        />
        <Button type="submit" size="sm">
          {t("save")}
        </Button>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => {
            setEditing(false);
            setValue(title);
          }}
        >
          {t("cancel")}
        </Button>
      </form>
    );
  }

  return (
    <li className="flex items-center justify-between gap-2">
      <span className="text-body-sm text-fg-muted">· {title}</span>
      <div className="relative">
        <IconButton
          size="sm"
          aria-label={t("more")}
          onClick={() => setMenuOpen((v) => !v)}
          className="h-7 w-7"
        >
          <span aria-hidden>⋯</span>
        </IconButton>
        {menuOpen ? (
          <div
            className="absolute right-0 top-full z-10 mt-1 flex w-24 flex-col overflow-hidden rounded-md border border-border bg-surface-elevated shadow-md"
            onMouseLeave={() => setMenuOpen(false)}
          >
            <button
              type="button"
              onClick={() => {
                setEditing(true);
                setMenuOpen(false);
              }}
              className="px-3 py-1.5 text-left text-body-sm text-fg hover:bg-accent-subtle"
            >
              {t("edit")}
            </button>
            <button
              type="button"
              onClick={() => {
                setConfirmDelete(true);
                setMenuOpen(false);
              }}
              className="px-3 py-1.5 text-left text-body-sm text-danger hover:bg-danger-bg"
            >
              {t("delete")}
            </button>
          </div>
        ) : null}
      </div>
      <ConfirmModal
        open={confirmDelete}
        title={t("deleteActionTitle")}
        body={t("deleteActionBody")}
        confirmLabel={t("deleteActionCta")}
        cancelLabel={t("cancel")}
        pending={pending}
        onCancel={() => setConfirmDelete(false)}
        onConfirm={onDelete}
      />
    </li>
  );
}
