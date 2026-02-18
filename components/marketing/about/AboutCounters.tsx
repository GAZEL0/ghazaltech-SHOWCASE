"use client";

import { useEffect, useRef, useState } from "react";

type CounterItem = {
  label: string;
  value: number;
  suffix?: string;
};

type AboutCountersProps = {
  title: string;
  subtitle: string;
  items: CounterItem[];
};

function Counter({ label, value, suffix, active }: CounterItem & { active: boolean }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!active) return;
    let rafId = 0;
    const duration = 1200;
    const start = performance.now();

    const step = (timestamp: number) => {
      const progress = Math.min((timestamp - start) / duration, 1);
      setCount(Math.round(progress * value));
      if (progress < 1) {
        rafId = requestAnimationFrame(step);
      }
    };

    rafId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafId);
  }, [active, value]);

  return (
    <div className="rounded-2xl border border-slate-800/70 bg-slate-950/50 p-4 text-center">
      <div className="text-2xl font-semibold text-slate-50">
        {count}
        {suffix ?? ""}
      </div>
      <div className="mt-1 text-xs uppercase tracking-[0.16em] text-slate-500">{label}</div>
    </div>
  );
}

export function AboutCounters({ title, subtitle, items }: AboutCountersProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setActive(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      className="rounded-3xl border border-slate-800/70 bg-[#0b1120]/80 p-6 shadow-[0_18px_55px_rgba(0,0,0,0.4)]"
    >
      <div className="pb-6">
        <p className="text-xs uppercase tracking-[0.18em] text-slate-400">{title}</p>
        <p className="mt-2 text-base text-slate-300">{subtitle}</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item) => (
          <Counter key={item.label} {...item} active={active} />
        ))}
      </div>
    </div>
  );
}
