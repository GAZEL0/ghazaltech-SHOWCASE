import { prisma } from "@/lib/db";
import { authOptions } from "@/lib/auth";
import { createReferralCommissionForOrder } from "@/lib/referrals";
import { toNumber } from "@/lib/money";
import { OrderStatus, ProjectStatus } from "@prisma/client";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function serializeMilestones(
  milestones: { amount: unknown }[] = [],
) {
  return milestones.map((milestone) => ({
    ...milestone,
    amount: toNumber(milestone.amount as number),
  }));
}

function serializeOrders<T extends { totalAmount: unknown; projects: { milestonePayments: { amount: unknown }[] }[] }>(
  order: T,
) {
  return {
    ...order,
    totalAmount: toNumber(order.totalAmount as number),
    projects: order.projects.map((project) => ({
      ...project,
      milestonePayments: serializeMilestones(project.milestonePayments),
    })),
  };
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as {
    serviceId?: string;
    totalAmount?: number;
  };

  if (!body.serviceId || !body.totalAmount) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const order = await prisma.order.create({
    data: {
      userId: session.user.id,
      serviceId: body.serviceId,
      totalAmount: body.totalAmount,
      status: OrderStatus.PENDING,
    },
    include: { service: true },
  });

  await createReferralCommissionForOrder({
    orderId: order.id,
    userId: session.user.id,
    orderTotal: toNumber(order.totalAmount),
  });

  return NextResponse.json({
    id: order.id,
    status: order.status,
    totalAmount: toNumber(order.totalAmount),
    serviceId: order.serviceId,
    serviceTitle: order.service.title,
    archivedAt: order.archivedAt,
    createdAt: order.createdAt,
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

  const orders = await prisma.order.findMany({
    where:
      isStaff
        ? archiveFilter
        : { userId: session.user.id, archivedAt: null },
    include: {
      service: true,
      user: true,
      customProjectRequest: true,
      projects: {
        include: {
          milestonePayments: { orderBy: { createdAt: "asc" } },
          phases: { orderBy: { order: "asc" } },
        },
        orderBy: { createdAt: "desc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const projectIds = orders.flatMap((o) => o.projects.map((p) => p.id));
  const planLogs =
    projectIds.length > 0
      ? await prisma.auditLog.findMany({
          where: { targetType: "PROJECT", action: "PROJECT_PLAN", targetId: { in: projectIds } },
          orderBy: { createdAt: "desc" },
        })
      : [];
  const planByProject = new Map<string, Record<string, unknown>>();
  for (const log of planLogs) {
    if (!log.targetId) continue;
    if (!planByProject.has(log.targetId)) {
      planByProject.set(log.targetId, (log.data as Record<string, unknown> | null) ?? {});
    }
  }

  return NextResponse.json(
    orders.map((order) => {
      const serialized = serializeOrders(order);
      return {
        id: serialized.id,
        status: serialized.status,
        totalAmount: serialized.totalAmount,
        serviceId: serialized.serviceId,
        serviceTitle: serialized.service.title,
        archivedAt: serialized.archivedAt,
        createdAt: serialized.createdAt,
        requestId: serialized.customProjectRequest?.id ?? null,
        client: {
          name: serialized.user.name ?? null,
          email: serialized.user.email,
        },
        request: serialized.customProjectRequest
          ? {
              projectType: serialized.customProjectRequest.projectType,
              budgetRange: serialized.customProjectRequest.budgetRange,
              timeline: serialized.customProjectRequest.timeline,
              details: serialized.customProjectRequest.details,
            }
          : null,
        project:
          serialized.projects.length > 0
            ? {
                id: serialized.projects[0].id,
                status: serialized.projects[0].status,
                milestonePayments: serialized.projects[0].milestonePayments,
                phases: serialized.projects[0].phases,
                plan: planByProject.get(serialized.projects[0].id) ?? null,
              }
            : null,
      };
    }),
  );
}

export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions);
  const isStaff = session?.user.role === "ADMIN" || session?.user.role === "PARTNER";
  if (!session || !isStaff) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as {
    id?: string;
    status?: OrderStatus;
    archived?: boolean;
    project?: {
      title: string;
      description?: string;
      phases?: { label?: string; description?: string | null; dueDate?: string | null; group?: string | null }[];
      payments?: {
        label?: string;
        amount?: number;
        dueDate?: string | null;
        phaseLabel?: string | null;
        description?: string | null;
      }[];
      notes?: string | null;
    };
  };

  if (!body.id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  const updates: Record<string, unknown> = {};
  if (body.status) {
    updates.status = body.status;
  }
  if (typeof body.archived === "boolean") {
    updates.archivedAt = body.archived ? new Date() : null;
  }

  const order = await prisma.order.update({
    where: { id: body.id },
    data: updates,
    include: {
      service: true,
      user: true,
      customProjectRequest: true,
      projects: { include: { milestonePayments: true }, orderBy: { createdAt: "desc" } },
    },
  });

  if (body.project) {
    const project = await prisma.project.create({
      data: {
        orderId: order.id,
        title: body.project.title,
        description: body.project.description ?? "",
      },
    });

    const phases = Array.isArray(body.project.phases)
      ? body.project.phases.filter((p) => (p?.label ?? "").toString().trim().length > 0)
      : [];
    const payments = Array.isArray(body.project.payments)
      ? body.project.payments.filter(
          (p) =>
            typeof p?.amount === "number" &&
            (p?.amount ?? 0) >= 0 &&
            (p?.label ?? "").toString().trim().length > 0,
        )
      : [];

    if (phases.length > 0) {
      const firstGroup = (phases[0]?.group ?? "REQUIREMENTS") as ProjectStatus;
      await prisma.projectPhase.createMany({
        data: phases.map((phase, idx) => ({
          projectId: project.id,
          group: (phase.group ?? "REQUIREMENTS") as ProjectStatus,
          title: phase.label ?? "Phase",
          description: phase.description ?? null,
          dueDate: phase.dueDate ? new Date(phase.dueDate) : null,
          order: idx,
        })),
      });
      await prisma.project.update({
        where: { id: project.id },
        data: { status: firstGroup },
      });
    }

    if (payments.length > 0) {
      await prisma.milestonePayment.createMany({
        data: payments.map((payment) => ({
          projectId: project.id,
          label: payment.label || "Payment",
          amount: payment.amount ?? 0,
          status: "PENDING" as const,
          dueDate: payment.dueDate ? new Date(payment.dueDate) : null,
        })),
      });
    }

    await prisma.auditLog.create({
      data: {
        actorId: session.user.id,
        action: "PROJECT_PLAN",
        targetType: "PROJECT",
        targetId: project.id,
        data: {
          phases,
          payments,
          notes: body.project.notes ?? null,
        },
      },
    });

    return NextResponse.json({
      ...serializeOrders(order),
      project: {
        ...project,
        milestonePayments: [],
      },
    });
  }

  return NextResponse.json(serializeOrders(order));
}
