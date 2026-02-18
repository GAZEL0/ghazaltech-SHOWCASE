import { prisma } from "@/lib/db";
import { authOptions } from "@/lib/auth";
import { toNumber } from "@/lib/money";
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
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const changes = await prisma.changeRequest.findMany({
    where: { projectId },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(
    changes.map((change) => ({
      ...change,
      amount: toNumber(change.amount),
    })),
  );
}

export async function POST(request: Request, { params }: RouteParams) {
  const { projectId } = await params;
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const project = await ensureAccess(projectId, session);
  if (!project) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const isStaff = session.user.role === "ADMIN" || session.user.role === "PARTNER";

  const body = (await request.json()) as {
    title?: string;
    description?: string;
    amount?: number;
  };

  const title = body.title?.trim();
  const description = body.description?.trim() ?? "";
  if (!title) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }
  if (!isStaff && description.length === 0) {
    return NextResponse.json({ error: "Description is required" }, { status: 400 });
  }

  let amount = 0;
  if (isStaff) {
    if (typeof body.amount !== "number" || Number.isNaN(body.amount) || body.amount <= 0) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }
    amount = body.amount;
  }

  const created = await prisma.changeRequest.create({
    data: {
      projectId,
      title,
      description: description.length > 0 ? description : null,
      amount,
      createdById: session.user.id,
    },
  });

  return NextResponse.json({
    ...created,
    amount: toNumber(created.amount),
  });
}
