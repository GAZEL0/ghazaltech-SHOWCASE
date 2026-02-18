"use client";

import { useState } from "react";

type ComparisonSliderProps = {
  title: string;
  subtitle: string;
  leftTitle: string;
  rightTitle: string;
  leftItems: string[];
  rightItems: string[];
  handleLabel: string;
};

export function ComparisonSlider({
  title,
  subtitle,
  leftTitle,
  rightTitle,
  leftItems,
  rightItems,
  handleLabel,
}: ComparisonSliderProps) {
  const [value, setValue] = useState(55);
  const normalized = Math.min(Math.max((value - 10) / 80, 0), 1);
  const modern = normalized;
  const traditional = 1 - normalized;

  const leftStyle = {
    opacity: 0.65 + traditional * 0.35,
    filter: `grayscale(${0.25 + traditional * 0.55}) saturate(${0.6 + traditional * 0.2})`,
    boxShadow: `0 0 0 1px rgba(148,163,184,${0.1 + traditional * 0.12})`,
  };

  const rightStyle = {
    opacity: 0.65 + modern * 0.35,
    filter: `saturate(${1 + modern * 0.7}) brightness(${1 + modern * 0.12})`,
    boxShadow: `0 0 ${12 + modern * 22}px rgba(56,189,248,${0.15 + modern * 0.35})`,
  };

  return (
    <div className="rounded-3xl border border-slate-800/70 bg-[#0b1120]/80 p-6 shadow-[0_18px_55px_rgba(0,0,0,0.4)]">
      <div className="pb-6">
        <p className="text-xs uppercase tracking-[0.18em] text-slate-400">{title}</p>
        <p className="mt-2 text-base text-slate-300">{subtitle}</p>
      </div>

      <div className="relative overflow-hidden rounded-3xl border border-slate-800/70 bg-slate-950/40">
        <div className="pointer-events-none absolute inset-0">
          <div
            className="absolute inset-0 bg-[linear-gradient(140deg,rgba(15,23,42,0.8),rgba(2,6,23,0.9))]"
            style={{ opacity: 0.2 + traditional * 0.5 }}
          />
          <div
            className="absolute inset-0 bg-[radial-gradient(circle_at_85%_20%,rgba(56,189,248,0.25),transparent_55%),radial-gradient(circle_at_90%_80%,rgba(34,197,94,0.2),transparent_60%)]"
            style={{ opacity: 0.15 + modern * 0.55 }}
          />
        </div>

        <div className="relative z-10 grid gap-6 p-6 md:grid-cols-2">
          <div
            className="space-y-4 rounded-2xl border border-slate-800/70 bg-slate-950/50 p-4 transition-all duration-300"
            style={leftStyle}
          >
            <div className="text-xs uppercase tracking-[0.2em] text-slate-400">{leftTitle}</div>
            <ul className="space-y-3 text-sm text-slate-300">
              {leftItems.map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-slate-600" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div
            className="space-y-4 rounded-2xl border border-cyan-400/30 bg-slate-950/50 p-4 transition-all duration-300"
            style={rightStyle}
          >
            <div className="text-xs uppercase tracking-[0.2em] text-slate-200">{rightTitle}</div>
            <ul className="space-y-3 text-sm text-slate-100">
              {rightItems.map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-cyan-300 shadow-[0_0_10px_rgba(56,189,248,0.7)]" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="pointer-events-none absolute inset-y-0 w-px bg-cyan-300/70" style={{ left: `${value}%` }} />
        <div
          className="pointer-events-none absolute top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-cyan-300/70 bg-slate-950/80 text-xs text-cyan-200 shadow-[0_0_18px_rgba(56,189,248,0.4)]"
          style={{ left: `calc(${value}% - 16px)` }}
        >
          ||
        </div>

        <input
          aria-label={handleLabel}
          type="range"
          min={10}
          max={90}
          value={value}
          onChange={(event) => setValue(Number(event.target.value))}
          className="absolute inset-x-6 bottom-4 z-20 h-6 cursor-ew-resize appearance-none bg-transparent accent-cyan-400"
        />
        <div className="absolute bottom-2 right-6 text-[11px] text-slate-500">{handleLabel}</div>
      </div>
    </div>
  );
}
