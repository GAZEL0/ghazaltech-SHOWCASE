import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

type RouteParams = {
  params: Promise<{ projectId: string }>;
};

function cleanText(value: unknown) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export async function POST(request: Request, { params }: RouteParams) {
  const { projectId } = await params;
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: { order: true },
  });

  if (!project) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const isStaff = session.user.role === "ADMIN" || session.user.role === "PARTNER";
  if (!isStaff && project.order.userId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (project.status !== "DELIVERED") {
    return NextResponse.json({ error: "Project not completed" }, { status: 400 });
  }

  const body = (await request.json()) as { rating?: number; comment?: string };
  const rating = Number(body.rating);
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return NextResponse.json({ error: "Invalid rating" }, { status: 400 });
  }

  const existingReview = await prisma.review.findUnique({
    where: { projectId },
  });

  const publishedItem = await prisma.portfolioItem.findFirst({
    where: { projectId, isPublished: true },
    select: { id: true },
  });

  if (publishedItem && existingReview) {
    return NextResponse.json({ error: "Review is locked" }, { status: 403 });
  }

  const review = existingReview
    ? await prisma.review.update({
        where: { projectId },
        data: {
          rating,
          comment: cleanText(body.comment),
        },
      })
    : await prisma.review.create({
        data: {
          projectId,
          rating,
          comment: cleanText(body.comment),
        },
      });

  return NextResponse.json(review);
}
