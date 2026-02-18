"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { ReferralCard } from "@/components/dashboard/ReferralCard";
import { NeonTable } from "@/components/dashboard/NeonTable";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { useReferralStore } from "@/hooks/useReferralStore";

export function ReferralClient() {
  const t = useTranslations("dashboard");
  const {
    link,
    referrals,
    earned,
    available,
    pending,
    items,
    fetchReferral,
    requestPayout,
  } = useReferralStore();
    useReferralStore();

  useEffect(() => {
    void fetchReferral();
  }, [fetchReferral]);

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs uppercase tracking-[0.14em] text-slate-500">
          {t("referralLabel")}
        </p>
        <h1 className="text-2xl font-bold text-slate-50">{t("referral")}</h1>
      </div>

      <ReferralCard
        link={link ?? ""}
        referrals={referrals}
        earned={earned}
        available={available}
        pending={pending}
        labels={{
          title: t("referralSection.title"),
          requestPayout: t("referralSection.requestPayout"),
          referrals: t("referralSection.referrals"),
          earned: t("referralSection.earned"),
          available: t("referralSection.available"),
          pending: t("referralSection.pending"),
        }}
        onRequestPayout={requestPayout}
      />

      <NeonTable
        headers={[
          t("admin.table.referred"),
          t("admin.table.order"),
          t("admin.table.commission"),
          t("admin.table.available"),
          t("admin.table.pending"),
          t("admin.table.status"),
        ]}
      >
        {items.map((item) => (
          <tr key={item.id} className="hover:bg-slate-900/40">
            <td className="px-4 py-3 text-sm text-slate-100">
                <div className="font-semibold">
                  {item.referredUser?.name ?? item.referredUser?.email ?? t("emptyValue")}
                </div>
              {item.referredUser?.email && (
                <div className="text-xs text-slate-400">{item.referredUser.email}</div>
              )}
            </td>
            <td className="px-4 py-3 text-sm text-slate-100">{item.orderId ?? t("emptyValue")}</td>
            <td className="px-4 py-3 text-sm text-slate-100">
              USD {item.commissionAmount.toFixed(2)}
            </td>
            <td className="px-4 py-3 text-sm text-slate-100">
              USD {item.available.toFixed(2)}
            </td>
            <td className="px-4 py-3 text-sm text-slate-100">
              USD {item.pending.toFixed(2)}
            </td>
            <td className="px-4 py-3">
              <StatusBadge status={item.status} />
            </td>
          </tr>
        ))}
        {items.length === 0 && (
          <tr>
            <td className="px-4 py-3 text-sm text-slate-400" colSpan={6}>
              {t("referralSection.empty")}
            </td>
          </tr>
        )}
      </NeonTable>
    </div>
  );
}
