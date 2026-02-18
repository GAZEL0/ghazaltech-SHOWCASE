import { PaymentsClient } from "../_components/PaymentsClient";

type PaymentsPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function PaymentsPage({ params }: PaymentsPageProps) {
  const { locale } = await params;
  return <PaymentsClient locale={locale} />;
}
