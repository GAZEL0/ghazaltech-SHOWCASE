import { AdminReferralsClient } from "./AdminReferralsClient";
import { requireAdmin } from "@/lib/auth-guard";

type AdminReferralsPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function AdminReferralsPage({ params }: AdminReferralsPageProps) {
  const { locale } = await params;
  await requireAdmin(locale);
  return <AdminReferralsClient />;
}
