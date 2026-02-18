"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";

type BlogPostSummary = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  coverImage?: string | null;
  category: string;
  tags: string[];
  readingTime: number;
  publishedAt?: string | null;
  authorName?: string | null;
  featured?: boolean;
};

type BlogCategory = {
  id: string;
  label: string;
};

type BlogClientProps = {
  locale: string;
  hero: {
    title: string;
    subtitle: string;
  };
  featuredLabel: string;
  featuredCta: string;
  filters: {
    all: string;
    searchPlaceholder: string;
  };
  categories: BlogCategory[];
  posts: BlogPostSummary[];
  cta: {
    title: string;
    body: string;
    primary: string;
    secondary: string;
  };
  empty: {
    title: string;
    body: string;
  };
  readingLabel: string;
};

export function BlogClient({
  locale,
  hero,
  featuredLabel,
  featuredCta,
  filters,
  categories,
  posts,
  cta,
  empty,
  readingLabel,
}: BlogClientProps) {
  const [activeCategory, setActiveCategory] = useState("all");
  const [query, setQuery] = useState("");
  const featuredRef = useRef<HTMLDivElement | null>(null);
  const [parallaxOffset, setParallaxOffset] = useState(0);

  const categoryMap = useMemo(
    () => Object.fromEntries(categories.map((cat) => [cat.id, cat.label])),
    [categories],
  );

  const featuredPost = useMemo(
    () => posts.find((post) => post.featured) || posts[0],
    [posts],
  );

  const filteredPosts = useMemo(() => {
    const value = query.trim().toLowerCase();
    return posts.filter((post) => {
      const matchesCategory = activeCategory === "all" || post.category === activeCategory;
      const matchesQuery = value
        ? `${post.title} ${post.excerpt} ${post.tags.join(" ")}`.toLowerCase().includes(value)
        : true;
      return matchesCategory && matchesQuery;
    });
  }, [activeCategory, posts, query]);

  useEffect(() => {
    if (!featuredRef.current) return;
    const handleScroll = () => {
      if (!featuredRef.current) return;
      const rect = featuredRef.current.getBoundingClientRect();
      const viewport = window.innerHeight || 0;
      const offset = Math.min(Math.max((viewport - rect.top) / viewport, 0), 1);
      setParallaxOffset(offset * 16);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  function formatDate(value?: string | null) {
    if (!value) return "";
    try {
      return new Date(value).toLocaleDateString(locale, {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return value;
    }
  }

  function readingTimeLabel(minutes: number) {
    return readingLabel.replace("{minutes}", String(minutes));
  }

  return (
    <div>
      <section className="py-8 sm:py-12">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="rounded-3xl border border-slate-800/70 bg-[#0b1120]/80 p-6 shadow-[0_18px_55px_rgba(0,0,0,0.45)] sm:p-8">
            <div className="space-y-4">
              <h1 className="text-3xl font-extrabold text-slate-50 sm:text-4xl">{hero.title}</h1>
              <p className="text-base text-slate-300 sm:text-lg">{hero.subtitle}</p>
            </div>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <div className="flex flex-1 items-center gap-3 rounded-2xl border border-slate-700/70 bg-slate-950/70 px-4 py-3 focus-within:border-cyan-400/60">
                <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.8)]" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder={filters.searchPlaceholder}
                  className="w-full bg-transparent text-sm text-slate-100 outline-none placeholder:text-slate-500"
                />
              </div>
            </div>
          </div>

          {featuredPost && (
            <div
              ref={featuredRef}
              className="mt-8 overflow-hidden rounded-3xl border border-slate-800/70 bg-slate-950/70 shadow-[0_20px_60px_rgba(0,0,0,0.45)]"
            >
              <div className="grid gap-6 md:grid-cols-[1.2fr,0.8fr]">
                <div className="p-6 sm:p-8">
                  <div className="text-xs uppercase tracking-[0.2em] text-cyan-200">{featuredLabel}</div>
                  <h2 className="mt-3 text-2xl font-semibold text-slate-50">{featuredPost.title}</h2>
                  <p className="mt-3 text-sm text-slate-300">{featuredPost.excerpt}</p>
                  <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-slate-400">
                    <span>{categoryMap[featuredPost.category] || featuredPost.category}</span>
                    <span>|</span>
                    <span>{readingTimeLabel(featuredPost.readingTime)}</span>
                    {featuredPost.publishedAt && (
                      <>
                        <span>|</span>
                        <span>{formatDate(featuredPost.publishedAt)}</span>
                      </>
                    )}
                  </div>
                  <Link
                    href={`/${locale}/blog/${featuredPost.slug}`}
                    className="mt-6 inline-flex items-center rounded-full border border-cyan-300/70 bg-gradient-to-r from-cyan-400 to-emerald-400 px-5 py-2.5 text-sm font-semibold text-slate-900 shadow-[0_0_20px_rgba(56,189,248,0.35)]"
                  >
                    {featuredCta}
                  </Link>
                </div>
                <div className="relative min-h-[220px] overflow-hidden">
                  <div
                    className="absolute inset-0 bg-[linear-gradient(120deg,rgba(56,189,248,0.18),rgba(34,197,94,0.12),rgba(14,165,233,0.16))]"
                    style={{ transform: `translateY(${parallaxOffset}px)` }}
                  />
                  {featuredPost.coverImage ? (
                    <Image
                      src={featuredPost.coverImage}
                      alt={featuredPost.title}
                      fill
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      className="object-cover opacity-70 transition-transform duration-300"
                      style={{ transform: `translateY(${parallaxOffset * 1.2}px)` }}
                      unoptimized
                    />
                  ) : (
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(56,189,248,0.35),transparent_60%)]" />
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="py-4 sm:py-6">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setActiveCategory("all")}
              className={`rounded-full border px-4 py-2 text-xs font-semibold transition ${
                activeCategory === "all"
                  ? "border-cyan-400/70 bg-cyan-500/15 text-cyan-100"
                  : "border-slate-800/70 bg-slate-950/60 text-slate-300 hover:border-slate-600/80"
              }`}
            >
              {filters.all}
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                type="button"
                onClick={() => setActiveCategory(category.id)}
                className={`rounded-full border px-4 py-2 text-xs font-semibold transition ${
                  activeCategory === category.id
                    ? "border-cyan-400/70 bg-cyan-500/15 text-cyan-100"
                    : "border-slate-800/70 bg-slate-950/60 text-slate-300 hover:border-slate-600/80"
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="py-6 sm:py-8">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          {filteredPosts.length === 0 ? (
            <div className="rounded-3xl border border-slate-800/70 bg-[#0b1120]/80 p-6 text-center text-sm text-slate-300">
              <div className="text-lg font-semibold text-slate-50">{empty.title}</div>
              <p className="mt-2 text-sm text-slate-400">{empty.body}</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-6">
              {filteredPosts.map((post, idx) => {
                const spanClass =
                  idx === 0
                    ? "md:col-span-4 md:row-span-2"
                    : idx % 5 === 0
                      ? "md:col-span-3"
                      : "md:col-span-2";
                return (
                  <Link
                    key={post.id}
                    href={`/${locale}/blog/${post.slug}`}
                    className={`group flex h-full flex-col overflow-hidden rounded-3xl border border-slate-800/70 bg-slate-950/70 p-4 transition hover:-translate-y-1 hover:border-cyan-400/40 hover:shadow-[0_16px_40px_rgba(0,0,0,0.35)] ${spanClass}`}
                  >
                    <div className="relative mb-4 h-36 overflow-hidden rounded-2xl bg-slate-900/60">
                      {post.coverImage ? (
                        <Image
                          src={post.coverImage}
                          alt={post.title}
                          fill
                          sizes="(max-width: 768px) 100vw, 33vw"
                          className="object-cover transition duration-300 group-hover:scale-[1.04]"
                          unoptimized
                        />
                      ) : (
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(56,189,248,0.2),transparent_60%)]" />
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                      <span>{categoryMap[post.category] || post.category}</span>
                      <span>|</span>
                      <span>{readingTimeLabel(post.readingTime)}</span>
                    </div>
                    <h3 className="mt-3 text-base font-semibold text-slate-50 group-hover:underline">
                      {post.title}
                    </h3>
                    <p className="mt-2 text-sm text-slate-300 line-clamp-3">{post.excerpt}</p>
                    <div className="mt-4 flex flex-wrap gap-2 text-[11px] text-slate-400">
                      {post.tags.slice(0, 3).map((tag) => (
                        <span key={`${post.id}-${tag}`} className="rounded-full border border-slate-800/70 px-2 py-1">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </Link>
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
                <h2 className="text-2xl font-semibold text-slate-50">{cta.title}</h2>
                <p className="text-sm text-slate-300">{cta.body}</p>
              </div>
              <div className="flex flex-wrap items-center gap-3 md:justify-end">
                <Link
                  href={`/${locale}/custom-project`}
                  className="rounded-full border border-cyan-300/70 bg-gradient-to-r from-cyan-400 to-emerald-400 px-5 py-3 text-sm font-semibold text-slate-900 shadow-[0_0_25px_rgba(56,189,248,0.4)]"
                >
                  {cta.primary}
                </Link>
                <Link
                  href={`/${locale}/support`}
                  className="rounded-full border border-slate-600/70 bg-[#020617aa] px-5 py-3 text-sm font-semibold text-slate-100 transition hover:border-sky-300/80 hover:text-sky-200"
                >
                  {cta.secondary}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
