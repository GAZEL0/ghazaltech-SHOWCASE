function pickEnv(value: string | undefined, fallback: string): string {
  const trimmed = value?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : fallback;
}

export const publicSite = {
  contactEmail: pickEnv(
    process.env.NEXT_PUBLIC_CONTACT_EMAIL,
    "hello@example.com",
  ),
  contactPhone: pickEnv(
    process.env.NEXT_PUBLIC_CONTACT_PHONE,
    "+1 555 000 0000",
  ),
  contactLocationLabel: pickEnv(
    process.env.NEXT_PUBLIC_CONTACT_LOCATION_LABEL,
    "Remote / Worldwide",
  ),
  contactLocationHref: pickEnv(
    process.env.NEXT_PUBLIC_CONTACT_LOCATION_URL,
    "https://maps.google.com",
  ),
  social: {
    facebook: pickEnv(process.env.NEXT_PUBLIC_SOCIAL_FACEBOOK, "#"),
    instagram: pickEnv(process.env.NEXT_PUBLIC_SOCIAL_INSTAGRAM, "#"),
    linkedin: pickEnv(process.env.NEXT_PUBLIC_SOCIAL_LINKEDIN, "#"),
    github: pickEnv(process.env.NEXT_PUBLIC_SOCIAL_GITHUB, "#"),
    whatsapp: pickEnv(process.env.NEXT_PUBLIC_SOCIAL_WHATSAPP, "#"),
  },
} as const;
