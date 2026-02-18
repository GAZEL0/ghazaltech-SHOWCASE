"use client";

import { useTheme } from "./ThemeProvider";

type ThemeToggleProps = {
  className?: string;
};

export function ThemeToggle({ className = "" }: ThemeToggleProps) {
  const { theme, toggle } = useTheme();
  const isLight = theme === "light";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isLight ? "Switch to dark mode" : "Switch to light mode"}
      className={`flex h-10 w-10 items-center justify-center rounded-full border border-slate-700/70 bg-slate-900/60 text-slate-100 transition hover:border-cyan-400/70 hover:text-sky-200 ${className}`}
    >
      {isLight ? (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M21 12.79A9 9 0 0111.21 3a7 7 0 109.79 9.79z" />
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 4.5a1 1 0 011 1v1.25a1 1 0 01-2 0V5.5a1 1 0 011-1zm0 11.75a1 1 0 011 1V18.5a1 1 0 01-2 0v-1.25a1 1 0 011-1zm7.5-4.5a1 1 0 01-1 1h-1.25a1 1 0 010-2H18.5a1 1 0 011 1zM7.75 12a1 1 0 01-1 1H5.5a1 1 0 010-2h1.25a1 1 0 011 1zm9.5 5.657a1 1 0 010 1.414l-.884.884a1 1 0 11-1.415-1.415l.885-.883a1 1 0 011.414 0zM8.25 6.343a1 1 0 010 1.414l-.884.884A1 1 0 015.951 7.226l.885-.883a1 1 0 011.414 0zm8.015 1.414a1 1 0 01-1.415-1.414l.885-.884a1 1 0 011.414 1.414l-.884.884zm-9.9 9.9a1 1 0 01-1.414-1.414l.884-.884a1 1 0 011.414 1.414l-.884.884zM12 9a3 3 0 100 6 3 3 0 000-6z" />
        </svg>
      )}
    </button>
  );
}
