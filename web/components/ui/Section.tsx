import { type HTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Section({
  title,
  kicker,
  action,
  className,
  children,
  ...props
}: HTMLAttributes<HTMLElement> & {
  title?: ReactNode;
  kicker?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <section className={cn("flex flex-col gap-3", className)} {...props}>
      {(title || kicker || action) && (
        <header className="flex items-end justify-between gap-3">
          <div className="flex flex-col gap-0.5">
            {kicker && (
              <span className="text-caption text-fg-subtle">{kicker}</span>
            )}
            {title && (
              <h2 className="font-body text-h2 text-fg">{title}</h2>
            )}
          </div>
          {action}
        </header>
      )}
      {children}
    </section>
  );
}
