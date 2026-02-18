"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { useSession } from "next-auth/react";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { MilestoneCard } from "@/components/dashboard/MilestoneCard";
import { NeonButton } from "@/components/dashboard/NeonButton";
import { RevisionCard } from "@/components/dashboard/RevisionCard";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { TimelineStepper } from "@/components/dashboard/TimelineStepper";
import { useProjectStore } from "@/hooks/useProjectStore";
import { useRevisionStore } from "@/hooks/useRevisionStore";

type ProjectDetailsClientProps = {
  projectId: string;
};

const phaseStatuses = ["REQUIREMENTS", "DESIGN", "DEV", "QA", "DELIVERED"];

export function ProjectDetailsClient({ projectId }: ProjectDetailsClientProps) {
  const t = useTranslations("dashboard");
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "ADMIN" || session?.user?.role === "PARTNER";
  const { current, fetchProject } = useProjectStore();
  const {
    updatePhaseStatus,
    addPhaseDeliverable,
    addPhaseComment,
    createChangeRequest,
    respondChangeRequest,
    updateChangeRequest,
  } = useProjectStore();
  const { createRevision } = useRevisionStore();
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({});
  const [commentFiles, setCommentFiles] = useState<Record<string, File | undefined>>({});
  const [deliverableLinks, setDeliverableLinks] = useState<Record<string, string>>({});
  const [deliverableFiles, setDeliverableFiles] = useState<Record<string, File | undefined>>({});
  const [changeForm, setChangeForm] = useState({ title: "", description: "", amount: "" });
  const [requestModal, setRequestModal] = useState<{
    type: "revision" | "change";
    phaseId: string;
    phaseTitle: string;
  } | null>(null);
  const [requestTitle, setRequestTitle] = useState("");
  const [requestDetails, setRequestDetails] = useState("");
  const [requestSaving, setRequestSaving] = useState(false);
  const [requestError, setRequestError] = useState<string | null>(null);
  const [changeEdit, setChangeEdit] = useState<{
    id: string;
    title: string;
    description: string;
    amount: string;
  } | null>(null);
  const [changeEditError, setChangeEditError] = useState<string | null>(null);
  const [changeEditSaving, setChangeEditSaving] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewSaving, setReviewSaving] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const phaseGroupLabels: Record<string, string> = {
    REQUIREMENTS: t("phases.requirements"),
    DESIGN: t("phases.design"),
    DEV: t("phases.dev"),
    QA: t("phases.qa"),
    DELIVERED: t("phases.delivered"),
  };
  const getPhaseGroupLabel = (group?: string | null) => {
    if (!group) return t("emptyValue");
    return phaseGroupLabels[group] ?? group;
  };
  const openRequestModal = (type: "revision" | "change", phase: { id: string; title: string }) => {
    const defaultTitle =
      type === "revision"
        ? t("projectDetails.requestRevisionDefault", { phase: phase.title })
        : t("projectDetails.requestChangeDefault", { phase: phase.title });
    setRequestModal({ type, phaseId: phase.id, phaseTitle: phase.title });
    setRequestTitle(defaultTitle);
    setRequestDetails("");
    setRequestError(null);
  };
  const closeRequestModal = () => {
    setRequestModal(null);
    setRequestError(null);
    setRequestSaving(false);
  };
  const openChangeEdit = (change: { id: string; title: string; description?: string | null; amount: number }) => {
    setChangeEdit({
      id: change.id,
      title: change.title,
      description: change.description ?? "",
      amount: change.amount ? String(change.amount) : "",
    });
    setChangeEditError(null);
  };
  const closeChangeEdit = () => {
    setChangeEdit(null);
    setChangeEditError(null);
    setChangeEditSaving(false);
  };
  const submitRequest = async () => {
    if (!requestModal) return;
    const title = requestTitle.trim();
    const details = requestDetails.trim();
    if (!title) {
      setRequestError(t("projectDetails.requestTitleRequired"));
      return;
    }
    if (!details) {
      setRequestError(t("projectDetails.requestDetailsRequired"));
      return;
    }
    setRequestSaving(true);
    try {
      if (requestModal.type === "revision") {
        await createRevision({
          projectId,
          title,
          amount: 0,
          details,
        });
      } else {
        await createChangeRequest(projectId, {
          title,
          description: details,
          amount: 0,
        });
      }
      await fetchProject(projectId);
      closeRequestModal();
    } finally {
      setRequestSaving(false);
    }
  };
  const submitChangeEdit = async () => {
    if (!changeEdit) return;
    const title = changeEdit.title.trim();
    const description = changeEdit.description.trim();
    const amount = Number(changeEdit.amount);
    if (!title) {
      setChangeEditError(t("projectDetails.requestTitleRequired"));
      return;
    }
    if (Number.isNaN(amount) || amount <= 0) {
      setChangeEditError(t("projectDetails.changeAmountRequired"));
      return;
    }
    setChangeEditSaving(true);
    try {
      await updateChangeRequest(projectId, changeEdit.id, {
        title,
        description: description.length > 0 ? description : null,
        amount,
      });
      await fetchProject(projectId);
      closeChangeEdit();
    } finally {
      setChangeEditSaving(false);
    }
  };

  useEffect(() => {
    void fetchProject(projectId);
  }, [fetchProject, projectId]);

  const project = current;
  const isPublished = Boolean(project?.portfolioItems?.some((item) => item.isPublished));
  const reviewLocked = Boolean(isPublished && project?.review);

  useEffect(() => {
    if (!project?.review) {
      setReviewRating(0);
      setReviewComment("");
      return;
    }
    setReviewRating(project.review.rating ?? 0);
    setReviewComment(project.review.comment ?? "");
  }, [project?.review]);
  const hasPlan =
    (project?.milestonePayments?.length ?? 0) > 0 || (project?.phases?.length ?? 0) > 0;
  const rawMilestones = useMemo(
    () => project?.milestonePayments ?? [],
    [project?.milestonePayments],
  );
  const fallbackMilestones = useMemo(() => {
    const items = [...rawMilestones];
    items.sort((a, b) => {
      const timeA = a.createdAt ? new Date(a.createdAt).getTime() : Number.MAX_SAFE_INTEGER;
      const timeB = b.createdAt ? new Date(b.createdAt).getTime() : Number.MAX_SAFE_INTEGER;
      if (timeA !== timeB) return timeA - timeB;
      return a.label.localeCompare(b.label);
    });
    return items;
  }, [rawMilestones]);
  const phaseList =
    project?.phases && project.phases.length > 0
      ? project.phases
      : fallbackMilestones
          .filter((m) => (m.amount ?? 0) === 0)
          .map((m, index) => ({
            id: m.id,
            group: "REQUIREMENTS",
            title: m.label,
            description: null,
            dueDate: null,
            status:
              m.status === "APPROVED"
                ? "COMPLETED"
                : m.status === "UNDER_REVIEW"
                  ? "IN_PROGRESS"
                  : "PENDING",
            order: index,
            deliverables: [],
            comments: [],
          }));
  const orderedPhases = useMemo(
    () => [...phaseList].sort((a, b) => a.order - b.order),
    [phaseList],
  );
  const phaseById = useMemo(() => new Map(orderedPhases.map((phase) => [phase.id, phase])), [orderedPhases]);
  const sortedMilestones = useMemo(() => {
    const items = [...rawMilestones];
    items.sort((a, b) => {
      const dueA = a.dueDate ? new Date(a.dueDate).getTime() : null;
      const dueB = b.dueDate ? new Date(b.dueDate).getTime() : null;
      if (dueA !== null || dueB !== null) {
        if (dueA !== null && dueB !== null && dueA !== dueB) return dueA - dueB;
        if (dueA !== null && dueB === null) return -1;
        if (dueA === null && dueB !== null) return 1;
      }
      const phaseOrderA = a.gatePhaseId ? phaseById.get(a.gatePhaseId)?.order : null;
      const phaseOrderB = b.gatePhaseId ? phaseById.get(b.gatePhaseId)?.order : null;
      if (phaseOrderA !== undefined && phaseOrderA !== null && phaseOrderB !== undefined && phaseOrderB !== null) {
        if (phaseOrderA !== phaseOrderB) return phaseOrderA - phaseOrderB;
      } else if (phaseOrderA !== undefined && phaseOrderA !== null) {
        return -1;
      } else if (phaseOrderB !== undefined && phaseOrderB !== null) {
        return 1;
      }
      const timeA = a.createdAt ? new Date(a.createdAt).getTime() : Number.MAX_SAFE_INTEGER;
      const timeB = b.createdAt ? new Date(b.createdAt).getTime() : Number.MAX_SAFE_INTEGER;
      if (timeA !== timeB) return timeA - timeB;
      return a.label.localeCompare(b.label);
    });
    return items;
  }, [rawMilestones, phaseById]);
  const payments = sortedMilestones.filter((m) => (m.amount ?? 0) > 0);
  const nextPayment = payments.find((m) => m.status === "PENDING");
  const groupedPhases = useMemo(() => {
    const groups: Record<string, typeof orderedPhases> = {};
    for (const phase of orderedPhases) {
      const key = phase.group ?? "REQUIREMENTS";
      if (!groups[key]) groups[key] = [];
      groups[key].push(phase);
    }
    return groups;
  }, [orderedPhases]);
  const orderedPhaseGroups = useMemo(() => {
    const order = ["REQUIREMENTS", "DESIGN", "DEV", "QA", "DELIVERED"];
    const keys = Object.keys(groupedPhases);
    return order.filter((key) => keys.includes(key)).concat(keys.filter((key) => !order.includes(key)));
  }, [groupedPhases]);

  if (!project) {
    return <p className="text-sm text-slate-400">{t("loading")}</p>;
  }

  const canReview = !isAdmin && project.status === "DELIVERED";

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.14em] text-slate-500">
            {t("projectDetailsLabel")}
          </p>
          <h1 className="text-2xl font-bold text-slate-50">{project.title}</h1>
          {project.description && (
            <p className="text-sm text-slate-400">{project.description}</p>
          )}
        </div>
        <StatusBadge status={project.status} />
      </div>

      {canReview && (
        <DashboardCard title={t("projectReview.title")}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="text-sm text-slate-300">
              {project.review ? t("projectReview.submitted") : t("projectReview.description")}
              {reviewLocked && (
                <div className="mt-1 text-xs text-amber-300">
                  {t("projectReview.locked")}
                </div>
              )}
              {project.review && (
                <div className="mt-2 flex items-center gap-2 text-xs text-slate-300">
                  <span className="font-semibold text-slate-100">{project.review.rating}/5</span>
                  <span className="text-amber-300">
                    {"*".repeat(project.review.rating)}
                    {"-".repeat(Math.max(0, 5 - project.review.rating))}
                  </span>
                </div>
              )}
              {project.review?.comment && (
                <div className="mt-2 text-xs text-slate-400">
                  &quot;{project.review.comment}&quot;
                </div>
              )}
            </div>
            <NeonButton
              variant="ghost"
              disabled={reviewLocked}
              onClick={() => {
                setReviewError(null);
                setReviewRating(project.review?.rating ?? 0);
                setReviewComment(project.review?.comment ?? "");
                setReviewOpen(true);
              }}
            >
              {project.review ? t("projectReview.editButton") : t("projectReview.rateButton")}
            </NeonButton>
          </div>
        </DashboardCard>
      )}

      {!hasPlan && (
        <div className="rounded-lg border border-amber-400/50 bg-amber-900/20 px-4 py-3 text-sm text-amber-50">
          {t("projectDetails.awaitingPlan")}
        </div>
      )}
      {hasPlan && nextPayment && (
        <div className="rounded-lg border border-emerald-400/50 bg-emerald-900/20 px-4 py-3 text-sm text-emerald-50">
          {t("projectDetails.nextPayment", { label: nextPayment.label })}
        </div>
      )}

      <DashboardCard title={t("timeline")}>
        <TimelineStepper
          steps={phaseStatuses.map((phase) => ({
            label: phase,
            displayLabel: t("phases." + phase.toLowerCase()),
          }))}
          current={project.status}
        />
      </DashboardCard>

      <DashboardCard
        title={t("milestones.title")}
        action={
          isAdmin ? (
          <NeonButton
            variant="ghost"
            onClick={() => {
              void createRevision({
                projectId,
                title: t("actions.requestRevision"),
                amount: 50,
                details: t("projectDetails.defaultRevisionNote"),
              });
            }}
          >
            {t("actions.addRevision")}
          </NeonButton>
          ) : undefined
        }
      >
        <div className="space-y-3">
          {payments.length === 0 && (
            <p className="text-sm text-slate-400">{t("milestones.empty")}</p>
          )}
          {payments.length > 0 && (
            <div className="pt-2">
              <div className="mb-2 text-xs uppercase tracking-[0.1em] text-emerald-300">
                {t("projectDetails.paymentsTitle")}
              </div>
              <div className="space-y-3">
                {payments.map((milestone) => (
                  <MilestoneCard
                    key={milestone.id}
                    id={milestone.id}
                    projectId={project.id}
                    label={milestone.label}
                    amount={milestone.amount}
                    status={milestone.status}
                    proofUrl={milestone.proofUrl}
                    dueDate={milestone.dueDate}
                    highlight
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </DashboardCard>

      <DashboardCard title={t("projectDetails.phasesTitle")}>
        <div className="space-y-4">
          {orderedPhaseGroups.map((group) => (
            <div key={group} className="space-y-3">
              <div className="text-xs uppercase tracking-[0.12em] text-slate-500">
                {getPhaseGroupLabel(group)}
              </div>
              {groupedPhases[group]?.map((phase) => (
                <div
                  key={phase.id}
                  className="space-y-3 rounded-xl border border-slate-800/70 bg-slate-950/50 p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <div className="text-sm font-semibold text-slate-100">{phase.title}</div>
                      {phase.description && (
                        <p className="text-xs text-slate-400">{phase.description}</p>
                      )}
                      {phase.dueDate && (
                        <p className="text-xs text-slate-500">
                          {t("projectDetails.dueLabel", { date: new Date(phase.dueDate).toLocaleDateString() })}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={phase.status} />
                      {isAdmin && phase.status === "PENDING" && (
                        <NeonButton
                          variant="ghost"
                          className="px-3 py-1 text-xs"
                          onClick={() => void updatePhaseStatus(projectId, phase.id, "IN_PROGRESS")}
                        >
                          {t("projectDetails.start")}
                        </NeonButton>
                      )}
                      {isAdmin && phase.status === "IN_PROGRESS" && (
                        <NeonButton
                          variant="success"
                          className="px-3 py-1 text-xs"
                          onClick={() => void updatePhaseStatus(projectId, phase.id, "COMPLETED")}
                        >
                          {t("projectDetails.markComplete")}
                        </NeonButton>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    {(phase.deliverables?.length ?? 0) === 0 && (
                      <p className="text-xs text-slate-500">{t("projectDetails.noDeliverables")}</p>
                    )}
                    {phase.deliverables?.map((asset) => (
                      <div key={asset.id} className="flex items-center justify-between gap-2">
                        {asset.type === "LINK" ? (
                          <a
                            href={asset.url}
                            className="text-xs text-sky-300 underline underline-offset-2"
                          >
                            {asset.label ?? asset.url}
                          </a>
                        ) : (
                          <a
                            href={asset.url}
                            className="text-xs text-sky-300 underline underline-offset-2"
                          >
                            {asset.label ?? t("projectDetails.viewAsset")}
                          </a>
                        )}
                      </div>
                    ))}
                  </div>

                  {!isAdmin && phase.status === "COMPLETED" && (phase.deliverables?.length ?? 0) > 0 && (
                    <div className="flex flex-wrap items-center gap-2">
                      <NeonButton
                        variant="ghost"
                        className="px-3 py-1 text-xs"
                        onClick={() => openRequestModal("revision", phase)}
                      >
                        {t("projectDetails.requestRevision")}
                      </NeonButton>
                      <NeonButton
                        variant="ghost"
                        className="px-3 py-1 text-xs"
                        onClick={() => openRequestModal("change", phase)}
                      >
                        {t("projectDetails.requestChange")}
                      </NeonButton>
                    </div>
                  )}

                  {isAdmin && (
                    <div className="grid gap-2 md:grid-cols-2">
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
                          placeholder={t("projectDetails.linkPlaceholder")}
                        />
                        <NeonButton
                          variant="ghost"
                          className="px-3 py-1 text-xs"
                          onClick={() => {
                            const url = deliverableLinks[phase.id];
                            if (!url) return;
                            void addPhaseDeliverable(projectId, phase.id, { url });
                            setDeliverableLinks((prev) => ({ ...prev, [phase.id]: "" }));
                          }}
                        >
                          {t("projectDetails.addLink")}
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
                            void addPhaseDeliverable(projectId, phase.id, { file });
                            setDeliverableFiles((prev) => ({ ...prev, [phase.id]: undefined }));
                          }}
                        >
                          {t("projectDetails.upload")}
                        </NeonButton>
                      </div>
                    </div>
                  )}

                  <div className="space-y-2 rounded-lg border border-slate-800/70 bg-slate-950/60 p-3">
                    <div className="text-xs uppercase tracking-[0.12em] text-slate-500">
                      {t("projectDetails.commentsTitle")}
                    </div>
                    {(phase.comments?.length ?? 0) === 0 && (
                      <p className="text-xs text-slate-500">{t("projectDetails.noComments")}</p>
                    )}
                    {phase.comments?.map((comment) => (
                      <div key={comment.id} className="space-y-1 text-xs text-slate-200">
                        <div className="text-[11px] text-slate-400">
                          {comment.author?.name ??
                            comment.author?.email ??
                            t("projectDetails.clientFallback")}{" "}
                          - {new Date(comment.createdAt).toLocaleString()}
                        </div>
                        <div>{comment.body}</div>
                        {comment.attachments?.map((attachment) => (
                          <a
                            key={attachment.id}
                            href={attachment.url}
                            className="text-xs text-sky-300 underline underline-offset-2"
                          >
                            {attachment.label ?? t("projectDetails.viewAttachment")}
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
                        placeholder={t("projectDetails.commentPlaceholder")}
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
                            void addPhaseComment(projectId, phase.id, {
                              body: body || t("projectDetails.attachmentLabel"),
                              file,
                            });
                            setCommentDrafts((prev) => ({ ...prev, [phase.id]: "" }));
                            setCommentFiles((prev) => ({ ...prev, [phase.id]: undefined }));
                          }}
                        >
                          {t("projectDetails.send")}
                        </NeonButton>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))}
          {phaseList.length === 0 && (
            <p className="text-sm text-slate-400">{t("projectDetails.noPhases")}</p>
          )}
        </div>
      </DashboardCard>

      <div className="grid gap-4 lg:grid-cols-2">
        <DashboardCard title={t("attachments.title")}>
          <div className="space-y-3 text-sm text-slate-200">
            {project.auditLogs?.map((log) => (
              <div
                key={log.id}
                className="rounded-lg border border-slate-800/70 bg-slate-950/50 px-3 py-2"
              >
                <div className="text-xs uppercase tracking-[0.1em] text-slate-500">
                  {log.action}
                </div>
                <div className="text-[11px] text-slate-500">
                  {new Date(log.createdAt).toLocaleString()}
                </div>
              </div>
            ))}
            {(project.auditLogs?.length ?? 0) === 0 && (
              <p className="text-sm text-slate-400">{t("attachments.empty")}</p>
            )}
          </div>
        </DashboardCard>

        <DashboardCard title={t("revisionsSection.title")}>
          <div className="space-y-3">
            {project.revisions?.map((rev) => (
              <RevisionCard
                key={rev.id}
                title={rev.title}
                project={project.title}
                amount={rev.amount}
                status={rev.status}
                createdAt={rev.createdAt}
              />
            ))}
            {(project.revisions?.length ?? 0) === 0 && (
              <p className="text-sm text-slate-400">{t("revisionsSection.empty")}</p>
            )}
          </div>
        </DashboardCard>
      </div>

      <DashboardCard title={t("projectDetails.changeRequestsTitle")}>
        <div className="space-y-3">
          {(project.changeRequests?.length ?? 0) === 0 && (
            <p className="text-sm text-slate-400">{t("projectDetails.noChangeRequests")}</p>
          )}
          {project.changeRequests?.map((change) => (
            <div
              key={change.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-800/70 bg-slate-950/50 px-3 py-2 text-sm text-slate-100"
            >
              <div>
                <div className="font-semibold">{change.title}</div>
                {change.description && (
                  <div className="text-xs text-slate-400">{change.description}</div>
                )}
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-emerald-200">
                  {t("projectDetails.amount", { amount: change.amount.toFixed(2) })}
                </span>
                <StatusBadge status={change.status} />
                {isAdmin && change.status === "PENDING" && (
                  <NeonButton
                    variant="ghost"
                    className="px-3 py-1 text-xs"
                    onClick={() => openChangeEdit(change)}
                  >
                    {t("projectDetails.editChange")}
                  </NeonButton>
                )}
                {change.status === "PENDING" && !isAdmin && change.amount > 0 && (
                  <div className="flex gap-2">
                    <NeonButton
                      variant="success"
                      className="px-3 py-1 text-xs"
                      onClick={() => void respondChangeRequest(projectId, change.id, "accept")}
                    >
                      {t("projectDetails.accept")}
                    </NeonButton>
                    <NeonButton
                      variant="ghost"
                      className="px-3 py-1 text-xs"
                      onClick={() => void respondChangeRequest(projectId, change.id, "reject")}
                    >
                      {t("projectDetails.reject")}
                    </NeonButton>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {isAdmin && (
          <div className="mt-4 space-y-2 rounded-lg border border-slate-800/70 bg-slate-950/50 p-3">
            <div className="text-xs uppercase tracking-[0.12em] text-slate-500">
              {t("projectDetails.addChangeRequest")}
            </div>
            <input
              value={changeForm.title}
              onChange={(e) => setChangeForm((prev) => ({ ...prev, title: e.target.value }))}
              className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-100 outline-none focus:border-cyan-400/70"
              placeholder={t("projectDetails.changeForm.title")}
            />
            <textarea
              rows={2}
              value={changeForm.description}
              onChange={(e) => setChangeForm((prev) => ({ ...prev, description: e.target.value }))}
              className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-100 outline-none focus:border-cyan-400/70"
              placeholder={t("projectDetails.changeForm.description")}
            />
            <div className="flex gap-2">
              <input
                type="number"
                value={changeForm.amount}
                onChange={(e) => setChangeForm((prev) => ({ ...prev, amount: e.target.value }))}
                className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-100 outline-none focus:border-cyan-400/70"
                placeholder={t("projectDetails.changeForm.amount")}
              />
              <NeonButton
                variant="success"
                className="px-3 py-1 text-xs"
                onClick={() => {
                  const amount = Number(changeForm.amount);
                  if (!changeForm.title || Number.isNaN(amount) || amount <= 0) return;
                  void createChangeRequest(projectId, {
                    title: changeForm.title,
                    description: changeForm.description || undefined,
                    amount,
                  });
                  setChangeForm({ title: "", description: "", amount: "" });
                }}
              >
                {t("projectDetails.add")}
              </NeonButton>
            </div>
          </div>
        )}
      </DashboardCard>

      {requestModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4"
          onClick={closeRequestModal}
        >
          <div
            className="w-full max-w-lg rounded-2xl border border-slate-800/70 bg-[#050b18] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.6)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.14em] text-slate-500">
                  {requestModal.type === "revision"
                    ? t("projectDetails.requestModalTitleRevision")
                    : t("projectDetails.requestModalTitleChange")}
                </p>
                <h3 className="text-lg font-bold text-slate-50">{requestModal.phaseTitle}</h3>
              </div>
              <NeonButton variant="ghost" onClick={closeRequestModal}>
                {t("projectDetails.requestCancel")}
              </NeonButton>
            </div>

            {requestError && <p className="mt-3 text-sm text-rose-300">{requestError}</p>}

            <div className="mt-4 space-y-3 text-sm text-slate-200">
              <label className="flex flex-col gap-2 text-xs text-slate-400">
                {t("projectDetails.changeForm.title")}
                <input
                  value={requestTitle}
                  onChange={(e) => setRequestTitle(e.target.value)}
                  className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-400/70"
                />
              </label>
              <label className="flex flex-col gap-2 text-xs text-slate-400">
                {t("projectDetails.changeForm.description")}
                <textarea
                  rows={4}
                  value={requestDetails}
                  onChange={(e) => setRequestDetails(e.target.value)}
                  className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-400/70"
                />
              </label>
              <div className="flex justify-end gap-2">
                <NeonButton variant="ghost" onClick={closeRequestModal}>
                  {t("projectDetails.requestCancel")}
                </NeonButton>
                <NeonButton
                  variant="success"
                  onClick={() => void submitRequest()}
                  disabled={requestSaving}
                >
                  {t("projectDetails.requestSubmit")}
                </NeonButton>
              </div>
            </div>
          </div>
        </div>
      )}

      {changeEdit && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4"
          onClick={closeChangeEdit}
        >
          <div
            className="w-full max-w-lg rounded-2xl border border-slate-800/70 bg-[#050b18] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.6)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.14em] text-slate-500">
                  {t("projectDetails.editChange")}
                </p>
                <h3 className="text-lg font-bold text-slate-50">{project.title}</h3>
              </div>
              <NeonButton variant="ghost" onClick={closeChangeEdit}>
                {t("projectDetails.requestCancel")}
              </NeonButton>
            </div>

            {changeEditError && <p className="mt-3 text-sm text-rose-300">{changeEditError}</p>}

            <div className="mt-4 space-y-3 text-sm text-slate-200">
              <label className="flex flex-col gap-2 text-xs text-slate-400">
                {t("projectDetails.changeForm.title")}
                <input
                  value={changeEdit.title}
                  onChange={(e) => setChangeEdit((prev) => (prev ? { ...prev, title: e.target.value } : prev))}
                  className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-400/70"
                />
              </label>
              <label className="flex flex-col gap-2 text-xs text-slate-400">
                {t("projectDetails.changeForm.description")}
                <textarea
                  rows={3}
                  value={changeEdit.description}
                  onChange={(e) =>
                    setChangeEdit((prev) => (prev ? { ...prev, description: e.target.value } : prev))
                  }
                  className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-400/70"
                />
              </label>
              <label className="flex flex-col gap-2 text-xs text-slate-400">
                {t("projectDetails.changeForm.amount")}
                <input
                  type="number"
                  value={changeEdit.amount}
                  onChange={(e) => setChangeEdit((prev) => (prev ? { ...prev, amount: e.target.value } : prev))}
                  className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-400/70"
                />
              </label>
              <div className="flex justify-end gap-2">
                <NeonButton variant="ghost" onClick={closeChangeEdit}>
                  {t("projectDetails.requestCancel")}
                </NeonButton>
                <NeonButton
                  variant="success"
                  onClick={() => void submitChangeEdit()}
                  disabled={changeEditSaving}
                >
                  {t("projectDetails.requestSubmit")}
                </NeonButton>
              </div>
            </div>
          </div>
        </div>
      )}

      {reviewOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4"
          onClick={() => setReviewOpen(false)}
        >
          <div
            className="w-full max-w-lg rounded-2xl border border-slate-800/70 bg-[#050b18] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.6)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.14em] text-slate-500">
                  {t("projectReview.modalTitle")}
                </p>
                <h3 className="text-xl font-bold text-slate-50">{project.title}</h3>
              </div>
              <NeonButton variant="ghost" onClick={() => setReviewOpen(false)}>
                {t("projectReview.cancel")}
              </NeonButton>
            </div>

            {reviewError && <p className="mt-3 text-sm text-rose-300">{reviewError}</p>}

            <div className="mt-4 space-y-4">
              <div className="space-y-2">
                <div className="text-sm text-slate-200">{t("projectReview.ratingLabel")}</div>
                <div className="flex items-center gap-2 text-2xl text-slate-500">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setReviewRating(value)}
                      className={`transition ${value <= reviewRating ? "text-amber-300" : "text-slate-600 hover:text-slate-400"}`}
                    >
                      {value <= reviewRating ? "*" : "-"}
                    </button>
                  ))}
                </div>
              </div>
              <label className="flex flex-col gap-2 text-sm text-slate-200">
                <span>{t("projectReview.commentLabel")}</span>
                <textarea
                  rows={4}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-400/70"
                />
              </label>
              <div className="flex items-center justify-end gap-2">
                <NeonButton
                  variant="success"
                  disabled={reviewSaving || reviewRating === 0}
                  onClick={async () => {
                    setReviewSaving(true);
                    setReviewError(null);
                    try {
                      const res = await fetch(`/api/projects/${projectId}/review`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          rating: reviewRating,
                          comment: reviewComment,
                        }),
                      });
                      if (!res.ok) {
                        const text = await res.text();
                        throw new Error(text || t("projectReview.saveError"));
                      }
                      await fetchProject(projectId);
                      setReviewOpen(false);
                    } catch (err) {
                      setReviewError((err as Error).message);
                    } finally {
                      setReviewSaving(false);
                    }
                  }}
                >
                  {reviewSaving ? t("projectReview.saving") : t("projectReview.save")}
                </NeonButton>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
