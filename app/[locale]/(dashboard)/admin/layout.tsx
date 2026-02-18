import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { DashboardTopbar } from "@/components/dashboard/DashboardTopbar";
import { locales } from "@/i18n";
import { requireAdminOrPartner } from "@/lib/auth-guard";
import { getTranslations } from "next-intl/server";

type AdminLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function AdminLayout({ children, params }: AdminLayoutProps) {
  const { locale } = await params;
  const session = await requireAdminOrPartner(locale);
  const role = session?.user.role ?? "ADMIN";
  const userName = session?.user.name ?? session?.user.email ?? "Admin";
  const t = await getTranslations({ locale, namespace: "dashboard" });

  const links = [
    { label: t("admin.overview"), href: `/${locale}/admin` },
    { label: t("admin.users"), href: `/${locale}/admin/users`, adminOnly: true },
    { label: t("admin.orders"), href: `/${locale}/admin/orders` },
    { label: t("admin.payments"), href: `/${locale}/admin/payments` },
    { label: t("admin.support"), href: `/${locale}/admin/support` },
    { label: t("admin.referrals"), href: `/${locale}/admin/referrals`, adminOnly: true },
    { label: t("admin.addCommission"), href: `/${locale}/admin/commissions`, adminOnly: true },
    { label: t("admin.archive"), href: `/${locale}/admin/archive` },
    { label: t("admin.customRequests"), href: `/${locale}/admin/requests` },
    { label: t("admin.quotes"), href: `/${locale}/admin/quotes` },
    { label: t("admin.blog"), href: `/${locale}/admin/blog` },
    { label: t("admin.caseStudies"), href: `/${locale}/admin/case-studies` },
    { label: t("admin.projects"), href: `/${locale}/admin/projects` },
    { label: t("admin.templates"), href: `/${locale}/admin/templates` },
    { label: t("admin.developersFrontend"), href: `/${locale}/admin/developers/frontend` },
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
          />
          <main className="relative flex-1 space-y-6 px-6 py-6">
            <div className="pointer-events-none absolute inset-0 opacity-60 [background:radial-gradient(circle_at_20%_20%,rgba(56,189,248,0.08),transparent_35%),radial-gradient(circle_at_80%_0,rgba(34,197,94,0.08),transparent_30%)]" />
            <div className="relative">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}
