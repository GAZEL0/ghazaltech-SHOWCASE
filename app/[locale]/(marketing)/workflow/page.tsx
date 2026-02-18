import { Footer } from "@/components/marketing/Footer";
import { Navbar } from "@/components/marketing/Navbar";
import { NeonBackground } from "@/components/marketing/NeonBackground";
import { Section } from "@/components/marketing/Section";
import { CinematicSteps } from "@/components/marketing/CinematicSteps";
import { getTranslations } from "next-intl/server";

export default async function WorkflowPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale });

  const paths = ["guest", "account"].map((key) => ({
    key,
    title: t(`workflowPage.paths.${key}.title`),
    desc: t(`workflowPage.paths.${key}.desc`),
    steps: [0, 1, 2].map((idx) => t(`workflowPage.paths.${key}.steps.${idx}`)),
  }));

  const steps = [0, 1, 2, 3, 4].map((idx) => ({
    title: t(`workflowPage.steps.${idx}.title`),
    desc: t(`workflowPage.steps.${idx}.desc`),
  }));
  const previews = t.raw("workflowPage.previews") as {
    headerLabel: string;
    headerValue: string;
    stats: { label: string; value: string }[];
    rows: { label: string; value: string }[];
    footer: { label: string; value: string };
  }[];

  const platformCards = [0, 1, 2].map((idx) => ({
    title: t(`workflowPage.platform.${idx}.title`),
    desc: t(`workflowPage.platform.${idx}.desc`),
  }));

  return (
    <NeonBackground>
      <Navbar locale={locale} />
      <main dir={locale === "ar" ? "rtl" : "ltr"} className={locale === "ar" ? "rtl rtl:text-right" : ""}>
        <Section>
          <div className="grid gap-6 rounded-3xl border border-slate-800/60 bg-[#050b18]/80 p-6 shadow-[0_12px_40px_rgba(0,0,0,0.45)] md:grid-cols-[1.2fr,0.8fr]">
            <div className="space-y-3">
              <p className="text-xs uppercase tracking-[0.18em] text-sky-300">
                {t("workflowPage.kicker")}
              </p>
              <h1 className="text-3xl font-extrabold text-slate-50 sm:text-4xl">
                {t("workflowPage.title")}
              </h1>
              <p className="max-w-2xl text-base text-slate-300 sm:text-lg">
                {t("workflowPage.subtitle")}
              </p>
            </div>
            <div className="relative overflow-hidden rounded-2xl border border-slate-800/70 bg-[#0b1120]/80 p-5">
              <div className="pointer-events-none absolute inset-0 opacity-60 [background:radial-gradient(circle_at_20%_20%,rgba(56,189,248,0.12),transparent_35%),radial-gradient(circle_at_80%_0,rgba(34,197,94,0.12),transparent_30%)]" />
              <div className="relative z-10 space-y-2 text-sm text-slate-200">
                <div className="text-xs uppercase tracking-[0.12em] text-slate-400">
                  {t("workflowPage.highlightTitle")}
                </div>
                <p className="text-sm text-slate-300">{t("workflowPage.highlightBody")}</p>
                <div className="grid gap-2">
                  {[0, 1, 2].map((idx) => (
                    <div
                      key={`highlight-${idx}`}
                      className="rounded-xl border border-slate-800/70 bg-slate-950/60 px-3 py-2 text-xs text-slate-200"
                    >
                      {t(`workflowPage.highlights.${idx}`)}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Section>

        <Section>
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-slate-50">{t("workflowPage.pathsTitle")}</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {paths.map((path) => (
                <div
                  key={path.key}
                  className="rounded-3xl border border-slate-800/70 bg-[#0b1120]/80 p-5 text-slate-200 shadow-[0_14px_40px_rgba(0,0,0,0.35)]"
                >
                  <div className="text-xs uppercase tracking-[0.14em] text-slate-500">
                    {path.title}
                  </div>
                  <p className="mt-2 text-sm text-slate-300">{path.desc}</p>
                  <ul className="mt-4 space-y-2 text-sm text-slate-200">
                    {path.steps.map((step) => (
                      <li key={step} className="flex items-start gap-2">
                        <span className="mt-1 h-2 w-2 rounded-full bg-cyan-400" />
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </Section>

        <Section>
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-slate-50">{t("workflowPage.stepsTitle")}</h2>
            <CinematicSteps steps={steps} previews={previews} variant="workflow" />
          </div>
        </Section>

        <Section>
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-slate-50">{t("workflowPage.platformTitle")}</h2>
            <div className="grid gap-4 md:grid-cols-3">
              {platformCards.map((card) => (
                <div
                  key={card.title}
                  className="rounded-3xl border border-slate-800/70 bg-[#0b1120]/80 p-5 text-slate-200 shadow-[0_14px_40px_rgba(0,0,0,0.35)]"
                >
                  <div className="text-xs uppercase tracking-[0.14em] text-slate-500">
                    {card.title}
                  </div>
                  <p className="mt-3 text-sm text-slate-300">{card.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </Section>
      </main>
      <Footer />
    </NeonBackground>
  );
}
