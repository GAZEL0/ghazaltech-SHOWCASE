import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { slugify } from "@/lib/blog";

export const dynamic = "force-dynamic";

function cleanText(value: unknown) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function normalizeList(value: unknown) {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }
  if (typeof value === "string") {
    return value
      .split(/\n|,/)
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
}

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  const url = new URL(request.url);
  const includeDraft = url.searchParams.get("includeDraft") === "1";
  const locale = url.searchParams.get("locale") ?? undefined;

  const isAdmin = session?.user.role === "ADMIN" || session?.user.role === "PARTNER";
  const where = {
    ...(locale ? { locale } : {}),
    ...(isAdmin && includeDraft ? {} : { isPublished: true }),
  };

  const items = await prisma.portfolioItem.findMany({
    where,
    include: {
      project: {
        include: {
          review: true,
        },
      },
    },
    orderBy: [{ isPublished: "desc" }, { publishedAt: "desc" }, { createdAt: "desc" }],
  });

  return NextResponse.json(items);
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  const isAdmin = session?.user.role === "ADMIN" || session?.user.role === "PARTNER";
  if (!session || !isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as Record<string, unknown>;
  const title = cleanText(body.title);
  if (!title) {
    return NextResponse.json({ error: "Missing title" }, { status: 400 });
  }

  const slug = cleanText(body.slug) ?? slugify(title);
  const isPublished = body.isPublished === true;
  const publishedAt = cleanText(body.publishedAt)
    ? new Date(cleanText(body.publishedAt) as string)
    : isPublished
      ? new Date()
      : null;
  const gallery = normalizeList(body.gallery);
  const keyFeatures = normalizeList(body.keyFeatures);
  const projectId = cleanText(body.projectId);
  const reviewVisibility = typeof body.reviewVisibility === "boolean" ? body.reviewVisibility : undefined;

  const created = await prisma.portfolioItem.create({
    data: {
      title,
      slug,
      description: cleanText(body.description),
      fullDescription: cleanText(body.fullDescription),
      projectType: cleanText(body.projectType),
      category: cleanText(body.category),
      concept: cleanText(body.concept),
      clientGoal: cleanText(body.clientGoal),
      problem: cleanText(body.problem),
      solution: cleanText(body.solution),
      keyFeatures: keyFeatures.length > 0 ? keyFeatures : null,
      coverImage: cleanText(body.coverImage),
      gallery: gallery.length > 0 ? gallery : null,
      videoUrl: cleanText(body.videoUrl),
      liveUrl: cleanText(body.liveUrl),
      laptopPreviewImage: cleanText(body.laptopPreviewImage),
      tabletPreviewImage: cleanText(body.tabletPreviewImage),
      mobilePreviewImage: cleanText(body.mobilePreviewImage),
      locale: cleanText(body.locale) ?? "en",
      isPublished,
      publishedAt,
      projectId,
    },
    include: {
      project: {
        include: { review: true },
      },
    },
  });

  if (projectId && typeof reviewVisibility === "boolean") {
    await prisma.review.updateMany({
      where: { projectId },
      data: { isPublic: reviewVisibility },
    });
  }

  return NextResponse.json(created);
}
