"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type FaqItem = {
  id: string;
  question: string;
  answer: string;
  highlights?: string[];
};

type FaqCategory = {
  id: string;
  label: string;
};

type FaqClientProps = {
  locale: string;
  hero: {
    title: string;
    subtitle: string;
    searchLabel: string;
    searchPlaceholder: string;
    placeholders: string[];
  };
  categories: FaqCategory[];
  questionsByCategory: Record<string, FaqItem[]>;
  ctaCard: {
    title: string;
    body: string;
    button: string;
  };
  finalCta: {
    title: string;
    body: string;
    primary: string;
    secondary: string;
  };
  emptyState: {
    title: string;
    body: string;
    reset: string;
  };
  typingLabel: string;
};

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function highlightText(text: string, keywords: string[], locale: string) {
  const trimmed = keywords.map((word) => word.trim()).filter(Boolean);
  if (trimmed.length === 0) return text;
  const unique = Array.from(new Set(trimmed)).sort((a, b) => b.length - a.length);
  const escaped = unique.map(escapeRegExp);
  const regex = new RegExp(`(${escaped.join("|")})`, /[A-Za-z]/.test(text) ? "gi" : "g");
  const parts = text.split(regex);
  const lookup = new Set(unique.map((word) => word.toLocaleLowerCase(locale)));
  return parts.map((part, idx) => {
    const match = lookup.has(part.toLocaleLowerCase(locale));
    if (!match) return part;
    return (
      <mark key={`mark-${idx}`} className="faq-highlight">
        {part}
      </mark>
    );
  });
}

export function FaqClient({
  locale,
  hero,
  categories,
  questionsByCategory,
  ctaCard,
  finalCta,
  emptyState,
  typingLabel,
}: FaqClientProps) {
  const [activeCategory, setActiveCategory] = useState(categories[0]?.id ?? "general");
  const [query, setQuery] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);
  const [answerReady, setAnswerReady] = useState(false);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [focused, setFocused] = useState(false);

  const categoryItems = useMemo(
    () => questionsByCategory[activeCategory] ?? [],
    [activeCategory, questionsByCategory],
  );

  const filteredItems = useMemo(() => {
    const value = query.trim().toLocaleLowerCase(locale);
    if (!value) return categoryItems;
    return categoryItems.filter((item) => {
      const haystack = `${item.question} ${item.answer}`.toLocaleLowerCase(locale);
      return haystack.includes(value);
    });
  }, [categoryItems, locale, query]);

  useEffect(() => {
    if (!hero.placeholders?.length || focused || query.trim()) return;
    const timer = window.setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % hero.placeholders.length);
    }, 2000);
    return () => window.clearInterval(timer);
  }, [focused, hero.placeholders, query]);

  useEffect(() => {
    if (!filteredItems.length) {
      setOpenId(null);
      return;
    }
    if (!openId || !filteredItems.some((item) => item.id === openId)) {
      setOpenId(filteredItems[0].id);
    }
  }, [filteredItems, openId]);

  useEffect(() => {
    if (!openId) return;
    setAnswerReady(false);
    const timer = window.setTimeout(() => setAnswerReady(true), 240);
    return () => window.clearTimeout(timer);
  }, [openId]);

  useEffect(() => {
    if (!openId) return;
    const node = document.getElementById(`faq-${openId}`);
    node?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [openId]);

  const placeholder =
    hero.placeholders?.[placeholderIndex] || hero.searchPlaceholder || hero.placeholders?.[0] || "";

  const queryHighlight = query.trim();
  const insertCtaEvery = 6;
  const listEntries = useMemo(() => {
    const entries: Array<{ type: "qa"; item: FaqItem } | { type: "cta"; key: string }> = [];
    filteredItems.forEach((item, idx) => {
      entries.push({ type: "qa", item });
      const isBreak = (idx + 1) % insertCtaEvery === 0;
      if (isBreak && idx < filteredItems.length - 1) {
        entries.push({ type: "cta", key: `cta-${idx}` });
      }
    });
    return entries;
  }, [filteredItems]);

  return (
    <div className="pb-12">
      <section className="py-8 sm:py-12">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="rounded-3xl border border-slate-800/70 bg-[#0b1120]/80 p-6 shadow-[0_18px_55px_rgba(0,0,0,0.45)] sm:p-8">
            <div className="faq-hero space-y-4">
              <h1 className="text-3xl font-extrabold text-slate-50 sm:text-4xl">{hero.title}</h1>
              <p className="text-base text-slate-300 sm:text-lg">{hero.subtitle}</p>
            </div>
            <div className="mt-6">
              <label className="text-xs uppercase tracking-[0.18em] text-slate-400">
                {hero.searchLabel}
              </label>
              <div className="mt-3 flex items-center gap-3 rounded-2xl border border-slate-700/70 bg-slate-950/70 px-4 py-3 transition focus-within:border-cyan-400/60 focus-within:shadow-[0_0_20px_rgba(56,189,248,0.25)]">
                <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.8)]" />
                <input
                  type="text"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  onFocus={() => setFocused(true)}
                  onBlur={() => setFocused(false)}
                  placeholder={placeholder}
                  className="w-full bg-transparent text-sm text-slate-100 outline-none placeholder:text-slate-500"
                  aria-label={hero.searchLabel}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-4 sm:py-6">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => {
              const isActive = category.id === activeCategory;
              return (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => setActiveCategory(category.id)}
                  className={`rounded-full border px-4 py-2 text-xs font-semibold transition ${
                    isActive
                      ? "border-cyan-400/70 bg-cyan-500/15 text-cyan-100 shadow-[0_0_18px_rgba(56,189,248,0.25)]"
                      : "border-slate-800/70 bg-slate-950/60 text-slate-300 hover:border-slate-600/80"
                  }`}
                  aria-pressed={isActive}
                >
                  {category.label}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-6 sm:py-8">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          {filteredItems.length === 0 ? (
            <div className="rounded-3xl border border-slate-800/70 bg-[#0b1120]/80 p-6 text-center text-sm text-slate-300">
              <div className="text-lg font-semibold text-slate-50">{emptyState.title}</div>
              <p className="mt-2 text-sm text-slate-400">{emptyState.body}</p>
              <button
                type="button"
                onClick={() => setQuery("")}
                className="mt-4 rounded-full border border-slate-600/70 px-4 py-2 text-xs font-semibold text-slate-100 transition hover:border-cyan-300/70"
              >
                {emptyState.reset}
              </button>
            </div>
          ) : (
            <div key={`${activeCategory}-${query}`} className="space-y-6 faq-fade">
              {listEntries.map((entry) => {
                if (entry.type === "cta") {
                  return (
                    <div
                      key={entry.key}
                      className="rounded-3xl border border-slate-800/70 bg-slate-950/60 p-5 text-sm text-slate-300"
                    >
                      <div className="text-base font-semibold text-slate-50">{ctaCard.title}</div>
                      <p className="mt-2 text-sm text-slate-400">{ctaCard.body}</p>
                      <Link
                        href={`/${locale}/contact`}
                        className="mt-4 inline-flex items-center rounded-full border border-cyan-300/70 bg-gradient-to-r from-cyan-400 to-emerald-400 px-4 py-2 text-xs font-semibold text-slate-900 shadow-[0_0_18px_rgba(56,189,248,0.35)]"
                      >
                        {ctaCard.button}
                      </Link>
                    </div>
                  );
                }

                const item = entry.item;
                const isOpen = item.id === openId;
                const isDim = openId !== null && !isOpen;
                const keywords = item.highlights ?? [];
                const shouldHighlight = queryHighlight.length >= 3 ? [queryHighlight, ...keywords] : keywords;

                return (
                  <div
                    key={item.id}
                    id={`faq-${item.id}`}
                    className={`space-y-3 transition duration-200 ${
                      isDim ? "scale-[0.96] opacity-60" : "scale-100 opacity-100"
                    }`}
                  >
                    <div className="flex items-start gap-3 rtl:flex-row-reverse">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-700/70 bg-slate-950/60 text-[10px] font-semibold text-slate-300">
                        Q
                      </div>
                      <button
                        type="button"
                        onClick={() => setOpenId(item.id)}
                        className="ml-auto w-full rounded-2xl border border-slate-800/70 bg-slate-950/70 px-4 py-3 text-left text-sm font-semibold text-slate-100 transition hover:border-cyan-400/40 rtl:ml-0 rtl:mr-auto rtl:text-right"
                        aria-expanded={isOpen}
                      >
                        {item.question}
                      </button>
                    </div>

                    {isOpen && (
                      <div className="flex items-start gap-3 rtl:flex-row-reverse">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full border border-cyan-300/50 bg-cyan-500/20 text-[10px] font-semibold text-cyan-200 shadow-[0_0_14px_rgba(56,189,248,0.35)]">
                          GT
                        </div>
                        <div className="mr-auto w-full rounded-2xl border border-slate-800/70 bg-[#050b18]/80 px-4 py-3 text-sm text-slate-300 rtl:mr-0 rtl:ml-auto">
                          {answerReady ? (
                            <p>{highlightText(item.answer, shouldHighlight, locale)}</p>
                          ) : (
                            <div className="flex items-center gap-2 text-xs text-slate-500">
                              <span className="sr-only">{typingLabel}</span>
                              <span className="faq-typing">
                                <span />
                                <span />
                                <span />
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <section className="py-8 sm:py-12">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="rounded-3xl border border-slate-800/70 bg-[linear-gradient(120deg,rgba(56,189,248,0.18),rgba(34,197,94,0.12),rgba(14,165,233,0.16))] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
            <div className="grid gap-6 md:grid-cols-[1.2fr,0.8fr]">
              <div className="space-y-3">
                <h2 className="text-2xl font-semibold text-slate-50">{finalCta.title}</h2>
                <p className="text-sm text-slate-300">{finalCta.body}</p>
              </div>
              <div className="flex flex-wrap items-center gap-3 md:justify-end">
                <Link
                  href={`/${locale}/custom-project`}
                  className="rounded-full border border-cyan-300/70 bg-gradient-to-r from-cyan-400 to-emerald-400 px-5 py-3 text-sm font-semibold text-slate-900 shadow-[0_0_25px_rgba(56,189,248,0.4)]"
                >
                  {finalCta.primary}
                </Link>
                <Link
                  href={`/${locale}/support`}
                  className="rounded-full border border-slate-600/70 bg-[#020617aa] px-5 py-3 text-sm font-semibold text-slate-100 transition hover:border-sky-300/80 hover:text-sky-200"
                >
                  {finalCta.secondary}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
