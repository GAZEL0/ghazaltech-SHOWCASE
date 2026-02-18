"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { NeonButton } from "@/components/dashboard/NeonButton";
import { NeonTable } from "@/components/dashboard/NeonTable";
import { StatusBadge } from "@/components/dashboard/StatusBadge";

type ArchivedProject = {
  id: string;
  title: string;
  status: string;
  archivedAt?: string | null;
};

type ArchivedPayment = {
  id: string;
  projectTitle?: string;
  label: string;
  amount: number;
  status: string;
  archivedAt?: string | null;
};

type ArchivedQuote = {
  id: string;
  amount: number;
  currency: string;
  status: string;
  archivedAt?: string | null;
  request?: { fullName?: string; email?: string };
};

type ArchivedOrder = {
  id: string;
  status: string;
  totalAmount: number;
  serviceTitle?: string;
  archivedAt?: string | null;
  createdAt?: string;
  client?: { name: string | null; email: string };
};

export function AdminArchiveClient({ locale }: { locale: string }) {
  const t = useTranslations("dashboard.adminArchive");
  const [projects, setProjects] = useState<ArchivedProject[]>([]);
  const [payments, setPayments] = useState<ArchivedPayment[]>([]);
  const [quotes, setQuotes] = useState<ArchivedQuote[]>([]);
  const [orders, setOrders] = useState<ArchivedOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [projectsRes, paymentsRes, quotesRes, ordersRes] = await Promise.all([
        fetch("/api/projects?archived=1", { cache: "no-store" }),
        fetch("/api/payments?archived=1", { cache: "no-store" }),
        fetch("/api/quotes?archived=1", { cache: "no-store" }),
        fetch("/api/orders?archived=1", { cache: "no-store" }),
      ]);

      if (!projectsRes.ok || !paymentsRes.ok || !quotesRes.ok || !ordersRes.ok) {
        throw new Error(t("errors.load"));
      }

      setProjects((await projectsRes.json()) as ArchivedProject[]);
      setPayments((await paymentsRes.json()) as ArchivedPayment[]);
      setQuotes((await quotesRes.json()) as ArchivedQuote[]);
      setOrders((await ordersRes.json()) as ArchivedOrder[]);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    void loadAll();
  }, [loadAll]);

  async function restoreProject(id: string) {
    await fetch(`/api/projects/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ archived: false }),
    });
    setProjects((prev) => prev.filter((item) => item.id !== id));
  }

  async function restorePayment(id: string) {
    await fetch(`/api/payments/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ archived: false }),
    });
    setPayments((prev) => prev.filter((item) => item.id !== id));
  }

  async function restoreQuote(id: string) {
    await fetch(`/api/quotes/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ archived: false }),
    });
    setQuotes((prev) => prev.filter((item) => item.id !== id));
  }

  async function restoreOrder(id: string) {
    await fetch("/api/orders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, archived: false }),
    });
    setOrders((prev) => prev.filter((item) => item.id !== id));
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.14em] text-slate-500">{t("kicker")}</p>
          <h1 className="text-2xl font-bold text-slate-50">{t("title")}</h1>
        </div>
        <NeonButton variant="ghost" onClick={() => void loadAll()}>
          {t("refresh")}
        </NeonButton>
      </div>

      {error && <p className="text-sm text-rose-300">{error}</p>}

      <DashboardCard title={t("sections.projects.title")}>
        <NeonTable headers={[t("table.project"), t("table.status"), t("table.archived"), ""]}>
          {projects.map((project) => (
            <tr key={project.id} className="hover:bg-slate-900/40">
              <td className="px-4 py-3 text-sm text-slate-100">{project.title}</td>
              <td className="px-4 py-3">
                <StatusBadge status={project.status} />
              </td>
              <td className="px-4 py-3 text-xs text-slate-400">
                {project.archivedAt ? new Date(project.archivedAt).toLocaleString(locale) : t("emptyValue")}
              </td>
              <td className="px-4 py-3 text-right">
                <NeonButton
                  variant="success"
                  className="px-3 py-1 text-xs"
                  onClick={() => void restoreProject(project.id)}
                >
                  {t("restore")}
                </NeonButton>
              </td>
            </tr>
          ))}
          {projects.length === 0 && (
            <tr>
              <td className="px-4 py-3 text-sm text-slate-400" colSpan={4}>
                {loading ? t("loading") : t("sections.projects.empty")}
              </td>
            </tr>
          )}
        </NeonTable>
      </DashboardCard>

      <DashboardCard title={t("sections.payments.title")}>
        <NeonTable
          headers={[
            t("table.project"),
            t("table.label"),
            t("table.amount"),
            t("table.status"),
            t("table.archived"),
            "",
          ]}
        >
          {payments.map((payment) => (
            <tr key={payment.id} className="hover:bg-slate-900/40">
              <td className="px-4 py-3 text-sm text-slate-100">{payment.projectTitle ?? t("emptyValue")}</td>
              <td className="px-4 py-3 text-sm text-slate-100">{payment.label}</td>
              <td className="px-4 py-3 text-sm text-slate-100">
                {t("amount", { amount: payment.amount.toFixed(2) })}
              </td>
              <td className="px-4 py-3">
                <StatusBadge status={payment.status} />
              </td>
              <td className="px-4 py-3 text-xs text-slate-400">
                {payment.archivedAt ? new Date(payment.archivedAt).toLocaleString(locale) : t("emptyValue")}
              </td>
              <td className="px-4 py-3 text-right">
                <NeonButton
                  variant="success"
                  className="px-3 py-1 text-xs"
                  onClick={() => void restorePayment(payment.id)}
                >
                  {t("restore")}
                </NeonButton>
              </td>
            </tr>
          ))}
          {payments.length === 0 && (
            <tr>
              <td className="px-4 py-3 text-sm text-slate-400" colSpan={6}>
                {loading ? t("loading") : t("sections.payments.empty")}
              </td>
            </tr>
          )}
        </NeonTable>
      </DashboardCard>

      <DashboardCard title={t("sections.quotes.title")}>
        <NeonTable headers={[t("table.client"), t("table.amount"), t("table.status"), t("table.archived"), ""]}>
          {quotes.map((quote) => (
            <tr key={quote.id} className="hover:bg-slate-900/40">
              <td className="px-4 py-3 text-sm text-slate-100">
                <div className="font-semibold">{quote.request?.fullName ?? t("fallback.client")}</div>
                <div className="text-xs text-slate-400">{quote.request?.email ?? t("emptyValue")}</div>
              </td>
              <td className="px-4 py-3 text-sm text-slate-100">
                {quote.currency} {quote.amount.toLocaleString()}
              </td>
              <td className="px-4 py-3">
                <StatusBadge status={quote.status} />
              </td>
              <td className="px-4 py-3 text-xs text-slate-400">
                {quote.archivedAt ? new Date(quote.archivedAt).toLocaleString(locale) : t("emptyValue")}
              </td>
              <td className="px-4 py-3 text-right">
                <NeonButton
                  variant="success"
                  className="px-3 py-1 text-xs"
                  onClick={() => void restoreQuote(quote.id)}
                >
                  {t("restore")}
                </NeonButton>
              </td>
            </tr>
          ))}
          {quotes.length === 0 && (
            <tr>
              <td className="px-4 py-3 text-sm text-slate-400" colSpan={5}>
                {loading ? t("loading") : t("sections.quotes.empty")}
              </td>
            </tr>
          )}
        </NeonTable>
      </DashboardCard>

      <DashboardCard title={t("sections.orders.title")}>
        <NeonTable headers={[t("table.order"), t("table.amount"), t("table.status"), t("table.archived"), ""]}>
          {orders.map((order) => (
            <tr key={order.id} className="hover:bg-slate-900/40">
              <td className="px-4 py-3 text-sm text-slate-100">
                <div className="font-semibold">{order.serviceTitle ?? t("fallback.order")}</div>
                <div className="text-xs text-slate-400">
                  {order.client?.name ?? order.client?.email ?? t("emptyValue")}
                </div>
              </td>
              <td className="px-4 py-3 text-sm text-slate-100">
                {t("amount", { amount: order.totalAmount.toFixed(2) })}
              </td>
              <td className="px-4 py-3">
                <StatusBadge status={order.status} />
              </td>
              <td className="px-4 py-3 text-xs text-slate-400">
                {order.archivedAt ? new Date(order.archivedAt).toLocaleString(locale) : t("emptyValue")}
              </td>
              <td className="px-4 py-3 text-right">
                <NeonButton
                  variant="success"
                  className="px-3 py-1 text-xs"
                  onClick={() => void restoreOrder(order.id)}
                >
                  {t("restore")}
                </NeonButton>
              </td>
            </tr>
          ))}
          {orders.length === 0 && (
            <tr>
              <td className="px-4 py-3 text-sm text-slate-400" colSpan={5}>
                {loading ? t("loading") : t("sections.orders.empty")}
              </td>
            </tr>
          )}
        </NeonTable>
      </DashboardCard>
    </div>
  );
}
