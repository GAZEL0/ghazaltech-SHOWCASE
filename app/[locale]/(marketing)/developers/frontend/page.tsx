import { FrontendSnippetsClient } from "@/components/marketing/developers/FrontendSnippetsClient";
import { Footer } from "@/components/marketing/Footer";
import { Navbar } from "@/components/marketing/Navbar";
import { NeonBackground } from "@/components/marketing/NeonBackground";
import { getTranslations } from "next-intl/server";

export const dynamic = "force-dynamic";

type DevelopersFrontendPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: DevelopersFrontendPageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "developersFrontend" });
  return {
    title: t("title"),
    description: t("subtitle"),
    openGraph: {
      title: t("title"),
      description: t("subtitle"),
      locale,
      type: "website",
      images: ["/ghazal_3d_codex_refs/assets/home-dark.png"],
    },
    twitter: {
      card: "summary_large_image",
      title: t("title"),
      description: t("subtitle"),
      images: ["/ghazal_3d_codex_refs/assets/home-dark.png"],
    },
  };
}

export default async function DevelopersFrontendPage({ params }: DevelopersFrontendPageProps) {
  const { locale } = await params;

  return (
    <NeonBackground>
      <Navbar locale={locale} />
      <main dir={locale === "ar" ? "rtl" : "ltr"} className={locale === "ar" ? "rtl rtl:text-right" : ""}>
        <FrontendSnippetsClient locale={locale} />
      </main>
      <Footer />
    </NeonBackground>
  );
}
