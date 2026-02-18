import Link from "next/link";
import { Footer } from "@/components/marketing/Footer";
import { Navbar } from "@/components/marketing/Navbar";
import { NeonBackground } from "@/components/marketing/NeonBackground";
import { Section } from "@/components/marketing/Section";
import { getTranslations } from "next-intl/server";

export default async function SupportSuccessPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "supportSuccessPage" });
  const steps = t.raw("steps") as string[];
  const dashboard = t.raw("dashboard") as { title: string; body: string; button: string };

  return (
    <NeonBackground>
      <Navbar locale={locale} />
      <main dir={locale === "ar" ? "rtl" : "ltr"} className={locale === "ar" ? "rtl rtl:text-right" : ""}>
        <Section>
          <div className="grid gap-8 md:grid-cols-[1.1fr,0.9fr]">
            <div className="space-y-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-400/60 bg-emerald-500/10 text-emerald-200 shadow-[0_0_18px_rgba(16,185,129,0.35)]">
                <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" aria-hidden="true">
                  <path
                    d="M20 6L9 17l-5-5"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <h1 className="text-3xl font-extrabold text-slate-50 sm:text-4xl">{t("title")}</h1>
              <p className="text-base text-slate-300 sm:text-lg">{t("body")}</p>
              <div className="flex flex-wrap items-center gap-3">
                <Link
                  href={`/${locale}/support`}
                  className="rounded-full border border-cyan-300/70 bg-gradient-to-r from-cyan-400 to-emerald-400 px-5 py-3 text-sm font-semibold text-slate-900 shadow-[0_0_25px_rgba(56,189,248,0.4)]"
                >
                  {t("primary")}
                </Link>
                <Link
                  href={`/${locale}/contact`}
                  className="rounded-full border border-slate-600/70 bg-[#020617aa] px-5 py-3 text-sm font-semibold text-slate-100 transition hover:border-sky-300/80 hover:text-sky-200"
                >
                  {t("secondary")}
                </Link>
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-3xl border border-slate-800/70 bg-[#0b1120]/80 p-6 shadow-[0_18px_55px_rgba(0,0,0,0.45)]">
                <div className="text-xs uppercase tracking-[0.18em] text-slate-400">
                  {t("nextTitle")}
                </div>
                <ol className="mt-4 space-y-3 text-sm text-slate-300">
                  {steps.map((step, idx) => (
                    <li key={step} className="flex items-start gap-3">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full border border-emerald-400/60 bg-emerald-500/10 text-xs text-emerald-200">
                        {idx + 1}
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </div>

              <div className="rounded-3xl border border-slate-800/70 bg-slate-950/60 p-5">
                <div className="text-sm font-semibold text-slate-100">{dashboard.title}</div>
                <p className="mt-2 text-sm text-slate-300">{dashboard.body}</p>
                <Link
                  href={`/${locale}/dashboard`}
                  className="mt-4 inline-flex items-center rounded-full border border-emerald-300/70 bg-gradient-to-r from-emerald-400 to-cyan-400 px-4 py-2 text-xs font-semibold text-slate-900 shadow-[0_0_18px_rgba(16,185,129,0.35)]"
                >
                  {dashboard.button}
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
