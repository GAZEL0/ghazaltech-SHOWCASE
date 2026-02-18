import { CTASection } from "@/components/marketing/CTASection";
import { Footer } from "@/components/marketing/Footer";
import { Navbar } from "@/components/marketing/Navbar";
import { NeonBackground } from "@/components/marketing/NeonBackground";
import { Section } from "@/components/marketing/Section";
import { CinematicSteps } from "@/components/marketing/CinematicSteps";
import { getTranslations } from "next-intl/server";

export default async function ReferralsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale });

  const steps = [0, 1, 2, 3].map((idx) => ({
    title: t(`referralsPage.steps.${idx}.title`),
    desc: t(`referralsPage.steps.${idx}.desc`),
  }));
  const previews = t.raw("referralsPage.previews") as {
    headerLabel: string;
    headerValue: string;
    stats: { label: string; value: string }[];
    rows: { label: string; value: string }[];
    footer: { label: string; value: string };
  }[];

  const exampleLines = [0, 1, 2, 3].map((idx) =>
    t(`referralsPage.example.lines.${idx}`),
  );

  return (
    <NeonBackground>
      <Navbar locale={locale} />
      <main dir={locale === "ar" ? "rtl" : "ltr"} className={locale === "ar" ? "rtl rtl:text-right" : ""}>
        <Section>
          <div className="grid gap-6 rounded-3xl border border-slate-800/60 bg-[#050b18]/80 p-6 shadow-[0_12px_40px_rgba(0,0,0,0.45)] md:grid-cols-[1.1fr,0.9fr]">
            <div className="space-y-3">
              <p className="text-xs uppercase tracking-[0.18em] text-sky-300">
                {t("referralsPage.kicker")}
              </p>
              <h1 className="text-3xl font-extrabold text-slate-50 sm:text-4xl">
                {t("referralsPage.title")}
              </h1>
              <p className="max-w-2xl text-base text-slate-300 sm:text-lg">
                {t("referralsPage.subtitle")}
              </p>
            </div>
            <div className="relative overflow-hidden rounded-2xl border border-slate-800/70 bg-[#0b1120]/80 p-5">
              <div className="pointer-events-none absolute inset-0 opacity-60 [background:radial-gradient(circle_at_20%_20%,rgba(56,189,248,0.12),transparent_35%),radial-gradient(circle_at_80%_0,rgba(34,197,94,0.12),transparent_30%)]" />
              <div className="relative z-10 space-y-2 text-sm text-slate-200">
                <div className="text-xs uppercase tracking-[0.12em] text-slate-400">
                  {t("referralsPage.highlightTitle")}
                </div>
                <p className="text-sm text-slate-300">{t("referralsPage.highlightBody")}</p>
                <div className="grid gap-2">
                  {[0, 1, 2].map((idx) => (
                    <div
                      key={`highlight-${idx}`}
                      className="rounded-xl border border-slate-800/70 bg-slate-950/60 px-3 py-2 text-xs text-slate-200"
                    >
                      {t(`referralsPage.highlights.${idx}`)}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Section>

        <Section>
          <CinematicSteps steps={steps} previews={previews} variant="referrals" />
        </Section>

        <Section>
          <div className="rounded-3xl border border-slate-800/70 bg-[#0b1120]/80 p-6">
            <p className="text-xs uppercase tracking-[0.14em] text-slate-500">
              {t("referralsPage.example.title")}
            </p>
            <ul className="mt-3 space-y-2 text-sm text-slate-200">
              {exampleLines.map((line) => (
                <li key={line} className="flex items-start gap-2">
                  <span className="mt-1 h-2 w-2 rounded-full bg-emerald-400" />
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </div>
        </Section>

        <Section>
          <CTASection
            title={t("referralsPage.cta.title")}
            text={t("referralsPage.cta.body")}
            cta={t("referralsPage.cta.button")}
            href={`/${locale}/register`}
          />
        </Section>
      </main>
      <Footer />
    </NeonBackground>
  );
}
