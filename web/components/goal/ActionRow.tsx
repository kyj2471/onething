"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { deleteAction, updateAction } from "@/lib/goal/mutations";
import { ConfirmModal } from "@/components/layout/ConfirmModal";

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
        <input
          type="text"
          name="title"
          required
          autoFocus
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="flex-1 rounded-md border border-border bg-bg px-2 py-1 font-body text-xs"
        />
        <button
          type="submit"
          className="rounded-md bg-accent px-2 py-1 font-body text-xs text-white"
        >
          {t("save")}
        </button>
        <button
          type="button"
          onClick={() => {
            setEditing(false);
            setValue(title);
          }}
          className="rounded-md border border-border px-2 py-1 font-body text-xs text-muted"
        >
          {t("cancel")}
        </button>
      </form>
    );
  }

  return (
    <li className="flex items-center justify-between gap-2">
      <span className="font-body text-xs text-muted">· {title}</span>
      <div className="relative">
        <button
          type="button"
          aria-label={t("more")}
          onClick={() => setMenuOpen((v) => !v)}
          className="rounded px-1 font-mono text-xs text-muted hover:text-accent"
        >
          ⋯
        </button>
        {menuOpen ? (
          <div
            className="absolute right-0 top-full z-10 mt-1 flex w-24 flex-col overflow-hidden rounded-md border border-border bg-card shadow-lg"
            onMouseLeave={() => setMenuOpen(false)}
          >
            <button
              type="button"
              onClick={() => {
                setEditing(true);
                setMenuOpen(false);
              }}
              className="px-2 py-1.5 text-left font-body text-xs text-accent hover:bg-check-bg"
            >
              {t("edit")}
            </button>
            <button
              type="button"
              onClick={() => {
                setConfirmDelete(true);
                setMenuOpen(false);
              }}
              className="px-2 py-1.5 text-left font-body text-xs text-danger hover:bg-danger-bg"
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
