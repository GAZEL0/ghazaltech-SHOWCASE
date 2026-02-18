"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { NeonButton } from "@/components/dashboard/NeonButton";
import { NeonTable } from "@/components/dashboard/NeonTable";
import { RevisionCard } from "@/components/dashboard/RevisionCard";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { useRevisionStore, type Revision } from "@/hooks/useRevisionStore";

type RevisionsClientProps = {
  locale: string;
  isAdmin?: boolean;
};

type ModalMode = "view" | "schedule" | "complete" | "propose";

function toInputDateTime(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 16);
}

function formatDateTime(value?: string | null, locale?: string) {
  if (!value) return null;
  try {
    return new Date(value).toLocaleString(locale);
  } catch {
    return value;
  }
}

export function RevisionsClient({ locale, isAdmin }: RevisionsClientProps) {
  const t = useTranslations("dashboard");
  const { revisions, fetchRevisions, updateRevision } = useRevisionStore();
  const [active, setActive] = useState<Revision | null>(null);
  const [mode, setMode] = useState<ModalMode>("view");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [scheduleForm, setScheduleForm] = useState({
    sessionAt: "",
    duration: "",
    amount: "",
  });
  const [completeForm, setCompleteForm] = useState({
    notes: "",
    links: "",
  });
  const [proposalForm, setProposalForm] = useState({
    sessionAt: "",
    duration: "",
    note: "",
  });
  const [proofUrl, setProofUrl] = useState("");

  useEffect(() => {
    void fetchRevisions();
  }, [fetchRevisions]);

  const sortedRevisions = useMemo(() => [...revisions], [revisions]);

  function statusKey(status: string) {
    return status === "IN_PROGRESS" ? "CONFIRMED" : status;
  }

  function openModal(revision: Revision, nextMode: ModalMode) {
    setActive(revision);
    setMode(nextMode);
    setMessage(null);
    setError(null);
    setProofUrl(revision.paymentProofUrl ?? "");
    setScheduleForm({
      sessionAt: toInputDateTime(revision.sessionAt),
      duration: revision.sessionDurationMinutes ? String(revision.sessionDurationMinutes) : "",
      amount: revision.amount ? String(revision.amount) : "",
    });
    setCompleteForm({
      notes: revision.sessionNotes ?? "",
      links: Array.isArray(revision.sessionLinks) ? revision.sessionLinks.join("\n") : "",
    });
    setProposalForm({
      sessionAt: toInputDateTime(revision.clientProposedAt),
      duration: revision.clientProposedDurationMinutes ? String(revision.clientProposedDurationMinutes) : "",
      note: revision.clientProposedNote ?? "",
    });
  }

  function closeModal() {
    setActive(null);
    setError(null);
  }

  async function handleReject(revision: Revision) {
    setLoading(true);
    setError(null);
    try {
      await updateRevision({ id: revision.id, status: "REJECTED" });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSchedule() {
    if (!active) return;
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      if (!scheduleForm.sessionAt) {
        throw new Error(t("revisionsTable.sessionRequired"));
      }
      if (!scheduleForm.duration || Number.isNaN(Number(scheduleForm.duration))) {
        throw new Error(t("revisionsTable.durationRequired"));
      }
      if (!scheduleForm.amount || Number.isNaN(Number(scheduleForm.amount))) {
        throw new Error(t("revisionsTable.amountRequired"));
      }
      await updateRevision({
        id: active.id,
        status: "IN_PROGRESS",
        sessionAt: scheduleForm.sessionAt,
        sessionDurationMinutes: Number(scheduleForm.duration),
        amount: Number(scheduleForm.amount),
        clearProposal: true,
      });
      setMessage(t("revisionsTable.scheduleSaved"));
      closeModal();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  async function handleComplete() {
    if (!active) return;
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      await updateRevision({
        id: active.id,
        status: "DELIVERED",
        sessionNotes: completeForm.notes,
        sessionLinks: completeForm.links,
        completedAt: new Date().toISOString(),
      });
      setMessage(t("revisionsTable.completed"));
      closeModal();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  async function handleProposal() {
    if (!active) return;
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      if (!proposalForm.sessionAt) {
        throw new Error(t("revisionsTable.sessionRequired"));
      }
      if (!proposalForm.duration || Number.isNaN(Number(proposalForm.duration))) {
        throw new Error(t("revisionsTable.durationRequired"));
      }
      await updateRevision({
        id: active.id,
        clientProposedAt: proposalForm.sessionAt,
        clientProposedDurationMinutes: Number(proposalForm.duration),
        clientProposedNote: proposalForm.note,
      });
      setMessage(t("revisionsTable.proposalSaved"));
      closeModal();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  async function handleProof() {
    if (!active) return;
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      await updateRevision({
        id: active.id,
        paymentProofUrl: proofUrl || null,
      });
      setMessage(t("revisionsTable.proofSaved"));
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  function useProposal() {
    if (!active?.clientProposedAt) return;
    setScheduleForm({
      sessionAt: toInputDateTime(active.clientProposedAt),
      duration: active.clientProposedDurationMinutes ? String(active.clientProposedDurationMinutes) : "",
      amount: active.amount ? String(active.amount) : "",
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.14em] text-slate-500">
            {t("revisionsLabel")}
          </p>
          <h1 className="text-2xl font-bold text-slate-50">{t("revisions")}</h1>
        </div>
        <Link href={`/${locale}/dashboard/projects`}>
          <NeonButton variant="ghost">{t("revisionsTable.manage")}</NeonButton>
        </Link>
      </div>

      {error && <p className="text-sm text-rose-300">{error}</p>}
      {message && <p className="text-sm text-emerald-300">{message}</p>}

      <NeonTable
        headers={[
          t("revisionsTable.project"),
          t("revisionsTable.title"),
          t("revisionsTable.status"),
          t("revisionsTable.amount"),
          t("revisionsTable.session"),
          t("revisionsTable.createdAt"),
          "",
        ]}
      >
        {sortedRevisions.map((revision) => {
          const isPending = revision.status === "PENDING";
          const isConfirmed = revision.status === "IN_PROGRESS";
          const isDone = revision.status === "DELIVERED";
          const isRejected = revision.status === "REJECTED";
          const hasProposal = Boolean(revision.clientProposedAt);

          return (
            <tr key={revision.id} className="hover:bg-slate-900/40">
              <td className="px-4 py-3 text-sm text-slate-100">
                {revision.projectTitle ?? revision.projectId}
              </td>
              <td className="px-4 py-3 text-sm text-slate-100">{revision.title}</td>
              <td className="px-4 py-3">
                <StatusBadge status={statusKey(revision.status)} />
              </td>
              <td className="px-4 py-3 text-sm text-slate-100">
                USD {revision.amount.toFixed(2)}
              </td>
              <td className="px-4 py-3 text-sm text-slate-400">
                {revision.sessionAt ? formatDateTime(revision.sessionAt, locale) : t("revisionsTable.noSession")}
                {hasProposal && isAdmin && (
                  <div className="mt-1 text-[11px] text-amber-300">
                    {t("revisionsTable.proposalPending")}
                  </div>
                )}
              </td>
              <td className="px-4 py-3 text-sm text-slate-400">
                {revision.createdAt
                  ? new Date(revision.createdAt).toLocaleDateString(locale)
                  : t("emptyValue")}
              </td>
              <td className="px-4 py-3 text-right">
                <div className="flex flex-wrap justify-end gap-2">
                  {isAdmin && isPending && (
                    <>
                      <NeonButton
                        variant="success"
                        className="px-3 py-1 text-xs"
                        onClick={() => openModal(revision, "schedule")}
                      >
                        {t("revisionsTable.approve")}
                      </NeonButton>
                      <NeonButton
                        variant="danger"
                        className="px-3 py-1 text-xs"
                        onClick={() => void handleReject(revision)}
                      >
                        {t("revisionsTable.reject")}
                      </NeonButton>
                    </>
                  )}
                  {isAdmin && isConfirmed && (
                    <>
                      <NeonButton
                        variant="ghost"
                        className="px-3 py-1 text-xs"
                        onClick={() => openModal(revision, "schedule")}
                      >
                        {t("revisionsTable.editSchedule")}
                      </NeonButton>
                      <NeonButton
                        variant="success"
                        className="px-3 py-1 text-xs"
                        onClick={() => openModal(revision, "complete")}
                      >
                        {t("revisionsTable.markComplete")}
                      </NeonButton>
                    </>
                  )}
                  {(!isAdmin || isDone || isRejected) && (
                    <NeonButton
                      variant="ghost"
                      className="px-3 py-1 text-xs"
                      onClick={() => openModal(revision, "view")}
                    >
                      {t("revisionsTable.view")}
                    </NeonButton>
                  )}
                  {!isAdmin && isConfirmed && (
                    <NeonButton
                      variant="ghost"
                      className="px-3 py-1 text-xs"
                      onClick={() => openModal(revision, "propose")}
                    >
                      {t("revisionsTable.propose")}
                    </NeonButton>
                  )}
                  {isAdmin && isConfirmed && (
                    <NeonButton
                      variant="ghost"
                      className="px-3 py-1 text-xs"
                      onClick={() => openModal(revision, "view")}
                    >
                      {t("revisionsTable.view")}
                    </NeonButton>
                  )}
                </div>
              </td>
            </tr>
          );
        })}
        {sortedRevisions.length === 0 && (
          <tr>
            <td className="px-4 py-3 text-sm text-slate-400" colSpan={7}>
              {t("revisionsTable.empty")}
            </td>
          </tr>
        )}
      </NeonTable>

      {isAdmin && (
        <div className="grid gap-3 md:grid-cols-2">
          {sortedRevisions.map((revision) => {
            const isPending = revision.status === "PENDING";
            const isConfirmed = revision.status === "IN_PROGRESS";
            const isDone = revision.status === "DELIVERED";
            const isRejected = revision.status === "REJECTED";
            return (
              <RevisionCard
                key={`card-${revision.id}`}
                title={revision.title}
                project={revision.projectTitle ?? revision.projectId}
                amount={revision.amount}
                status={statusKey(revision.status)}
                createdAt={revision.createdAt}
                onApprove={
                  isPending ? () => openModal(revision, "schedule") : undefined
                }
                onReject={
                  isPending ? () => handleReject(revision) : undefined
                }
                onView={
                  isDone || isRejected || isConfirmed
                    ? () => openModal(revision, "view")
                    : undefined
                }
              />
            );
          })}
        </div>
      )}

      {active && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4"
          onClick={closeModal}
        >
          <div
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-slate-800/70 bg-[#050b18] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.6)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.14em] text-slate-500">
                  {t("revisionsTable.detailsTitle")}
                </p>
                <h3 className="text-xl font-bold text-slate-50">{active.title}</h3>
                <div className="text-xs text-slate-400">
                  {active.projectTitle ?? active.projectId}
                </div>
              </div>
              <NeonButton variant="ghost" onClick={closeModal}>
                {t("revisionsTable.close")}
              </NeonButton>
            </div>

            {error && <p className="mt-3 text-sm text-rose-300">{error}</p>}
            {message && <p className="mt-3 text-sm text-emerald-300">{message}</p>}

            {mode === "view" && (
              <div className="mt-4 space-y-4 text-sm text-slate-200">
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge status={statusKey(active.status)} />
                  {active.completedAt && (
                    <span className="text-xs text-slate-400">
                      {t("revisionsTable.completedAt", { date: formatDateTime(active.completedAt, locale) })}
                    </span>
                  )}
                </div>
                <div className="rounded-lg border border-slate-800/70 bg-slate-950/60 p-3">
                  <div className="text-xs uppercase tracking-[0.12em] text-slate-500">
                    {t("revisionsTable.session")}
                  </div>
                  <div className="mt-2 text-sm text-slate-100">
                    {active.sessionAt ? formatDateTime(active.sessionAt, locale) : t("revisionsTable.noSession")}
                  </div>
                  {active.sessionDurationMinutes && (
                    <div className="text-xs text-slate-400">
                      {t("revisionsTable.sessionDurationLabel", { minutes: active.sessionDurationMinutes })}
                    </div>
                  )}
                </div>
                <div className="rounded-lg border border-slate-800/70 bg-slate-950/60 p-3">
                  <div className="text-xs uppercase tracking-[0.12em] text-slate-500">
                    {t("revisionsTable.amount")}
                  </div>
                  <div className="mt-2 text-sm text-slate-100">
                    USD {active.amount.toFixed(2)}
                  </div>
                </div>
                {active.details && (
                  <div className="rounded-lg border border-slate-800/70 bg-slate-950/60 p-3">
                    <div className="text-xs uppercase tracking-[0.12em] text-slate-500">
                      {t("revisionsTable.requestDetails")}
                    </div>
                    <p className="mt-2 text-xs text-slate-300 whitespace-pre-wrap">{active.details}</p>
                  </div>
                )}
                {active.sessionNotes && (
                  <div className="rounded-lg border border-slate-800/70 bg-slate-950/60 p-3">
                    <div className="text-xs uppercase tracking-[0.12em] text-slate-500">
                      {t("revisionsTable.sessionNotes")}
                    </div>
                    <p className="mt-2 text-xs text-slate-300 whitespace-pre-wrap">{active.sessionNotes}</p>
                  </div>
                )}
                {active.sessionLinks && active.sessionLinks.length > 0 && (
                  <div className="rounded-lg border border-slate-800/70 bg-slate-950/60 p-3">
                    <div className="text-xs uppercase tracking-[0.12em] text-slate-500">
                      {t("revisionsTable.sessionLinks")}
                    </div>
                    <div className="mt-2 flex flex-col gap-1 text-xs text-sky-300">
                      {active.sessionLinks.map((link, idx) => (
                        <a key={`${link}-${idx}`} href={link} target="_blank" rel="noreferrer">
                          {link}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
                {active.paymentProofUrl && (
                  <div className="rounded-lg border border-slate-800/70 bg-slate-950/60 p-3">
                    <div className="text-xs uppercase tracking-[0.12em] text-slate-500">
                      {t("revisionsTable.paymentProof")}
                    </div>
                    <a
                      href={active.paymentProofUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-2 inline-flex text-xs text-sky-300 underline underline-offset-2"
                    >
                      {t("revisionsTable.viewProof")}
                    </a>
                  </div>
                )}
                {!isAdmin && active.status === "IN_PROGRESS" && !active.paymentProofUrl && (
                  <div className="rounded-lg border border-emerald-400/40 bg-emerald-500/10 p-3 text-xs text-emerald-200">
                    {t("revisionsTable.paymentRequired")}
                  </div>
                )}
                {!isAdmin && active.status === "IN_PROGRESS" && (
                  <div className="space-y-2 rounded-lg border border-slate-800/70 bg-slate-950/60 p-3">
                    <div className="text-xs uppercase tracking-[0.12em] text-slate-500">
                      {t("revisionsTable.paymentProof")}
                    </div>
                    <input
                      value={proofUrl}
                      onChange={(e) => setProofUrl(e.target.value)}
                      className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-100 outline-none focus:border-cyan-400/70"
                      placeholder={t("revisionsTable.paymentProofPlaceholder")}
                    />
                    <div className="flex justify-end">
                      <NeonButton variant="ghost" onClick={() => void handleProof()} disabled={loading}>
                        {t("revisionsTable.saveProof")}
                      </NeonButton>
                    </div>
                  </div>
                )}
                {isAdmin && active.clientProposedAt && (
                  <div className="rounded-lg border border-amber-400/50 bg-amber-900/20 p-3 text-xs text-amber-100">
                    <div className="font-semibold">{t("revisionsTable.proposalTitle")}</div>
                    <div className="mt-1">
                      {formatDateTime(active.clientProposedAt, locale)}
                      {active.clientProposedDurationMinutes
                        ? ` - ${active.clientProposedDurationMinutes} ${t("revisionsTable.minutes")}`
                        : ""}
                    </div>
                    {active.clientProposedNote && (
                      <div className="mt-1 text-[11px] text-amber-100/80">{active.clientProposedNote}</div>
                    )}
                  </div>
                )}
              </div>
            )}

            {mode === "schedule" && (
              <div className="mt-4 space-y-4 text-sm text-slate-200">
                <div className="grid gap-3 md:grid-cols-2">
                  <label className="flex flex-col gap-1 text-xs text-slate-400">
                    {t("revisionsTable.amount")}
                    <input
                      type="number"
                      value={scheduleForm.amount}
                      onChange={(e) =>
                        setScheduleForm((prev) => ({ ...prev, amount: e.target.value }))
                      }
                      className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-400/70"
                    />
                  </label>
                  <label className="flex flex-col gap-1 text-xs text-slate-400">
                    {t("revisionsTable.sessionDate")}
                    <input
                      type="datetime-local"
                      value={scheduleForm.sessionAt}
                      onChange={(e) =>
                        setScheduleForm((prev) => ({ ...prev, sessionAt: e.target.value }))
                      }
                      className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-400/70"
                    />
                  </label>
                  <label className="flex flex-col gap-1 text-xs text-slate-400">
                    {t("revisionsTable.sessionDuration")}
                    <input
                      type="number"
                      value={scheduleForm.duration}
                      onChange={(e) =>
                        setScheduleForm((prev) => ({ ...prev, duration: e.target.value }))
                      }
                      className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-400/70"
                    />
                  </label>
                </div>
                {active.clientProposedAt && (
                  <div className="rounded-lg border border-amber-400/50 bg-amber-900/20 p-3 text-xs text-amber-100">
                    <div className="font-semibold">{t("revisionsTable.proposalTitle")}</div>
                    <div className="mt-1">
                      {formatDateTime(active.clientProposedAt, locale)}
                      {active.clientProposedDurationMinutes
                        ? ` - ${active.clientProposedDurationMinutes} ${t("revisionsTable.minutes")}`
                        : ""}
                    </div>
                    {active.clientProposedNote && (
                      <div className="mt-1 text-[11px] text-amber-100/80">{active.clientProposedNote}</div>
                    )}
                    <div className="mt-3">
                      <NeonButton variant="ghost" onClick={useProposal}>
                        {t("revisionsTable.useProposal")}
                      </NeonButton>
                    </div>
                  </div>
                )}
                <div className="flex justify-end gap-2">
                  <NeonButton variant="ghost" onClick={closeModal}>
                    {t("revisionsTable.close")}
                  </NeonButton>
                  <NeonButton variant="success" onClick={() => void handleSchedule()} disabled={loading}>
                    {t("revisionsTable.saveSchedule")}
                  </NeonButton>
                </div>
              </div>
            )}

            {mode === "complete" && (
              <div className="mt-4 space-y-4 text-sm text-slate-200">
                <label className="flex flex-col gap-2 text-xs text-slate-400">
                  {t("revisionsTable.sessionNotes")}
                  <textarea
                    rows={4}
                    value={completeForm.notes}
                    onChange={(e) =>
                      setCompleteForm((prev) => ({ ...prev, notes: e.target.value }))
                    }
                    className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-400/70"
                  />
                </label>
                <label className="flex flex-col gap-2 text-xs text-slate-400">
                  {t("revisionsTable.sessionLinks")}
                  <textarea
                    rows={3}
                    value={completeForm.links}
                    onChange={(e) =>
                      setCompleteForm((prev) => ({ ...prev, links: e.target.value }))
                    }
                    placeholder={t("revisionsTable.linksHint")}
                    className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-400/70"
                  />
                </label>
                <div className="flex justify-end gap-2">
                  <NeonButton variant="ghost" onClick={closeModal}>
                    {t("revisionsTable.close")}
                  </NeonButton>
                  <NeonButton variant="success" onClick={() => void handleComplete()} disabled={loading}>
                    {t("revisionsTable.complete")}
                  </NeonButton>
                </div>
              </div>
            )}

            {mode === "propose" && (
              <div className="mt-4 space-y-4 text-sm text-slate-200">
                <label className="flex flex-col gap-1 text-xs text-slate-400">
                  {t("revisionsTable.sessionDate")}
                  <input
                    type="datetime-local"
                    value={proposalForm.sessionAt}
                    onChange={(e) =>
                      setProposalForm((prev) => ({ ...prev, sessionAt: e.target.value }))
                    }
                    className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-400/70"
                  />
                </label>
                <label className="flex flex-col gap-1 text-xs text-slate-400">
                  {t("revisionsTable.sessionDuration")}
                  <input
                    type="number"
                    value={proposalForm.duration}
                    onChange={(e) =>
                      setProposalForm((prev) => ({ ...prev, duration: e.target.value }))
                    }
                    className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-400/70"
                  />
                </label>
                <label className="flex flex-col gap-1 text-xs text-slate-400">
                  {t("revisionsTable.proposalNote")}
                  <textarea
                    rows={3}
                    value={proposalForm.note}
                    onChange={(e) =>
                      setProposalForm((prev) => ({ ...prev, note: e.target.value }))
                    }
                    className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-400/70"
                  />
                </label>
                <div className="flex justify-end gap-2">
                  <NeonButton variant="ghost" onClick={closeModal}>
                    {t("revisionsTable.close")}
                  </NeonButton>
                  <NeonButton variant="success" onClick={() => void handleProposal()} disabled={loading}>
                    {t("revisionsTable.saveProposal")}
                  </NeonButton>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
