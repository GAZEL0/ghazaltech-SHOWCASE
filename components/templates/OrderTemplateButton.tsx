"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { NeonButton } from "@/components/dashboard/NeonButton";

type OrderTemplateButtonProps = {
  templateId: string;
  templateSlug: string;
  locale: string;
  label: string;
  variant?: "primary" | "ghost" | "success";
  genericErrorMessage?: string;
};

type AddOn = { title: string; amount: string };

export function OrderTemplateButton({
  templateId,
  locale,
  label,
  variant = "primary",
  genericErrorMessage,
}: OrderTemplateButtonProps) {
  const t = useTranslations("templateOrder");
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ fullName: "", email: "", notes: "" });
  const [addOns, setAddOns] = useState<AddOn[]>([]);
  const errorFallback = genericErrorMessage ?? t("errors.generic");

  function updateAddOn(index: number, key: keyof AddOn, value: string) {
    setAddOns((prev) => prev.map((item, i) => (i === index ? { ...item, [key]: value } : item)));
  }

  function addAddOnRow() {
    setAddOns((prev) => [...prev, { title: "", amount: "" }]);
  }

  function removeAddOn(index: number) {
    setAddOns((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payload = {
        fullName: form.fullName || undefined,
        email: form.email,
        notes: form.notes || undefined,
        addOns: addOns
          .filter((a) => a.title || a.amount)
          .map((a) => ({
            title: a.title,
            amount: a.amount === "" ? undefined : Number(a.amount),
          })),
      };

      const res = await fetch(`/api/templates/${templateId}/order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || errorFallback);
      }

      await res.json().catch(() => ({}));
      setOpen(false);
      router.push(`/${locale}/success`);
    } catch (err) {
      setError((err as Error).message || errorFallback);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-2">
      <NeonButton
        variant={variant === "success" ? "success" : variant}
        onClick={() => setOpen((prev) => !prev)}
        disabled={loading}
      >
        {loading ? t("loadingShort") : label}
      </NeonButton>
      {error && <p className="text-xs text-rose-300">{error}</p>}

      {open && (
        <form
          onSubmit={handleSubmit}
          className="space-y-3 rounded-2xl border border-slate-800/70 bg-[#0b1120]/80 p-4"
        >
          <div className="grid gap-3 md:grid-cols-2">
            <label className="flex flex-col gap-1 text-sm text-slate-200">
              <span>{t("form.fullName")}</span>
              <input
                value={form.fullName}
                onChange={(e) => setForm((prev) => ({ ...prev, fullName: e.target.value }))}
                className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-slate-100 outline-none focus:border-cyan-400/70"
                placeholder={t("form.fullNamePlaceholder")}
              />
            </label>
            <label className="flex flex-col gap-1 text-sm text-slate-200">
              <span>{t("form.email")}</span>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-slate-100 outline-none focus:border-cyan-400/70"
                placeholder={t("form.emailPlaceholder")}
              />
            </label>
          </div>

          <label className="flex flex-col gap-1 text-sm text-slate-200">
            <span>{t("form.addOns")}</span>
            <div className="space-y-2">
              {addOns.map((addOn, index) => (
                <div key={`${index}-${addOn.title}`} className="flex gap-2">
                  <input
                    value={addOn.title}
                    onChange={(e) => updateAddOn(index, "title", e.target.value)}
                    className="flex-1 rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-slate-100 outline-none focus:border-cyan-400/70"
                    placeholder={t("form.addOnPlaceholder")}
                  />
                  <input
                    value={addOn.amount}
                    onChange={(e) => updateAddOn(index, "amount", e.target.value)}
                    className="w-28 rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-slate-100 outline-none focus:border-cyan-400/70"
                    type="number"
                    placeholder="0"
                  />
                  <NeonButton variant="ghost" onClick={() => removeAddOn(index)} type="button">
                    {t("form.removeAddOn")}
                  </NeonButton>
                </div>
              ))}
              <NeonButton variant="ghost" type="button" onClick={addAddOnRow}>{t("form.addAddOn")}</NeonButton>
            </div>
          </label>

          <label className="flex flex-col gap-1 text-sm text-slate-200">
            <span>{t("form.notes")}</span>
            <textarea
              value={form.notes}
              onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
              className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-slate-100 outline-none focus:border-cyan-400/70"
              rows={2}
            />
          </label>

          <div className="flex justify-end gap-2">
            <NeonButton variant="ghost" type="button" onClick={() => setOpen(false)}>{t("form.close")}</NeonButton>
            <NeonButton variant="success" type="submit" disabled={loading}>
              {loading ? t("form.submitting") : t("form.submit")}
            </NeonButton>
          </div>
        </form>
      )}
    </div>
  );
}
