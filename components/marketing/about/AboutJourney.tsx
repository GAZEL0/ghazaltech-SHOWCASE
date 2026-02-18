"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type JourneyStep = {
  title: string;
  desc: string;
};

type AboutJourneyProps = {
  title: string;
  subtitle: string;
  steps: JourneyStep[];
};

export function AboutJourney({ title, subtitle, steps }: AboutJourneyProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [progress, setProgress] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    function updateProgress() {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const viewport = window.innerHeight || 0;
      const trigger = viewport * 0.6;
      const stepsCount = Math.max(steps.length - 1, 1);
      const stepScroll = Math.max(
        120,
        Math.min(viewport * 0.28, rect.height / stepsCount),
      );
      const total = stepScroll * stepsCount;
      const distance = Math.max(0, trigger - rect.top);
      const next = Math.min(Math.max(distance / total, 0), 1);
      setProgress(next);
      const nextIndex = Math.min(steps.length - 1, Math.max(0, Math.floor(next * stepsCount)));
      setActiveIndex(nextIndex);
    }

    updateProgress();
    window.addEventListener("scroll", updateProgress, { passive: true });
    window.addEventListener("resize", updateProgress);
    return () => {
      window.removeEventListener("scroll", updateProgress);
      window.removeEventListener("resize", updateProgress);
    };
  }, [steps.length]);

  const dotPositions = useMemo(
    () =>
      steps.map((_, idx) =>
        steps.length === 1 ? 50 : Math.round((idx / (steps.length - 1)) * 100),
      ),
    [steps],
  );

  function handleDotClick(idx: number) {
    const safeIndex = Math.min(Math.max(idx, 0), Math.max(steps.length - 1, 0));
    setActiveIndex(safeIndex);
    setProgress(steps.length <= 1 ? 0 : safeIndex / (steps.length - 1));
  }

  return (
    <div
      ref={containerRef}
      className="rounded-3xl border border-slate-800/70 bg-[#0b1120]/80 p-6 shadow-[0_18px_55px_rgba(0,0,0,0.45)]"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 pb-6">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-slate-400">{title}</p>
          <p className="mt-2 text-base text-slate-300">{subtitle}</p>
        </div>
      </div>

      <div className="flex gap-4 sm:gap-6 rtl:flex-row-reverse">
        <div className="relative w-16 shrink-0 self-stretch sm:w-20 md:w-32">
          <div className="absolute left-1/2 top-0 h-full w-[4px] -translate-x-1/2 rounded-full bg-slate-800/70">
            <span
              className="absolute left-0 top-0 w-full rounded-full bg-gradient-to-b from-sky-400 via-cyan-300 to-emerald-400 transition-all duration-300"
              style={{ height: `${Math.round(progress * 100)}%` }}
            />
          </div>

          {dotPositions.map((top, idx) => {
            const isActive = idx === activeIndex;
            const isPast = idx < activeIndex;
            return (
              <button
                key={`journey-dot-${idx}`}
                type="button"
                className={`absolute left-1/2 flex h-5 w-5 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border transition ${
                  isActive
                    ? "border-cyan-200/80 bg-cyan-400/40 shadow-[0_0_18px_rgba(56,189,248,0.7)]"
                    : isPast
                      ? "border-slate-500/80 bg-slate-800/80"
                      : "border-slate-700/70 bg-slate-900/70"
                }`}
                style={{ top: `${top}%` }}
                onClick={() => handleDotClick(idx)}
                aria-label={steps[idx]?.title ?? "Step"}
              >
                <span
                  className={`h-2 w-2 rounded-full ${
                    isActive ? "bg-cyan-200" : isPast ? "bg-slate-300" : "bg-slate-500"
                  }`}
                />
              </button>
            );
          })}
        </div>

        <div className="flex-1 space-y-3">
          {steps.map((step, idx) => {
            const isActive = idx === activeIndex;
            const isPast = idx < activeIndex;
            return (
              <div
                key={step.title}
                className={`rounded-3xl border px-4 py-4 transition-all duration-300 ${
                  isActive
                    ? "border-cyan-400/60 bg-cyan-500/10 text-slate-100 shadow-[0_12px_30px_rgba(56,189,248,0.25)]"
                    : isPast
                      ? "border-slate-800/70 bg-slate-950/40 text-slate-400 scale-[0.98]"
                      : "border-slate-800/70 bg-slate-950/50 text-slate-300 opacity-80"
                }`}
              >
                <div className="text-xs uppercase tracking-[0.2em] text-slate-500">
                  {String(idx + 1).padStart(2, "0")}
                </div>
                <h3 className="mt-2 text-lg font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm text-slate-300">{step.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
