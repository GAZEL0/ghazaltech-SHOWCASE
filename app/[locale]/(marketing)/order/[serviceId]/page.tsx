type OrderPageProps = {
  params: Promise<{ locale: string; serviceId: string }>;
};

export default async function OrderPage({ params }: OrderPageProps) {
  const { serviceId, locale } = await params;
  const { getTranslations } = await import("next-intl/server");
  const t = await getTranslations({ locale, namespace: "marketing.placeholders" });

  return (
    <main className="min-h-screen bg-white px-6 py-12">
      <div className="mx-auto max-w-3xl space-y-4">
        <h1 className="text-2xl font-bold text-slate-900">
          {t("orderTitle", { service: decodeURIComponent(serviceId) })}
        </h1>
        <p className="text-slate-600">{t("orderBody")}</p>
      </div>
    </main>
  );
}
