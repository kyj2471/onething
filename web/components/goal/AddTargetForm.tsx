"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { addTarget } from "@/lib/goal/mutations";

export function AddTargetForm() {
  const t = useTranslations("goal");
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-md border border-dashed border-border py-3 font-body text-sm text-muted"
      >
        {t("addTarget")}
      </button>
    );
  }

  return (
    <form
      action={addTarget}
      onSubmit={() => setOpen(false)}
      className="flex flex-col gap-2 rounded-xl border border-border bg-card p-4"
    >
      <input
        type="text"
        name="title"
        required
        placeholder={t("titlePlaceholder")}
        className="rounded-md border border-border bg-bg px-3 py-2 font-body text-sm"
      />
      <input
        type="number"
        name="target_value"
        required
        min={1}
        step="any"
        placeholder={t("valuePlaceholder")}
        className="rounded-md border border-border bg-bg px-3 py-2 font-mono text-sm"
      />
      <div className="flex gap-2">
        <button
          type="submit"
          className="flex-1 rounded-md bg-accent py-2 font-body text-sm text-white"
        >
          {t("add")}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-md border border-border px-4 py-2 font-body text-sm text-muted"
        >
          {t("cancel")}
        </button>
      </div>
    </form>
  );
}
