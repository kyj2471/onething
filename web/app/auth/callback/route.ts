import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { routing } from "@/i18n/routing";
import { postLoginPath } from "@/lib/auth/post-login-redirect";

function resolveLocale(nextPath: string | null): string {
  if (!nextPath) return routing.defaultLocale;
  for (const locale of routing.locales) {
    if (nextPath === `/${locale}` || nextPath.startsWith(`/${locale}/`)) {
      return locale;
    }
  }
  return routing.defaultLocale;
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next");

  if (code) {
    const supabase = createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const locale = resolveLocale(next);
      const destination = next ?? (await postLoginPath(locale));
      return NextResponse.redirect(`${origin}${destination}`);
    }
  }

  const locale = resolveLocale(next);
  return NextResponse.redirect(
    `${origin}/${locale}/login?error=auth_callback_failed`,
  );
}
