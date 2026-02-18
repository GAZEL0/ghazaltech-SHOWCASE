import { ProjectDetailsClient } from "../../_components/ProjectDetailsClient";

type ProjectPageProps = {
  params: Promise<{ locale: string; projectId: string }>;
};

export default async function ProjectDetailsPage({ params }: ProjectPageProps) {
  const { projectId } = await params;
  return <ProjectDetailsClient projectId={decodeURIComponent(projectId)} />;
}
