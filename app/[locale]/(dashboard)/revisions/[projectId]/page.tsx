type RevisionPageProps = {
  params: Promise<{ locale: string; projectId: string }>;
};

export default async function RevisionRequestsPage({ params }: RevisionPageProps) {
  const { projectId, locale } = await params;
  const { getTranslations } = await import("next-intl/server");
  const t = await getTranslations({ locale, namespace: "dashboard.placeholders" });

  return (
    <main className="min-h-screen bg-white px-6 py-12">
      <div className="mx-auto max-w-5xl space-y-4">
        <h1 className="text-2xl font-bold text-slate-900">
          {t("revisionsTitle", { id: decodeURIComponent(projectId) })}
        </h1>
        <p className="text-slate-600">{t("revisionsBody")}</p>
      </div>
    </main>
  );
}
