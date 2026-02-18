import { prisma } from "@/lib/db";
import { authOptions } from "@/lib/auth";
import { generateMagicToken } from "@/lib/quote-tokens";
import { toNumber } from "@/lib/money";
import { CustomRequestStatus, QuoteStatus } from "@prisma/client";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type RouteParams = {
  params: Promise<{ requestId: string }>;
};

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { requestId } = await params;
    const session = await getServerSession(authOptions);
    const isStaff = session?.user.role === "ADMIN" || session?.user.role === "PARTNER";
    if (!session || !isStaff) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const existing = await prisma.customProjectRequest.findUnique({
      where: { id: requestId },
    });

    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const body = (await request.json().catch(() => ({}))) as {
      serviceId?: string;
      totalAmount?: number;
      projectTitle?: string;
      projectDescription?: string;
      userId?: string;
      expiresAt?: string;
      sendNow?: boolean;
    };

    const email = existing.email.toLowerCase();
    let linkedUserId = body.userId ?? existing.userId ?? null;

    if (!linkedUserId) {
      const found = await prisma.user.findUnique({ where: { email } });
      linkedUserId =
        found?.id ??
        (
          await prisma.user.create({
            data: {
              email,
              name: existing.fullName,
              role: "CLIENT",
            },
          })
        ).id;
    }

    if (existing.userId !== linkedUserId || existing.status !== CustomRequestStatus.REVIEWED) {
      await prisma.customProjectRequest.update({
        where: { id: requestId },
        data: { userId: linkedUserId, status: CustomRequestStatus.REVIEWED },
      });
    }

    let serviceId = body.serviceId;
    if (!serviceId) {
      const fallback = await prisma.service.findFirst({
        where: { slug: "custom-project" },
      });
      serviceId = fallback?.id ?? null;
    }

    if (!serviceId) {
      const firstService = await prisma.service.findFirst({ orderBy: { createdAt: "asc" } });
      serviceId = firstService?.id ?? null;
    }

    if (!serviceId) {
      return NextResponse.json({ error: "No service available to attach", field: "serviceId" }, { status: 400 });
    }

    const service = await prisma.service.findUnique({ where: { id: serviceId } });
    const amount =
      typeof body.totalAmount === "number" && !Number.isNaN(body.totalAmount)
        ? body.totalAmount
        : service
          ? toNumber(service.priceBase)
          : 0;

    const scope = body.projectDescription || existing.details;
    const title = body.projectTitle || `Custom project for ${existing.fullName}`;
    const expiresAt =
      body.expiresAt && !Number.isNaN(Date.parse(body.expiresAt))
        ? new Date(body.expiresAt)
        : new Date(Date.now() + 1000 * 60 * 60 * 24 * 7);

    const { token, hashed } = generateMagicToken();

    const quote = await prisma.quote.create({
      data: {
        customRequestId: existing.id,
        amount,
        currency: "USD",
        scope,
        status: QuoteStatus.DRAFT,
        expiresAt,
        magicToken: hashed,
      },
    });

    await prisma.auditLog.create({
      data: {
        actorId: session.user.id,
        action: "QUOTE_META",
        targetType: "QUOTE",
        targetId: quote.id,
        data: { serviceId, projectTitle: title, projectDescription: scope },
      },
    });

    await prisma.auditLog.create({
      data: {
        actorId: session.user.id,
        action: "CUSTOM_REQUEST_CONVERT",
        targetType: "CUSTOM_PROJECT_REQUEST",
        targetId: requestId,
        data: { quoteId: quote.id, serviceId, amount },
      },
    });

    const response: Record<string, unknown> = {
      quoteId: quote.id,
      status: quote.status,
      magicToken: token,
    };

    if (body.sendNow) {
      const magicLink = `${process.env.NEXTAUTH_URL ?? "http://localhost:3000"}/magic/quote?token=${token}`;
      await prisma.quote.update({
        where: { id: quote.id },
        data: { status: QuoteStatus.SENT, sentAt: new Date(), expiresAt },
      });
      response.magicLink = magicLink;
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error("[custom-request-convert]", error);
    return NextResponse.json({ error: "Failed to convert request" }, { status: 500 });
  }
}
