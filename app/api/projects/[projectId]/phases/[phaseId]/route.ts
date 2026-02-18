import { prisma } from "@/lib/db";
import { authOptions } from "@/lib/auth";
import { slugify } from "@/lib/blog";
import { OrderStatus, PhaseStatus, ProjectStatus } from "@prisma/client";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type RouteParams = {
  params: Promise<{ projectId: string; phaseId: string }>;
};

async function syncProjectStatus(projectId: string) {
  const phases = await prisma.projectPhase.findMany({
    where: { projectId },
    orderBy: { order: "asc" },
  });

  if (phases.length === 0) return null;

  const groupOrder: ProjectStatus[] = [
    "REQUIREMENTS",
    "DESIGN",
    "DEV",
    "QA",
    "DELIVERED",
  ];

  const groupsWithPhases = new Set(phases.map((phase) => phase.group));
  const orderedGroups = groupOrder.filter((group) => groupsWithPhases.has(group));

  let nextStatus: ProjectStatus | null = null;
  for (const group of orderedGroups) {
    const groupPhases = phases.filter((phase) => phase.group === group);
    const allComplete = groupPhases.every((phase) => phase.status === PhaseStatus.COMPLETED);
    if (!allComplete) {
      nextStatus = group;
      break;
    }
  }

  if (!nextStatus) {
    nextStatus = "DELIVERED";
  }

  await prisma.project.update({
    where: { id: projectId },
    data: { status: nextStatus },
  });

  return nextStatus;
}

async function handleDeliveredProject(projectId: string) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      order: {
        select: {
          id: true,
          status: true,
          service: { select: { title: true } },
        },
      },
    },
  });

  if (!project) return;

  if (project.order?.id) {
    await prisma.order.updateMany({
      where: {
        id: project.order.id,
        status: { notIn: [OrderStatus.DELIVERED, OrderStatus.CANCELLED] },
      },
      data: { status: OrderStatus.DELIVERED },
    });
  }

  const existingPortfolio = await prisma.portfolioItem.findFirst({
    where: { projectId },
    select: { id: true },
  });

  if (existingPortfolio) return;

  const title = project.title?.trim() || "Project";
  const baseSlug = slugify(title);
  const slug = `${baseSlug}-${project.id}`;

  await prisma.portfolioItem.create({
    data: {
      projectId,
      title,
      slug,
      description: project.description ?? null,
      projectType: project.order?.service?.title ?? null,
      locale: "en",
      isPublished: false,
    },
  });
}

export async function PATCH(request: Request, { params }: RouteParams) {
  const { projectId, phaseId } = await params;
  const session = await getServerSession(authOptions);
  const isStaff = session?.user.role === "ADMIN" || session?.user.role === "PARTNER";
  if (!session || !isStaff) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as { status?: PhaseStatus };
  if (!body.status) {
    return NextResponse.json({ error: "Missing status" }, { status: 400 });
  }

  const phase = await prisma.projectPhase.findFirst({
    where: { id: phaseId, projectId },
  });
  if (!phase) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const updated = await prisma.projectPhase.update({
    where: { id: phaseId },
    data: { status: body.status },
  });

  await prisma.auditLog.create({
    data: {
      actorId: session.user.id,
      action: "PHASE_STATUS",
      targetType: "PROJECT",
      targetId: projectId,
      data: { phaseId, status: body.status },
    },
  });

  const nextStatus = await syncProjectStatus(projectId);
  if (nextStatus === "DELIVERED") {
    await handleDeliveredProject(projectId);
  }

  return NextResponse.json(updated);
}
