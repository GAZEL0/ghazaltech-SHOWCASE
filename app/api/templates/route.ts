import { prisma } from "@/lib/db";
import { authOptions } from "@/lib/auth";
import { toNumber } from "@/lib/money";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  const isStaff = session?.user.role === "ADMIN" || session?.user.role === "PARTNER";
  const url = new URL(request.url);
  const includeInactive =
    url.searchParams.get("includeInactive") === "true" &&
    isStaff;

  const templates = await prisma.templateSite.findMany({
    where: includeInactive ? {} : { isActive: true },
    include: { service: true, gallery: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(
    templates.map((template) => ({
      id: template.id,
      title: template.title,
      slug: template.slug,
      category: template.category,
      shortDescription: template.shortDescription,
      longDescription: template.longDescription,
      basePrice: toNumber(template.basePrice),
      currency: template.currency,
      demoUrl: template.demoUrl,
      thumbUrl: template.thumbUrl,
      laptopPreviewImage: template.laptopPreviewImage,
      tabletPreviewImage: template.tabletPreviewImage,
      mobilePreviewImage: template.mobilePreviewImage,
      isActive: template.isActive,
      serviceId: template.serviceId,
      serviceTitle: template.service.title,
      gallery: template.gallery,
      createdAt: template.createdAt,
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
    serviceId?: string;
    title?: string;
    slug?: string;
    category?: string | null;
    shortDescription?: string | null;
    longDescription?: string | null;
    basePrice?: number;
    currency?: string;
    demoUrl?: string | null;
    thumbUrl?: string | null;
    laptopPreviewImage?: string | null;
    tabletPreviewImage?: string | null;
    mobilePreviewImage?: string | null;
    isActive?: boolean;
  };

  if (!body.serviceId || !body.title || !body.slug || typeof body.basePrice !== "number") {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const created = await prisma.templateSite.create({
    data: {
      serviceId: body.serviceId,
      title: body.title,
      slug: body.slug,
      category: body.category ?? null,
      shortDescription: body.shortDescription ?? null,
      longDescription: body.longDescription ?? null,
      basePrice: body.basePrice,
      currency: body.currency ?? "USD",
      demoUrl: body.demoUrl ?? null,
      thumbUrl: body.thumbUrl ?? null,
      laptopPreviewImage: body.laptopPreviewImage ?? null,
      tabletPreviewImage: body.tabletPreviewImage ?? null,
      mobilePreviewImage: body.mobilePreviewImage ?? null,
      isActive: body.isActive ?? true,
    },
    include: { service: true, gallery: true },
  });

  return NextResponse.json({
    id: created.id,
    title: created.title,
    slug: created.slug,
    category: created.category,
    shortDescription: created.shortDescription,
    longDescription: created.longDescription,
    basePrice: toNumber(created.basePrice),
    currency: created.currency,
    demoUrl: created.demoUrl,
    thumbUrl: created.thumbUrl,
    laptopPreviewImage: created.laptopPreviewImage,
    tabletPreviewImage: created.tabletPreviewImage,
    mobilePreviewImage: created.mobilePreviewImage,
    isActive: created.isActive,
    serviceId: created.serviceId,
    serviceTitle: created.service.title,
    gallery: created.gallery,
    createdAt: created.createdAt,
  });
}
