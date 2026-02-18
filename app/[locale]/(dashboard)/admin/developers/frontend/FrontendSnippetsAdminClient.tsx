"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { NeonButton } from "@/components/dashboard/NeonButton";
import { NeonTable } from "@/components/dashboard/NeonTable";
import { normalizeTagName, SNIPPET_TAG_GROUPS, SnippetTagCategory, slugifySnippet } from "@/lib/snippets";

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

type TagOption = {
  name: string;
  category: SnippetTagCategory;
};

type SnippetRecord = {
  id: string;
  title: string;
  description?: string | null;
  slug: string;
  html: string;
  css: string;
  js: string;
  status: "DRAFT" | "PUBLISHED";
  updatedAt: string;
  tags: TagOption[];
};

type SnippetFormState = {
  id: string;
  title: string;
  description: string;
  slug: string;
  status: "DRAFT" | "PUBLISHED";
  html: string;
  css: string;
  js: string;
};

const emptyForm: SnippetFormState = {
  id: "",
  title: "",
  description: "",
  slug: "",
  status: "DRAFT",
  html: "",
  css: "",
  js: "",
};

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

export function FrontendSnippetsAdminClient({ locale }: { locale: string }) {
  const t = useTranslations("snippetsAdmin");
  const [snippets, setSnippets] = useState<SnippetRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "DRAFT" | "PUBLISHED">("all");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<SnippetFormState>({ ...emptyForm });
  const [slugTouched, setSlugTouched] = useState(false);
  const [selectedTags, setSelectedTags] = useState<TagOption[]>([]);
  const [tagCatalog, setTagCatalog] = useState<TagOption[]>(() => buildDefaultTagCatalog());
  const [tagPickerOpen, setTagPickerOpen] = useState(false);
  const [tagSearch, setTagSearch] = useState("");
  const [tagError, setTagError] = useState<string | null>(null);
  const [newTagName, setNewTagName] = useState("");
  const [newTagCategory, setNewTagCategory] = useState<SnippetTagCategory>("COMPONENT");

  const categoryLabels: Record<SnippetTagCategory, string> = {
    COMPONENT: t("categories.component"),
    STYLE: t("categories.style"),
    INTERACTION: t("categories.interaction"),
    LAYOUT: t("categories.layout"),
    TECH: t("categories.tech"),
    COLOR: t("categories.color"),
    USE_CASE: t("categories.useCase"),
  };

  const fetchTags = useCallback(async () => {
    try {
      const res = await fetch("/api/snippet-tags", { cache: "no-store" });
      if (!res.ok) return;
      const data = (await res.json()) as TagOption[];
      setTagCatalog((prev) => mergeTagCatalog(prev, data));
    } catch {
      setTagCatalog(buildDefaultTagCatalog());
    }
  }, []);

  const loadSnippets = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (debouncedQuery) params.set("search", debouncedQuery);
      if (statusFilter !== "all") params.set("status", statusFilter);
      params.set("page", "1");
      params.set("pageSize", "50");
      const res = await fetch(`/api/admin/snippets?${params.toString()}`, { cache: "no-store" });
      if (!res.ok) throw new Error(t("errors.load"));
      const data = (await res.json()) as { items: SnippetRecord[] };
      setSnippets(data.items ?? []);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [debouncedQuery, statusFilter, t]);

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedQuery(query.trim()), 300);
    return () => clearTimeout(timeout);
  }, [query]);

  useEffect(() => {
    void loadSnippets();
  }, [loadSnippets]);

  useEffect(() => {
    if (!tagError) return undefined;
    const timeout = setTimeout(() => setTagError(null), 1600);
    return () => clearTimeout(timeout);
  }, [tagError]);

  useEffect(() => {
    void fetchTags();
  }, [fetchTags]);

  const groupedTags = useMemo(() => {
    const searchValue = tagSearch.trim().toLowerCase();
    const groups = CATEGORY_ORDER.map((category) => ({ category, tags: [] as string[] }));
    const map = new Map(groups.map((group) => [group.category, group.tags]));

    tagCatalog.forEach((tag) => {
      const list = map.get(tag.category);
      if (!list) return;
      if (searchValue && !tag.name.includes(searchValue)) return;
      list.push(tag.name);
    });

    groups.forEach((group) => group.tags.sort((a, b) => a.localeCompare(b)));
    return groups.filter((group) => group.tags.length > 0);
  }, [tagCatalog, tagSearch]);

  function openForm(snippet?: SnippetRecord) {
    if (snippet) {
      setForm({
        id: snippet.id,
        title: snippet.title,
        description: snippet.description ?? "",
        slug: snippet.slug,
        status: snippet.status,
        html: snippet.html,
        css: snippet.css,
        js: snippet.js,
      });
      setSelectedTags(snippet.tags ?? []);
      setTagCatalog((prev) => mergeTagCatalog(prev, snippet.tags ?? []));
      setSlugTouched(true);
    } else {
      setForm({ ...emptyForm });
      setSelectedTags([]);
      setSlugTouched(false);
    }
    setShowForm(true);
  }

  function handleTitleChange(value: string) {
    setForm((prev) => {
      const next = { ...prev, title: value };
      if (!slugTouched) {
        next.slug = slugifySnippet(value);
      }
      return next;
    });
  }

  function addTag(name: string, category: SnippetTagCategory) {
    const normalized = normalizeTagName(name);
    if (!normalized) return;
    const exists = selectedTags.some(
      (tag) => tag.name === normalized && tag.category === category,
    );
    if (exists) return;
    if (selectedTags.length >= TAG_LIMIT) {
      setTagError(t("errors.tagLimit"));
      return;
    }
    setSelectedTags((prev) => [...prev, { name: normalized, category }]);
  }

  function removeTag(tag: TagOption) {
    setSelectedTags((prev) =>
      prev.filter((item) => !(item.name === tag.name && item.category === tag.category)),
    );
  }

  function addNewTag() {
    const normalized = normalizeTagName(newTagName);
    if (!normalized) return;
    addTag(normalized, newTagCategory);
    setTagCatalog((prev) => mergeTagCatalog(prev, [{ name: normalized, category: newTagCategory }]));
    setNewTagName("");
  }

  async function saveSnippet(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    const isNew = !form.id;

    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim() || null,
        slug: form.slug.trim() || undefined,
        status: form.status,
        html: form.html ?? "",
        css: form.css ?? "",
        js: form.js ?? "",
        tags: selectedTags,
      };

      const endpoint = isNew ? "/api/admin/snippets" : `/api/admin/snippets/${form.id}`;
      const method = isNew ? "POST" : "PATCH";

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || t("errors.save"));
      }

      await loadSnippets();
      setShowForm(false);
      setForm({ ...emptyForm });
      setSelectedTags([]);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  async function deleteSnippet(snippet: SnippetRecord) {
    const confirmed = window.confirm(t("confirmDelete"));
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/admin/snippets/${snippet.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error(t("errors.delete"));
      await loadSnippets();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  function openPreview(snippet: SnippetRecord) {
    const url = `/${locale}/developers/frontend/playground?id=${snippet.id}&preview=1`;
    window.open(url, "_blank", "noopener,noreferrer");
  }

  function formatDate(value: string) {
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

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.14em] text-slate-500">{t("label")}</p>
          <h1 className="text-2xl font-bold text-slate-50">{t("title")}</h1>
        </div>
        <NeonButton onClick={() => openForm()}>{t("create")}</NeonButton>
      </div>

      {error && <p className="text-sm text-rose-300">{error}</p>}

      <DashboardCard>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex flex-1 items-center gap-2 rounded-xl border border-slate-800/70 bg-slate-950/70 px-3 py-2 text-sm text-slate-200">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={t("filters.searchPlaceholder")}
                className="w-full bg-transparent text-sm text-slate-100 outline-none placeholder:text-slate-500"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as typeof statusFilter)}
              className="rounded-xl border border-slate-800/70 bg-slate-950/70 px-3 py-2 text-sm text-slate-200"
            >
              <option value="all">{t("filters.all")}</option>
              <option value="DRAFT">{t("status.draft")}</option>
              <option value="PUBLISHED">{t("status.published")}</option>
            </select>
          </div>
      </DashboardCard>

      <DashboardCard>
        <NeonTable
          headers={[
            t("table.title"),
            t("table.status"),
            t("table.tags"),
            t("table.updated"),
            t("table.actions"),
          ]}
        >
          {snippets.map((snippet) => (
            <tr key={snippet.id} className="hover:bg-slate-900/40">
              <td className="px-4 py-3 text-sm text-slate-100">
                <div className="font-semibold">{snippet.title}</div>
                <div className="text-xs text-slate-400">{snippet.slug}</div>
              </td>
              <td className="px-4 py-3 text-sm">
                <span
                  className={`rounded-full px-3 py-1 text-[11px] font-semibold ${
                    snippet.status === "PUBLISHED"
                      ? "border-emerald-400/60 bg-emerald-500/10 text-emerald-100"
                      : "border-slate-600/60 bg-slate-800/60 text-slate-200"
                  }`}
                >
                  {snippet.status === "PUBLISHED" ? t("status.published") : t("status.draft")}
                </span>
              </td>
              <td className="px-4 py-3 text-xs text-slate-300">
                <div className="flex flex-wrap gap-1">
                  {snippet.tags.map((tag) => (
                    <span
                      key={`${snippet.id}-${tag.category}-${tag.name}`}
                      className="rounded-full border border-slate-800/70 px-2 py-0.5"
                    >
                      {tag.name}
                    </span>
                  ))}
                </div>
              </td>
              <td className="px-4 py-3 text-sm text-slate-300">
                {formatDate(snippet.updatedAt)}
              </td>
              <td className="px-4 py-3 text-right">
                <div className="flex flex-wrap justify-end gap-2">
                  <NeonButton variant="ghost" className="px-3 py-1 text-xs" onClick={() => openPreview(snippet)}>
                    {t("preview")}
                  </NeonButton>
                  <NeonButton variant="ghost" className="px-3 py-1 text-xs" onClick={() => openForm(snippet)}>
                    {t("edit")}
                  </NeonButton>
                  <NeonButton variant="danger" className="px-3 py-1 text-xs" onClick={() => void deleteSnippet(snippet)}>
                    {t("delete")}
                  </NeonButton>
                </div>
              </td>
            </tr>
          ))}
          {snippets.length === 0 && (
            <tr>
              <td className="px-4 py-3 text-sm text-slate-400" colSpan={5}>
                {loading ? t("loading") : t("empty")}
              </td>
            </tr>
          )}
        </NeonTable>
      </DashboardCard>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="max-h-[90vh] w-full max-w-6xl overflow-y-auto rounded-2xl border border-slate-800/70 bg-[#050b18] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.6)]">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.14em] text-slate-500">
                  {form.id ? t("edit") : t("create")}
                </p>
                <h3 className="text-xl font-bold text-slate-50">
                  {form.title || t("title")}
                </h3>
              </div>
              <NeonButton variant="ghost" onClick={() => setShowForm(false)}>
                {t("close")}
              </NeonButton>
            </div>

            <form className="mt-4 grid gap-6 lg:grid-cols-[1.05fr,0.95fr]" onSubmit={saveSnippet}>
              <div className="space-y-4">
                <div className="grid gap-3 md:grid-cols-2">
                  <label className="flex flex-col gap-1 text-sm text-slate-200">
                    <span>{t("form.title")}</span>
                    <input
                      required
                      value={form.title}
                      onChange={(event) => handleTitleChange(event.target.value)}
                      className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-slate-100 outline-none focus:border-cyan-400/70"
                    />
                  </label>
                  <label className="flex flex-col gap-1 text-sm text-slate-200">
                    <span>{t("form.slug")}</span>
                    <input
                      value={form.slug}
                      onChange={(event) => {
                        setSlugTouched(true);
                        setForm((prev) => ({ ...prev, slug: event.target.value }));
                      }}
                      placeholder={t("form.slugHint")}
                      className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-slate-100 outline-none focus:border-cyan-400/70"
                    />
                    <span className="text-xs text-slate-500">{t("form.slugHint")}</span>
                  </label>
                </div>

                <label className="flex flex-col gap-1 text-sm text-slate-200">
                  <span>{t("form.description")}</span>
                  <textarea
                    value={form.description}
                    rows={3}
                    onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
                    className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-slate-100 outline-none focus:border-cyan-400/70"
                  />
                </label>

                <div className="grid gap-3 md:grid-cols-2">
                  <label className="flex flex-col gap-1 text-sm text-slate-200">
                    <span>{t("form.status")}</span>
                    <select
                      value={form.status}
                      onChange={(event) =>
                        setForm((prev) => ({
                          ...prev,
                          status: event.target.value as "DRAFT" | "PUBLISHED",
                        }))
                      }
                      className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-slate-100 outline-none focus:border-cyan-400/70"
                    >
                      <option value="DRAFT">{t("status.draft")}</option>
                      <option value="PUBLISHED">{t("status.published")}</option>
                    </select>
                  </label>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm text-slate-200">
                    <span>{t("form.tags")}</span>
                    <span className="text-xs text-slate-500">{t("form.tagsHint")}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedTags.map((tag) => (
                      <button
                        key={`${tag.category}-${tag.name}`}
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="rounded-full border border-slate-700/70 bg-slate-900/70 px-3 py-1 text-xs text-slate-200 transition hover:border-cyan-300/70"
                      >
                        {tag.name}
                      </button>
                    ))}
                  </div>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setTagPickerOpen((prev) => !prev)}
                      className="rounded-full border border-cyan-400/70 bg-cyan-500/10 px-4 py-1.5 text-xs font-semibold text-cyan-100"
                    >
                      {t("form.addTag")}
                    </button>
                    {tagPickerOpen && (
                      <div className="absolute left-0 top-full z-20 mt-2 w-[320px] rounded-2xl border border-slate-800/70 bg-[#050b18] p-3 shadow-[0_18px_40px_rgba(0,0,0,0.5)]">
                        <div className="flex items-center gap-2 rounded-xl border border-slate-800/70 bg-slate-950/70 px-3 py-2 text-xs text-slate-200">
                          <input
                            value={tagSearch}
                            onChange={(event) => setTagSearch(event.target.value)}
                            placeholder={t("form.tagSearchPlaceholder")}
                            className="w-full bg-transparent text-xs text-slate-100 outline-none placeholder:text-slate-500"
                          />
                        </div>
                        <div className="mt-3 max-h-56 space-y-3 overflow-y-auto pr-1 text-xs text-slate-200">
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
                                    onClick={() => addTag(tag, group.category)}
                                    className="rounded-full border border-slate-700/70 bg-slate-900/70 px-3 py-1 text-[11px] text-slate-200 transition hover:border-cyan-300/70"
                                  >
                                    {tag}
                                  </button>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="mt-3 border-t border-slate-800/70 pt-3">
                          <div className="text-xs uppercase tracking-[0.16em] text-slate-500">
                            {t("form.newTag")}
                          </div>
                          <div className="mt-2 grid gap-2">
                            <input
                              value={newTagName}
                              onChange={(event) => setNewTagName(event.target.value)}
                              placeholder={t("form.newTagPlaceholder")}
                              className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-100 outline-none focus:border-cyan-400/70"
                            />
                            <select
                              value={newTagCategory}
                              onChange={(event) => setNewTagCategory(event.target.value as SnippetTagCategory)}
                              className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-100 outline-none focus:border-cyan-400/70"
                            >
                              {CATEGORY_ORDER.map((category) => (
                                <option key={category} value={category}>
                                  {categoryLabels[category]}
                                </option>
                              ))}
                            </select>
                            <NeonButton variant="ghost" className="px-3 py-2 text-xs" onClick={addNewTag}>
                              {t("form.addTagButton")}
                            </NeonButton>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  {tagError && <p className="text-xs text-amber-200">{tagError}</p>}
                </div>
              </div>

              <div className="space-y-4">
                <label className="flex flex-col gap-1 text-sm text-slate-200">
                  <span>{t("form.codeHtml")}</span>
                  <textarea
                    value={form.html}
                    rows={8}
                    onChange={(event) => setForm((prev) => ({ ...prev, html: event.target.value }))}
                    className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 font-mono text-xs text-slate-100 outline-none focus:border-cyan-400/70"
                  />
                </label>
                <label className="flex flex-col gap-1 text-sm text-slate-200">
                  <span>{t("form.codeCss")}</span>
                  <textarea
                    value={form.css}
                    rows={6}
                    onChange={(event) => setForm((prev) => ({ ...prev, css: event.target.value }))}
                    className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 font-mono text-xs text-slate-100 outline-none focus:border-cyan-400/70"
                  />
                </label>
                <label className="flex flex-col gap-1 text-sm text-slate-200">
                  <span>{t("form.codeJs")}</span>
                  <textarea
                    value={form.js}
                    rows={6}
                    onChange={(event) => setForm((prev) => ({ ...prev, js: event.target.value }))}
                    className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 font-mono text-xs text-slate-100 outline-none focus:border-cyan-400/70"
                  />
                </label>

                <div className="flex items-center justify-between gap-3">
                  <div className="text-xs text-slate-500">{t("form.tagsHint")}</div>
                  <NeonButton type="submit" disabled={loading}>
                    {loading ? t("form.saving") : t("form.save")}
                  </NeonButton>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
