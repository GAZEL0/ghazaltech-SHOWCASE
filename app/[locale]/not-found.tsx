import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { Footer } from "@/components/marketing/Footer";
import { Navbar } from "@/components/marketing/Navbar";
import { NeonBackground } from "@/components/marketing/NeonBackground";
import { Section } from "@/components/marketing/Section";

export default function NotFound() {
  const t = useTranslations("notFoundPage");
  const locale = useLocale();

  return (
    <NeonBackground>
      <Navbar locale={locale} />
      <main dir={locale === "ar" ? "rtl" : "ltr"} className={locale === "ar" ? "rtl rtl:text-right" : ""}>
        <Section>
          <div className="grid items-center gap-8 md:grid-cols-[1.05fr,0.95fr]">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-700/70 bg-slate-950/60 px-3 py-2 text-xs uppercase tracking-[0.22em] text-slate-300">
                {t("kicker")}
              </div>
              <h1 className="text-3xl font-extrabold text-slate-50 sm:text-4xl">
                {t("title")}
              </h1>
              <p className="text-base text-slate-300 sm:text-lg">{t("body")}</p>
              <p className="text-sm text-slate-400">{t("hint")}</p>
              <div className="flex flex-wrap items-center gap-3">
                <Link
                  href={`/${locale}`}
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

            <div className="relative overflow-hidden rounded-3xl border border-slate-800/70 bg-[#0b1120]/80 p-6 shadow-[0_18px_55px_rgba(0,0,0,0.45)]">
              <div className="pointer-events-none absolute inset-0 opacity-60 [background:radial-gradient(circle_at_20%_10%,rgba(56,189,248,0.18),transparent_40%),radial-gradient(circle_at_85%_80%,rgba(34,197,94,0.16),transparent_45%)]" />
              <svg
                className="relative z-10 h-48 w-full"
                viewBox="0 0 360 180"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M30 140 C90 70, 150 120, 210 60 C250 20, 300 40, 330 20"
                  stroke="rgba(148,163,184,0.35)"
                  strokeWidth="2"
                  strokeDasharray="6 8"
                />
                <circle cx="210" cy="60" r="10" fill="rgba(56,189,248,0.9)" />
                <circle cx="210" cy="60" r="18" stroke="rgba(56,189,248,0.35)" strokeWidth="2" />
                <circle cx="60" cy="120" r="6" fill="rgba(34,197,94,0.7)" />
              </svg>
              <div className="mt-4 text-xs text-slate-400">
                {t("body")}
              </div>
            </div>
          </div>
        </Section>
      </main>
      <Footer />
    </NeonBackground>
  );
}
