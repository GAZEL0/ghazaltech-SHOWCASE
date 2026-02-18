"use client";

import { RevisionStatus } from "@prisma/client";
import { useTranslations } from "next-intl";
import { NeonButton } from "./NeonButton";
import { StatusBadge } from "./StatusBadge";

type RevisionCardProps = {
  title: string;
  project: string;
  amount: number;
  status: RevisionStatus | string;
  createdAt?: string;
  onApprove?: () => Promise<void>;
  onReject?: () => Promise<void>;
  onView?: () => Promise<void> | void;
};

export function RevisionCard({
  title,
  project,
  amount,
  status,
  createdAt,
  onApprove,
  onReject,
  onView,
}: RevisionCardProps) {
  const t = useTranslations("dashboard.revisionCard");

  return (
    <div className="rounded-xl border border-slate-800/70 bg-slate-950/60 p-4 shadow-[0_10px_40px_rgba(0,0,0,0.35)]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-sm font-semibold text-slate-100">{title}</div>
          <div className="text-xs text-slate-400">
            {t("meta", { project, amount: amount.toFixed(2) })}
          </div>
          {createdAt && (
            <div className="text-[11px] text-slate-500">
              {new Date(createdAt).toLocaleString()}
            </div>
          )}
        </div>
        <StatusBadge status={typeof status === "string" ? status : status.toString()} />
      </div>
      {(onApprove || onReject || onView) && (
        <div className="mt-3 flex gap-2">
          {onApprove && (
            <NeonButton variant="success" onClick={() => void onApprove()}>
              {t("approve")}
            </NeonButton>
          )}
          {onReject && (
            <NeonButton variant="danger" onClick={() => void onReject()}>
              {t("reject")}
            </NeonButton>
          )}
          {onView && (
            <NeonButton variant="ghost" onClick={() => void onView()}>
              {t("view")}
            </NeonButton>
          )}
        </div>
      )}
    </div>
  );
}
