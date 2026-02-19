import createMiddleware from "next-intl/middleware";
import type { NextRequest } from "next/server";
import { locales, defaultLocale, localePrefix } from "./07-i18n-config";

const PUBLIC_FILE = /\.(.*)$/;

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix,
});

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const referralCode = request.nextUrl.searchParams.get("ref")?.trim();

  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    PUBLIC_FILE.test(pathname)
  ) {
    return intlMiddleware(request);
  }

  const response = intlMiddleware(request);
  if (referralCode) {
    response.cookies.set("gt_ref", referralCode, {
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
  }
  return response;
}

export const config = {
  matcher: ["/((?!_next|favicon.ico|.*\\..*|api).*)"],
};
