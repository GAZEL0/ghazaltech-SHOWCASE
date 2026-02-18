"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { NeonButton } from "@/components/dashboard/NeonButton";
import { NeonTable } from "@/components/dashboard/NeonTable";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { type Order, useOrderStore } from "@/hooks/useOrderStore";

export function AdminOrdersClient({ locale }: { locale: string }) {
  const t = useTranslations("dashboard.admin");
  const router = useRouter();
  const { orders, fetchOrders, archiveOrder } = useOrderStore();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reviewMessage, setReviewMessage] = useState<string | null>(null);

  useEffect(() => {
    void fetchOrders();
  }, [fetchOrders]);

  function openOrder(order: Order) {
    setSelectedOrder(order);
    setReviewMessage(null);
    setError(null);
  }

  function closeOrder() {
    setSelectedOrder(null);
    setReviewMessage(null);
    setError(null);
  }

  function formatDate(date?: string) {
    if (!date) return "-";
    return new Date(date).toLocaleDateString(locale);
  }

  async function approveOrder() {
    if (!selectedOrder) return;
    setLoading(true);
    setError(null);
    setReviewMessage(null);
    try {
      if (!selectedOrder.requestId) {
        throw new Error(t("orderNoRequest"));
      }

      await fetch(`/api/custom-requests/${selectedOrder.requestId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "REVIEWED" }),
      });

      router.push(`/${locale}/admin/requests?requestId=${selectedOrder.requestId}`);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  async function rejectOrder() {
    if (!selectedOrder) return;
    setLoading(true);
    setError(null);
    setReviewMessage(null);
    try {
      await fetch("/api/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: selectedOrder.id, status: "CANCELLED" }),
      });
      setReviewMessage(t("orderRejected"));
      await fetchOrders();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.14em] text-slate-500">
            {t("label")}
          </p>
          <h1 className="text-2xl font-bold text-slate-50">{t("ordersSection")}</h1>
        </div>
        <NeonButton variant="ghost" onClick={() => void fetchOrders()}>
          {t("refresh")}
        </NeonButton>
      </div>

      {error && <p className="text-sm text-rose-300">{error}</p>}
      {reviewMessage && <p className="text-sm text-emerald-300">{reviewMessage}</p>}

      <DashboardCard>
        <NeonTable
          headers={[
            t("table.order"),
            t("table.status"),
            t("table.amount"),
            t("table.created"),
            "",
          ]}
        >
          {orders.map((order) => (
            <tr key={order.id} className="hover:bg-slate-900/40">
              <td className="px-4 py-3 text-sm text-slate-100">
                <div className="font-semibold">{order.serviceTitle ?? t("orderFallback")}</div>
                <div className="text-xs text-slate-400">
                  {order.client?.name ?? order.client?.email ?? "-"}
                </div>
              </td>
              <td className="px-4 py-3">
                <StatusBadge status={order.status} />
              </td>
              <td className="px-4 py-3 text-sm text-slate-100">
                USD {order.totalAmount.toFixed(2)}
              </td>
              <td className="px-4 py-3 text-sm text-slate-400">
                {formatDate(order.createdAt)}
              </td>
              <td className="px-4 py-3 text-right">
                <NeonButton
                  variant="ghost"
                  className="px-3 py-1 text-xs"
                  onClick={() => openOrder(order)}
                >
                  {t("reviewOrder")}
                </NeonButton>
                <NeonButton
                  variant="danger"
                  className="ml-2 px-3 py-1 text-xs"
                  onClick={() => void archiveOrder(order.id, true)}
                >
                  {t("actions.archive")}
                </NeonButton>
              </td>
            </tr>
          ))}
          {orders.length == 0 && (
            <tr>
              <td className="px-4 py-3 text-sm text-slate-400" colSpan={5}>
                {t("ordersEmpty")}
              </td>
            </tr>
          )}
        </NeonTable>
      </DashboardCard>

      {selectedOrder && (
        <div
          className="fixed left-0 right-0 bottom-0 top-20 z-50 flex items-start justify-center overflow-y-auto bg-black/60 px-4 py-6 md:top-20"
          onClick={closeOrder}
        >
          <div
            className="w-full max-w-3xl space-y-4 rounded-2xl border border-slate-800/70 bg-[#050b18] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.6)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.14em] text-slate-500">
                  {t("orderReviewTitle")}
                </p>
                <h3 className="text-xl font-bold text-slate-50">
                  {selectedOrder.serviceTitle ?? t("orderFallback")}
                </h3>
                <p className="text-sm text-slate-400">
                  {selectedOrder.client?.email ?? "-"}
                </p>
              </div>
              <NeonButton variant="ghost" onClick={closeOrder}>
                {t("close")}
              </NeonButton>
            </div>

            <div className="rounded-xl border border-slate-800/70 bg-[#0b1120]/80 p-4">
              <div className="grid gap-3 md:grid-cols-2 text-sm text-slate-200">
                <div>
                  <div className="text-xs uppercase tracking-[0.12em] text-slate-500">
                    {t("orderDetails")}
                  </div>
                  <div className="mt-2 space-y-1">
                    <div>{t("table.order")}: {selectedOrder.id}</div>
                    <div>{t("table.status")}: {selectedOrder.status}</div>
                    <div>{t("table.amount")}: USD {selectedOrder.totalAmount.toFixed(2)}</div>
                    <div>{t("table.created")}: {formatDate(selectedOrder.createdAt)}</div>
                  </div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-[0.12em] text-slate-500">
                    {t("orderClient")}
                  </div>
                  <div className="mt-2 space-y-1">
                    <div>{selectedOrder.client?.name ?? t("emptyValue")}</div>
                    <div>{selectedOrder.client?.email ?? t("emptyValue")}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-slate-800/70 bg-[#0b1120]/80 p-4">
              <div className="text-xs uppercase tracking-[0.12em] text-slate-500">
                {t("orderRequest")}
              </div>
              <div className="mt-2 space-y-2 text-sm text-slate-200">
                <div>{selectedOrder.request?.projectType ?? t("emptyValue")}</div>
                <div>{selectedOrder.request?.budgetRange ?? t("emptyValue")}</div>
                <div>{selectedOrder.request?.timeline ?? t("emptyValue")}</div>
                <div className="text-xs text-slate-400 whitespace-pre-wrap">
                  {selectedOrder.request?.details ?? t("emptyValue")}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-2">
              <NeonButton
                variant="ghost"
                className="px-3 py-1 text-xs"
                onClick={() => void rejectOrder()}
                disabled={loading}
              >
                {t("rejectOrder")}
              </NeonButton>
              <NeonButton
                variant="success"
                className="px-3 py-1 text-xs"
                onClick={() => void approveOrder()}
                disabled={loading || !selectedOrder.requestId}
              >
                {t("approve")}
              </NeonButton>
            </div>

            {!selectedOrder.requestId && (
              <p className="text-xs text-rose-300">{t("orderNoRequest")}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
