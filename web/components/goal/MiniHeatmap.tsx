import { heatmapLevel, rangeOfDays, todayISO } from "@/lib/calculations";
import { heatmapColors } from "@/lib/design-tokens";

type HeatmapCell = {
  completed_date: string;
  completion_rate: number;
};

export function MiniHeatmap({
  data,
  weeks = 8,
}: {
  data: ReadonlyArray<HeatmapCell>;
  weeks?: number;
}) {
  const totalDays = weeks * 7;
  const range = rangeOfDays(totalDays);
  const byDate = new Map(data.map((d) => [d.completed_date, d.completion_rate]));
  const today = todayISO();

  const columns: string[][] = [];
  for (let w = 0; w < weeks; w++) {
    columns.push(range.slice(w * 7, (w + 1) * 7));
  }

  return (
    <div className="flex gap-1" role="img" aria-label="Recent activity heatmap">
      {columns.map((week, wi) => (
        <div key={wi} className="flex flex-col gap-1">
          {week.map((date) => {
            const rate = byDate.get(date) ?? 0;
            const level = heatmapLevel(rate);
            const isToday = date === today;
            return (
              <div
                key={date}
                title={`${date}: ${Math.round(rate)}%`}
                className={
                  "h-3.5 w-3.5 rounded-sm " + (isToday ? "ring-1 ring-accent" : "")
                }
                style={{ backgroundColor: heatmapColors[level] }}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}
