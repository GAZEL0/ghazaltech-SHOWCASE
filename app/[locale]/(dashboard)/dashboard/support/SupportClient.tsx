"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { NeonButton } from "@/components/dashboard/NeonButton";
import { NeonTable } from "@/components/dashboard/NeonTable";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import Link from "next/link";

type SupportRequest = {
  id: string;
  plan: string | null;
  projectName: string | null;
  projectType: string | null;
  siteUrl: string | null;
  builtByUs: boolean;
  notes: string;
  status: string;
  createdAt: string;
  updatedAt: string;
};

const planCredits: Record<string, number> = {
  CARE: 12,
  CARE_PLUS: 24,
  GROWTH: 45,
  AUDIT: 1,
};

export function SupportClient({ locale }: { locale: string }) {
  const t = useTranslations("dashboard.support");
  const [requests, setRequests] = useState<SupportRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [noteMessage, setNoteMessage] = useState<string | null>(null);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/support-requests", { cache: "no-store" });
      if (!res.ok) {
        throw new Error(t("errors.load"));
      }
      const data = (await res.json()) as SupportRequest[];
      setRequests(Array.isArray(data) ? data : []);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    void fetchRequests();
  }, [fetchRequests]);

  function formatDate(value?: string | null) {
    if (!value) return t("emptyValue");
    return new Date(value).toLocaleDateString(locale);
  }

  function planLabel(plan?: string | null) {
    if (!plan) return t("planLabels.unknown");
    if (plan === "CARE") return t("planLabels.CARE");
    if (plan === "CARE_PLUS") return t("planLabels.CARE_PLUS");
    if (plan === "GROWTH") return t("planLabels.GROWTH");
    if (plan === "AUDIT") return t("planLabels.AUDIT");
    return plan;
  }

  const activePlan = useMemo(
    () => requests.find((req) => req.status === "CONVERTED_TO_ORDER"),
    [requests],
  );

  const planStatus = useMemo(() => {
    if (!activePlan) return null;
    const endDate = new Date(activePlan.updatedAt);
    endDate.setFullYear(endDate.getFullYear() + 1);
    const now = new Date();
    const diffDays = Math.round((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays <= 0) return t("planStatus.expired");
    if (diffDays <= 30) return t("planStatus.expiring");
    return t("planStatus.active");
  }, [activePlan, t]);

  function handleNoteSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!note.trim()) return;
    setNoteMessage(t("noteSuccess"));
    setNote("");
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.14em] text-slate-500">{t("kicker")}</p>
          <h1 className="text-2xl font-bold text-slate-50">{t("title")}</h1>
        </div>
        <NeonButton variant="ghost" onClick={() => void fetchRequests()}>
          {loading ? t("loading") : t("refresh")}
        </NeonButton>
      </div>

      {error && <p className="text-sm text-rose-300">{error}</p>}

      <DashboardCard title={t("currentPlan.title")}>
        {activePlan ? (
          <div className="grid gap-4 md:grid-cols-3 text-sm text-slate-200">
            <div>
              <div className="text-xs uppercase tracking-[0.12em] text-slate-500">
                {t("currentPlan.plan")}
              </div>
              <div className="mt-1 text-lg font-semibold text-slate-50">
                {planLabel(activePlan.plan)}
              </div>
              <div className="text-xs text-slate-400">{planStatus}</div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-[0.12em] text-slate-500">
                {t("currentPlan.ends")}
              </div>
              <div className="mt-1 text-lg font-semibold text-slate-50">
                {(() => {
                  const endDate = new Date(activePlan.updatedAt);
                  endDate.setFullYear(endDate.getFullYear() + 1);
                  return endDate.toLocaleDateString(locale);
                })()}
              </div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-[0.12em] text-slate-500">
                {t("currentPlan.credits")}
              </div>
              <div className="mt-1 text-lg font-semibold text-slate-50">
                {planCredits[activePlan.plan ?? ""] ?? 0} {t("creditsUnit")}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-sm text-slate-400">
            {t("currentPlan.empty")}{" "}
            <Link href={`/${locale}/support`} className="text-sky-300 underline">
              {t("currentPlan.cta")}
            </Link>
          </div>
        )}
      </DashboardCard>

      <DashboardCard title={t("requestsTitle")}>
        <NeonTable
          headers={[
            t("table.project"),
            t("table.plan"),
            t("table.status"),
            t("table.created"),
          ]}
        >
          {requests.map((request) => (
            <tr key={request.id} className="hover:bg-slate-900/40">
              <td className="px-4 py-3 text-sm text-slate-100">
                <div className="font-semibold">{request.projectName ?? t("emptyValue")}</div>
                <div className="text-xs text-slate-400">{request.projectType ?? t("emptyValue")}</div>
              </td>
              <td className="px-4 py-3 text-sm text-slate-100">
                {planLabel(request.plan)}
              </td>
              <td className="px-4 py-3">
                <StatusBadge status={request.status} />
              </td>
              <td className="px-4 py-3 text-sm text-slate-400">
                {formatDate(request.createdAt)}
              </td>
            </tr>
          ))}
          {requests.length === 0 && (
            <tr>
              <td colSpan={4} className="px-4 py-3 text-sm text-slate-400">
                {t("requestsEmpty")}
              </td>
            </tr>
          )}
        </NeonTable>
      </DashboardCard>

      <DashboardCard title={t("activityTitle")}>
        {activePlan ? (
          <ul className="space-y-2 text-sm text-slate-200">
            {[0, 1, 2, 3].map((idx) => (
              <li key={`activity-${idx}`} className="flex items-center justify-between gap-3">
                <span>{t(`activityItems.${idx}`)}</span>
                <span className="text-xs text-slate-500">{formatDate(activePlan.updatedAt)}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-slate-400">{t("activityEmpty")}</p>
        )}
      </DashboardCard>

      <DashboardCard title={t("noteTitle")}>
        <form onSubmit={handleNoteSubmit} className="space-y-3">
          <textarea
            rows={4}
            value={note}
            onChange={(event) => setNote(event.target.value)}
            className="w-full rounded-xl border border-slate-700/70 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-400/80"
            placeholder={t("notePlaceholder")}
          />
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
            <span>{t("noteHelper")}</span>
            <NeonButton type="submit" className="px-4 py-2 text-xs">
              {t("noteSubmit")}
            </NeonButton>
          </div>
          {noteMessage && <p className="text-sm text-emerald-300">{noteMessage}</p>}
        </form>
      </DashboardCard>
    </div>
  );
}
