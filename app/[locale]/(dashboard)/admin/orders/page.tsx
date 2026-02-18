import { AdminOrdersClient } from "./AdminOrdersClient";

type AdminOrdersPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function AdminOrdersPage({ params }: AdminOrdersPageProps) {
  const { locale } = await params;
  return <AdminOrdersClient locale={locale} />;
}
