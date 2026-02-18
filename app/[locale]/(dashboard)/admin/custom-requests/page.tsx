import { CustomRequestsAdminClient } from "./CustomRequestsAdminClient";

export default async function AdminCustomRequestsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return <CustomRequestsAdminClient locale={locale} />;
}
