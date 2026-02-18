import { Navbar } from "@/components/marketing/Navbar";
import { Section } from "@/components/marketing/Section";
import { NeonBackground } from "@/components/marketing/NeonBackground";
import { Footer } from "@/components/marketing/Footer";
import { OrderTemplateButton } from "@/components/templates/OrderTemplateButton";
import { prisma } from "@/lib/db";
import { toNumber } from "@/lib/money";
import Image from "next/image";
import Link from "next/link";
import { getTranslations } from "next-intl/server";

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

export default async function TemplatesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale });
  const isRTL = locale === "ar";

  const templates = await prisma.templateSite.findMany({
    where: { isActive: true },
    include: { gallery: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <NeonBackground>
      <Navbar locale={locale} />
      <main dir={isRTL ? "rtl" : "ltr"} className={isRTL ? "rtl rtl:text-right" : ""}>
        <Section>
          <div className="grid gap-6 rounded-3xl border border-slate-800/60 bg-[#050b18]/80 p-6 shadow-[0_12px_40px_rgba(0,0,0,0.45)] md:grid-cols-[1.1fr,0.9fr]">
            <div className="space-y-3">
              <p className="text-xs uppercase tracking-[0.18em] text-sky-300">
                {t("templates.title")}
              </p>
              <h1 className="text-3xl font-extrabold text-slate-50 sm:text-4xl">
                {t("templates.heroTitle")}
              </h1>
              <p className="max-w-2xl text-base text-slate-300 sm:text-lg">
                {t("templates.subtitle")}
              </p>
              <div className="flex flex-wrap gap-3 text-sm text-slate-300">
                <span className="rounded-full border border-sky-400/50 bg-sky-500/10 px-3 py-1">
                  {t("templates.bullet.pricing")}
                </span>
                <span className="rounded-full border border-emerald-400/50 bg-emerald-500/10 px-3 py-1">
                  {t("templates.bullet.speed")}
                </span>
                <span className="rounded-full border border-indigo-400/50 bg-indigo-500/10 px-3 py-1">
                  {t("templates.bullet.dashboard")}
                </span>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-2xl border border-slate-800/70 bg-[#0b1120]/80 p-5">
              <div className="pointer-events-none absolute inset-0 opacity-60 [background:radial-gradient(circle_at_20%_20%,rgba(56,189,248,0.12),transparent_35%),radial-gradient(circle_at_80%_0,rgba(34,197,94,0.12),transparent_30%)]" />
              <div className="relative z-10 space-y-2">
                <div className="flex items-center justify-between text-sm text-slate-300">
                  <span>{t("templates.listingCount")}</span>
                  <span className="text-lg font-semibold text-sky-200">
                    {templates.length}
                  </span>
                </div>
                <div className="h-2 rounded-full bg-slate-800">
                  <div className="h-2 rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400" style={{ width: `${Math.min(templates.length * 22, 100)}%` }} />
                </div>
                <p className="text-xs text-slate-400">
                  {t("templates.listingHelper")}
                </p>
              </div>
            </div>
          </div>
        </Section>

        <Section>
          <div className="grid gap-4 md:grid-cols-2">
            {templates.map((template) => (
              <div
                key={template.id}
                className="group relative overflow-hidden rounded-3xl border border-slate-800/70 bg-[#0b1120]/80 shadow-[0_14px_40px_rgba(0,0,0,0.35)] transition hover:-translate-y-1 hover:border-sky-400/60"
              >
                <div className="absolute inset-0 opacity-40 transition group-hover:opacity-60 [background:radial-gradient(circle_at_20%_20%,rgba(56,189,248,0.12),transparent_35%),radial-gradient(circle_at_80%_0,rgba(34,197,94,0.12),transparent_30%)]" />
                <div className="relative z-10">
                  {template.thumbUrl ? (
                    <div className="relative h-48 w-full overflow-hidden border-b border-slate-800/70">
                      <Image
                        src={template.thumbUrl}
                        alt={template.title}
                        fill
                        className="object-cover transition duration-500 group-hover:scale-[1.02]"
                        sizes="(min-width: 768px) 50vw, 100vw"
                      />
                    </div>
                  ) : (
                    <div className="h-48 w-full border-b border-slate-800/70 bg-[radial-gradient(circle_at_20%_20%,rgba(56,189,248,0.15),transparent_35%),radial-gradient(circle_at_80%_0,rgba(34,197,94,0.15),transparent_30%)]" />
                  )}

                  <div className="space-y-3 p-5">
                    <div className="flex items-center justify-between gap-2 text-xs text-slate-400">
                      {template.category && (
                        <span className="rounded-full border border-slate-700/60 bg-slate-900/70 px-3 py-1 text-[11px] font-semibold text-slate-200">
                          {template.category}
                        </span>
                      )}
                      <span className="template-price text-sm font-semibold text-sky-200">
                        {t("templates.startingFrom")}{" "}
                        {formatPrice(toNumber(template.basePrice), template.currency, locale)}
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      <h3 className="text-xl font-bold text-slate-50">{template.title}</h3>
                      <p className="text-sm text-slate-300">
                        {template.shortDescription ?? ""}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        href={`/${locale}/templates/${template.slug}`}
                        className="text-xs font-semibold text-sky-300 underline underline-offset-2"
                      >
                        {t("templates.viewDetails")}
                      </Link>
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
                  </div>
                </div>
              </div>
            ))}
          </div>

          {templates.length === 0 && (
            <p className="text-sm text-slate-300">{t("templates.empty")}</p>
          )}
        </Section>
      </main>
      <Footer />
    </NeonBackground>
  );
}
