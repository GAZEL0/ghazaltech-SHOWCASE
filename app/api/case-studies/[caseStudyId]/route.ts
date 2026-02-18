import { prisma } from "@/lib/db";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { slugify } from "@/lib/blog";

export const dynamic = "force-dynamic";

type RouteParams = {
  params: { caseStudyId: string };
};

export async function GET(_request: Request, { params }: RouteParams) {
  const session = await getServerSession(authOptions);
  const isStaff = session?.user.role === "ADMIN" || session?.user.role === "PARTNER";
  const item = await prisma.caseStudy.findUnique({ where: { id: params.caseStudyId } });

  if (!item) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (item.status !== "PUBLISHED" && !isStaff) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(item);
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
    clientName?: string;
    projectType?: string;
    industry?: string | null;
    duration?: string | null;
    technologies?: string[];
    coverImage?: string | null;
    challengeSummary?: string;
    primaryResult?: string;
    challenge?: string;
    solution?: string;
    implementation?: string;
    results?: unknown;
    testimonial?: string | null;
    status?: "DRAFT" | "PUBLISHED";
    locale?: string;
    featured?: boolean;
    publishedAt?: string | null;
  };

  const data: Record<string, unknown> = {};

  if (body.title) data.title = body.title;
  if (body.clientName !== undefined) data.clientName = body.clientName;
  if (body.projectType !== undefined) data.projectType = body.projectType;
  if (body.industry !== undefined) data.industry = body.industry;
  if (body.duration !== undefined) data.duration = body.duration;
  if (body.technologies !== undefined) data.technologies = body.technologies;
  if (body.coverImage !== undefined) data.coverImage = body.coverImage;
  if (body.challengeSummary !== undefined) data.challengeSummary = body.challengeSummary;
  if (body.primaryResult !== undefined) data.primaryResult = body.primaryResult;
  if (body.challenge !== undefined) data.challenge = body.challenge;
  if (body.solution !== undefined) data.solution = body.solution;
  if (body.implementation !== undefined) data.implementation = body.implementation;
  if (body.results !== undefined) data.results = body.results;
  if (body.testimonial !== undefined) data.testimonial = body.testimonial;
  if (body.locale) data.locale = body.locale;
  if (typeof body.featured === "boolean") data.featured = body.featured;

  if (body.slug) {
    const baseSlug = slugify(body.slug);
    let finalSlug = baseSlug;
    let counter = 1;
    while (await prisma.caseStudy.findFirst({ where: { slug: finalSlug, NOT: { id: params.caseStudyId } } })) {
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

  const updated = await prisma.caseStudy.update({
    where: { id: params.caseStudyId },
    data,
  });

  return NextResponse.json(updated);
}
