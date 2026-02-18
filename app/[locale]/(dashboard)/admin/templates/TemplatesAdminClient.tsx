"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { NeonButton } from "@/components/dashboard/NeonButton";
import { NeonTable } from "@/components/dashboard/NeonTable";

type TemplateMedia = {
  id: string;
  url: string;
  label?: string | null;
};

type TemplateSite = {
  id: string;
  title: string;
  slug: string;
  category?: string | null;
  shortDescription?: string | null;
  longDescription?: string | null;
  basePrice: number;
  currency: string;
  demoUrl?: string | null;
  thumbUrl?: string | null;
  laptopPreviewImage?: string | null;
  tabletPreviewImage?: string | null;
  mobilePreviewImage?: string | null;
  isActive: boolean;
  serviceId: string;
  serviceTitle?: string;
  gallery?: TemplateMedia[];
};

type Service = {
  id: string;
  title: string;
  priceBase: number;
  isActive: boolean;
};

const emptyForm = {
  id: "",
  title: "",
  slug: "",
  category: "",
  shortDescription: "",
  longDescription: "",
  basePrice: 0,
  currency: "USD",
  demoUrl: "",
  thumbUrl: "",
  laptopPreviewImage: "",
  tabletPreviewImage: "",
  mobilePreviewImage: "",
  isActive: true,
  serviceId: "",
};

export function TemplatesAdminClient({ locale }: { locale: string }) {
  const t = useTranslations("templatesAdmin");
  const [templates, setTemplates] = useState<TemplateSite[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [showForm, setShowForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewUploading, setPreviewUploading] = useState(false);

  const serviceLookup = useMemo(
    () => Object.fromEntries(services.map((s) => [s.id, s.title])),
    [services],
  );

  const loadTemplates = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/templates?includeInactive=true", { cache: "no-store" });
      if (!res.ok) throw new Error(t("errors.loadTemplates"));
      const data = (await res.json()) as TemplateSite[];
      setTemplates(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [t]);

  const loadServices = useCallback(async () => {
    try {
      const res = await fetch("/api/services?includeInactive=true", { cache: "no-store" });
      if (!res.ok) throw new Error(t("errors.loadServices"));
      const data = (await res.json()) as Service[];
      setServices(data);
      setForm((prev) => {
        if (prev.serviceId || !data[0]) return prev;
        return { ...prev, serviceId: data[0].id };
      });
    } catch (err) {
      setError((err as Error).message);
    }
  }, [t]);

  useEffect(() => {
    void loadServices();
    void loadTemplates();
  }, [loadServices, loadTemplates]);

  function openForm(template?: TemplateSite) {
    if (template) {
      setForm({
        id: template.id,
        title: template.title,
        slug: template.slug,
        category: template.category ?? "",
        shortDescription: template.shortDescription ?? "",
        longDescription: template.longDescription ?? "",
        basePrice: template.basePrice,
        currency: template.currency,
        demoUrl: template.demoUrl ?? "",
        thumbUrl: template.thumbUrl ?? "",
        laptopPreviewImage: template.laptopPreviewImage ?? "",
        tabletPreviewImage: template.tabletPreviewImage ?? "",
        mobilePreviewImage: template.mobilePreviewImage ?? "",
        isActive: template.isActive,
        serviceId: template.serviceId,
      });
    } else {
      setForm({ ...emptyForm, serviceId: services[0]?.id ?? "" });
    }
    setShowForm(true);
  }

  async function saveTemplate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const isNew = !form.id;
    try {
      const payload = {
        serviceId: form.serviceId,
        title: form.title,
        slug: form.slug,
        category: form.category || null,
        shortDescription: form.shortDescription || null,
        longDescription: form.longDescription || null,
        basePrice: Number(form.basePrice),
        currency: form.currency || "USD",
        demoUrl: form.demoUrl || null,
        thumbUrl: form.thumbUrl || null,
        laptopPreviewImage: form.laptopPreviewImage || null,
        tabletPreviewImage: form.tabletPreviewImage || null,
        mobilePreviewImage: form.mobilePreviewImage || null,
        isActive: form.isActive,
      };

      const endpoint = form.id ? `/api/templates/${form.id}` : "/api/templates";
      const method = form.id ? "PATCH" : "POST";

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || t("errors.saveTemplate"));
      }

      const saved = (await res.json()) as TemplateSite;
      await loadTemplates();
      if (isNew) {
        setForm({
          id: saved.id,
          title: saved.title,
          slug: saved.slug,
          category: saved.category ?? "",
          shortDescription: saved.shortDescription ?? "",
          longDescription: saved.longDescription ?? "",
          basePrice: saved.basePrice,
          currency: saved.currency,
          demoUrl: saved.demoUrl ?? "",
          thumbUrl: saved.thumbUrl ?? "",
          laptopPreviewImage: saved.laptopPreviewImage ?? "",
          tabletPreviewImage: saved.tabletPreviewImage ?? "",
          mobilePreviewImage: saved.mobilePreviewImage ?? "",
          isActive: saved.isActive,
          serviceId: saved.serviceId,
        });
      } else {
        setShowForm(false);
        setForm({ ...emptyForm, serviceId: services[0]?.id ?? "" });
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  async function toggleActive(template: TemplateSite) {
    setLoading(true);
    try {
      await fetch(`/api/templates/${template.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !template.isActive }),
      });
      await loadTemplates();
    } finally {
      setLoading(false);
    }
  }

  async function uploadMedia(templateId: string, file?: File, label?: string) {
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      if (label) formData.append("label", label);
      const res = await fetch(`/api/templates/${templateId}/media`, {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || t("errors.uploadMedia"));
      }
      await loadTemplates();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setUploading(false);
    }
  }

  async function uploadPreviewImage(
    target: "laptopPreviewImage" | "tabletPreviewImage" | "mobilePreviewImage",
    file?: File,
  ) {
    if (!file) return;
    setPreviewUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/templates/upload", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || t("errors.uploadMedia"));
      }
      const data = (await res.json()) as { url: string };
      setForm((prev) => ({ ...prev, [target]: data.url }));
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setPreviewUploading(false);
    }
  }

  function formatPrice(amount: number, currency: string) {
    try {
      return new Intl.NumberFormat(locale, { style: "currency", currency }).format(amount);
    } catch {
      return `${amount} ${currency}`;
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.14em] text-slate-500">
            {t("label")}
          </p>
          <h1 className="text-2xl font-bold text-slate-50">{t("title")}</h1>
        </div>
        <NeonButton onClick={() => openForm()}>{t("create")}</NeonButton>
      </div>

      {error && <p className="text-sm text-rose-300">{error}</p>}

      <DashboardCard>
        <NeonTable
          headers={[
            t("table.title"),
            t("table.slug"),
            t("table.category"),
            t("table.price"),
            t("table.status"),
            "",
          ]}
        >
          {templates.map((template) => (
            <tr key={template.id} className="hover:bg-slate-900/40">
              <td className="px-4 py-3 text-sm text-slate-100">
                <div className="font-semibold">{template.title}</div>
                <div className="text-xs text-slate-400">{template.serviceTitle ?? serviceLookup[template.serviceId]}</div>
              </td>
              <td className="px-4 py-3 text-sm text-slate-300">{template.slug}</td>
              <td className="px-4 py-3 text-sm text-slate-300">{template.category ?? t("emptyValue")}</td>
              <td className="px-4 py-3 text-sm text-slate-300">
                {formatPrice(template.basePrice, template.currency)}
              </td>
              <td className="px-4 py-3 text-sm">
                <span
                  className={`rounded-full px-3 py-1 text-[11px] font-semibold ${
                    template.isActive
                      ? "border-emerald-400/60 bg-emerald-500/10 text-emerald-100"
                      : "border-slate-600/60 bg-slate-800/60 text-slate-200"
                  }`}
                >
                  {template.isActive ? t("active") : t("inactive")}
                </span>
              </td>
              <td className="px-4 py-3 text-right">
                <div className="flex justify-end gap-2">
                  <NeonButton variant="ghost" className="px-3 py-1 text-xs" onClick={() => openForm(template)}>
                    {t("edit")}
                  </NeonButton>
                  <NeonButton
                    variant={template.isActive ? "danger" : "success"}
                    className="px-3 py-1 text-xs"
                    onClick={() => toggleActive(template)}
                  >
                    {template.isActive ? t("deactivate") : t("activate")}
                  </NeonButton>
                </div>
              </td>
            </tr>
          ))}
          {templates.length === 0 && (
            <tr>
              <td className="px-4 py-3 text-sm text-slate-400" colSpan={6}>
                {t("empty")}
              </td>
            </tr>
          )}
        </NeonTable>
      </DashboardCard>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-4xl space-y-4 rounded-2xl border border-slate-800/70 bg-[#050b18] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.6)]">
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

            <form className="space-y-4" onSubmit={saveTemplate}>
              <div className="grid gap-3 md:grid-cols-2">
                <label className="flex flex-col gap-1 text-sm text-slate-200">
                  <span>{t("fields.title")}</span>
                  <input
                    required
                    value={form.title}
                    onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                    className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-slate-100 outline-none focus:border-cyan-400/70"
                  />
                </label>
                <label className="flex flex-col gap-1 text-sm text-slate-200">
                  <span>{t("fields.slug")}</span>
                  <input
                    required
                    value={form.slug}
                    onChange={(e) => setForm((prev) => ({ ...prev, slug: e.target.value }))}
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
                <label className="flex flex-col gap-1 text-sm text-slate-200">
                  <span>{t("fields.service")}</span>
                  <select
                    required
                    value={form.serviceId}
                    onChange={(e) => setForm((prev) => ({ ...prev, serviceId: e.target.value }))}
                    className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-slate-100 outline-none focus:border-cyan-400/70"
                  >
                    {services.map((service) => (
                      <option key={service.id} value={service.id}>
                        {service.title}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="flex flex-col gap-1 text-sm text-slate-200">
                  <span>{t("fields.price")}</span>
                  <input
                    type="number"
                    required
                    value={form.basePrice}
                    onChange={(e) => setForm((prev) => ({ ...prev, basePrice: Number(e.target.value) }))}
                    className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-slate-100 outline-none focus:border-cyan-400/70"
                  />
                </label>
                <label className="flex flex-col gap-1 text-sm text-slate-200">
                  <span>{t("fields.currency")}</span>
                  <input
                    value={form.currency}
                    onChange={(e) => setForm((prev) => ({ ...prev, currency: e.target.value }))}
                    className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-slate-100 outline-none focus:border-cyan-400/70"
                  />
                </label>
              </div>

              <label className="flex flex-col gap-1 text-sm text-slate-200">
                <span>{t("fields.shortDescription")}</span>
                <input
                  value={form.shortDescription}
                  onChange={(e) => setForm((prev) => ({ ...prev, shortDescription: e.target.value }))}
                  className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-slate-100 outline-none focus:border-cyan-400/70"
                />
              </label>

              <label className="flex flex-col gap-1 text-sm text-slate-200">
                <span>{t("fields.longDescription")}</span>
                <textarea
                  value={form.longDescription}
                  rows={4}
                  onChange={(e) => setForm((prev) => ({ ...prev, longDescription: e.target.value }))}
                  className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-slate-100 outline-none focus:border-cyan-400/70"
                />
              </label>

              <div className="grid gap-3 md:grid-cols-2">
                <label className="flex flex-col gap-1 text-sm text-slate-200">
                  <span>{t("fields.demoUrl")}</span>
                  <input
                    value={form.demoUrl}
                    onChange={(e) => setForm((prev) => ({ ...prev, demoUrl: e.target.value }))}
                    className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-slate-100 outline-none focus:border-cyan-400/70"
                  />
                </label>
                <label className="flex flex-col gap-1 text-sm text-slate-200">
                  <span>{t("fields.thumbUrl")}</span>
                  <input
                    value={form.thumbUrl}
                    onChange={(e) => setForm((prev) => ({ ...prev, thumbUrl: e.target.value }))}
                    className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-slate-100 outline-none focus:border-cyan-400/70"
                    placeholder={t("fields.thumbHelper")}
                  />
                </label>
              </div>

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
                        onChange={(e) => uploadPreviewImage("laptopPreviewImage", e.target.files?.[0] ?? undefined)}
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
                        onChange={(e) => uploadPreviewImage("tabletPreviewImage", e.target.files?.[0] ?? undefined)}
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
                        onChange={(e) => uploadPreviewImage("mobilePreviewImage", e.target.files?.[0] ?? undefined)}
                        disabled={previewUploading}
                      />
                      {previewUploading ? t("uploading") : t("upload")}
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <label className="inline-flex items-center gap-2 text-sm text-slate-200">
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(e) => setForm((prev) => ({ ...prev, isActive: e.target.checked }))}
                  />
                  {t("fields.isActive")}
                </label>
              </div>

              <div className="flex items-center justify-between gap-3">
                <div className="text-sm text-slate-400">
                  {form.id ? t("formEditHint") : t("formCreateHint")}
                </div>
                <NeonButton type="submit" disabled={loading}>
                  {loading ? t("saving") : t("save")}
                </NeonButton>
              </div>
            </form>

            {form.id && (
              <div className="rounded-xl border border-slate-800/70 bg-[#0b1120]/80 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-sm font-semibold text-slate-100">{t("gallery.title")}</div>
                  <label className="flex items-center gap-2 text-xs text-slate-200">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => uploadMedia(form.id, e.target.files?.[0], undefined)}
                      disabled={uploading}
                    />
                    {uploading ? t("gallery.uploading") : t("gallery.upload")}
                  </label>
                </div>
                <div className="mt-3 grid gap-2 md:grid-cols-3">
                  {templates
                    .find((tpl) => tpl.id === form.id)
                    ?.gallery?.map((media) => (
                      <div
                        key={media.id}
                        className="relative h-28 w-full overflow-hidden rounded-lg border border-slate-800/70"
                      >
                        <Image
                          src={media.url}
                          alt={media.label ?? form.title}
                          fill
                          sizes="(max-width: 768px) 100vw, 33vw"
                          className="object-cover"
                          unoptimized
                        />
                        {media.label && (
                          <div className="px-3 py-2 text-xs text-slate-200">{media.label}</div>
                        )}
                      </div>
                    ))}
                  {templates.find((tpl) => tpl.id === form.id)?.gallery?.length === 0 && (
                    <div className="text-xs text-slate-400">{t("gallery.empty")}</div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
