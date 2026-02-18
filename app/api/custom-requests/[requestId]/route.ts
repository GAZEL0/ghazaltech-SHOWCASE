import { prisma } from "@/lib/db";
import { authOptions } from "@/lib/auth";
import { CustomRequestStatus } from "@prisma/client";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type RouteParams = {
  params: Promise<{ requestId: string }>;
};

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { requestId } = await params;
  const session = await getServerSession(authOptions);
  const isStaff = session?.user.role === "ADMIN" || session?.user.role === "PARTNER";
  if (!session || !isStaff) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const request = await prisma.customProjectRequest.findUnique({
    where: { id: requestId },
    include: { user: true, order: true },
  });

  if (!request) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(request);
}

export async function PATCH(request: Request, { params }: RouteParams) {
  const { requestId } = await params;
  const session = await getServerSession(authOptions);
  const isStaff = session?.user.role === "ADMIN" || session?.user.role === "PARTNER";
  if (!session || !isStaff) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as {
    status?: CustomRequestStatus;
    orderId?: string | null;
    note?: string | null;
  };

  const data: Record<string, unknown> = {};
  if (body.status) data.status = body.status;
  if (body.orderId !== undefined) data.orderId = body.orderId;

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  }

  if (body.orderId) {
    const order = await prisma.order.findUnique({ where: { id: body.orderId } });
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 400 });
    }
  }

  const updated = await prisma.customProjectRequest.update({
    where: { id: requestId },
    data,
  });

  await prisma.auditLog.create({
    data: {
      actorId: session.user.id,
      action: "CUSTOM_REQUEST_UPDATE",
      targetType: "CUSTOM_PROJECT_REQUEST",
      targetId: requestId,
      data: { ...data, note: body.note },
    },
  });

  return NextResponse.json(updated);
}
