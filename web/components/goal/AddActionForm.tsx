"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { addAction } from "@/lib/goal/mutations";

export function AddActionForm({ targetId }: { targetId: string }) {
  const t = useTranslations("goal");
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="self-start font-body text-xs text-muted underline-offset-2 hover:underline"
      >
        {t("addAction")}
      </button>
    );
  }

  return (
    <form
      action={addAction}
      onSubmit={() => {
        setOpen(false);
        setTitle("");
      }}
      className="flex items-center gap-2"
    >
      <input type="hidden" name="target_id" value={targetId} />
      <input
        type="text"
        name="title"
        required
        autoFocus
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder={t("actionPlaceholder")}
        className="flex-1 rounded-md border border-border bg-bg px-2 py-1.5 font-body text-xs"
      />
      <button
        type="submit"
        className="rounded-md bg-accent px-2 py-1.5 font-body text-xs text-white"
      >
        {t("add")}
      </button>
      <button
        type="button"
        onClick={() => {
          setOpen(false);
          setTitle("");
        }}
        className="rounded-md border border-border px-2 py-1.5 font-body text-xs text-muted"
      >
        {t("cancel")}
      </button>
    </form>
  );
}
