import { hashToken } from "@/lib/quote-tokens";
import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as { token?: string };
    const url = new URL(request.url);
    const token = body.token ?? url.searchParams.get("token");

    if (!token) {
      return NextResponse.json({ error: "Missing token", field: "token" }, { status: 400 });
    }

    const tokenHash = hashToken(token);
  const magicLogin = await prisma.auditLog.findFirst({
    where: {
      action: "MAGIC_LOGIN",
      data: {
        path: ["tokenHash"],
        equals: tokenHash,
        } as Prisma.JsonFilter,
      },
      orderBy: { createdAt: "desc" },
    });

    if (!magicLogin) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 });
    }

    const data = (magicLogin.data ?? {}) as {
      email?: string;
      userId?: string;
      expiresAt?: string;
      usedAt?: string;
      meta?: Record<string, unknown>;
    };

    let email = data.email;
    let hasPassword = false;
    if (!email && data.userId) {
      const user = await prisma.user.findUnique({ where: { id: data.userId } });
      if (user?.email) {
        email = user.email;
        hasPassword = !!user.passwordHash;
      }
    } else if (email) {
      const user = await prisma.user.findUnique({ where: { email } });
      hasPassword = !!user?.passwordHash;
    }

    if (data.usedAt) {
      return NextResponse.json({ error: "Token already used" }, { status: 400 });
    }
    if (data.expiresAt && new Date(data.expiresAt) <= new Date()) {
      return NextResponse.json({ error: "Token expired" }, { status: 400 });
    }

    return NextResponse.json({
      email,
      userId: data.userId,
      targetType: magicLogin.targetType,
      targetId: magicLogin.targetId,
      meta: data.meta ?? {},
      hasPassword,
    });
  } catch (error) {
    console.error("[magic-login-validate]", error);
    return NextResponse.json({ error: "Failed to validate token" }, { status: 500 });
  }
}
