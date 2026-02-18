"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { Navbar } from "@/components/marketing/Navbar";

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  const t = useTranslations("errorPage");
  const locale = useLocale();

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="neon-shell gt-hero-bg relative min-h-screen bg-[#020617] text-slate-100">
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="neon-bg absolute inset-0 bg-[radial-gradient(circle_at_top,#1e293b_0%,#020617_55%)]" />
        <div className="neon-glow absolute inset-0 opacity-60 [background:linear-gradient(120deg,transparent_0_30%,rgba(56,189,248,0.2)_40%,transparent_55%),linear-gradient(-120deg,transparent_0_35%,rgba(56,189,248,0.18)_45%,transparent_60%)] [background-size:260%_260%] [animation:neonLines_18s_ease-in-out_infinite_alternate]" />
        <div className="neon-grid absolute inset-0 opacity-50 [background-image:linear-gradient(#0f172a33_1px,transparent_1px),linear-gradient(90deg,#0f172a33_1px,transparent_1px)] [background-size:40px_40px] [mask-image:radial-gradient(circle_at_20%_0,rgba(0,0,0,0.9),transparent_70%)]" />
      </div>

      <div className="relative z-10">
        <Navbar locale={locale} />
        <main dir={locale === "ar" ? "rtl" : "ltr"} className={locale === "ar" ? "rtl rtl:text-right" : ""}>
          <section className="py-10 sm:py-14">
            <div className="mx-auto grid max-w-5xl gap-6 px-4 sm:px-6 md:grid-cols-[1.1fr,0.9fr]">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 rounded-full border border-slate-700/70 bg-slate-950/60 px-3 py-2 text-xs uppercase tracking-[0.22em] text-slate-300">
                  {t("kicker")}
                </div>
                <h1 className="text-3xl font-extrabold text-slate-50 sm:text-4xl">
                  {t("title")}
                </h1>
                <p className="text-base text-slate-300 sm:text-lg">{t("body")}</p>
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={reset}
                    className="rounded-full border border-cyan-300/70 bg-gradient-to-r from-cyan-400 to-emerald-400 px-5 py-3 text-sm font-semibold text-slate-900 shadow-[0_0_25px_rgba(56,189,248,0.4)]"
                  >
                    {t("primary")}
                  </button>
                  <Link
                    href={`/${locale}`}
                    className="rounded-full border border-slate-600/70 bg-[#020617aa] px-5 py-3 text-sm font-semibold text-slate-100 transition hover:border-sky-300/80 hover:text-sky-200"
                  >
                    {t("secondary")}
                  </Link>
                </div>
              </div>

              <div className="relative overflow-hidden rounded-3xl border border-slate-800/70 bg-[#0b1120]/80 p-6 shadow-[0_18px_55px_rgba(0,0,0,0.45)]">
                <div className="pointer-events-none absolute inset-0 opacity-60 [background:radial-gradient(circle_at_20%_10%,rgba(56,189,248,0.16),transparent_40%),radial-gradient(circle_at_80%_80%,rgba(34,197,94,0.14),transparent_45%)]" />
                <div className="relative z-10 space-y-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-700/70 bg-slate-950/60 text-xl text-cyan-200">
                    !
                  </div>
                  <div className="text-sm text-slate-300">
                    {t("body")}
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-slate-900/70">
                    <div className="h-1.5 w-1/2 rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400 animate-pulse" />
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
