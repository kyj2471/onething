import { useTranslations } from "next-intl";

export function StreakBadge({ count }: { count: number }) {
  const t = useTranslations("today");
  if (count <= 0) return null;
  return (
    <div className="inline-flex items-center gap-2 rounded-full bg-warm-glow px-4 py-1.5 font-mono text-sm text-accent">
      <span aria-hidden>🔥</span>
      <span>{t("streak", { count })}</span>
    </div>
  );
}
