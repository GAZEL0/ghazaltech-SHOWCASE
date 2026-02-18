import { MagicQuoteClient } from "./MagicQuoteClient";

type MagicQuotePageProps = {
  params: Promise<{ locale: string }>;
};

export default async function MagicQuotePage({ params }: MagicQuotePageProps) {
  const { locale } = await params;
  return <MagicQuoteClient locale={locale} />;
}
