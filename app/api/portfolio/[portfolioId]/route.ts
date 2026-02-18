import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { slugify } from "@/lib/blog";

export const dynamic = "force-dynamic";

type RouteParams = {
  params: Promise<{ portfolioId: string }>;
};

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

export async function PATCH(request: Request, { params }: RouteParams) {
  const { portfolioId } = await params;
  const session = await getServerSession(authOptions);
  const isStaff = session?.user.role === "ADMIN" || session?.user.role === "PARTNER";
  if (!session || !isStaff) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const existing = await prisma.portfolioItem.findUnique({
    where: { id: portfolioId },
    include: { project: { include: { review: true } } },
  });

  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = (await request.json()) as Record<string, unknown>;
  const title = cleanText(body.title) ?? existing.title;
  const slug = cleanText(body.slug) ?? existing.slug ?? slugify(title);
  const isPublished = typeof body.isPublished === "boolean" ? body.isPublished : existing.isPublished;
  const publishedAt = cleanText(body.publishedAt)
    ? new Date(cleanText(body.publishedAt) as string)
    : isPublished && !existing.publishedAt
      ? new Date()
      : existing.publishedAt ?? null;
  const gallery = normalizeList(body.gallery);
  const keyFeatures = normalizeList(body.keyFeatures);
  const projectId = cleanText(body.projectId);
  const reviewVisibility = typeof body.reviewVisibility === "boolean" ? body.reviewVisibility : undefined;

  const updated = await prisma.portfolioItem.update({
    where: { id: portfolioId },
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
      locale: cleanText(body.locale) ?? existing.locale,
      isPublished,
      publishedAt,
      projectId,
    },
    include: {
      project: { include: { review: true } },
    },
  });

  const reviewProjectId = projectId ?? existing.projectId ?? null;
  if (reviewProjectId && typeof reviewVisibility === "boolean") {
    await prisma.review.updateMany({
      where: { projectId: reviewProjectId },
      data: { isPublic: reviewVisibility },
    });
  }

  return NextResponse.json(updated);
}
