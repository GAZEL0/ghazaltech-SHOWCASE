export const serviceSlugs = [
  "business-management-systems",
  "custom-web-solutions",
  "business-websites",
  "ecommerce-websites",
  "personal-websites",
  "web-automation",
  "technical-audit",
] as const;

export type ServiceSlug = (typeof serviceSlugs)[number];
