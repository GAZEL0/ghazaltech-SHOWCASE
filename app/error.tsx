"use client";

import Link from "next/link";
import { useEffect } from "react";

type RootErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function RootError({ error, reset }: RootErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="min-h-screen bg-[#020617] px-6 py-12 text-slate-100">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 rounded-3xl border border-slate-800/70 bg-[#0b1120]/80 p-8 shadow-[0_18px_55px_rgba(0,0,0,0.45)]">
        <div className="inline-flex w-fit items-center gap-2 rounded-full border border-slate-700/70 bg-slate-950/60 px-3 py-2 text-xs uppercase tracking-[0.2em] text-slate-400">
          500
        </div>
        <h1 className="text-3xl font-extrabold text-slate-50">Something went wrong</h1>
        <p className="text-base text-slate-300">
          We hit a temporary error while loading this page. Please try again.
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => reset()}
            className="rounded-full border border-cyan-300/70 bg-gradient-to-r from-cyan-400 to-emerald-400 px-5 py-3 text-sm font-semibold text-slate-900 shadow-[0_0_25px_rgba(56,189,248,0.4)]"
          >
            Try again
          </button>
          <Link
            href="/en"
            className="rounded-full border border-slate-600/70 bg-[#020617aa] px-5 py-3 text-sm font-semibold text-slate-100 transition hover:border-sky-300/80 hover:text-sky-200"
          >
            Go to homepage
          </Link>
        </div>
      </div>
    </main>
  );
}
