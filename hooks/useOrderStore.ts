"use client";

import { type MilestoneStatus, type OrderStatus, type ProjectStatus } from "@prisma/client";
import { create } from "zustand";

export type Order = {
  id: string;
  status: OrderStatus;
  totalAmount: number;
  serviceId: string;
  serviceTitle?: string;
  archivedAt?: string | null;
  createdAt?: string;
  requestId?: string | null;
  client?: { name: string | null; email: string };
  request?: {
    projectType?: string | null;
    budgetRange?: string | null;
    timeline?: string | null;
    details?: string | null;
  } | null;
  project?: {
    id: string;
    status: ProjectStatus;
    milestonePayments?: { id: string; label: string; amount: number; status: MilestoneStatus; createdAt?: string }[];
    phases?: {
      id: string;
      group: ProjectStatus;
      title: string;
      description?: string | null;
      dueDate?: string | null;
      status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "BLOCKED";
      order: number;
    }[];
    plan?: {
      phases?: string[];
      payments?: { label?: string; amount?: number; dueDate?: string | null }[];
      deadlines?: { phase4?: string | null; phase8?: string | null; delivery?: string | null };
      notes?: string | null;
    } | null;
  } | null;
};

type OrderState = {
  loading: boolean;
  error?: string | null;
  orders: Order[];
  fetchOrders: (archived?: boolean) => Promise<void>;
  createOrder: (payload: {
    serviceId: string;
    totalAmount: number;
  }) => Promise<Order | undefined>;
  archiveOrder: (id: string, archived: boolean) => Promise<void>;
};

export const useOrderStore = create<OrderState>((set, get) => ({
  loading: false,
  error: null,
  orders: [],

  fetchOrders: async (archived = false) => {
    set({ loading: true, error: null });
    try {
      const query = archived ? "?archived=1" : "";
      const res = await fetch(`/api/orders${query}`, { cache: "no-store", credentials: "include" });
      if (!res.ok) throw new Error("Failed to load orders");
      const data = (await res.json()) as Order[];
      set({ orders: data, loading: false });
    } catch (error) {
      set({ loading: false, error: (error as Error).message });
    }
  },

  createOrder: async (payload) => {
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to create order");
      const created = (await res.json()) as Order;
      set({ orders: [created, ...get().orders] });
      return created;
    } catch (error) {
      set({ error: (error as Error).message });
      return undefined;
    }
  },

  archiveOrder: async (id, archived) => {
    try {
      const res = await fetch("/api/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ id, archived }),
      });
      if (!res.ok) throw new Error("Failed to update order");
      const updated = (await res.json()) as Order;
      const orders = get().orders.map((o) => (o.id === id ? updated : o)).filter((o) => !o.archivedAt);
      set({ orders });
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },
}));
