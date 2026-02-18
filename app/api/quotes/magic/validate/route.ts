import { prisma } from "@/lib/db";
import { hashToken } from "@/lib/quote-tokens";
import { toNumber } from "@/lib/money";
import { Prisma, QuoteStatus, Role } from "@prisma/client";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { token?: string };
  const url = new URL(request.url);
  const token = body.token ?? url.searchParams.get("token");

  if (!token) {
    return NextResponse.json({ error: "Missing token" }, { status: 400 });
  }

  const hashed = hashToken(token);
  const now = new Date();

  const quote =
    (await prisma.quote.findFirst({
      where: {
        magicToken: hashed,
        status: { in: [QuoteStatus.SENT, QuoteStatus.DRAFT] },
        expiresAt: { gt: now },
        archivedAt: null,
      },
      include: { customRequest: true },
    })) ||
    (await prisma.quote.findFirst({
      where: {
        status: { in: [QuoteStatus.SENT, QuoteStatus.DRAFT] },
        expiresAt: { gt: now },
        archivedAt: null,
        AND: [
          {
            id: {
              in: await prisma.auditLog
                .findMany({
                  where: {
                    targetType: "QUOTE",
                    action: "QUOTE_SENT",
                    data: {
                      path: ["tokenHash"],
                      equals: hashed,
                    } as Prisma.JsonFilter,
                  },
                  select: { targetId: true },
                })
                .then((rows) => rows.map((r) => r.targetId).filter(Boolean) as string[]),
            },
          },
        ],
      },
      include: { customRequest: true },
    }));

  if (!quote) {
    console.warn("[quote-magic-validate] invalid token", { hashed });
    return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 });
  }

  if (quote.status === QuoteStatus.DRAFT) {
    await prisma.quote.update({
      where: { id: quote.id },
      data: { status: QuoteStatus.SENT, sentAt: quote.sentAt ?? new Date() },
    });
  }

  const email = quote.customRequest.email.toLowerCase();

  let user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        email,
        name: quote.customRequest.fullName,
        role: Role.CLIENT,
      },
    });
  }
  const hasPassword = !!user.passwordHash;

  if (!quote.customRequest.userId) {
    await prisma.customProjectRequest.update({
      where: { id: quote.customRequestId },
      data: { userId: user.id },
    });
  }

  const metaLog = await prisma.auditLog.findFirst({
    where: { targetId: quote.id, targetType: "QUOTE", action: "QUOTE_META" },
    orderBy: { createdAt: "desc" },
  });
  const rawMeta = (metaLog?.data as Record<string, unknown> | null) ?? {};
  const paymentSchedule = Array.isArray(rawMeta.paymentSchedule)
    ? rawMeta.paymentSchedule
    : [];
  const phases = Array.isArray(rawMeta.phases) ? rawMeta.phases : [];
  const meta = { ...rawMeta, paymentSchedule, phases };

  return NextResponse.json({
    quoteId: quote.id,
    customRequestId: quote.customRequestId,
    email,
    amount: toNumber(quote.amount),
    currency: quote.currency,
    scope: quote.scope,
    status: quote.status,
    expiresAt: quote.expiresAt,
    request: {
      fullName: quote.customRequest.fullName,
      projectType: quote.customRequest.projectType,
      budgetRange: quote.customRequest.budgetRange,
      timeline: quote.customRequest.timeline,
    },
    meta,
    hasPassword,
  });
}
