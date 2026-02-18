import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { generateMagicToken } from "@/lib/quote-tokens";
import { QuoteStatus } from "@prisma/client";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type RouteParams = {
  params: Promise<{ quoteId: string }>;
};

export async function POST(_request: Request, { params }: RouteParams) {
  const session = await getServerSession(authOptions);
  const isStaff = session?.user.role === "ADMIN" || session?.user.role === "PARTNER";
  if (!session || !isStaff) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { quoteId } = await params;
  const quote = await prisma.quote.findUnique({
    where: { id: quoteId },
  });

  if (!quote) {
    return NextResponse.json({ error: "Quote not found" }, { status: 404 });
  }

  if (quote.status === QuoteStatus.ACCEPTED) {
    return NextResponse.json({ error: "Quote already accepted" }, { status: 400 });
  }
  if (quote.status === QuoteStatus.REJECTED) {
    return NextResponse.json({ error: "Quote was rejected" }, { status: 400 });
  }

  const sentAt = new Date();
  const expiresAt =
    quote.expiresAt && quote.expiresAt > sentAt
      ? quote.expiresAt
      : new Date(Date.now() + 1000 * 60 * 60 * 24 * 7);

  const { token, hashed } = generateMagicToken();
  const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
  const magicLink = `${baseUrl}/magic/quote?token=${token}`;

  await prisma.$transaction([
    prisma.quote.update({
      where: { id: quote.id },
      data: {
        status: QuoteStatus.SENT,
        sentAt,
        expiresAt,
        magicToken: hashed,
      },
    }),
    prisma.auditLog.create({
      data: {
        actorId: session.user.id,
        action: "QUOTE_SENT",
        targetType: "QUOTE",
        targetId: quote.id,
        data: {
          tokenHash: hashed,
          magicLink,
          sentAt: sentAt.toISOString(),
          expiresAt: expiresAt.toISOString(),
        },
      },
    }),
  ]);

  return NextResponse.json({
    ok: true,
    quoteId: quote.id,
    status: QuoteStatus.SENT,
    sentAt,
    expiresAt,
    magicLink,
  });
}
