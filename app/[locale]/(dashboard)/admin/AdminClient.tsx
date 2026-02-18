"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { NeonButton } from "@/components/dashboard/NeonButton";
import { NeonTable } from "@/components/dashboard/NeonTable";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { usePaymentStore } from "@/hooks/usePaymentStore";
import { useProjectStore } from "@/hooks/useProjectStore";
import { useOrderStore } from "@/hooks/useOrderStore";
import { useRevisionStore } from "@/hooks/useRevisionStore";
import { RevisionsClient } from "../dashboard/_components/RevisionsClient";

type PaymentRow = {
  id: string;
  bucket: string;
  projectLabel: string;
  label: string;
  amount: number;
  status: string;
};

export function AdminClient({ locale }: { locale: string }) {
  const t = useTranslations("dashboard.admin");
  const tDashboard = useTranslations("dashboard");
  const { payments, fetchPayments, archivePayment } = usePaymentStore();
  const {
    projects,
    fetchProjects,
    fetchProject,
    updateStatus,
    updatePhaseStatus,
    addPhaseDeliverable,
    addPhaseComment,
    archiveProject,
    current,
  } = useProjectStore();
  const { orders, fetchOrders } = useOrderStore();
  const { revisions, fetchRevisions } = useRevisionStore();

  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [projectError, setProjectError] = useState<string | null>(null);
  const [deliverableLinks, setDeliverableLinks] = useState<Record<string, string>>({});
  const [deliverableFiles, setDeliverableFiles] = useState<Record<string, File | undefined>>({});
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({});
  const [commentFiles, setCommentFiles] = useState<Record<string, File | undefined>>({});
  const [sectionsOpen, setSectionsOpen] = useState({
    overview: true,
    projects: false,
    payments: false,
    revisions: false,
  });
  const phaseGroupLabels: Record<string, string> = {
    REQUIREMENTS: tDashboard("phases.requirements"),
    DESIGN: tDashboard("phases.design"),
    DEV: tDashboard("phases.dev"),
    QA: tDashboard("phases.qa"),
    DELIVERED: tDashboard("phases.delivered"),
  };
  const getPhaseGroupLabel = (group?: string | null) => {
    if (!group) return t("emptyValue");
    return phaseGroupLabels[group] ?? group;
  };

  useEffect(() => {
    void fetchProjects();
    void fetchPayments();
    void fetchOrders();
    void fetchRevisions();
  }, [fetchProjects, fetchPayments, fetchOrders, fetchRevisions]);

  const activeProjects = useMemo(
    () => projects.filter((project) => project.status !== "DELIVERED"),
    [projects],
  );

  const paymentRows = useMemo<PaymentRow[]>(() => {
    return payments
      .map((payment) => {
        let bucket = t("paymentsBucket.upcoming");
        if (payment.status === "APPROVED") {
          bucket = t("paymentsBucket.received");
        } else if (payment.status === "UNDER_REVIEW") {
          bucket = t("paymentsBucket.awaiting");
        }

        return {
          id: payment.id,
          bucket,
          projectLabel: payment.projectTitle ?? payment.projectId,
          label: payment.label,
          amount: payment.amount,
          status: payment.status,
        };
      })
      .sort((a, b) => a.bucket.localeCompare(b.bucket));
  }, [payments, t]);

  const activeProjectsCount = useMemo(
    () => projects.filter((project) => project.status !== "DELIVERED").length,
    [projects],
  );
  const newOrdersCount = useMemo(
    () => orders.filter((order) => order.status === "PENDING").length,
    [orders],
  );
  const pendingRevisionsCount = useMemo(
    () => revisions.filter((revision) => revision.status === "PENDING").length,
    [revisions],
  );
  const pendingPaymentsCount = useMemo(
    () => payments.filter((payment) => payment.status === "UNDER_REVIEW").length,
    [payments],
  );

  const alerts = useMemo(() => {
    const now = new Date();
    const soon = new Date(now);
    soon.setDate(now.getDate() + 7);
    const items: { id: string; label: string; due: Date; type: string }[] = [];

    projects.forEach((project) => {
      project.phases?.forEach((phase) => {
        if (!phase.dueDate) return;
        const due = new Date(phase.dueDate);
        if (Number.isNaN(due.getTime())) return;
        if (phase.status === "COMPLETED") return;
        if (due <= soon) {
          items.push({
            id: `phase-${phase.id}`,
            label: t("alerts.phaseDue", { project: project.title, phase: phase.title }),
            due,
            type: "phase",
          });
        }
      });
    });

    payments.forEach((payment) => {
      if (!payment.dueDate || payment.status !== "PENDING") return;
      const due = new Date(payment.dueDate);
      if (Number.isNaN(due.getTime())) return;
      if (due <= soon) {
        items.push({
          id: `payment-${payment.id}`,
          label: t("alerts.paymentDue", { project: payment.projectTitle ?? t("alerts.unknownProject"), label: payment.label }),
          due,
          type: "payment",
        });
      }
    });

    return items.sort((a, b) => a.due.getTime() - b.due.getTime()).slice(0, 8);
  }, [payments, projects, t]);

  function toggleSection(key: keyof typeof sectionsOpen) {
    setSectionsOpen((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function formatDate(date?: string | null) {
    if (!date) return t("emptyValue");
    return new Date(date).toLocaleDateString(locale);
  }

  async function openProject(projectId: string) {
    setSelectedProjectId(projectId);
    setProjectError(null);
    await fetchProject(projectId);
  }

  function closeProject() {
    setSelectedProjectId(null);
    setProjectError(null);
  }

  const activeProject = current?.id === selectedProjectId ? current : undefined;
  const projectMilestones = activeProject?.milestonePayments ?? [];
  const projectPhases = activeProject?.phases ?? [];
  const modalProjectId = activeProject?.id ?? selectedProjectId ?? "";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.14em] text-slate-500">
            {t("label")}
          </p>
          <h1 className="text-2xl font-bold text-slate-50">{t("title")}</h1>
        </div>
        <div className="flex gap-2">
          <NeonButton variant="ghost" onClick={() => void fetchProjects()}>
            {t("refresh")}
          </NeonButton>
        </div>
      </div>

      <DashboardCard
        title={t("overviewCard.title")}
        action={
          <NeonButton
            variant="ghost"
            className="px-3 py-1 text-xs"
            onClick={() => toggleSection("overview")}
          >
            {sectionsOpen.overview ? t("actions.collapse") : t("actions.expand")}
          </NeonButton>
        }
      >
        {sectionsOpen.overview && (
          <div className="space-y-4">
            <NeonTable headers={[t("overviewCard.metric"), t("overviewCard.count")]}>
              <tr className="hover:bg-slate-900/40">
                <td className="px-4 py-3 text-sm text-slate-100">{t("overviewCard.activeProjects")}</td>
                <td className="px-4 py-3 text-sm text-slate-100">{activeProjectsCount}</td>
              </tr>
              <tr className="hover:bg-slate-900/40">
                <td className="px-4 py-3 text-sm text-slate-100">{t("overviewCard.newOrders")}</td>
                <td className="px-4 py-3 text-sm text-slate-100">{newOrdersCount}</td>
              </tr>
              <tr className="hover:bg-slate-900/40">
                <td className="px-4 py-3 text-sm text-slate-100">{t("overviewCard.newRevisions")}</td>
                <td className="px-4 py-3 text-sm text-slate-100">{pendingRevisionsCount}</td>
              </tr>
              <tr className="hover:bg-slate-900/40">
                <td className="px-4 py-3 text-sm text-slate-100">{t("overviewCard.paymentsToReview")}</td>
                <td className="px-4 py-3 text-sm text-slate-100">{pendingPaymentsCount}</td>
              </tr>
              <tr className="hover:bg-slate-900/40">
                <td className="px-4 py-3 text-sm text-slate-100">
                  {t("overviewCard.upcomingDeadlines", { days: 7 })}
                </td>
                <td className="px-4 py-3 text-sm text-slate-100">{alerts.length}</td>
              </tr>
            </NeonTable>

            <div className="space-y-2">
              <div className="text-xs uppercase tracking-[0.12em] text-slate-500">
                {t("alerts.title")}
              </div>
              {alerts.length === 0 && (
                <p className="text-sm text-slate-400">{t("alerts.empty")}</p>
              )}
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className="flex items-center justify-between rounded-lg border border-slate-800/70 bg-slate-950/50 px-3 py-2 text-sm text-slate-100"
                >
                  <span>{alert.label}</span>
                  <span className="text-xs text-amber-300">
                    {alert.due.toLocaleDateString(locale)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </DashboardCard>

      <div id="projects">
        <DashboardCard
          title={t("projectsSection")}
          action={
            <div className="flex items-center gap-2">
              <NeonButton
                variant="ghost"
                className="px-3 py-1 text-xs"
                onClick={() => void fetchProjects()}
              >
                {t("refresh")}
              </NeonButton>
              <NeonButton
                variant="ghost"
                className="px-3 py-1 text-xs"
                onClick={() => toggleSection("projects")}
              >
                {sectionsOpen.projects ? t("actions.collapse") : t("actions.expand")}
              </NeonButton>
            </div>
          }
        >
          {sectionsOpen.projects && (
            <div className="space-y-3">
              {activeProjects.map((project) => (
                <div
                  key={project.id}
                  className="flex items-start justify-between gap-3 rounded-lg border border-slate-800/70 bg-slate-950/50 px-3 py-2"
                >
                  <div>
                    <div className="text-sm font-semibold text-slate-100">
                      {project.title}
                    </div>
                    <div className="text-xs text-slate-400">
                      {t("projectStatusLabel")}: {project.status}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <NeonButton
                      variant="ghost"
                      className="px-3 py-1 text-xs"
                      onClick={() => void openProject(project.id)}
                    >
                      {t("updateProjectStatus")}
                    </NeonButton>
                    <NeonButton
                      variant="danger"
                      className="px-3 py-1 text-xs"
                      onClick={() => void archiveProject(project.id, true)}
                    >
                    {t("actions.archive")}
                    </NeonButton>
                  </div>
                </div>
              ))}
              {activeProjects.length === 0 && (
                <p className="text-sm text-slate-400">{t("noActiveProjects")}</p>
              )}
            </div>
          )}
        </DashboardCard>
      </div>

      <div id="payments-summary">
        <DashboardCard
          title={t("paymentsSummaryTitle")}
          action={
            <div className="flex items-center gap-2">
              <NeonButton
                variant="ghost"
                className="px-3 py-1 text-xs"
                onClick={() => void fetchPayments()}
              >
                {t("refresh")}
              </NeonButton>
              <NeonButton
                variant="ghost"
                className="px-3 py-1 text-xs"
                onClick={() => toggleSection("payments")}
              >
                {sectionsOpen.payments ? t("actions.collapse") : t("actions.expand")}
              </NeonButton>
            </div>
          }
        >
          {sectionsOpen.payments && (
            <NeonTable
              headers={[
                t("paymentsSummary.bucket"),
                t("paymentsSummary.project"),
                t("paymentsSummary.label"),
                t("paymentsSummary.amount"),
                t("paymentsSummary.status"),
                "",
              ]}
            >
              {paymentRows.map((row) => (
                <tr key={row.id} className="hover:bg-slate-900/40">
                  <td className="px-4 py-3 text-sm text-slate-100">{row.bucket}</td>
                  <td className="px-4 py-3 text-sm text-slate-100">{row.projectLabel}</td>
                  <td className="px-4 py-3 text-sm text-slate-100">{row.label}</td>
                  <td className="px-4 py-3 text-sm text-slate-100">
                    USD {row.amount.toFixed(2)}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={row.status} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <NeonButton
                      variant="ghost"
                      className="px-3 py-1 text-xs"
                      onClick={() => void archivePayment(row.id, true)}
                    >
                    {t("actions.archive")}
                    </NeonButton>
                  </td>
                </tr>
              ))}
              {paymentRows.length === 0 && (
                <tr>
                  <td className="px-4 py-3 text-sm text-slate-400" colSpan={6}>
                    {t("paymentsSummary.empty")}
                  </td>
                </tr>
              )}
            </NeonTable>
          )}
        </DashboardCard>
      </div>

      <div id="revisions">
        <DashboardCard
          title={tDashboard("revisionsSection.title")}
          action={
            <NeonButton
              variant="ghost"
              className="px-3 py-1 text-xs"
              onClick={() => toggleSection("revisions")}
            >
              {sectionsOpen.revisions ? t("actions.collapse") : t("actions.expand")}
            </NeonButton>
          }
        >
          {sectionsOpen.revisions && <RevisionsClient locale={locale} isAdmin />}
        </DashboardCard>
      </div>

      {selectedProjectId && (
        <div
          className="fixed left-0 right-0 bottom-0 top-20 z-50 flex items-start justify-center overflow-y-auto bg-black/60 px-4 py-6 md:top-20"
          onClick={closeProject}
        >
          <div
            className="w-full max-w-4xl space-y-4 rounded-2xl border border-slate-800/70 bg-[#050b18] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.6)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.14em] text-slate-500">
                  {t("projectModal.title")}
                </p>
                <h3 className="text-xl font-bold text-slate-50">
                  {activeProject?.title ?? t("projectModal.loading")}
                </h3>
                <p className="text-sm text-slate-400">
                  {activeProject?.orderId
                    ? `${t("projectModal.orderId")}: ${activeProject.orderId}`
                    : ""}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {activeProject?.status !== "DELIVERED" && (
                  <NeonButton
                    variant="success"
                    className="px-3 py-1 text-xs"
                    onClick={() => void updateStatus(modalProjectId, "DELIVERED")}
                  >
                    {t("actions.markCompleted")}
                  </NeonButton>
                )}
                <NeonButton variant="ghost" onClick={closeProject}>
                  {t("close")}
                </NeonButton>
              </div>
            </div>

            {projectError && <p className="text-sm text-rose-300">{projectError}</p>}

            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-xl border border-slate-800/70 bg-[#0b1120]/80 p-4">
                <div className="text-xs uppercase tracking-[0.14em] text-slate-500">
                  {t("projectModal.statusSection")}
                </div>
                <div className="mt-3 space-y-2 text-sm text-slate-200">
                  <div className="flex justify-between gap-3">
                    <span className="text-slate-400">{t("projectModal.currentStatus")}</span>
                    <span>{activeProject?.status ?? t("emptyValue")}</span>
                  </div>
                  <div className="text-xs text-slate-500">
                    {t("projectModal.lastUpdated")}: {formatDate(activeProject?.updatedAt)}
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-slate-800/70 bg-[#0b1120]/80 p-4">
                <div className="text-xs uppercase tracking-[0.14em] text-slate-500">
                  {t("projectModal.detailsSection")}
                </div>
                <div className="mt-2 space-y-2 text-sm text-slate-200">
                  <div className="flex justify-between gap-3">
                    <span className="text-slate-400">{t("projectModal.status")}</span>
                    <span>{activeProject?.status ?? t("emptyValue")}</span>
                  </div>
                  <div className="flex justify-between gap-3">
                    <span className="text-slate-400">{t("projectModal.created")}</span>
                    <span>{formatDate(activeProject?.createdAt)}</span>
                  </div>
                  <div className="text-xs text-slate-400">
                    {activeProject?.description ?? t("projectModal.noDescription")}
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-slate-800/70 bg-[#0b1120]/80 p-4">
              <div className="text-xs uppercase tracking-[0.14em] text-slate-500">
              {t("projectModal.phasesTitle")}
              </div>
              <div className="mt-3 space-y-3">
                {projectPhases.length === 0 && (
                  <p className="text-sm text-slate-400">{t("projectModal.noPhases")}</p>
                )}
                {projectPhases.map((phase) => (
                  <div
                    key={phase.id}
                    className="rounded-lg border border-slate-800 bg-slate-950/60 p-3 text-sm text-slate-100"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <div className="font-semibold">{phase.title}</div>
                        <div className="text-xs text-slate-400">{getPhaseGroupLabel(phase.group)}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <StatusBadge status={phase.status} />
                        {phase.status === "PENDING" && (
                          <NeonButton
                            variant="ghost"
                            className="px-3 py-1 text-xs"
                          onClick={() => void updatePhaseStatus(modalProjectId, phase.id, "IN_PROGRESS")}
                          >
                            {t("actions.start")}
                          </NeonButton>
                        )}
                        {phase.status === "IN_PROGRESS" && (
                          <NeonButton
                            variant="success"
                            className="px-3 py-1 text-xs"
                          onClick={() => void updatePhaseStatus(modalProjectId, phase.id, "COMPLETED")}
                          >
                            {t("actions.complete")}
                          </NeonButton>
                        )}
                      </div>
                    </div>

                    {phase.description && (
                      <p className="mt-2 text-xs text-slate-400">{phase.description}</p>
                    )}
                    <div className="mt-2 space-y-2">
                      {(phase.deliverables?.length ?? 0) === 0 && (
                        <p className="text-xs text-slate-500">{t("projectModal.noDeliverables")}</p>
                      )}
                      {phase.deliverables?.map((asset) => (
                        <a
                          key={asset.id}
                          href={asset.url}
                          className="block text-xs text-sky-300 underline underline-offset-2"
                        >
                          {asset.label ?? asset.url}
                        </a>
                      ))}
                    </div>

                    <div className="mt-2 grid gap-2 md:grid-cols-2">
                      <div className="flex gap-2">
                        <input
                          value={deliverableLinks[phase.id] ?? ""}
                          onChange={(e) =>
                            setDeliverableLinks((prev) => ({
                              ...prev,
                              [phase.id]: e.target.value,
                            }))
                          }
                          className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-100 outline-none focus:border-cyan-400/70"
                          placeholder={t("projectModal.linkPlaceholder")}
                        />
                        <NeonButton
                          variant="ghost"
                          className="px-3 py-1 text-xs"
                          onClick={() => {
                            const url = deliverableLinks[phase.id];
                            if (!url) return;
                            void addPhaseDeliverable(modalProjectId, phase.id, { url });
                            setDeliverableLinks((prev) => ({ ...prev, [phase.id]: "" }));
                          }}
                        >
                          {t("actions.add")}
                        </NeonButton>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="file"
                          onChange={(e) =>
                            setDeliverableFiles((prev) => ({
                              ...prev,
                              [phase.id]: e.target.files?.[0],
                            }))
                          }
                          className="text-xs text-slate-300"
                        />
                        <NeonButton
                          variant="ghost"
                          className="px-3 py-1 text-xs"
                          onClick={() => {
                            const file = deliverableFiles[phase.id];
                            if (!file) return;
                            void addPhaseDeliverable(modalProjectId, phase.id, { file });
                            setDeliverableFiles((prev) => ({ ...prev, [phase.id]: undefined }));
                          }}
                        >
                          {t("actions.upload")}
                        </NeonButton>
                      </div>
                    </div>

                    <div className="mt-3 space-y-2 rounded-lg border border-slate-800/70 bg-slate-950/60 p-3">
                      <div className="text-xs uppercase tracking-[0.12em] text-slate-500">
                      {t("projectModal.commentsTitle")}
                      </div>
                      {(phase.comments?.length ?? 0) === 0 && (
                        <p className="text-xs text-slate-500">{t("projectModal.noComments")}</p>
                      )}
                      {phase.comments?.map((comment) => (
                        <div key={comment.id} className="space-y-1 text-xs text-slate-200">
                          <div className="text-[11px] text-slate-400">
                            {comment.author?.name ??
                              comment.author?.email ??
                              t("projectModal.clientFallback")}{" "}
                            - {new Date(comment.createdAt).toLocaleString()}
                          </div>
                          <div>{comment.body}</div>
                          {comment.attachments?.map((attachment) => (
                            <a
                              key={attachment.id}
                              href={attachment.url}
                              className="text-xs text-sky-300 underline underline-offset-2"
                            >
                              {attachment.label ?? t("projectModal.viewAttachment")}
                            </a>
                          ))}
                        </div>
                      ))}
                      <div className="mt-2 space-y-2">
                        <textarea
                          rows={2}
                          value={commentDrafts[phase.id] ?? ""}
                          onChange={(e) =>
                            setCommentDrafts((prev) => ({
                              ...prev,
                              [phase.id]: e.target.value,
                            }))
                          }
                          className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-100 outline-none focus:border-cyan-400/70"
                          placeholder={t("projectModal.commentPlaceholder")}
                        />
                        <div className="flex items-center gap-2">
                          <input
                            type="file"
                            onChange={(e) =>
                              setCommentFiles((prev) => ({
                                ...prev,
                                [phase.id]: e.target.files?.[0],
                              }))
                            }
                            className="text-xs text-slate-300"
                          />
                          <NeonButton
                            variant="success"
                            className="px-3 py-1 text-xs"
                            onClick={() => {
                              const body = commentDrafts[phase.id]?.trim();
                              const file = commentFiles[phase.id];
                              if (!body && !file) return;
                              void addPhaseComment(modalProjectId, phase.id, {
                                body: body || t("projectModal.attachmentLabel"),
                                file,
                              });
                              setCommentDrafts((prev) => ({ ...prev, [phase.id]: "" }));
                              setCommentFiles((prev) => ({ ...prev, [phase.id]: undefined }));
                            }}
                          >
                            {t("actions.send")}
                          </NeonButton>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-slate-800/70 bg-[#0b1120]/80 p-4">
              <div className="text-xs uppercase tracking-[0.14em] text-slate-500">
                {t("projectModal.milestonesSection")}
              </div>
              <div className="mt-3 space-y-2">
                {projectMilestones.length === 0 && (
                  <p className="text-sm text-slate-400">{t("projectModal.noMilestones")}</p>
                )}
                {projectMilestones.map((milestone) => (
                  <div
                    key={milestone.id}
                    className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-2 text-sm text-slate-100"
                  >
                    <div>
                      <div className="font-semibold">{milestone.label}</div>
                      <div className="text-xs text-slate-400">
                        {t("projectModal.amount")}: USD {milestone.amount.toFixed(2)}
                      </div>
                    </div>
                    <StatusBadge status={milestone.status} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
