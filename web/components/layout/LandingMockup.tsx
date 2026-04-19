import { CircleProgress } from "@/components/goal/CircleProgress";
import { MiniHeatmap } from "@/components/goal/MiniHeatmap";
import { heatmapColors } from "@/lib/design-tokens";
import { todayISO } from "@/lib/calculations";

function buildDemoHeatmap() {
  const levels = [0, 1, 0, 2, 3, 4, 2, 3, 1, 0, 2, 3, 4, 4, 3, 2, 1, 0, 3, 4, 3, 2, 4, 4, 2, 1, 3, 4, 4, 3, 2, 1, 0, 2, 3, 4, 2, 1, 3, 4, 4, 3, 2, 1, 0, 2, 3, 4, 3, 4, 2, 1, 3, 4, 4, 3];
  const today = new Date();
  const out: { completed_date: string; completion_rate: number }[] = [];
  for (let i = 55; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    const level = levels[55 - i] ?? 0;
    const rate = level === 0 ? 0 : level === 1 ? 15 : level === 2 ? 40 : level === 3 ? 75 : 100;
    out.push({ completed_date: `${y}-${m}-${dd}`, completion_rate: rate });
  }
  return out;
}

export function LandingMockup({
  labels,
}: {
  labels: {
    myGoal: string;
    goalTitle: string;
    streak: string;
    actions: string;
    action1: string;
    action2: string;
    action3: string;
    target1: string;
    target2: string;
    completed: string;
  };
}) {
  return (
    <div className="relative mx-auto w-full max-w-sm rounded-3xl border border-border bg-card p-6 shadow-xl">
      <div className="flex items-baseline justify-between">
        <h3 className="font-display text-lg italic text-accent">Today</h3>
        <span className="font-mono text-[10px] uppercase tracking-wider text-muted">
          {todayISO()}
        </span>
      </div>
      <div className="mt-5 flex flex-col items-center gap-3">
        <p className="font-mono text-[10px] uppercase tracking-wider text-muted">
          {labels.myGoal}
        </p>
        <p className="font-display text-base italic text-accent">
          {labels.goalTitle}
        </p>
        <CircleProgress percent={64} size={150} stroke={10} />
        <span
          className="inline-flex items-center gap-2 rounded-full px-3 py-1 font-mono text-xs text-accent"
          style={{ backgroundColor: heatmapColors[1] }}
        >
          🔥 {labels.streak}
        </span>
      </div>
      <div className="mt-5">
        <p className="mb-2 font-body text-xs font-medium text-accent">
          {labels.actions}
        </p>
        <MiniHeatmap data={buildDemoHeatmap()} weeks={8} />
      </div>
      <ul className="mt-5 flex flex-col gap-2">
        {[
          { title: labels.action1, target: labels.target1, done: true },
          { title: labels.action2, target: labels.target1, done: true },
          { title: labels.action3, target: labels.target2, done: false },
        ].map((a, i) => (
          <li
            key={i}
            className="flex items-center gap-3 rounded-lg border border-border bg-bg px-3 py-2"
          >
            <span
              className={
                "flex h-4 w-4 items-center justify-center rounded-md border " +
                (a.done ? "border-check bg-check text-white" : "border-border")
              }
              aria-hidden
            >
              {a.done ? (
                <svg viewBox="0 0 20 20" className="h-2.5 w-2.5 fill-current">
                  <path d="M7.5 13.5L4 10l1.4-1.4 2.1 2.1 6.1-6.1L15 6z" />
                </svg>
              ) : null}
            </span>
            <div className="flex flex-1 flex-col">
              <span
                className={
                  "font-body text-xs text-accent " +
                  (a.done ? "line-through opacity-70" : "")
                }
              >
                {a.title}
              </span>
              <span className="font-mono text-[10px] uppercase tracking-wider text-muted">
                {a.target}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
