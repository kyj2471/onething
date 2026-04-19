import { useTranslations } from "next-intl";
import { progressMessageKey } from "@/lib/calculations";

export function EmotionalMessage({ percent }: { percent: number }) {
  const t = useTranslations("progress.messages");
  const key = progressMessageKey(percent);
  return (
    <p className="text-center font-display text-[17px] italic leading-snug text-fg-muted">
      {t(key)}
    </p>
  );
}
