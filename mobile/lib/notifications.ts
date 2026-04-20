import { Platform } from "react-native";
import * as Notifications from "expo-notifications";
import { SchedulableTriggerInputTypes } from "expo-notifications";

export const DAILY_REMINDER_ID = "daily-reminder";
const DAILY_REMINDER_CHANNEL = "daily-reminder";

let handlerRegistered = false;
let androidChannelEnsured = false;

export function registerNotificationHandler() {
  if (handlerRegistered) return;
  handlerRegistered = true;
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });
}

async function ensureAndroidChannel() {
  if (Platform.OS !== "android" || androidChannelEnsured) return;
  androidChannelEnsured = true;
  await Notifications.setNotificationChannelAsync(DAILY_REMINDER_CHANNEL, {
    name: "Daily reminder",
    importance: Notifications.AndroidImportance.DEFAULT,
    vibrationPattern: [0, 200],
    lightColor: "#d9f24a",
    showBadge: false,
  });
}

export async function ensureNotificationPermissions(): Promise<boolean> {
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  if (!current.canAskAgain) return false;
  const requested = await Notifications.requestPermissionsAsync();
  return requested.granted;
}

export async function cancelDailyReminder() {
  try {
    await Notifications.cancelScheduledNotificationAsync(DAILY_REMINDER_ID);
  } catch {
    // identifier may not exist; ignore
  }
}

export type ReminderCopy = {
  title: string;
  body: string;
};

function parseTime(value: string | null | undefined): { hour: number; minute: number } | null {
  if (!value) return null;
  const match = /^(\d{1,2}):(\d{2})/.exec(value);
  if (!match) return null;
  const hour = Number(match[1]);
  const minute = Number(match[2]);
  if (!Number.isFinite(hour) || !Number.isFinite(minute)) return null;
  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) return null;
  return { hour, minute };
}

export async function scheduleDailyReminder(
  reminderTime: string | null | undefined,
  copy: ReminderCopy,
): Promise<boolean> {
  await cancelDailyReminder();
  const parsed = parseTime(reminderTime);
  if (!parsed) return false;

  const granted = await ensureNotificationPermissions();
  if (!granted) return false;

  await ensureAndroidChannel();

  await Notifications.scheduleNotificationAsync({
    identifier: DAILY_REMINDER_ID,
    content: {
      title: copy.title,
      body: copy.body,
      sound: false,
      ...(Platform.OS === "android" ? { channelId: DAILY_REMINDER_CHANNEL } : {}),
    },
    trigger: {
      type: SchedulableTriggerInputTypes.DAILY,
      hour: parsed.hour,
      minute: parsed.minute,
    },
  });
  return true;
}
