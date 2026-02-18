"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type ContactFormProps = {
  locale: string;
  labels: {
    name: string;
    email: string;
    subject: string;
    message: string;
    submit: string;
    sending: string;
    error: string;
  };
  placeholders: {
    name: string;
    email: string;
    subject: string;
  };
};

export function ContactForm({ locale, labels, placeholders }: ContactFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const payload = {
      name: String(formData.get("name") || "").trim(),
      email: String(formData.get("email") || "").trim(),
      subject: String(formData.get("subject") || "").trim(),
      message: String(formData.get("message") || "").trim(),
      locale,
    };

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        setError(labels.error);
        setIsSubmitting(false);
        return;
      }

      router.push(`/${locale}/success`);
    } catch (err) {
      console.error("Contact form submission failed.", err);
      setError(labels.error);
      setIsSubmitting(false);
    }
  }

  return (
    <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
      <InputField label={labels.name} name="name" placeholder={placeholders.name} />
      <InputField label={labels.email} name="email" placeholder={placeholders.email} type="email" />
      <InputField label={labels.subject} name="subject" placeholder={placeholders.subject} />
      <div>
        <label className="mb-1 block text-sm text-slate-200">{labels.message}</label>
        <textarea
          name="message"
          className="w-full rounded-2xl border border-slate-600/70 bg-[#020617cc] px-3 py-3 text-sm text-slate-100 shadow-[0_12px_30px_rgba(15,23,42,0.8)] focus:border-cyan-300/80 focus:outline-none"
          rows={4}
          required
        />
      </div>
      {error && <p className="text-sm text-rose-200" role="alert">{error}</p>}
      <button
        type="submit"
        className="w-full rounded-full bg-gradient-to-r from-cyan-400 to-sky-500 px-5 py-3 text-sm font-bold text-slate-900 shadow-[0_0_25px_rgba(14,165,233,0.65)] transition hover:scale-[1.01] hover:shadow-[0_0_35px_rgba(56,189,248,0.85)] disabled:cursor-not-allowed disabled:opacity-70"
        disabled={isSubmitting}
      >
        {isSubmitting ? labels.sending : labels.submit}
      </button>
    </form>
  );
}

function InputField({
  label,
  name,
  placeholder,
  type = "text",
}: {
  label: string;
  name: string;
  placeholder: string;
  type?: string;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm text-slate-200">{label}</label>
      <input
        type={type}
        name={name}
        placeholder={placeholder}
        required
        className="w-full rounded-2xl border border-slate-600/70 bg-[#020617cc] px-3 py-3 text-sm text-slate-100 shadow-[0_12px_30px_rgba(15,23,42,0.8)] placeholder:text-slate-500 focus:border-cyan-300/80 focus:outline-none"
      />
    </div>
  );
}
