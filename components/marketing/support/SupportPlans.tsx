"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";

type SupportPlanCard = {
  key: string;
  name: string;
  subtitle: string;
  price: string;
  includes: string[];
  limit: string;
  fit: string;
  popular?: boolean;
};

type SupportRequestForm = {
  title: string;
  subtitle: string;
  projectName: string;
  siteUrl: string;
  projectType: string;
  projectTypeOptions: { value: string; label: string }[];
  builtByUs: string;
  builtByUsOptions: { value: string; label: string }[];
  notes: string;
  submit: string;
  cancel: string;
  success: string;
  error: string;
  loginRequired: string;
};

type SupportPlansProps = {
  title: string;
  toggleAnnual: string;
  toggleAudit: string;
  badge: string;
  ctaLabel: string;
  limitLabel: string;
  fitLabel: string;
  note: string;
  cards: SupportPlanCard[];
  form: SupportRequestForm;
};

const PLAN_KEYS = new Set(["CARE", "CARE_PLUS", "GROWTH", "AUDIT"]);

export function SupportPlans({
  title,
  toggleAnnual,
  toggleAudit,
  badge,
  ctaLabel,
  limitLabel,
  fitLabel,
  note,
  cards,
  form,
}: SupportPlansProps) {
  const locale = useLocale();
  const router = useRouter();
  const [mode, setMode] = useState<"annual" | "audit">("annual");
  const [activePlan, setActivePlan] = useState<SupportPlanCard | null>(null);
  const [projectName, setProjectName] = useState("");
  const [siteUrl, setSiteUrl] = useState("");
  const [projectType, setProjectType] = useState(form.projectTypeOptions[0]?.value ?? "");
  const [builtByUs, setBuiltByUs] = useState(form.builtByUsOptions[0]?.value ?? "");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const auditOnly = mode === "audit";

  const allowedPlans = useMemo(
    () => cards.filter((card) => PLAN_KEYS.has(card.key)),
    [cards],
  );

  function openPlan(card: SupportPlanCard) {
    setActivePlan(card);
    setProjectName("");
    setSiteUrl("");
    setProjectType(form.projectTypeOptions[0]?.value ?? "");
    setBuiltByUs(form.builtByUsOptions[0]?.value ?? "");
    setNotes("");
    setError(null);
  }

  function closeModal() {
    setActivePlan(null);
    setSubmitting(false);
  }

  const modalTitle = activePlan
    ? form.title.replace("{plan}", activePlan.name)
    : form.title;

  async function submitRequest(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!activePlan) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/support-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan: activePlan.key,
          projectName,
          siteUrl: siteUrl || null,
          projectType: projectType || null,
          builtByUs: builtByUs === "yes",
          notes: notes || null,
        }),
      });

      if (res.status === 401) {
        throw new Error(form.loginRequired);
      }

      if (!res.ok) {
        throw new Error(form.error);
      }

      setProjectName("");
      setSiteUrl("");
      setNotes("");
      setActivePlan(null);
      router.push(`/${locale}/support/success`);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-slate-400">{title}</p>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-slate-800/70 bg-slate-950/60 p-1 text-xs text-slate-300">
          <button
            type="button"
            className={`rounded-full px-3 py-1 transition ${
              mode === "annual" ? "bg-slate-800 text-slate-100" : "text-slate-400"
            }`}
            onClick={() => setMode("annual")}
          >
            {toggleAnnual}
          </button>
          <button
            type="button"
            className={`rounded-full px-3 py-1 transition ${
              mode === "audit" ? "bg-slate-800 text-slate-100" : "text-slate-400"
            }`}
            onClick={() => setMode("audit")}
          >
            {toggleAudit}
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {allowedPlans.map((card) => {
          const isAudit = card.key === "AUDIT";
          const dimmed = auditOnly && !isAudit;
          return (
            <div
              key={card.key}
              className={`group relative flex h-full flex-col rounded-3xl border border-slate-800/70 bg-[#0b1120]/85 p-5 text-slate-200 shadow-[0_14px_40px_rgba(0,0,0,0.35)] transition ${
                dimmed ? "opacity-60" : "hover:-translate-y-1 hover:border-cyan-400/60"
              }`}
            >
              {card.popular && (
                <span className="absolute -top-3 right-4 rounded-full bg-cyan-400 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-900 shadow-[0_10px_25px_rgba(56,189,248,0.35)]">
                  {badge}
                </span>
              )}
              <div className="space-y-2">
                <div className="text-xs uppercase tracking-[0.16em] text-slate-400">{card.name}</div>
                <h3 className="text-lg font-semibold text-slate-50">{card.subtitle}</h3>
                <div className="text-sm text-slate-400">{card.price}</div>
              </div>
              <ul className="mt-4 space-y-2 text-sm text-slate-300">
                {card.includes.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="mt-1 h-2 w-2 rounded-full bg-emerald-400" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-4 text-xs text-slate-400">
                <span className="uppercase tracking-[0.14em] text-slate-500">{limitLabel}</span>
                <div className="mt-1 text-sm text-slate-200">{card.limit}</div>
              </div>
              <div className="mt-4 text-xs text-slate-400 opacity-0 transition group-hover:opacity-100">
                <span className="uppercase tracking-[0.14em] text-slate-500">{fitLabel}</span>
                <div className="mt-1 text-sm text-slate-200">{card.fit}</div>
              </div>
              <button
                type="button"
                onClick={() => openPlan(card)}
                className="mt-5 rounded-full border border-slate-700/70 bg-slate-900/60 px-4 py-2 text-xs font-semibold text-slate-100 transition hover:border-cyan-300/80 hover:text-cyan-100"
              >
                {ctaLabel}
              </button>
            </div>
          );
        })}
      </div>

      <p className="text-xs text-slate-400">{note}</p>

      {activePlan && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-6"
          onClick={closeModal}
        >
          <div
            className="w-full max-w-lg space-y-4 rounded-2xl border border-slate-800/70 bg-[#050b18] p-6 text-slate-100 shadow-[0_20px_60px_rgba(0,0,0,0.6)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.14em] text-slate-500">
                  {modalTitle}
                </p>
                <h3 className="text-xl font-semibold text-slate-50">
                  {activePlan.subtitle}
                </h3>
                <p className="text-sm text-slate-400">{form.subtitle}</p>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="text-xs text-slate-400 hover:text-slate-200"
              >
                {form.cancel}
              </button>
            </div>

            <form className="space-y-3" onSubmit={submitRequest}>
              <div className="space-y-1">
                <label className="text-xs text-slate-400">{form.projectName}</label>
                <input
                  value={projectName}
                  onChange={(event) => setProjectName(event.target.value)}
                  className="w-full rounded-xl border border-slate-700/70 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-400/80"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-slate-400">{form.siteUrl}</label>
                <input
                  value={siteUrl}
                  onChange={(event) => setSiteUrl(event.target.value)}
                  className="w-full rounded-xl border border-slate-700/70 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-400/80"
                />
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-xs text-slate-400">{form.projectType}</label>
                  <select
                    value={projectType}
                    onChange={(event) => setProjectType(event.target.value)}
                    className="w-full rounded-xl border border-slate-700/70 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-400/80"
                  >
                    {form.projectTypeOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-400">{form.builtByUs}</label>
                  <select
                    value={builtByUs}
                    onChange={(event) => setBuiltByUs(event.target.value)}
                    className="w-full rounded-xl border border-slate-700/70 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-400/80"
                  >
                    {form.builtByUsOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs text-slate-400">{form.notes}</label>
                <textarea
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  rows={3}
                  className="w-full rounded-xl border border-slate-700/70 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-400/80"
                />
              </div>

              {error && <p className="text-sm text-rose-300">{error}</p>}

              <div className="flex flex-wrap items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-full border border-slate-700/70 bg-slate-900/60 px-4 py-2 text-xs font-semibold text-slate-100 transition hover:border-slate-500/80"
                >
                  {form.cancel}
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-full border border-cyan-300/70 bg-gradient-to-r from-cyan-400 to-emerald-400 px-4 py-2 text-xs font-semibold text-slate-900 shadow-[0_0_20px_rgba(56,189,248,0.35)] transition hover:shadow-[0_0_30px_rgba(34,197,94,0.35)] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {form.submit}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
