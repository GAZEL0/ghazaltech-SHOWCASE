import { AdminSupportClient } from "./AdminSupportClient";

type AdminSupportPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function AdminSupportPage({ params }: AdminSupportPageProps) {
  const { locale } = await params;
  return <AdminSupportClient locale={locale} />;
}
