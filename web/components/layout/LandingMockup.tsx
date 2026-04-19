import { CircleProgress } from "@/components/goal/CircleProgress";
import { MiniHeatmap } from "@/components/goal/MiniHeatmap";
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
    <div className="relative mx-auto w-full max-w-sm rounded-2xl border border-border bg-surface p-6 shadow-lg">
      <div className="flex items-baseline justify-between">
        <h3 className="font-display text-[20px] italic leading-none text-fg">
          Today
        </h3>
        <span className="text-caption text-fg-subtle">{todayISO()}</span>
      </div>
      <div className="mt-6 flex flex-col items-center gap-3">
        <p className="text-caption text-fg-subtle">{labels.myGoal}</p>
        <p className="font-display text-[17px] italic leading-snug text-fg">
          {labels.goalTitle}
        </p>
        <CircleProgress percent={64} size={144} stroke={8} />
        <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-bg px-3 py-1 text-caption normal-case tracking-normal text-brand-fg">
          <span aria-hidden>🔥</span>
          {labels.streak}
        </span>
      </div>
      <div className="mt-6">
        <p className="mb-2 text-caption text-fg-subtle">{labels.actions}</p>
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
            className={
              "flex items-center gap-3 rounded-lg border px-3 py-2 transition " +
              (a.done
                ? "border-transparent bg-brand-bg"
                : "border-border bg-bg")
            }
          >
            <span
              className={
                "flex h-4 w-4 items-center justify-center rounded-md border " +
                (a.done
                  ? "border-transparent bg-brand text-on-brand"
                  : "border-border-strong")
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
                  "text-body-sm text-fg " +
                  (a.done ? "line-through opacity-60" : "")
                }
              >
                {a.title}
              </span>
              <span className="text-caption text-fg-subtle">{a.target}</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
