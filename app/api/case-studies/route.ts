import { prisma } from "@/lib/db";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { slugify } from "@/lib/blog";

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
  const query = url.searchParams.get("q")?.trim() ?? "";

  const where: Record<string, unknown> = {};
  if (!includeDraft) {
    where.status = "PUBLISHED";
  } else if (status) {
    where.status = status;
  }
  if (locale) where.locale = locale;
  if (query) {
    where.OR = [
      { title: { contains: query, mode: "insensitive" } },
      { clientName: { contains: query, mode: "insensitive" } },
      { challengeSummary: { contains: query, mode: "insensitive" } },
      { primaryResult: { contains: query, mode: "insensitive" } },
      { challenge: { contains: query, mode: "insensitive" } },
      { solution: { contains: query, mode: "insensitive" } },
    ];
  }

  const items = await prisma.caseStudy.findMany({
    where,
    orderBy: [{ featured: "desc" }, { publishedAt: "desc" }, { createdAt: "desc" }],
  });

  return NextResponse.json(items);
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

  if (
    !body.title ||
    !body.clientName ||
    !body.projectType ||
    !body.challengeSummary ||
    !body.primaryResult ||
    !body.challenge ||
    !body.solution ||
    !body.implementation
  ) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const baseSlug = slugify(body.slug?.trim() || body.title);
  let finalSlug = baseSlug;
  let counter = 1;
  while (await prisma.caseStudy.findUnique({ where: { slug: finalSlug } })) {
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

  const created = await prisma.caseStudy.create({
    data: {
      title: body.title,
      slug: finalSlug,
      clientName: body.clientName,
      projectType: body.projectType,
      industry: body.industry ?? null,
      duration: body.duration ?? null,
      technologies: body.technologies ?? [],
      coverImage: body.coverImage ?? null,
      challengeSummary: body.challengeSummary,
      primaryResult: body.primaryResult,
      challenge: body.challenge,
      solution: body.solution,
      implementation: body.implementation,
      results: body.results ?? null,
      testimonial: body.testimonial ?? null,
      status,
      locale: body.locale ?? "en",
      featured: body.featured ?? false,
      publishedAt,
    },
  });

  return NextResponse.json(created);
}
