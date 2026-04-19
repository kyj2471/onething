import { setRequestLocale, getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Heatmap } from "@/components/goal/Heatmap";
import { WeeklyBarChart } from "@/components/goal/WeeklyBarChart";
import { rangeOfDays } from "@/lib/calculations";

type HeatmapRow = {
  completed_date: string;
  completed_count: number;
  total_actions: number;
  completion_rate: number;
};

function bestStreak(rows: ReadonlyArray<HeatmapRow>): number {
  let best = 0;
  let current = 0;
  for (const row of rows) {
    if (row.completed_count > 0) {
      current += 1;
      if (current > best) best = current;
    } else {
      current = 0;
    }
  }
  return best;
}

function completionRate(rows: ReadonlyArray<HeatmapRow>): number {
  if (rows.length === 0) return 0;
  const sum = rows.reduce((acc, r) => acc + Number(r.completion_rate ?? 0), 0);
  return sum / rows.length;
}

function weekAverage(rows: ReadonlyArray<HeatmapRow>, dates: string[]): number {
  const byDate = new Map(rows.map((r) => [r.completed_date, r.completion_rate]));
  const values = dates.map((d) => Number(byDate.get(d) ?? 0));
  if (values.length === 0) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

export default async function ProgressPage({
  params,
}: {
  params: { locale: string };
}) {
  setRequestLocale(params.locale);
  const t = await getTranslations("progressPage");

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/${params.locale}/login`);

  const { data: heatmap } = await supabase.rpc("get_heatmap_data", {
    p_user_id: user.id,
    p_days: 365,
  });

  const { data: streakValue } = await supabase.rpc("get_streak", {
    p_user_id: user.id,
  });

  const rows = (heatmap ?? []) as HeatmapRow[];
  const currentStreak = Number(streakValue ?? 0);
  const best = bestStreak(rows);
  const rate = completionRate(rows);

  const last7 = rangeOfDays(7);
  const prev7Start = new Date();
  prev7Start.setDate(prev7Start.getDate() - 7);
  const prev7 = rangeOfDays(7, prev7Start);

  const thisWeek = weekAverage(rows, last7);
  const lastWeek = weekAverage(rows, prev7);
  const delta = thisWeek - lastWeek;

  const stats = [
    { label: t("currentStreak"), value: String(currentStreak) },
    { label: t("bestStreak"), value: String(best) },
    { label: t("completionRate"), value: `${Math.round(rate)}%` },
    {
      label: t("vsLastWeek"),
      value: `${delta >= 0 ? "+" : ""}${Math.round(delta)}%`,
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="font-display text-2xl italic text-accent">
          {t("title")}
        </h1>
      </header>

      <section className="grid grid-cols-2 gap-3">
        {stats.map((s) => (
          <div
            key={s.label}
            className="flex flex-col gap-1 rounded-xl border border-border bg-card p-4"
          >
            <p className="font-mono text-[11px] uppercase tracking-wider text-muted">
              {s.label}
            </p>
            <p className="font-mono text-xl tabular-nums text-accent">
              {s.value}
            </p>
          </div>
        ))}
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-body text-sm font-medium text-accent">
          {t("thisWeek")}
        </h2>
        <div className="rounded-xl border border-border bg-card p-4">
          <WeeklyBarChart data={rows} locale={params.locale} />
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-body text-sm font-medium text-accent">
          {t("yearActivity")}
        </h2>
        <div className="rounded-xl border border-border bg-card p-4">
          <Heatmap data={rows} />
        </div>
      </section>
    </div>
  );
}
