"use client";

import { useFormState, useFormStatus } from "react-dom";
import { useTranslations } from "next-intl";
import { login, type AuthActionState } from "@/app/auth/actions";

function SubmitButton() {
  const t = useTranslations("auth");
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-md bg-accent py-2 font-body text-sm text-white transition hover:bg-accent-soft disabled:opacity-60"
    >
      {pending ? "..." : t("login.submit")}
    </button>
  );
}

export function LoginForm({ locale }: { locale: string }) {
  const t = useTranslations("auth");
  const [state, formAction] = useFormState<AuthActionState, FormData>(login, {});

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <input type="hidden" name="locale" value={locale} />
      <label className="flex flex-col gap-1 font-body text-sm">
        {t("fields.email")}
        <input
          type="email"
          name="email"
          required
          autoComplete="email"
          className="rounded-md border border-border bg-card px-3 py-2 text-base"
        />
      </label>
      <label className="flex flex-col gap-1 font-body text-sm">
        {t("fields.password")}
        <input
          type="password"
          name="password"
          required
          minLength={8}
          autoComplete="current-password"
          className="rounded-md border border-border bg-card px-3 py-2 text-base"
        />
      </label>
      {state.error ? (
        <p className="rounded-md bg-danger-bg px-3 py-2 text-sm text-danger">
          {state.error}
        </p>
      ) : null}
      <SubmitButton />
    </form>
  );
}
