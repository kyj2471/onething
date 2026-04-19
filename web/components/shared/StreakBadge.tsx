import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui";

export function StreakBadge({ count }: { count: number }) {
  const t = useTranslations("today");
  if (count <= 0) return null;
  return (
    <Badge variant="brand" className="px-3 py-1 text-body-sm">
      <span aria-hidden>🔥</span>
      <span>{t("streak", { count })}</span>
    </Badge>
  );
}
