import { prisma } from "@/lib/db";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { estimateReadingTime, slugify } from "@/lib/blog";

export const dynamic = "force-dynamic";

type RouteParams = {
  params: { postId: string };
};

export async function GET(_request: Request, { params }: RouteParams) {
  const session = await getServerSession(authOptions);
  const isStaff = session?.user.role === "ADMIN" || session?.user.role === "PARTNER";
  const post = await prisma.blogPost.findUnique({ where: { id: params.postId } });

  if (!post) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (post.status !== "PUBLISHED" && !isStaff) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(post);
}

export async function PATCH(request: Request, { params }: RouteParams) {
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

  const data: Record<string, unknown> = {};

  if (body.title) data.title = body.title;
  if (body.excerpt !== undefined) data.excerpt = body.excerpt;
  if (body.content !== undefined) {
    data.content = body.content;
    data.readingTime = estimateReadingTime(body.content);
  }
  if (body.readingTime !== undefined) {
    data.readingTime =
      typeof body.readingTime === "number" && body.readingTime > 0
        ? Math.round(body.readingTime)
        : null;
  }
  if (body.coverImage !== undefined) data.coverImage = body.coverImage;
  if (body.category) data.category = body.category;
  if (body.tags) data.tags = body.tags;
  if (body.locale) data.locale = body.locale;
  if (typeof body.featured === "boolean") data.featured = body.featured;
  if (body.authorName !== undefined) data.authorName = body.authorName;
  if (body.seoTitle !== undefined) data.seoTitle = body.seoTitle;
  if (body.seoDescription !== undefined) data.seoDescription = body.seoDescription;

  if (body.slug) {
    const baseSlug = slugify(body.slug);
    let finalSlug = baseSlug;
    let counter = 1;
    while (await prisma.blogPost.findFirst({ where: { slug: finalSlug, NOT: { id: params.postId } } })) {
      counter += 1;
      finalSlug = `${baseSlug}-${counter}`;
    }
    data.slug = finalSlug;
  }

  if (body.status) {
    data.status = body.status;
    if (body.status === "PUBLISHED") {
      data.publishedAt = body.publishedAt ? new Date(body.publishedAt) : new Date();
    }
    if (body.status === "DRAFT") {
      data.publishedAt = null;
    }
  } else if (body.publishedAt !== undefined) {
    data.publishedAt = body.publishedAt ? new Date(body.publishedAt) : null;
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  }

  const updated = await prisma.blogPost.update({
    where: { id: params.postId },
    data,
  });

  return NextResponse.json(updated);
}
