"use client";

import { NeonButton } from "@/components/dashboard/NeonButton";
import { useLocale, useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type FormState = {
  fullName: string;
  email: string;
  phone: string;
  companyName: string;
  businessType: string;
  projectType: string;
  languages: string[];
  hasDomain: string;
  hasHosting: string;
  budgetRange: string;
  timeline: string;
  referenceLinks: string;
  details: string;
};

const defaultState: FormState = {
  fullName: "",
  email: "",
  phone: "",
  companyName: "",
  businessType: "",
  projectType: "",
  languages: [],
  hasDomain: "",
  hasHosting: "",
  budgetRange: "",
  timeline: "",
  referenceLinks: "",
  details: "",
};

export function CustomProjectForm() {
  const t = useTranslations("customProject");
  const locale = useLocale();
  const router = useRouter();
  const [form, setForm] = useState<FormState>(defaultState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const languageOptions = useMemo(
    () => [
      { value: "ar", label: t("form.languageOptions.ar") },
      { value: "en", label: t("form.languageOptions.en") },
      { value: "tr", label: t("form.languageOptions.tr") },
      { value: "other", label: t("form.languageOptions.other") },
    ],
    [t],
  );

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const payload = {
        fullName: form.fullName,
        email: form.email,
        phone: form.phone || null,
        companyName: form.companyName || null,
        businessType: form.businessType || null,
        projectType: form.projectType || null,
        languages: form.languages.join(","),
        hasDomain: form.hasDomain === "" ? null : form.hasDomain === "yes",
        hasHosting: form.hasHosting === "" ? null : form.hasHosting === "yes",
        budgetRange: form.budgetRange || null,
        timeline: form.timeline || null,
        referenceLinks: form.referenceLinks || null,
        details: form.details,
      };

      const res = await fetch("/api/custom-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Failed to submit");
      }

      setForm(defaultState);
      router.push(`/${locale}/success`);
    } catch (err) {
      setError((err as Error).message ?? "Failed to submit");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && <p className="text-sm text-rose-300">{error}</p>}

      <div className="grid gap-4 rounded-2xl border border-slate-800/70 bg-[#0b1120]/80 p-5">
        <div>
          <p className="text-xs uppercase tracking-[0.14em] text-slate-500">
            {t("form.section.contact")}
          </p>
          <h3 className="text-lg font-semibold text-slate-50">{t("form.section.contactSubtitle")}</h3>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <label className="flex flex-col gap-2 text-sm text-slate-200">
            <span>{t("form.fullName")}</span>
            <input
              required
              value={form.fullName}
              onChange={(e) => setForm((prev) => ({ ...prev, fullName: e.target.value }))}
              className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-slate-100 outline-none focus:border-cyan-400/70 focus:shadow-[0_0_18px_rgba(56,189,248,0.35)]"
              placeholder={t("form.fullNamePlaceholder")}
            />
          </label>
          <label className="flex flex-col gap-2 text-sm text-slate-200">
            <span>{t("form.email")}</span>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
              className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-slate-100 outline-none focus:border-cyan-400/70 focus:shadow-[0_0_18px_rgba(56,189,248,0.35)]"
              placeholder={t("form.emailPlaceholder")}
            />
          </label>
          <label className="flex flex-col gap-2 text-sm text-slate-200">
            <span>{t("form.phone")}</span>
            <input
              value={form.phone}
              onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
              className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-slate-100 outline-none focus:border-cyan-400/70 focus:shadow-[0_0_18px_rgba(56,189,248,0.35)]"
              placeholder={t("form.phonePlaceholder")}
            />
          </label>
        </div>
      </div>

      <div className="grid gap-4 rounded-2xl border border-slate-800/70 bg-[#0b1120]/80 p-5">
        <div>
          <p className="text-xs uppercase tracking-[0.14em] text-slate-500">
            {t("form.section.business")}
          </p>
          <h3 className="text-lg font-semibold text-slate-50">{t("form.section.businessSubtitle")}</h3>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <label className="flex flex-col gap-2 text-sm text-slate-200">
            <span>{t("form.companyName")}</span>
            <input
              value={form.companyName}
              onChange={(e) => setForm((prev) => ({ ...prev, companyName: e.target.value }))}
              className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-slate-100 outline-none focus:border-cyan-400/70 focus:shadow-[0_0_18px_rgba(56,189,248,0.35)]"
              placeholder={t("form.companyPlaceholder")}
            />
          </label>
          <label className="flex flex-col gap-2 text-sm text-slate-200">
            <span>{t("form.businessType")}</span>
            <input
              value={form.businessType}
              onChange={(e) => setForm((prev) => ({ ...prev, businessType: e.target.value }))}
              className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-slate-100 outline-none focus:border-cyan-400/70 focus:shadow-[0_0_18px_rgba(56,189,248,0.35)]"
              placeholder={t("form.businessPlaceholder")}
            />
          </label>
        </div>
      </div>

      <div className="grid gap-4 rounded-2xl border border-slate-800/70 bg-[#0b1120]/80 p-5">
        <div>
          <p className="text-xs uppercase tracking-[0.14em] text-slate-500">
            {t("form.section.project")}
          </p>
          <h3 className="text-lg font-semibold text-slate-50">{t("form.section.projectSubtitle")}</h3>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <label className="flex flex-col gap-2 text-sm text-slate-200">
            <span>{t("form.projectType")}</span>
            <select
              value={form.projectType}
              onChange={(e) => setForm((prev) => ({ ...prev, projectType: e.target.value }))}
              className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-slate-100 outline-none focus:border-cyan-400/70 focus:shadow-[0_0_18px_rgba(56,189,248,0.35)]"
            >
              <option value="">{t("form.selectPlaceholder")}</option>
              <option value="Personal website">{t("form.projectOptions.personal")}</option>
              <option value="Business website">{t("form.projectOptions.business")}</option>
              <option value="E-commerce">{t("form.projectOptions.ecommerce")}</option>
              <option value="Management system">{t("form.projectOptions.management")}</option>
              <option value="Custom website">{t("form.projectOptions.custom")}</option>
              <option value="Other">{t("form.projectOptions.other")}</option>
            </select>
          </label>
          <div className="space-y-2">
            <span className="text-sm text-slate-200">{t("form.languages")}</span>
            <div className="flex flex-wrap gap-3 text-sm text-slate-200">
              {languageOptions.map((lang) => (
                <label key={lang.value} className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={form.languages.includes(lang.value)}
                    onChange={(e) => {
                      setForm((prev) => {
                        const next = new Set(prev.languages);
                        if (e.target.checked) next.add(lang.value);
                        else next.delete(lang.value);
                        return { ...prev, languages: Array.from(next) };
                      });
                    }}
                  />
                  {lang.label}
                </label>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <span className="text-sm text-slate-200">{t("form.hasDomain")}</span>
            <div className="flex items-center gap-3 text-sm text-slate-200">
              <label className="inline-flex items-center gap-2">
                <input
                  type="radio"
                  name="hasDomain"
                  value="yes"
                  checked={form.hasDomain === "yes"}
                  onChange={(e) => setForm((prev) => ({ ...prev, hasDomain: e.target.value }))}
                />
                {t("form.yes")}
              </label>
              <label className="inline-flex items-center gap-2">
                <input
                  type="radio"
                  name="hasDomain"
                  value="no"
                  checked={form.hasDomain === "no"}
                  onChange={(e) => setForm((prev) => ({ ...prev, hasDomain: e.target.value }))}
                />
                {t("form.no")}
              </label>
            </div>
          </div>
          <div className="space-y-2">
            <span className="text-sm text-slate-200">{t("form.hasHosting")}</span>
            <div className="flex items-center gap-3 text-sm text-slate-200">
              <label className="inline-flex items-center gap-2">
                <input
                  type="radio"
                  name="hasHosting"
                  value="yes"
                  checked={form.hasHosting === "yes"}
                  onChange={(e) => setForm((prev) => ({ ...prev, hasHosting: e.target.value }))}
                />
                {t("form.yes")}
              </label>
              <label className="inline-flex items-center gap-2">
                <input
                  type="radio"
                  name="hasHosting"
                  value="no"
                  checked={form.hasHosting === "no"}
                  onChange={(e) => setForm((prev) => ({ ...prev, hasHosting: e.target.value }))}
                />
                {t("form.no")}
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 rounded-2xl border border-slate-800/70 bg-[#0b1120]/80 p-5">
        <div>
          <p className="text-xs uppercase tracking-[0.14em] text-slate-500">
            {t("form.section.scope")}
          </p>
          <h3 className="text-lg font-semibold text-slate-50">{t("form.section.scopeSubtitle")}</h3>
          <p className="mt-2 text-xs text-slate-400">{t("form.timelineBudgetHint")}</p>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <label className="flex flex-col gap-2 text-sm text-slate-200">
            <span>{t("form.budgetRange")}</span>
            <select
              value={form.budgetRange}
              onChange={(e) => setForm((prev) => ({ ...prev, budgetRange: e.target.value }))}
              className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-slate-100 outline-none focus:border-cyan-400/70 focus:shadow-[0_0_18px_rgba(56,189,248,0.35)]"
            >
              <option value="">{t("form.selectPlaceholder")}</option>
              <option value="<$1000">{t("form.budgetOptions.lt1000")}</option>
              <option value="$1000-2000">{t("form.budgetOptions.mid1")}</option>
              <option value="$2000-4000">{t("form.budgetOptions.mid2")}</option>
              <option value="> $4000">{t("form.budgetOptions.gt4")}</option>
            </select>
          </label>
          <label className="flex flex-col gap-2 text-sm text-slate-200">
            <span>{t("form.timeline")}</span>
            <select
              value={form.timeline}
              onChange={(e) => setForm((prev) => ({ ...prev, timeline: e.target.value }))}
              className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-slate-100 outline-none focus:border-cyan-400/70 focus:shadow-[0_0_18px_rgba(56,189,248,0.35)]"
            >
              <option value="">{t("form.selectPlaceholder")}</option>
              <option value="< 2 weeks">{t("form.timelineOptions.lt2w")}</option>
              <option value="< 1 month">{t("form.timelineOptions.lt1m")}</option>
              <option value="< 3 months">{t("form.timelineOptions.lt3m")}</option>
              <option value="< 6 months">{t("form.timelineOptions.lt6m")}</option>
            </select>
          </label>
        </div>
      </div>

      <div className="grid gap-4 rounded-2xl border border-slate-800/70 bg-[#0b1120]/80 p-5">
        <div>
          <p className="text-xs uppercase tracking-[0.14em] text-slate-500">
            {t("form.section.references")}
          </p>
          <h3 className="text-lg font-semibold text-slate-50">{t("form.section.referencesSubtitle")}</h3>
        </div>
        <label className="flex flex-col gap-2 text-sm text-slate-200">
          <span>{t("form.referenceLinks")}</span>
          <textarea
            value={form.referenceLinks}
            onChange={(e) => setForm((prev) => ({ ...prev, referenceLinks: e.target.value }))}
            rows={3}
            className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-slate-100 outline-none focus:border-cyan-400/70 focus:shadow-[0_0_18px_rgba(56,189,248,0.35)]"
            placeholder={t("form.referencePlaceholder")}
          />
        </label>
      </div>

      <div className="grid gap-4 rounded-2xl border border-slate-800/70 bg-[#0b1120]/80 p-5">
        <div>
          <p className="text-xs uppercase tracking-[0.14em] text-slate-500">
            {t("form.section.details")}
          </p>
          <h3 className="text-lg font-semibold text-slate-50">{t("form.section.detailsSubtitle")}</h3>
        </div>
        <label className="flex flex-col gap-2 text-sm text-slate-200">
          <span>{t("form.details")}</span>
          <textarea
            required
            value={form.details}
            onChange={(e) => setForm((prev) => ({ ...prev, details: e.target.value }))}
            rows={5}
            className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-slate-100 outline-none focus:border-cyan-400/70 focus:shadow-[0_0_18px_rgba(56,189,248,0.35)]"
            placeholder={t("form.detailsPlaceholder")}
          />
        </label>
        <div className="flex justify-end">
          <NeonButton type="submit" disabled={loading}>
            {loading ? t("form.submitting") : t("form.submit")}
          </NeonButton>
        </div>
      </div>
    </form>
  );
}
