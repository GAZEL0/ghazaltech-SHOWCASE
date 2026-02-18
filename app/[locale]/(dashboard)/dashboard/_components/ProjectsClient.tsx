"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { NeonButton } from "@/components/dashboard/NeonButton";
import { NeonTable } from "@/components/dashboard/NeonTable";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { useProjectStore } from "@/hooks/useProjectStore";

type ProjectsClientProps = {
  locale: string;
};

export function ProjectsClient({ locale }: ProjectsClientProps) {
  const t = useTranslations("dashboard");
  const { projects, fetchProjects, loading } = useProjectStore();

  useEffect(() => {
    void fetchProjects();
  }, [fetchProjects]);

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs uppercase tracking-[0.14em] text-slate-500">
          {t("projectsLabel")}
        </p>
        <h1 className="text-2xl font-bold text-slate-50">{t("projects")}</h1>
      </div>
      <NeonTable
        headers={[
          t("projectsTable.project"),
          t("projectsTable.status"),
          t("projectsTable.order"),
          t("projectsTable.milestone"),
          t("projectsTable.dueDate"),
          "",
        ]}
      >
        {loading && (
          <tr>
            <td className="px-4 py-3 text-sm text-slate-400" colSpan={6}>
              {t("loading")}
            </td>
          </tr>
        )}
        {!loading &&
          projects.map((project) => {
            const sortedMilestones = [...(project.milestonePayments ?? [])].sort((a, b) => {
              const dueA = a.dueDate ? new Date(a.dueDate).getTime() : null;
              const dueB = b.dueDate ? new Date(b.dueDate).getTime() : null;
              if (dueA !== null || dueB !== null) {
                if (dueA !== null && dueB !== null && dueA !== dueB) return dueA - dueB;
                if (dueA !== null && dueB === null) return -1;
                if (dueA === null && dueB !== null) return 1;
              }
              const timeA = a.createdAt ? new Date(a.createdAt).getTime() : Number.MAX_SAFE_INTEGER;
              const timeB = b.createdAt ? new Date(b.createdAt).getTime() : Number.MAX_SAFE_INTEGER;
              if (timeA !== timeB) return timeA - timeB;
              return a.label.localeCompare(b.label);
            });
            const nextMilestone = sortedMilestones[0];
            return (
              <tr key={project.id} className="hover:bg-slate-900/40">
                <td className="px-4 py-3 text-sm font-semibold text-slate-100">
                  {project.title}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={project.status} />
                </td>
                <td className="px-4 py-3 text-sm text-slate-400">{project.orderId}</td>
                <td className="px-4 py-3 text-sm text-slate-400">
                  {nextMilestone
                    ? t("projectsTable.milestoneValue", {
                        label: nextMilestone.label,
                        amount: nextMilestone.amount,
                      })
                    : t("emptyValue")}
                </td>
                <td className="px-4 py-3 text-sm text-slate-400">
                  {project.dueDate ? new Date(project.dueDate).toLocaleDateString() : t("emptyValue")}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/${locale}/dashboard/projects/${project.id}`} className="no-underline">
                    <NeonButton variant="ghost" className="px-3 py-1.5 text-xs">
                      {t("projectsTable.view")}
                    </NeonButton>
                  </Link>
                </td>
              </tr>
            );
          })}
        {!loading && projects.length === 0 && (
          <tr>
            <td className="px-4 py-3 text-sm text-slate-400" colSpan={6}>
              {t("projectsTable.empty")}
            </td>
          </tr>
        )}
      </NeonTable>
    </div>
  );
}
