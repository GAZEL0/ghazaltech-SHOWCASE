"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { InvoiceRow } from "@/components/dashboard/InvoiceRow";
import { NeonTable } from "@/components/dashboard/NeonTable";
import { useProjectStore } from "@/hooks/useProjectStore";

export function InvoicesClient() {
  const t = useTranslations("dashboard");
  const { projects, fetchProjects } = useProjectStore();

  useEffect(() => {
    void fetchProjects();
  }, [fetchProjects]);

  const invoices = projects.flatMap((project) =>
    (project.invoices ?? []).map((invoice) => ({
      ...invoice,
      projectTitle: project.title,
    })),
  );

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs uppercase tracking-[0.14em] text-slate-500">
          {t("invoicesLabel")}
        </p>
        <h1 className="text-2xl font-bold text-slate-50">{t("invoices")}</h1>
      </div>
      <NeonTable
        headers={[
          t("invoicesTable.invoice"),
          t("invoicesTable.amountDue"),
          t("invoicesTable.amountPaid"),
          t("invoicesTable.status"),
          t("invoicesTable.link"),
        ]}
      >
        {invoices.map((invoice) => (
          <InvoiceRow
            key={invoice.id}
            id={invoice.id}
            amountDue={invoice.amountDue}
            amountPaid={invoice.amountPaid}
            status={invoice.status}
            issuedAt={invoice.issuedAt}
            pdfUrl={invoice.pdfUrl}
          />
        ))}
        {invoices.length === 0 && (
          <tr>
            <td className="px-4 py-3 text-sm text-slate-400" colSpan={5}>
              {t("invoicesTable.empty")}
            </td>
          </tr>
        )}
      </NeonTable>
    </div>
  );
}
