import { FrontendSnippetsAdminClient } from "./FrontendSnippetsAdminClient";

export default async function DevelopersFrontendAdminPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return <FrontendSnippetsAdminClient locale={locale} />;
}
