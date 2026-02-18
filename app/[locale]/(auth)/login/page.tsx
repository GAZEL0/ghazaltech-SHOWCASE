"use client";

import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { useTranslations } from "next-intl";

type LoginPageProps = {
  params: Promise<{ locale: string }>;
};

export default function LoginPage({ params }: LoginPageProps) {
  const t = useTranslations("auth.login");
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { locale } = await params;

    let callbackUrl = searchParams.get("callbackUrl") || undefined;

    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
      callbackUrl,
    });

    if (res?.error) {
      setError(res.error === "CredentialsSignin" ? t("errors.invalidCredentials") : res.error);
      setLoading(false);
      return;
    }

    if (!callbackUrl) {
      try {
        const sessionRes = await fetch("/api/auth/session", { cache: "no-store" });
        const session = await sessionRes.json();
        const role = session?.user?.role;
        callbackUrl = role === "ADMIN" || role === "PARTNER" ? `/${locale}/admin` : `/${locale}/dashboard`;
      } catch (err) {
        console.error(err);
      }
    }

    if (res?.url) {
      window.location.href = callbackUrl ?? res.url;
      return;
    }

    setLoading(false);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#020617] px-6 py-12 text-slate-100">
      <div className="w-full max-w-md space-y-6 rounded-2xl border border-slate-800/60 bg-slate-950/80 p-8 shadow-[0_20px_50px_rgba(0,0,0,0.45)]">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.14em] text-slate-500">{t("kicker")}</p>
          <h1 className="text-2xl font-bold text-slate-50">{t("title")}</h1>
          <p className="text-sm text-slate-400">
            {t("subtitle")}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="flex flex-col gap-2 text-sm text-slate-200">
            <span className="text-xs uppercase tracking-[0.08em] text-slate-500">{t("emailLabel")}</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-slate-100 outline-none focus:border-cyan-400/70 focus:shadow-[0_0_18px_rgba(56,189,248,0.35)]"
              placeholder={t("emailPlaceholder")}
            />
          </label>

          <label className="flex flex-col gap-2 text-sm text-slate-200">
            <span className="text-xs uppercase tracking-[0.08em] text-slate-500">{t("passwordLabel")}</span>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-slate-100 outline-none focus:border-cyan-400/70 focus:shadow-[0_0_18px_rgba(56,189,248,0.35)]"
              placeholder={t("passwordPlaceholder")}
            />
          </label>

          {error && <p className="text-sm text-rose-300">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center rounded-xl border border-sky-400/70 bg-gradient-to-r from-cyan-500 to-sky-500 px-4 py-2.5 text-sm font-semibold text-slate-900 shadow-[0_0_25px_rgba(56,189,248,0.45)] transition hover:shadow-[0_0_35px_rgba(56,189,248,0.65)] disabled:opacity-60"
          >
            {loading ? t("submitting") : t("submit")}
          </button>
        </form>
      </div>
    </main>
  );
}
