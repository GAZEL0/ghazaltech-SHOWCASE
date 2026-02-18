"use client";

import Link from "next/link";
import Image from "next/image";
import { MetricCounter } from "./MetricCounter";

type CaseStudyResult = {
  label?: string;
  value?: string;
  note?: string;
};

type CaseStudyDetail = {
  title: string;
  clientName: string;
  projectType: string;
  industry?: string | null;
  duration?: string | null;
  technologies: string[];
  coverImage?: string | null;
  challengeSummary: string;
  primaryResult: string;
  challenge: string;
  solution: string;
  implementation: string;
  results?: CaseStudyResult[] | null;
  testimonial?: string | null;
};

type CaseStudyClientProps = {
  locale: string;
  backLabel: string;
  labels: {
    projectType: string;
    industry: string;
    duration: string;
    technologies: string;
    visualFallback: string;
  };
  sections: {
    challenge: string;
    solution: string;
    implementation: string;
    results: string;
    testimonial: string;
  };
  cta: {
    title: string;
    body: string;
    primary: string;
    secondary: string;
  };
  caseStudy: CaseStudyDetail;
};

function renderParagraphs(text: string) {
  return text
    .split(/\n+/)
    .map((chunk) => chunk.trim())
    .filter(Boolean)
    .map((chunk, idx) => (
      <p key={`para-${idx}`} className="text-sm text-slate-300 sm:text-base">
        {chunk}
      </p>
    ));
}

export function CaseStudyClient({
  locale,
  backLabel,
  labels,
  sections,
  cta,
  caseStudy,
}: CaseStudyClientProps) {
  const results = Array.isArray(caseStudy.results) ? caseStudy.results : [];

  return (
    <div className="space-y-10 pb-12">
      <section className="relative overflow-hidden rounded-3xl border border-slate-800/70 bg-[#0b1120]/80 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.45)] sm:p-8">
        <div className="absolute inset-0 opacity-60 [background:radial-gradient(circle_at_20%_0,rgba(56,189,248,0.2),transparent_45%),radial-gradient(circle_at_80%_80%,rgba(34,197,94,0.16),transparent_50%)]" />
        <div className="relative grid gap-6 lg:grid-cols-[1.05fr,0.95fr]">
          <div className="space-y-4">
            <Link href={`/${locale}/case-studies`} className="text-xs uppercase tracking-[0.24em] text-slate-400">
              {backLabel}
            </Link>
            <h1 className="text-3xl font-extrabold text-slate-50 sm:text-4xl">
              {caseStudy.title}
            </h1>
            <p className="text-sm text-slate-300 sm:text-base">{caseStudy.challengeSummary}</p>
            <div className="rounded-2xl border border-slate-800/70 bg-slate-950/70 p-4">
              <div className="text-xs uppercase tracking-[0.18em] text-slate-500">
                {sections.results}
              </div>
              <div className="mt-2 text-2xl font-semibold text-emerald-200">
                <MetricCounter value={caseStudy.primaryResult} />
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-300">
              <div>
                <div className="text-[11px] uppercase tracking-[0.18em] text-slate-500">
                  {labels.projectType}
                </div>
                <div className="text-slate-100">{caseStudy.projectType}</div>
              </div>
              {caseStudy.industry && (
                <div>
                  <div className="text-[11px] uppercase tracking-[0.18em] text-slate-500">
                    {labels.industry}
                  </div>
                  <div className="text-slate-100">{caseStudy.industry}</div>
                </div>
              )}
              {caseStudy.duration && (
                <div>
                  <div className="text-[11px] uppercase tracking-[0.18em] text-slate-500">
                    {labels.duration}
                  </div>
                  <div className="text-slate-100">{caseStudy.duration}</div>
                </div>
              )}
            </div>
            <div className="rounded-2xl border border-slate-800/70 bg-slate-950/70 p-4">
              <div className="text-xs uppercase tracking-[0.18em] text-slate-500">
                {labels.technologies}
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {caseStudy.technologies.map((tech) => (
                  <span
                    key={tech}
                    className="rounded-full border border-slate-700/70 px-3 py-1 text-xs text-slate-200"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="relative min-h-[220px] overflow-hidden rounded-2xl border border-slate-800/70 bg-slate-950/70">
            <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(56,189,248,0.18),rgba(34,197,94,0.12),rgba(14,165,233,0.16))]" />
            {caseStudy.coverImage ? (
              <Image
                src={caseStudy.coverImage}
                alt={caseStudy.title}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover opacity-80"
                unoptimized
              />
            ) : (
              <div className="relative flex h-full min-h-[220px] items-center justify-center text-xs text-slate-400">
                {labels.visualFallback}
              </div>
            )}
            <div className="absolute bottom-4 left-4 rounded-full border border-slate-700/70 bg-slate-950/70 px-4 py-2 text-xs text-slate-200">
              {caseStudy.clientName}
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.65fr,0.35fr]">
        <div className="space-y-6 rounded-3xl border border-slate-800/70 bg-[#0b1120]/80 p-6">
          <div className="space-y-3">
            <h2 className="text-2xl font-semibold text-slate-50">{sections.challenge}</h2>
            <div className="space-y-3">{renderParagraphs(caseStudy.challenge)}</div>
          </div>
          <div className="space-y-3 border-t border-slate-800/70 pt-6">
            <h2 className="text-2xl font-semibold text-slate-50">{sections.solution}</h2>
            <div className="space-y-3">{renderParagraphs(caseStudy.solution)}</div>
          </div>
          <div className="space-y-3 border-t border-slate-800/70 pt-6">
            <h2 className="text-2xl font-semibold text-slate-50">{sections.implementation}</h2>
            <div className="space-y-3">{renderParagraphs(caseStudy.implementation)}</div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-3xl border border-slate-800/70 bg-[#0b1120]/80 p-5">
            <div className="text-xs uppercase tracking-[0.2em] text-slate-500">{sections.results}</div>
            <div className="mt-4 space-y-4">
              {results.length === 0 ? (
                <div className="text-sm text-slate-400">{caseStudy.primaryResult}</div>
              ) : (
                results.map((result, idx) => (
                  <div key={`${result.label ?? "metric"}-${idx}`} className="space-y-1">
                    <div className="text-xs uppercase tracking-[0.16em] text-slate-500">
                      {result.label ?? "Metric"}
                    </div>
                    <div className="text-2xl font-semibold text-emerald-200">
                      <MetricCounter value={result.value ?? "-"} />
                    </div>
                    {result.note && <div className="text-xs text-slate-400">{result.note}</div>}
                  </div>
                ))
              )}
            </div>
          </div>

          {caseStudy.testimonial && (
            <div className="rounded-3xl border border-slate-800/70 bg-[#0b1120]/80 p-5">
              <div className="text-xs uppercase tracking-[0.2em] text-slate-500">{sections.testimonial}</div>
              <div className="mt-3 text-sm text-slate-300">
                &quot;{caseStudy.testimonial}&quot;
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="rounded-3xl border border-slate-800/70 bg-[linear-gradient(120deg,rgba(56,189,248,0.18),rgba(16,185,129,0.12),rgba(14,165,233,0.16))] p-6 shadow-[0_18px_55px_rgba(0,0,0,0.35)]">
        <div className="grid gap-6 md:grid-cols-[1.2fr,0.8fr]">
          <div className="space-y-2">
            <h3 className="text-2xl font-semibold text-slate-50">{cta.title}</h3>
            <p className="text-sm text-slate-300">{cta.body}</p>
          </div>
          <div className="flex flex-wrap items-center gap-3 md:justify-end">
            <Link
              href={`/${locale}/contact`}
              className="rounded-full border border-cyan-300/70 bg-gradient-to-r from-cyan-400 to-emerald-400 px-5 py-3 text-sm font-semibold text-slate-900 shadow-[0_0_25px_rgba(56,189,248,0.4)]"
            >
              {cta.primary}
            </Link>
            <Link
              href={`/${locale}/custom-project`}
              className="rounded-full border border-slate-600/70 bg-[#020617aa] px-5 py-3 text-sm font-semibold text-slate-100 transition hover:border-sky-300/80 hover:text-sky-200"
            >
              {cta.secondary}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
