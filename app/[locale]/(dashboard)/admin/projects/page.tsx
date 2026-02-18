import { ProjectsAdminClient } from "./ProjectsAdminClient";

type AdminProjectsPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function AdminProjectsPage({ params }: AdminProjectsPageProps) {
  const { locale } = await params;
  return <ProjectsAdminClient locale={locale} />;
}
