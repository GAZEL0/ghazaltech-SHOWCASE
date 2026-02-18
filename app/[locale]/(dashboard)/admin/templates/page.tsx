import { TemplatesAdminClient } from "./TemplatesAdminClient";

export default async function AdminTemplatesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return <TemplatesAdminClient locale={locale} />;
}
