"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { NeonButton } from "@/components/dashboard/NeonButton";
import { NeonTable } from "@/components/dashboard/NeonTable";
import { slugify } from "@/lib/blog";

type CaseStudy = {
  id: string;
  title: string;
  slug: string;
  clientName: string;
  projectType: string;
  industry?: string | null;
  duration?: string | null;
  technologies: string[];
  coverImage?: string | null;
  challengeSummary: string;
  primaryResult: string;
  challenge: string;
  solution: string;
  implementation: string;
  results?: { label?: string; value?: string; note?: string }[] | null;
  testimonial?: string | null;
  status: "DRAFT" | "PUBLISHED";
  locale: string;
  featured: boolean;
  publishedAt?: string | null;
  createdAt: string;
  updatedAt: string;
};

type CaseStudyFormState = {
  id: string;
  title: string;
  slug: string;
  clientName: string;
  projectType: string;
  industry: string;
  duration: string;
  technologies: string;
  coverImage: string;
  challengeSummary: string;
  primaryResult: string;
  challenge: string;
  solution: string;
  implementation: string;
  results: string;
  testimonial: string;
  status: "DRAFT" | "PUBLISHED";
  locale: string;
  featured: boolean;
  publishedAt: string;
};

const emptyForm: CaseStudyFormState = {
  id: "",
  title: "",
  slug: "",
  clientName: "",
  projectType: "",
  industry: "",
  duration: "",
  technologies: "",
  coverImage: "",
  challengeSummary: "",
  primaryResult: "",
  challenge: "",
  solution: "",
  implementation: "",
  results: "",
  testimonial: "",
  status: "DRAFT",
  locale: "en",
  featured: false,
  publishedAt: "",
};

function toInputDate(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 16);
}

function formatResults(results?: { label?: string; value?: string; note?: string }[] | null) {
  if (!results || results.length === 0) return "";
  return results
    .map((item) => [item.label, item.value, item.note].filter(Boolean).join(" | "))
    .join("\n");
}

function parseResults(text: string) {
  return text
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const parts = line.split("|").map((part) => part.trim());
      return {
        label: parts[0] ?? "",
        value: parts[1] ?? "",
        note: parts[2] ?? "",
      };
    })
    .filter((item) => item.label || item.value || item.note);
}

export function CaseStudiesAdminClient({ locale }: { locale: string }) {
  const t = useTranslations("caseStudiesAdmin");
  const [items, setItems] = useState<CaseStudy[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "DRAFT" | "PUBLISHED">("all");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<CaseStudyFormState>({ ...emptyForm, locale });
  const [slugTouched, setSlugTouched] = useState(false);

  const loadItems = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/case-studies?includeDraft=true", { cache: "no-store" });
      if (!res.ok) throw new Error(t("errors.load"));
      const data = (await res.json()) as CaseStudy[];
      setItems(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    void loadItems();
  }, [loadItems]);

  const filteredItems = useMemo(() => {
    const value = query.trim().toLowerCase();
    return items.filter((item) => {
      const matchesStatus = statusFilter === "all" || item.status === statusFilter;
      const matchesQuery = value
        ? `${item.title} ${item.clientName} ${item.projectType} ${item.slug}`.toLowerCase().includes(value)
        : true;
      return matchesStatus && matchesQuery;
    });
  }, [items, query, statusFilter]);

  function openForm(item?: CaseStudy) {
    if (item) {
      setForm({
        id: item.id,
        title: item.title,
        slug: item.slug,
        clientName: item.clientName,
        projectType: item.projectType,
        industry: item.industry ?? "",
        duration: item.duration ?? "",
        technologies: item.technologies.join(", "),
        coverImage: item.coverImage ?? "",
        challengeSummary: item.challengeSummary,
        primaryResult: item.primaryResult,
        challenge: item.challenge,
        solution: item.solution,
        implementation: item.implementation,
        results: formatResults(item.results),
        testimonial: item.testimonial ?? "",
        status: item.status,
        locale: item.locale,
        featured: item.featured,
        publishedAt: toInputDate(item.publishedAt),
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

  async function saveItem(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const isNew = !form.id;

    try {
      const payload = {
        title: form.title.trim(),
        slug: form.slug.trim() || undefined,
        clientName: form.clientName.trim(),
        projectType: form.projectType.trim(),
        industry: form.industry.trim() || null,
        duration: form.duration.trim() || null,
        technologies: form.technologies
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
        coverImage: form.coverImage.trim() || null,
        challengeSummary: form.challengeSummary.trim(),
        primaryResult: form.primaryResult.trim(),
        challenge: form.challenge.trim(),
        solution: form.solution.trim(),
        implementation: form.implementation.trim(),
        results: parseResults(form.results),
        testimonial: form.testimonial.trim() || null,
        status: form.status,
        locale: form.locale,
        featured: form.featured,
        publishedAt: form.publishedAt ? new Date(form.publishedAt).toISOString() : null,
      };

      const endpoint = isNew ? "/api/case-studies" : `/api/case-studies/${form.id}`;
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

      await loadItems();
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
            t("table.client"),
            t("table.type"),
            t("table.status"),
            t("table.locale"),
            t("table.date"),
            t("table.actions"),
          ]}
        >
          {filteredItems.map((item) => (
            <tr key={item.id} className="hover:bg-slate-900/40">
              <td className="px-4 py-3 text-sm text-slate-100">
                <div className="font-semibold">{item.title}</div>
                <div className="text-xs text-slate-400">{item.slug}</div>
              </td>
              <td className="px-4 py-3 text-sm text-slate-300">{item.clientName}</td>
              <td className="px-4 py-3 text-sm text-slate-300">{item.projectType}</td>
              <td className="px-4 py-3 text-sm">
                <span
                  className={`rounded-full px-3 py-1 text-[11px] font-semibold ${
                    item.status === "PUBLISHED"
                      ? "border-emerald-400/60 bg-emerald-500/10 text-emerald-100"
                      : "border-slate-600/60 bg-slate-800/60 text-slate-200"
                  }`}
                >
                  {item.status === "PUBLISHED" ? t("status.published") : t("status.draft")}
                </span>
                {item.featured && (
                  <span className="ml-2 rounded-full border border-cyan-400/60 bg-cyan-500/10 px-2 py-0.5 text-[10px] text-cyan-200">
                    {t("featured")}
                  </span>
                )}
              </td>
              <td className="px-4 py-3 text-sm text-slate-300">{item.locale}</td>
              <td className="px-4 py-3 text-sm text-slate-300">
                {formatDate(item.publishedAt ?? item.createdAt)}
              </td>
              <td className="px-4 py-3 text-right">
                <NeonButton variant="ghost" className="px-3 py-1 text-xs" onClick={() => openForm(item)}>
                  {t("edit")}
                </NeonButton>
              </td>
            </tr>
          ))}
          {filteredItems.length === 0 && (
            <tr>
              <td className="px-4 py-3 text-sm text-slate-400" colSpan={7}>
                {t("empty")}
              </td>
            </tr>
          )}
        </NeonTable>
      </DashboardCard>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="max-h-[92vh] w-full max-w-6xl overflow-y-auto rounded-2xl border border-slate-800/70 bg-[#050b18] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.6)]">
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

            <form className="mt-4 grid gap-6 lg:grid-cols-[1.05fr,0.95fr]" onSubmit={saveItem}>
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

                <div className="grid gap-3 md:grid-cols-2">
                  <label className="flex flex-col gap-1 text-sm text-slate-200">
                    <span>{t("fields.clientName")}</span>
                    <input
                      required
                      value={form.clientName}
                      onChange={(e) => setForm((prev) => ({ ...prev, clientName: e.target.value }))}
                      className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-slate-100 outline-none focus:border-cyan-400/70"
                    />
                  </label>
                  <label className="flex flex-col gap-1 text-sm text-slate-200">
                    <span>{t("fields.projectType")}</span>
                    <input
                      required
                      value={form.projectType}
                      onChange={(e) => setForm((prev) => ({ ...prev, projectType: e.target.value }))}
                      className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-slate-100 outline-none focus:border-cyan-400/70"
                    />
                  </label>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <label className="flex flex-col gap-1 text-sm text-slate-200">
                    <span>{t("fields.industry")}</span>
                    <input
                      value={form.industry}
                      onChange={(e) => setForm((prev) => ({ ...prev, industry: e.target.value }))}
                      className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-slate-100 outline-none focus:border-cyan-400/70"
                    />
                  </label>
                  <label className="flex flex-col gap-1 text-sm text-slate-200">
                    <span>{t("fields.duration")}</span>
                    <input
                      value={form.duration}
                      onChange={(e) => setForm((prev) => ({ ...prev, duration: e.target.value }))}
                      className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-slate-100 outline-none focus:border-cyan-400/70"
                    />
                  </label>
                </div>

                <label className="flex flex-col gap-1 text-sm text-slate-200">
                  <span>{t("fields.coverImage")}</span>
                  <input
                    value={form.coverImage}
                    onChange={(e) => setForm((prev) => ({ ...prev, coverImage: e.target.value }))}
                    className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-slate-100 outline-none focus:border-cyan-400/70"
                  />
                </label>

                <div className="grid gap-3 md:grid-cols-2">
                  <label className="flex flex-col gap-1 text-sm text-slate-200">
                    <span>{t("fields.challengeSummary")}</span>
                    <textarea
                      required
                      value={form.challengeSummary}
                      rows={3}
                      onChange={(e) => setForm((prev) => ({ ...prev, challengeSummary: e.target.value }))}
                      className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-slate-100 outline-none focus:border-cyan-400/70"
                    />
                  </label>
                  <label className="flex flex-col gap-1 text-sm text-slate-200">
                    <span>{t("fields.primaryResult")}</span>
                    <input
                      required
                      value={form.primaryResult}
                      onChange={(e) => setForm((prev) => ({ ...prev, primaryResult: e.target.value }))}
                      className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-slate-100 outline-none focus:border-cyan-400/70"
                    />
                  </label>
                </div>

                <label className="flex flex-col gap-1 text-sm text-slate-200">
                  <span>{t("fields.challenge")}</span>
                  <textarea
                    required
                    value={form.challenge}
                    rows={4}
                    onChange={(e) => setForm((prev) => ({ ...prev, challenge: e.target.value }))}
                    className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-slate-100 outline-none focus:border-cyan-400/70"
                  />
                </label>

                <label className="flex flex-col gap-1 text-sm text-slate-200">
                  <span>{t("fields.solution")}</span>
                  <textarea
                    required
                    value={form.solution}
                    rows={4}
                    onChange={(e) => setForm((prev) => ({ ...prev, solution: e.target.value }))}
                    className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-slate-100 outline-none focus:border-cyan-400/70"
                  />
                </label>

                <label className="flex flex-col gap-1 text-sm text-slate-200">
                  <span>{t("fields.implementation")}</span>
                  <textarea
                    required
                    value={form.implementation}
                    rows={4}
                    onChange={(e) => setForm((prev) => ({ ...prev, implementation: e.target.value }))}
                    className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-slate-100 outline-none focus:border-cyan-400/70"
                  />
                </label>

                <label className="flex flex-col gap-1 text-sm text-slate-200">
                  <span>{t("fields.results")}</span>
                  <textarea
                    value={form.results}
                    rows={4}
                    onChange={(e) => setForm((prev) => ({ ...prev, results: e.target.value }))}
                    placeholder={t("hints.resultsHint")}
                    className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-slate-100 outline-none focus:border-cyan-400/70"
                  />
                  <span className="text-xs text-slate-500">{t("hints.resultsHint")}</span>
                </label>

                <label className="flex flex-col gap-1 text-sm text-slate-200">
                  <span>{t("fields.technologies")}</span>
                  <input
                    value={form.technologies}
                    onChange={(e) => setForm((prev) => ({ ...prev, technologies: e.target.value }))}
                    placeholder={t("hints.technologiesHint")}
                    className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-slate-100 outline-none focus:border-cyan-400/70"
                  />
                </label>

                <label className="flex flex-col gap-1 text-sm text-slate-200">
                  <span>{t("fields.testimonial")}</span>
                  <textarea
                    value={form.testimonial}
                    rows={3}
                    onChange={(e) => setForm((prev) => ({ ...prev, testimonial: e.target.value }))}
                    className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-slate-100 outline-none focus:border-cyan-400/70"
                  />
                </label>

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
                  <label className="inline-flex items-center gap-2 text-sm text-slate-200">
                    <input
                      type="checkbox"
                      checked={form.featured}
                      onChange={(e) => setForm((prev) => ({ ...prev, featured: e.target.checked }))}
                    />
                    {t("fields.featured")}
                  </label>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <div className="text-xs text-slate-500">
                    {t("hints.resultsHint")}
                  </div>
                  <NeonButton type="submit" disabled={loading}>
                    {loading ? t("saving") : t("save")}
                  </NeonButton>
                </div>
              </div>

              <div className="space-y-4">
                <div className="rounded-2xl border border-slate-800/70 bg-slate-950/60 p-4 text-sm text-slate-300">
                  <div className="text-xs uppercase tracking-[0.16em] text-slate-400">
                    {t("preview.title")}
                  </div>
                  <div className="mt-3 space-y-2">
                    <div className="text-slate-100">{form.title || t("formTitlePlaceholder")}</div>
                    <div className="text-xs text-slate-500">{form.clientName}</div>
                    <div className="text-xs text-slate-400">{form.primaryResult}</div>
                    <div className="text-xs text-slate-500">{form.projectType}</div>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
