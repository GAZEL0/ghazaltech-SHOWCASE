import { Footer } from "@/components/marketing/Footer";
import { Navbar } from "@/components/marketing/Navbar";
import { NeonBackground } from "@/components/marketing/NeonBackground";
import { Section } from "@/components/marketing/Section";
import { serviceSlugs } from "@/lib/services-catalog";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import Link from "next/link";

export default async function ServiceDetailsPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const t = await getTranslations({ locale });
  if (!serviceSlugs.includes(slug as (typeof serviceSlugs)[number])) {
    notFound();
  }

  const title = t(`servicesCatalog.items.${slug}.title`);
  const tag = t(`servicesCatalog.items.${slug}.tag`);
  const heroTitle = t(`servicesCatalog.items.${slug}.heroTitle`);
  const heroBody = t(`servicesCatalog.items.${slug}.heroBody`);
  const problems = t.raw(`servicesCatalog.items.${slug}.problems`) as string[];
  const solutionBody = t(`servicesCatalog.items.${slug}.solutionBody`);
  const included = t.raw(`servicesCatalog.items.${slug}.included`) as string[];
  const ctaTitle = t(`servicesCatalog.items.${slug}.ctaTitle`);
  const ctaBody = t(`servicesCatalog.items.${slug}.ctaBody`);
  const process = t.raw("servicesCatalog.process") as { title: string; desc: string }[];
  const isFeatured = slug === "business-management-systems";

  return (
    <NeonBackground>
      <Navbar locale={locale} />
      <main
        dir={locale === "ar" ? "rtl" : "ltr"}
        className={locale === "ar" ? "rtl rtl:text-right" : ""}
      >
        <Section>
          <div className={`rounded-3xl border border-slate-800/70 bg-[#0b1120]/85 p-6 shadow-[0_0_30px_rgba(56,189,248,0.18)] ${isFeatured ? "border-cyan-400/60 bg-[radial-gradient(circle_at_0_0,#0b1120,#020617)]" : ""}`}>
            <div className="flex flex-wrap items-center gap-3 rtl:flex-row-reverse rtl:text-right">
              <span className="rounded-full border border-cyan-300/70 px-3 py-1 text-xs text-cyan-100">
                {tag}
              </span>
              {isFeatured && (
                <span className="rounded-full border border-cyan-400/70 bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-200">
                  {t("servicesCatalog.featuredLabel")}
                </span>
              )}
            </div>
            <h1 className="mt-4 text-3xl font-extrabold text-slate-50 sm:text-4xl">
              {heroTitle || title}
            </h1>
            <p className="mt-3 max-w-3xl text-sm text-slate-300 sm:text-base">
              {heroBody}
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <Link
                href={`/${locale}/custom-project`}
                className="rounded-full bg-gradient-to-r from-sky-400 to-emerald-400 px-5 py-2.5 text-sm font-semibold text-slate-900 shadow-[0_0_24px_rgba(56,189,248,0.35)] transition hover:shadow-[0_0_30px_rgba(34,197,94,0.5)]"
              >
                {t("servicesCatalog.buttons.requestService")}
              </Link>
              <Link
                href={`/${locale}/contact`}
                className="rounded-full border border-slate-600/70 bg-[#0b1120]/70 px-4 py-2 text-sm text-slate-100 transition hover:border-sky-400/70"
              >
                {t("servicesCatalog.buttons.contact")}
              </Link>
            </div>
          </div>
        </Section>

        <Section>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-3 rounded-3xl border border-slate-800/70 bg-[#0b1120]/80 p-5">
              <p className="text-xs uppercase tracking-[0.14em] text-slate-500">
                {t("servicesCatalog.problemTitle")}
              </p>
              <ul className="space-y-2 text-sm text-slate-200">
                {problems.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="mt-1 h-2 w-2 rounded-full bg-rose-400" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="space-y-3 rounded-3xl border border-slate-800/70 bg-[#0b1120]/80 p-5">
              <p className="text-xs uppercase tracking-[0.14em] text-slate-500">
                {t("servicesCatalog.solutionTitle")}
              </p>
              <p className="text-sm text-slate-300">{solutionBody}</p>
            </div>
          </div>
        </Section>

        <Section>
          <div className="grid gap-4 md:grid-cols-[1fr,1.1fr]">
            <div className="space-y-3 rounded-3xl border border-slate-800/70 bg-[#0b1120]/80 p-5">
              <p className="text-xs uppercase tracking-[0.14em] text-slate-500">
                {t("servicesCatalog.includedTitle")}
              </p>
              <ul className="space-y-2 text-sm text-slate-200">
                {included.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="mt-1 h-2 w-2 rounded-full bg-emerald-400" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="space-y-3 rounded-3xl border border-slate-800/70 bg-[#0b1120]/80 p-5">
              <p className="text-xs uppercase tracking-[0.14em] text-slate-500">
                {t("servicesCatalog.processTitle")}
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                {process.map((step) => (
                  <div
                    key={step.title}
                    className="rounded-2xl border border-slate-700/60 bg-slate-950/60 p-3 text-xs text-slate-200"
                  >
                    <div className="text-[11px] uppercase tracking-[0.12em] text-slate-500">
                      {step.title}
                    </div>
                    <div className="mt-2 text-sm text-slate-300">{step.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Section>

        <Section>
          <div className="rounded-3xl border border-slate-800/70 bg-[#050b18]/80 p-6 text-center">
            <h2 className="text-2xl font-bold text-slate-50">{ctaTitle}</h2>
            <p className="mt-3 text-sm text-slate-300">{ctaBody}</p>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
              <Link
                href={`/${locale}/custom-project`}
                className="rounded-full bg-gradient-to-r from-sky-400 to-emerald-400 px-5 py-2.5 text-sm font-semibold text-slate-900 shadow-[0_0_24px_rgba(56,189,248,0.35)] transition hover:shadow-[0_0_30px_rgba(34,197,94,0.5)]"
              >
                {t("servicesCatalog.buttons.requestService")}
              </Link>
              <Link
                href={`/${locale}/contact`}
                className="rounded-full border border-slate-600/70 bg-[#0b1120]/70 px-4 py-2 text-sm text-slate-100 transition hover:border-sky-400/70"
              >
                {t("servicesCatalog.buttons.contact")}
              </Link>
            </div>
          </div>
        </Section>
      </main>
      <Footer />
    </NeonBackground>
  );
}
