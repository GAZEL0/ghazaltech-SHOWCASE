"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { NeonButton } from "@/components/dashboard/NeonButton";
import { NeonTable } from "@/components/dashboard/NeonTable";
import { OverviewStats } from "@/components/dashboard/OverviewStats";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { useOrderStore } from "@/hooks/useOrderStore";
import { usePaymentStore } from "@/hooks/usePaymentStore";
import { useProjectStore } from "@/hooks/useProjectStore";
import { useRevisionStore } from "@/hooks/useRevisionStore";

type OverviewClientProps = {
  locale: string;
};

export function OverviewClient({ locale }: OverviewClientProps) {
  const t = useTranslations("dashboard");
  const { orders, fetchOrders } = useOrderStore();
  const { projects, fetchProjects } = useProjectStore();
  const { payments, fetchPayments } = usePaymentStore();
  const { revisions, fetchRevisions } = useRevisionStore();

  useEffect(() => {
    void fetchOrders();
    void fetchProjects();
    void fetchPayments();
    void fetchRevisions();
  }, [fetchOrders, fetchPayments, fetchProjects, fetchRevisions]);

  const stats = [
    {
      label: t("stats.activeOrders"),
      value: orders.length,
      accent: "cyan" as const,
    },
    {
      label: t("stats.inProgress"),
      value: projects.filter((p) => p.status !== "DELIVERED").length,
      accent: "emerald" as const,
    },
    {
      label: t("stats.pendingRevisions"),
      value: revisions.filter((r) => r.status === "PENDING").length,
      accent: "amber" as const,
    },
    {
      label: t("stats.pendingPayments"),
      value: payments.filter((p) => p.status !== "APPROVED").length,
      accent: "rose" as const,
    },
  ];

  const updates = [
    ...payments.slice(0, 5).map((payment) => ({
      title: `${t("updates.paymentFor")} ${payment.projectTitle ?? ""}`,
      status: payment.status,
      date: payment.createdAt ?? "",
    })),
    ...revisions.slice(0, 5).map((rev) => ({
      title: `${t("updates.revision")} ${rev.title}`,
      status: rev.status,
      date: rev.createdAt ?? "",
    })),
  ]
    .filter((item) => item.date)
    .sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    )
    .slice(0, 6);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.14em] text-slate-500">
            {t("dashboardLabel")}
          </p>
          <h1 className="text-2xl font-bold text-slate-50">{t("overview")}</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <NeonButton>{t("actions.requestRevision")}</NeonButton>
          <NeonButton variant="ghost">{t("actions.uploadProof")}</NeonButton>
          <NeonButton variant="ghost">{t("actions.openSupport")}</NeonButton>
        </div>
      </div>

      <OverviewStats stats={stats} />

      <div className="grid gap-4 lg:grid-cols-3">
        <DashboardCard title={t("quickActions.title")}>
          <div className="flex flex-wrap gap-2">
            <NeonButton>{t("actions.requestRevision")}</NeonButton>
            <NeonButton variant="ghost">{t("actions.uploadProof")}</NeonButton>
            <NeonButton variant="ghost">{t("actions.openSupport")}</NeonButton>
            <Link href={`/${locale}/custom-project`} className="no-underline">
              <NeonButton variant="success">{t("actions.newCustomProject")}</NeonButton>
            </Link>
            <Link href={`/${locale}/templates`} className="no-underline">
              <NeonButton variant="ghost">{t("actions.viewReadyMadeSites")}</NeonButton>
            </Link>
          </div>
        </DashboardCard>

        <DashboardCard title={t("updates.title")}>
          <div className="space-y-3">
            {updates.length === 0 && (
              <p className="text-sm text-slate-400">{t("updates.empty")}</p>
            )}
            {updates.map((item, idx) => (
              <div
                key={`${item.title}-${item.date}-${idx}`}
                className="rounded-lg border border-slate-800/70 bg-slate-950/50 p-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="text-sm font-semibold text-slate-100">
                    {item.title}
                  </div>
                  <StatusBadge status={item.status} />
                </div>
                <div className="text-xs text-slate-500">
                  {new Date(item.date).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </DashboardCard>

        <DashboardCard title={t("pending.title")}>
          <div className="space-y-2 text-sm text-slate-200">
            <div className="flex items-center justify-between rounded-lg border border-slate-800/70 bg-slate-950/50 px-3 py-2">
              <span>{t("pending.revisions")}</span>
              <span className="font-semibold text-amber-300">
                {revisions.filter((r) => r.status === "PENDING").length}
              </span>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-slate-800/70 bg-slate-950/50 px-3 py-2">
              <span>{t("pending.payments")}</span>
              <span className="font-semibold text-sky-300">
                {payments.filter((p) => p.status !== "APPROVED").length}
              </span>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-slate-800/70 bg-slate-950/50 px-3 py-2">
              <span>{t("pending.projects")}</span>
              <span className="font-semibold text-emerald-300">
                {projects.filter((p) => p.status !== "DELIVERED").length}
              </span>
            </div>
          </div>
        </DashboardCard>
      </div>

      <DashboardCard title={t("projectsSnapshot")}>
        <NeonTable
          headers={[
            t("projectsTable.project"),
            t("projectsTable.order"),
            t("projectsTable.status"),
            t("projectsTable.dueDate"),
            "",
          ]}
        >
          {projects.slice(0, 5).map((project) => (
            <tr key={project.id} className="hover:bg-slate-900/40">
              <td className="px-4 py-3 text-sm text-slate-100">{project.title}</td>
              <td className="px-4 py-3 text-sm text-slate-400">{project.orderId}</td>
              <td className="px-4 py-3">
                <StatusBadge status={project.status} />
              </td>
              <td className="px-4 py-3 text-sm text-slate-400">
                {project.dueDate ? new Date(project.dueDate).toLocaleDateString() : t("emptyValue")}
              </td>
              <td className="px-4 py-3 text-right">
                <Link
                  href={`/${locale}/dashboard/projects/${project.id}`}
                  className="text-xs font-semibold text-sky-300 underline underline-offset-2"
                >
                  {t("projectsTable.view")}
                </Link>
              </td>
            </tr>
          ))}
          {projects.length === 0 && (
            <tr>
              <td className="px-4 py-3 text-sm text-slate-400" colSpan={5}>
                {t("projectsTable.empty")}
              </td>
            </tr>
          )}
        </NeonTable>
      </DashboardCard>
    </div>
  );
}
