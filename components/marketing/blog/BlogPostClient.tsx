"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { MarkdownBlocks, type MarkdownBlock } from "./MarkdownBlocks";

type TocHeading = {
  id: string;
  text: string;
  level: number;
};

type RelatedPost = {
  slug: string;
  title: string;
  excerpt: string;
  coverImage?: string | null;
  categoryLabel: string;
  readingTime: number;
  publishedAt?: string | null;
};

type BlogPostClientProps = {
  locale: string;
  backLabel: string;
  post: {
    title: string;
    excerpt: string;
    coverImage?: string | null;
    categoryLabel: string;
    tags: string[];
    authorName?: string | null;
    readingTime: number;
    publishedAt?: string | null;
  };
  blocks: MarkdownBlock[];
  headings: TocHeading[];
  insertAfter?: number;
  readingLabel: string;
  tocTitle: string;
  tocEmpty: string;
  relatedTitle: string;
  relatedEmpty: string;
  cta: {
    title: string;
    body: string;
    primary: string;
    secondary: string;
  };
  relatedPosts: RelatedPost[];
};

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

export function BlogPostClient({
  locale,
  backLabel,
  post,
  blocks,
  headings,
  insertAfter,
  readingLabel,
  tocTitle,
  tocEmpty,
  relatedTitle,
  relatedEmpty,
  cta,
  relatedPosts,
}: BlogPostClientProps) {
  const contentRef = useRef<HTMLDivElement | null>(null);
  const [progress, setProgress] = useState(0);
  const [activeHeading, setActiveHeading] = useState(headings[0]?.id ?? "");

  useEffect(() => {
    let frame: number | null = null;

    const update = () => {
      if (!contentRef.current) return;
      const rect = contentRef.current.getBoundingClientRect();
      const start = rect.top + window.scrollY - 120;
      const end = start + rect.height - window.innerHeight + 240;
      const current = window.scrollY;
      const percent = end > start ? ((current - start) / (end - start)) * 100 : 0;
      setProgress(clamp(percent, 0, 100));

      if (headings.length === 0) return;
      let currentId = headings[0]?.id ?? "";
      headings.forEach((heading) => {
        const node = document.getElementById(heading.id);
        if (!node) return;
        const top = node.getBoundingClientRect().top;
        if (top <= 160) {
          currentId = heading.id;
        }
      });
      setActiveHeading(currentId);
    };

    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        update();
        frame = null;
      });
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) {
        window.cancelAnimationFrame(frame);
      }
    };
  }, [headings]);

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

  const ctaCard = (
    <div className="rounded-3xl border border-slate-800/70 bg-slate-950/70 p-5 text-sm text-slate-300">
      <div className="text-lg font-semibold text-slate-50">{cta.title}</div>
      <p className="mt-2 text-sm text-slate-400">{cta.body}</p>
      <div className="mt-4 flex flex-wrap gap-3">
        <Link
          href={`/${locale}/custom-project`}
          className="rounded-full border border-cyan-300/70 bg-gradient-to-r from-cyan-400 to-emerald-400 px-4 py-2 text-xs font-semibold text-slate-900 shadow-[0_0_18px_rgba(56,189,248,0.35)]"
        >
          {cta.primary}
        </Link>
        <Link
          href={`/${locale}/support`}
          className="rounded-full border border-slate-600/70 bg-[#020617aa] px-4 py-2 text-xs font-semibold text-slate-100 transition hover:border-sky-300/80 hover:text-sky-200"
        >
          {cta.secondary}
        </Link>
      </div>
    </div>
  );

  return (
    <div>
      <div className="pointer-events-none fixed left-0 top-0 z-50 h-1 w-full bg-slate-900/70">
        <div
          className="h-full bg-gradient-to-r from-cyan-400 to-emerald-400 shadow-[0_0_18px_rgba(56,189,248,0.45)] transition-[width] duration-150"
          style={{ width: `${progress}%` }}
        />
      </div>

      <section className="py-6 sm:py-10">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <Link
            href={`/${locale}/blog`}
            className="text-xs uppercase tracking-[0.18em] text-slate-400 hover:text-slate-100"
          >
            {backLabel}
          </Link>
          <h1 className="mt-3 text-3xl font-extrabold text-slate-50 sm:text-4xl">
            {post.title}
          </h1>
          <p className="mt-3 text-base text-slate-300 sm:text-lg">{post.excerpt}</p>
          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-slate-400">
            <span className="rounded-full border border-slate-700/70 bg-slate-950/60 px-3 py-1 text-[11px]">
              {post.categoryLabel}
            </span>
            <span>|</span>
            <span>{readingTimeLabel(post.readingTime)}</span>
            {post.publishedAt && (
              <>
                <span>|</span>
                <span>{formatDate(post.publishedAt)}</span>
              </>
            )}
            {post.authorName && (
              <>
                <span>|</span>
                <span>{post.authorName}</span>
              </>
            )}
          </div>
        </div>
      </section>

      <section className="pb-6">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="overflow-hidden rounded-3xl border border-slate-800/70 bg-slate-950/70">
            <div className="relative h-56 sm:h-72">
              {post.coverImage ? (
                <Image
                  src={post.coverImage}
                  alt={post.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 800px"
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(56,189,248,0.25),transparent_60%)]" />
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="pb-12">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid gap-8 lg:grid-cols-[1fr,260px]">
            <div ref={contentRef} className="rounded-3xl border border-slate-800/70 bg-[#050b18]/80 p-6">
              <MarkdownBlocks blocks={blocks} insertAfter={insertAfter} cta={ctaCard} />
              {post.tags.length > 0 && (
                <div className="mt-6 flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-slate-800/70 bg-slate-950/60 px-3 py-1 text-xs text-slate-300"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <aside className="space-y-4">
              <div className="rounded-2xl border border-slate-800/70 bg-slate-950/70 p-4">
                <div className="text-xs uppercase tracking-[0.18em] text-slate-400">{tocTitle}</div>
                {headings.length === 0 ? (
                  <p className="mt-3 text-sm text-slate-500">{tocEmpty}</p>
                ) : (
                  <div className="mt-3 space-y-2 text-sm text-slate-300">
                    {headings.map((heading) => (
                      <button
                        key={heading.id}
                        type="button"
                        onClick={() =>
                          document.getElementById(heading.id)?.scrollIntoView({
                            behavior: "smooth",
                            block: "start",
                          })
                        }
                        className={`block w-full text-left transition rtl:text-right ${
                          activeHeading === heading.id
                            ? "text-cyan-200"
                            : "text-slate-400 hover:text-slate-200"
                        } ${heading.level > 2 ? "pl-4 text-xs rtl:pl-0 rtl:pr-4" : ""}`}
                      >
                        {heading.text}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </aside>
          </div>
        </div>
      </section>

      <section className="pb-12">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mb-4 text-lg font-semibold text-slate-50">{relatedTitle}</div>
          {relatedPosts.length === 0 ? (
            <div className="rounded-3xl border border-slate-800/70 bg-slate-950/60 p-6 text-sm text-slate-400">
              {relatedEmpty}
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-3">
              {relatedPosts.map((item) => (
                <Link
                  key={item.slug}
                  href={`/${locale}/blog/${item.slug}`}
                  className="group flex h-full flex-col overflow-hidden rounded-3xl border border-slate-800/70 bg-slate-950/70 p-4 transition hover:-translate-y-1 hover:border-cyan-400/40"
                >
                  <div className="relative mb-4 h-32 overflow-hidden rounded-2xl bg-slate-900/60">
                    {item.coverImage ? (
                      <Image
                        src={item.coverImage}
                        alt={item.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover transition duration-300 group-hover:scale-[1.04]"
                        unoptimized
                      />
                    ) : (
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(56,189,248,0.2),transparent_60%)]" />
                    )}
                  </div>
                  <div className="text-xs text-slate-400">{item.categoryLabel}</div>
                  <h3 className="mt-2 text-base font-semibold text-slate-50 group-hover:underline">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm text-slate-300 line-clamp-3">{item.excerpt}</p>
                  <div className="mt-3 text-xs text-slate-400">
                    {readingTimeLabel(item.readingTime)}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
