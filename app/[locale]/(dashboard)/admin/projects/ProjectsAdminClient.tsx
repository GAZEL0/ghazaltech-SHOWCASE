"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { NeonButton } from "@/components/dashboard/NeonButton";
import { NeonTable } from "@/components/dashboard/NeonTable";
import { slugify } from "@/lib/blog";

type PortfolioItem = {
  id: string;
  title: string;
  slug: string;
  description?: string | null;
  fullDescription?: string | null;
  projectType?: string | null;
  category?: string | null;
  concept?: string | null;
  clientGoal?: string | null;
  problem?: string | null;
  solution?: string | null;
  keyFeatures?: string[] | null;
  coverImage?: string | null;
  gallery?: string[] | null;
  videoUrl?: string | null;
  liveUrl?: string | null;
  laptopPreviewImage?: string | null;
  tabletPreviewImage?: string | null;
  mobilePreviewImage?: string | null;
  locale: string;
  isPublished: boolean;
  publishedAt?: string | null;
  projectId?: string | null;
  project?: {
    id: string;
    title: string;
    review?: { rating: number; comment?: string | null; isPublic: boolean } | null;
  } | null;
  createdAt: string;
  updatedAt: string;
};

type ProjectOption = {
  id: string;
  title: string;
  status: string;
};

type FormState = {
  id: string;
  title: string;
  slug: string;
  description: string;
  fullDescription: string;
  projectType: string;
  category: string;
  concept: string;
  clientGoal: string;
  problem: string;
  solution: string;
  keyFeatures: string;
  coverImage: string;
  gallery: string;
  videoUrl: string;
  liveUrl: string;
  laptopPreviewImage: string;
  tabletPreviewImage: string;
  mobilePreviewImage: string;
  locale: string;
  isPublished: boolean;
  publishedAt: string;
  projectId: string;
  reviewVisibility: boolean;
};

const emptyForm: FormState = {
  id: "",
  title: "",
  slug: "",
  description: "",
  fullDescription: "",
  projectType: "",
  category: "",
  concept: "",
  clientGoal: "",
  problem: "",
  solution: "",
  keyFeatures: "",
  coverImage: "",
  gallery: "",
  videoUrl: "",
  liveUrl: "",
  laptopPreviewImage: "",
  tabletPreviewImage: "",
  mobilePreviewImage: "",
  locale: "en",
  isPublished: false,
  publishedAt: "",
  projectId: "",
  reviewVisibility: false,
};

function toInputDate(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 16);
}

function listToText(list?: string[] | null) {
  if (!list || list.length === 0) return "";
  return list.join("\n");
}

function textToList(value: string) {
  return value
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);
}

export function ProjectsAdminClient({ locale }: { locale: string }) {
  const t = useTranslations("projectsAdmin");
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [projects, setProjects] = useState<ProjectOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "draft" | "published">("all");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormState>({ ...emptyForm, locale });
  const [slugTouched, setSlugTouched] = useState(false);
  const [reviewInfo, setReviewInfo] = useState<{ rating: number; comment?: string | null } | null>(null);
  const [previewUploading, setPreviewUploading] = useState(false);

  const loadItems = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/portfolio?includeDraft=1", { cache: "no-store" });
      if (!res.ok) throw new Error(t("errors.load"));
      const data = (await res.json()) as PortfolioItem[];
      setItems(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [t]);

  const loadProjects = useCallback(async () => {
    try {
      const res = await fetch("/api/projects", { cache: "no-store" });
      if (!res.ok) return;
      const data = (await res.json()) as ProjectOption[];
      setProjects(data);
    } catch {
      setProjects([]);
    }
  }, []);

  useEffect(() => {
    void loadItems();
    void loadProjects();
  }, [loadItems, loadProjects]);

  async function loadProjectReview(projectId: string) {
    if (!projectId) {
      setReviewInfo(null);
      setForm((prev) => ({ ...prev, reviewVisibility: false }));
      return;
    }
    try {
      const res = await fetch(`/api/projects/${projectId}`, { cache: "no-store" });
      if (!res.ok) {
        setReviewInfo(null);
        return;
      }
      const data = (await res.json()) as { review?: { rating: number; comment?: string | null; isPublic: boolean } | null };
      if (data.review) {
        setReviewInfo({ rating: data.review.rating, comment: data.review.comment ?? null });
        setForm((prev) => ({ ...prev, reviewVisibility: data.review?.isPublic ?? false }));
      } else {
        setReviewInfo(null);
        setForm((prev) => ({ ...prev, reviewVisibility: false }));
      }
    } catch {
      setReviewInfo(null);
    }
  }

  const filteredItems = useMemo(() => {
    const value = query.trim().toLowerCase();
    return items.filter((item) => {
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "published" ? item.isPublished : !item.isPublished);
      const matchesQuery = value
        ? `${item.title} ${item.slug} ${item.projectType ?? ""} ${item.project?.title ?? ""}`
            .toLowerCase()
            .includes(value)
        : true;
      return matchesStatus && matchesQuery;
    });
  }, [items, query, statusFilter]);

  function openForm(item?: PortfolioItem) {
    if (item) {
      setForm({
        id: item.id,
        title: item.title,
        slug: item.slug,
        description: item.description ?? "",
        fullDescription: item.fullDescription ?? "",
        projectType: item.projectType ?? "",
        category: item.category ?? "",
        concept: item.concept ?? "",
        clientGoal: item.clientGoal ?? "",
        problem: item.problem ?? "",
        solution: item.solution ?? "",
        keyFeatures: listToText(item.keyFeatures),
        coverImage: item.coverImage ?? "",
        gallery: listToText(item.gallery),
        videoUrl: item.videoUrl ?? "",
        liveUrl: item.liveUrl ?? "",
        laptopPreviewImage: item.laptopPreviewImage ?? "",
        tabletPreviewImage: item.tabletPreviewImage ?? "",
        mobilePreviewImage: item.mobilePreviewImage ?? "",
        locale: item.locale ?? locale,
        isPublished: item.isPublished,
        publishedAt: toInputDate(item.publishedAt),
        projectId: item.projectId ?? "",
        reviewVisibility: item.project?.review?.isPublic ?? false,
      });
      setReviewInfo(item.project?.review ?? null);
      setSlugTouched(true);
    } else {
      setForm({ ...emptyForm, locale });
      setReviewInfo(null);
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
        description: form.description.trim(),
        fullDescription: form.fullDescription.trim(),
        projectType: form.projectType.trim(),
        category: form.category.trim(),
        concept: form.concept.trim(),
        clientGoal: form.clientGoal.trim(),
        problem: form.problem.trim(),
        solution: form.solution.trim(),
        keyFeatures: textToList(form.keyFeatures),
        coverImage: form.coverImage.trim(),
        gallery: textToList(form.gallery),
        videoUrl: form.videoUrl.trim(),
        liveUrl: form.liveUrl.trim(),
        laptopPreviewImage: form.laptopPreviewImage.trim(),
        tabletPreviewImage: form.tabletPreviewImage.trim(),
        mobilePreviewImage: form.mobilePreviewImage.trim(),
        locale: form.locale,
        isPublished: form.isPublished,
        publishedAt: form.publishedAt ? new Date(form.publishedAt).toISOString() : null,
        projectId: form.projectId || null,
        reviewVisibility: reviewInfo ? form.reviewVisibility : undefined,
      };

      const endpoint = isNew ? "/api/portfolio" : `/api/portfolio/${form.id}`;
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
      setReviewInfo(null);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  async function uploadPortfolioAsset(
    target: "laptopPreviewImage" | "tabletPreviewImage" | "mobilePreviewImage" | "videoUrl",
    file?: File,
  ) {
    if (!file) return;
    setPreviewUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("title", form.title || "Project preview");
      const res = await fetch("/api/portfolio/upload", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || t("errors.save"));
      }
      const data = (await res.json()) as { url: string };
      setForm((prev) => ({ ...prev, [target]: data.url }));
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setPreviewUploading(false);
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
            <option value="draft">{t("filters.draft")}</option>
            <option value="published">{t("filters.published")}</option>
          </select>
        </div>
      </DashboardCard>

      <DashboardCard>
        <NeonTable
          headers={[
            t("table.title"),
            t("table.type"),
            t("table.status"),
            t("table.locale"),
            t("table.linkedProject"),
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
              <td className="px-4 py-3 text-sm text-slate-300">{item.projectType ?? t("emptyValue")}</td>
              <td className="px-4 py-3 text-sm">
                <span
                  className={`rounded-full px-3 py-1 text-[11px] font-semibold ${
                    item.isPublished
                      ? "border-emerald-400/60 bg-emerald-500/10 text-emerald-100"
                      : "border-slate-600/60 bg-slate-800/60 text-slate-200"
                  }`}
                >
                  {item.isPublished ? t("status.published") : t("status.draft")}
                </span>
              </td>
              <td className="px-4 py-3 text-sm text-slate-300">{item.locale}</td>
              <td className="px-4 py-3 text-sm text-slate-300">
                {item.project?.title ?? t("table.unlinked")}
              </td>
              <td className="px-4 py-3 text-sm text-slate-300">
                {formatDate(item.publishedAt ?? item.updatedAt)}
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
                <h3 className="text-xl font-bold text-slate-50">{form.title || t("formTitlePlaceholder")}</h3>
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

                <label className="flex flex-col gap-1 text-sm text-slate-200">
                  <span>{t("fields.projectId")}</span>
                  <select
                    value={form.projectId}
                    onChange={(e) => {
                      const next = e.target.value;
                      setForm((prev) => ({ ...prev, projectId: next }));
                      void loadProjectReview(next);
                    }}
                    className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-slate-100 outline-none focus:border-cyan-400/70"
                  >
                    <option value="">{t("fields.projectIdEmpty")}</option>
                    {projects.map((project) => (
                      <option key={project.id} value={project.id}>
                        {project.title} ({project.status})
                      </option>
                    ))}
                  </select>
                </label>

                <div className="grid gap-3 md:grid-cols-2">
                  <label className="flex flex-col gap-1 text-sm text-slate-200">
                    <span>{t("fields.projectType")}</span>
                    <input
                      value={form.projectType}
                      onChange={(e) => setForm((prev) => ({ ...prev, projectType: e.target.value }))}
                      className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-slate-100 outline-none focus:border-cyan-400/70"
                    />
                  </label>
                  <label className="flex flex-col gap-1 text-sm text-slate-200">
                    <span>{t("fields.category")}</span>
                    <input
                      value={form.category}
                      onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}
                      className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-slate-100 outline-none focus:border-cyan-400/70"
                    />
                  </label>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <label className="flex flex-col gap-1 text-sm text-slate-200">
                    <span>{t("fields.concept")}</span>
                    <input
                      value={form.concept}
                      onChange={(e) => setForm((prev) => ({ ...prev, concept: e.target.value }))}
                      className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-slate-100 outline-none focus:border-cyan-400/70"
                    />
                  </label>
                  <label className="flex flex-col gap-1 text-sm text-slate-200">
                    <span>{t("fields.clientGoal")}</span>
                    <input
                      value={form.clientGoal}
                      onChange={(e) => setForm((prev) => ({ ...prev, clientGoal: e.target.value }))}
                      className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-slate-100 outline-none focus:border-cyan-400/70"
                    />
                  </label>
                </div>

                <label className="flex flex-col gap-1 text-sm text-slate-200">
                  <span>{t("fields.shortDescription")}</span>
                  <textarea
                    value={form.description}
                    rows={2}
                    onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                    className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-slate-100 outline-none focus:border-cyan-400/70"
                  />
                </label>

                <label className="flex flex-col gap-1 text-sm text-slate-200">
                  <span>{t("fields.fullDescription")}</span>
                  <textarea
                    value={form.fullDescription}
                    rows={4}
                    onChange={(e) => setForm((prev) => ({ ...prev, fullDescription: e.target.value }))}
                    className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-slate-100 outline-none focus:border-cyan-400/70"
                  />
                </label>

                <label className="flex flex-col gap-1 text-sm text-slate-200">
                  <span>{t("fields.problem")}</span>
                  <textarea
                    value={form.problem}
                    rows={3}
                    onChange={(e) => setForm((prev) => ({ ...prev, problem: e.target.value }))}
                    className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-slate-100 outline-none focus:border-cyan-400/70"
                  />
                </label>

                <label className="flex flex-col gap-1 text-sm text-slate-200">
                  <span>{t("fields.solution")}</span>
                  <textarea
                    value={form.solution}
                    rows={3}
                    onChange={(e) => setForm((prev) => ({ ...prev, solution: e.target.value }))}
                    className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-slate-100 outline-none focus:border-cyan-400/70"
                  />
                </label>

                <label className="flex flex-col gap-1 text-sm text-slate-200">
                  <span>{t("fields.keyFeatures")}</span>
                  <textarea
                    value={form.keyFeatures}
                    rows={3}
                    onChange={(e) => setForm((prev) => ({ ...prev, keyFeatures: e.target.value }))}
                    placeholder={t("hints.featuresHint")}
                    className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-slate-100 outline-none focus:border-cyan-400/70"
                  />
                  <span className="text-xs text-slate-500">{t("hints.featuresHint")}</span>
                </label>

                <label className="flex flex-col gap-1 text-sm text-slate-200">
                  <span>{t("fields.coverImage")}</span>
                  <input
                    value={form.coverImage}
                    onChange={(e) => setForm((prev) => ({ ...prev, coverImage: e.target.value }))}
                    className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-slate-100 outline-none focus:border-cyan-400/70"
                  />
                </label>

                <div className="grid gap-3 md:grid-cols-2">
                  <div className="flex flex-col gap-1 text-sm text-slate-200">
                    <span>{t("fields.laptopPreviewImage")}</span>
                    <div className="flex gap-2">
                      <input
                        value={form.laptopPreviewImage}
                        onChange={(e) => setForm((prev) => ({ ...prev, laptopPreviewImage: e.target.value }))}
                        className="flex-1 rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-slate-100 outline-none focus:border-cyan-400/70"
                      />
                      <label className="inline-flex cursor-pointer items-center rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs font-semibold text-slate-200">
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) =>
                            uploadPortfolioAsset("laptopPreviewImage", e.target.files?.[0] ?? undefined)
                          }
                          disabled={previewUploading}
                        />
                        {previewUploading ? t("uploading") : t("upload")}
                      </label>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1 text-sm text-slate-200">
                    <span>{t("fields.tabletPreviewImage")}</span>
                    <div className="flex gap-2">
                      <input
                        value={form.tabletPreviewImage}
                        onChange={(e) => setForm((prev) => ({ ...prev, tabletPreviewImage: e.target.value }))}
                        className="flex-1 rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-slate-100 outline-none focus:border-cyan-400/70"
                      />
                      <label className="inline-flex cursor-pointer items-center rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs font-semibold text-slate-200">
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) =>
                            uploadPortfolioAsset("tabletPreviewImage", e.target.files?.[0] ?? undefined)
                          }
                          disabled={previewUploading}
                        />
                        {previewUploading ? t("uploading") : t("upload")}
                      </label>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1 text-sm text-slate-200">
                    <span>{t("fields.mobilePreviewImage")}</span>
                    <div className="flex gap-2">
                      <input
                        value={form.mobilePreviewImage}
                        onChange={(e) => setForm((prev) => ({ ...prev, mobilePreviewImage: e.target.value }))}
                        className="flex-1 rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-slate-100 outline-none focus:border-cyan-400/70"
                      />
                      <label className="inline-flex cursor-pointer items-center rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs font-semibold text-slate-200">
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) =>
                            uploadPortfolioAsset("mobilePreviewImage", e.target.files?.[0] ?? undefined)
                          }
                          disabled={previewUploading}
                        />
                        {previewUploading ? t("uploading") : t("upload")}
                      </label>
                    </div>
                  </div>
                </div>

                <label className="flex flex-col gap-1 text-sm text-slate-200">
                  <span>{t("fields.gallery")}</span>
                  <textarea
                    value={form.gallery}
                    rows={4}
                    onChange={(e) => setForm((prev) => ({ ...prev, gallery: e.target.value }))}
                    placeholder={t("hints.galleryHint")}
                    className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-slate-100 outline-none focus:border-cyan-400/70"
                  />
                  <span className="text-xs text-slate-500">{t("hints.galleryHint")}</span>
                </label>

                <div className="grid gap-3 md:grid-cols-2">
                  <div className="flex flex-col gap-1 text-sm text-slate-200">
                    <span>{t("fields.videoUrl")}</span>
                    <div className="flex gap-2">
                      <input
                        value={form.videoUrl}
                        onChange={(e) => setForm((prev) => ({ ...prev, videoUrl: e.target.value }))}
                        className="flex-1 rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-slate-100 outline-none focus:border-cyan-400/70"
                      />
                      <label className="inline-flex cursor-pointer items-center rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs font-semibold text-slate-200">
                        <input
                          type="file"
                          accept="video/*"
                          className="hidden"
                          onChange={(e) => uploadPortfolioAsset("videoUrl", e.target.files?.[0] ?? undefined)}
                          disabled={previewUploading}
                        />
                        {previewUploading ? t("uploading") : t("upload")}
                      </label>
                    </div>
                  </div>
                  <label className="flex flex-col gap-1 text-sm text-slate-200">
                    <span>{t("fields.liveUrl")}</span>
                    <input
                      value={form.liveUrl}
                      onChange={(e) => setForm((prev) => ({ ...prev, liveUrl: e.target.value }))}
                      className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-slate-100 outline-none focus:border-cyan-400/70"
                    />
                  </label>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <label className="flex flex-col gap-1 text-sm text-slate-200">
                    <span>{t("fields.status")}</span>
                    <select
                      value={form.isPublished ? "published" : "draft"}
                      onChange={(e) => setForm((prev) => ({ ...prev, isPublished: e.target.value === "published" }))}
                      className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-slate-100 outline-none focus:border-cyan-400/70"
                    >
                      <option value="draft">{t("status.draft")}</option>
                      <option value="published">{t("status.published")}</option>
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
                  <label className="flex flex-col gap-1 text-sm text-slate-200">
                    <span>{t("fields.reviewVisibility")}</span>
                    <div className="flex items-center gap-2 text-sm text-slate-200">
                      <input
                        type="checkbox"
                        checked={form.reviewVisibility}
                        disabled={!reviewInfo}
                        onChange={(e) => setForm((prev) => ({ ...prev, reviewVisibility: e.target.checked }))}
                      />
                      <span>{t("review.showToggle")}</span>
                    </div>
                  </label>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <div className="text-xs text-slate-500">{t("review.note")}</div>
                  <NeonButton type="submit" disabled={loading}>
                    {loading ? t("saving") : t("save")}
                  </NeonButton>
                </div>
              </div>

              <div className="space-y-4">
                <div className="rounded-2xl border border-slate-800/70 bg-slate-950/60 p-4 text-sm text-slate-300">
                  <div className="text-xs uppercase tracking-[0.16em] text-slate-400">{t("preview.title")}</div>
                  <div className="mt-3 space-y-2">
                    <div className="text-slate-100">{form.title || t("formTitlePlaceholder")}</div>
                    <div className="text-xs text-slate-500">{form.projectType || t("preview.placeholder")}</div>
                    <div className="text-xs text-slate-400">{form.description || t("preview.placeholder")}</div>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-800/70 bg-slate-950/60 p-4 text-sm text-slate-300">
                  <div className="text-xs uppercase tracking-[0.16em] text-slate-400">{t("review.title")}</div>
                  {reviewInfo ? (
                    <div className="mt-3 space-y-2">
                      <div className="text-sm text-slate-100">
                        {t("review.rating", { rating: reviewInfo.rating })}
                      </div>
                      {reviewInfo.comment && (
                        <div className="text-xs text-slate-400">
                          &quot;{reviewInfo.comment}&quot;
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="mt-3 text-xs text-slate-500">{t("review.empty")}</div>
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
