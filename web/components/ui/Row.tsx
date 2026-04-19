import { type HTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Row({
  label,
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement> & { label: ReactNode }) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-3 py-1",
        className,
      )}
      {...props}
    >
      <span className="font-body text-body text-fg">{label}</span>
      <div className="flex items-center gap-2">{children}</div>
    </div>
  );
}
