"use client";

import { signIn } from "next-auth/react";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { NeonButton } from "@/components/dashboard/NeonButton";
import { StatusBadge } from "@/components/dashboard/StatusBadge";

type QuoteMeta = {
  deliveryEstimate?: string | null;
  timeline?: string | null;
  phases?: {
    key?: string | null;
    group?: string | null;
    title?: string | null;
    description?: string | null;
    dueDate?: string | null;
  }[];
  paymentSchedule?: {
    label?: string | null;
    amount?: number | null;
    dueDate?: string | null;
    beforePhaseKey?: string | null;
  }[];
  paymentNotes?: string | null;
};

type ValidateResponse = {
  quoteId: string;
  email: string;
  amount: number;
  currency: string;
  scope: string;
  status: string;
  expiresAt?: string;
  request?: { fullName?: string; projectType?: string | null };
  meta?: QuoteMeta | null;
  hasPassword?: boolean;
};

export function MagicQuoteClient({ locale }: { locale: string }) {
  const t = useTranslations("magicQuote");
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(!!token);
  const [attempted, setAttempted] = useState(false);
  const [error, setError] = useState<string | null>(
    token ? null : t("errors.missingToken"),
  );
  const [authenticated, setAuthenticated] = useState(false);
  const [quote, setQuote] = useState<ValidateResponse | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [needsPassword, setNeedsPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);
  const [redirectPath, setRedirectPath] = useState<string | null>(null);
  const [pendingAccept, setPendingAccept] = useState(false);

  useEffect(() => {
    if (!token || attempted) {
      return;
    }

    setAttempted(true);

    const run = async () => {
      setLoading(true);
      setError(null);

      const res = await fetch("/api/quotes/magic/validate", {
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
      setQuote(data);

      const login = await signIn("credentials", {
        redirect: false,
        email: data.email,
        password: token,
        callbackUrl: `/${locale}/dashboard/quotes/${data.quoteId}`,
      });

      if (login?.error) {
        setError(login.error);
        setLoading(false);
        return;
      }

      setAuthenticated(true);
      setLoading(false);
      setActionMessage(t("status.signedIn"));
    };

    void run();
  }, [attempted, locale, router, t, token]);

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
      if (pendingAccept) {
        await handleAction("accept", true);
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  async function handleAction(action: "accept" | "reject", passwordAlreadySaved = false) {
    if (!quote) return;
    if (action === "accept" && quote.hasPassword === false && !passwordAlreadySaved) {
      setNeedsPassword(true);
      setPendingAccept(true);
      setError(null);
      setActionMessage(t("status.passwordRequired"));
      return;
    }
    setError(null);
    setActionMessage(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/quotes/${quote.quoteId}/${action}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(
          payload.error || (action === "accept" ? t("errors.acceptFailed") : t("errors.rejectFailed")),
        );
      }
      setActionMessage(action === "accept" ? t("status.accepted") : t("status.rejected"));
      if (payload.magicLink) {
        window.location.href = payload.magicLink;
        return;
      }

      const targetPath =
        payload.projectId && authenticated
          ? `/${locale}/dashboard/projects/${payload.projectId}`
          : `/${locale}/dashboard/orders`;

      if (action === "accept" && (quote.hasPassword !== false || passwordAlreadySaved)) {
        router.push(targetPath);
        return;
      }

      setRedirectPath(targetPath);
      setActionMessage(
        action === "accept"
          ? t("status.acceptedNeedsPassword")
          : t("status.rejected"),
      );
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
          {!loading && quote && (
            <div className="space-y-3 text-sm text-slate-200">
              <div className="flex items-center gap-2">
                <StatusBadge status={quote.status} />
                {quote.expiresAt && (
                    <span className="text-xs text-slate-400">
                      {t("status.expires", {
                        date: new Date(quote.expiresAt).toLocaleString(locale),
                      })}
                    </span>
                )}
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
              <div className="rounded-lg border border-slate-800/70 bg-slate-950/50 p-3">
                <div className="text-xs uppercase tracking-[0.12em] text-slate-500">
                  {t("sections.scope")}
                </div>
                <p className="mt-2 whitespace-pre-wrap text-slate-100">{quote.scope}</p>
              </div>
              {quote.meta?.timeline && (
                <div className="rounded-lg border border-slate-800/70 bg-slate-950/50 p-3">
                  <div className="text-xs uppercase tracking-[0.12em] text-slate-500">
                    {t("sections.timeline")}
                  </div>
                  <p className="mt-2 whitespace-pre-wrap text-slate-100">{quote.meta.timeline}</p>
                </div>
              )}
              {quote.meta?.deliveryEstimate && (
                <div className="rounded-lg border border-slate-800/70 bg-slate-950/50 p-3">
                  <div className="text-xs uppercase tracking-[0.12em] text-slate-500">
                    {t("sections.delivery")}
                  </div>
                  <p className="mt-2 whitespace-pre-wrap text-slate-100">
                    {quote.meta.deliveryEstimate}
                  </p>
                </div>
              )}
              {quote.meta?.phases && quote.meta.phases.length > 0 && (
                <div className="rounded-lg border border-slate-800/70 bg-slate-950/50 p-3">
                  <div className="text-xs uppercase tracking-[0.12em] text-slate-500">
                    {t("sections.phases")}
                  </div>
                  <div className="mt-2 space-y-2 text-slate-100">
                    {quote.meta.phases.map((phase, idx) => (
                      <div
                        key={phase.key ?? `${phase.title}-${idx}`}
                        className="flex items-center justify-between text-xs"
                      >
                        <span>{phase.title ?? t("labels.phase", { index: idx + 1 })}</span>
                        <span className="text-slate-400">
                          {phase.group ?? ""}
                          {phase.dueDate ? ` - ${phase.dueDate}` : ""}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {quote.meta?.paymentSchedule && quote.meta.paymentSchedule.length > 0 && (
                <div className="rounded-lg border border-slate-800/70 bg-slate-950/50 p-3">
                  <div className="text-xs uppercase tracking-[0.12em] text-slate-500">
                    {t("sections.paymentSchedule")}
                  </div>
                  <div className="mt-2 space-y-2 text-slate-100">
                    {quote.meta.paymentSchedule.map((item, idx) => (
                      <div key={`${item.label}-${idx}`} className="flex items-center justify-between text-xs">
                        <span>{item.label ?? t("labels.milestone", { index: idx + 1 })}</span>
                        {(() => {
                          const amountValue =
                            typeof item.amount === "number"
                              ? item.amount
                              : item.amount
                                ? Number(item.amount)
                                : undefined;
                          const hasAmount = typeof amountValue === "number" && !Number.isNaN(amountValue);
                          return (
                            <span className="text-emerald-200">
                              {hasAmount ? `${quote.currency} ${amountValue.toLocaleString()}` : "-"}
                              {item.dueDate ? ` - ${item.dueDate}` : ""}
                            </span>
                          );
                        })()}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {quote.meta?.paymentNotes && (
                <div className="rounded-lg border border-slate-800/70 bg-slate-950/50 p-3">
                  <div className="text-xs uppercase tracking-[0.12em] text-slate-500">
                    {t("sections.notes")}
                  </div>
                  <p className="mt-2 whitespace-pre-wrap text-slate-100">{quote.meta.paymentNotes}</p>
                </div>
              )}
              <div className="flex items-center justify-between rounded-lg border border-slate-800/70 bg-slate-950/50 px-3 py-2">
                <span>{t("labels.amount")}</span>
                <span className="text-lg font-semibold text-emerald-200">
                  {quote.currency} {quote.amount.toLocaleString()}
                </span>
              </div>
              {actionMessage && <p className="text-xs text-emerald-300">{actionMessage}</p>}
              <div className="flex flex-wrap gap-2">
                <NeonButton variant="success" disabled={loading} onClick={() => void handleAction("accept")}>
                  {t("actions.accept")}
                </NeonButton>
                <NeonButton variant="ghost" disabled={loading} onClick={() => void handleAction("reject")}>
                  {t("actions.reject")}
                </NeonButton>
                {passwordMessage && redirectPath && (
                  <NeonButton variant="ghost" onClick={() => router.push(redirectPath)}>
                    {t("actions.account")}
                  </NeonButton>
                )}
              </div>
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
