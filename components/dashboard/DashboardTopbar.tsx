"use client";

import Link from "next/link";
import { LanguageSwitcher } from "@/components/marketing/LanguageSwitcher";
import { NeonButton } from "./NeonButton";
import { signOut } from "next-auth/react";
import { useTranslations } from "next-intl";
import { ThemeToggle } from "../theme/ThemeToggle";

type DashboardTopbarProps = {
  locale: string;
  locales: string[];
  userName?: string | null;
  role?: string;
  onNewOrder?: () => void;
  newOrderHref?: string;
};

export function DashboardTopbar({
  locale,
  locales,
  userName,
  role,
  onNewOrder,
  newOrderHref,
}: DashboardTopbarProps) {
  const t = useTranslations("dashboard");

  return (
    <header className="gt-topbar gt-card gt-surface sticky top-0 z-30 border-b border-slate-800/70 bg-[#0b1120cc] px-6 py-4 backdrop-blur">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-0.5">
          <div className="gt-text-muted text-xs uppercase tracking-[0.14em] text-slate-500">
            {role ?? "CLIENT"}
          </div>
          <div className="text-lg font-semibold text-slate-50">
            Welcome{userName ? `, ${userName}` : ""}
          </div>
        </div>
      <div className="flex items-center gap-3">
        <ThemeToggle />
        <LanguageSwitcher current={locale} locales={locales} />
        <NeonButton variant="ghost" onClick={() => signOut({ callbackUrl: `/${locale}/login` })}>
          {t("actions.logout")}
        </NeonButton>
        {newOrderHref ? (
            <Link href={newOrderHref} className="no-underline">
              <NeonButton variant="ghost">{t("actions.newOrder")}</NeonButton>
            </Link>
          ) : (
            <NeonButton variant="ghost" onClick={onNewOrder}>
              {t("actions.newOrder")}
            </NeonButton>
          )}
        </div>
      </div>
    </header>
  );
}
