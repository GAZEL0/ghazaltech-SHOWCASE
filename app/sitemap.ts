import type { MetadataRoute } from "next";
import { prisma } from "@/lib/db";
import { locales } from "@/i18n";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL ??
    process.env.NEXTAUTH_URL ??
    "http://localhost:3000";

  const now = new Date();
  const staticPaths = [
    "",
    "/about",
    "/blog",
    "/case-studies",
    "/services",
    "/services/websites",
    "/services/web-systems",
    "/services/support",
    "/services/tech-solutions",
    "/templates",
    "/custom-project",
    "/order",
    "/workflow",
    "/referrals",
    "/support",
    "/faq",
    "/contact",
    "/terms",
    "/privacy",
    "/work",
    "/developers/frontend",
  ];

  const entries: MetadataRoute.Sitemap = [];
  locales.forEach((locale) => {
    staticPaths.forEach((path) => {
      entries.push({
        url: `${baseUrl}/${locale}${path}`,
        lastModified: now,
      });
    });
  });

  const posts = await prisma.blogPost.findMany({
    where: { status: "PUBLISHED" },
    select: { slug: true, locale: true, updatedAt: true },
  });

  posts.forEach((post) => {
    entries.push({
      url: `${baseUrl}/${post.locale}/blog/${post.slug}`,
      lastModified: post.updatedAt,
    });
  });

  const caseStudies = await prisma.caseStudy.findMany({
    where: { status: "PUBLISHED" },
    select: { slug: true, locale: true, updatedAt: true },
  });

  caseStudies.forEach((item) => {
    entries.push({
      url: `${baseUrl}/${item.locale}/case-studies/${item.slug}`,
      lastModified: item.updatedAt,
    });
  });

  return entries;
}
