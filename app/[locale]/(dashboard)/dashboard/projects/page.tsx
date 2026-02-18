import { ProjectsClient } from "../_components/ProjectsClient";

type ProjectsPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function ProjectsPage({ params }: ProjectsPageProps) {
  const { locale } = await params;
  return <ProjectsClient locale={locale} />;
}
