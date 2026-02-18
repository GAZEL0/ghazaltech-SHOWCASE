"use client";

import { useState } from "react";

type ContactInfoActionsProps = {
  email: string;
  phone: string;
  locationLabel: string;
  locationHref: string;
};

export function ContactInfoActions({
  email,
  phone,
  locationLabel,
  locationHref,
}: ContactInfoActionsProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(phone);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      setCopied(false);
    }
  };

  return (
    <p className="mt-2 text-sm text-slate-400">
      <a
        href={`mailto:${email}`}
        className="inline-flex items-center gap-2 transition-colors hover:text-cyan-100"
      >
        {email}
      </a>
      <br />
      <button
        type="button"
        onClick={handleCopy}
        className="inline-flex items-center gap-2 transition-colors hover:text-cyan-100"
        aria-label="Copy phone number"
      >
        <span dir="ltr" className="inline-block">
          {phone}
        </span>
        <span className="text-[10px] text-cyan-200">{copied ? "Copied" : "Copy"}</span>
      </button>
      <br />
      <a
        href={locationHref}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-2 transition-colors hover:text-cyan-100"
      >
        <span dir="ltr" className="inline-block">
          {locationLabel}
        </span>
      </a>
    </p>
  );
}
