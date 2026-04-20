export type ProgressMessageKey =
  | "0_10"
  | "11_25"
  | "26_50"
  | "51_75"
  | "76_99"
  | "100";

export function progressMessageKey(percent: number): ProgressMessageKey {
  const p = Math.max(0, Math.min(100, percent));
  if (p >= 100) return "100";
  if (p >= 76) return "76_99";
  if (p >= 51) return "51_75";
  if (p >= 26) return "26_50";
  if (p >= 11) return "11_25";
  return "0_10";
}

export type HeatmapLevel = 0 | 1 | 2 | 3 | 4;

export function heatmapLevel(completionRate: number): HeatmapLevel {
  const r = Math.max(0, Math.min(100, completionRate));
  if (r >= 100) return 4;
  if (r >= 51) return 3;
  if (r >= 26) return 2;
  if (r >= 1) return 1;
  return 0;
}

export function targetProgressPercent(current: number, target: number): number {
  if (!target || target <= 0) return 0;
  return Math.min((current / target) * 100, 100);
}

export function goalProgressPercent(
  targets: ReadonlyArray<{ current_value: number; target_value: number }>,
): number {
  if (targets.length === 0) return 0;
  const total = targets.reduce(
    (sum, t) => sum + targetProgressPercent(t.current_value, t.target_value),
    0,
  );
  return total / targets.length;
}

export function toISODate(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function todayISO(): string {
  return toISODate(new Date());
}

export function rangeOfDays(days: number, endDate: Date = new Date()): string[] {
  const result: string[] = [];
  const end = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(end);
    d.setDate(end.getDate() - i);
    result.push(toISODate(d));
  }
  return result;
}

export function streakFromDates(
  completedDates: ReadonlyArray<string>,
  today: Date = new Date(),
): number {
  const set = new Set(completedDates);
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  let streak = 0;
  const cursor = new Date(start);

  if (!set.has(toISODate(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
  }

  while (set.has(toISODate(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export function circleDashArray(percent: number, radius: number): {
  circumference: number;
  offset: number;
} {
  const circumference = 2 * Math.PI * radius;
  const p = Math.max(0, Math.min(100, percent));
  const offset = circumference * (1 - p / 100);
  return { circumference, offset };
}
