import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { hashToken } from "@/lib/quote-tokens";
import { CustomRequestStatus, Prisma, QuoteStatus } from "@prisma/client";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type RouteParams = {
  params: Promise<{ quoteId: string }>;
};

async function resolveQuoteByToken(token: string) {
  const hashed = hashToken(token);
  const now = new Date();
  const byMagicField = await prisma.quote.findFirst({
    where: { magicToken: hashed, expiresAt: { gt: now }, archivedAt: null },
    include: { customRequest: true },
  });
  if (byMagicField) return { quote: byMagicField, hashed };

  const viaAudit = await prisma.quote.findFirst({
    where: {
      status: { in: [QuoteStatus.SENT, QuoteStatus.DRAFT] },
      expiresAt: { gt: now },
      archivedAt: null,
      id: {
        in: await prisma.auditLog
          .findMany({
            where: {
              targetType: "QUOTE",
              action: "QUOTE_SENT",
              data: { path: ["tokenHash"], equals: hashed } as Prisma.JsonFilter,
            },
            select: { targetId: true },
          })
          .then((rows) => rows.map((r) => r.targetId).filter(Boolean) as string[]),
      },
    },
    include: { customRequest: true },
  });
  if (viaAudit) return { quote: viaAudit, hashed };
  return null;
}

export async function POST(request: Request, { params }: RouteParams) {
  const session = await getServerSession(authOptions);
  const body = await request.json().catch(() => ({}));
  const token = (body as { token?: string }).token ?? new URL(request.url).searchParams.get("token");

  const { quoteId } = await params;
  let quote =
    quoteId &&
    (await prisma.quote.findUnique({
      where: { id: quoteId },
      include: { customRequest: true },
    }));
  let tokenHash: string | null = null;

  if (!quote && token) {
    const resolved = await resolveQuoteByToken(token);
    if (resolved) {
      quote = resolved.quote;
      tokenHash = resolved.hashed;
    }
  }

  if (!quote) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (quote.archivedAt) {
    return NextResponse.json({ error: "Quote archived" }, { status: 400 });
  }
  if (quote.expiresAt <= new Date()) {
    return NextResponse.json({ error: "Quote expired" }, { status: 400 });
  }
  if (!tokenHash && token) {
    tokenHash = hashToken(token);
  }

  const sessionEmail = session?.user.email?.toLowerCase?.() ?? "";
  const isOwner =
    (session && quote.customRequest.userId === session.user.id) ||
    (sessionEmail && quote.customRequest.email.toLowerCase() === sessionEmail);

  if (!session && !token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (session && session.user.role !== "ADMIN" && session.user.role !== "PARTNER" && !isOwner && !token) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (quote.status === QuoteStatus.REJECTED) {
    return NextResponse.json({ error: "Quote was rejected" }, { status: 400 });
  }
  if (quote.status === QuoteStatus.ACCEPTED) {
    return NextResponse.json({ error: "Quote already accepted" }, { status: 400 });
  }

  const updated = await prisma.quote.update({
    where: { id: quote.id },
    data: {
      status: QuoteStatus.REJECTED,
      rejectedAt: new Date(),
      magicToken: tokenHash ? `used:${tokenHash}` : quote.magicToken,
    },
  });

  await prisma.customProjectRequest.update({
    where: { id: quote.customRequestId },
    data: { status: CustomRequestStatus.REJECTED },
  });

  await prisma.auditLog.create({
    data: {
      actorId: session?.user.id ?? null,
      action: "QUOTE_REJECTED",
      targetType: "QUOTE",
      targetId: quote.id,
      data: { tokenHash: tokenHash ?? null },
    },
  });

  return NextResponse.json({ id: updated.id, status: updated.status });
}
