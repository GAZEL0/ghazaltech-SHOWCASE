"use client";

import { useTranslations } from "next-intl";

type StatusBadgeProps = {
  status: string;
};

const statusPalette: Record<string, string> = {
  PENDING: "bg-amber-500/20 text-amber-200 border-amber-400/50",
  EARNED: "bg-emerald-500/20 text-emerald-200 border-emerald-400/60",
  PAID_OUT: "bg-slate-500/20 text-slate-200 border-slate-400/60",
  UNDER_REVIEW: "bg-sky-500/20 text-sky-200 border-sky-400/50",
  APPROVED: "bg-emerald-500/20 text-emerald-200 border-emerald-400/60",
  REJECTED: "bg-rose-500/20 text-rose-100 border-rose-400/60",
  SENT: "bg-sky-500/15 text-sky-100 border-sky-400/50",
  DRAFT: "bg-slate-500/15 text-slate-100 border-slate-400/50",
  ACCEPTED: "bg-emerald-500/20 text-emerald-100 border-emerald-400/60",
  REVIEWED: "bg-indigo-500/20 text-indigo-100 border-indigo-400/60",
  CONFIRMED: "bg-indigo-500/20 text-indigo-100 border-indigo-400/60",
  CONVERTED_TO_ORDER: "bg-emerald-500/20 text-emerald-100 border-emerald-400/60",
  IN_PROGRESS: "bg-indigo-500/20 text-indigo-100 border-indigo-400/60",
  COMPLETED: "bg-emerald-500/20 text-emerald-100 border-emerald-400/60",
  BLOCKED: "bg-rose-500/20 text-rose-100 border-rose-400/60",
  DELIVERED: "bg-emerald-500/20 text-emerald-100 border-emerald-400/60",
  CANCELLED: "bg-rose-500/20 text-rose-100 border-rose-400/60",
  UNPAID: "bg-rose-500/20 text-rose-100 border-rose-400/60",
  PARTIAL: "bg-amber-500/20 text-amber-100 border-amber-400/60",
  PAID: "bg-emerald-500/20 text-emerald-100 border-emerald-400/60",
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const t = useTranslations("statusLabels");
  const key = status?.toUpperCase?.() ?? "PENDING";
  const palette = statusPalette[key] ?? statusPalette.PENDING;
  const label = t(key);

  return (
    <span className={`status-badge inline-flex items-center gap-1 rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-wide ${palette}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current shadow-[0_0_12px_currentColor]" />
      {label}
    </span>
  );
}
