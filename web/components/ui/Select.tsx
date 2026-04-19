import { forwardRef, type SelectHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export type SelectProps = SelectHTMLAttributes<HTMLSelectElement>;

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, ...props }, ref) => (
    <select
      ref={ref}
      className={cn(
        "h-10 w-full appearance-none rounded-md border border-border bg-surface bg-no-repeat pl-3 pr-8 font-body text-body text-fg transition hover:border-border-strong focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
        "bg-[length:10px_6px] bg-[position:right_12px_center] bg-[url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 10 6\" fill=\"none\" stroke=\"%236E6B66\" stroke-width=\"1.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><polyline points=\"1,1 5,5 9,1\"/></svg>')]",
        className,
      )}
      {...props}
    >
      {children}
    </select>
  ),
);
Select.displayName = "Select";
