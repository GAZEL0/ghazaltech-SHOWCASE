import { ProjectDetailClient } from "@/components/marketing/projects/ProjectDetailClient";
import { Footer } from "@/components/marketing/Footer";
import { Navbar } from "@/components/marketing/Navbar";
import { NeonBackground } from "@/components/marketing/NeonBackground";
import { prisma } from "@/lib/db";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

type ProjectPageProps = {
  params: Promise<{ locale: string; slug: string }>;
};

export async function generateMetadata({ params }: ProjectPageProps) {
  const { locale, slug } = await params;
  const project = await prisma.portfolioItem.findFirst({
    where: { slug, locale, isPublished: true },
  });

  if (!project) return {};

  return {
    title: project.title,
    description: project.description ?? project.fullDescription ?? "",
    openGraph: {
      title: project.title,
      description: project.description ?? project.fullDescription ?? "",
      locale,
      type: "article",
      images: project.coverImage ? [project.coverImage] : undefined,
    },
  };
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { locale, slug } = await params;
  const t = await getTranslations({ locale, namespace: "projectPage" });

  const project = await prisma.portfolioItem.findFirst({
    where: { slug, locale, isPublished: true },
    include: {
      project: {
        include: { review: true },
      },
    },
  });

  if (!project) {
    notFound();
  }

  return (
    <NeonBackground>
      <Navbar locale={locale} />
      <main dir={locale === "ar" ? "rtl" : "ltr"} className={locale === "ar" ? "rtl rtl:text-right" : ""}>
        <ProjectDetailClient
          locale={locale}
          labels={{
            back: t("back"),
            type: t("labels.type"),
            category: t("labels.category"),
            concept: t("labels.concept"),
            clientGoal: t("labels.clientGoal"),
            overview: t("sections.overview"),
            problem: t("sections.problem"),
            solution: t("sections.solution"),
            features: t("sections.features"),
            gallery: t("sections.gallery"),
            video: t("sections.video"),
            preview: t("sections.preview"),
            livePreview: t("cta.livePreview"),
            reviewTitle: t("sections.review"),
          }}
          project={{
            title: project.title,
            description: project.description,
            fullDescription: project.fullDescription,
            projectType: project.projectType,
            category: project.category,
            concept: project.concept,
            clientGoal: project.clientGoal,
            problem: project.problem,
            solution: project.solution,
            keyFeatures: project.keyFeatures as string[] | null,
            coverImage: project.coverImage,
            gallery: project.gallery as string[] | null,
            videoUrl: project.videoUrl,
            liveUrl: project.liveUrl,
            laptopPreviewImage: project.laptopPreviewImage,
            tabletPreviewImage: project.tabletPreviewImage,
            mobilePreviewImage: project.mobilePreviewImage,
            review: project.project?.review?.isPublic
              ? { rating: project.project.review.rating, comment: project.project.review.comment }
              : null,
          }}
        />
      </main>
      <Footer />
    </NeonBackground>
  );
}
