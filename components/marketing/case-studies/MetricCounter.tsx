"use client";

import { useEffect, useRef, useState } from "react";

type MetricCounterProps = {
  value: string;
  className?: string;
};

function splitMetric(value: string) {
  const numeric = parseFloat(value.replace(/[^0-9.]/g, ""));
  if (Number.isNaN(numeric) || numeric <= 0) {
    return { numeric: null, suffix: value };
  }
  const suffix = value.replace(/[0-9.]/g, "").trim();
  const decimalMatch = value.match(/\.(\d+)/);
  const decimals = decimalMatch ? decimalMatch[1].length : 0;
  return { numeric, suffix, decimals };
}

export function MetricCounter({ value, className }: MetricCounterProps) {
  const spanRef = useRef<HTMLSpanElement | null>(null);
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    const info = splitMetric(value);
    if (!info.numeric) {
      setDisplay(value);
      return;
    }
    const target = info.numeric;
    const decimals = info.decimals ?? 0;
    const suffix = info.suffix ?? "";
    let started = false;
    let rafId = 0;

    const animate = (startTime: number) => {
      const step = (time: number) => {
        const elapsed = time - startTime;
        const progress = Math.min(elapsed / 900, 1);
        const current = Number((progress * target).toFixed(decimals));
        setDisplay(`${current}${suffix}`);
        if (progress < 1) {
          rafId = requestAnimationFrame(step);
        }
      };
      rafId = requestAnimationFrame(step);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !started) {
          started = true;
          animate(performance.now());
          observer.disconnect();
        }
      },
      { threshold: 0.5 },
    );

    if (spanRef.current) {
      observer.observe(spanRef.current);
    }

    return () => {
      observer.disconnect();
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [value]);

  return (
    <span ref={spanRef} className={className}>
      {display}
    </span>
  );
}
