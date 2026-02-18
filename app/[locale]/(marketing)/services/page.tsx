import { Footer } from "@/components/marketing/Footer";
import { Navbar } from "@/components/marketing/Navbar";
import { NeonBackground } from "@/components/marketing/NeonBackground";
import { Section } from "@/components/marketing/Section";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { serviceSlugs } from "@/lib/services-catalog";

export default async function ServicesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale });

  const services = serviceSlugs.map((slug) => ({
    slug,
    title: t(`servicesCatalog.items.${slug}.title`),
    tag: t(`servicesCatalog.items.${slug}.tag`),
    summary: t(`servicesCatalog.items.${slug}.summary`),
    href: `/${locale}/services/${slug}`,
    featured: slug === "business-management-systems",
  }));

  const supportCard = {
    title: t("servicesCatalog.supportCard.title"),
    summary: t("servicesCatalog.supportCard.summary"),
    tag: t("servicesCatalog.supportCard.tag"),
    href: `/${locale}/support`,
  };

  const guidance = t.raw("servicesCatalog.guidance.items") as {
    question: string;
    answer: string;
    slug: string;
  }[];

  return (
    <NeonBackground>
      <Navbar locale={locale} />
      <main dir={locale === "ar" ? "rtl" : "ltr"} className={locale === "ar" ? "rtl rtl:text-right" : ""}>
        <Section>
          <div className="relative overflow-hidden rounded-3xl border border-slate-800/60 bg-[#050b18]/80 p-6 shadow-[0_12px_40px_rgba(0,0,0,0.45)]">
            <div className="pointer-events-none absolute inset-0 opacity-60 [background:linear-gradient(120deg,rgba(14,165,233,0.12),transparent_40%),linear-gradient(300deg,rgba(34,197,94,0.12),transparent_45%)] motion-safe:animate-pulse" />
            <div className="relative z-10 grid gap-6 md:grid-cols-[1.2fr,0.8fr]">
              <div className="space-y-4">
                <p className="text-xs uppercase tracking-[0.18em] text-sky-300">
                  {t("servicesCatalog.kicker")}
                </p>
                <h1 className="text-3xl font-extrabold text-slate-50 sm:text-4xl">
                  {t("servicesCatalog.title")}
                </h1>
                <p className="max-w-2xl text-base text-slate-300 sm:text-lg">
                  {t("servicesCatalog.subtitle")}
                </p>
                <div className="flex flex-wrap items-center gap-3">
                  <Link
                    href={`/${locale}/custom-project`}
                    className="rounded-full bg-gradient-to-r from-sky-400 to-emerald-400 px-5 py-2.5 text-sm font-semibold text-slate-900 shadow-[0_0_24px_rgba(56,189,248,0.35)] transition hover:shadow-[0_0_30px_rgba(34,197,94,0.5)]"
                  >
                    {t("servicesCatalog.primaryCta")}
                  </Link>
                  <a
                    href="#services-grid"
                    className="rounded-full border border-slate-600/70 bg-[#0b1120]/70 px-4 py-2 text-sm text-slate-100 transition hover:border-sky-400/70"
                  >
                    {t("servicesCatalog.secondaryCta")}
                  </a>
                </div>
              </div>
              <div className="rounded-2xl border border-slate-800/70 bg-[#0b1120]/80 p-5">
                <div className="text-xs uppercase tracking-[0.16em] text-slate-500">
                  {t("servicesCatalog.heroNoteLabel")}
                </div>
                <p className="mt-3 text-sm text-slate-300">
                  {t("servicesCatalog.heroNote")}
                </p>
              </div>
            </div>
          </div>
        </Section>

        <Section id="services-grid">
          <div className="grid gap-4 md:grid-cols-2">
            {services.map((service) => (
              <div
                key={service.slug}
                className={`group relative overflow-hidden rounded-3xl border border-slate-800/70 bg-[#0b1120]/80 p-6 shadow-[0_14px_40px_rgba(0,0,0,0.35)] transition hover:-translate-y-1 hover:border-sky-400/60 ${service.featured ? "md:col-span-2 border-cyan-400/70 bg-[radial-gradient(circle_at_0_0,#0b1120,#020617)]" : ""}`}
              >
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span className="rounded-full border border-slate-700/60 bg-slate-900/70 px-3 py-1 text-[11px] font-semibold text-slate-200">
                    {service.tag}
                  </span>
                  {service.featured && (
                    <span className="rounded-full border border-cyan-400/70 bg-cyan-500/10 px-3 py-1 text-[11px] font-semibold text-cyan-200">
                      {t("servicesCatalog.featuredLabel")}
                    </span>
                  )}
                </div>
                <h3 className="mt-3 text-xl font-bold text-slate-50">
                  {service.title}
                </h3>
                <p className="mt-2 text-sm text-slate-300">{service.summary}</p>
                <div className="mt-5">
                  <Link
                    href={service.href}
                    className="text-xs font-semibold text-sky-300 underline underline-offset-2"
                  >
                    {t("servicesCatalog.viewDetails")}
                  </Link>
                </div>
              </div>
            ))}

            <div className="group rounded-3xl border border-slate-800/70 bg-[#0b1120]/80 p-6 shadow-[0_14px_40px_rgba(0,0,0,0.35)] transition hover:-translate-y-1 hover:border-emerald-400/60">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span className="rounded-full border border-slate-700/60 bg-slate-900/70 px-3 py-1 text-[11px] font-semibold text-slate-200">
                  {supportCard.tag}
                </span>
              </div>
              <h3 className="mt-3 text-xl font-bold text-slate-50">{supportCard.title}</h3>
              <p className="mt-2 text-sm text-slate-300">{supportCard.summary}</p>
              <div className="mt-5">
                <Link
                  href={supportCard.href}
                  className="text-xs font-semibold text-emerald-300 underline underline-offset-2"
                >
                  {t("servicesCatalog.viewDetails")}
                </Link>
              </div>
            </div>
          </div>
        </Section>

        <Section>
          <div className="grid gap-4 rounded-3xl border border-slate-800/70 bg-[#050b18]/80 p-6 md:grid-cols-[1fr,1.2fr]">
            <div className="space-y-3">
              <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
                {t("servicesCatalog.guidanceTitle")}
              </p>
              <h2 className="text-2xl font-bold text-slate-50">{t("servicesCatalog.guidanceSubtitle")}</h2>
            </div>
            <div className="grid gap-3">
              {guidance.map((item, idx) => (
                <Link
                  key={`${item.slug}-${idx}`}
                  href={`/${locale}/services/${item.slug}`}
                  className="flex items-center justify-between gap-4 rounded-2xl border border-slate-800/70 bg-[#0b1120]/70 px-4 py-3 text-sm text-slate-200 transition hover:border-sky-400/60"
                >
                  <span>{item.question}</span>
                  <span className="text-xs font-semibold text-sky-300">{item.answer}</span>
                </Link>
              ))}
            </div>
          </div>
        </Section>

        <Section>
          <div className="rounded-3xl border border-slate-800/70 bg-[#0b1120]/80 p-6">
            <div className="grid gap-4 md:grid-cols-[1.2fr,0.8fr]">
              <div>
                <h3 className="text-xl font-bold text-slate-50">
                  {t("servicesCatalog.supportHighlight.title")}
                </h3>
                <p className="mt-2 text-sm text-slate-300">
                  {t("servicesCatalog.supportHighlight.body")}
                </p>
              </div>
              <div className="flex items-center md:justify-end">
                <Link
                  href={`/${locale}/support`}
                  className="rounded-full border border-emerald-400/60 bg-emerald-500/10 px-4 py-2 text-sm font-semibold text-emerald-200 transition hover:border-emerald-300"
                >
                  {t("servicesCatalog.supportHighlight.cta")}
                </Link>
              </div>
            </div>
          </div>
        </Section>

        <Section>
          <div className="rounded-3xl border border-slate-800/70 bg-[#050b18]/80 p-6 text-center">
            <h2 className="text-2xl font-bold text-slate-50">{t("servicesCatalog.finalCta.title")}</h2>
            <p className="mt-3 text-sm text-slate-300">{t("servicesCatalog.finalCta.body")}</p>
            <div className="mt-5">
              <Link
                href={`/${locale}/custom-project`}
                className="rounded-full bg-gradient-to-r from-sky-400 to-emerald-400 px-5 py-2.5 text-sm font-semibold text-slate-900 shadow-[0_0_24px_rgba(56,189,248,0.35)] transition hover:shadow-[0_0_30px_rgba(34,197,94,0.5)]"
              >
                {t("servicesCatalog.finalCta.cta")}
              </Link>
            </div>
          </div>
        </Section>
      </main>
      <Footer />
    </NeonBackground>
  );
}
