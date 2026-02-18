"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { NeonButton } from "@/components/dashboard/NeonButton";
import { NeonInput } from "@/components/dashboard/NeonInput";
import { NeonTable } from "@/components/dashboard/NeonTable";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { usePaymentStore } from "@/hooks/usePaymentStore";
import { useProjectStore } from "@/hooks/useProjectStore";

type PaymentsClientProps = {
  locale: string;
};

export function PaymentsClient({ locale }: PaymentsClientProps) {
  const t = useTranslations("dashboard");
  const { payments, fetchPayments, uploadProof, loading } = usePaymentStore();
  const { projects, fetchProjects } = useProjectStore();

  const [projectId, setProjectId] = useState("");
  const [label, setLabel] = useState("");
  const [amount, setAmount] = useState<number>(0);
  const [file, setFile] = useState<File | undefined>(undefined);

  useEffect(() => {
    void fetchPayments();
    void fetchProjects();
  }, [fetchPayments, fetchProjects]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId || !label || !amount) return;
    await uploadProof({ projectId, label, amount, file });
    setLabel("");
    setAmount(0);
    setFile(undefined);
  };

  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs uppercase tracking-[0.14em] text-slate-500">
          {t("paymentsLabel")}
        </p>
        <h1 className="text-2xl font-bold text-slate-50">{t("payments")}</h1>
      </div>

      <form
        onSubmit={handleSubmit}
        className="grid gap-3 rounded-2xl border border-slate-800/70 bg-slate-950/60 p-4"
      >
        <div className="grid gap-3 md:grid-cols-3">
          <label className="flex flex-col gap-1 text-sm text-slate-200">
            <span className="text-xs uppercase tracking-[0.08em] text-slate-400">
              {t("paymentsForm.project")}
            </span>
            <select
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              className="rounded-lg border border-slate-800/70 bg-slate-950/70 px-3 py-2 text-slate-100 outline-none focus:border-cyan-400/70"
            >
              <option value="">{t("paymentsForm.selectProject")}</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.title}
                </option>
              ))}
            </select>
          </label>
          <NeonInput
            label={t("paymentsForm.label")}
            value={label}
            onChange={setLabel}
            placeholder={t("paymentsForm.labelPlaceholder")}
          />
          <NeonInput
            label={t("paymentsForm.amount")}
            type="number"
            value={amount ? amount.toString() : ""}
            onChange={(value) => setAmount(Number(value))}
            placeholder="150"
          />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <input
            type="file"
            onChange={(e) => setFile(e.target.files?.[0])}
            className="text-xs text-slate-300"
          />
          <NeonButton type="submit" disabled={loading}>
            {t("paymentsForm.upload")}
          </NeonButton>
        </div>
      </form>

      <NeonTable
        headers={[
          t("paymentsTable.project"),
          t("paymentsTable.label"),
          t("paymentsTable.amount"),
          t("paymentsTable.status"),
          t("paymentsTable.proof"),
          "",
        ]}
      >
        {payments.map((payment) => (
          <tr key={payment.id} className="hover:bg-slate-900/40">
            <td className="px-4 py-3 text-sm text-slate-100">
              {payment.projectTitle ?? payment.projectId}
            </td>
            <td className="px-4 py-3 text-sm text-slate-100">{payment.label}</td>
            <td className="px-4 py-3 text-sm text-slate-100">
              USD {payment.amount.toFixed(2)}
            </td>
            <td className="px-4 py-3">
              <StatusBadge status={payment.status} />
            </td>
            <td className="px-4 py-3 text-sm text-slate-400">
              {payment.proofUrl ? (
                <a
                  href={payment.proofUrl}
                  className="text-xs text-sky-300 underline underline-offset-2"
                >
                  {t("paymentsTable.viewProof")}
                </a>
              ) : (
                t("emptyValue")
              )}
            </td>
            <td className="px-4 py-3 text-right">
              <a
                href={`/${locale}/dashboard/projects/${payment.projectId}`}
                className="text-xs font-semibold text-sky-300 underline underline-offset-2"
              >
                {t("paymentsTable.details")}
              </a>
            </td>
          </tr>
        ))}
        {payments.length === 0 && (
          <tr>
            <td className="px-4 py-3 text-sm text-slate-400" colSpan={6}>
              {t("paymentsTable.empty")}
            </td>
          </tr>
        )}
      </NeonTable>
    </div>
  );
}
