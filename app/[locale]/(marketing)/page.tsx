import { CTASection } from "@/components/marketing/CTASection";
import { Footer } from "@/components/marketing/Footer";
import { HeroStack } from "@/components/marketing/HeroStack";
import { InfiniteLogos } from "@/components/marketing/InfiniteLogos";
import { Navbar } from "@/components/marketing/Navbar";
import { NeonBackground } from "@/components/marketing/NeonBackground";
import { Section } from "@/components/marketing/Section";
import { ServiceCard } from "@/components/marketing/ServiceCard";
import { TimelineStep } from "@/components/marketing/TimelineStep";
import { WhyCard } from "@/components/marketing/WhyCard";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { getTranslations } from "next-intl/server";

export const dynamic = "force-dynamic";

export default async function MarketingHomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale });

  const clientCount = await prisma.user.count({ where: { role: "CLIENT" } });
  const baseActiveClients = 16;
  const activeClientsTotal = baseActiveClients + clientCount;
  const numberFormat = new Intl.NumberFormat(locale);

  const services = [0, 1, 2, 3, 4, 5, 6, 7].map((idx) => ({
    title: t(`services.items.${idx}.title`),
    tag: t(`services.items.${idx}.tag`),
    body: t(`services.items.${idx}.body`),
  }));
  const serviceLinks = [
    `/${locale}/services/business-management-systems`,
    `/${locale}/services/custom-web-solutions`,
    `/${locale}/services/business-websites`,
    `/${locale}/services/ecommerce-websites`,
    `/${locale}/services/personal-websites`,
    `/${locale}/services/web-automation`,
    `/${locale}/support`,
    `/${locale}/services/technical-audit`,
  ];

  const workflow = [0, 1, 2, 3].map((idx) => ({
    order: t(`workflow.steps.${idx}.label`),
    title: t(`workflow.steps.${idx}.title`),
    text: t(`workflow.steps.${idx}.text`),
  }));

  const reasons = [0, 1, 2].map((idx) => ({
    tag: t(`why.reasons.${idx}.tag`),
    label: t(`why.reasons.${idx}.label`),
    title: t(`why.reasons.${idx}.title`),
    text: t(`why.reasons.${idx}.text`),
  }));

  const logos = [
    "Anadolu Fleet",
    "Al-Manar Clinic",
    "Nova Cars",
    "BlueStay Hotels",
    "Syriapress Platform",
  ];

  return (
    <NeonBackground>
      <Navbar locale={locale} />

      <main
        dir={locale === "ar" ? "rtl" : "ltr"}
        className={locale === "ar" ? "rtl rtl:text-right" : ""}
      >
        <Section>
          <div className="grid items-center gap-8 md:grid-cols-[1.1fr,1fr]">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-500/60 bg-[#020617aa] px-3 py-2 text-[11px] text-slate-100 backdrop-blur">
                <span className="h-2 w-2 rounded-full bg-[radial-gradient(circle,#4ae0ff,#0ea5e9)] shadow-[0_0_18px_rgba(74,224,255,0.9)]" />
                <span>{t("hero.kicker")}</span>
              </div>
              <h1 className="text-3xl font-extrabold leading-tight text-slate-50 sm:text-4xl">
                {t("hero.title")}
                <span className="block bg-gradient-to-r from-sky-400 to-emerald-400 bg-clip-text text-transparent">
                  {t("hero.highlight")}
                </span>
              </h1>
              <p className="text-base text-slate-300 sm:text-lg">{t("hero.desc")}</p>
              <div className="flex flex-wrap items-center gap-3">
                <Link
                  href={`/${locale}/custom-project`}
                  className="relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full border-none bg-gradient-to-r from-cyan-400 to-sky-500 px-5 py-3 text-sm font-bold text-slate-900 shadow-[0_0_25px_rgba(14,165,233,0.65)] transition hover:scale-[1.01] hover:shadow-[0_0_35px_rgba(56,189,248,0.85)]"
                >
                  <span className="absolute inset-[-40%] translate-x-[-40%] opacity-0 bg-[radial-gradient(circle_at_0_0,rgba(255,255,255,0.4),transparent_55%)] transition duration-200 hover:translate-x-[10%] hover:opacity-100" />
                  <span className="relative">{t("hero.ctaPrimary")}</span>
                </Link>
                <Link
                  href={`/${locale}/work`}
                  className="rounded-full border border-slate-500/70 bg-[#020617aa] px-4 py-2.5 text-sm text-slate-100 transition hover:-translate-y-[2px] hover:border-cyan-300/80 hover:bg-[#020617]"
                >
                  {t("hero.ctaSecondary")}
                </Link>
              </div>
              <div className="flex flex-wrap gap-3 text-[12px] text-slate-400">
                <span className="max-w-sm">
                  {t("hero.meta1")}
                </span>
                <span className="max-w-sm">
                  {t("hero.meta2")}
                </span>
              </div>
            </div>

            <HeroStack
              t={t}
              pillLabel={t("stack.pillLabel")}
              pillValue={`+${numberFormat.format(activeClientsTotal)}`}
            />
          </div>
        </Section>

        <Section id="services">
          <div className="flex items-center justify-between gap-3 pb-4 rtl:flex-row-reverse rtl:text-right">
            <div className="rtl:text-right">
              <div className="text-lg font-semibold text-slate-50">
                {t("services.title")}
              </div>
              <div className="text-sm text-slate-400">{t("services.subtitle")}</div>
            </div>
            <div className="text-xs font-semibold text-sky-300">
              {t("services.cta")}
            </div>
          </div>
          <div className="grid gap-3 rounded-[22px] border border-slate-500/40 bg-[radial-gradient(circle_at_0_0,#0b1120,#020617)] p-4 md:grid-cols-2 lg:grid-cols-4">
            {services.map((service, idx) => {
              const href = serviceLinks[idx] ?? `/${locale}/services`;
              return (
                <div key={service.title} className="flex-1">
                  <ServiceCard
                    title={service.title}
                    tag={service.tag}
                    description={service.body}
                    href={href}
                    ctaLabel={t("services.cardCta")}
                  />
                </div>
              );
            })}
          </div>
          <div className="mt-4">
            <InfiniteLogos label={t("strip.label")} logos={logos} isRTL={locale === "ar"} />
          </div>
        </Section>

        <Section id="workflow">
          <div className="flex items-end justify-between pb-4 rtl:flex-row-reverse rtl:text-right">
            <div className="rtl:text-right">
              <div className="text-lg font-semibold text-slate-50">
                {t("workflow.title")}
              </div>
              <div className="text-sm text-slate-400">{t("workflow.subtitle")}</div>
            </div>
          </div>
          <div className="relative rounded-2xl border border-blue-900/70 bg-[#020617] px-4 py-4">
            <div className="absolute right-6 top-4 bottom-4 w-[2px] bg-gradient-to-b from-sky-400 to-emerald-400 opacity-60" />
            <div className="space-y-2">
              {workflow.map((step) => (
                <TimelineStep
                  key={step.order}
                  order={step.order}
                  title={step.title}
                  text={step.text}
                />
              ))}
            </div>
          </div>
        </Section>

        <Section>
          <div className="flex items-end justify-between pb-4">
            <div>
              <div className="text-lg font-semibold text-slate-50">
                {t("why.title")}
              </div>
              <div className="text-sm text-slate-400">{t("why.subtitle")}</div>
            </div>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            {reasons.map((item) => (
              <WhyCard
                key={item.title}
                tag={item.tag}
                label={item.label}
                title={item.title}
                text={item.text}
              />
            ))}
          </div>
        </Section>

        <Section id="contact">
          <CTASection
            title={t("cta.title")}
            text={t("cta.text")}
            cta={t("cta.primary")}
            href={`/${locale}/custom-project`}
          />
        </Section>
      </main>

      <Footer />
    </NeonBackground>
  );
}
