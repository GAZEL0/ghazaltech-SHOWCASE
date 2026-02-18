"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { NeonButton } from "@/components/dashboard/NeonButton";
import { NeonTable } from "@/components/dashboard/NeonTable";

type AdminUser = {
  id: string;
  name: string | null;
  email: string;
  referralCommissionRate?: number | null;
};

export function AdminCommissionsClient() {
  const t = useTranslations("dashboard.admin");
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [rates, setRates] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const loadUsers = useCallback(async () => {
    const res = await fetch("/api/admin/users", { cache: "no-store" });
    if (!res.ok) return;
    const data = (await res.json()) as AdminUser[];
    setUsers(data);
    const initialRates: Record<string, string> = {};
    data.forEach((user) => {
      const rate = typeof user.referralCommissionRate === "number" ? user.referralCommissionRate * 100 : 10;
      initialRates[user.id] = rate.toString();
    });
    setRates(initialRates);
  }, []);

  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  async function updateRate(userId: string) {
    const value = Number(rates[userId]);
    setErrors((prev) => ({ ...prev, [userId]: "" }));
    setStatus((prev) => ({ ...prev, [userId]: "" }));

    if (Number.isNaN(value) || value < 0 || value > 100) {
      setErrors((prev) => ({ ...prev, [userId]: t("commissionRateInvalid") }));
      return;
    }

    setLoadingId(userId);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: userId, referralCommissionRate: value / 100 }),
      });
      if (!res.ok) {
        const payload = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(payload.error || t("errors.updateCommission"));
      }
      setStatus((prev) => ({ ...prev, [userId]: t("commissionRateUpdated") }));
      await loadUsers();
    } catch (err) {
      setErrors((prev) => ({
        ...prev,
        [userId]: (err as Error).message,
      }));
    } finally {
      setLoadingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.14em] text-slate-500">
            {t("label")}
          </p>
          <h1 className="text-2xl font-bold text-slate-50">{t("addCommission")}</h1>
        </div>
        <NeonButton variant="ghost" onClick={() => void loadUsers()}>
          {t("refresh")}
        </NeonButton>
      </div>

      <DashboardCard>
        <NeonTable
          headers={[
            t("table.user"),
            t("commissionRateLabel"),
            "",
          ]}
        >
          {users.map((user) => (
            <tr key={user.id} className="hover:bg-slate-900/40">
              <td className="px-4 py-3 text-sm text-slate-100">
                <div className="font-semibold">{user.name ?? user.email}</div>
                <div className="text-xs text-slate-400">{user.email}</div>
              </td>
              <td className="px-4 py-3">
                <div className="space-y-2">
                  <input
                    type="number"
                    className="w-24 rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-100 outline-none focus:border-cyan-400/70"
                    value={rates[user.id] ?? ""}
                    onChange={(e) =>
                      setRates((prev) => ({ ...prev, [user.id]: e.target.value }))
                    }
                    aria-label={t("commissionRateLabel")}
                  />
                  {errors[user.id] && (
                    <p className="text-xs text-rose-300">{errors[user.id]}</p>
                  )}
                  {status[user.id] && (
                    <p className="text-xs text-emerald-200">{status[user.id]}</p>
                  )}
                </div>
              </td>
              <td className="px-4 py-3 text-right">
                <NeonButton
                  variant="success"
                  className="px-3 py-1 text-xs"
                  onClick={() => void updateRate(user.id)}
                  disabled={loadingId === user.id}
                >
                  {t("updateCommissionRate")}
                </NeonButton>
              </td>
            </tr>
          ))}
          {users.length === 0 && (
            <tr>
              <td className="px-4 py-3 text-sm text-slate-400" colSpan={3}>
                {t("usersEmpty")}
              </td>
            </tr>
          )}
        </NeonTable>
      </DashboardCard>
    </div>
  );
}
