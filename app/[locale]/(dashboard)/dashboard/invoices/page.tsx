import { InvoicesClient } from "../_components/InvoicesClient";

type InvoicesPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function InvoicesPage({ params }: InvoicesPageProps) {
  void params;
  return <InvoicesClient />;
}
