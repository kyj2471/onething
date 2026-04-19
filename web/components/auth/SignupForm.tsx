"use client";

import { useFormState, useFormStatus } from "react-dom";
import { useTranslations } from "next-intl";
import { signup, type AuthActionState } from "@/app/auth/actions";
import { Button, Checkbox, Input } from "@/components/ui";

function SubmitButton() {
  const t = useTranslations("auth");
  const { pending } = useFormStatus();
  return (
    <Button type="submit" block size="lg" disabled={pending}>
      {pending ? "..." : t("signup.submit")}
    </Button>
  );
}

export function SignupForm({ locale }: { locale: string }) {
  const t = useTranslations("auth");
  const [state, formAction] = useFormState<AuthActionState, FormData>(signup, {});

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <input type="hidden" name="locale" value={locale} />
      <label className="flex flex-col gap-1.5">
        <span className="text-caption text-fg-subtle">
          {t("fields.displayName")}
        </span>
        <Input
          type="text"
          name="display_name"
          required
          maxLength={24}
          autoComplete="nickname"
          placeholder={t("signup.displayNamePlaceholder")}
        />
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="text-caption text-fg-subtle">{t("fields.email")}</span>
        <Input
          type="email"
          name="email"
          required
          autoComplete="email"
        />
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="text-caption text-fg-subtle">{t("fields.password")}</span>
        <Input
          type="password"
          name="password"
          required
          minLength={8}
          autoComplete="new-password"
        />
        <span className="text-body-sm text-fg-muted">
          {t("signup.passwordHint")}
        </span>
      </label>
      <label className="flex items-start gap-2.5 text-body-sm text-fg">
        <Checkbox name="ageConfirmed" required className="mt-0.5" />
        <span>{t("signup.ageCheck")}</span>
      </label>
      <label className="flex items-start gap-2.5 text-body-sm text-fg">
        <Checkbox name="termsAccepted" required className="mt-0.5" />
        <span>
          {t.rich("signup.termsCheck", {
            privacy: (chunks) => (
              <a href={`/${locale}/privacy`} className="underline hover:text-fg">
                {chunks}
              </a>
            ),
            terms: (chunks) => (
              <a href={`/${locale}/terms`} className="underline hover:text-fg">
                {chunks}
              </a>
            ),
          })}
        </span>
      </label>
      {state.error ? (
        <p
          role="alert"
          className="rounded-md border border-danger/30 bg-danger-bg px-3 py-2 text-body-sm text-danger"
        >
          {state.error}
        </p>
      ) : null}
      <SubmitButton />
    </form>
  );
}
