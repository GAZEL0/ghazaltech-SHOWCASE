"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { NeonButton } from "@/components/dashboard/NeonButton";
import { NeonTable } from "@/components/dashboard/NeonTable";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { useQuoteStore } from "@/hooks/useQuoteStore";

type QuotesClientProps = {
  locale: string;
};

export function QuotesClient({ locale }: QuotesClientProps) {
  const t = useTranslations("dashboard.quotesPage");
  const { quotes, fetchQuotes, loading, error } = useQuoteStore();

  useEffect(() => {
    void fetchQuotes();
  }, [fetchQuotes]);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.14em] text-slate-500">
            {t("kicker")}
          </p>
          <h1 className="text-2xl font-bold text-slate-50">{t("title")}</h1>
        </div>
        <NeonButton variant="ghost" onClick={() => void fetchQuotes()}>
          {t("refresh")}
        </NeonButton>
      </div>

      {error && <p className="text-sm text-rose-300">{error}</p>}

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
              </td>
              <td className="px-4 py-3 text-sm text-slate-300">
                {quote.expiresAt ? new Date(quote.expiresAt).toLocaleDateString(locale) : t("noExpiry")}
              </td>
              <td className="px-4 py-3 text-right">
                <Link
                  href={`/${locale}/dashboard/quotes/${quote.id}`}
                  className="text-xs font-semibold text-sky-300 underline underline-offset-2"
                >
                  {t("view")}
                </Link>
              </td>
            </tr>
          ))}
          {quotes.length === 0 && (
            <tr>
              <td className="px-4 py-3 text-sm text-slate-400" colSpan={5}>
                {loading ? t("loading") : t("empty")}
              </td>
            </tr>
          )}
        </NeonTable>
      </DashboardCard>
    </div>
  );
}
