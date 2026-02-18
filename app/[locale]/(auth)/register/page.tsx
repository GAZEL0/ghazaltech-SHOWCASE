"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useTranslations } from "next-intl";

type RegisterPageProps = {
  params: Promise<{ locale: string }>;
};

export default function RegisterPage({ params }: RegisterPageProps) {
  const t = useTranslations("auth.register");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    if (password !== confirm) {
      setError(t("errors.passwordMismatch"));
      return;
    }
    setLoading(true);
    const { locale } = await params;

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() || null, phone: phone.trim() || null, email, password }),
      });

      if (!res.ok) {
        const msg = (await res.json().catch(() => null))?.error ?? t("errors.createFailed");
        throw new Error(msg);
      }

      // Auto-login after registration
      await signIn("credentials", {
        redirect: true,
        email,
        password,
        callbackUrl: `/${locale}/dashboard`,
      });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#020617] px-6 py-12 text-slate-100">
      <div className="w-full max-w-md space-y-6 rounded-2xl border border-slate-800/60 bg-slate-950/80 p-8 shadow-[0_20px_50px_rgba(0,0,0,0.45)]">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.14em] text-slate-500">{t("kicker")}</p>
          <h1 className="text-2xl font-bold text-slate-50">{t("title")}</h1>
          <p className="text-sm text-slate-400">{t("subtitle")}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="flex flex-col gap-2 text-sm text-slate-200">
            <span className="text-xs uppercase tracking-[0.08em] text-slate-500">{t("fullNameLabel")}</span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-slate-100 outline-none focus:border-cyan-400/70 focus:shadow-[0_0_18px_rgba(56,189,248,0.35)]"
              placeholder={t("fullNamePlaceholder")}
            />
          </label>

          <label className="flex flex-col gap-2 text-sm text-slate-200">
            <span className="text-xs uppercase tracking-[0.08em] text-slate-500">{t("phoneLabel")}</span>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-slate-100 outline-none focus:border-cyan-400/70 focus:shadow-[0_0_18px_rgba(56,189,248,0.35)]"
              placeholder={t("phonePlaceholder")}
            />
          </label>

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

          <label className="flex flex-col gap-2 text-sm text-slate-200">
            <span className="text-xs uppercase tracking-[0.08em] text-slate-500">{t("confirmPasswordLabel")}</span>
            <input
              type="password"
              required
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-slate-100 outline-none focus:border-cyan-400/70 focus:shadow-[0_0_18px_rgba(56,189,248,0.35)]"
              placeholder={t("confirmPasswordPlaceholder")}
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
