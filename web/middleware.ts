import createIntlMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { routing } from "./i18n/routing";
import { updateSession } from "./lib/supabase/middleware";

const intlMiddleware = createIntlMiddleware(routing);

const PROTECTED_SEGMENTS = ["/app", "/onboarding"];

function stripLocale(pathname: string): string {
  for (const locale of routing.locales) {
    const prefix = `/${locale}`;
    if (pathname === prefix) return "/";
    if (pathname.startsWith(`${prefix}/`)) return pathname.slice(prefix.length);
  }
  return pathname;
}

function isProtected(pathname: string): boolean {
  const rest = stripLocale(pathname);
  return PROTECTED_SEGMENTS.some(
    (seg) => rest === seg || rest.startsWith(`${seg}/`),
  );
}

function localeOf(pathname: string): string {
  for (const locale of routing.locales) {
    if (pathname === `/${locale}` || pathname.startsWith(`/${locale}/`)) {
      return locale;
    }
  }
  return routing.defaultLocale;
}

export default async function middleware(request: NextRequest) {
  const intlResponse = intlMiddleware(request);

  if (intlResponse.status >= 300 && intlResponse.status < 400) {
    return intlResponse;
  }

  const response =
    intlResponse instanceof NextResponse
      ? intlResponse
      : NextResponse.next({ request });

  if (!process.env["NEXT_PUBLIC_SUPABASE_URL"]) {
    return response;
  }

  const { user } = await updateSession(request, response);

  if (!user && isProtected(request.nextUrl.pathname)) {
    const locale = localeOf(request.nextUrl.pathname);
    const loginUrl = new URL(`/${locale}/login`, request.url);
    loginUrl.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
