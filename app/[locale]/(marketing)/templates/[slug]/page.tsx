import { Navbar } from "@/components/marketing/Navbar";
import { NeonBackground } from "@/components/marketing/NeonBackground";
import { Section } from "@/components/marketing/Section";
import { Footer } from "@/components/marketing/Footer";
import { OrderTemplateButton } from "@/components/templates/OrderTemplateButton";
import { ResponsivePreview } from "@/components/marketing/ResponsivePreview";
import { prisma } from "@/lib/db";
import { toNumber } from "@/lib/money";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";

function formatPrice(value: number, currency: string, locale: string) {
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: currency || "USD",
      minimumFractionDigits: 0,
    }).format(value);
  } catch {
    return `${value.toFixed(0)} ${currency || "USD"}`;
  }
}

export default async function TemplateDetailsPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const t = await getTranslations({ locale });
  const isRTL = locale === "ar";

  const template = await prisma.templateSite.findUnique({
    where: { slug },
    include: { gallery: true, service: true },
  });

  if (!template || !template.isActive) {
    notFound();
  }

  const price = formatPrice(toNumber(template.basePrice), template.currency, locale);

  return (
    <NeonBackground>
      <Navbar locale={locale} />
      <main dir={isRTL ? "rtl" : "ltr"} className={isRTL ? "rtl rtl:text-right" : ""}>
        <Section>
          <div className="grid gap-6 rounded-3xl border border-slate-800/60 bg-[#050b18]/80 p-6 shadow-[0_16px_50px_rgba(0,0,0,0.4)] md:grid-cols-[1.1fr,0.9fr]">
            <div className="space-y-3">
              <p className="text-xs uppercase tracking-[0.18em] text-sky-300">
                {t("templates.title")}
              </p>
              <div className="flex flex-wrap items-center gap-2">
                {template.category && (
                  <span className="rounded-full border border-slate-700/60 bg-slate-900/70 px-3 py-1 text-[11px] font-semibold text-slate-200">
                    {template.category}
                  </span>
                )}
                <span className="rounded-full border border-emerald-400/60 bg-emerald-500/10 px-3 py-1 text-sm font-semibold text-emerald-200">
                  {price}
                </span>
              </div>
              <h1 className="text-3xl font-extrabold text-slate-50 sm:text-4xl">
                {template.title}
              </h1>
              <p className="max-w-3xl text-base text-slate-300 sm:text-lg">
                {template.longDescription ?? template.shortDescription ?? ""}
              </p>
              <div className="flex flex-wrap gap-3">
                {template.demoUrl && (
                  <a
                    href={template.demoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-sky-400/70 bg-gradient-to-r from-cyan-500 to-sky-500 px-4 py-2 text-sm font-semibold text-slate-900 shadow-[0_0_22px_rgba(56,189,248,0.45)] transition hover:shadow-[0_0_32px_rgba(56,189,248,0.65)]"
                  >
                    {t("templates.demo")}
                  </a>
                )}
                <OrderTemplateButton
                  templateId={template.id}
                  templateSlug={template.slug}
                  locale={locale}
                  label={t("templates.order")}
                  variant="success"
                  notClientMessage={t("templates.onlyClients")}
                  genericErrorMessage={t("templates.orderError")}
                />
              </div>
              <div className="flex flex-wrap gap-4 text-sm text-slate-400">
                <span>{t("templates.serviceLinked", { service: template.service.title })}</span>
                <span className="text-slate-500">•</span>
                <span>
                  {t("templates.priceFrom", { price })}
                </span>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-2xl border border-slate-800/70 bg-[#0b1120]/80">
              {template.thumbUrl ? (
                <div className="relative h-full min-h-[240px] w-full">
                  <Image
                    src={template.thumbUrl}
                    alt={template.title}
                    fill
                    className="object-cover"
                    sizes="(min-width: 768px) 45vw, 100vw"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#050b18] via-transparent to-transparent" />
                </div>
              ) : (
                <div className="h-full min-h-[240px] bg-[radial-gradient(circle_at_20%_20%,rgba(56,189,248,0.12),transparent_35%),radial-gradient(circle_at_80%_0,rgba(34,197,94,0.12),transparent_30%)]" />
              )}
            </div>
          </div>
        </Section>

        <ResponsivePreview
          title={t("templates.previewTitle")}
          laptopSrc={template.laptopPreviewImage}
          tabletSrc={template.tabletPreviewImage}
          mobileSrc={template.mobilePreviewImage}
        />

        <Section className="space-y-4">
          <h2 className="text-xl font-semibold text-slate-100">
            {t("templates.galleryTitle")}
          </h2>
          <div className="grid gap-3 md:grid-cols-3">
            {template.gallery.map((media) => (
              <div
                key={media.id}
                className="group relative overflow-hidden rounded-2xl border border-slate-800/70 bg-[#0b1120]/80 shadow-[0_10px_30px_rgba(0,0,0,0.4)]"
              >
                <div className="absolute inset-0 opacity-0 transition group-hover:opacity-70 [background:radial-gradient(circle_at_20%_20%,rgba(56,189,248,0.15),transparent_35%),radial-gradient(circle_at_80%_0,rgba(34,197,94,0.15),transparent_30%)]" />
                <div className="relative h-52 w-full overflow-hidden">
                  <Image
                    src={media.url}
                    alt={media.label ?? template.title}
                    fill
                    className="object-cover transition duration-500 group-hover:scale-[1.03]"
                    sizes="(min-width: 768px) 30vw, 100vw"
                  />
                </div>
                {media.label && (
                  <div className="relative z-10 p-3 text-xs text-slate-300">
                    {media.label}
                  </div>
                )}
              </div>
            ))}
          </div>
          {template.gallery.length === 0 && (
            <p className="text-sm text-slate-400">{t("templates.emptyGallery")}</p>
          )}
        </Section>
      </main>
      <Footer />
    </NeonBackground>
  );
}
