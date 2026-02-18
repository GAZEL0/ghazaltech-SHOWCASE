import { SupportClient } from "./SupportClient";

type SupportPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function SupportDashboardPage({ params }: SupportPageProps) {
  const { locale } = await params;
  return <SupportClient locale={locale} />;
}
