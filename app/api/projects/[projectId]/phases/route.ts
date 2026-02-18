import { prisma } from "@/lib/db";
import { authOptions } from "@/lib/auth";
import { ProjectStatus } from "@prisma/client";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type RouteParams = {
  params: Promise<{ projectId: string }>;
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

export async function GET(_request: Request, { params }: RouteParams) {
  const { projectId } = await params;
  const session = await getServerSession(authOptions);
  const project = await ensureAccess(projectId, session);
  if (!project) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const phases = await prisma.projectPhase.findMany({
    where: { projectId },
    orderBy: { order: "asc" },
    include: {
      deliverables: true,
      comments: { orderBy: { createdAt: "asc" }, include: { author: true, attachments: true } },
    },
  });

  return NextResponse.json(phases);
}

export async function POST(request: Request, { params }: RouteParams) {
  const { projectId } = await params;
  const session = await getServerSession(authOptions);
  const isStaff = session?.user.role === "ADMIN" || session?.user.role === "PARTNER";
  if (!session || !isStaff) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as {
    group?: ProjectStatus;
    title?: string;
    description?: string;
    dueDate?: string | null;
    order?: number;
  };

  if (!body.title || !body.group) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const created = await prisma.projectPhase.create({
    data: {
      projectId,
      group: body.group,
      title: body.title,
      description: body.description ?? null,
      dueDate: body.dueDate ? new Date(body.dueDate) : null,
      order: typeof body.order === "number" ? body.order : 0,
    },
  });

  return NextResponse.json(created);
}
