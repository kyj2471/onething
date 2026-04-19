"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { addTarget } from "@/lib/goal/mutations";
import { Button, Input, NumberInput } from "@/components/ui";

export function AddTargetForm() {
  const t = useTranslations("goal");
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-md border border-dashed border-border-strong py-3.5 text-body text-fg-muted transition hover:border-accent hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
      >
        + {t("addTarget")}
      </button>
    );
  }

  return (
    <form
      action={addTarget}
      onSubmit={() => setOpen(false)}
      className="flex flex-col gap-2 rounded-lg border border-border bg-surface p-4"
    >
      <Input
        type="text"
        name="title"
        required
        placeholder={t("titlePlaceholder")}
      />
      <NumberInput
        name="target_value"
        required
        min={1}
        step="any"
        placeholder={t("valuePlaceholder")}
        className="font-mono"
      />
      <div className="flex gap-2">
        <Button type="submit" block size="sm">
          {t("add")}
        </Button>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => setOpen(false)}
        >
          {t("cancel")}
        </Button>
      </div>
    </form>
  );
}
