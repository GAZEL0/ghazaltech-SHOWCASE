import { prisma } from "@/lib/db";
import { authOptions } from "@/lib/auth";
import { toNumber } from "@/lib/money";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const invoices = await prisma.invoice.findMany({
    where:
      session.user.role === "ADMIN" || session.user.role === "PARTNER"
        ? {}
        : {
            project: { order: { userId: session.user.id } },
          },
    include: { project: true },
    orderBy: { issuedAt: "desc" },
  });

  return NextResponse.json(
    invoices.map((invoice) => ({
      id: invoice.id,
      amountDue: toNumber(invoice.amountDue),
      amountPaid: toNumber(invoice.amountPaid),
      status: invoice.status,
      pdfUrl: invoice.pdfUrl,
      issuedAt: invoice.issuedAt,
      projectId: invoice.projectId,
      projectTitle: invoice.project.title,
    })),
  );
}
