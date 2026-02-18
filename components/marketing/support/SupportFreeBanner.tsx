"use client";

import { useEffect, useRef, useState } from "react";

type SupportFreeBannerProps = {
  title: string;
  bullets: string[];
  limitNote: string;
  buttonLabel: string;
  modalTitle: string;
  modalIntro: string;
  modalExcluded: string;
  closeLabel: string;
};

export function SupportFreeBanner({
  title,
  bullets,
  limitNote,
  buttonLabel,
  modalTitle,
  modalIntro,
  modalExcluded,
  closeLabel,
}: SupportFreeBannerProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!ref.current) return undefined;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 },
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`rounded-3xl border border-slate-800/70 bg-[#0b1120]/80 p-6 shadow-[0_14px_40px_rgba(0,0,0,0.35)] transition duration-500 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
      }`}
    >
      <div className="grid gap-6 md:grid-cols-[0.6fr,1.4fr]">
        <div className="space-y-3">
          <div className="text-lg font-semibold text-slate-50">{title}</div>
        </div>
        <div className="space-y-4">
          <ul className="grid gap-2 text-sm text-slate-200">
            {bullets.map((item) => (
              <li key={item} className="flex items-start gap-2">
                <span className="mt-1 h-2 w-2 rounded-full bg-cyan-400" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <p className="text-xs text-slate-400">{limitNote}</p>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="inline-flex items-center gap-2 rounded-full border border-slate-700/70 bg-slate-900/60 px-4 py-2 text-xs font-semibold text-slate-200 transition hover:border-cyan-300/80 hover:text-cyan-100"
          >
            {buttonLabel}
          </button>
        </div>
      </div>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-6"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-lg space-y-4 rounded-2xl border border-slate-800/70 bg-[#050b18] p-6 text-slate-100 shadow-[0_20px_60px_rgba(0,0,0,0.6)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-lg font-semibold">{modalTitle}</h3>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-xs text-slate-400 hover:text-slate-200"
              >
                {closeLabel}
              </button>
            </div>
            <div className="space-y-3 text-sm text-slate-200">
              <p>{modalIntro}</p>
              <p className="text-slate-400">{modalExcluded}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
