"use client";

import { useFormState, useFormStatus } from "react-dom";
import { useTranslations } from "next-intl";
import { signup, type AuthActionState } from "@/app/auth/actions";

function SubmitButton() {
  const t = useTranslations("auth");
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-md bg-accent py-2 font-body text-sm text-white transition hover:bg-accent-soft disabled:opacity-60"
    >
      {pending ? "..." : t("signup.submit")}
    </button>
  );
}

export function SignupForm({ locale }: { locale: string }) {
  const t = useTranslations("auth");
  const [state, formAction] = useFormState<AuthActionState, FormData>(signup, {});

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <input type="hidden" name="locale" value={locale} />
      <label className="flex flex-col gap-1 font-body text-sm">
        {t("fields.displayName")}
        <input
          type="text"
          name="display_name"
          required
          maxLength={24}
          autoComplete="nickname"
          placeholder={t("signup.displayNamePlaceholder")}
          className="rounded-md border border-border bg-card px-3 py-2 text-base"
        />
      </label>
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
          autoComplete="new-password"
          className="rounded-md border border-border bg-card px-3 py-2 text-base"
        />
        <span className="font-body text-xs text-muted">
          {t("signup.passwordHint")}
        </span>
      </label>
      <label className="flex items-start gap-2 font-body text-sm">
        <input type="checkbox" name="ageConfirmed" required className="mt-1" />
        <span>{t("signup.ageCheck")}</span>
      </label>
      <label className="flex items-start gap-2 font-body text-sm">
        <input type="checkbox" name="termsAccepted" required className="mt-1" />
        <span>{t.rich("signup.termsCheck", {
          privacy: (chunks) => (
            <a href={`/${locale}/privacy`} className="underline">{chunks}</a>
          ),
          terms: (chunks) => (
            <a href={`/${locale}/terms`} className="underline">{chunks}</a>
          ),
        })}</span>
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
