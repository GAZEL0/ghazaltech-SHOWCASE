import { Footer } from "@/components/marketing/Footer";
import { Navbar } from "@/components/marketing/Navbar";
import { NeonBackground } from "@/components/marketing/NeonBackground";
import { Section } from "@/components/marketing/Section";
import { SupportFreeBanner } from "@/components/marketing/support/SupportFreeBanner";
import { SupportLifecycle } from "@/components/marketing/support/SupportLifecycle";
import { SupportPlans } from "@/components/marketing/support/SupportPlans";
import { SupportIncludes } from "@/components/marketing/support/SupportIncludes";
import { SupportSla } from "@/components/marketing/support/SupportSla";
import { getTranslations } from "next-intl/server";
import Link from "next/link";

type SupportPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function SupportPage({ params }: SupportPageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale });

  const freeBullets = t.raw("supportPage.freeSupport.bullets") as string[];
  const lifecycleSteps = t.raw("supportPage.lifecycle.steps") as {
    title: string;
    desc: string;
  }[];
  const planCards = t.raw("supportPage.plans.cards") as {
    key: string;
    name: string;
    subtitle: string;
    price: string;
    includes: string[];
    limit: string;
    fit: string;
    popular?: boolean;
  }[];
  const includedItems = t.raw("supportPage.included.items") as {
    title: string;
    example: string;
  }[];
  const excludedItems = t.raw("supportPage.included.excluded") as {
    title: string;
    example: string;
  }[];
  const slaItems = t.raw("supportPage.sla.items") as {
    label: string;
    value: number;
    suffix: string;
    tooltip: string;
  }[];
  const requestForm = t.raw("supportPage.requestForm") as {
    title: string;
    subtitle: string;
    projectName: string;
    siteUrl: string;
    projectType: string;
    projectTypeOptions: { value: string; label: string }[];
    builtByUs: string;
    builtByUsOptions: { value: string; label: string }[];
    notes: string;
    submit: string;
    cancel: string;
    success: string;
    error: string;
    loginRequired: string;
  };

  return (
    <NeonBackground>
      <Navbar locale={locale} />
      <main
        dir={locale === "ar" ? "rtl" : "ltr"}
        className={locale === "ar" ? "rtl rtl:text-right" : ""}
      >
        <Section>
          <div className="grid gap-8 md:grid-cols-[1.15fr,0.85fr]">
            <div className="space-y-4">
              <p className="text-xs uppercase tracking-[0.18em] text-sky-300 support-fade">
                {t("supportPage.hero.kicker")}
              </p>
              <h1 className="text-3xl font-extrabold text-slate-50 sm:text-4xl support-fade">
                {t("supportPage.hero.title")}
              </h1>
              <p className="max-w-2xl text-base text-slate-300 sm:text-lg support-fade">
                {t("supportPage.hero.subtitle")}
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <div className="group relative">
                  <a
                    href="#plans"
                    className="inline-flex items-center gap-2 rounded-full border border-cyan-300/70 bg-gradient-to-r from-cyan-400 to-emerald-400 px-5 py-3 text-sm font-semibold text-slate-900 shadow-[0_0_22px_rgba(56,189,248,0.45)] transition hover:shadow-[0_0_30px_rgba(34,197,94,0.55)]"
                  >
                    {t("supportPage.hero.ctaPrimary")}
                  </a>
                  <span className="pointer-events-none absolute left-0 top-full mt-2 text-[11px] text-slate-400 opacity-0 transition group-hover:opacity-100">
                    {t("supportPage.hero.ctaHint")}
                  </span>
                </div>
                <div className="group relative">
                  <Link
                    href={`/${locale}/contact`}
                    className="inline-flex items-center gap-2 rounded-full border border-slate-600/70 bg-[#020617aa] px-5 py-3 text-sm font-semibold text-slate-100 transition hover:border-sky-300/80 hover:text-sky-200"
                  >
                    {t("supportPage.hero.ctaSecondary")}
                  </Link>
                  <span className="pointer-events-none absolute left-0 top-full mt-2 text-[11px] text-slate-400 opacity-0 transition group-hover:opacity-100">
                    {t("supportPage.hero.ctaHint")}
                  </span>
                </div>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-3xl border border-slate-800/70 bg-[#0b1120]/80 p-6 shadow-[0_18px_50px_rgba(0,0,0,0.4)]">
              <svg
                className="absolute inset-0 h-full w-full opacity-40"
                viewBox="0 0 420 260"
                fill="none"
                aria-hidden="true"
              >
                <g stroke="rgba(148,163,184,0.25)" strokeWidth="1">
                  {Array.from({ length: 8 }).map((_, idx) => (
                    <line key={`v-${idx}`} x1={40 + idx * 40} y1="10" x2={40 + idx * 40} y2="250" />
                  ))}
                  {Array.from({ length: 5 }).map((_, idx) => (
                    <line key={`h-${idx}`} x1="20" y1={30 + idx * 50} x2="400" y2={30 + idx * 50} />
                  ))}
                </g>
                <circle cx="310" cy="70" r="8" fill="rgba(56,189,248,0.7)" />
              </svg>

              <div className="absolute right-12 top-10 flex items-center gap-3">
                <span className="h-3 w-3 rounded-full bg-emerald-400 shadow-[0_0_18px_rgba(16,185,129,0.9)] animate-pulse" />
                <span className="text-xs uppercase tracking-[0.18em] text-emerald-200">
                  {t("supportPage.hero.pulseLabel")}
                </span>
              </div>

              <div className="relative z-10 mt-16 space-y-3 text-sm text-slate-200">
                <div className="rounded-2xl border border-slate-700/70 bg-slate-950/60 p-4">
                  <div className="text-xs uppercase tracking-[0.16em] text-slate-500">
                    {t("supportPage.hero.monitorLabel")}
                  </div>
                  <div className="mt-2 text-sm text-slate-300">
                    {t("supportPage.hero.monitorBody")}
                  </div>
                  <div className="mt-4 grid grid-cols-3 gap-2 text-xs text-slate-400">
                    {[0, 1, 2].map((idx) => (
                      <div
                        key={`metric-${idx}`}
                        className="rounded-xl border border-slate-800/70 bg-slate-900/60 px-3 py-2"
                      >
                        {t(`supportPage.hero.metrics.${idx}`)}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Section>

        <Section>
          <SupportFreeBanner
            title={t("supportPage.freeSupport.title")}
            bullets={freeBullets}
            limitNote={t("supportPage.freeSupport.limitNote")}
            buttonLabel={t("supportPage.freeSupport.button")}
            modalTitle={t("supportPage.freeSupport.modalTitle")}
            modalIntro={t("supportPage.freeSupport.modalIntro")}
            modalExcluded={t("supportPage.freeSupport.modalExcluded")}
            closeLabel={t("supportPage.freeSupport.closeLabel")}
          />
        </Section>

        <Section>
          <SupportLifecycle
            title={t("supportPage.lifecycle.title")}
            subtitle={t("supportPage.lifecycle.subtitle")}
            steps={lifecycleSteps}
            activeLabel={t("supportPage.lifecycle.active")}
            nextLabel={t("supportPage.lifecycle.next")}
          />
        </Section>

        <Section id="plans">
          <SupportPlans
            title={t("supportPage.plans.title")}
            toggleAnnual={t("supportPage.plans.toggleAnnual")}
            toggleAudit={t("supportPage.plans.toggleAudit")}
            badge={t("supportPage.plans.badge")}
            ctaLabel={t("supportPage.plans.cta")}
            limitLabel={t("supportPage.plans.limitLabel")}
            fitLabel={t("supportPage.plans.fitLabel")}
            note={t("supportPage.plans.note")}
            cards={planCards}
            form={requestForm}
          />
        </Section>

        <Section>
          <SupportIncludes
            title={t("supportPage.included.title")}
            includedLabel={t("supportPage.included.includedLabel")}
            excludedLabel={t("supportPage.included.excludedLabel")}
            exampleLabel={t("supportPage.included.exampleLabel")}
            included={includedItems}
            excluded={excludedItems}
          />
        </Section>

        <Section>
          <SupportSla
            title={t("supportPage.sla.title")}
            tooltipLabel={t("supportPage.sla.tooltipLabel")}
            items={slaItems}
          />
        </Section>

        <Section>
          <div className="support-gradient rounded-3xl border border-slate-800/70 bg-[linear-gradient(120deg,rgba(56,189,248,0.18),rgba(34,197,94,0.12),rgba(14,165,233,0.16))] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
            <div className="grid gap-6 md:grid-cols-[1.2fr,0.8fr]">
              <div className="space-y-3">
                <h2 className="text-2xl font-semibold text-slate-50">
                  {t("supportPage.finalCta.title")}
                </h2>
                <p className="text-sm text-slate-300">{t("supportPage.finalCta.body")}</p>
              </div>
              <div className="flex flex-wrap items-center gap-3 md:justify-end">
                <a
                  href="#plans"
                  className="rounded-full border border-cyan-300/70 bg-gradient-to-r from-cyan-400 to-emerald-400 px-5 py-3 text-sm font-semibold text-slate-900 shadow-[0_0_25px_rgba(56,189,248,0.4)]"
                >
                  {t("supportPage.finalCta.primary")}
                </a>
                <a
                  href="#plans"
                  className="rounded-full border border-slate-600/70 bg-[#020617aa] px-5 py-3 text-sm font-semibold text-slate-100 transition hover:border-sky-300/80 hover:text-sky-200"
                >
                  {t("supportPage.finalCta.secondary")}
                </a>
              </div>
            </div>
          </div>
        </Section>
      </main>
      <Footer />
    </NeonBackground>
  );
}
