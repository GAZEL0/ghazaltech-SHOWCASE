"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

type LanguageSwitcherProps = {
  current: string;
  locales: string[];
};

export function LanguageSwitcher({ current, locales }: LanguageSwitcherProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const handleSwitch = (code: string) => {
    if (code === current) return;

    const parts = pathname.split("/").filter(Boolean);
    if (parts.length === 0) {
      parts.push(code);
    } else {
      parts[0] = code;
    }
    const query = searchParams.toString();
    const nextPath = `/${parts.join("/")}${query ? `?${query}` : ""}`;

    document.cookie = `NEXT_LOCALE=${code}; path=/; max-age=31536000`;

    startTransition(() => {
      router.push(nextPath);
    });
  };

  return (
    <div className="flex items-center gap-1 rounded-full border border-slate-600/60 bg-[#020617aa] px-2 py-1 text-[11px]">
      {locales.map((code) => (
        <button
          key={code}
          type="button"
          onClick={() => handleSwitch(code)}
          className={`rounded-full px-2 py-1 transition ${
            code === current
              ? "bg-gradient-to-r from-cyan-500/80 to-sky-500/80 text-slate-900 font-semibold"
              : "text-slate-300 hover:text-slate-100"
          }`}
        >
          {code.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
