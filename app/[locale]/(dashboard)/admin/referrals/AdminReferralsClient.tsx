"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { NeonButton } from "@/components/dashboard/NeonButton";
import { NeonInput } from "@/components/dashboard/NeonInput";
import { NeonTable } from "@/components/dashboard/NeonTable";
import { StatusBadge } from "@/components/dashboard/StatusBadge";

type AdminReferral = {
  id: string;
  status: string;
  commissionAmount: number;
  commissionRate: number;
  commissionPaidOut: number;
  available: number;
  pending: number;
  referrerEmail: string;
  referredUser?: { id: string; email: string; name?: string | null } | null;
  orderId?: string | null;
  orderTotal?: number;
  createdAt?: string;
};

export function AdminReferralsClient() {
  const t = useTranslations("dashboard.admin");
  const [referrals, setReferrals] = useState<AdminReferral[]>([]);

  const loadReferrals = useCallback(async () => {
    const res = await fetch("/api/admin/referrals", { cache: "no-store" });
    if (res.ok) {
      const data = (await res.json()) as AdminReferral[];
      setReferrals(data);
    }
  }, []);

  useEffect(() => {
    void loadReferrals();
  }, [loadReferrals]);

  async function updateReferral(referral: AdminReferral, status: string) {
    await fetch("/api/admin/referrals", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: referral.id, action: "pay-out", status }),
    });
    await loadReferrals();
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.14em] text-slate-500">
            {t("label")}
          </p>
          <h1 className="text-2xl font-bold text-slate-50">{t("referralsSection")}</h1>
        </div>
        <NeonButton variant="ghost" onClick={() => void loadReferrals()}>
          {t("refresh")}
        </NeonButton>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <DashboardCard title={t("referralsSection")}
          action={
            <NeonButton variant="ghost" className="px-3 py-1 text-xs" onClick={() => void loadReferrals()}>
              {t("refresh")}
            </NeonButton>
          }
        >
          <NeonTable
            headers={[
              t("table.referrer"),
              t("table.referred"),
              t("table.order"),
              t("table.commission"),
              t("table.available"),
              t("table.pending"),
              t("table.status"),
              "",
            ]}
          >
            {referrals.map((referral) => (
              <tr key={referral.id} className="hover:bg-slate-900/40">
                <td className="px-4 py-3 text-sm text-slate-100">
                  {referral.referrerEmail}
                </td>
                <td className="px-4 py-3 text-sm text-slate-100">
                  {referral.referredUser?.email ?? t("emptyValue")}
                </td>
                <td className="px-4 py-3 text-sm text-slate-100">
                  {referral.orderId ?? t("emptyValue")}
                </td>
                <td className="px-4 py-3 text-sm text-slate-100">
                  USD {referral.commissionAmount.toFixed(2)}
                </td>
                <td className="px-4 py-3 text-sm text-slate-100">
                  USD {referral.available.toFixed(2)}
                </td>
                <td className="px-4 py-3 text-sm text-slate-100">
                  USD {referral.pending.toFixed(2)}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={referral.status} />
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-2">
                    <NeonButton
                      variant="success"
                      className="px-3 py-1 text-xs"
                      onClick={() => updateReferral(referral, "PAID_OUT")}
                      disabled={referral.available <= 0}
                    >
                      {t("payOut")}
                    </NeonButton>
                  </div>
                </td>
              </tr>
            ))}
          </NeonTable>
        </DashboardCard>

        <DashboardCard title={t("addCommission")}>
          <form
            className="space-y-3"
            onSubmit={async (e) => {
              e.preventDefault();
              const form = e.target as HTMLFormElement;
              const id = (form.elements.namedItem("referralId") as HTMLInputElement).value;
              const amount = Number(
                (form.elements.namedItem("amount") as HTMLInputElement).value,
              );
              await fetch("/api/admin/referrals", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, commissionAmount: amount }),
              });
              await loadReferrals();
              form.reset();
            }}
          >
            <NeonInput name="referralId" label={t("table.referralId")} placeholder={t("table.enterId")} />
            <NeonInput
              name="amount"
              type="number"
              label={t("table.commission")}
              placeholder="120"
            />
            <NeonButton type="submit" variant="success">
              {t("updateCommission")}
            </NeonButton>
          </form>
        </DashboardCard>
      </div>
    </div>
  );
}
