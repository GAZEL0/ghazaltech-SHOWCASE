"use client";

import { Section } from "@/components/marketing/Section";
import { HeroStack } from "@/components/marketing/HeroStack";

type HeroProps = {
  content: {
    kicker: string;
    title: string;
    highlight: string;
    desc: string;
    ctaPrimary: string;
    ctaSecondary: string;
    meta1: string;
    meta2: string;
    stack: Record<string, string>;
  };
};

export function Hero({ content }: HeroProps) {
  return (
    <Section>
      <div className="relative overflow-hidden rounded-[32px] border border-slate-800/60 bg-[#020617]">
        <div className="relative z-10 gt-hero-bg grid items-center gap-8 p-6 md:p-8 md:grid-cols-[1.1fr,1fr]">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-500/60 bg-[#020617aa] px-3 py-2 text-[11px] text-slate-100 backdrop-blur">
              <span className="h-2 w-2 rounded-full bg-[radial-gradient(circle,#4ae0ff,#0ea5e9)] shadow-[0_0_18px_rgba(74,224,255,0.9)]" />
              <span>{content.kicker}</span>
            </div>
            <h1 className="text-3xl font-extrabold leading-tight text-slate-50 sm:text-4xl">
              {content.title}
              <span className="block bg-gradient-to-r from-sky-400 to-emerald-400 bg-clip-text text-transparent">
                {content.highlight}
              </span>
            </h1>
            <p className="text-base text-slate-300 sm:text-lg">{content.desc}</p>
            <div className="flex flex-wrap items-center gap-3">
              <button className="relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full border-none bg-gradient-to-r from-cyan-400 to-sky-500 px-5 py-3 text-sm font-bold text-slate-900 shadow-[0_0_25px_rgba(14,165,233,0.65)] transition hover:scale-[1.01] hover:shadow-[0_0_35px_rgba(56,189,248,0.85)]">
                <span className="absolute inset-[-40%] translate-x-[-40%] opacity-0 bg-[radial-gradient(circle_at_0_0,rgba(255,255,255,0.4),transparent_55%)] transition duration-200 hover:translate-x-[10%] hover:opacity-100" />
                <span className="relative">{content.ctaPrimary}</span>
              </button>
              <button className="rounded-full border border-slate-500/70 bg-[#020617aa] px-4 py-2.5 text-sm text-slate-100 transition hover:-translate-y-[2px] hover:border-cyan-300/80 hover:bg-[#020617]">
                {content.ctaSecondary}
              </button>
            </div>
            <div className="flex flex-wrap gap-3 text-[12px] text-slate-400">
              <span className="max-w-sm">{content.meta1}</span>
              <span className="max-w-sm">{content.meta2}</span>
            </div>
          </div>

          <HeroStack texts={content.stack} />
        </div>
      </div>
    </Section>
  );
}
