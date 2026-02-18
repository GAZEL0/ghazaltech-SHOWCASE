"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import {
  normalizeTagName,
  SNIPPET_TAG_GROUPS,
  SnippetTagCategory,
} from "@/lib/snippets";
import {
  SnippetCopyActions,
  SnippetCodeTabs,
  SnippetPreviewFrame,
} from "./SnippetUI";

type SnippetTag = {
  name: string;
  category: SnippetTagCategory;
};

type SnippetItem = {
  id: string;
  title: string;
  description?: string | null;
  slug: string;
  html: string;
  css: string;
  js: string;
  tags: SnippetTag[];
  updatedAt: string;
};

type TagOption = {
  name: string;
  category: SnippetTagCategory;
};

const PAGE_SIZE = 9;
const TAG_LIMIT = 12;
const CATEGORY_ORDER: SnippetTagCategory[] = [
  "COMPONENT",
  "STYLE",
  "INTERACTION",
  "LAYOUT",
  "TECH",
  "COLOR",
  "USE_CASE",
];

function buildDefaultTagCatalog(): TagOption[] {
  return SNIPPET_TAG_GROUPS.flatMap((group) =>
    group.tags.map((tag) => ({
      name: normalizeTagName(tag),
      category: group.id,
    })),
  );
}

function mergeTagCatalog(base: TagOption[], next: TagOption[]) {
  const seen = new Set(base.map((tag) => `${tag.category}:${tag.name}`));
  const merged = [...base];
  next.forEach((tag) => {
    const key = `${tag.category}:${tag.name}`;
    if (tag.name && !seen.has(key)) {
      seen.add(key);
      merged.push(tag);
    }
  });
  return merged;
}

export function FrontendSnippetsClient({ locale }: { locale: string }) {
  const t = useTranslations("developersFrontend");
  const isRtl = locale === "ar";
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [tagCatalog, setTagCatalog] = useState<TagOption[]>(() => buildDefaultTagCatalog());
  const [tagSearch, setTagSearch] = useState("");
  const [tagPickerOpen, setTagPickerOpen] = useState(false);
  const [tagError, setTagError] = useState<string | null>(null);
  const [snippets, setSnippets] = useState<SnippetItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const requestId = useRef(0);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const codeLabels = {
    html: t("code.html"),
    css: t("code.css"),
    js: t("code.js"),
  };
  const actionLabels = {
    copy: t("actions.copy"),
    copyAs: t("actions.copyAs"),
    copyHtml: t("actions.copyHtml"),
    copyCss: t("actions.copyCss"),
    copyJs: t("actions.copyJs"),
    copyFull: t("actions.copyFull"),
  };
  const categoryLabels: Record<SnippetTagCategory, string> = {
    COMPONENT: t("categories.component"),
    STYLE: t("categories.style"),
    INTERACTION: t("categories.interaction"),
    LAYOUT: t("categories.layout"),
    TECH: t("categories.tech"),
    COLOR: t("categories.color"),
    USE_CASE: t("categories.useCase"),
  };
  const dropdownAlign = isRtl ? "right-0" : "left-0";
  const selectedTagsKey = useMemo(() => selectedTags.join(","), [selectedTags]);

  const fetchTags = useCallback(async () => {
    try {
      const res = await fetch("/api/snippet-tags", { cache: "no-store" });
      if (!res.ok) return;
      const data = (await res.json()) as { name: string; category: SnippetTagCategory }[];
      const merged = mergeTagCatalog(
        buildDefaultTagCatalog(),
        data.map((tag) => ({
          name: normalizeTagName(tag.name),
          category: tag.category,
        })),
      );
      setTagCatalog(merged);
    } catch {
      setTagCatalog(buildDefaultTagCatalog());
    }
  }, []);

  const fetchSnippets = useCallback(async (nextPage: number) => {
    const currentId = requestId.current + 1;
    requestId.current = currentId;

    try {
      const params = new URLSearchParams();
      params.set("page", String(nextPage));
      params.set("pageSize", String(PAGE_SIZE));
      if (debouncedSearch) params.set("search", debouncedSearch);
      if (selectedTagsKey) params.set("tags", selectedTagsKey);

      const res = await fetch(`/api/snippets?${params.toString()}`, { cache: "no-store" });
      if (!res.ok) throw new Error("Failed");
      const data = (await res.json()) as {
        total: number;
        totalPages: number;
        items: SnippetItem[];
      };

      if (requestId.current !== currentId) return;

      setTotal(data.total);
      setTotalPages(data.totalPages);
      if (nextPage === 1) {
        setSnippets(data.items);
      } else {
        setSnippets((prev) => [...prev, ...data.items]);
      }
    } catch {
      if (requestId.current !== currentId) return;
      if (nextPage === 1) {
        setSnippets([]);
      }
    } finally {
      if (requestId.current !== currentId) return;
      setLoading(false);
      setLoadingMore(false);
    }
  }, [debouncedSearch, selectedTagsKey]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 300);
    return () => clearTimeout(timeout);
  }, [search]);

  useEffect(() => {
    setPage(1);
    setSnippets([]);
  }, [debouncedSearch, selectedTagsKey]);

  useEffect(() => {
    void fetchTags();
  }, [fetchTags]);

  useEffect(() => {
    if (page === 1) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }
    void fetchSnippets(page);
  }, [page, fetchSnippets]);

  useEffect(() => {
    if (!tagPickerOpen) return undefined;
    const handleClick = (event: MouseEvent) => {
      const target = event.target as Node;
      if (dropdownRef.current && !dropdownRef.current.contains(target)) {
        setTagPickerOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [tagPickerOpen]);

  function addTag(name: string) {
    const normalized = normalizeTagName(name);
    if (!normalized) return;
    if (selectedTags.includes(normalized)) return;
    if (selectedTags.length >= TAG_LIMIT) {
      setTagError(t("tagLimit"));
      return;
    }
    setSelectedTags((prev) => [...prev, normalized]);
  }

  function removeTag(name: string) {
    setSelectedTags((prev) => prev.filter((tag) => tag !== name));
  }

  function clearTags() {
    setSelectedTags([]);
  }

  useEffect(() => {
    if (!tagError) return undefined;
    const timeout = setTimeout(() => setTagError(null), 1600);
    return () => clearTimeout(timeout);
  }, [tagError]);

  const groupedTags = useMemo(() => {
    const searchValue = tagSearch.trim().toLowerCase();
    const grouped = CATEGORY_ORDER.map((category) => ({
      category,
      tags: [] as string[],
    }));

    const groupedMap = new Map(grouped.map((item) => [item.category, item.tags]));

    tagCatalog.forEach((tag) => {
      const list = groupedMap.get(tag.category);
      if (!list) return;
      if (selectedTags.includes(tag.name)) return;
      if (searchValue && !tag.name.includes(searchValue)) return;
      list.push(tag.name);
    });

    grouped.forEach((group) => group.tags.sort((a, b) => a.localeCompare(b)));
    return grouped.filter((group) => group.tags.length > 0);
  }, [tagCatalog, selectedTags, tagSearch]);

  return (
    <div>
      <section className="py-8 sm:py-12">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="rounded-3xl border border-slate-800/70 bg-[#0b1120]/80 p-6 shadow-[0_18px_55px_rgba(0,0,0,0.45)] sm:p-8">
            <div className="space-y-3">
              <h1 className="text-3xl font-extrabold text-slate-50 sm:text-4xl">{t("title")}</h1>
              <p className="text-base text-slate-300 sm:text-lg">{t("subtitle")}</p>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <div className="flex flex-1 items-center gap-3 rounded-2xl border border-slate-700/70 bg-slate-950/70 px-4 py-3 focus-within:border-cyan-400/60">
                <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.8)]" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder={t("searchPlaceholder")}
                  className="w-full bg-transparent text-sm text-slate-100 outline-none placeholder:text-slate-500"
                />
              </div>
              <div className="text-xs text-slate-400">
                {t("results", { count: total })}
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <div className="text-xs uppercase tracking-[0.18em] text-slate-400">
                {t("selectedTags")}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {selectedTags.length === 0 && (
                  <span className="text-xs text-slate-500">{t("tagLimit")}</span>
                )}
                {selectedTags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="rounded-full border border-slate-700/70 bg-slate-900/70 px-3 py-1 text-xs text-slate-200 transition hover:border-cyan-300/70"
                  >
                    {tag}
                  </button>
                ))}
              </div>
              {selectedTags.length > 0 && (
                <button
                  type="button"
                  onClick={clearTags}
                  className="rounded-full border border-slate-700/70 bg-slate-950/70 px-3 py-1 text-xs text-slate-300 transition hover:border-slate-500/70"
                >
                  {t("clear")}
                </button>
              )}
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setTagPickerOpen((prev) => !prev)}
                  className="rounded-full border border-cyan-400/70 bg-cyan-500/10 px-4 py-1.5 text-xs font-semibold text-cyan-100"
                >
                  {t("addTag")}
                </button>
                {tagPickerOpen && (
                  <div
                    className={`absolute ${dropdownAlign} top-full z-20 mt-2 w-[min(320px,calc(100vw-2rem))] rounded-2xl border border-slate-800/70 bg-[#050b18] p-3 shadow-[0_18px_40px_rgba(0,0,0,0.5)]`}
                  >
                    <div className="flex items-center gap-2 rounded-xl border border-slate-800/70 bg-slate-950/70 px-3 py-2 text-xs text-slate-200">
                      <input
                        value={tagSearch}
                        onChange={(event) => setTagSearch(event.target.value)}
                        placeholder={t("tagSearchPlaceholder")}
                        className="w-full bg-transparent text-xs text-slate-100 outline-none placeholder:text-slate-500"
                      />
                    </div>
                    <div className="mt-3 max-h-64 space-y-3 overflow-y-auto pr-1 text-xs text-slate-200">
                      {groupedTags.map((group) => (
                        <div key={group.category}>
                          <div className="text-[11px] uppercase tracking-[0.18em] text-slate-500">
                            {categoryLabels[group.category]}
                          </div>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {group.tags.map((tag) => (
                              <button
                                key={`${group.category}-${tag}`}
                                type="button"
                                onClick={() => addTag(tag)}
                                className="rounded-full border border-slate-700/70 bg-slate-900/70 px-3 py-1 text-[11px] text-slate-200 transition hover:border-cyan-300/70"
                              >
                                {tag}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {tagError && (
              <div className="mt-3 text-xs text-amber-200">{tagError}</div>
            )}
          </div>
        </div>
      </section>

      <section className="py-6 sm:py-8">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          {loading && snippets.length === 0 ? (
            <div className="grid gap-4 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, idx) => (
                <div
                  key={`skeleton-${idx}`}
                  className="flex h-full flex-col gap-4 rounded-3xl border border-slate-800/70 bg-slate-950/70 p-4"
                >
                  <div className="h-40 animate-pulse rounded-2xl bg-slate-900/70" />
                  <div className="space-y-2">
                    <div className="h-4 w-2/3 animate-pulse rounded-full bg-slate-900/70" />
                    <div className="h-3 w-1/2 animate-pulse rounded-full bg-slate-900/70" />
                  </div>
                  <div className="h-20 animate-pulse rounded-2xl bg-slate-900/70" />
                </div>
              ))}
            </div>
          ) : snippets.length === 0 ? (
            <div className="rounded-3xl border border-slate-800/70 bg-[#0b1120]/80 p-6 text-center text-sm text-slate-300">
              <div className="text-lg font-semibold text-slate-50">{t("empty.title")}</div>
              <p className="mt-2 text-sm text-slate-400">{t("empty.body")}</p>
            </div>
          ) : (
            <div className="grid gap-4 lg:grid-cols-3">
              {snippets.map((snippet) => (
                <div
                  key={snippet.id}
                  className="flex h-full w-full min-w-0 flex-col gap-4 overflow-hidden rounded-3xl border border-slate-800/70 bg-slate-950/70 p-4 shadow-[0_18px_50px_rgba(0,0,0,0.45)]"
                >
                  <SnippetPreviewFrame
                    title={snippet.title}
                    html={snippet.html}
                    css={snippet.css}
                    js={snippet.js}
                    lazy
                    className="h-40"
                  />
                  <div>
                    <h3 className="text-base font-semibold text-slate-50">{snippet.title}</h3>
                    {snippet.description && (
                      <p className="mt-1 text-sm text-slate-400 line-clamp-2">
                        {snippet.description}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2 text-[11px] text-slate-400">
                    {snippet.tags.map((tag) => (
                      <span
                        key={`${snippet.id}-${tag.name}`}
                        className="rounded-full border border-slate-800/70 bg-slate-900/60 px-2 py-1"
                      >
                        {tag.name}
                      </span>
                    ))}
                  </div>
                  <SnippetCodeTabs
                    html={snippet.html}
                    css={snippet.css}
                    js={snippet.js}
                    labels={codeLabels}
                  />
                  <div className="mt-auto flex flex-wrap items-center justify-between gap-2">
                    <SnippetCopyActions
                      html={snippet.html}
                      css={snippet.css}
                      js={snippet.js}
                      labels={actionLabels}
                    />
                    <Link
                      href={`/${locale}/developers/frontend/playground?id=${snippet.id}`}
                      className="rounded-full border border-slate-700/70 bg-slate-900/70 px-4 py-2 text-xs font-semibold text-slate-200 transition hover:border-cyan-300/70"
                    >
                      {t("actions.preview")}
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}

          {page < totalPages && snippets.length > 0 && (
            <div className="mt-6 flex justify-center">
              <button
                type="button"
                onClick={() => setPage((prev) => prev + 1)}
                disabled={loadingMore}
                className="rounded-full border border-slate-700/70 bg-slate-950/70 px-5 py-2 text-xs font-semibold text-slate-200 transition hover:border-cyan-300/70 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loadingMore ? t("pagination.loadMore") + "..." : t("pagination.loadMore")}
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
