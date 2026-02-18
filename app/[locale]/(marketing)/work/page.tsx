import { ProjectsClient } from "@/components/marketing/projects/ProjectsClient";
import { Footer } from "@/components/marketing/Footer";
import { Navbar } from "@/components/marketing/Navbar";
import { NeonBackground } from "@/components/marketing/NeonBackground";
import { prisma } from "@/lib/db";
import { getTranslations } from "next-intl/server";

export const dynamic = "force-dynamic";

type WorkPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: WorkPageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "projectsPage" });
  return {
    title: t("hero.title"),
    description: t("hero.subtitle"),
  };
}

export default async function WorkPage({ params }: WorkPageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "projectsPage" });

  const projects = await prisma.portfolioItem.findMany({
    where: { isPublished: true, locale },
    include: {
      project: {
        include: {
          review: true,
        },
      },
    },
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
  });

  return (
    <NeonBackground>
      <Navbar locale={locale} />
      <main dir={locale === "ar" ? "rtl" : "ltr"} className={locale === "ar" ? "rtl rtl:text-right" : ""}>
        <ProjectsClient
          locale={locale}
          hero={{
            title: t("hero.title"),
            subtitle: t("hero.subtitle"),
          }}
          labels={{
            projectsTitle: t("hero.kicker"),
            typeLabel: t("card.typeFallback"),
            ratingLabel: t("card.ratingLabel"),
            viewProject: t("card.viewCta"),
            emptyTitle: t("empty.title"),
            emptyBody: t("empty.body"),
          }}
          projects={projects.map((project) => ({
            slug: project.slug,
            title: project.title,
            description: project.description,
            projectType: project.projectType,
            coverImage: project.coverImage,
            rating: project.project?.review?.isPublic ? project.project.review.rating : null,
          }))}
        />
      </main>
      <Footer />
    </NeonBackground>
  );
}
