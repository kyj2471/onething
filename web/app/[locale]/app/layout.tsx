import { setRequestLocale } from "next-intl/server";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { TabBar } from "@/components/layout/TabBar";
import { AppHeader } from "@/components/layout/AppHeader";

export default async function AppLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  setRequestLocale(params.locale);

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/${params.locale}/login`);

  const { data: goal } = await supabase
    .from("goals")
    .select("id")
    .eq("user_id", user.id)
    .eq("status", "active")
    .maybeSingle();

  if (!goal) redirect(`/${params.locale}/onboarding/welcome`);

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("id", user.id)
    .maybeSingle();

  return (
    <div className="flex min-h-screen flex-col bg-bg text-fg">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col px-5 pb-8 pt-5">
        <AppHeader
          locale={params.locale}
          displayName={profile?.display_name ?? null}
          email={user.email ?? ""}
        />
        <div className="mt-5 flex flex-1 flex-col">{children}</div>
      </div>
      <TabBar locale={params.locale} />
    </div>
  );
}
