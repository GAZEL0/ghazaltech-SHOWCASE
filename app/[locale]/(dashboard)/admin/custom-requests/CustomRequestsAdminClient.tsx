"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { NeonButton } from "@/components/dashboard/NeonButton";
import { NeonTable } from "@/components/dashboard/NeonTable";
import { StatusBadge } from "@/components/dashboard/StatusBadge";

type CustomRequest = {
  id: string;
  fullName: string;
  email: string;
  phone?: string | null;
  companyName?: string | null;
  businessType?: string | null;
  projectType?: string | null;
  languages?: string | null;
  hasDomain?: boolean | null;
  hasHosting?: boolean | null;
  budgetRange?: string | null;
  timeline?: string | null;
  referenceLinks?: string | null;
  details: string;
  status: string;
  userId?: string | null;
  orderId?: string | null;
  createdAt?: string;
};

type Service = { id: string; title: string; priceBase: number; isActive: boolean };

export function CustomRequestsAdminClient({ locale }: { locale: string }) {
  const t = useTranslations("customRequestsAdmin");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const requestIdParam = searchParams.get("requestId");
  const quoteRef = useRef<HTMLDivElement | null>(null);
  const [requests, setRequests] = useState<CustomRequest[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [selected, setSelected] = useState<CustomRequest | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [convertForm, setConvertForm] = useState({
    serviceId: "",
    totalAmount: "",
    projectTitle: "",
    projectDescription: "",
    userId: "",
  });
  const [quoteForm, setQuoteForm] = useState({
    amount: "",
    scope: "",
    expiresAt: "",
    deliveryEstimate: "",
    timeline: "",
    paymentNotes: "",
    phases: [
      {
        key: `phase-${Date.now()}`,
        group: "REQUIREMENTS",
        title: "",
        description: "",
        dueDate: "",
      },
    ],
    payments: [{ label: t("quoteForm.defaultPaymentLabel"), amount: "", dueDate: "", beforePhaseKey: "" }],
  });
  const [quoteMessage, setQuoteMessage] = useState<string | null>(null);
  const [quoteErrors, setQuoteErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    void loadRequests();
    void loadServices();
  }, []);

  useEffect(() => {
    if (selected) {
      setConvertForm({
        serviceId: services[0]?.id ?? "",
        totalAmount: "",
        projectTitle: t("defaults.projectTitle", { name: selected.fullName }),
        projectDescription: selected.details,
        userId: selected.userId ?? "",
      });
      setQuoteForm({
        amount: "",
        scope: selected.details,
        expiresAt: "",
        deliveryEstimate: "",
        timeline: selected.timeline ?? "",
        paymentNotes: "",
        phases: [
          {
            key: `phase-${Date.now()}`,
            group: "REQUIREMENTS",
            title: "",
            description: "",
            dueDate: "",
          },
        ],
        payments: [{ label: t("quoteForm.defaultPaymentLabel"), amount: "", dueDate: "", beforePhaseKey: "" }],
      });
      setQuoteMessage(null);
    }
  }, [selected, services, t]);

  useEffect(() => {
    if (!requestIdParam) return;
    if (selected?.id === requestIdParam) return;
    const target = requests.find((req) => req.id === requestIdParam);
    if (target) {
      setSelected(target);
      setTimeout(() => {
        quoteRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 0);
    }
  }, [requestIdParam, requests, selected]);

  function closeDrawer() {
    setSelected(null);
    setQuoteMessage(null);
    setQuoteErrors({});
    if (requestIdParam) {
      const params = new URLSearchParams(searchParams.toString());
      params.delete("requestId");
      const next = params.toString();
      router.replace(next ? `${pathname}?${next}` : pathname, { scroll: false });
    }
  }

  async function loadRequests() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/custom-requests", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to load requests");
      const data = (await res.json()) as CustomRequest[];
      setRequests(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  async function loadServices() {
    try {
      const res = await fetch("/api/services?includeInactive=true", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to load services");
      const data = (await res.json()) as Service[];
      setServices(data);
    } catch (err) {
      console.error("[custom-requests] services", err);
      setServices([]);
    }
  }

  async function updateStatus(id: string, status: string, note?: string) {
    try {
      await fetch(`/api/custom-requests/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, note }),
      });
      await loadRequests();
      if (selected?.id === id) {
        setSelected((prev) => (prev ? { ...prev, status } : prev));
      }
    } catch (err) {
      setError((err as Error).message);
    }
  }

  const phaseGroups = ["REQUIREMENTS", "DESIGN", "DEV", "QA", "DELIVERED"];

  function updatePhaseField(
    index: number,
    key: "group" | "title" | "description" | "dueDate",
    value: string,
  ) {
    setQuoteForm((prev) => {
      const next = prev.phases.slice();
      next[index] = { ...next[index], [key]: value };
      return { ...prev, phases: next };
    });
  }

  function addPhaseRow() {
    setQuoteForm((prev) => ({
      ...prev,
      phases: [
        ...prev.phases,
        {
          key: `phase-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          group: "DESIGN",
          title: "",
          description: "",
          dueDate: "",
        },
      ],
    }));
  }

  function removePhaseRow(index: number) {
    setQuoteForm((prev) => ({
      ...prev,
      phases: prev.phases.filter((_, i) => i !== index),
    }));
  }

  function updatePaymentField(
    index: number,
    key: "label" | "amount" | "dueDate" | "beforePhaseKey",
    value: string,
  ) {
    setQuoteForm((prev) => {
      const next = prev.payments.slice();
      next[index] = { ...next[index], [key]: value };
      return { ...prev, payments: next };
    });
  }

  function addPaymentRow() {
    setQuoteForm((prev) => ({
      ...prev,
      payments: [
        ...prev.payments,
        { label: t("quoteForm.defaultPayment"), amount: "", dueDate: "", beforePhaseKey: "" },
      ],
    }));
  }

  function removePaymentRow(index: number) {
    setQuoteForm((prev) => ({
      ...prev,
      payments: prev.payments.filter((_, i) => i !== index),
    }));
  }

  async function createQuote(sendNow = false) {
    if (!selected) return;
    setLoading(true);
    setError(null);
    setQuoteMessage(null);
    setQuoteErrors({});
    try {
      const amount = Number(quoteForm.amount);
      if (Number.isNaN(amount) || amount <= 0) {
        setQuoteErrors({ amount: t("quoteForm.errors.amountRequired") });
        throw new Error(t("quoteForm.errors.amountRequired"));
      }

      const phases = quoteForm.phases
        .filter((phase) => phase.title || phase.description || phase.dueDate)
        .map((phase, index) => ({
          key: phase.key,
          group: phase.group,
          title: phase.title || undefined,
          description: phase.description || undefined,
          dueDate: phase.dueDate || undefined,
          order: index,
        }));

      const paymentSchedule = quoteForm.payments
        .filter((p) => p.label || p.amount || p.dueDate || p.beforePhaseKey)
        .map((p) => ({
          label: p.label || undefined,
          amount: p.amount ? Number(p.amount) : undefined,
          dueDate: p.dueDate || undefined,
          beforePhaseKey: p.beforePhaseKey || undefined,
        }));

      const payload = {
        customRequestId: selected.id,
        amount,
        currency: "USD",
        scope: quoteForm.scope || selected.details,
        expiresAt: quoteForm.expiresAt || undefined,
        serviceId: convertForm.serviceId || undefined,
        projectTitle: convertForm.projectTitle || undefined,
        projectDescription: convertForm.projectDescription || undefined,
        plan: {
          deliveryEstimate: quoteForm.deliveryEstimate || undefined,
          timeline: quoteForm.timeline || undefined,
          phases,
          paymentNotes: quoteForm.paymentNotes || undefined,
          paymentSchedule,
        },
      };

      const res = await fetch("/api/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const created = (await res.json().catch(() => ({}))) as { id: string; error?: string; field?: string };

      if (!res.ok) {
        if (created.field) {
          setQuoteErrors({ [created.field]: created.error ?? t("quoteForm.errors.invalidField") });
        }
        throw new Error(created.error || t("quoteForm.errors.createFailed"));
      }

      if (sendNow) {
        const sendRes = await fetch(`/api/quotes/${created.id}/send`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            expiresAt: quoteForm.expiresAt || undefined,
          }),
        });
        const sendData = (await sendRes.json().catch(() => ({}))) as { magicLink?: string; error?: string };
        if (!sendRes.ok) {
          throw new Error(sendData.error || t("quoteForm.errors.sendFailed"));
        }
        setQuoteMessage(
          sendData.magicLink
            ? t("quoteForm.messages.sentLink", { link: sendData.magicLink })
            : t("quoteForm.messages.sent"),
        );
        closeDrawer();
      } else {
        setQuoteMessage(t("quoteForm.messages.saved"));
        closeDrawer();
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  function formatDate(date?: string) {
    if (!date) return t("emptyValue");
    return new Date(date).toLocaleString(locale);
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.14em] text-slate-500">
            {t("label")}
          </p>
          <h1 className="text-2xl font-bold text-slate-50">{t("title")}</h1>
        </div>
        <NeonButton variant="ghost" onClick={() => void loadRequests()}>
          {t("refresh")}
        </NeonButton>
      </div>

      {error && <p className="text-sm text-rose-300">{error}</p>}

      <DashboardCard>
        <NeonTable
          headers={[
            t("table.fullName"),
            t("table.businessType"),
            t("table.projectType"),
            t("table.budget"),
            t("table.timeline"),
            t("table.status"),
            "",
          ]}
        >
          {requests.map((req) => (
            <tr key={req.id} className="hover:bg-slate-900/40">
              <td className="px-4 py-3 text-sm text-slate-100">
                <div className="font-semibold">{req.fullName}</div>
                <div className="text-xs text-slate-400">{req.email}</div>
              </td>
              <td className="px-4 py-3 text-sm text-slate-300">{req.businessType ?? t("emptyValue")}</td>
              <td className="px-4 py-3 text-sm text-slate-300">{req.projectType ?? t("emptyValue")}</td>
              <td className="px-4 py-3 text-sm text-slate-300">{req.budgetRange ?? t("emptyValue")}</td>
              <td className="px-4 py-3 text-sm text-slate-300">{req.timeline ?? t("emptyValue")}</td>
              <td className="px-4 py-3 text-sm">
                <StatusBadge status={req.status} />
              </td>
              <td className="px-4 py-3 text-right">
                <div className="flex justify-end gap-2">
                  <NeonButton variant="ghost" className="px-3 py-1 text-xs" onClick={() => setSelected(req)}>
                    {t("view")}
                  </NeonButton>
                  <NeonButton
                    variant="success"
                    className="px-3 py-1 text-xs"
                    onClick={() => updateStatus(req.id, "REVIEWED")}
                  >
                    {t("markReviewed")}
                  </NeonButton>
                </div>
              </td>
            </tr>
          ))}
          {requests.length === 0 && (
            <tr>
              <td className="px-4 py-3 text-sm text-slate-400" colSpan={7}>
                {t("empty")}
              </td>
            </tr>
          )}
        </NeonTable>
      </DashboardCard>

      {selected && (
        <div
          className="fixed left-0 right-0 bottom-0 top-20 z-50 flex items-start justify-center overflow-y-auto bg-black/60 px-4 py-6 md:top-20"
          onClick={closeDrawer}
        >
          <div
            className="w-full max-w-4xl space-y-4 rounded-2xl border border-slate-800/70 bg-[#050b18] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.6)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.14em] text-slate-500">
                  {t("drawer.title")}
                </p>
                <h3 className="text-xl font-bold text-slate-50">{selected.fullName}</h3>
                <p className="text-sm text-slate-400">{selected.email}</p>
              </div>
              <NeonButton variant="ghost" onClick={closeDrawer}>
                {t("close")}
              </NeonButton>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-xl border border-slate-800/70 bg-[#0b1120]/80 p-4">
                <div className="text-xs uppercase tracking-[0.14em] text-slate-500">
                  {t("drawer.details")}
                </div>
                <dl className="mt-2 space-y-1 text-sm text-slate-200">
                  <div className="flex justify-between gap-3">
                    <dt className="text-slate-400">{t("table.projectType")}</dt>
                    <dd>{selected.projectType ?? t("emptyValue")}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-slate-400">{t("table.budget")}</dt>
                    <dd>{selected.budgetRange ?? t("emptyValue")}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-slate-400">{t("table.timeline")}</dt>
                    <dd>{selected.timeline ?? t("emptyValue")}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-slate-400">{t("drawer.languages")}</dt>
                    <dd>{selected.languages ?? t("emptyValue")}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-slate-400">{t("drawer.domain")}</dt>
                    <dd>{selected.hasDomain === null || selected.hasDomain === undefined ? t("emptyValue") : selected.hasDomain ? t("yes") : t("no")}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-slate-400">{t("drawer.hosting")}</dt>
                    <dd>{selected.hasHosting === null || selected.hasHosting === undefined ? t("emptyValue") : selected.hasHosting ? t("yes") : t("no")}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-slate-400">{t("drawer.createdAt")}</dt>
                    <dd>{formatDate(selected.createdAt)}</dd>
                  </div>
                  {selected.referenceLinks && (
                    <div className="space-y-1">
                      <dt className="text-slate-400">{t("drawer.references")}</dt>
                      <dd className="text-xs text-sky-200 break-words">{selected.referenceLinks}</dd>
                    </div>
                  )}
                </dl>
              </div>

              <div className="rounded-xl border border-slate-800/70 bg-[#0b1120]/80 p-4">
                <div className="text-xs uppercase tracking-[0.14em] text-slate-500">
                  {t("drawer.detailsFull")}
                </div>
                <p className="mt-2 text-sm text-slate-200 whitespace-pre-wrap">{selected.details}</p>
              </div>
            </div>

            <div
              ref={quoteRef}
              className="rounded-xl border border-slate-800/70 bg-[#0b1120]/80 p-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-slate-100">{t("quoteForm.title")}</div>
                  <p className="text-xs text-slate-500">
                    {t("quoteForm.subtitle")}
                  </p>
                </div>
                {quoteMessage && (
                  <span className="text-xs text-emerald-200">{quoteMessage}</span>
                )}
              </div>

              <div className="mt-3 grid gap-3 md:grid-cols-2">
                <label className="flex flex-col gap-1 text-sm text-slate-200">
                  <span>{t("quoteForm.amount")}</span>
                  <input
                    type="number"
                    value={quoteForm.amount}
                    onChange={(e) => setQuoteForm((prev) => ({ ...prev, amount: e.target.value }))}
                    className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-slate-100 outline-none focus:border-cyan-400/70"
                    placeholder={t("quoteForm.amountPlaceholder")}
                  />
                  {quoteErrors.amount && (
                    <span className="text-xs text-rose-300">{quoteErrors.amount}</span>
                  )}
                </label>
                <label className="flex flex-col gap-1 text-sm text-slate-200">
                  <span>{t("quoteForm.expiresAt")}</span>
                  <input
                    type="date"
                    value={quoteForm.expiresAt}
                    onChange={(e) => setQuoteForm((prev) => ({ ...prev, expiresAt: e.target.value }))}
                    className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-slate-100 outline-none focus:border-cyan-400/70"
                    placeholder={t("quoteForm.expiresAtPlaceholder")}
                  />
                  {quoteErrors.expiresAt && (
                    <span className="text-xs text-rose-300">{quoteErrors.expiresAt}</span>
                  )}
                </label>
                <label className="flex flex-col gap-1 text-sm text-slate-200">
                  <span>{t("quoteForm.estimatedDelivery")}</span>
                  <input
                    type="text"
                    value={quoteForm.deliveryEstimate}
                    onChange={(e) =>
                      setQuoteForm((prev) => ({ ...prev, deliveryEstimate: e.target.value }))
                    }
                    className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-slate-100 outline-none focus:border-cyan-400/70"
                    placeholder={t("quoteForm.estimatedDeliveryPlaceholder")}
                  />
                </label>
                <label className="md:col-span-2 flex flex-col gap-1 text-sm text-slate-200">
                  <span>{t("quoteForm.scope")}</span>
                  <textarea
                    rows={3}
                    value={quoteForm.scope}
                    onChange={(e) => setQuoteForm((prev) => ({ ...prev, scope: e.target.value }))}
                    className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-slate-100 outline-none focus:border-cyan-400/70"
                    placeholder={t("quoteForm.scopePlaceholder")}
                  />
                  {quoteErrors.scope && (
                    <span className="text-xs text-rose-300">{quoteErrors.scope}</span>
                  )}
                </label>
                <label className="md:col-span-2 flex flex-col gap-1 text-sm text-slate-200">
                  <span>{t("quoteForm.timeline")}</span>
                  <textarea
                    rows={2}
                    value={quoteForm.timeline}
                    onChange={(e) => setQuoteForm((prev) => ({ ...prev, timeline: e.target.value }))}
                    className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-slate-100 outline-none focus:border-cyan-400/70"
                    placeholder={t("quoteForm.timelinePlaceholder")}
                  />
                </label>
              </div>

              <div className="mt-4 space-y-2 rounded-lg border border-slate-800 bg-slate-950/50 p-3">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold text-slate-100">{t("quoteForm.phasesTitle")}</div>
                  <NeonButton variant="ghost" className="px-3 py-1 text-xs" onClick={addPhaseRow}>
                    {t("quoteForm.addPhase")}
                  </NeonButton>
                </div>
                <div className="space-y-2">
                  {quoteForm.phases.map((phase, index) => (
                    <div
                      key={phase.key}
                      className="grid gap-2 rounded-lg border border-slate-800/70 bg-slate-900/60 p-3 md:grid-cols-4"
                    >
                      <select
                        value={phase.group}
                        onChange={(e) => updatePhaseField(index, "group", e.target.value)}
                        className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-400/70"
                      >
                        {phaseGroups.map((group) => (
                          <option key={group} value={group}>
                            {t(`quoteForm.phaseGroups.${group.toLowerCase()}`)}
                          </option>
                        ))}
                      </select>
                      <input
                        value={phase.title}
                        onChange={(e) => updatePhaseField(index, "title", e.target.value)}
                        className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-400/70"
                        placeholder={t("quoteForm.phaseTitlePlaceholder")}
                      />
                      <input
                        value={phase.description}
                        onChange={(e) => updatePhaseField(index, "description", e.target.value)}
                        className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-400/70"
                        placeholder={t("quoteForm.phaseDescriptionPlaceholder")}
                      />
                      <div className="flex gap-2">
                        <input
                          type="date"
                          value={phase.dueDate}
                          onChange={(e) => updatePhaseField(index, "dueDate", e.target.value)}
                          className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-400/70"
                        />
                        <NeonButton
                          variant="ghost"
                          className="px-3 py-1 text-xs"
                          onClick={() => removePhaseRow(index)}
                          disabled={quoteForm.phases.length <= 1}
                        >
                          {t("quoteForm.remove")}
                        </NeonButton>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 space-y-2 rounded-lg border border-slate-800 bg-slate-950/50 p-3">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold text-slate-100">{t("quoteForm.paymentSchedule")}</div>
                  <NeonButton variant="ghost" className="px-3 py-1 text-xs" onClick={addPaymentRow}>
                    {t("quoteForm.addMilestone")}
                  </NeonButton>
                </div>
                <div className="space-y-2">
                  {quoteForm.payments.map((payment, index) => (
                    <div
                      key={index}
                      className="grid gap-2 rounded-lg border border-slate-800/70 bg-slate-900/60 p-3 md:grid-cols-4"
                    >
                      <input
                        value={payment.label}
                        onChange={(e) => updatePaymentField(index, "label", e.target.value)}
                        className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-400/70"
                        placeholder={t("quoteForm.paymentLabelPlaceholder")}
                      />
                      <input
                        type="number"
                        value={payment.amount}
                        onChange={(e) => updatePaymentField(index, "amount", e.target.value)}
                        className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-400/70"
                        placeholder={t("quoteForm.paymentAmountPlaceholder")}
                      />
                      <select
                        value={payment.beforePhaseKey}
                        onChange={(e) => updatePaymentField(index, "beforePhaseKey", e.target.value)}
                        className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-400/70"
                      >
                        <option value="">{t("quoteForm.beforePhase")}</option>
                        {quoteForm.phases.map((phase) => (
                          <option key={phase.key} value={phase.key}>
                            {phase.title || t(`quoteForm.phaseGroups.${phase.group.toLowerCase()}`)}
                          </option>
                        ))}
                      </select>
                      <div className="flex gap-2">
                        <input
                          type="date"
                          value={payment.dueDate}
                          onChange={(e) => updatePaymentField(index, "dueDate", e.target.value)}
                          className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-400/70"
                        />
                        <NeonButton
                          variant="ghost"
                          className="px-3 py-1 text-xs"
                          onClick={() => removePaymentRow(index)}
                          disabled={quoteForm.payments.length <= 1}
                        >
                          {t("quoteForm.remove")}
                        </NeonButton>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-3 grid gap-3">
                <label className="flex flex-col gap-1 text-sm text-slate-200">
                  <span>{t("quoteForm.paymentNotes")}</span>
                  <textarea
                    rows={2}
                    value={quoteForm.paymentNotes}
                    onChange={(e) => setQuoteForm((prev) => ({ ...prev, paymentNotes: e.target.value }))}
                    className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-slate-100 outline-none focus:border-cyan-400/70"
                    placeholder={t("quoteForm.paymentNotesPlaceholder")}
                  />
                </label>
              </div>

              <div className="mt-3 flex flex-wrap items-center justify-end gap-2">
                <NeonButton variant="ghost" onClick={() => createQuote(false)} disabled={loading}>
                  {t("quoteForm.saveDraft")}
                </NeonButton>
                <NeonButton variant="success" onClick={() => createQuote(true)} disabled={loading}>
                  {t("quoteForm.send")}
                </NeonButton>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
