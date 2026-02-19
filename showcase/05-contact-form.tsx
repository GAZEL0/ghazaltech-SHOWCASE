"use client";

import { useState } from "react";

type ContactFormProps = {
  locale: string;
};

export function ContactFormSample({ locale }: ContactFormProps) {
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
        setError("Failed to send message");
        setIsSubmitting(false);
        return;
      }

      // In production this redirects to locale-aware success route.
      window.location.href = `/${locale}/success`;
    } catch {
      setError("Network error");
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input name="name" required placeholder="Name" />
      <input name="email" type="email" required placeholder="Email" />
      <textarea name="message" required placeholder="Message" />
      {error && <p role="alert">{error}</p>}
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Sending..." : "Send"}
      </button>
    </form>
  );
}
