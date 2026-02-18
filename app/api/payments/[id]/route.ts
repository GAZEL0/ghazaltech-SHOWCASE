import { prisma } from "@/lib/db";
import { authOptions } from "@/lib/auth";
import { toNumber } from "@/lib/money";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type RouteParams = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  const isStaff = session?.user.role === "ADMIN" || session?.user.role === "PARTNER";
  if (!session || !isStaff) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as {
    status?: "PENDING" | "UNDER_REVIEW" | "APPROVED" | "REJECTED";
    note?: string;
    archived?: boolean;
  };

  if (!body.status && typeof body.archived !== "boolean") {
    return NextResponse.json({ error: "Missing update" }, { status: 400 });
  }

  const data: Record<string, unknown> = {};
  if (body.status) {
    data.status = body.status;
    data.reviewedBy = session.user.id;
    data.reviewedAt = new Date();
  }
  if (typeof body.archived === "boolean") {
    data.archivedAt = body.archived ? new Date() : null;
  }

  const payment = await prisma.milestonePayment.update({
    where: { id },
    data,
    include: { project: true },
  });

  if (body.note && body.status) {
    await prisma.auditLog.create({
      data: {
        actorId: session.user.id,
        action: "PAYMENT_REVIEW",
        targetType: "MILESTONE",
        targetId: id,
        data: { note: body.note, status: body.status },
      },
    });
  }

  return NextResponse.json({
    id: payment.id,
    projectId: payment.projectId,
    projectTitle: payment.project.title,
    label: payment.label,
    amount: toNumber(payment.amount),
    status: payment.status,
    proofUrl: payment.proofUrl,
    dueDate: payment.dueDate,
    gatePhaseId: payment.gatePhaseId,
    changeRequestId: payment.changeRequestId,
    archivedAt: payment.archivedAt,
    reviewedBy: payment.reviewedBy,
    reviewedAt: payment.reviewedAt,
  });
}
