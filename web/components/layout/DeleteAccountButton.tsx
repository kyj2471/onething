"use client";

import { useState, useTransition } from "react";
import { requestDeletion } from "@/lib/settings/deletion";
import { ConfirmModal } from "@/components/layout/ConfirmModal";

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
      <p className="font-body text-xs text-muted">{labels.deleteBody}</p>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="self-start rounded-md border border-danger bg-danger-bg px-3 py-1.5 font-body text-xs text-danger"
      >
        {labels.deleteAccount}
      </button>

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
