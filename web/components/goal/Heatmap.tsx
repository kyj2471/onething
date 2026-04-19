import { heatmapLevel, rangeOfDays, todayISO } from "@/lib/calculations";
import { heatmapColors } from "@/lib/design-tokens";

type HeatmapCell = {
  completed_date: string;
  completion_rate: number;
};

export function Heatmap({ data, days = 365 }: { data: ReadonlyArray<HeatmapCell>; days?: number }) {
  const range = rangeOfDays(days);
  const byDate = new Map(data.map((d) => [d.completed_date, d.completion_rate]));
  const today = todayISO();

  const weeks: string[][] = [];
  for (let i = 0; i < range.length; i += 7) {
    weeks.push(range.slice(i, i + 7));
  }

  return (
    <div className="overflow-x-auto">
      <div className="flex gap-1 pb-2">
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-1">
            {week.map((date) => {
              const rate = byDate.get(date) ?? 0;
              const level = heatmapLevel(rate);
              const isToday = date === today;
              return (
                <div
                  key={date}
                  title={`${date}: ${Math.round(rate)}%`}
                  className={"h-3 w-3 rounded-sm " + (isToday ? "ring-1 ring-accent" : "")}
                  style={{ backgroundColor: heatmapColors[level] }}
                />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
