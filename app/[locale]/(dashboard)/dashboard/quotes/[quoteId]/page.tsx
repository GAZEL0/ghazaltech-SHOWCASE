import { QuoteDetailClient } from "../QuoteDetailClient";

type QuoteDetailPageProps = {
  params: Promise<{ locale: string; quoteId: string }>;
};

export default async function QuoteDetailPage({ params }: QuoteDetailPageProps) {
  const { locale, quoteId } = await params;
  return <QuoteDetailClient quoteId={quoteId} locale={locale} />;
}
