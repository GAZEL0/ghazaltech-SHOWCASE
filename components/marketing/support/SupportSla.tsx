"use client";

import { useEffect, useRef, useState } from "react";

type SupportSlaItem = {
  label: string;
  value: number;
  suffix: string;
  tooltip: string;
};

type SupportSlaProps = {
  title: string;
  items: SupportSlaItem[];
  tooltipLabel: string;
};

function Counter({ value, suffix }: { value: number; suffix: string }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (!ref.current) return undefined;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStarted(true);
          observer.disconnect();
        }
      },
      { threshold: 0.6 },
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!started) return;
    const duration = 900;
    const startTime = performance.now();
    let rafId = 0;

    const step = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1);
      setCount(Math.round(progress * value));
      if (progress < 1) {
        rafId = requestAnimationFrame(step);
      }
    };

    rafId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafId);
  }, [started, value]);

  return (
    <div ref={ref} className="text-3xl font-semibold text-slate-50">
      {count}
      <span className="text-lg text-slate-400">{suffix}</span>
    </div>
  );
}

export function SupportSla({ title, items, tooltipLabel }: SupportSlaProps) {
  return (
    <div className="rounded-3xl border border-slate-800/70 bg-[#0b1120]/80 p-6 shadow-[0_14px_40px_rgba(0,0,0,0.35)]">
      <div className="text-xs uppercase tracking-[0.16em] text-slate-400">{title}</div>
      <div className="mt-4 grid gap-4 md:grid-cols-3">
        {items.map((item) => (
          <div
            key={item.label}
            className="group rounded-2xl border border-slate-800/70 bg-slate-950/60 p-4 text-slate-200"
          >
            <Counter value={item.value} suffix={item.suffix} />
            <div className="mt-2 text-sm text-slate-300">{item.label}</div>
            <div className="relative mt-2 text-[11px] uppercase tracking-[0.14em] text-slate-500">
              <span className="cursor-help">{tooltipLabel}</span>
              <div className="pointer-events-none absolute left-0 top-6 z-10 w-52 rounded-xl border border-slate-800/70 bg-[#050b18] p-3 text-xs text-slate-200 opacity-0 shadow-[0_18px_40px_rgba(0,0,0,0.5)] transition group-hover:opacity-100">
                {item.tooltip}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
