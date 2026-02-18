"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useTranslations } from "next-intl";

type SidebarLink = {
  label: string;
  href: string;
  badge?: string;
  adminOnly?: boolean;
};

type DashboardSidebarProps = {
  links: SidebarLink[];
  role: "ADMIN" | "PARTNER" | "CLIENT";
};

export function DashboardSidebar({ links, role }: DashboardSidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const t = useTranslations("dashboard.sidebar");

  return (
    <aside
      className={`gt-surface relative flex h-full flex-col border-r border-slate-800/70 bg-[#050b18]/90 p-4 transition-all ${
        collapsed ? "w-16" : "w-64"
      }`}
    >
      <div className="mb-6 flex items-center justify-between">
        <div className={`text-sm font-bold text-slate-100 ${collapsed ? "hidden" : "block"}`}>
          Ghazal Tech
        </div>
        <button
          type="button"
          className="rounded-lg border border-slate-700/60 bg-slate-900/70 p-2 text-slate-200 hover:border-sky-400/60"
          onClick={() => setCollapsed((prev) => !prev)}
          aria-label={t("toggle")}
        >
          {collapsed ? ">>" : "<<"}
        </button>
      </div>

      <nav className="space-y-1">
        {links
          .filter((link) => (link.adminOnly ? role === "ADMIN" : true))
          .map((link) => {
            const active = pathname?.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`gt-card group flex items-center justify-between gap-2 rounded-xl border px-3 py-2 text-sm font-semibold transition ${
                  active
                    ? "border-sky-400/80 bg-sky-500/10 text-slate-50 shadow-[0_0_22px_rgba(56,189,248,0.3)]"
                    : "border-slate-800/60 bg-slate-950/50 text-slate-300 hover:border-sky-400/60 hover:text-slate-50"
                }`}
              >
                <span className={collapsed ? "hidden" : "block"}>{link.label}</span>
                {link.badge && !collapsed && (
                  <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[11px] text-slate-200">
                    {link.badge}
                  </span>
                )}
                {collapsed && (
                  <span className="text-xs font-bold text-slate-200">
                    {link.label.slice(0, 1).toUpperCase()}
                  </span>
                )}
              </Link>
            );
          })}
      </nav>
    </aside>
  );
}
