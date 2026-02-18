import { prisma } from "@/lib/db";
import { authOptions } from "@/lib/auth";
import { type MoneyInput, toNumber } from "@/lib/money";
import { type MilestoneStatus, type ProjectStatus } from "@prisma/client";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type RouteParams = {
  params: Promise<{ projectId: string }>;
};

type MoneyRecord = Record<string, unknown>;

function mapMoneyArray(items: unknown, fields: string[]) {
  if (!Array.isArray(items)) return items;
  return items.map((item) => {
    const record = item as MoneyRecord;
    const next: MoneyRecord = { ...record };
    for (const field of fields) {
      if (field in record) {
        next[field] = toNumber(record[field] as MoneyInput);
      }
    }
    return next;
  });
}

function serializeProject(project: MoneyRecord | null) {
  if (!project) return project;
  return {
    ...project,
    milestonePayments: mapMoneyArray(project.milestonePayments, ["amount"]),
    invoices: mapMoneyArray(project.invoices, ["amountDue", "amountPaid"]),
    revisions: mapMoneyArray(project.revisions, ["amount"]),
    changeRequests: mapMoneyArray(project.changeRequests, ["amount"]),
  };
}

async function ensureAccess(projectId: string, session: Awaited<ReturnType<typeof getServerSession>>) {
  if (!session) {
    return null;
  }

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: { order: true },
  });

  if (!project) return null;
  if (session.user.role === "ADMIN" || session.user.role === "PARTNER") return project;
  if (project.order.userId !== session.user.id) return null;
  return project;
}

export async function GET(_request: Request, { params }: RouteParams) {
  const { projectId } = await params;
  const session = await getServerSession(authOptions);
  const project = await ensureAccess(projectId, session);

  if (!project) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const fullProject = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      milestonePayments: { orderBy: { createdAt: "asc" } },
      invoices: true,
      revisions: true,
      review: true,
      portfolioItems: true,
      phases: {
        orderBy: { order: "asc" },
        include: {
          deliverables: true,
          comments: {
            orderBy: { createdAt: "asc" },
            include: { author: true, attachments: true },
          },
        },
      },
      changeRequests: { orderBy: { createdAt: "desc" } },
    },
  });

  const planLog = await prisma.auditLog.findFirst({
    where: { targetType: "PROJECT", targetId: projectId, action: "PROJECT_PLAN" },
    orderBy: { createdAt: "desc" },
  });
  const plan = (planLog?.data as Record<string, unknown> | null) ?? null;

  return NextResponse.json({ ...serializeProject(fullProject), plan });
}

export async function PATCH(request: Request, { params }: RouteParams) {
  const { projectId } = await params;
  const session = await getServerSession(authOptions);
  const isStaff = session?.user.role === "ADMIN" || session?.user.role === "PARTNER";
  if (!session || !isStaff) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as {
    status?: ProjectStatus;
    milestone?: { label: string; amount: number };
    note?: string;
    milestoneStatus?: { id: string; status: MilestoneStatus };
    archived?: boolean;
  };

  const updates: Record<string, unknown> = {};
  if (body.status) {
    updates.status = body.status;
  }
  if (typeof body.archived === "boolean") {
    updates.archivedAt = body.archived ? new Date() : null;
  }

  const updated = await prisma.project.update({
    where: { id: projectId },
    data: {
      ...(updates as object),
      ...(body.milestone
        ? {
            milestonePayments: {
              create: {
                label: body.milestone.label,
                amount: body.milestone.amount,
              },
            },
          }
        : {}),
    },
    include: {
      milestonePayments: { orderBy: { createdAt: "asc" } },
      invoices: true,
      revisions: true,
    },
  });

  if (body.note) {
    await prisma.auditLog.create({
      data: {
        actorId: session.user.id,
        action: "PROJECT_NOTE",
        targetType: "PROJECT",
        targetId: projectId,
        data: { note: body.note },
      },
    });
  }

  if (body.milestone) {
    await prisma.auditLog.create({
      data: {
        actorId: session.user.id,
        action: "ADD_MILESTONE",
        targetType: "PROJECT",
        targetId: projectId,
        data: body.milestone,
      },
    });
  }

  if (body.milestoneStatus) {
    const existing = await prisma.milestonePayment.findFirst({
      where: { id: body.milestoneStatus.id, projectId },
    });
    if (!existing) {
      return NextResponse.json({ error: "Milestone not found" }, { status: 404 });
    }

    const updatedMilestone = await prisma.milestonePayment.update({
      where: { id: existing.id },
      data: { status: body.milestoneStatus.status },
    });

    await prisma.auditLog.create({
      data: {
        actorId: session.user.id,
        action: "MILESTONE_STATUS",
        targetType: "PROJECT",
        targetId: projectId,
        data: { milestoneId: updatedMilestone.id, status: updatedMilestone.status },
      },
    });
  }

  const fresh = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      milestonePayments: { orderBy: { createdAt: "asc" } },
      invoices: true,
      revisions: true,
      review: true,
      portfolioItems: true,
      phases: {
        orderBy: { order: "asc" },
        include: {
          deliverables: true,
          comments: {
            orderBy: { createdAt: "asc" },
            include: { author: true, attachments: true },
          },
        },
      },
      changeRequests: { orderBy: { createdAt: "desc" } },
    },
  });

  const planLog = await prisma.auditLog.findFirst({
    where: { targetType: "PROJECT", targetId: projectId, action: "PROJECT_PLAN" },
    orderBy: { createdAt: "desc" },
  });
  const plan = (planLog?.data as Record<string, unknown> | null) ?? null;

  return NextResponse.json({ ...serializeProject(fresh ?? updated), plan });
}
