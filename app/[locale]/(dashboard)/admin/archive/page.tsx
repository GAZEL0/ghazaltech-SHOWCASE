import { AdminArchiveClient } from "./AdminArchiveClient";

type AdminArchivePageProps = {
  params: Promise<{ locale: string }>;
};

export default async function AdminArchivePage({ params }: AdminArchivePageProps) {
  const { locale } = await params;
  return <AdminArchiveClient locale={locale} />;
}
