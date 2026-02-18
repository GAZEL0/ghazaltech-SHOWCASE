import { prisma } from "@/lib/db";
import { authOptions } from "@/lib/auth";
import { toNumber } from "@/lib/money";
import { RevisionStatus } from "@prisma/client";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { sendAdminNotification } from "@/lib/email";

export const dynamic = "force-dynamic";

function normalizeList(value: unknown) {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }
  if (typeof value === "string") {
    return value
      .split(/\n|,/)
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
}

function cleanText(value: unknown) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function serializeRevision(rev: {
  id: string;
  projectId: string;
  title: string;
  amount: unknown;
  status: RevisionStatus;
  details?: string | null;
  sessionAt?: Date | null;
  sessionDurationMinutes?: number | null;
  sessionNotes?: string | null;
  sessionLinks?: unknown;
  paymentProofUrl?: string | null;
  clientProposedAt?: Date | null;
  clientProposedDurationMinutes?: number | null;
  clientProposedNote?: string | null;
  completedAt?: Date | null;
  createdAt: Date;
  project?: { title: string };
}) {
  return {
    id: rev.id,
    projectId: rev.projectId,
    projectTitle: rev.project?.title,
    title: rev.title,
    amount: toNumber(rev.amount),
    status: rev.status,
    details: rev.details ?? null,
    sessionAt: rev.sessionAt,
    sessionDurationMinutes: rev.sessionDurationMinutes,
    sessionNotes: rev.sessionNotes ?? null,
    sessionLinks: (Array.isArray(rev.sessionLinks) ? rev.sessionLinks : []) as string[],
    paymentProofUrl: rev.paymentProofUrl ?? null,
    clientProposedAt: rev.clientProposedAt ?? null,
    clientProposedDurationMinutes: rev.clientProposedDurationMinutes ?? null,
    clientProposedNote: rev.clientProposedNote ?? null,
    completedAt: rev.completedAt ?? null,
    createdAt: rev.createdAt,
  };
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as {
    projectId?: string;
    title?: string;
    amount?: number;
    details?: string;
  };

  if (!body.projectId || !body.title) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const amount =
    typeof body.amount === "number" && !Number.isNaN(body.amount) ? body.amount : 0;
  if (amount < 0) {
    return NextResponse.json({ error: "Amount must be positive" }, { status: 400 });
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

  const revision = await prisma.paidRevisionRequest.create({
    data: {
      projectId: body.projectId,
      title: body.title,
      amount,
      details: body.details ?? "",
      status: RevisionStatus.PENDING,
    },
    include: { project: true },
  });

  await prisma.auditLog.create({
    data: {
      actorId: session.user.id,
      action: "CREATE_REVISION",
      targetType: "REVISION",
      targetId: revision.id,
      data: { title: revision.title },
    },
  });

  await sendAdminNotification({
    subject: "New paid revision request",
    text: [
      `Project: ${revision.project.title}`,
      `Title: ${revision.title}`,
      `Amount: ${toNumber(revision.amount)}`,
      `Requested by: ${session.user.email}`,
      `Revision ID: ${revision.id}`,
    ].join("\n"),
  });

  return NextResponse.json(serializeRevision(revision));
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const revisions = await prisma.paidRevisionRequest.findMany({
    where:
      session.user.role === "ADMIN" || session.user.role === "PARTNER"
        ? {}
        : {
            project: { order: { userId: session.user.id } },
          },
    include: { project: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(revisions.map((rev) => serializeRevision(rev)));
}

export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  const revision = await prisma.paidRevisionRequest.findUnique({
    where: { id },
    include: { project: { include: { order: true } } },
  });

  if (!revision) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const isStaff = session.user.role === "ADMIN" || session.user.role === "PARTNER";
  const isOwner = revision.project?.order?.userId === session.user.id;

  if (!isStaff && !isOwner) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = (await request.json()) as {
    status?: RevisionStatus;
    note?: string;
    sessionAt?: string | null;
    sessionDurationMinutes?: number | null;
    amount?: number | null;
    sessionNotes?: string | null;
    sessionLinks?: string[] | string | null;
    paymentProofUrl?: string | null;
    clientProposedAt?: string | null;
    clientProposedDurationMinutes?: number | null;
    clientProposedNote?: string | null;
    completedAt?: string | null;
    clearProposal?: boolean;
  };

  if (
    body.status === undefined &&
    body.sessionAt === undefined &&
    body.sessionDurationMinutes === undefined &&
    body.amount === undefined &&
    body.sessionNotes === undefined &&
    body.sessionLinks === undefined &&
    body.paymentProofUrl === undefined &&
    body.clientProposedAt === undefined &&
    body.clientProposedDurationMinutes === undefined &&
    body.clientProposedNote === undefined &&
    body.completedAt === undefined &&
    !body.clearProposal
  ) {
    return NextResponse.json({ error: "Missing update fields" }, { status: 400 });
  }

  const updates: Record<string, unknown> = {};

  if (isStaff) {
    if (body.status) {
      updates.status = body.status;
    }
    if (body.amount !== undefined && body.amount !== null && !Number.isNaN(body.amount)) {
      updates.amount = body.amount;
    }
    if (body.sessionAt !== undefined) {
      updates.sessionAt = body.sessionAt ? new Date(body.sessionAt) : null;
    }
    if (body.sessionDurationMinutes !== undefined) {
      updates.sessionDurationMinutes = body.sessionDurationMinutes;
    }
    if (body.sessionNotes !== undefined) {
      updates.sessionNotes = cleanText(body.sessionNotes);
    }
    if (body.sessionLinks !== undefined) {
      const links = normalizeList(body.sessionLinks);
      updates.sessionLinks = links.length > 0 ? links : [];
    }
    if (body.paymentProofUrl !== undefined) {
      updates.paymentProofUrl = cleanText(body.paymentProofUrl);
    }
    if (body.clientProposedAt !== undefined) {
      updates.clientProposedAt = body.clientProposedAt ? new Date(body.clientProposedAt) : null;
    }
    if (body.clientProposedDurationMinutes !== undefined) {
      updates.clientProposedDurationMinutes = body.clientProposedDurationMinutes;
    }
    if (body.clientProposedNote !== undefined) {
      updates.clientProposedNote = cleanText(body.clientProposedNote);
    }
    if (body.completedAt !== undefined) {
      updates.completedAt = body.completedAt ? new Date(body.completedAt) : null;
    }
    if (body.clearProposal) {
      updates.clientProposedAt = null;
      updates.clientProposedDurationMinutes = null;
      updates.clientProposedNote = null;
    }
    if (body.status === RevisionStatus.DELIVERED && !body.completedAt) {
      updates.completedAt = new Date();
    }
  } else {
    if (body.clientProposedAt !== undefined) {
      updates.clientProposedAt = body.clientProposedAt ? new Date(body.clientProposedAt) : null;
    }
    if (body.clientProposedDurationMinutes !== undefined) {
      updates.clientProposedDurationMinutes = body.clientProposedDurationMinutes;
    }
    if (body.clientProposedNote !== undefined) {
      updates.clientProposedNote = cleanText(body.clientProposedNote);
    }
    if (body.paymentProofUrl !== undefined) {
      updates.paymentProofUrl = cleanText(body.paymentProofUrl);
    }
  }

  const updated = await prisma.paidRevisionRequest.update({
    where: { id },
    data: updates,
    include: { project: true },
  });

  if (body.note && isStaff) {
    await prisma.auditLog.create({
      data: {
        actorId: session.user.id,
        action: "REVISION_REVIEW",
        targetType: "REVISION",
        targetId: id,
        data: { note: body.note, status: body.status, sessionAt: body.sessionAt ?? null },
      },
    });
  }

  return NextResponse.json(serializeRevision(updated));
}
