import { AdminCommissionsClient } from "./AdminCommissionsClient";
import { requireAdmin } from "@/lib/auth-guard";

type AdminCommissionsPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function AdminCommissionsPage({ params }: AdminCommissionsPageProps) {
  const { locale } = await params;
  await requireAdmin(locale);
  return <AdminCommissionsClient />;
}
