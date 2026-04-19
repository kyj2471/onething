"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui";

type ConfirmModalProps = {
  open: boolean;
  title: string;
  body: string;
  confirmLabel: string;
  cancelLabel: string;
  pending?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  tone?: "danger" | "default";
};

export function ConfirmModal({
  open,
  title,
  body,
  confirmLabel,
  cancelLabel,
  pending = false,
  onCancel,
  onConfirm,
  tone = "danger",
}: ConfirmModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !pending) onCancel();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, pending, onCancel]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget && !pending) onCancel();
      }}
    >
      <div className="w-full max-w-sm rounded-xl border border-border bg-surface-elevated p-6 shadow-lg">
        <h3 className="font-display text-[20px] italic leading-snug text-fg">
          {title}
        </h3>
        <p className="mt-2 text-body leading-relaxed text-fg-muted">{body}</p>
        <div className="mt-6 flex justify-end gap-2">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={onCancel}
            disabled={pending}
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
            variant={tone === "danger" ? "danger" : "primary"}
            size="sm"
            disabled={pending}
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
