import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useSession } from "@/hooks/useSession";
import { useProfile } from "@/hooks/useProfile";
import {
  cancelDailyReminder,
  scheduleDailyReminder,
} from "@/lib/notifications";

export function useReminderSync() {
  const { session } = useSession();
  const userId = session?.user.id;
  const { data: profile } = useProfile(userId);
  const { t, i18n } = useTranslation();
  const lastKey = useRef<string | null>(null);

  useEffect(() => {
    if (!userId) {
      lastKey.current = null;
      cancelDailyReminder().catch(() => {});
      return;
    }
    const reminderTime = profile?.reminder_time ?? null;
    const key = `${userId}|${reminderTime ?? ""}|${i18n.language}`;
    if (key === lastKey.current) return;
    lastKey.current = key;

    if (!reminderTime) {
      cancelDailyReminder().catch(() => {});
      return;
    }
    scheduleDailyReminder(reminderTime, {
      title: t("notifications.daily.title"),
      body: t("notifications.daily.body"),
    }).catch(() => {});
  }, [userId, profile?.reminder_time, i18n.language, t]);
}
