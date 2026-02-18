import { OverviewClient } from "./_components/OverviewClient";

type DashboardHomePageProps = {
  params: Promise<{ locale: string }>;
};

export default async function DashboardHomePage({ params }: DashboardHomePageProps) {
  const { locale } = await params;
  return <OverviewClient locale={locale} />;
}
