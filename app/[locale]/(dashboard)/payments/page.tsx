type PaymentsPageProps = {
  params: Promise<{ locale: string }>;
};

// Placeholder payments page kept minimal to satisfy routing/types.
export default async function PaymentsPage({ params }: PaymentsPageProps) {
  const { locale } = await params;
  const { getTranslations } = await import("next-intl/server");
  const t = await getTranslations({ locale, namespace: "dashboard.placeholders" });

  return (
    <main className="min-h-screen bg-white px-6 py-12">
      <div className="mx-auto max-w-5xl space-y-4">
        <h1 className="text-2xl font-bold text-slate-900">{t("paymentsTitle")}</h1>
        <p className="text-slate-600">{t("paymentsBody")}</p>
      </div>
    </main>
  );
}
