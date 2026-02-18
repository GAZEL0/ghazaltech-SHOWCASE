import { prisma } from "@/lib/db";
import { authOptions } from "@/lib/auth";
import { toNumber } from "@/lib/money";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type RouteParams = {
  params: { templateId: string };
};

export async function GET(_request: Request, { params }: RouteParams) {
  const session = await getServerSession(authOptions);
  const isStaff = session?.user.role === "ADMIN" || session?.user.role === "PARTNER";

  const template = await prisma.templateSite.findUnique({
    where: { id: params.templateId },
    include: { service: true, gallery: true },
  });

  if (!template) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (!template.isActive && !isStaff) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({
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
    updatedAt: template.updatedAt,
  });
}

export async function PATCH(request: Request, { params }: RouteParams) {
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

  const data: Record<string, unknown> = {};
  if (body.serviceId) data.serviceId = body.serviceId;
  if (body.title) data.title = body.title;
  if (body.slug) data.slug = body.slug;
  if (body.category !== undefined) data.category = body.category;
  if (body.shortDescription !== undefined) data.shortDescription = body.shortDescription;
  if (body.longDescription !== undefined) data.longDescription = body.longDescription;
  if (typeof body.basePrice === "number") data.basePrice = body.basePrice;
  if (body.currency) data.currency = body.currency;
  if (body.demoUrl !== undefined) data.demoUrl = body.demoUrl;
  if (body.thumbUrl !== undefined) data.thumbUrl = body.thumbUrl;
  if (body.laptopPreviewImage !== undefined) data.laptopPreviewImage = body.laptopPreviewImage;
  if (body.tabletPreviewImage !== undefined) data.tabletPreviewImage = body.tabletPreviewImage;
  if (body.mobilePreviewImage !== undefined) data.mobilePreviewImage = body.mobilePreviewImage;
  if (typeof body.isActive === "boolean") data.isActive = body.isActive;

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  }

  const updated = await prisma.templateSite.update({
    where: { id: params.templateId },
    data,
    include: { service: true, gallery: true },
  });

  return NextResponse.json({
    id: updated.id,
    title: updated.title,
    slug: updated.slug,
    category: updated.category,
    shortDescription: updated.shortDescription,
    longDescription: updated.longDescription,
    basePrice: toNumber(updated.basePrice),
    currency: updated.currency,
    demoUrl: updated.demoUrl,
    thumbUrl: updated.thumbUrl,
    laptopPreviewImage: updated.laptopPreviewImage,
    tabletPreviewImage: updated.tabletPreviewImage,
    mobilePreviewImage: updated.mobilePreviewImage,
    isActive: updated.isActive,
    serviceId: updated.serviceId,
    serviceTitle: updated.service.title,
    gallery: updated.gallery,
    createdAt: updated.createdAt,
    updatedAt: updated.updatedAt,
  });
}
