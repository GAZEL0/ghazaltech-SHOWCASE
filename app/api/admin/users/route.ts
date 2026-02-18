import { prisma } from "@/lib/db";
import { authOptions } from "@/lib/auth";
import { Role } from "@prisma/client";
import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== Role.ADMIN) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: { orders: true },
  });

  return NextResponse.json(
    users.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      orders: user.orders.length,
      referralCommissionRate: user.referralCommissionRate,
      createdAt: user.createdAt,
    })),
  );
}

export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== Role.ADMIN) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as {
    id?: string;
    role?: Role;
    password?: string;
    referralCommissionRate?: number;
  };
  if (!body.id) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  if (body.role && body.id === session.user.id && body.role !== Role.ADMIN) {
    return NextResponse.json({ error: "You cannot change your own role" }, { status: 400 });
  }

  const data: Record<string, unknown> = {};
  if (body.role) {
    data.role = body.role;
  }
  if (body.password) {
    if (body.password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
    }
    data.passwordHash = await bcrypt.hash(body.password, 10);
  }
  if (typeof body.referralCommissionRate === "number") {
    if (body.referralCommissionRate < 0 || body.referralCommissionRate > 1) {
      return NextResponse.json({ error: "Commission rate must be between 0 and 1" }, { status: 400 });
    }
    data.referralCommissionRate = body.referralCommissionRate;
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "No updates provided" }, { status: 400 });
  }

  const updated = await prisma.user.update({
    where: { id: body.id },
    data,
  });

  return NextResponse.json({
    id: updated.id,
    name: updated.name,
    email: updated.email,
    phone: updated.phone,
    role: updated.role,
    referralCommissionRate: updated.referralCommissionRate,
    createdAt: updated.createdAt,
  });
}

export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== Role.ADMIN) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as { id?: string };
  if (!body.id) {
    return NextResponse.json({ error: "Missing user id" }, { status: 400 });
  }

  if (body.id === session.user.id) {
    return NextResponse.json({ error: "You cannot delete your own account" }, { status: 400 });
  }

  try {
    await prisma.user.delete({ where: { id: body.id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Could not delete user. Make sure the user has no linked orders or data." },
      { status: 400 },
    );
  }
}
