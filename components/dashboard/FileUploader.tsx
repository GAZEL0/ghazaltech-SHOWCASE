"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { NeonButton } from "./NeonButton";
import { usePaymentStore } from "@/hooks/usePaymentStore";
import { useProjectStore } from "@/hooks/useProjectStore";

type FileUploaderProps = {
  paymentId: string;
  projectId?: string;
  onUploaded?: (url: string) => void;
};

export function FileUploader({ paymentId, projectId, onUploaded }: FileUploaderProps) {
  const t = useTranslations("dashboard.fileUploader");
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const fetchPayments = usePaymentStore((s) => s.fetchPayments);
  const fetchProject = useProjectStore((s) => s.fetchProject);

  const handleUpload = async (file?: File | null) => {
    if (!file) return;
    setUploading(true);
    setError(null);
    setSuccess(null);
    try {
      const form = new FormData();
      form.append("file", file);
      const endpoint = `/api/payments/${paymentId}/proof`;
      const res = await fetch(encodeURI(endpoint), {
        method: "POST",
        body: form,
        credentials: "include",
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || t("errors.uploadFailed"));
      }
      const data = await res.json();
      setSuccess(t("success"));
      onUploaded?.(data.proofUrl);
      await fetchPayments();
      if (projectId) {
        await fetchProject(projectId);
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          onChange={(e) => void handleUpload(e.target.files?.[0])}
        />
        <NeonButton
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? t("uploading") : t("upload")}
        </NeonButton>
      </div>
      {success && <span className="text-xs text-emerald-300">{success}</span>}
      {error && <span className="text-xs text-rose-300">{error}</span>}
    </div>
  );
}
