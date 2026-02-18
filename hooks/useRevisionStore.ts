"use client";

import { RevisionStatus } from "@prisma/client";
import { create } from "zustand";

export type Revision = {
  id: string;
  projectId: string;
  projectTitle?: string;
  title: string;
  amount: number;
  status: RevisionStatus;
  details?: string | null;
  sessionAt?: string | null;
  sessionDurationMinutes?: number | null;
  sessionNotes?: string | null;
  sessionLinks?: string[];
  paymentProofUrl?: string | null;
  clientProposedAt?: string | null;
  clientProposedDurationMinutes?: number | null;
  clientProposedNote?: string | null;
  completedAt?: string | null;
  createdAt?: string;
};

type RevisionState = {
  loading: boolean;
  error?: string | null;
  revisions: Revision[];
  fetchRevisions: () => Promise<void>;
  createRevision: (payload: {
    projectId: string;
    title: string;
    amount: number;
    details?: string;
  }) => Promise<void>;
  updateRevision: (payload: {
    id: string;
    status?: RevisionStatus;
    amount?: number | null;
    sessionAt?: string | null;
    sessionDurationMinutes?: number | null;
    sessionNotes?: string | null;
    sessionLinks?: string[] | string | null;
    paymentProofUrl?: string | null;
    clientProposedAt?: string | null;
    clientProposedDurationMinutes?: number | null;
    clientProposedNote?: string | null;
    completedAt?: string | null;
    clearProposal?: boolean;
  }) => Promise<void>;
  updateRevisionStatus: (id: string, status: RevisionStatus) => Promise<void>;
  scheduleRevision: (payload: {
    id: string;
    sessionAt: string | null;
    sessionDurationMinutes: number | null;
    amount?: number | null;
    sessionNotes?: string | null;
    sessionLinks?: string[] | string | null;
    clearProposal?: boolean;
    status?: RevisionStatus;
  }) => Promise<void>;
};

export const useRevisionStore = create<RevisionState>((set, get) => ({
  loading: false,
  error: null,
  revisions: [],

  fetchRevisions: async () => {
    set({ loading: true, error: null });
    try {
      const res = await fetch("/api/revisions", { cache: "no-store", credentials: "include" });
      if (!res.ok) throw new Error("Failed to load revisions");
      const data = (await res.json()) as Revision[];
      set({ revisions: data, loading: false });
    } catch (error) {
      set({ loading: false, error: (error as Error).message });
    }
  },

  createRevision: async (payload) => {
    try {
      const res = await fetch("/api/revisions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to create revision");
      const created = (await res.json()) as Revision;
      set({ revisions: [created, ...get().revisions] });
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },

  updateRevision: async (payload) => {
    try {
      const res = await fetch(`/api/revisions?id=${payload.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to update revision");
      const updated = (await res.json()) as Revision;
      const revisions = get().revisions.map((rev) => (rev.id === payload.id ? updated : rev));
      set({ revisions });
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },

  updateRevisionStatus: async (id, status) => {
    await get().updateRevision({ id, status });
  },

  scheduleRevision: async ({
    id,
    sessionAt,
    sessionDurationMinutes,
    status,
    amount,
    sessionNotes,
    sessionLinks,
    clearProposal,
  }) => {
    await get().updateRevision({
      id,
      sessionAt,
      sessionDurationMinutes,
      status,
      amount,
      sessionNotes,
      sessionLinks,
      clearProposal,
    });
  },
}));
