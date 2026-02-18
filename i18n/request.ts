import { getRequestConfig } from "next-intl/server";
import {
  defaultLocale,
  isLocale,
  localePrefix,
  locales,
} from "../i18n";

export default getRequestConfig(async ({ requestLocale }) => {
  const locale = await requestLocale;
  const resolvedLocale = isLocale(locale) ? locale : defaultLocale;

  return {
    locale: resolvedLocale,
    locales,
    defaultLocale,
    localePrefix,
    messages: (await import(`../messages/${resolvedLocale}.json`)).default,
  };
});
