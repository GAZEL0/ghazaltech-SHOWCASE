import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type RouteParams = {
  params: Promise<{ quoteId: string }>;
};

export async function GET(_request: Request, { params }: RouteParams) {
  const { quoteId } = await params;
  return NextResponse.json({ ok: false, message: `Quote ${quoteId} endpoint not implemented.` }, { status: 501 });
}

export async function PATCH(request: Request, { params }: RouteParams) {
  const session = await getServerSession(authOptions);
  const isStaff = session?.user.role === "ADMIN" || session?.user.role === "PARTNER";
  if (!session || !isStaff) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { quoteId } = await params;
  const body = (await request.json()) as { archived?: boolean };
  if (typeof body.archived !== "boolean") {
    return NextResponse.json({ error: "Missing archived flag" }, { status: 400 });
  }

  const updated = await prisma.quote.update({
    where: { id: quoteId },
    data: { archivedAt: body.archived ? new Date() : null },
  });

  return NextResponse.json({
    id: updated.id,
    archivedAt: updated.archivedAt,
  });
}
