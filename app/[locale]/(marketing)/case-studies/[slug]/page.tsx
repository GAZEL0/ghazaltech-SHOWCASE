import { CaseStudyClient } from "@/components/marketing/case-studies/CaseStudyClient";
import { Footer } from "@/components/marketing/Footer";
import { Navbar } from "@/components/marketing/Navbar";
import { NeonBackground } from "@/components/marketing/NeonBackground";
import { prisma } from "@/lib/db";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

type CaseStudyPageProps = {
  params: Promise<{ locale: string; slug: string }>;
};

export async function generateMetadata({ params }: CaseStudyPageProps) {
  const { locale, slug } = await params;
  const study = await prisma.caseStudy.findFirst({
    where: { slug, locale, status: "PUBLISHED" },
  });

  if (!study) return {};

  return {
    title: study.title,
    description: study.challengeSummary,
    openGraph: {
      title: study.title,
      description: study.challengeSummary,
      locale,
      type: "article",
      images: study.coverImage ? [study.coverImage] : undefined,
    },
  };
}

export default async function CaseStudyPage({ params }: CaseStudyPageProps) {
  const { locale, slug } = await params;
  const t = await getTranslations({ locale, namespace: "caseStudyPage" });

  const study = await prisma.caseStudy.findFirst({
    where: { slug, locale, status: "PUBLISHED" },
  });

  if (!study) {
    notFound();
  }

  return (
    <NeonBackground>
      <Navbar locale={locale} />
      <main dir={locale === "ar" ? "rtl" : "ltr"} className={locale === "ar" ? "rtl rtl:text-right" : ""}>
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
          <CaseStudyClient
            locale={locale}
            backLabel={t("back")}
            labels={{
              projectType: t("labels.projectType"),
              industry: t("labels.industry"),
              duration: t("labels.duration"),
              technologies: t("labels.technologies"),
              visualFallback: t("labels.visualFallback"),
            }}
            sections={{
              challenge: t("sections.challenge"),
              solution: t("sections.solution"),
              implementation: t("sections.implementation"),
              results: t("sections.results"),
              testimonial: t("sections.testimonial"),
            }}
            cta={{
              title: t("cta.title"),
              body: t("cta.body"),
              primary: t("cta.primary"),
              secondary: t("cta.secondary"),
            }}
            caseStudy={{
              title: study.title,
              clientName: study.clientName,
              projectType: study.projectType,
              industry: study.industry,
              duration: study.duration,
              technologies: study.technologies,
              coverImage: study.coverImage,
              challengeSummary: study.challengeSummary,
              primaryResult: study.primaryResult,
              challenge: study.challenge,
              solution: study.solution,
              implementation: study.implementation,
              results: study.results as { label?: string; value?: string; note?: string }[] | null,
              testimonial: study.testimonial,
            }}
          />
        </div>
      </main>
      <Footer />
    </NeonBackground>
  );
}
