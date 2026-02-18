type ProjectPageProps = {
  params: Promise<{ locale: string; projectId: string }>;
};

export default async function ProjectDetailsPage({ params }: ProjectPageProps) {
  const { projectId } = await params;

  return (
    <main className="min-h-screen bg-white px-6 py-12">
      <div className="mx-auto max-w-5xl space-y-4">
        <h1 className="text-2xl font-bold text-slate-900">
          Project details: {decodeURIComponent(projectId)}
        </h1>
        <p className="text-slate-600">
          Detailed project view will be available soon.
        </p>
      </div>
    </main>
  );
}
