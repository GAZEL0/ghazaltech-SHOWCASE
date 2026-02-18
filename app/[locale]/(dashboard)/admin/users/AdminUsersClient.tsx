"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useSession } from "next-auth/react";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { NeonButton } from "@/components/dashboard/NeonButton";
import { NeonInput } from "@/components/dashboard/NeonInput";
import { NeonTable } from "@/components/dashboard/NeonTable";

type AdminUser = {
  id: string;
  name: string | null;
  email: string;
  phone?: string | null;
  role: string;
  orders: number;
  referralCommissionRate?: number;
  createdAt?: string;
};

export function AdminUsersClient({ locale }: { locale: string }) {
  const t = useTranslations("dashboard.admin");
  const { data: session } = useSession();
  const selfId = session?.user?.id ?? null;
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordStatus, setPasswordStatus] = useState<string | null>(null);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [commissionRate, setCommissionRate] = useState("");
  const [commissionStatus, setCommissionStatus] = useState<string | null>(null);
  const [commissionError, setCommissionError] = useState<string | null>(null);

  const loadUsers = useCallback(async () => {
    const res = await fetch("/api/admin/users", { cache: "no-store" });
    if (res.ok) {
      const data = (await res.json()) as AdminUser[];
      setUsers(data);
    }
  }, []);

  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  function formatDate(date?: string) {
    if (!date) return t("emptyValue");
    return new Date(date).toLocaleDateString(locale);
  }

  async function updateUserRole(id: string, role: string) {
    if (selfId && id === selfId && role !== "ADMIN") {
      return;
    }
    await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, role }),
    });
    await loadUsers();
  }

  function openUserDetails(user: AdminUser) {
    setSelectedUser(user);
    setPassword("");
    setConfirmPassword("");
    setPasswordError(null);
    setPasswordStatus(null);
    setCommissionStatus(null);
    setCommissionError(null);
    const rate = typeof user.referralCommissionRate === "number" ? user.referralCommissionRate * 100 : 10;
    setCommissionRate(rate.toString());
  }

  function closeUserDetails() {
    setSelectedUser(null);
    setPassword("");
    setConfirmPassword("");
    setPasswordError(null);
    setPasswordStatus(null);
    setCommissionRate("");
    setCommissionStatus(null);
    setCommissionError(null);
  }

  async function updateUserPassword() {
    if (!selectedUser) return;
    setPasswordError(null);
    setPasswordStatus(null);

    if (password.length < 6) {
      setPasswordError(t("passwordTooShort"));
      return;
    }
    if (password !== confirmPassword) {
      setPasswordError(t("passwordMismatch"));
      return;
    }

    setPasswordLoading(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: selectedUser.id, password }),
      });
      if (!res.ok) {
        const payload = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(payload.error || t("errors.updatePassword"));
      }
      setPasswordStatus(t("passwordUpdated"));
      setPassword("");
      setConfirmPassword("");
    } catch (err) {
      setPasswordError((err as Error).message);
    } finally {
      setPasswordLoading(false);
    }
  }

  async function updateCommissionRate() {
    if (!selectedUser) return;
    setCommissionError(null);
    setCommissionStatus(null);

    const rateValue = Number(commissionRate);
    if (Number.isNaN(rateValue) || rateValue < 0 || rateValue > 100) {
      setCommissionError(t("commissionRateInvalid"));
      return;
    }

    const payload = rateValue / 100;
    await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: selectedUser.id, referralCommissionRate: payload }),
    });
    setCommissionStatus(t("commissionRateUpdated"));
    await loadUsers();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.14em] text-slate-500">
            {t("label")}
          </p>
          <h1 className="text-2xl font-bold text-slate-50">{t("usersSection")}</h1>
        </div>
        <NeonButton variant="ghost" onClick={() => void loadUsers()}>
          {t("refresh")}
        </NeonButton>
      </div>

      <DashboardCard>
        <NeonTable
          headers={[
            t("table.user"),
            t("table.role"),
            t("table.orders"),
            t("table.created"),
            "",
          ]}
        >
          {users.map((user) => {
            const isSelf = selfId === user.id;
            return (
            <tr key={user.id} className="hover:bg-slate-900/40">
              <td className="px-4 py-3 text-sm text-slate-100">
                <div className="font-semibold">{user.name ?? user.email}</div>
                <div className="text-xs text-slate-400">{user.email}</div>
              </td>
              <td className="px-4 py-3 text-sm text-slate-100">{user.role}</td>
              <td className="px-4 py-3 text-sm text-slate-100">{user.orders}</td>
              <td className="px-4 py-3 text-sm text-slate-400">
                {formatDate(user.createdAt)}
              </td>
              <td className="px-4 py-3 text-right">
                <div className="flex justify-end gap-2">
                  <NeonButton
                    variant="ghost"
                    className="px-3 py-1 text-xs"
                    onClick={() => openUserDetails(user)}
                  >
                    {t("viewDetails")}
                  </NeonButton>
                  <NeonButton
                    variant="ghost"
                    className="px-3 py-1 text-xs"
                    onClick={() => updateUserRole(user.id, "CLIENT")}
                    disabled={isSelf}
                    title={isSelf ? t("selfRoleLocked") : undefined}
                  >
                    {t("demote")}
                  </NeonButton>
                  <NeonButton
                    variant="success"
                    className="px-3 py-1 text-xs"
                    onClick={() => updateUserRole(user.id, "PARTNER")}
                    disabled={isSelf}
                    title={isSelf ? t("selfRoleLocked") : undefined}
                  >
                    {t("promote")}
                  </NeonButton>
                </div>
              </td>
            </tr>
            );
          })}
        </NeonTable>
      </DashboardCard>

      {selectedUser && (
        <div
          className="fixed left-0 right-0 bottom-0 top-20 z-50 flex items-start justify-center overflow-y-auto bg-black/60 px-4 py-6 md:top-20"
          onClick={closeUserDetails}
        >
          <div
            className="w-full max-w-3xl space-y-4 rounded-2xl border border-slate-800/70 bg-[#050b18] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.6)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.14em] text-slate-500">
                  {t("userDetails")}
                </p>
                <h3 className="text-xl font-bold text-slate-50">
                  {selectedUser.name ?? selectedUser.email}
                </h3>
                <p className="text-sm text-slate-400">{selectedUser.email}</p>
              </div>
              <NeonButton variant="ghost" onClick={closeUserDetails}>
                {t("close")}
              </NeonButton>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-xl border border-slate-800/70 bg-[#0b1120]/80 p-4">
                <div className="text-xs uppercase tracking-[0.14em] text-slate-500">
                  {t("detailsSection")}
                </div>
                <dl className="mt-2 space-y-2 text-sm text-slate-200">
                  <div className="flex justify-between gap-3">
                    <dt className="text-slate-400">{t("nameLabel")}</dt>
                    <dd>{selectedUser.name ?? t("emptyValue")}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-slate-400">{t("emailLabel")}</dt>
                    <dd>{selectedUser.email ?? t("emptyValue")}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-slate-400">{t("phoneLabel")}</dt>
                    <dd>{selectedUser.phone ?? t("emptyValue")}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-slate-400">{t("roleLabel")}</dt>
                    <dd>{selectedUser.role}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-slate-400">{t("createdLabel")}</dt>
                    <dd>{formatDate(selectedUser.createdAt)}</dd>
                  </div>
                </dl>
              </div>

              <div className="rounded-xl border border-slate-800/70 bg-[#0b1120]/80 p-4">
                <div className="text-xs uppercase tracking-[0.14em] text-slate-500">
                  {t("passwordSection")}
                </div>
                <div className="mt-3 space-y-3">
                  <NeonInput
                    label={t("passwordLabel")}
                    type="password"
                    value={password}
                    onChange={setPassword}
                    placeholder="********"
                  />
                  <NeonInput
                    label={t("confirmPasswordLabel")}
                    type="password"
                    value={confirmPassword}
                    onChange={setConfirmPassword}
                    placeholder="********"
                  />
                  {passwordError && <p className="text-sm text-rose-300">{passwordError}</p>}
                  {passwordStatus && (
                    <p className="text-sm text-emerald-200">{passwordStatus}</p>
                  )}
                  <NeonButton
                    variant="success"
                    className="px-3 py-2 text-xs"
                    onClick={() => void updateUserPassword()}
                    disabled={passwordLoading}
                  >
                    {t("updatePassword")}
                  </NeonButton>
                </div>
              </div>

              <div className="rounded-xl border border-slate-800/70 bg-[#0b1120]/80 p-4">
                <div className="text-xs uppercase tracking-[0.14em] text-slate-500">
                  {t("commissionSection")}
                </div>
                <div className="mt-3 space-y-3">
                  <NeonInput
                    label={t("commissionRateLabel")}
                    type="number"
                    value={commissionRate}
                    onChange={setCommissionRate}
                    placeholder="10"
                  />
                  {commissionError && (
                    <p className="text-sm text-rose-300">{commissionError}</p>
                  )}
                  {commissionStatus && (
                    <p className="text-sm text-emerald-200">{commissionStatus}</p>
                  )}
                  <NeonButton
                    variant="success"
                    className="px-3 py-2 text-xs"
                    onClick={() => void updateCommissionRate()}
                  >
                    {t("updateCommissionRate")}
                  </NeonButton>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
