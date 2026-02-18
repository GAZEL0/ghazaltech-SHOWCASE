"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { useOrderStore } from "@/hooks/useOrderStore";

type OrdersClientProps = { locale: string };

export function OrdersClient({ locale }: OrdersClientProps) {
  const t = useTranslations("dashboard.ordersPage");
  const { orders, fetchOrders, loading, error } = useOrderStore();
  const [openOrderId, setOpenOrderId] = useState<string | null>(null);

  const sortMilestones = (a: { createdAt?: string; label: string; dueDate?: string | null }, b: { createdAt?: string; label: string; dueDate?: string | null }) => {
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
  };

  useEffect(() => {
    void fetchOrders();
  }, [fetchOrders]);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.14em] text-slate-500">{t("kicker")}</p>
          <h1 className="text-2xl font-bold text-slate-50">{t("title")}</h1>
        </div>
      </div>

      {error && <p className="text-sm text-rose-300">{error}</p>}

      <div className="grid gap-4">
        {orders.map((order) => {
          const isOpen = openOrderId === order.id;
          const milestones = [...(order.project?.milestonePayments ?? [])].sort(sortMilestones);
          const phases =
            order.project?.phases?.map((phase) => ({
              id: phase.id,
              label: phase.title,
              status: phase.status,
            })) ??
            milestones
              .filter((m) => (m.amount ?? 0) === 0)
              .map((m) => ({ id: m.id, label: m.label, status: m.status }));
          return (
            <DashboardCard key={order.id}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="text-xs uppercase tracking-[0.12em] text-slate-500">
                    {t("orderLabel", { id: order.id.slice(0, 6) })}
                  </div>
                  <div className="text-lg font-semibold text-slate-50">
                    {order.serviceTitle ?? t("customService")}
                  </div>
                  <div className="text-sm text-slate-400">
                    {order.createdAt ? new Date(order.createdAt).toLocaleString(locale) : t("unknownDate")}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={order.status} />
                  <div className="text-sm font-semibold text-emerald-200">
                    {t("amount", { amount: order.totalAmount.toFixed(2) })}
                  </div>
                <button
                  className="text-xs text-sky-300 underline underline-offset-2"
                  onClick={() => setOpenOrderId(isOpen ? null : order.id)}
                >
                  {isOpen ? t("actions.hide") : t("actions.show")}
                </button>
              </div>
            </div>

              {isOpen && (
                <>
                  <div className="mt-3 grid gap-3 md:grid-cols-2">
                    <div className="rounded-lg border border-slate-800/70 bg-slate-950/50 p-3">
                      <div className="text-xs uppercase tracking-[0.12em] text-slate-500">{t("requestTitle")}</div>
                      <div className="text-sm text-slate-100">
                        {order.request?.projectType ?? t("unknownValue")}
                      </div>
                      <div className="text-xs text-slate-500">
                        {t("requestMeta", { budget: order.request?.budgetRange ?? t("unknownValue"), timeline: order.request?.timeline ?? t("unknownValue") })}
                      </div>
                    </div>
                    <div className="rounded-lg border border-slate-800/70 bg-slate-950/50 p-3">
                      <div className="text-xs uppercase tracking-[0.12em] text-slate-500">{t("detailsTitle")}</div>
                      <p className="text-sm text-slate-200 whitespace-pre-wrap">
                        {order.request?.details ?? t("pendingSetup")}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 space-y-3 rounded-lg border border-slate-800/70 bg-slate-950/50 p-3 text-sm text-slate-200">
                    {order.project ? (
                      <>
                        <div className="flex items-center justify-between gap-2">
                          <span>{t("projectCreated")}</span>
                          <StatusBadge status={order.project.status} />
                        </div>
                        {order.project.plan?.notes && (
                          <p className="text-xs text-slate-400">{t("notesLabel", { notes: order.project.plan.notes })}</p>
                        )}
                        <div className="grid gap-3 md:grid-cols-2">
                          <div>
                            <div className="text-xs uppercase tracking-[0.12em] text-slate-500">{t("phasesTitle")}</div>
                            <div className="mt-2 space-y-2">
                              {phases.map((phase) => (
                                  <div
                                    key={phase.id}
                                    className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-2"
                                  >
                                    <span className="text-sm text-slate-100">{phase.label}</span>
                                    <StatusBadge status={phase.status} />
                                  </div>
                                ))}
                              {(phases.length ?? 0) === 0 && (
                                <p className="text-xs text-slate-500">{t("awaitingPlan")}</p>
                              )}
                            </div>
                          </div>
                          <div>
                            <div className="text-xs uppercase tracking-[0.12em] text-slate-500">{t("paymentsTitle")}</div>
                            <div className="mt-2 space-y-2">
                              {milestones
                                .filter((m) => (m.amount ?? 0) > 0)
                                .map((m) => (
                                  <div
                                    key={m.id}
                                    className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-2"
                                  >
                                    <span className="text-sm text-slate-100">{m.label}</span>
                                    <div className="flex items-center gap-2">
                                      <span className="text-xs text-emerald-200">{t("amount", { amount: m.amount.toFixed(2) })}</span>
                                      <StatusBadge status={m.status} />
                                    </div>
                                  </div>
                                ))}
                              {(milestones.filter((m) => (m.amount ?? 0) > 0).length ?? 0) ===
                                0 && <p className="text-xs text-slate-500">{t("noPaymentSchedule")}</p>}
                            </div>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="text-slate-300">{t("awaitingProject")}</div>
                    )}
                  </div>
                </>
              )}
            </DashboardCard>
          );
        })}
        {orders.length === 0 && (
          <DashboardCard>
            <p className="text-sm text-slate-300">
              {loading ? t("loading") : t("empty")}
            </p>
          </DashboardCard>
        )}
      </div>
    </div>
  );
}
