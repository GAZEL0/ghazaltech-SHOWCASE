"use client";

import {
  type InvoiceStatus,
  type MilestoneStatus,
  type ProjectStatus,
  type RevisionStatus,
} from "@prisma/client";
import { create } from "zustand";

type MilestonePayment = {
  id: string;
  label: string;
  amount: number;
  status: MilestoneStatus;
  createdAt?: string;
  proofUrl?: string | null;
  reviewedBy?: string | null;
  reviewedAt?: string | null;
  dueDate?: string | null;
  gatePhaseId?: string | null;
  changeRequestId?: string | null;
};

type Invoice = {
  id: string;
  amountDue: number;
  amountPaid: number;
  status: InvoiceStatus;
  issuedAt?: string | null;
  pdfUrl?: string | null;
};

type Revision = {
  id: string;
  title: string;
  amount: number;
  status: RevisionStatus;
  createdAt: string;
};

type PhaseAsset = {
  id: string;
  type: "IMAGE" | "LINK";
  url: string;
  label?: string | null;
  createdAt?: string;
};

type PhaseComment = {
  id: string;
  body: string;
  createdAt: string;
  author?: { id: string; name?: string | null; email?: string | null } | null;
  attachments?: { id: string; url: string; label?: string | null }[];
};

type ProjectPhase = {
  id: string;
  group: ProjectStatus;
  title: string;
  description?: string | null;
  dueDate?: string | null;
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "BLOCKED";
  order: number;
  deliverables?: PhaseAsset[];
  comments?: PhaseComment[];
};

type ChangeRequest = {
  id: string;
  title: string;
  description?: string | null;
  amount: number;
  status: "PENDING" | "ACCEPTED" | "REJECTED";
  createdAt?: string;
  decidedAt?: string | null;
};

export type Project = {
  id: string;
  title: string;
  description?: string | null;
  status: ProjectStatus;
  orderId: string;
  dueDate?: string | null;
  archivedAt?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  review?: {
    id: string;
    rating: number;
    comment?: string | null;
    isPublic: boolean;
    createdAt?: string;
  } | null;
  portfolioItems?: { id: string; slug?: string | null; isPublished: boolean; title?: string | null }[];
  milestonePayments?: MilestonePayment[];
  phases?: ProjectPhase[];
  changeRequests?: ChangeRequest[];
  invoices?: Invoice[];
  revisions?: Revision[];
  auditLogs?: { id: string; action: string; createdAt: string; data?: unknown }[];
};

type ProjectState = {
  loading: boolean;
  error?: string | null;
  projects: Project[];
  current?: Project;
  fetchProjects: (archived?: boolean) => Promise<void>;
  fetchProject: (id: string) => Promise<Project | undefined>;
  updateStatus: (id: string, status: ProjectStatus) => Promise<void>;
  archiveProject: (id: string, archived: boolean) => Promise<void>;
  addMilestone: (projectId: string, milestone: { label: string; amount: number }) => Promise<void>;
  updatePhaseStatus: (
    projectId: string,
    phaseId: string,
    status: ProjectPhase["status"],
  ) => Promise<void>;
  addPhaseDeliverable: (
    projectId: string,
    phaseId: string,
    payload: { file?: File; url?: string; label?: string },
  ) => Promise<void>;
  addPhaseComment: (
    projectId: string,
    phaseId: string,
    payload: { body: string; file?: File },
  ) => Promise<void>;
  createChangeRequest: (
    projectId: string,
    payload: { title: string; description?: string; amount: number },
  ) => Promise<void>;
  respondChangeRequest: (
    projectId: string,
    changeId: string,
    action: "accept" | "reject",
  ) => Promise<void>;
  updateChangeRequest: (
    projectId: string,
    changeId: string,
    payload: { title?: string; description?: string | null; amount?: number },
  ) => Promise<void>;
};

export const useProjectStore = create<ProjectState>((set, get) => ({
  loading: false,
  error: null,
  projects: [],
  current: undefined,

  fetchProjects: async (archived = false) => {
    set({ loading: true, error: null });
    try {
      const query = archived ? "?archived=1" : "";
      const res = await fetch(`/api/projects${query}`, { cache: "no-store", credentials: "include" });
      if (!res.ok) throw new Error("Failed to load projects");
      const data = (await res.json()) as Project[];
      set({ projects: data, loading: false });
    } catch (error) {
      set({ loading: false, error: (error as Error).message });
    }
  },

  fetchProject: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const res = await fetch(`/api/projects/${id}`, { cache: "no-store", credentials: "include" });
      if (!res.ok) throw new Error("Failed to load project");
      const data = (await res.json()) as Project;
      set({ current: data, loading: false });
      return data;
    } catch (error) {
      set({ loading: false, error: (error as Error).message });
      return undefined;
    }
  },

  updateStatus: async (id, status) => {
    try {
      const res = await fetch(`/api/projects/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      const updated = (await res.json()) as Project;
      const projects = get().projects.map((p) => (p.id === id ? updated : p));
      set({ projects, current: updated });
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },

  archiveProject: async (id, archived) => {
    try {
      const res = await fetch(`/api/projects/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ archived }),
      });
      if (!res.ok) throw new Error("Failed to update project");
      const updated = (await res.json()) as Project;
      const projects = get().projects.map((p) => (p.id === id ? updated : p)).filter((p) => !p.archivedAt);
      set({ projects, current: updated.id === get().current?.id ? updated : get().current });
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },

  addMilestone: async (projectId, milestone) => {
    try {
      const res = await fetch(`/api/projects/${projectId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ milestone }),
      });
      if (!res.ok) throw new Error("Failed to add milestone");
      const updated = (await res.json()) as Project;
      const projects = get().projects.map((p) => (p.id === projectId ? updated : p));
      set({ projects, current: updated });
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },

  updatePhaseStatus: async (projectId, phaseId, status) => {
    try {
      const res = await fetch(`/api/projects/${projectId}/phases/${phaseId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Failed to update phase");
      await get().fetchProject(projectId);
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },

  addPhaseDeliverable: async (projectId, phaseId, payload) => {
    try {
      let res: Response;
      if (payload.file) {
        const formData = new FormData();
        formData.append("file", payload.file);
        if (payload.label) formData.append("label", payload.label);
        res = await fetch(`/api/projects/${projectId}/phases/${phaseId}/deliverables`, {
          method: "POST",
          credentials: "include",
          body: formData,
        });
      } else {
        res = await fetch(`/api/projects/${projectId}/phases/${phaseId}/deliverables`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ url: payload.url, label: payload.label }),
        });
      }
      if (!res.ok) throw new Error("Failed to add deliverable");
      await get().fetchProject(projectId);
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },

  addPhaseComment: async (projectId, phaseId, payload) => {
    try {
      const formData = new FormData();
      formData.append("body", payload.body);
      if (payload.file) {
        formData.append("file", payload.file);
      }
      const res = await fetch(`/api/projects/${projectId}/phases/${phaseId}/comments`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });
      if (!res.ok) throw new Error("Failed to add comment");
      await get().fetchProject(projectId);
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },

  createChangeRequest: async (projectId, payload) => {
    try {
      const res = await fetch(`/api/projects/${projectId}/changes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to create change request");
      await get().fetchProject(projectId);
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },

  respondChangeRequest: async (projectId, changeId, action) => {
    try {
      const res = await fetch(`/api/projects/${projectId}/changes/${changeId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ action }),
      });
      if (!res.ok) throw new Error("Failed to update change request");
      await get().fetchProject(projectId);
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },

  updateChangeRequest: async (projectId, changeId, payload) => {
    try {
      const res = await fetch(`/api/projects/${projectId}/changes/${changeId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to update change request");
      await get().fetchProject(projectId);
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },
}));
