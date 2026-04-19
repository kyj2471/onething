"use client";

import { useFormState, useFormStatus } from "react-dom";
import { useTranslations } from "next-intl";
import { login, type AuthActionState } from "@/app/auth/actions";
import { Button, Input } from "@/components/ui";

function SubmitButton() {
  const t = useTranslations("auth");
  const { pending } = useFormStatus();
  return (
    <Button type="submit" block size="lg" disabled={pending}>
      {pending ? "..." : t("login.submit")}
    </Button>
  );
}

export function LoginForm({ locale }: { locale: string }) {
  const t = useTranslations("auth");
  const [state, formAction] = useFormState<AuthActionState, FormData>(login, {});

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <input type="hidden" name="locale" value={locale} />
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
          autoComplete="current-password"
        />
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
