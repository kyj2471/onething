"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { addAction } from "@/lib/goal/mutations";
import { Button, Input } from "@/components/ui";

export function AddActionForm({ targetId }: { targetId: string }) {
  const t = useTranslations("goal");
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="self-start text-body-sm text-fg-muted underline-offset-2 hover:text-fg hover:underline"
      >
        + {t("addAction")}
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
      <Input
        type="text"
        name="title"
        required
        autoFocus
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder={t("actionPlaceholder")}
        className="h-9 flex-1 text-body-sm"
      />
      <Button type="submit" size="sm">
        {t("add")}
      </Button>
      <Button
        type="button"
        variant="secondary"
        size="sm"
        onClick={() => {
          setOpen(false);
          setTitle("");
        }}
      >
        {t("cancel")}
      </Button>
    </form>
  );
}
