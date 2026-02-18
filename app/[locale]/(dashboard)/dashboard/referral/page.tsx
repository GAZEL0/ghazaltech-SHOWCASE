import { ReferralClient } from "../_components/ReferralClient";

type ReferralPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function ReferralPage({ params }: ReferralPageProps) {
  void params;
  return <ReferralClient />;
}
