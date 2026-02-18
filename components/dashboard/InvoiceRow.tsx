import { InvoiceStatus } from "@prisma/client";
import { StatusBadge } from "./StatusBadge";
import { useTranslations } from "next-intl";

type InvoiceRowProps = {
  id: string;
  amountDue: number;
  amountPaid: number;
  status: InvoiceStatus | string;
  issuedAt?: string | null;
  pdfUrl?: string | null;
};

export function InvoiceRow({
  id,
  amountDue,
  amountPaid,
  status,
  issuedAt,
  pdfUrl,
}: InvoiceRowProps) {
  const t = useTranslations("dashboard.invoiceRow");
  return (
    <tr className="hover:bg-slate-900/40">
      <td className="px-4 py-3">
        <div className="text-sm font-semibold text-slate-100">{id}</div>
        <div className="text-[11px] text-slate-500">
          {issuedAt ? new Date(issuedAt).toLocaleDateString() : ""}
        </div>
      </td>
      <td className="px-4 py-3 text-sm text-slate-100">
        {t("amount", { amount: amountDue.toFixed(2) })}
      </td>
      <td className="px-4 py-3 text-sm text-slate-100">
        {t("amount", { amount: amountPaid.toFixed(2) })}
      </td>
      <td className="px-4 py-3">
        <StatusBadge status={typeof status === "string" ? status : status.toString()} />
      </td>
      <td className="px-4 py-3">
        {pdfUrl ? (
          <a
            href={pdfUrl}
            className="text-xs font-semibold text-sky-300 underline underline-offset-2"
          >
            {t("download")}
          </a>
        ) : (
          <span className="text-xs text-slate-500">{t("pending")}</span>
        )}
      </td>
    </tr>
  );
}
