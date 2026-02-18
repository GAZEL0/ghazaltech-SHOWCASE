"use client";

import { MilestoneStatus } from "@prisma/client";
import { useTranslations } from "next-intl";
import { FileUploader } from "./FileUploader";
import { NeonButton } from "./NeonButton";
import { StatusBadge } from "./StatusBadge";

type MilestoneCardProps = {
  id: string;
  projectId?: string;
  label: string;
  amount: number;
  status: MilestoneStatus | string;
  proofUrl?: string | null;
  dueDate?: string | null;
  onMarkPaid?: () => Promise<void>;
  highlight?: boolean;
};

export function MilestoneCard({
  id,
  projectId,
  label,
  amount,
  status,
  proofUrl,
  dueDate,
  onMarkPaid,
  highlight = false,
}: MilestoneCardProps) {
  const t = useTranslations("dashboard.paymentsCard");
  const isPayment = amount > 0;

  return (
    <div
      className={`rounded-xl border p-4 shadow-[0_10px_40px_rgba(0,0,0,0.35)] ${
        highlight
          ? "border-emerald-500/50 bg-emerald-900/20"
          : "border-slate-800/70 bg-slate-950/50"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="text-sm font-semibold text-slate-100">{label}</div>
          <div className="text-xs text-slate-400">
            {t("amount", { amount: amount.toFixed(2) })}
          </div>
          {dueDate && (
            <div className="text-[11px] text-slate-500">
              {t("due", { date: new Date(dueDate).toLocaleDateString() })}
            </div>
          )}
          {proofUrl && proofUrl.startsWith("http") ? (
            <a
              href={proofUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] text-sky-300 underline underline-offset-2"
            >
              {t("viewProof")}
            </a>
          ) : (
            <span className="text-[11px] text-slate-500">
              {isPayment ? t("noProof") : t("noPayment")}
            </span>
          )}
        </div>
        <StatusBadge status={typeof status === "string" ? status : status.toString()} />
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        {!proofUrl && isPayment && (
          <FileUploader paymentId={id} projectId={projectId} />
        )}
        {status === MilestoneStatus.UNDER_REVIEW && (
          <span className="text-xs text-amber-300">{t("underReview")}</span>
        )}
        {onMarkPaid && (
          <NeonButton variant="success" onClick={() => void onMarkPaid()}>
            {t("markApproved")}
          </NeonButton>
        )}
      </div>
    </div>
  );
}
