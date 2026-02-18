type InvoicesPageProps = {
  params: Promise<{ locale: string }>;
};

// Placeholder dashboard invoices page kept lightweight for now.
export default async function InvoicesPage({ params }: InvoicesPageProps) {
  const { locale } = await params;
  const { getTranslations } = await import("next-intl/server");
  const t = await getTranslations({ locale, namespace: "dashboard.placeholders" });

  return (
    <main className="min-h-screen bg-white px-6 py-12">
      <div className="mx-auto max-w-5xl space-y-4">
        <h1 className="text-2xl font-bold text-slate-900">{t("invoicesTitle")}</h1>
        <p className="text-slate-600">{t("invoicesBody")}</p>
      </div>
    </main>
  );
}
