"use client";

import { useState, useTransition } from "react";
import { requestDeletion } from "@/lib/settings/deletion";
import { ConfirmModal } from "@/components/layout/ConfirmModal";
import { Button } from "@/components/ui";

type Labels = {
  deleteAccount: string;
  deleteBody: string;
  confirmTitle: string;
  confirmBody: string;
  confirmCta: string;
  cancel: string;
};

export function DeleteAccountButton({
  locale,
  labels,
}: {
  locale: string;
  labels: Labels;
}) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex flex-col gap-3">
      <p className="text-body-sm text-fg-muted">{labels.deleteBody}</p>
      <Button
        type="button"
        variant="danger"
        size="sm"
        onClick={() => setOpen(true)}
        className="self-start"
      >
        {labels.deleteAccount}
      </Button>

      <ConfirmModal
        open={open}
        title={labels.confirmTitle}
        body={labels.confirmBody}
        confirmLabel={labels.confirmCta}
        cancelLabel={labels.cancel}
        pending={pending}
        onCancel={() => setOpen(false)}
        onConfirm={() =>
          startTransition(() => {
            void requestDeletion(locale);
          })
        }
      />
    </div>
  );
}
