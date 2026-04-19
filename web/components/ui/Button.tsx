import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const button = cva(
  "inline-flex items-center justify-center gap-1.5 rounded-md font-body font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-bg disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        primary:
          "bg-accent text-white dark:text-[#111111] shadow-sm hover:bg-accent-hover hover:shadow-md focus-visible:ring-accent",
        secondary:
          "border border-border-strong bg-surface text-fg hover:bg-accent-subtle focus-visible:ring-accent",
        ghost:
          "bg-transparent text-fg hover:bg-accent-subtle focus-visible:ring-accent",
        brand:
          "bg-brand text-on-brand hover:bg-brand-strong focus-visible:ring-brand-strong",
        danger:
          "border border-danger/40 bg-danger-bg text-danger hover:bg-danger hover:text-white dark:hover:text-[#111111] focus-visible:ring-danger",
      },
      size: {
        sm: "h-8 px-3 text-body-sm",
        md: "h-10 px-4 text-body",
        lg: "h-12 px-5 text-body",
      },
      block: {
        true: "w-full",
        false: "",
      },
    },
    defaultVariants: { variant: "primary", size: "md", block: false },
  },
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof button> {}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, block, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(button({ variant, size, block }), className)}
      {...props}
    />
  ),
);
Button.displayName = "Button";
