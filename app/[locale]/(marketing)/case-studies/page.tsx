import { CaseStudiesClient } from "@/components/marketing/case-studies/CaseStudiesClient";
import { Footer } from "@/components/marketing/Footer";
import { Navbar } from "@/components/marketing/Navbar";
import { NeonBackground } from "@/components/marketing/NeonBackground";
import { prisma } from "@/lib/db";
import { getTranslations } from "next-intl/server";

export const dynamic = "force-dynamic";

type CaseStudiesPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: CaseStudiesPageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "caseStudiesPage" });
  return {
    title: t("hero.title"),
    description: t("hero.subtitle"),
    openGraph: {
      title: t("hero.title"),
      description: t("hero.subtitle"),
      locale,
      type: "website",
    },
  };
}

export default async function CaseStudiesPage({ params }: CaseStudiesPageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "caseStudiesPage" });

  const cases = await prisma.caseStudy.findMany({
    where: { status: "PUBLISHED", locale },
    orderBy: [{ featured: "desc" }, { publishedAt: "desc" }, { createdAt: "desc" }],
  });

  return (
    <NeonBackground>
      <Navbar locale={locale} />
      <main dir={locale === "ar" ? "rtl" : "ltr"} className={locale === "ar" ? "rtl rtl:text-right" : ""}>
        <CaseStudiesClient
          locale={locale}
          hero={{
            kicker: t("hero.kicker"),
            title: t("hero.title"),
            subtitle: t("hero.subtitle"),
            primaryCta: t("hero.primaryCta"),
            secondaryCta: t("hero.secondaryCta"),
          }}
          reasons={{
            title: t("reasons.title"),
            items: t.raw("reasons.items") as { title: string; body: string }[],
          }}
          grid={{
            title: t("grid.title"),
            subtitle: t("grid.subtitle"),
            progressLabel: t("grid.progressLabel"),
          }}
          card={{
            typeLabel: t("card.typeLabel"),
            challengeLabel: t("card.challengeLabel"),
            resultLabel: t("card.resultLabel"),
            readCta: t("card.readCta"),
          }}
          midCta={{
            title: t("midCta.title"),
            body: t("midCta.body"),
            cta: t("midCta.cta"),
          }}
          empty={{
            title: t("empty.title"),
            body: t("empty.body"),
          }}
          cases={cases.map((item) => ({
            id: item.id,
            slug: item.slug,
            title: item.title,
            clientName: item.clientName,
            projectType: item.projectType,
            challengeSummary: item.challengeSummary,
            primaryResult: item.primaryResult,
            coverImage: item.coverImage,
            featured: item.featured,
          }))}
        />
      </main>
      <Footer />
    </NeonBackground>
  );
}
