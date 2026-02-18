import "server-only";

const LOCAL_URL = "http://localhost:3000";

function sanitizeUrl(value?: string): string {
  if (!value) return LOCAL_URL;

  try {
    const parsed = new URL(value);
    return parsed.toString().replace(/\/$/, "");
  } catch {
    return LOCAL_URL;
  }
}

export function getSiteUrl(): string {
  return sanitizeUrl(
    process.env.NEXT_PUBLIC_SITE_URL ?? process.env.NEXTAUTH_URL ?? LOCAL_URL,
  );
}
