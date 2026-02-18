import { QuotesClient } from "./QuotesClient";

type QuotesPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function QuotesPage({ params }: QuotesPageProps) {
  const { locale } = await params;
  return <QuotesClient locale={locale} />;
}
