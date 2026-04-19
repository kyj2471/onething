import { type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Card({
  className,
  padded = true,
  ...props
}: HTMLAttributes<HTMLDivElement> & { padded?: boolean }) {
  return (
    <div
      className={cn(
        "rounded-lg border border-border bg-surface",
        padded && "p-5",
        className,
      )}
      {...props}
    />
  );
}

function CardTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn("font-body text-h3 text-fg", className)}
      {...props}
    />
  );
}

function CardBody({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex flex-col gap-3", className)} {...props} />;
}

function CardFooter({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("mt-2 flex items-center justify-end gap-2", className)}
      {...props}
    />
  );
}

Card.Title = CardTitle;
Card.Body = CardBody;
Card.Footer = CardFooter;
