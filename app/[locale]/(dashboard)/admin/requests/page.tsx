import { CustomRequestsAdminClient } from "../custom-requests/CustomRequestsAdminClient";

type RequestsPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function RequestsPage({ params }: RequestsPageProps) {
  const { locale } = await params;
  return <CustomRequestsAdminClient locale={locale} />;
}
