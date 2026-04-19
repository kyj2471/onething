import { useTranslations } from "next-intl";
import { progressMessageKey } from "@/lib/calculations";

export function EmotionalMessage({ percent }: { percent: number }) {
  const t = useTranslations("progress.messages");
  const key = progressMessageKey(percent);
  return (
    <p className="text-center font-display text-base italic text-muted">
      {t(key)}
    </p>
  );
}
