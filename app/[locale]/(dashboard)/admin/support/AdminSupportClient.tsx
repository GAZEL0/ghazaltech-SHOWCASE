"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { NeonButton } from "@/components/dashboard/NeonButton";
import { NeonTable } from "@/components/dashboard/NeonTable";
import { StatusBadge } from "@/components/dashboard/StatusBadge";

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
  client: {
    name: string;
    email: string;
  };
};

const planCredits: Record<string, number> = {
  CARE: 12,
  CARE_PLUS: 24,
  GROWTH: 45,
  AUDIT: 1,
};

export function AdminSupportClient({ locale }: { locale: string }) {
  const t = useTranslations("dashboard.supportAdmin");
  const [requests, setRequests] = useState<SupportRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<SupportRequest | null>(null);

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

  async function updateStatus(id: string, status: string) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/support-requests", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      if (!res.ok) {
        throw new Error(t("errors.update"));
      }
      await fetchRequests();
      setSelected(null);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  function formatDate(value?: string | null) {
    if (!value) return t("emptyValue");
    return new Date(value).toLocaleDateString(locale);
  }

  const activeSubscriptions = useMemo(
    () => requests.filter((req) => req.status === "CONVERTED_TO_ORDER"),
    [requests],
  );

  function planLabel(plan?: string | null) {
    if (!plan) return t("planLabels.unknown");
    if (plan === "CARE") return t("planLabels.CARE");
    if (plan === "CARE_PLUS") return t("planLabels.CARE_PLUS");
    if (plan === "GROWTH") return t("planLabels.GROWTH");
    if (plan === "AUDIT") return t("planLabels.AUDIT");
    return plan;
  }

  function getSubscriptionStatus(updatedAt: string) {
    const endDate = new Date(updatedAt);
    endDate.setFullYear(endDate.getFullYear() + 1);
    const now = new Date();
    const diffDays = Math.round((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays <= 0) {
      return { key: "expired", label: t("subscriptionStatuses.expired") };
    }
    if (diffDays <= 30) {
      return { key: "expiring", label: t("subscriptionStatuses.expiring") };
    }
    return { key: "active", label: t("subscriptionStatuses.active") };
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

      <DashboardCard title={t("requestsTitle")}>
        <NeonTable
          headers={[
            t("table.project"),
            t("table.plan"),
            t("table.client"),
            t("table.status"),
            t("table.created"),
            "",
          ]}
        >
          {requests.map((request) => (
            <tr key={request.id} className="hover:bg-slate-900/40">
              <td className="px-4 py-3 text-sm">
                <div className="font-semibold text-slate-100">
                  {request.projectName ?? t("emptyValue")}
                </div>
                <div className="text-xs text-slate-400">{request.projectType ?? t("emptyValue")}</div>
              </td>
              <td className="px-4 py-3 text-sm text-slate-100">
                {planLabel(request.plan)}
              </td>
              <td className="px-4 py-3 text-sm text-slate-100">
                <div className="font-semibold">{request.client.name}</div>
                <div className="text-xs text-slate-400">{request.client.email}</div>
              </td>
              <td className="px-4 py-3">
                <StatusBadge status={request.status} />
              </td>
              <td className="px-4 py-3 text-sm text-slate-400">{formatDate(request.createdAt)}</td>
              <td className="px-4 py-3 text-right">
                <NeonButton
                  variant="ghost"
                  className="px-3 py-1 text-xs"
                  onClick={() => setSelected(request)}
                >
                  {t("actions.review")}
                </NeonButton>
              </td>
            </tr>
          ))}
          {requests.length === 0 && (
            <tr>
              <td colSpan={6} className="px-4 py-3 text-sm text-slate-400">
                {t("empty")}
              </td>
            </tr>
          )}
        </NeonTable>
      </DashboardCard>

      <DashboardCard title={t("subscriptionsTitle")}>
        <NeonTable
          headers={[
            t("table.project"),
            t("table.plan"),
            t("table.period"),
            t("table.credits"),
            t("table.status"),
            t("table.alerts"),
          ]}
        >
          {activeSubscriptions.map((sub) => {
            const status = getSubscriptionStatus(sub.updatedAt);
            const startDate = formatDate(sub.updatedAt);
            const endDate = (() => {
              const date = new Date(sub.updatedAt);
              date.setFullYear(date.getFullYear() + 1);
              return date.toLocaleDateString(locale);
            })();
            const credits = planCredits[sub.plan ?? ""] ?? 0;

            return (
              <tr key={sub.id} className="hover:bg-slate-900/40">
                <td className="px-4 py-3 text-sm text-slate-100">
                  <div className="font-semibold">{sub.projectName ?? t("emptyValue")}</div>
                  <div className="text-xs text-slate-400">{sub.client.email}</div>
                </td>
                <td className="px-4 py-3 text-sm text-slate-100">{planLabel(sub.plan)}</td>
                <td className="px-4 py-3 text-sm text-slate-400">
                  {startDate} {"->"} {endDate}
                </td>
                <td className="px-4 py-3 text-sm text-slate-100">
                  {credits} {t("creditsUnit")}
                </td>
                <td className="px-4 py-3 text-sm">
                  <span
                    className={`rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-wide ${
                      status.key === "expired"
                        ? "border-rose-400/60 text-rose-200"
                        : status.key === "expiring"
                          ? "border-amber-400/60 text-amber-200"
                          : "border-emerald-400/60 text-emerald-200"
                    }`}
                  >
                    {status.label}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-slate-400">
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full border border-slate-700/60 px-2 py-1">
                      {t("alerts.checkup")}
                    </span>
                    <span className="rounded-full border border-slate-700/60 px-2 py-1">
                      {t("alerts.backup")}
                    </span>
                    <span className="rounded-full border border-slate-700/60 px-2 py-1">
                      {t("alerts.expiring")}
                    </span>
                    <span className="rounded-full border border-slate-700/60 px-2 py-1">
                      {t("alerts.credits")}
                    </span>
                  </div>
                </td>
              </tr>
            );
          })}
          {activeSubscriptions.length === 0 && (
            <tr>
              <td colSpan={6} className="px-4 py-3 text-sm text-slate-400">
                {t("subscriptionsEmpty")}
              </td>
            </tr>
          )}
        </NeonTable>
      </DashboardCard>

      {selected && (
        <div
          className="fixed left-0 right-0 bottom-0 top-20 z-50 flex items-start justify-center overflow-y-auto bg-black/60 px-4 py-6"
          onClick={() => setSelected(null)}
        >
          <div
            className="w-full max-w-3xl space-y-4 rounded-2xl border border-slate-800/70 bg-[#050b18] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.6)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.14em] text-slate-500">
                  {t("reviewTitle")}
                </p>
                <h3 className="text-xl font-bold text-slate-50">
                  {selected.projectName ?? t("emptyValue")}
                </h3>
                <p className="text-sm text-slate-400">{selected.client.email}</p>
              </div>
              <NeonButton variant="ghost" onClick={() => setSelected(null)}>
                {t("actions.close")}
              </NeonButton>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <DashboardCard title={t("detailTitle")}>
                <div className="space-y-2 text-sm text-slate-200">
                  <div>{t("detailPlan")}: {planLabel(selected.plan)}</div>
                  <div>{t("detailProjectType")}: {selected.projectType ?? t("emptyValue")}</div>
                  <div>{t("detailSite")}: {selected.siteUrl ?? t("emptyValue")}</div>
                  <div>{t("detailBuiltByUs")}: {selected.builtByUs ? t("yes") : t("no")}</div>
                </div>
              </DashboardCard>
              <DashboardCard title={t("detailNotes")}>
                <p className="text-sm text-slate-200 whitespace-pre-wrap">
                  {selected.notes || t("emptyValue")}
                </p>
              </DashboardCard>
            </div>

            <DashboardCard title={t("activityTitle")}>
              <ul className="space-y-2 text-sm text-slate-200">
                {[0, 1, 2, 3].map((idx) => (
                  <li key={`log-${idx}`} className="flex items-center justify-between gap-3">
                    <span>{t(`activityItems.${idx}`)}</span>
                    <span className="text-xs text-slate-500">{formatDate(selected.updatedAt)}</span>
                  </li>
                ))}
              </ul>
            </DashboardCard>

            <div className="flex flex-wrap items-center justify-end gap-2">
              <NeonButton
                variant="ghost"
                className="px-3 py-1 text-xs"
                onClick={() => void updateStatus(selected.id, "REVIEWED")}
              >
                {t("actions.review")}
              </NeonButton>
              <NeonButton
                variant="danger"
                className="px-3 py-1 text-xs"
                onClick={() => void updateStatus(selected.id, "REJECTED")}
              >
                {t("actions.reject")}
              </NeonButton>
              <NeonButton
                variant="success"
                className="px-3 py-1 text-xs"
                onClick={() => void updateStatus(selected.id, "CONVERTED_TO_ORDER")}
              >
                {t("actions.activate")}
              </NeonButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
