"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type SupportLifecycleStep = {
  title: string;
  desc: string;
};

type SupportLifecycleProps = {
  title: string;
  subtitle: string;
  steps: SupportLifecycleStep[];
  activeLabel: string;
  nextLabel: string;
};

export function SupportLifecycle({
  title,
  subtitle,
  steps,
  activeLabel,
  nextLabel,
}: SupportLifecycleProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [progress, setProgress] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    function updateProgress() {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const viewport = window.innerHeight || 0;
      const trigger = viewport * 0.55;
      const stepsCount = Math.max(steps.length - 1, 1);
      const stepScroll = Math.max(
        80,
        Math.min(viewport * 0.18, rect.height / stepsCount),
      );
      const total = stepScroll * stepsCount;
      const distance = Math.max(0, trigger - rect.top);
      const next = Math.min(Math.max(distance / total, 0), 1);
      setProgress(next);
      const nextIndex = Math.min(
        steps.length - 1,
        Math.max(0, Math.floor(next * stepsCount)),
      );
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

  const dotPositions = useMemo(() => {
    const viewBoxHeight = 420;
    const startY = 10;
    const endY = 410;
    if (steps.length === 1) {
      const mid = (startY + endY) / 2;
      return [(mid / viewBoxHeight) * 100];
    }
    return steps.map((_, idx) => {
      const ratio = idx / (steps.length - 1);
      const pos = startY + ratio * (endY - startY);
      return (pos / viewBoxHeight) * 100;
    });
  }, [steps]);

  const activeStep = steps[activeIndex] ?? steps[0];

  function handleDotClick(idx: number) {
    const safeIndex = Math.min(Math.max(idx, 0), Math.max(steps.length - 1, 0));
    setActiveIndex(safeIndex);
    setProgress(steps.length <= 1 ? 0 : safeIndex / (steps.length - 1));
  }

  return (
    <div
      ref={containerRef}
      className="rounded-3xl border border-slate-800/70 bg-[#0b1120]/80 p-6 shadow-[0_18px_50px_rgba(0,0,0,0.4)]"
    >
      <div className="space-y-2 pb-6">
        <p className="text-xs uppercase tracking-[0.16em] text-slate-400">{title}</p>
        <p className="text-base text-slate-300">{subtitle}</p>
      </div>

      <div className="flex gap-4 sm:gap-6 rtl:flex-row-reverse">
        <div className="relative w-16 shrink-0 self-stretch min-h-[420px] sm:w-20 md:w-28">
          <svg
            viewBox="0 0 120 420"
            className="absolute inset-0 h-full w-full"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path
              d="M60 10 C40 70, 80 120, 60 180 C40 240, 80 290, 60 350 C45 390, 60 410, 60 410"
              fill="none"
              stroke="rgba(56,189,248,0.25)"
              strokeWidth="6"
              strokeLinecap="round"
            />
            <path
              d="M60 10 C40 70, 80 120, 60 180 C40 240, 80 290, 60 350 C45 390, 60 410, 60 410"
              fill="none"
              stroke="url(#support-line)"
              strokeWidth="6"
              strokeLinecap="round"
              pathLength={1}
              strokeDasharray={1}
              strokeDashoffset={1 - progress}
            />
            <defs>
              <linearGradient id="support-line" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#38bdf8" />
                <stop offset="100%" stopColor="#22c55e" />
              </linearGradient>
            </defs>
          </svg>

          {dotPositions.map((top, idx) => {
            const isActive = idx === activeIndex;
            return (
              <button
                key={`support-dot-${idx}`}
                type="button"
                className={`absolute left-1/2 flex h-5 w-5 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border transition ${
                  isActive
                    ? "border-cyan-200/80 bg-cyan-400/40 shadow-[0_0_20px_rgba(56,189,248,0.6)]"
                    : "border-slate-700/70 bg-slate-900/70"
                }`}
                style={{ top: `${top}%` }}
                onClick={() => handleDotClick(idx)}
                aria-label={steps[idx]?.title ?? "Step"}
              >
                <span
                  className={`h-2 w-2 rounded-full ${
                    isActive ? "bg-cyan-200" : "bg-slate-500"
                  }`}
                />
              </button>
            );
          })}
        </div>

        <div className="flex-1 space-y-4">
          <div
            key={activeStep?.title}
            className="support-fade rounded-3xl border border-slate-800/70 bg-[#050b18]/80 p-5 shadow-[0_12px_40px_rgba(0,0,0,0.45)]"
          >
            <div className="text-xs uppercase tracking-[0.14em] text-slate-500">
              {String(activeIndex + 1).padStart(2, "0")}
            </div>
            <h3 className="mt-2 text-xl font-semibold text-slate-50">{activeStep?.title}</h3>
            <p className="mt-3 text-sm text-slate-300">{activeStep?.desc}</p>
          </div>

          <div className="grid gap-2 text-xs text-slate-400">
            {steps.map((step, idx) => (
              <div
                key={step.title}
                className={`flex items-center justify-between rounded-xl border px-3 py-2 ${
                  idx === activeIndex
                    ? "border-cyan-400/50 bg-cyan-500/10 text-slate-100"
                    : "border-slate-800/70 bg-slate-950/50"
                }`}
              >
                <span>{step.title}</span>
                <span className="text-[11px] uppercase tracking-[0.12em] text-slate-500">
                  {idx === activeIndex ? activeLabel : nextLabel}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
