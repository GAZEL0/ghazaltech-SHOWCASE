import { prisma } from "@/lib/db";
import { authOptions } from "@/lib/auth";
import { toNumber } from "@/lib/money";
import { ChangeRequestStatus, MilestoneStatus } from "@prisma/client";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type RouteParams = {
  params: Promise<{ projectId: string; changeId: string }>;
};

async function ensureAccess(projectId: string, session: Awaited<ReturnType<typeof getServerSession>>) {
  if (!session) return null;
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: { order: true },
  });
  if (!project) return null;
  if (session.user.role === "ADMIN" || session.user.role === "PARTNER") return project;
  if (project.order.userId !== session.user.id) return null;
  return project;
}

export async function PATCH(request: Request, { params }: RouteParams) {
  const { projectId, changeId } = await params;
  const session = await getServerSession(authOptions);
  const project = await ensureAccess(projectId, session);
  if (!project) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as {
    action?: "accept" | "reject";
    title?: string;
    description?: string | null;
    amount?: number;
  };
  const isStaff = session?.user.role === "ADMIN" || session?.user.role === "PARTNER";

  const change = await prisma.changeRequest.findFirst({
    where: { id: changeId, projectId },
  });
  if (!change) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (!body.action) {
    if (!isStaff) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data: Record<string, unknown> = {};
    if (typeof body.title === "string" && body.title.trim().length > 0) {
      data.title = body.title.trim();
    }
    if (body.description !== undefined) {
      const trimmed = typeof body.description === "string" ? body.description.trim() : "";
      data.description = trimmed.length > 0 ? trimmed : null;
    }
    if (body.amount !== undefined) {
      if (typeof body.amount !== "number" || Number.isNaN(body.amount) || body.amount <= 0) {
        return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
      }
      data.amount = body.amount;
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: "Missing update" }, { status: 400 });
    }

    const updated = await prisma.changeRequest.update({
      where: { id: changeId },
      data,
    });

    return NextResponse.json({
      ...updated,
      amount: toNumber(updated.amount),
    });
  }

  if (body.action === "reject") {
    const updated = await prisma.changeRequest.update({
      where: { id: changeId },
      data: { status: ChangeRequestStatus.REJECTED, decidedAt: new Date() },
    });
    return NextResponse.json({
      ...updated,
      amount: toNumber(updated.amount),
    });
  }

  if (change.status === ChangeRequestStatus.ACCEPTED) {
    return NextResponse.json({
      ...change,
      amount: toNumber(change.amount),
    });
  }

  if (toNumber(change.amount) <= 0) {
    return NextResponse.json({ error: "Amount not set" }, { status: 400 });
  }

  const updated = await prisma.changeRequest.update({
    where: { id: changeId },
    data: { status: ChangeRequestStatus.ACCEPTED, decidedAt: new Date() },
  });

  await prisma.milestonePayment.create({
    data: {
      projectId,
      label: `Change request: ${updated.title}`,
      amount: toNumber(updated.amount),
      status: MilestoneStatus.PENDING,
      changeRequestId: updated.id,
    },
  });

  await prisma.order.update({
    where: { id: project.orderId },
    data: { totalAmount: { increment: toNumber(updated.amount) } },
  });

  return NextResponse.json({
    ...updated,
    amount: toNumber(updated.amount),
  });
}
