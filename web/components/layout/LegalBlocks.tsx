import type { ReactNode } from "react";

export function Section({
  heading,
  children,
}: {
  heading: string;
  children: ReactNode;
}) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="font-display text-[20px] italic leading-snug text-fg">
        {heading}
      </h2>
      <div className="flex flex-col gap-2 text-body text-fg-muted">
        {children}
      </div>
    </section>
  );
}

export function Bullets({ items }: { items: ReadonlyArray<ReactNode> }) {
  return (
    <ul className="ml-5 list-disc space-y-1 marker:text-fg-subtle">
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
  );
}
