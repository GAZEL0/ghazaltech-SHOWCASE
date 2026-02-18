import { AdminQuotesClient } from "./AdminQuotesClient";

type AdminQuotesPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function AdminQuotesPage({ params }: AdminQuotesPageProps) {
  const { locale } = await params;
  return <AdminQuotesClient locale={locale} />;
}
