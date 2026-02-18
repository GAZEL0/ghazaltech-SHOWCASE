"use client";

import { QuoteStatus } from "@prisma/client";
import { create } from "zustand";

export type Quote = {
  id: string;
  customRequestId: string;
  amount: number;
  currency: string;
  scope: string;
  status: QuoteStatus | string;
  expiresAt?: string;
  sentAt?: string | null;
  acceptedAt?: string | null;
  rejectedAt?: string | null;
  archivedAt?: string | null;
  createdAt?: string;
  meta?: {
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
    projectTitle?: string | null;
    projectDescription?: string | null;
    serviceId?: string | null;
  } | null;
  request?: {
    fullName?: string;
    email?: string;
    projectType?: string | null;
    budgetRange?: string | null;
    timeline?: string | null;
  };
};

type QuoteState = {
  loading: boolean;
  error?: string | null;
  quotes: Quote[];
  current?: Quote;
  fetchQuotes: (archived?: boolean) => Promise<void>;
  fetchQuote: (id: string) => Promise<Quote | undefined>;
  acceptQuote: (id: string) => Promise<{ orderId?: string; projectId?: string } | null>;
  rejectQuote: (id: string) => Promise<boolean>;
  archiveQuote: (id: string, archived: boolean) => Promise<void>;
};

export const useQuoteStore = create<QuoteState>((set) => ({
  loading: false,
  error: null,
  quotes: [],
  current: undefined,

  fetchQuotes: async (archived = false) => {
    set({ loading: true, error: null });
    try {
      const query = archived ? "?archived=1" : "";
      const res = await fetch(`/api/quotes${query}`, { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to load quotes");
      const data = (await res.json()) as Quote[];
      set({ quotes: data, loading: false });
    } catch (error) {
      set({ loading: false, error: (error as Error).message });
    }
  },

  fetchQuote: async (id) => {
    set({ loading: true, error: null });
    try {
      const res = await fetch(`/api/quotes/${id}`, { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to load quote");
      const data = (await res.json()) as Quote;
      set({ current: data, loading: false });
      return data;
    } catch (error) {
      set({ loading: false, error: (error as Error).message });
      return undefined;
    }
  },

  acceptQuote: async (id) => {
    try {
      const res = await fetch(`/api/quotes/${id}/accept`, { method: "POST" });
      if (!res.ok) throw new Error("Failed to accept quote");
      const data = (await res.json()) as { orderId?: string; projectId?: string };
      return data;
    } catch (error) {
      set({ error: (error as Error).message });
      return null;
    }
  },

  rejectQuote: async (id) => {
    try {
      const res = await fetch(`/api/quotes/${id}/reject`, { method: "POST" });
      if (!res.ok) throw new Error("Failed to reject quote");
      await res.json();
      return true;
    } catch (error) {
      set({ error: (error as Error).message });
      return false;
    }
  },

  archiveQuote: async (id, archived) => {
    try {
      const res = await fetch(`/api/quotes/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ archived }),
      });
      if (!res.ok) throw new Error("Failed to update quote");
      const updated = (await res.json()) as { id: string; archivedAt?: string | null };
      set((state) => ({
        quotes: state.quotes.filter((quote) => quote.id !== updated.id),
      }));
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },
}));
