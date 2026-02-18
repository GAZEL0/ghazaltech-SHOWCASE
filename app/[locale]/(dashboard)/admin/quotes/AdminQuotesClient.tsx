"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { NeonButton } from "@/components/dashboard/NeonButton";
import { NeonTable } from "@/components/dashboard/NeonTable";
import { StatusBadge } from "@/components/dashboard/StatusBadge";

type QuoteRow = {
  id: string;
  amount: number;
  currency: string;
  status: string;
  scope?: string;
  expiresAt?: string;
  sentAt?: string | null;
  meta?: {
    projectTitle?: string | null;
    projectDescription?: string | null;
    deliveryEstimate?: string | null;
    timeline?: string | null;
    phases?: {
      key?: string | null;
      group?: string | null;
      title?: string | null;
      description?: string | null;
      dueDate?: string | null;
      order?: number | null;
    }[];
    paymentSchedule?: {
      label?: string | null;
      amount?: number | null;
      dueDate?: string | null;
      beforePhaseKey?: string | null;
    }[];
    paymentNotes?: string | null;
  } | null;
  request?: { fullName?: string; email?: string };
};

export function AdminQuotesClient({ locale }: { locale: string }) {
  const t = useTranslations("dashboard.admin");
  const tQuote = useTranslations("customRequestsAdmin");
  const [quotes, setQuotes] = useState<QuoteRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [selected, setSelected] = useState<QuoteRow | null>(null);
  const phaseGroupLabels: Record<string, string> = {
    REQUIREMENTS: tQuote("quoteForm.phaseGroups.requirements"),
    DESIGN: tQuote("quoteForm.phaseGroups.design"),
    DEV: tQuote("quoteForm.phaseGroups.dev"),
    QA: tQuote("quoteForm.phaseGroups.qa"),
    DELIVERED: tQuote("quoteForm.phaseGroups.delivered"),
  };
  const getPhaseGroupLabel = (group?: string | null) => {
    if (!group) return t("emptyValue");
    return phaseGroupLabels[group] ?? group;
  };

  const loadQuotes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/quotes", { cache: "no-store" });
      if (!res.ok) throw new Error(t("errors.loadQuotes"));
      const data = (await res.json()) as QuoteRow[];
      setQuotes(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    void loadQuotes();
  }, [loadQuotes]);

  async function sendQuote(id: string) {
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch(`/api/quotes/${id}/send`, { method: "POST" });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || t("errors.sendQuote"));
      }
      const data = (await res.json()) as { magicLink?: string };
      setMessage(data.magicLink ? t("quoteSentLink", { link: data.magicLink }) : t("quoteSent"));
      if (data.magicLink && typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(data.magicLink).catch(() => null);
      }
      await loadQuotes();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  async function archiveQuote(id: string) {
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch(`/api/quotes/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ archived: true }),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || t("errors.archiveQuote"));
      }
      setMessage(t("quoteArchived"));
      await loadQuotes();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.14em] text-slate-500">{t("label")}</p>
          <h1 className="text-2xl font-bold text-slate-50">{t("quotesSection")}</h1>
        </div>
        <NeonButton variant="ghost" onClick={() => void loadQuotes()}>
          {t("refresh")}
        </NeonButton>
      </div>

      {error && <p className="text-sm text-rose-300">{error}</p>}
      {message && <p className="text-sm text-emerald-300 break-words">{message}</p>}

      <DashboardCard>
        <NeonTable headers={[t("table.client"), t("table.amount"), t("table.status"), t("table.expires"), ""]}>
          {quotes.map((quote) => (
            <tr key={quote.id} className="hover:bg-slate-900/40">
              <td className="px-4 py-3 text-sm text-slate-100">
                <div className="font-semibold">{quote.request?.fullName ?? t("clientFallback")}</div>
                <div className="text-xs text-slate-400">{quote.request?.email}</div>
              </td>
              <td className="px-4 py-3 text-sm text-slate-100">
                {quote.currency} {quote.amount.toLocaleString()}
              </td>
              <td className="px-4 py-3">
                <StatusBadge status={quote.status} />
                {quote.sentAt && (
                  <div className="text-xs text-slate-400">
                    {t("sentAt", { date: new Date(quote.sentAt).toLocaleString(locale) })}
                  </div>
                )}
              </td>
              <td className="px-4 py-3 text-sm text-slate-300">
                {quote.expiresAt ? new Date(quote.expiresAt).toLocaleDateString(locale) : t("emptyValue")}
              </td>
              <td className="px-4 py-3 text-right">
                <div className="flex justify-end gap-2">
                  <NeonButton
                    variant="ghost"
                    className="px-3 py-1 text-xs"
                    onClick={() => setSelected(quote)}
                  >
                    {t("viewDetails")}
                  </NeonButton>
                  <NeonButton
                    variant="success"
                    className="px-3 py-1 text-xs"
                    onClick={() => void sendQuote(quote.id)}
                    disabled={loading}
                  >
                    {t("copyMagicLink")}
                  </NeonButton>
                  <NeonButton
                    variant="ghost"
                    className="px-3 py-1 text-xs"
                    onClick={() => void archiveQuote(quote.id)}
                    disabled={loading}
                  >
                    {t("actions.archive")}
                  </NeonButton>
                </div>
              </td>
            </tr>
          ))}
          {quotes.length === 0 && (
            <tr>
              <td className="px-4 py-3 text-sm text-slate-400" colSpan={5}>
                {loading ? t("loadingQuotes") : t("quotesEmpty")}
              </td>
            </tr>
          )}
        </NeonTable>
      </DashboardCard>

      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4"
          onClick={() => setSelected(null)}
        >
          <div
            className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-slate-800/70 bg-[#050b18] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.6)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.14em] text-slate-500">
                  {tQuote("quoteForm.title")}
                </p>
                <h3 className="text-xl font-bold text-slate-50">
                  {selected.request?.fullName ?? t("clientFallback")}
                </h3>
                <div className="text-xs text-slate-400">{selected.request?.email}</div>
              </div>
              <NeonButton variant="ghost" onClick={() => setSelected(null)}>
                {t("close")}
              </NeonButton>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-2 text-sm text-slate-200">
              <div className="rounded-xl border border-slate-800/70 bg-slate-950/60 p-4">
                <div className="text-xs uppercase tracking-[0.12em] text-slate-500">
                  {t("table.amount")}
                </div>
                <div className="mt-2 text-sm text-slate-100">
                  {selected.currency} {selected.amount.toLocaleString()}
                </div>
                <div className="mt-3 text-xs text-slate-400">
                  {t("table.status")}: <span className="text-slate-100">{selected.status}</span>
                </div>
                <div className="mt-2 text-xs text-slate-400">
                  {t("table.expires")}:{" "}
                  {selected.expiresAt
                    ? new Date(selected.expiresAt).toLocaleDateString(locale)
                    : t("emptyValue")}
                </div>
              </div>
              <div className="rounded-xl border border-slate-800/70 bg-slate-950/60 p-4">
                <div className="text-xs uppercase tracking-[0.12em] text-slate-500">
                  {tQuote("quoteForm.projectTitle")}
                </div>
                <div className="mt-2 text-sm text-slate-100">
                  {selected.meta?.projectTitle ?? t("emptyValue")}
                </div>
                {selected.meta?.deliveryEstimate && (
                  <div className="mt-3 text-xs text-slate-400">
                    {tQuote("quoteForm.estimatedDelivery")}:{" "}
                    <span className="text-slate-100">{selected.meta.deliveryEstimate}</span>
                  </div>
                )}
                {selected.meta?.timeline && (
                  <div className="mt-2 text-xs text-slate-400">
                    {tQuote("quoteForm.timeline")}:{" "}
                    <span className="text-slate-100">{selected.meta.timeline}</span>
                  </div>
                )}
              </div>
            </div>

            {selected.scope && (
              <div className="mt-4 rounded-xl border border-slate-800/70 bg-slate-950/60 p-4">
                <div className="text-xs uppercase tracking-[0.12em] text-slate-500">
                  {tQuote("quoteForm.scope")}
                </div>
                <p className="mt-2 text-sm text-slate-200 whitespace-pre-wrap">{selected.scope}</p>
              </div>
            )}

            {selected.meta?.projectDescription && (
              <div className="mt-4 rounded-xl border border-slate-800/70 bg-slate-950/60 p-4">
                <div className="text-xs uppercase tracking-[0.12em] text-slate-500">
                  {tQuote("quoteForm.projectDescription")}
                </div>
                <p className="mt-2 text-sm text-slate-200 whitespace-pre-wrap">
                  {selected.meta.projectDescription}
                </p>
              </div>
            )}

            {selected.meta?.phases && selected.meta.phases.length > 0 && (
              <div className="mt-4 rounded-xl border border-slate-800/70 bg-slate-950/60 p-4">
                <div className="text-xs uppercase tracking-[0.12em] text-slate-500">
                  {tQuote("quoteForm.phasesTitle")}
                </div>
                <div className="mt-3 space-y-2 text-sm text-slate-200">
                  {selected.meta.phases.map((phase, idx) => (
                    <div key={`${phase.title ?? "phase"}-${idx}`} className="rounded-lg border border-slate-800/60 p-3">
                      <div className="text-xs text-slate-400">
                        {getPhaseGroupLabel(phase.group)} - {phase.title ?? t("emptyValue")}
                      </div>
                      {phase.description && (
                        <div className="mt-1 text-sm text-slate-200">{phase.description}</div>
                      )}
                      {phase.dueDate && (
                        <div className="mt-1 text-xs text-slate-500">
                          {tQuote("quoteForm.dueLabel", {
                            date: new Date(phase.dueDate).toLocaleDateString(locale),
                          })}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selected.meta?.paymentSchedule && selected.meta.paymentSchedule.length > 0 && (
              <div className="mt-4 rounded-xl border border-slate-800/70 bg-slate-950/60 p-4">
                <div className="text-xs uppercase tracking-[0.12em] text-slate-500">
                  {tQuote("quoteForm.paymentSchedule")}
                </div>
                <div className="mt-3 space-y-2 text-sm text-slate-200">
                  {(() => {
                    const phaseLabelByKey = new Map<string, string>();
                    selected.meta?.phases?.forEach((phase) => {
                      if (phase.key && phase.title) {
                        phaseLabelByKey.set(phase.key, phase.title);
                      }
                    });
                    return selected.meta?.paymentSchedule?.map((payment, idx) => (
                      <div
                        key={`${payment.label ?? "payment"}-${idx}`}
                        className="rounded-lg border border-slate-800/60 p-3"
                      >
                        <div className="text-sm text-slate-100">
                          {payment.label ?? tQuote("quoteForm.defaultPayment")}
                        </div>
                        <div className="mt-1 text-xs text-slate-400">
                          {selected.currency} {(payment.amount ?? 0).toLocaleString()}
                        </div>
                        {payment.dueDate && (
                          <div className="mt-1 text-xs text-slate-500">
                            {tQuote("quoteForm.dueLabel", {
                              date: new Date(payment.dueDate).toLocaleDateString(locale),
                            })}
                          </div>
                        )}
                        {payment.beforePhaseKey && (
                          <div className="mt-1 text-xs text-slate-500">
                            {tQuote("quoteForm.beforePhase")}:{" "}
                            {phaseLabelByKey.get(payment.beforePhaseKey) ?? t("emptyValue")}
                          </div>
                        )}
                      </div>
                    ));
                  })()}
                </div>
                {selected.meta?.paymentNotes && (
                  <div className="mt-3 text-xs text-slate-400 whitespace-pre-wrap">
                    {selected.meta.paymentNotes}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
