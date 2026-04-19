import { rangeOfDays } from "@/lib/calculations";

type HeatmapCell = {
  completed_date: string;
  completion_rate: number;
};

export function WeeklyBarChart({
  data,
  locale,
}: {
  data: ReadonlyArray<HeatmapCell>;
  locale: string;
}) {
  const range = rangeOfDays(7);
  const byDate = new Map(data.map((d) => [d.completed_date, d.completion_rate]));

  return (
    <div className="flex h-32 items-end gap-2">
      {range.map((date) => {
        const rate = byDate.get(date) ?? 0;
        const height = Math.max(rate, 4);
        const d = new Date(date);
        const label = d.toLocaleDateString(locale, { weekday: "narrow" });
        return (
          <div key={date} className="flex flex-1 flex-col items-center gap-1">
            <div className="flex h-24 w-full items-end">
              <div
                className="w-full rounded-t bg-progress"
                style={{ height: `${height}%` }}
                title={`${date}: ${Math.round(rate)}%`}
              />
            </div>
            <span className="font-mono text-[10px] text-muted">{label}</span>
          </div>
        );
      })}
    </div>
  );
}
