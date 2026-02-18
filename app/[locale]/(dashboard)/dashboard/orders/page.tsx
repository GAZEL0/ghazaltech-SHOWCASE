import { OrdersClient } from "./OrdersClient";

type OrdersPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function OrdersPage({ params }: OrdersPageProps) {
  const { locale } = await params;
  return <OrdersClient locale={locale} />;
}
