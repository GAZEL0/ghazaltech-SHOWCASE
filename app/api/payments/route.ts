import { prisma } from "@/lib/db";
import { authOptions } from "@/lib/auth";
import { toNumber } from "@/lib/money";
import { MilestoneStatus } from "@prisma/client";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as {
    projectId?: string;
    label?: string;
    amount?: number;
    proofUrl?: string;
  };

  if (!body.projectId || !body.label || !body.amount) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const project = await prisma.project.findUnique({
    where: { id: body.projectId },
    include: { order: true },
  });

  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  const isStaff = session.user.role === "ADMIN" || session.user.role === "PARTNER";
  if (!isStaff && project.order.userId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const payment = await prisma.milestonePayment.create({
    data: {
      projectId: body.projectId,
      label: body.label,
      amount: body.amount,
      status: MilestoneStatus.UNDER_REVIEW,
      proofUrl: body.proofUrl ?? null,
    },
    include: { project: true },
  });

  await prisma.auditLog.create({
    data: {
      actorId: session.user.id,
      action: "UPLOAD_PROOF",
      targetType: "MILESTONE",
      targetId: payment.id,
      data: { label: payment.label },
    },
  });

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
    createdAt: payment.createdAt,
  });
}

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const isStaff = session.user.role === "ADMIN" || session.user.role === "PARTNER";
  const url = new URL(request.url);
  const includeArchived = url.searchParams.get("archived") === "1";
  const archiveFilter =
    isStaff && includeArchived
      ? { archivedAt: { not: null } }
      : { archivedAt: null };

  const payments = await prisma.milestonePayment.findMany({
    where:
      isStaff
        ? archiveFilter
        : {
            project: {
              order: { userId: session.user.id },
            },
            archivedAt: null,
          },
    include: { project: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(
    payments.map((payment) => ({
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
      createdAt: payment.createdAt,
    })),
  );
}
