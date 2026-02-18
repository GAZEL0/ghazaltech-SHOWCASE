import { RevisionsClient } from "../_components/RevisionsClient";

type RevisionsPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function RevisionsPage({ params }: RevisionsPageProps) {
  const { locale } = await params;
  return <RevisionsClient locale={locale} />;
}
