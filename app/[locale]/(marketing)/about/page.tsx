import { Footer } from "@/components/marketing/Footer";
import { Navbar } from "@/components/marketing/Navbar";
import { NeonBackground } from "@/components/marketing/NeonBackground";
import { Section } from "@/components/marketing/Section";
import { AboutJourney } from "@/components/marketing/about/AboutJourney";
import { ComparisonSlider } from "@/components/marketing/about/ComparisonSlider";
import { AboutCounters } from "@/components/marketing/about/AboutCounters";
import { ScrollReveal } from "@/components/marketing/about/ScrollReveal";
import { prisma } from "@/lib/db";
import { getTranslations } from "next-intl/server";
import Link from "next/link";

export const dynamic = "force-dynamic";

type AboutPageProps = {
  params: Promise<{ locale: string }>;
};

function splitWords(text: string) {
  return text.split(" ").filter(Boolean);
}

export default async function AboutPage({ params }: AboutPageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale });

  const heroHighlights = t.raw("aboutPage.hero.highlights") as string[];
  const whoValues = t.raw("aboutPage.who.values") as { title: string; desc: string }[];
  const journeySteps = t.raw("aboutPage.journey.steps") as { title: string; desc: string }[];
  const philosophyCards = t.raw("aboutPage.philosophy.cards") as {
    title: string;
    desc: string;
    detail: string;
  }[];
  const compareLeft = t.raw("aboutPage.compare.leftItems") as string[];
  const compareRight = t.raw("aboutPage.compare.rightItems") as string[];
  const numberItems = t.raw("aboutPage.numbers.items") as {
    label: string;
    suffix?: string;
  }[];
  const processSteps = t.raw("aboutPage.process.steps") as string[];

  const titleWords = splitWords(t("aboutPage.hero.title"));
  const highlightWords = splitWords(t("aboutPage.hero.highlight"));

  const deliveredProjects = await prisma.project.count({
    where: { status: "DELIVERED" },
  });
  const activeClients = await prisma.user.count({
    where: { role: "CLIENT" },
  });
  const baseProjects = 7;
  const baseClients = 16;
  const baseYears = 3;
  const experienceStartYear = 2022;
  const yearsOfExperience = Math.max(
    baseYears,
    new Date().getFullYear() - experienceStartYear,
  );
  const numbers = [
    {
      label: numberItems[0]?.label ?? "",
      value: baseProjects + deliveredProjects,
      suffix: numberItems[0]?.suffix ?? "+",
    },
    {
      label: numberItems[1]?.label ?? "",
      value: baseClients + activeClients,
      suffix: numberItems[1]?.suffix ?? "+",
    },
    {
      label: numberItems[2]?.label ?? "",
      value: 100,
      suffix: numberItems[2]?.suffix ?? "%",
    },
    {
      label: numberItems[3]?.label ?? "",
      value: yearsOfExperience,
      suffix: numberItems[3]?.suffix ?? "",
    },
  ];

  return (
    <NeonBackground>
      <Navbar locale={locale} />
      <main
        dir={locale === "ar" ? "rtl" : "ltr"}
        className={locale === "ar" ? "rtl rtl:text-right" : ""}
      >
        <Section>
          <div className="relative overflow-hidden rounded-3xl border border-slate-800/70 bg-[#0b1120]/80 p-6 shadow-[0_18px_55px_rgba(0,0,0,0.45)] sm:p-8">
            <div className="absolute inset-0 opacity-40">
              <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(148,163,184,0.12)_1px,transparent_1px),linear-gradient(180deg,rgba(148,163,184,0.12)_1px,transparent_1px)] bg-[size:48px_48px]" />
              <svg
                className="absolute inset-0 h-full w-full"
                viewBox="0 0 600 260"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M40 200 C140 60, 240 220, 340 80 C420 0, 520 160, 580 40"
                  stroke="rgba(56,189,248,0.35)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeDasharray="8 14"
                  className="about-path"
                />
              </svg>
            </div>

            <div className="relative z-10 grid gap-10 md:grid-cols-[1.2fr,0.8fr]">
              <div className="space-y-5">
                <div className="inline-flex items-center gap-2 rounded-full border border-slate-500/60 bg-[#020617aa] px-3 py-2 text-[11px] text-slate-100">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_14px_rgba(16,185,129,0.85)]" />
                  <span>{t("aboutPage.hero.kicker")}</span>
                </div>
                <h1 className="text-3xl font-extrabold leading-tight text-slate-50 sm:text-4xl">
                  <div className="flex flex-wrap gap-x-2">
                    {titleWords.map((word, idx) => (
                      <span
                        key={`title-word-${idx}`}
                        className="about-word"
                        style={{ animationDelay: `${idx * 70}ms` }}
                      >
                        {word}
                      </span>
                    ))}
                  </div>
                  <div className="mt-2 flex flex-wrap gap-x-2">
                    {highlightWords.map((word, idx) => (
                      <span
                        key={`highlight-word-${idx}`}
                        className="about-word bg-gradient-to-r from-sky-400 to-emerald-300 bg-clip-text text-transparent"
                        style={{ animationDelay: `${(titleWords.length + idx) * 70}ms` }}
                      >
                        {word}
                      </span>
                    ))}
                  </div>
                </h1>
                <ScrollReveal className="max-w-2xl text-base text-slate-300 sm:text-lg">
                  {t("aboutPage.hero.subtitle")}
                </ScrollReveal>
                <ScrollReveal className="flex flex-wrap items-center gap-3" delay={120}>
                  <Link
                    href={`/${locale}/workflow`}
                    className="inline-flex items-center gap-2 rounded-full border border-cyan-300/70 bg-gradient-to-r from-cyan-400 to-emerald-400 px-5 py-3 text-sm font-semibold text-slate-900 shadow-[0_0_22px_rgba(56,189,248,0.4)]"
                  >
                    {t("aboutPage.hero.ctaPrimary")}
                  </Link>
                  <Link
                    href={`/${locale}/work`}
                    className="inline-flex items-center gap-2 rounded-full border border-slate-600/70 bg-[#020617aa] px-5 py-3 text-sm font-semibold text-slate-100 transition hover:border-sky-300/80 hover:text-sky-200"
                  >
                    {t("aboutPage.hero.ctaSecondary")}
                  </Link>
                </ScrollReveal>
              </div>

              <ScrollReveal className="space-y-4" delay={180}>
                <div className="rounded-2xl border border-slate-800/70 bg-slate-950/60 p-5">
                  <div className="text-xs uppercase tracking-[0.18em] text-slate-500">
                    {t("aboutPage.hero.cardTitle")}
                  </div>
                  <p className="mt-3 text-sm text-slate-300">
                    {t("aboutPage.hero.cardBody")}
                  </p>
                </div>
                <div className="grid gap-2">
                  {heroHighlights.map((item) => (
                    <div
                      key={item}
                      className="rounded-xl border border-slate-800/70 bg-slate-900/50 px-3 py-2 text-xs text-slate-200"
                    >
                      {item}
                    </div>
                  ))}
                </div>
              </ScrollReveal>
            </div>
          </div>
        </Section>

        <Section>
          <div className="grid gap-6 md:grid-cols-[1.2fr,0.8fr]">
            <ScrollReveal className="space-y-3">
              <h2 className="text-2xl font-semibold text-slate-50">{t("aboutPage.who.title")}</h2>
              <p className="text-sm text-slate-300">{t("aboutPage.who.body")}</p>
              <p className="text-sm text-slate-300">{t("aboutPage.who.body2")}</p>
            </ScrollReveal>
            <ScrollReveal className="rounded-3xl border border-slate-800/70 bg-[#050b18]/80 p-5" delay={140}>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                {t("aboutPage.who.valuesTitle")}
              </p>
              <div className="mt-4 space-y-3">
                {whoValues.map((value) => (
                  <div key={value.title} className="rounded-2xl border border-slate-800/70 bg-slate-950/60 px-4 py-3">
                    <div className="text-sm font-semibold text-slate-100">{value.title}</div>
                    <div className="mt-1 text-xs text-slate-400">{value.desc}</div>
                  </div>
                ))}
              </div>
            </ScrollReveal>
          </div>
        </Section>

        <Section>
          <AboutJourney
            title={t("aboutPage.journey.title")}
            subtitle={t("aboutPage.journey.subtitle")}
            steps={journeySteps}
          />
        </Section>

        <Section>
          <div className="space-y-4">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                {t("aboutPage.philosophy.title")}
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {philosophyCards.map((card, idx) => (
                <ScrollReveal key={card.title} delay={idx * 90}>
                  <div className="group rounded-3xl border border-slate-800/70 bg-[#0b1120]/80 p-5 transition hover:-translate-y-1 hover:border-cyan-400/50 hover:shadow-[0_14px_35px_rgba(56,189,248,0.18)]">
                    <div className="text-xs uppercase tracking-[0.2em] text-slate-500">
                      {String(idx + 1).padStart(2, "0")}
                    </div>
                    <h3 className="mt-3 text-lg font-semibold text-slate-50">{card.title}</h3>
                    <p className="mt-2 text-sm text-slate-300">{card.desc}</p>
                    <p className="mt-3 max-h-0 overflow-hidden text-xs text-slate-400 opacity-0 transition-all duration-300 group-hover:max-h-24 group-hover:opacity-100">
                      {card.detail}
                    </p>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </Section>

        <Section>
          <ComparisonSlider
            title={t("aboutPage.compare.title")}
            subtitle={t("aboutPage.compare.subtitle")}
            leftTitle={t("aboutPage.compare.leftTitle")}
            rightTitle={t("aboutPage.compare.rightTitle")}
            leftItems={compareLeft}
            rightItems={compareRight}
            handleLabel={t("aboutPage.compare.handleLabel")}
          />
        </Section>

        <Section>
          <AboutCounters
            title={t("aboutPage.numbers.title")}
            subtitle={t("aboutPage.numbers.subtitle")}
            items={numbers}
          />
        </Section>

        <Section>
          <div className="rounded-3xl border border-slate-800/70 bg-[#0b1120]/80 p-6 shadow-[0_18px_55px_rgba(0,0,0,0.4)]">
            <div className="pb-6">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                {t("aboutPage.process.title")}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3 rtl:flex-row-reverse">
              {processSteps.map((step, idx) => (
                <div key={step} className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-700/70 bg-slate-950/60 text-xs font-semibold text-slate-200">
                    {String(idx + 1).padStart(2, "0")}
                  </div>
                  <span className="text-sm text-slate-200">{step}</span>
                  {idx < processSteps.length - 1 && (
                    <span className="hidden h-px w-8 bg-slate-700/70 md:block" />
                  )}
                </div>
              ))}
            </div>
            <div className="mt-6">
              <Link
                href={`/${locale}/workflow`}
                className="inline-flex items-center gap-2 rounded-full border border-slate-600/70 bg-[#020617aa] px-5 py-3 text-sm font-semibold text-slate-100 transition hover:border-sky-300/80 hover:text-sky-200"
              >
                {t("aboutPage.process.cta")}
              </Link>
            </div>
          </div>
        </Section>

        <Section>
          <div className="relative overflow-hidden rounded-3xl border border-slate-800/70 bg-[linear-gradient(120deg,rgba(56,189,248,0.18),rgba(34,197,94,0.12),rgba(14,165,233,0.16))] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
            <div className="absolute inset-0 about-cta" />
            <div className="relative z-10 grid gap-6 md:grid-cols-[1.2fr,0.8fr]">
              <div className="space-y-3">
                <h2 className="text-2xl font-semibold text-slate-50">
                  {t("aboutPage.finalCta.title")}
                </h2>
                <p className="text-sm text-slate-300">{t("aboutPage.finalCta.body")}</p>
              </div>
              <div className="flex flex-wrap items-center gap-3 md:justify-end">
                <Link
                  href={`/${locale}/contact`}
                  className="rounded-full border border-cyan-300/70 bg-gradient-to-r from-cyan-400 to-emerald-400 px-5 py-3 text-sm font-semibold text-slate-900 shadow-[0_0_25px_rgba(56,189,248,0.4)]"
                >
                  {t("aboutPage.finalCta.primary")}
                </Link>
                <Link
                  href={`/${locale}/custom-project`}
                  className="rounded-full border border-slate-600/70 bg-[#020617aa] px-5 py-3 text-sm font-semibold text-slate-100 transition hover:border-sky-300/80 hover:text-sky-200"
                >
                  {t("aboutPage.finalCta.secondary")}
                </Link>
              </div>
            </div>
          </div>
        </Section>
      </main>
      <Footer />
    </NeonBackground>
  );
}
