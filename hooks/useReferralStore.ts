"use client";

import { create } from "zustand";

type ReferralState = {
  loading: boolean;
  error?: string | null;
  link?: string;
  referrals: number;
  earned: number;
  available: number;
  pending: number;
  items: {
    id: string;
    status: string;
    commissionAmount: number;
    available: number;
    pending: number;
    orderId?: string | null;
    referredUser?: { id: string; name: string | null; email: string } | null;
  }[];
  fetchReferral: () => Promise<void>;
  requestPayout: () => Promise<void>;
};

export const useReferralStore = create<ReferralState>((set, get) => ({
  loading: false,
  error: null,
  link: "",
  referrals: 0,
  earned: 0,
  available: 0,
  pending: 0,
  items: [],

  fetchReferral: async () => {
    set({ loading: true, error: null });
    try {
      const res = await fetch("/api/referrals", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to load referral data");
      const data = (await res.json()) as {
        link: string;
        referrals: number;
        earned: number;
        available: number;
        pending?: number;
        items?: ReferralState["items"];
      };
      set({
        loading: false,
        link: data.link,
        referrals: data.referrals,
        earned: data.earned,
        available: data.available,
        pending: data.pending ?? 0,
        items: data.items ?? [],
      });
    } catch (error) {
      set({ loading: false, error: (error as Error).message });
    }
  },

  requestPayout: async () => {
    try {
      const res = await fetch("/api/referrals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "request-payout" }),
      });
      if (!res.ok) throw new Error("Failed to request payout");
      const data = await res.json();
      set({
        available: data.available ?? get().available,
        earned: data.earned ?? get().earned,
        pending: data.pending ?? get().pending,
        items: data.items ?? get().items,
        referrals: data.referrals ?? get().referrals,
      });
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },
}));
