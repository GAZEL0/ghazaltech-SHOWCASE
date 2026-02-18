import { prisma } from "@/lib/db";
import { authOptions } from "@/lib/auth";
import { toNumber } from "@/lib/money";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

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

  const projects = await prisma.project.findMany({
    where:
      isStaff
        ? archiveFilter
        : {
            order: { userId: session.user.id },
            archivedAt: null,
          },
    include: {
      order: true,
      milestonePayments: { orderBy: { createdAt: "asc" } },
      invoices: true,
      revisions: true,
      phases: {
        orderBy: { order: "asc" },
        select: {
          id: true,
          group: true,
          title: true,
          description: true,
          dueDate: true,
          status: true,
          order: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const planLogs = await prisma.auditLog.findMany({
    where: { targetType: "PROJECT", action: "PROJECT_PLAN", targetId: { in: projects.map((p) => p.id) } },
    orderBy: { createdAt: "desc" },
  });
  const planById = new Map<string, Record<string, unknown>>();
  for (const log of planLogs) {
    if (!log.targetId) continue;
    if (!planById.has(log.targetId)) {
      planById.set(log.targetId, (log.data as Record<string, unknown> | null) ?? {});
    }
  }

  return NextResponse.json(
    projects.map((project) => ({
      id: project.id,
      title: project.title,
      description: project.description,
      status: project.status,
      dueDate: project.dueDate,
      orderId: project.orderId,
      archivedAt: project.archivedAt,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
      milestonePayments: project.milestonePayments.map((payment) => ({
        ...payment,
        amount: toNumber(payment.amount),
      })),
      invoices: project.invoices.map((invoice) => ({
        ...invoice,
        amountDue: toNumber(invoice.amountDue),
        amountPaid: toNumber(invoice.amountPaid),
      })),
      revisions: project.revisions.map((revision) => ({
        ...revision,
        amount: toNumber(revision.amount),
      })),
      phases: project.phases,
      plan: planById.get(project.id) ?? null,
    })),
  );
}
