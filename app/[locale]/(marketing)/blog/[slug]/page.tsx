import { BlogPostClient } from "@/components/marketing/blog/BlogPostClient";
import { extractHeadings, parseMarkdown } from "@/components/marketing/blog/MarkdownBlocks";
import { Footer } from "@/components/marketing/Footer";
import { Navbar } from "@/components/marketing/Navbar";
import { NeonBackground } from "@/components/marketing/NeonBackground";
import { estimateReadingTime } from "@/lib/blog";
import { prisma } from "@/lib/db";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

type BlogPostPageProps = {
  params: Promise<{ locale: string; slug: string }>;
};

export async function generateMetadata({ params }: BlogPostPageProps) {
  const { locale, slug } = await params;
  const post = await prisma.blogPost.findFirst({
    where: { slug, locale, status: "PUBLISHED" },
  });

  if (!post) return {};

  const title = post.seoTitle ?? post.title;
  const description = post.seoDescription ?? post.excerpt;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      locale,
      images: post.coverImage ? [post.coverImage] : undefined,
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { locale, slug } = await params;
  const t = await getTranslations({ locale, namespace: "blogPost" });
  const pageT = await getTranslations({ locale, namespace: "blogPage" });
  const categories = pageT.raw("categories") as { id: string; label: string }[];
  const categoryMap = new Map(categories.map((item) => [item.id, item.label]));

  const post = await prisma.blogPost.findFirst({
    where: { slug, locale, status: "PUBLISHED" },
  });

  if (!post) {
    notFound();
  }

  const readingTime = post.readingTime ?? estimateReadingTime(post.content);
  const blocks = parseMarkdown(post.content);
  const headings = extractHeadings(blocks);
  const insertAfter =
    blocks.length > 3 ? Math.min(Math.max(Math.floor(blocks.length * 0.6), 1), blocks.length - 2) : undefined;

  const related = await prisma.blogPost.findMany({
    where: {
      status: "PUBLISHED",
      locale,
      category: post.category,
      slug: { not: post.slug },
    },
    orderBy: { publishedAt: "desc" },
    take: 3,
  });

  const relatedPosts = related.map((item) => ({
    slug: item.slug,
    title: item.title,
    excerpt: item.excerpt,
    coverImage: item.coverImage,
    categoryLabel: categoryMap.get(item.category) ?? item.category,
    readingTime: item.readingTime ?? estimateReadingTime(item.content),
    publishedAt: item.publishedAt?.toISOString() ?? null,
  }));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    datePublished: post.publishedAt?.toISOString(),
    dateModified: post.updatedAt.toISOString(),
    author: {
      "@type": "Person",
      name: post.authorName ?? "Ghazal Tech",
    },
    image: post.coverImage ? [post.coverImage] : undefined,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `/${locale}/blog/${post.slug}`,
    },
  };

  return (
    <NeonBackground>
      <Navbar locale={locale} />
      <main dir={locale === "ar" ? "rtl" : "ltr"} className={locale === "ar" ? "rtl rtl:text-right" : ""}>
        <BlogPostClient
          locale={locale}
          backLabel={t("back")}
          post={{
            title: post.title,
            excerpt: post.excerpt,
            coverImage: post.coverImage,
            categoryLabel: categoryMap.get(post.category) ?? post.category,
            tags: post.tags,
            authorName: post.authorName,
            readingTime,
            publishedAt: post.publishedAt?.toISOString() ?? null,
          }}
          blocks={blocks}
          headings={headings}
          insertAfter={insertAfter}
          readingLabel={t("readingLabel", { minutes: "{minutes}" })}
          tocTitle={t("tocTitle")}
          tocEmpty={t("tocEmpty")}
          relatedTitle={t("relatedTitle")}
          relatedEmpty={t("relatedEmpty")}
          cta={{
            title: t("cta.title"),
            body: t("cta.body"),
            primary: t("cta.primary"),
            secondary: t("cta.secondary"),
          }}
          relatedPosts={relatedPosts}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </main>
      <Footer />
    </NeonBackground>
  );
}
