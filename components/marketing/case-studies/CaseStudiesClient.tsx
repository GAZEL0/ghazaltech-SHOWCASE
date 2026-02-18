"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { MetricCounter } from "./MetricCounter";

type CaseStudySummary = {
  id: string;
  slug: string;
  title: string;
  clientName: string;
  projectType: string;
  challengeSummary: string;
  primaryResult: string;
  coverImage?: string | null;
  featured?: boolean;
};

type CaseStudyReason = {
  title: string;
  body: string;
};

type CaseStudiesClientProps = {
  locale: string;
  hero: {
    kicker: string;
    title: string;
    subtitle: string;
    primaryCta: string;
    secondaryCta: string;
  };
  reasons: {
    title: string;
    items: CaseStudyReason[];
  };
  grid: {
    title: string;
    subtitle: string;
    progressLabel: string;
  };
  card: {
    typeLabel: string;
    challengeLabel: string;
    resultLabel: string;
    readCta: string;
  };
  midCta: {
    title: string;
    body: string;
    cta: string;
  };
  empty: {
    title: string;
    body: string;
  };
  cases: CaseStudySummary[];
};

export function CaseStudiesClient({
  locale,
  hero,
  reasons,
  grid,
  card,
  midCta,
  empty,
  cases,
}: CaseStudiesClientProps) {
  const [progress, setProgress] = useState(0);
  const [heroProgress, setHeroProgress] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const heroRef = useRef<HTMLDivElement | null>(null);
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  const caseItems = useMemo(() => cases, [cases]);
  const featuredCase = useMemo(
    () => caseItems.find((item) => item.featured) ?? caseItems[0],
    [caseItems],
  );

  useEffect(() => {
    const handleScroll = () => {
      const viewport = window.innerHeight || 1;
      const center = viewport * 0.52;

      if (heroRef.current) {
        const heroRect = heroRef.current.getBoundingClientRect();
        const heroRange = Math.max(heroRect.height, 1);
        const heroNext = Math.min(Math.max((center - heroRect.top) / heroRange, 0), 1);
        setHeroProgress(heroNext);
      }

      if (sectionRef.current) {
        const rect = sectionRef.current.getBoundingClientRect();
        const sectionTop = rect.top + window.scrollY;
        const sectionBottom = rect.bottom + window.scrollY;
        const viewportCenter = window.scrollY + viewport * 0.5;
        const range = Math.max(sectionBottom - sectionTop, 1);
        const nextProgress = Math.min(Math.max((viewportCenter - sectionTop) / range, 0), 1);
        setProgress(nextProgress);
      }

      let closestIndex = 0;
      let closestDistance = Number.POSITIVE_INFINITY;
      cardRefs.current.forEach((card, index) => {
        if (!card) return;
        const cardRect = card.getBoundingClientRect();
        const cardCenter = cardRect.top + cardRect.height / 2;
        const distance = Math.abs(cardCenter - center);
        if (distance < closestDistance) {
          closestDistance = distance;
          closestIndex = index;
        }
      });
      setActiveIndex(closestIndex);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="space-y-12 pb-12">
      <section ref={heroRef} className="case-studies-hero relative overflow-hidden pt-10 sm:pt-14">
        <div className="case-studies-hero-bg absolute inset-0 opacity-70 [background:radial-gradient(circle_at_top,#0f172a_0%,#020617_55%)]" />
        <div className="case-studies-hero-grid absolute inset-0 opacity-60 [background-image:linear-gradient(#0f172a33_1px,transparent_1px),linear-gradient(90deg,#0f172a33_1px,transparent_1px)] [background-size:48px_48px]" />
        <div className="case-studies-hero-glow absolute inset-0 opacity-60 [background:linear-gradient(120deg,transparent_20%,rgba(56,189,248,0.14)_45%,transparent_70%)]" />

        <div className="relative mx-auto grid max-w-6xl gap-8 px-4 sm:px-6 md:grid-cols-[1.1fr,0.9fr]">
          <div className="space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-700/70 bg-slate-950/60 px-3 py-2 text-xs uppercase tracking-[0.24em] text-slate-300">
              {hero.kicker}
            </div>
            <h1 className="text-4xl font-extrabold text-slate-50 sm:text-5xl">
              {hero.title}
            </h1>
            <p className="text-base text-slate-300 sm:text-lg">{hero.subtitle}</p>
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href={`/${locale}/case-studies`}
                className="rounded-full border border-cyan-300/70 bg-gradient-to-r from-cyan-400 to-emerald-400 px-5 py-3 text-sm font-semibold text-slate-900 shadow-[0_0_25px_rgba(56,189,248,0.4)]"
              >
                {hero.primaryCta}
              </Link>
              <Link
                href={`/${locale}/custom-project`}
                className="rounded-full border border-slate-600/70 bg-[#020617aa] px-5 py-3 text-sm font-semibold text-slate-100 transition hover:border-sky-300/80 hover:text-sky-200"
              >
                {hero.secondaryCta}
              </Link>
            </div>
          </div>

          <div className="case-studies-hero-card relative rounded-3xl border border-slate-800/70 bg-[#0b1120]/80 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
            <div className="absolute inset-0 opacity-60 [background:radial-gradient(circle_at_20%_10%,rgba(56,189,248,0.2),transparent_40%),radial-gradient(circle_at_80%_70%,rgba(34,197,94,0.16),transparent_50%)]" />
            <div className="relative space-y-6">
              <div className="text-xs uppercase tracking-[0.2em] text-slate-400">
                {grid.progressLabel}
              </div>
              <div className="case-studies-progress-panel relative h-48 w-full overflow-hidden rounded-2xl border border-slate-800/70 bg-slate-950/60">
                <div className="absolute inset-y-4 left-6 w-[3px] rounded-full bg-slate-800">
                  <div
                    className="absolute bottom-0 w-full rounded-full bg-gradient-to-b from-cyan-300 via-sky-400 to-emerald-400 transition-all duration-300"
                    style={{ height: `${Math.max(heroProgress * 100, 12)}%` }}
                  />
                </div>
                <div className="absolute inset-y-4 left-[18px] flex flex-col justify-between">
                  {[0, 1, 2, 3].map((idx) => (
                    <span
                      key={`dot-${idx}`}
                      className={`h-4 w-4 rounded-full border ${
                        idx / 3 <= heroProgress
                          ? "border-cyan-300/80 bg-cyan-400/40 shadow-[0_0_15px_rgba(56,189,248,0.6)]"
                          : "border-slate-700/70 bg-slate-900/60"
                      }`}
                    />
                  ))}
                </div>
                {featuredCase ? (
                  <div className="absolute inset-0 flex items-center">
                    <div className="ml-14 mr-4 flex-1 space-y-2 text-start">
                      <div className="text-[11px] uppercase tracking-[0.18em] text-slate-500">
                        {featuredCase.projectType}
                      </div>
                      <div className="text-base font-semibold text-slate-100">
                        {featuredCase.title}
                      </div>
                      <div className="text-xs text-slate-400">
                        {featuredCase.clientName}
                      </div>
                      <div className="text-xs text-slate-300 line-clamp-2">
                        {featuredCase.challengeSummary}
                      </div>
                      <div className="text-xs uppercase tracking-[0.18em] text-slate-500">
                        {card.resultLabel}
                      </div>
                      <div className="text-lg font-semibold text-emerald-200">
                        <MetricCounter value={featuredCase.primaryResult} />
                      </div>
                      <Link
                        href={`/${locale}/case-studies/${featuredCase.slug}`}
                        className="inline-flex items-center gap-2 text-xs font-semibold text-cyan-200 transition hover:text-cyan-100"
                      >
                        {card.readCta}
                        <span aria-hidden="true">-&gt;</span>
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-xs text-slate-400">
                    {grid.subtitle}
                  </div>
                )}
              </div>
              <div className="text-sm text-slate-400">
                {grid.subtitle}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid gap-6 md:grid-cols-[1.1fr,0.9fr]">
          <div className="space-y-3">
            <h2 className="text-2xl font-bold text-slate-50">{reasons.title}</h2>
            <p className="text-sm text-slate-400">{grid.subtitle}</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {reasons.items.map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-slate-800/70 bg-[#0b1120]/70 p-4 text-sm text-slate-300 shadow-[0_12px_30px_rgba(0,0,0,0.35)]"
              >
                <div className="text-sm font-semibold text-slate-100">{item.title}</div>
                <div className="mt-2 text-xs text-slate-400">{item.body}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section ref={sectionRef} className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{grid.title}</p>
            <h2 className="text-2xl font-bold text-slate-50">{grid.subtitle}</h2>
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[0.15fr,0.85fr]">
          <div className="relative hidden lg:block">
            <div className="absolute left-1/2 top-2 h-full w-[3px] -translate-x-1/2 rounded-full bg-slate-900">
              <div
                className="absolute bottom-0 w-full rounded-full bg-gradient-to-b from-emerald-300 via-cyan-300 to-sky-400 transition-all duration-300"
                style={{ height: `${Math.max(progress * 100, 8)}%` }}
              />
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {caseItems.length === 0 && (
              <div className="col-span-full rounded-3xl border border-slate-800/70 bg-[#0b1120]/80 p-6 text-center">
                <h3 className="text-lg font-semibold text-slate-50">{empty.title}</h3>
                <p className="mt-2 text-sm text-slate-400">{empty.body}</p>
              </div>
            )}
            {caseItems.map((item, index) => (
              <div
                key={item.id}
                ref={(el) => {
                  cardRefs.current[index] = el;
                }}
                className={`case-studies-card group relative overflow-hidden rounded-3xl border p-5 transition ${
                  activeIndex === index
                    ? "case-studies-card-active border-cyan-400/60 bg-[#0b1426] shadow-[0_20px_50px_rgba(14,165,233,0.2)]"
                    : "border-slate-800/70 bg-[#0b1120]/70"
                }`}
              >
                <div className="absolute inset-0 opacity-0 transition group-hover:opacity-100 [background:radial-gradient(circle_at_20%_0%,rgba(56,189,248,0.15),transparent_50%)]" />
                <div className="relative space-y-4">
                  <div className="text-xs uppercase tracking-[0.2em] text-slate-500">
                    {card.typeLabel}
                  </div>
                  <div className="text-sm font-semibold text-slate-200">
                    {item.projectType}
                  </div>
                  <div className="text-lg font-semibold text-slate-50">{item.title}</div>
                  <div className="text-xs text-slate-400">{item.clientName}</div>
                  <div className="case-studies-card-panel rounded-2xl border border-slate-800/70 bg-slate-950/70 p-3">
                    <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500">
                      {card.challengeLabel}
                    </div>
                    <p className="mt-2 text-sm text-slate-300">{item.challengeSummary}</p>
                  </div>
                  <div className="case-studies-card-panel rounded-2xl border border-slate-800/70 bg-slate-950/70 p-3">
                    <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500">
                      {card.resultLabel}
                    </div>
                    <div className="mt-2 text-2xl font-semibold text-emerald-200">
                      <MetricCounter value={item.primaryResult} />
                    </div>
                  </div>
                  <Link
                    href={`/${locale}/case-studies/${item.slug}`}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-200 transition group-hover:text-cyan-100"
                  >
                    {card.readCta}
                    <span aria-hidden="true">-&gt;</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="rounded-3xl border border-slate-800/70 bg-[linear-gradient(120deg,rgba(56,189,248,0.18),rgba(16,185,129,0.12),rgba(14,165,233,0.16))] p-6 shadow-[0_18px_55px_rgba(0,0,0,0.35)]">
          <div className="grid gap-6 md:grid-cols-[1.2fr,0.8fr]">
            <div className="space-y-2">
              <h3 className="text-2xl font-semibold text-slate-50">{midCta.title}</h3>
              <p className="text-sm text-slate-300">{midCta.body}</p>
            </div>
            <div className="flex items-center md:justify-end">
              <Link
                href={`/${locale}/custom-project`}
                className="rounded-full border border-cyan-300/70 bg-gradient-to-r from-cyan-400 to-emerald-400 px-5 py-3 text-sm font-semibold text-slate-900 shadow-[0_0_25px_rgba(56,189,248,0.4)]"
              >
                {midCta.cta}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

