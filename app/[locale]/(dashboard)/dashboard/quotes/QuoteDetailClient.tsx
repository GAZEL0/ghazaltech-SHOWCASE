"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { NeonButton } from "@/components/dashboard/NeonButton";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { useQuoteStore } from "@/hooks/useQuoteStore";

type QuoteDetailClientProps = {
  quoteId: string;
  locale: string;
};

export function QuoteDetailClient({ quoteId, locale }: QuoteDetailClientProps) {
  const router = useRouter();
  const t = useTranslations("dashboard.quoteDetail");
  const { current, fetchQuote, acceptQuote, rejectQuote, loading, error } = useQuoteStore();

  useEffect(() => {
    void fetchQuote(quoteId);
  }, [fetchQuote, quoteId]);

  const quote = current && current.id === quoteId ? current : undefined;
  const isFinal = quote?.status === "ACCEPTED" || quote?.status === "REJECTED";
  const isExpired = quote?.expiresAt ? new Date(quote.expiresAt) < new Date() : false;

  async function handleAccept() {
    const result = await acceptQuote(quoteId);
    if (result?.projectId) {
      router.push(`/${locale}/dashboard/projects/${result.projectId}`);
    } else {
      router.push(`/${locale}/dashboard/projects`);
    }
  }

  async function handleReject() {
    const ok = await rejectQuote(quoteId);
    if (ok) {
      void fetchQuote(quoteId);
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.14em] text-slate-500">{t("kicker")}</p>
          <h1 className="text-2xl font-bold text-slate-50">{t("title")}</h1>
        </div>
        <Link href={`/${locale}/dashboard/quotes`} className="no-underline">
          <NeonButton variant="ghost">{t("back")}</NeonButton>
        </Link>
      </div>

      {error && <p className="text-sm text-rose-300">{error}</p>}

      {quote ? (
        <div className="grid gap-4 lg:grid-cols-3">
          <DashboardCard title={t("overview")} className="lg:col-span-2">
            <div className="space-y-3 text-sm text-slate-200">
              <div className="flex flex-wrap items-center gap-3">
                <StatusBadge status={quote.status} />
                {isExpired && <span className="text-xs text-rose-300">{t("expired")}</span>}
                {quote.expiresAt && (
                  <span className="rounded-md border border-slate-800/70 bg-slate-900/60 px-2 py-1 text-xs text-slate-300">
                    {t("expires", { date: new Date(quote.expiresAt).toLocaleString(locale) })}
                  </span>
                )}
              </div>
              <div className="rounded-lg border border-slate-800/70 bg-slate-950/50 p-3">
                <div className="text-xs uppercase tracking-[0.14em] text-slate-500">
                  {t("scopeLabel")}
                </div>
                <p className="mt-2 whitespace-pre-wrap text-sm text-slate-100">
                  {quote.scope}
                </p>
              </div>
              {quote.meta?.timeline && (
                <div className="rounded-lg border border-slate-800/70 bg-slate-950/50 p-3">
                  <div className="text-xs uppercase tracking-[0.12em] text-slate-500">
                    {t("timelineLabel")}
                  </div>
                  <p className="mt-2 whitespace-pre-wrap text-sm text-slate-100">
                    {quote.meta.timeline}
                  </p>
                </div>
              )}
              {quote.meta?.deliveryEstimate && (
                <div className="rounded-lg border border-slate-800/70 bg-slate-950/50 p-3">
                  <div className="text-xs uppercase tracking-[0.12em] text-slate-500">
                    {t("deliveryLabel")}
                  </div>
                  <p className="mt-2 whitespace-pre-wrap text-sm text-slate-100">
                    {quote.meta.deliveryEstimate}
                  </p>
                </div>
              )}
              {quote.meta?.phases && quote.meta.phases.length > 0 && (
                <div className="rounded-lg border border-slate-800/70 bg-slate-950/50 p-3">
                  <div className="text-xs uppercase tracking-[0.12em] text-slate-500">
                    {t("phasesLabel")}
                  </div>
                  <div className="mt-2 space-y-1 text-sm text-slate-100">
                    {quote.meta.phases.map((phase, idx) => (
                      <div
                        key={phase.key ?? `${phase.title}-${idx}`}
                        className="flex items-center justify-between text-xs"
                      >
                        <span>{phase.title ?? t("phaseLabel", { index: idx + 1 })}</span>
                        <span className="text-slate-400">
                          {phase.group ?? ""}
                          {phase.dueDate ? ` - ${phase.dueDate}` : ""}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {quote.meta?.paymentSchedule && quote.meta.paymentSchedule.length > 0 && (
                <div className="rounded-lg border border-slate-800/70 bg-slate-950/50 p-3">
                  <div className="text-xs uppercase tracking-[0.12em] text-slate-500">
                    {t("paymentScheduleLabel")}
                  </div>
                  <div className="mt-2 space-y-1 text-sm text-slate-100">
                    {quote.meta.paymentSchedule.map((item, idx) => (
                      <div key={`${item.label}-${idx}`} className="flex items-center justify-between text-xs">
                        <span>{item.label ?? t("milestoneLabel", { index: idx + 1 })}</span>
                        {(() => {
                          const amountValue =
                            typeof item.amount === "number"
                              ? item.amount
                              : item.amount
                                ? Number(item.amount)
                                : undefined;
                          const hasAmount = typeof amountValue === "number" && !Number.isNaN(amountValue);
                          return (
                            <span className="text-emerald-200">
                              {hasAmount ? `${quote.currency} ${amountValue.toLocaleString()}` : t("emptyValue")}
                              {item.dueDate ? ` - ${item.dueDate}` : ""}
                            </span>
                          );
                        })()}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {quote.meta?.paymentNotes && (
                <div className="rounded-lg border border-slate-800/70 bg-slate-950/50 p-3">
                  <div className="text-xs uppercase tracking-[0.12em] text-slate-500">
                    {t("notesLabel")}
                  </div>
                  <p className="mt-2 whitespace-pre-wrap text-sm text-slate-100">
                    {quote.meta.paymentNotes}
                  </p>
                </div>
              )}
              <div className="grid gap-3 md:grid-cols-3">
                <div className="rounded-lg border border-slate-800/70 bg-slate-950/50 p-3">
                  <div className="text-xs uppercase tracking-[0.12em] text-slate-500">
                    {t("amountLabel")}
                  </div>
                  <div className="text-lg font-semibold text-slate-50">
                    {quote.currency} {quote.amount.toLocaleString()}
                  </div>
                </div>
                <div className="rounded-lg border border-slate-800/70 bg-slate-950/50 p-3">
                  <div className="text-xs uppercase tracking-[0.12em] text-slate-500">
                    {t("statusLabel")}
                  </div>
                  <div className="mt-1">
                    <StatusBadge status={quote.status} />
                  </div>
                </div>
                <div className="rounded-lg border border-slate-800/70 bg-slate-950/50 p-3">
                  <div className="text-xs uppercase tracking-[0.12em] text-slate-500">
                    {t("createdLabel")}
                  </div>
                  <div className="text-sm text-slate-200">
                    {quote.createdAt ? new Date(quote.createdAt).toLocaleString(locale) : t("emptyValue")}
                  </div>
                </div>
              </div>
            </div>
          </DashboardCard>

          <DashboardCard title={t("requestTitle")}>
            <dl className="space-y-2 text-sm text-slate-200">
              <div className="flex justify-between gap-2">
                <dt className="text-slate-400">{t("clientLabel")}</dt>
                <dd className="font-semibold text-slate-100">
                  {quote.request?.fullName ?? t("emptyValue")}
                </dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-slate-400">{t("emailLabel")}</dt>
                <dd className="text-slate-100">{quote.request?.email ?? t("emptyValue")}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-slate-400">{t("projectTypeLabel")}</dt>
                <dd className="text-slate-100">{quote.request?.projectType ?? t("emptyValue")}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-slate-400">{t("budgetLabel")}</dt>
                <dd className="text-slate-100">{quote.request?.budgetRange ?? t("emptyValue")}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-slate-400">{t("timelineLabel")}</dt>
                <dd className="text-slate-100">{quote.request?.timeline ?? t("emptyValue")}</dd>
              </div>
            </dl>
          </DashboardCard>
        </div>
      ) : (
        <DashboardCard>
          <p className="text-sm text-slate-300">
            {loading ? t("loading") : t("notFound")}
          </p>
        </DashboardCard>
      )}

      {quote && (
        <div className="flex flex-wrap gap-3">
          <NeonButton variant="success" disabled={isFinal || isExpired} onClick={() => void handleAccept()}>
            {t("accept")}
          </NeonButton>
          <NeonButton variant="ghost" disabled={isFinal} onClick={() => void handleReject()}>
            {t("reject")}
          </NeonButton>
        </div>
      )}
    </div>
  );
}
