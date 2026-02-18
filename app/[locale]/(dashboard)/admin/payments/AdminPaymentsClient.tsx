"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { NeonButton } from "@/components/dashboard/NeonButton";
import { NeonTable } from "@/components/dashboard/NeonTable";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { usePaymentStore } from "@/hooks/usePaymentStore";
import Link from "next/link";

export function AdminPaymentsClient() {
  const t = useTranslations("dashboard.admin");
  const { payments, fetchPayments, updatePaymentStatus, archivePayment } = usePaymentStore();

  useEffect(() => {
    void fetchPayments();
  }, [fetchPayments]);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.14em] text-slate-500">
            {t("label")}
          </p>
          <h1 className="text-2xl font-bold text-slate-50">{t("paymentsSection")}</h1>
        </div>
        <NeonButton variant="ghost" onClick={() => void fetchPayments()}>
          {t("refresh")}
        </NeonButton>
      </div>

      <DashboardCard>
        <NeonTable
          headers={[
            t("table.project"),
            t("table.label"),
            t("table.amount"),
            t("table.status"),
            t("table.proof"),
            "",
          ]}
        >
          {payments.map((payment) => (
            <tr key={payment.id} className="hover:bg-slate-900/40">
              <td className="px-4 py-3 text-sm text-slate-100">
                {payment.projectTitle ?? payment.projectId}
              </td>
              <td className="px-4 py-3 text-sm text-slate-100">{payment.label}</td>
              <td className="px-4 py-3 text-sm text-slate-100">
                USD {payment.amount.toFixed(2)}
              </td>
              <td className="px-4 py-3">
                <StatusBadge status={payment.status} />
              </td>
              <td className="px-4 py-3 text-sm text-slate-400">
                {payment.proofUrl && payment.proofUrl.startsWith("http") ? (
                  <Link
                    href={payment.proofUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-sky-300 underline underline-offset-2"
                  >
                    {t("table.proof")}
                  </Link>
                ) : (
                  t("emptyValue")
                )}
              </td>
              <td className="px-4 py-3 text-right">
                <div className="flex justify-end gap-2">
                  <NeonButton
                    variant="success"
                    className="px-3 py-1 text-xs"
                    onClick={async () => {
                      await updatePaymentStatus(payment.id, "APPROVED");
                      await fetchPayments();
                    }}
                  >
                    {t("approve")}
                  </NeonButton>
                  <NeonButton
                    variant="danger"
                    className="px-3 py-1 text-xs"
                    onClick={async () => {
                      await updatePaymentStatus(payment.id, "REJECTED");
                      await fetchPayments();
                    }}
                  >
                    {t("reject")}
                  </NeonButton>
                  <NeonButton
                    variant="ghost"
                    className="px-3 py-1 text-xs"
                    onClick={async () => {
                      await archivePayment(payment.id, true);
                      await fetchPayments();
                    }}
                  >
                    {t("actions.archive")}
                  </NeonButton>
                </div>
              </td>
            </tr>
          ))}
          {payments.length === 0 && (
            <tr>
              <td className="px-4 py-3 text-sm text-slate-400" colSpan={6}>
                {t("paymentsSummary.empty")}
              </td>
            </tr>
          )}
        </NeonTable>
      </DashboardCard>
    </div>
  );
}
