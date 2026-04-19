import { cn } from "@/lib/utils";

export function OnboardingStepper({
  step,
  total = 5,
  ariaLabel,
}: {
  step: number;
  total?: number;
  ariaLabel: string;
}) {
  return (
    <div
      role="progressbar"
      aria-valuemin={1}
      aria-valuemax={total}
      aria-valuenow={step}
      aria-label={ariaLabel}
      className="flex items-center gap-1.5"
    >
      {Array.from({ length: total }, (_, i) => i + 1).map((n) => (
        <span
          key={n}
          aria-hidden
          className={cn(
            "h-1 flex-1 rounded-full transition",
            n <= step ? "bg-accent" : "bg-surface-muted",
          )}
        />
      ))}
    </div>
  );
}
