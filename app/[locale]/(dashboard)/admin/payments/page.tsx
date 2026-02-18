import { AdminPaymentsClient } from "./AdminPaymentsClient";

type AdminPaymentsPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function AdminPaymentsPage({ params }: AdminPaymentsPageProps) {
  await params;
  return <AdminPaymentsClient />;
}
