import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

type GuardResult = Awaited<ReturnType<typeof getServerSession>>;

const loginPath = (locale?: string) => (locale ? `/${locale}/login` : "/login");

export async function requireClient(locale?: string): Promise<GuardResult> {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect(loginPath(locale));
  }

  if (session.user.role !== "CLIENT") {
    redirect(loginPath(locale));
  }

  return session;
}

export async function requireAdmin(locale?: string): Promise<GuardResult> {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect(loginPath(locale));
  }

  if (session.user.role !== "ADMIN") {
    redirect(loginPath(locale));
  }

  return session;
}

export async function requireAdminOrPartner(locale?: string): Promise<GuardResult> {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect(loginPath(locale));
  }

  if (session.user.role !== "ADMIN" && session.user.role !== "PARTNER") {
    redirect(loginPath(locale));
  }

  return session;
}
