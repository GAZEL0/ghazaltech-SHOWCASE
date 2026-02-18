import { AdminUsersClient } from "./AdminUsersClient";
import { requireAdmin } from "@/lib/auth-guard";

type AdminUsersPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function AdminUsersPage({ params }: AdminUsersPageProps) {
  const { locale } = await params;
  await requireAdmin(locale);
  return <AdminUsersClient locale={locale} />;
}
