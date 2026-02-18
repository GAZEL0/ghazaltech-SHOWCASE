export const locales = ["ar", "tr", "en"] as const;
export const defaultLocale = "en";

export type Locale = (typeof locales)[number];

export const rtlLocales = new Set<Locale>(["ar"]);

export const localePrefix = "always";

export function isLocale(locale?: string | null): locale is Locale {
  if (!locale) return false;
  return locales.includes(locale as Locale);
}

const requestConfig = {
  locales,
  defaultLocale,
  localePrefix,
};

export default requestConfig;
