"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { postLoginPath } from "@/lib/auth/post-login-redirect";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

const signupSchema = credentialsSchema.extend({
  display_name: z.string().trim().min(1).max(24),
  ageConfirmed: z.literal("on"),
  termsAccepted: z.literal("on"),
  locale: z.string(),
});

export type AuthActionState = {
  error?: string;
};

function originFromHeaders(): string {
  const h = headers();
  const proto = h.get("x-forwarded-proto") ?? "http";
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  return `${proto}://${host}`;
}

export async function login(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = credentialsSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: "invalid_credentials_format" };
  }

  const locale = String(formData.get("locale") ?? "en");
  const supabase = createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) {
    return { error: error.message };
  }

  revalidatePath("/", "layout");
  redirect(await postLoginPath(locale));
}

export async function signup(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = signupSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    display_name: formData.get("display_name"),
    ageConfirmed: formData.get("ageConfirmed"),
    termsAccepted: formData.get("termsAccepted"),
    locale: formData.get("locale"),
  });
  if (!parsed.success) {
    return { error: "invalid_signup_format" };
  }

  const supabase = createClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      emailRedirectTo: `${originFromHeaders()}/auth/callback?next=/${parsed.data.locale}/onboarding/welcome`,
      data: {
        locale: parsed.data.locale,
        display_name: parsed.data.display_name,
      },
    },
  });
  if (error) {
    return { error: error.message };
  }

  if (data.session) {
    revalidatePath("/", "layout");
    redirect(`/${parsed.data.locale}/onboarding/welcome`);
  }

  redirect(`/${parsed.data.locale}/login?pending=verify`);
}

export async function signout(locale: string): Promise<void> {
  const supabase = createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect(`/${locale}/login`);
}

export async function signInWithGoogle(locale: string): Promise<void> {
  const supabase = createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${originFromHeaders()}/auth/callback?next=/${locale}/onboarding/welcome`,
    },
  });
  if (error || !data.url) {
    redirect(`/${locale}/login?error=oauth_failed`);
  }
  redirect(data.url);
}
