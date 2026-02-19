export const locales = ["ar", "tr", "en"] as const;
export const defaultLocale = "en";
export const localePrefix = "always";

export type Locale = (typeof locales)[number];

export const rtlLocales = new Set<Locale>(["ar"]);

export function isLocale(locale?: string | null): locale is Locale {
  return !!locale && locales.includes(locale as Locale);
}
