import { setRequestLocale, getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { TargetCard } from "@/components/goal/TargetCard";
import { AddTargetForm } from "@/components/goal/AddTargetForm";
import { GoalHeaderCard } from "@/components/goal/GoalHeaderCard";
import { completeGoal } from "@/lib/goal/mutations";
import { goalProgressPercent } from "@/lib/calculations";

export default async function GoalPage({
  params,
}: {
  params: { locale: string };
}) {
  setRequestLocale(params.locale);
  const t = await getTranslations("goal");

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/${params.locale}/login`);

  const { data: goal } = await supabase
    .from("goals")
    .select("id, title, description, start_date, end_date")
    .eq("user_id", user.id)
    .eq("status", "active")
    .maybeSingle();
  if (!goal) redirect(`/${params.locale}/onboarding/welcome`);

  const { data: targets } = await supabase
    .from("targets")
    .select("id, title, target_value, current_value")
    .eq("goal_id", goal.id)
    .order("order_index", { ascending: true });

  const targetList = targets ?? [];

  const { data: actionRows } = targetList.length
    ? await supabase
        .from("actions")
        .select("id, title, target_id")
        .in(
          "target_id",
          targetList.map((x) => x.id),
        )
        .eq("is_active", true)
    : { data: [] as { id: string; title: string; target_id: string }[] };

  const actionsByTarget = new Map<string, { id: string; title: string }[]>();
  for (const a of actionRows ?? []) {
    const arr = actionsByTarget.get(a.target_id) ?? [];
    arr.push({ id: a.id, title: a.title });
    actionsByTarget.set(a.target_id, arr);
  }

  const percent = goalProgressPercent(targetList);
  const canComplete = percent >= 100;

  return (
    <div className="flex flex-col gap-6">
      <GoalHeaderCard
        locale={params.locale}
        id={goal.id}
        title={goal.title}
        description={goal.description}
        startDate={goal.start_date}
        endDate={goal.end_date}
        percent={percent}
      />

      <section className="flex flex-col gap-3">
        <h2 className="font-body text-sm font-medium text-accent">
          {t("targets")}
        </h2>
        <div className="flex flex-col gap-3">
          {targetList.map((tg) => (
            <TargetCard
              key={tg.id}
              id={tg.id}
              title={tg.title}
              target_value={tg.target_value}
              current_value={tg.current_value}
              actions={actionsByTarget.get(tg.id) ?? []}
            />
          ))}
          <AddTargetForm />
        </div>
      </section>

      <form action={completeGoal}>
        <input type="hidden" name="locale" value={params.locale} />
        <button
          type="submit"
          disabled={!canComplete}
          className="w-full rounded-md bg-accent py-3 font-body text-sm text-white disabled:cursor-not-allowed disabled:opacity-40"
        >
          {t("complete")}
        </button>
      </form>
    </div>
  );
}
