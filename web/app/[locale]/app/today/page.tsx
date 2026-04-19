import { setRequestLocale, getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CircleProgress } from "@/components/goal/CircleProgress";
import { MiniHeatmap } from "@/components/goal/MiniHeatmap";
import { ActionChecklist } from "@/components/goal/ActionChecklist";
import { TargetProgressList } from "@/components/goal/TargetProgressList";
import { StreakBadge } from "@/components/shared/StreakBadge";
import { EmotionalMessage } from "@/components/shared/EmotionalMessage";
import { Card, Section } from "@/components/ui";
import { goalProgressPercent, todayISO } from "@/lib/calculations";

export default async function TodayPage({
  params,
}: {
  params: { locale: string };
}) {
  setRequestLocale(params.locale);
  const t = await getTranslations("today");

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/${params.locale}/login`);

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("id", user.id)
    .maybeSingle();

  const { data: goal } = await supabase
    .from("goals")
    .select("id, title")
    .eq("user_id", user.id)
    .eq("status", "active")
    .maybeSingle();
  if (!goal) redirect(`/${params.locale}/onboarding/welcome`);

  const { data: targets } = await supabase
    .from("targets")
    .select("id, title, target_value, current_value")
    .eq("goal_id", goal.id)
    .order("order_index", { ascending: true });

  const { data: actions } = await supabase
    .from("actions")
    .select("id, title, target_id, is_active")
    .in("target_id", (targets ?? []).map((x) => x.id))
    .eq("is_active", true);

  const today = todayISO();
  const actionIds = (actions ?? []).map((a) => a.id);

  let completedSet = new Set<string>();
  if (actionIds.length > 0) {
    const { data: todayLogs } = await supabase
      .from("action_logs")
      .select("action_id")
      .eq("user_id", user.id)
      .eq("completed_date", today)
      .in("action_id", actionIds);
    completedSet = new Set((todayLogs ?? []).map((l) => l.action_id));
  }

  const { data: heatmap } = await supabase.rpc("get_heatmap_data", {
    p_user_id: user.id,
    p_days: 56,
  });

  const { data: streakValue } = await supabase.rpc("get_streak", {
    p_user_id: user.id,
  });

  const percent = goalProgressPercent(targets ?? []);

  const targetTitleById = new Map((targets ?? []).map((t) => [t.id, t.title]));
  const checklist = (actions ?? []).map((a) => ({
    id: a.id,
    title: a.title,
    target_title: targetTitleById.get(a.target_id) ?? "",
    completed: completedSet.has(a.id),
  }));

  const todayLabel = new Date().toLocaleDateString(params.locale, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  return (
    <div className="flex flex-col gap-7">
      <header className="flex items-baseline justify-between gap-3">
        <h1 className="font-display text-display italic text-fg">
          {profile?.display_name
            ? t("greeting", { name: profile.display_name })
            : t("title")}
        </h1>
        <span className="text-caption text-fg-subtle">{todayLabel}</span>
      </header>

      <Card padded={false} className="flex flex-col items-center gap-4 px-5 py-7">
        <p className="text-caption text-fg-subtle">{t("myGoal")}</p>
        <h2 className="text-center font-display text-[22px] italic leading-snug text-fg">
          {goal.title}
        </h2>
        <CircleProgress percent={percent} />
        <EmotionalMessage percent={percent} />
        <StreakBadge count={Number(streakValue ?? 0)} />
      </Card>

      {(targets ?? []).length > 0 ? (
        <Section title={t("targetsTitle")}>
          <TargetProgressList targets={targets ?? []} />
        </Section>
      ) : null}

      <Section title={t("recentActivity")}>
        <MiniHeatmap
          data={(heatmap ?? []) as { completed_date: string; completion_rate: number }[]}
        />
      </Section>

      <ActionChecklist actions={checklist} />
    </div>
  );
}
