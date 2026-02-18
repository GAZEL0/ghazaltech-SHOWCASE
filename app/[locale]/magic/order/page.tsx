import { MagicOrderClient } from "./MagicOrderClient";

type MagicOrderPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function MagicOrderPage({ params }: MagicOrderPageProps) {
  const { locale } = await params;
  return <MagicOrderClient locale={locale} />;
}
