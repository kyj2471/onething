import { ReactNode } from "react";
import { useReminderSync } from "@/hooks/useReminderSync";
import { registerNotificationHandler } from "@/lib/notifications";

registerNotificationHandler();

export function NotificationProvider({ children }: { children: ReactNode }) {
  useReminderSync();
  return <>{children}</>;
}
