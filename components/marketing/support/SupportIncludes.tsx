"use client";

import { useState } from "react";

type SupportIncludeItem = {
  title: string;
  example: string;
};

type SupportIncludesProps = {
  title: string;
  includedLabel: string;
  excludedLabel: string;
  exampleLabel: string;
  included: SupportIncludeItem[];
  excluded: SupportIncludeItem[];
};

function IncludeList({
  items,
  variant,
  exampleLabel,
}: {
  items: SupportIncludeItem[];
  variant: "included" | "excluded";
  exampleLabel: string;
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="space-y-3">
      {items.map((item, idx) => {
        const isOpen = openIndex === idx;
        return (
          <div
            key={item.title}
            className="rounded-2xl border border-slate-800/70 bg-[#0b1120]/80 px-4 py-3"
          >
            <button
              type="button"
              onClick={() => setOpenIndex(isOpen ? null : idx)}
              className="flex w-full items-center justify-between gap-3 text-left text-sm text-slate-200"
            >
              <div className="flex items-center gap-2">
                {variant === "included" ? (
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    className="h-4 w-4 text-emerald-300 support-check"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <span className="h-4 w-4 rounded-full border border-rose-400/80 text-center text-[10px] font-bold text-rose-300">
                    x
                  </span>
                )}
                <span>{item.title}</span>
              </div>
              <span className="text-xs text-slate-500">{isOpen ? "-" : "+"}</span>
            </button>
            {isOpen && (
              <div className="mt-2 text-xs text-slate-400">
                <span className="uppercase tracking-[0.14em] text-slate-500">
                  {exampleLabel}
                </span>
                <p className="mt-1 text-sm text-slate-300">{item.example}</p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export function SupportIncludes({
  title,
  includedLabel,
  excludedLabel,
  exampleLabel,
  included,
  excluded,
}: SupportIncludesProps) {
  return (
    <div className="space-y-6">
      <div className="text-lg font-semibold text-slate-50">{title}</div>
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-3">
          <div className="text-xs uppercase tracking-[0.16em] text-emerald-300">
            {includedLabel}
          </div>
          <IncludeList items={included} variant="included" exampleLabel={exampleLabel} />
        </div>
        <div className="space-y-3">
          <div className="text-xs uppercase tracking-[0.16em] text-rose-300">
            {excludedLabel}
          </div>
          <IncludeList items={excluded} variant="excluded" exampleLabel={exampleLabel} />
        </div>
      </div>
    </div>
  );
}
