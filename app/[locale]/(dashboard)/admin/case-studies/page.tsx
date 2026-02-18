import { CaseStudiesAdminClient } from "./CaseStudiesAdminClient";

export default async function AdminCaseStudiesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return <CaseStudiesAdminClient locale={locale} />;
}
