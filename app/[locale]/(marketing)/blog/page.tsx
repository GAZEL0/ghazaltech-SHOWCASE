import { BlogClient } from "@/components/marketing/blog/BlogClient";
import { Footer } from "@/components/marketing/Footer";
import { Navbar } from "@/components/marketing/Navbar";
import { NeonBackground } from "@/components/marketing/NeonBackground";
import { estimateReadingTime } from "@/lib/blog";
import { prisma } from "@/lib/db";
import { getTranslations } from "next-intl/server";

export const dynamic = "force-dynamic";

type BlogPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: BlogPageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "blogPage" });
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

export default async function BlogPage({ params }: BlogPageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "blogPage" });

  const posts = await prisma.blogPost.findMany({
    where: { status: "PUBLISHED", locale },
    orderBy: [{ featured: "desc" }, { publishedAt: "desc" }, { createdAt: "desc" }],
  });

  const categories = t.raw("categories") as { id: string; label: string }[];

  return (
    <NeonBackground>
      <Navbar locale={locale} />
      <main dir={locale === "ar" ? "rtl" : "ltr"} className={locale === "ar" ? "rtl rtl:text-right" : ""}>
        <BlogClient
          locale={locale}
          hero={{
            title: t("hero.title"),
            subtitle: t("hero.subtitle"),
          }}
          featuredLabel={t("featuredLabel")}
          featuredCta={t("featuredCta")}
          filters={{
            all: t("filters.all"),
            searchPlaceholder: t("filters.searchPlaceholder"),
          }}
          categories={categories}
          posts={posts.map((post) => ({
            id: post.id,
            title: post.title,
            slug: post.slug,
            excerpt: post.excerpt,
            coverImage: post.coverImage,
            category: post.category,
            tags: post.tags,
            readingTime: post.readingTime ?? estimateReadingTime(post.content),
            publishedAt: post.publishedAt?.toISOString() ?? null,
            authorName: post.authorName,
            featured: post.featured,
          }))}
          cta={{
            title: t("cta.title"),
            body: t("cta.body"),
            primary: t("cta.primary"),
            secondary: t("cta.secondary"),
          }}
          empty={{
            title: t("empty.title"),
            body: t("empty.body"),
          }}
          readingLabel={t("readingLabel", { minutes: "{minutes}" })}
        />
      </main>
      <Footer />
    </NeonBackground>
  );
}
