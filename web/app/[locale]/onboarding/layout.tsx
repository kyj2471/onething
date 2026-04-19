import { setRequestLocale } from "next-intl/server";

export default function OnboardingLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  setRequestLocale(params.locale);
  return (
    <div className="min-h-screen bg-bg text-fg">
      <div className="mx-auto flex min-h-screen max-w-md flex-col gap-7 px-6 py-10">
        {children}
      </div>
    </div>
  );
}
