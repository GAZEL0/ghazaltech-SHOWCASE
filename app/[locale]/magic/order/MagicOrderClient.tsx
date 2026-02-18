"use client";

import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { NeonButton } from "@/components/dashboard/NeonButton";
import { StatusBadge } from "@/components/dashboard/StatusBadge";

type ValidateResponse = {
  email?: string;
  targetType?: string | null;
  targetId?: string | null;
  meta?: Record<string, unknown>;
  hasPassword?: boolean;
};

export function MagicOrderClient({ locale }: { locale: string }) {
  const t = useTranslations("magicOrder");
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(!!token);
  const [error, setError] = useState<string | null>(token ? null : t("errors.missingToken"));
  const [details, setDetails] = useState<ValidateResponse | null>(null);
  const [needsPassword, setNeedsPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);
  const [redirectPath, setRedirectPath] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    const run = async () => {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/magic/login/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      if (!res.ok) {
        const text = await res.text();
        setError(text || t("errors.invalid"));
        setLoading(false);
        return;
      }

      const data = (await res.json()) as ValidateResponse;
      setDetails(data);
      const projectId = typeof data.meta?.projectId === "string" ? data.meta.projectId : null;
      const callbackUrl = projectId
        ? `/${locale}/dashboard/projects/${projectId}`
        : `/${locale}/dashboard`;
      setRedirectPath(callbackUrl);

      const login = await signIn("credentials", {
        redirect: false,
        email: data.email,
        password: token,
        callbackUrl,
      });

      if (login?.error) {
        setError(login.error);
        setLoading(false);
        return;
      }

      setNeedsPassword(!data.hasPassword);
      if (data.hasPassword) {
        router.push(callbackUrl);
        return;
      }

      setLoading(false);
    };

    void run();
  }, [locale, router, t, token]);

  async function savePassword() {
    if (!password || password.length < 8) {
      setError(t("errors.passwordLength"));
      return;
    }
    setLoading(true);
    setError(null);
    setPasswordMessage(null);
    try {
      const res = await fetch("/api/account/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(payload.error || t("errors.savePassword"));
      }
      setNeedsPassword(false);
      setPasswordMessage(t("status.passwordSaved"));
      if (redirectPath) {
        router.push(redirectPath);
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#020617] px-6 py-10 text-slate-50">
      <div className="w-full max-w-2xl space-y-4">
        <div>
          <p className="text-xs uppercase tracking-[0.14em] text-slate-500">{t("title.kicker")}</p>
          <h1 className="text-2xl font-bold text-slate-50">{t("title.heading")}</h1>
          <p className="text-sm text-slate-400">
            {t("title.subheading")}
          </p>
        </div>

        <DashboardCard>
          {loading && <p className="text-sm text-slate-300">{t("loading.validating")}</p>}
          {error && <p className="text-sm text-rose-300">{error}</p>}
          {!loading && details && (
            <div className="space-y-2 text-sm text-slate-200">
              <div className="flex items-center gap-2">
                <StatusBadge status="PENDING" />
                <span className="text-xs text-slate-400">{t("status.pending")}</span>
              </div>
              <div className="rounded-lg border border-slate-800/70 bg-slate-950/50 p-3">
                <div className="text-xs uppercase tracking-[0.12em] text-slate-500">
                  {t("sections.account")}
                </div>
                <p className="mt-1 font-semibold text-slate-100">{details.email}</p>
              </div>
              {needsPassword && (
                <div className="space-y-2 rounded-lg border border-amber-400/50 bg-amber-900/20 p-3 text-amber-50">
                  <div className="text-sm font-semibold">{t("password.title")}</div>
                  <p className="text-xs text-amber-100">{t("password.body")}</p>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-lg border border-amber-400/50 bg-transparent px-3 py-2 text-sm text-slate-50 outline-none focus:border-amber-200"
                    placeholder={t("password.placeholder")}
                  />
                  <div className="flex justify-end">
                    <NeonButton variant="success" className="px-3 py-1 text-xs" onClick={() => void savePassword()} disabled={loading}>
                      {t("password.save")}
                    </NeonButton>
                  </div>
                  {passwordMessage && <p className="text-xs text-emerald-200">{passwordMessage}</p>}
                </div>
              )}
            </div>
          )}
          {!loading && error && (
            <div className="mt-3">
              <NeonButton variant="ghost" onClick={() => router.push(`/${locale}/contact`)}>
                {t("actions.contact")}
              </NeonButton>
            </div>
          )}
        </DashboardCard>
      </div>
    </main>
  );
}
