"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { NeonButton } from "@/components/dashboard/NeonButton";
import { NeonTable } from "@/components/dashboard/NeonTable";
import { estimateReadingTime, slugify } from "@/lib/blog";
import { MarkdownBlocks, parseMarkdown } from "@/components/marketing/blog/MarkdownBlocks";

type BlogPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage?: string | null;
  category: string;
  tags: string[];
  status: "DRAFT" | "PUBLISHED";
  locale: string;
  featured: boolean;
  authorName?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  readingTime?: number | null;
  publishedAt?: string | null;
  createdAt: string;
  updatedAt: string;
};

type BlogFormState = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string;
  category: string;
  tags: string;
  status: "DRAFT" | "PUBLISHED";
  locale: string;
  featured: boolean;
  authorName: string;
  seoTitle: string;
  seoDescription: string;
  publishedAt: string;
  readingTimeMinutes: string;
};

const emptyForm: BlogFormState = {
  id: "",
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  coverImage: "",
  category: "web-dev",
  tags: "",
  status: "DRAFT",
  locale: "en",
  featured: false,
  authorName: "",
  seoTitle: "",
  seoDescription: "",
  publishedAt: "",
  readingTimeMinutes: "",
};

function toInputDate(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 16);
}

export function BlogAdminClient({ locale }: { locale: string }) {
  const t = useTranslations("blogAdmin");
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "DRAFT" | "PUBLISHED">("all");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<BlogFormState>({ ...emptyForm, locale });
  const [slugTouched, setSlugTouched] = useState(false);

  const categories = t.raw("categories") as { id: string; label: string }[];
  const categoryMap = useMemo(
    () => Object.fromEntries(categories.map((cat) => [cat.id, cat.label])),
    [categories],
  );

  const previewBlocks = useMemo(() => parseMarkdown(form.content || ""), [form.content]);
  const wordCount = useMemo(() => {
    if (!form.content.trim()) return 0;
    return form.content.trim().split(/\s+/).filter(Boolean).length;
  }, [form.content]);
  const estimatedReadingTime = useMemo(
    () => estimateReadingTime(form.content || ""),
    [form.content],
  );
  const manualReadingTime = Number(form.readingTimeMinutes);
  const readingTime =
    Number.isFinite(manualReadingTime) && manualReadingTime > 0
      ? Math.round(manualReadingTime)
      : estimatedReadingTime;

  const loadPosts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/blog?includeDraft=true", { cache: "no-store" });
      if (!res.ok) throw new Error(t("errors.load"));
      const data = (await res.json()) as BlogPost[];
      setPosts(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    void loadPosts();
  }, [loadPosts]);

  const filteredPosts = useMemo(() => {
    const value = query.trim().toLowerCase();
    return posts.filter((post) => {
      const matchesStatus = statusFilter === "all" || post.status === statusFilter;
      const matchesQuery = value
        ? `${post.title} ${post.excerpt} ${post.tags.join(" ")} ${post.slug}`.toLowerCase().includes(value)
        : true;
      return matchesStatus && matchesQuery;
    });
  }, [posts, query, statusFilter]);

  function openForm(post?: BlogPost) {
    if (post) {
      setForm({
        id: post.id,
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        content: post.content ?? "",
        coverImage: post.coverImage ?? "",
        category: post.category,
        tags: post.tags.join(", "),
        status: post.status,
        locale: post.locale,
        featured: post.featured,
        authorName: post.authorName ?? "",
        seoTitle: post.seoTitle ?? "",
        seoDescription: post.seoDescription ?? "",
        publishedAt: toInputDate(post.publishedAt),
        readingTimeMinutes: post.readingTime ? String(post.readingTime) : "",
      });
      setSlugTouched(true);
    } else {
      setForm({ ...emptyForm, locale });
      setSlugTouched(false);
    }
    setShowForm(true);
  }

  function handleTitleChange(value: string) {
    setForm((prev) => {
      const next = { ...prev, title: value };
      if (!slugTouched) {
        next.slug = slugify(value);
      }
      return next;
    });
  }

  async function savePost(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const isNew = !form.id;

    try {
      const payload = {
        title: form.title.trim(),
        slug: form.slug.trim() || undefined,
        excerpt: form.excerpt.trim(),
        content: form.content,
        coverImage: form.coverImage.trim() || null,
        category: form.category.trim(),
        tags: form.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
        status: form.status,
        locale: form.locale,
        featured: form.featured,
        authorName: form.authorName.trim() || null,
        seoTitle: form.seoTitle.trim() || null,
        seoDescription: form.seoDescription.trim() || null,
        publishedAt: form.publishedAt ? new Date(form.publishedAt).toISOString() : null,
        readingTime:
          Number.isFinite(manualReadingTime) && manualReadingTime > 0
            ? Math.round(manualReadingTime)
            : undefined,
      };

      const endpoint = isNew ? "/api/blog" : `/api/blog/${form.id}`;
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

      await loadPosts();
      setShowForm(false);
      setForm({ ...emptyForm, locale });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  function formatDate(value?: string | null) {
    if (!value) return t("emptyValue");
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
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("filters.searchPlaceholder")}
              className="w-full bg-transparent text-sm text-slate-100 outline-none placeholder:text-slate-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
            className="rounded-xl border border-slate-800/70 bg-slate-950/70 px-3 py-2 text-sm text-slate-200"
          >
            <option value="all">{t("filters.all")}</option>
            <option value="DRAFT">{t("filters.draft")}</option>
            <option value="PUBLISHED">{t("filters.published")}</option>
          </select>
        </div>
      </DashboardCard>

      <DashboardCard>
        <NeonTable
          headers={[
            t("table.title"),
            t("table.status"),
            t("table.locale"),
            t("table.category"),
            t("table.date"),
            t("table.actions"),
          ]}
        >
          {filteredPosts.map((post) => (
            <tr key={post.id} className="hover:bg-slate-900/40">
              <td className="px-4 py-3 text-sm text-slate-100">
                <div className="font-semibold">{post.title}</div>
                <div className="text-xs text-slate-400">{post.slug}</div>
              </td>
              <td className="px-4 py-3 text-sm">
                <span
                  className={`rounded-full px-3 py-1 text-[11px] font-semibold ${
                    post.status === "PUBLISHED"
                      ? "border-emerald-400/60 bg-emerald-500/10 text-emerald-100"
                      : "border-slate-600/60 bg-slate-800/60 text-slate-200"
                  }`}
                >
                  {post.status === "PUBLISHED" ? t("status.published") : t("status.draft")}
                </span>
                {post.featured && (
                  <span className="ml-2 rounded-full border border-cyan-400/60 bg-cyan-500/10 px-2 py-0.5 text-[10px] text-cyan-200">
                    {t("featured")}
                  </span>
                )}
              </td>
              <td className="px-4 py-3 text-sm text-slate-300">{post.locale}</td>
              <td className="px-4 py-3 text-sm text-slate-300">
                {categoryMap[post.category] ?? post.category}
              </td>
              <td className="px-4 py-3 text-sm text-slate-300">
                {formatDate(post.publishedAt ?? post.createdAt)}
              </td>
              <td className="px-4 py-3 text-right">
                <NeonButton variant="ghost" className="px-3 py-1 text-xs" onClick={() => openForm(post)}>
                  {t("edit")}
                </NeonButton>
              </td>
            </tr>
          ))}
          {filteredPosts.length === 0 && (
            <tr>
              <td className="px-4 py-3 text-sm text-slate-400" colSpan={6}>
                {t("empty")}
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
                  {form.title || t("formTitlePlaceholder")}
                </h3>
              </div>
              <NeonButton variant="ghost" onClick={() => setShowForm(false)}>
                {t("close")}
              </NeonButton>
            </div>

            <form className="mt-4 grid gap-6 lg:grid-cols-[1.05fr,0.95fr]" onSubmit={savePost}>
              <div className="space-y-4">
                <div className="grid gap-3 md:grid-cols-2">
                  <label className="flex flex-col gap-1 text-sm text-slate-200">
                    <span>{t("fields.title")}</span>
                    <input
                      required
                      value={form.title}
                      onChange={(e) => handleTitleChange(e.target.value)}
                      className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-slate-100 outline-none focus:border-cyan-400/70"
                    />
                  </label>
                  <label className="flex flex-col gap-1 text-sm text-slate-200">
                    <span>{t("fields.slug")}</span>
                    <input
                      value={form.slug}
                      onChange={(e) => {
                        setSlugTouched(true);
                        setForm((prev) => ({ ...prev, slug: e.target.value }));
                      }}
                      placeholder={t("hints.slugHint")}
                      className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-slate-100 outline-none focus:border-cyan-400/70"
                    />
                    <span className="text-xs text-slate-500">{t("hints.slugHint")}</span>
                  </label>
                </div>

                <label className="flex flex-col gap-1 text-sm text-slate-200">
                  <span>{t("fields.excerpt")}</span>
                  <textarea
                    required
                    value={form.excerpt}
                    rows={3}
                    onChange={(e) => setForm((prev) => ({ ...prev, excerpt: e.target.value }))}
                    className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-slate-100 outline-none focus:border-cyan-400/70"
                  />
                </label>

                <label className="flex flex-col gap-1 text-sm text-slate-200">
                  <span>{t("fields.content")}</span>
                  <textarea
                    required
                    value={form.content}
                    rows={12}
                    onChange={(e) => setForm((prev) => ({ ...prev, content: e.target.value }))}
                    placeholder={t("hints.contentHint")}
                    className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-slate-100 outline-none focus:border-cyan-400/70"
                  />
                  <span className="text-xs text-slate-500">{t("hints.contentHint")}</span>
                </label>

                <div className="grid gap-3 md:grid-cols-2">
                  <label className="flex flex-col gap-1 text-sm text-slate-200">
                    <span>{t("fields.coverImage")}</span>
                    <input
                      value={form.coverImage}
                      onChange={(e) => setForm((prev) => ({ ...prev, coverImage: e.target.value }))}
                      className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-slate-100 outline-none focus:border-cyan-400/70"
                    />
                  </label>
                  <label className="flex flex-col gap-1 text-sm text-slate-200">
                    <span>{t("fields.category")}</span>
                    <input
                      list="blog-categories"
                      value={form.category}
                      onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}
                      required
                      className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-slate-100 outline-none focus:border-cyan-400/70"
                    />
                  </label>
                </div>

                <datalist id="blog-categories">
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.label}
                    </option>
                  ))}
                </datalist>

                <div className="grid gap-3 md:grid-cols-2">
                  <label className="flex flex-col gap-1 text-sm text-slate-200">
                    <span>{t("fields.tags")}</span>
                    <input
                      value={form.tags}
                      onChange={(e) => setForm((prev) => ({ ...prev, tags: e.target.value }))}
                      placeholder={t("hints.tagsHint")}
                      className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-slate-100 outline-none focus:border-cyan-400/70"
                    />
                    <span className="text-xs text-slate-500">{t("hints.tagsHint")}</span>
                  </label>
                  <label className="flex flex-col gap-1 text-sm text-slate-200">
                    <span>{t("fields.locale")}</span>
                    <select
                      value={form.locale}
                      onChange={(e) => setForm((prev) => ({ ...prev, locale: e.target.value }))}
                      className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-slate-100 outline-none focus:border-cyan-400/70"
                    >
                      <option value="en">EN</option>
                      <option value="ar">AR</option>
                      <option value="tr">TR</option>
                    </select>
                  </label>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <label className="flex flex-col gap-1 text-sm text-slate-200">
                    <span>{t("fields.status")}</span>
                    <select
                      value={form.status}
                      onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value as "DRAFT" | "PUBLISHED" }))}
                      className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-slate-100 outline-none focus:border-cyan-400/70"
                    >
                      <option value="DRAFT">{t("status.draft")}</option>
                      <option value="PUBLISHED">{t("status.published")}</option>
                    </select>
                  </label>
                  <label className="flex flex-col gap-1 text-sm text-slate-200">
                    <span>{t("fields.publishedAt")}</span>
                    <input
                      type="datetime-local"
                      value={form.publishedAt}
                      onChange={(e) => setForm((prev) => ({ ...prev, publishedAt: e.target.value }))}
                      className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-slate-100 outline-none focus:border-cyan-400/70"
                    />
                  </label>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <label className="flex flex-col gap-1 text-sm text-slate-200">
                    <span>{t("fields.author")}</span>
                    <input
                      value={form.authorName}
                      onChange={(e) => setForm((prev) => ({ ...prev, authorName: e.target.value }))}
                      className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-slate-100 outline-none focus:border-cyan-400/70"
                    />
                  </label>
                  <label className="flex flex-col gap-1 text-sm text-slate-200">
                    <span>{t("fields.readingTime")}</span>
                    <input
                      type="number"
                      min={1}
                      value={form.readingTimeMinutes}
                      placeholder={String(estimatedReadingTime)}
                      onChange={(e) => setForm((prev) => ({ ...prev, readingTimeMinutes: e.target.value }))}
                      className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-slate-100 outline-none focus:border-cyan-400/70"
                    />
                    <span className="text-xs text-slate-500">{t("hints.readingTimeHint")}</span>
                  </label>
                  <label className="flex flex-col gap-1 text-sm text-slate-200">
                    <span>{t("fields.seoTitle")}</span>
                    <input
                      value={form.seoTitle}
                      onChange={(e) => setForm((prev) => ({ ...prev, seoTitle: e.target.value }))}
                      className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-slate-100 outline-none focus:border-cyan-400/70"
                    />
                  </label>
                </div>

                <label className="flex flex-col gap-1 text-sm text-slate-200">
                  <span>{t("fields.seoDescription")}</span>
                  <textarea
                    value={form.seoDescription}
                    rows={3}
                    onChange={(e) => setForm((prev) => ({ ...prev, seoDescription: e.target.value }))}
                    className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-slate-100 outline-none focus:border-cyan-400/70"
                  />
                </label>

                <label className="inline-flex items-center gap-2 text-sm text-slate-200">
                  <input
                    type="checkbox"
                    checked={form.featured}
                    onChange={(e) => setForm((prev) => ({ ...prev, featured: e.target.checked }))}
                  />
                  {t("fields.featured")}
                </label>

                <div className="flex items-center justify-between gap-3">
                  <div className="text-sm text-slate-400">
                    {t("preview.readingTime")}: {readingTime} | {t("preview.wordCount")}: {wordCount}
                  </div>
                  <NeonButton type="submit" disabled={loading}>
                    {loading ? t("saving") : t("save")}
                  </NeonButton>
                </div>
              </div>

              <div className="space-y-3">
                <div className="rounded-2xl border border-slate-800/70 bg-slate-950/60 p-4">
                  <div className="text-xs uppercase tracking-[0.16em] text-slate-400">
                    {t("preview.title")}
                  </div>
                  {previewBlocks.length === 0 ? (
                    <p className="mt-3 text-sm text-slate-500">{t("preview.empty")}</p>
                  ) : (
                    <div className="mt-3 max-h-[60vh] overflow-y-auto pr-2">
                      <MarkdownBlocks blocks={previewBlocks} />
                    </div>
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
