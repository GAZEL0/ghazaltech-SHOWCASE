"use client";

import { create } from "zustand";

type MilestoneStatus = "PENDING" | "UNDER_REVIEW" | "APPROVED" | "REJECTED";

export type Payment = {
  id: string;
  projectId: string;
  projectTitle?: string;
  label: string;
  amount: number;
  status: MilestoneStatus;
  proofUrl?: string | null;
  createdAt?: string;
  dueDate?: string | null;
  gatePhaseId?: string | null;
  changeRequestId?: string | null;
  archivedAt?: string | null;
};

type PaymentState = {
  loading: boolean;
  error?: string | null;
  payments: Payment[];
  fetchPayments: (archived?: boolean) => Promise<void>;
  uploadProof: (payload: {
    projectId: string;
    label: string;
    amount: number;
    file?: File;
  }) => Promise<void>;
  updatePaymentStatus: (id: string, status: MilestoneStatus) => Promise<void>;
  archivePayment: (id: string, archived: boolean) => Promise<void>;
};

export const usePaymentStore = create<PaymentState>((set, get) => ({
  loading: false,
  error: null,
  payments: [],

  fetchPayments: async (archived = false) => {
    set({ loading: true, error: null });
    try {
      const query = archived ? "?archived=1" : "";
      const res = await fetch(`/api/payments${query}`, { cache: "no-store", credentials: "include" });
      if (!res.ok) throw new Error("Failed to load payments");
      const data = (await res.json()) as Payment[];
      const sorted = [...data].sort((a, b) => {
        const dueA = a.dueDate ? new Date(a.dueDate).getTime() : null;
        const dueB = b.dueDate ? new Date(b.dueDate).getTime() : null;
        if (dueA !== null || dueB !== null) {
          if (dueA !== null && dueB !== null && dueA !== dueB) return dueA - dueB;
          if (dueA !== null && dueB === null) return -1;
          if (dueA === null && dueB !== null) return 1;
        }
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : Number.MAX_SAFE_INTEGER;
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : Number.MAX_SAFE_INTEGER;
        if (timeA !== timeB) return timeA - timeB;
        return a.label.localeCompare(b.label);
      });
      set({ payments: sorted, loading: false });
    } catch (error) {
      set({ loading: false, error: (error as Error).message });
    }
  },

  uploadProof: async ({ projectId, label, amount, file }) => {
    try {
      if (!file) {
        throw new Error("Please choose a file to upload");
      }

      // create the payment entry first
      const createRes = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ projectId, label, amount }),
      });
      if (!createRes.ok) throw new Error("Failed to create payment");
      const created = (await createRes.json()) as Payment;
      let updated: Payment | undefined = created;

      // upload proof if provided
      if (file) {
        const form = new FormData();
        form.append("file", file);
        // use the English alias and fallback to Arabic for compatibility
        const uploadEndpoint = `/api/payments/${created.id}/proof`;
        const uploadRes = await fetch(uploadEndpoint, {
          method: "POST",
          body: form,
          credentials: "include",
        });
        if (!uploadRes.ok) {
          const errText = await uploadRes.text();
          throw new Error(`Failed to upload proof: ${errText || uploadRes.statusText}`);
        }
        updated = (await uploadRes.json()) as Payment;
      }

      // merge immediately for responsiveness
      set({
        payments: [updated, ...get().payments.filter((p) => p.id !== updated.id)],
      });
      await get().fetchPayments();
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },

  updatePaymentStatus: async (id, status) => {
    try {
      const res = await fetch(`/api/payments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Failed to update payment");
      const updated = (await res.json()) as Payment;
      const payments = get().payments.map((p) => (p.id === id ? updated : p));
      set({ payments });
      // refresh to keep in sync
      await get().fetchPayments();
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },

  archivePayment: async (id, archived) => {
    try {
      const res = await fetch(`/api/payments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ archived }),
      });
      if (!res.ok) throw new Error("Failed to update payment");
      const updated = (await res.json()) as Payment;
      const payments = get().payments.map((p) => (p.id === id ? updated : p)).filter((p) => !p.archivedAt);
      set({ payments });
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },
}));
