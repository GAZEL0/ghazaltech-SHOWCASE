import { AdminClient } from "./AdminClient";

type AdminPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function AdminPage({ params }: AdminPageProps) {
  const { locale } = await params;
  return <AdminClient locale={locale} />;
}
