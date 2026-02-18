import { prisma } from "@/lib/db";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { estimateReadingTime, slugify } from "@/lib/blog";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  const isStaff = session?.user.role === "ADMIN" || session?.user.role === "PARTNER";
  const url = new URL(request.url);
  const includeDraft =
    url.searchParams.get("includeDraft") === "true" &&
    isStaff;
  const status = url.searchParams.get("status");
  const locale = url.searchParams.get("locale") ?? undefined;
  const category = url.searchParams.get("category") ?? undefined;
  const query = url.searchParams.get("q")?.trim() ?? "";

  const where: Record<string, unknown> = {};
  if (!includeDraft) {
    where.status = "PUBLISHED";
  } else if (status) {
    where.status = status;
  }
  if (locale) where.locale = locale;
  if (category) where.category = category;
  if (query) {
    where.OR = [
      { title: { contains: query, mode: "insensitive" } },
      { excerpt: { contains: query, mode: "insensitive" } },
      { content: { contains: query, mode: "insensitive" } },
    ];
  }

  const posts = await prisma.blogPost.findMany({
    where,
    orderBy: [
      { featured: "desc" },
      { publishedAt: "desc" },
      { createdAt: "desc" },
    ],
  });

  const includeContent = isStaff;

  return NextResponse.json(
    posts.map((post) => ({
      id: post.id,
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      content: includeContent ? post.content : undefined,
      coverImage: post.coverImage,
      category: post.category,
      tags: post.tags,
      status: post.status,
      locale: post.locale,
      featured: post.featured,
      authorName: post.authorName,
      readingTime: post.readingTime ?? estimateReadingTime(post.content),
      publishedAt: post.publishedAt,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
    })),
  );
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  const isStaff = session?.user.role === "ADMIN" || session?.user.role === "PARTNER";
  if (!session || !isStaff) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as {
    title?: string;
    slug?: string;
    excerpt?: string;
    content?: string;
    coverImage?: string | null;
    category?: string;
    tags?: string[];
    status?: "DRAFT" | "PUBLISHED";
    locale?: string;
    featured?: boolean;
    authorName?: string | null;
    seoTitle?: string | null;
    seoDescription?: string | null;
    readingTime?: number | null;
    publishedAt?: string | null;
  };

  if (!body.title || !body.excerpt || !body.content || !body.category) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const baseSlug = slugify(body.slug?.trim() || body.title);
  let finalSlug = baseSlug;
  let counter = 1;
  while (await prisma.blogPost.findUnique({ where: { slug: finalSlug } })) {
    counter += 1;
    finalSlug = `${baseSlug}-${counter}`;
  }

  const status = body.status ?? "DRAFT";
  const publishedAt =
    status === "PUBLISHED"
      ? body.publishedAt
        ? new Date(body.publishedAt)
        : new Date()
      : null;

  const created = await prisma.blogPost.create({
    data: {
      title: body.title,
      slug: finalSlug,
      excerpt: body.excerpt,
      content: body.content,
      coverImage: body.coverImage ?? null,
      category: body.category,
      tags: body.tags ?? [],
      status,
      locale: body.locale ?? "en",
      featured: body.featured ?? false,
      authorName: body.authorName ?? null,
      seoTitle: body.seoTitle ?? null,
      seoDescription: body.seoDescription ?? null,
      readingTime:
        typeof body.readingTime === "number" && body.readingTime > 0
          ? Math.round(body.readingTime)
          : estimateReadingTime(body.content),
      publishedAt,
    },
  });

  return NextResponse.json(created);
}
