import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { DashboardTopbar } from "@/components/dashboard/DashboardTopbar";
import { locales } from "@/i18n";
import { requireClient } from "@/lib/auth-guard";
import { getTranslations } from "next-intl/server";

type DashboardLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function DashboardLayout({ children, params }: DashboardLayoutProps) {
  const { locale } = await params;
  const session = await requireClient(locale);
  const role = session?.user.role ?? "CLIENT";
  const userName = session?.user.name ?? session?.user.email ?? "Client";
  const t = await getTranslations({ locale, namespace: "dashboard" });

  const links = [
    { label: t("overview"), href: `/${locale}/dashboard` },
    { label: "Quotes", href: `/${locale}/dashboard/quotes` },
    { label: "Orders", href: `/${locale}/dashboard/orders` },
    { label: t("projects"), href: `/${locale}/dashboard/projects` },
    { label: t("supportNav"), href: `/${locale}/dashboard/support` },
    { label: t("payments"), href: `/${locale}/dashboard/payments` },
    { label: t("invoices"), href: `/${locale}/dashboard/invoices` },
    { label: t("referral"), href: `/${locale}/dashboard/referral` },
    { label: t("revisions"), href: `/${locale}/dashboard/revisions` },
    { label: t("adminPanel"), href: `/${locale}/admin`, adminOnly: true },
  ];

  return (
    <div className="min-h-screen bg-[#020617] text-slate-50">
      <div className="flex min-h-screen">
        <DashboardSidebar links={links} role={role} />
        <div className="relative flex flex-1 flex-col">
        <DashboardTopbar
          locale={locale}
          locales={locales as string[]}
          userName={userName}
          role={role}
          newOrderHref={`/${locale}/custom-project`}
        />
          <main className="relative flex-1 space-y-6 px-6 py-6">
            <div className="pointer-events-none absolute inset-0 opacity-70 [background:radial-gradient(circle_at_20%_20%,rgba(56,189,248,0.08),transparent_35%),radial-gradient(circle_at_80%_0,rgba(34,197,94,0.08),transparent_30%)]" />
            <div className="relative">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}
